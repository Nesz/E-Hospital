import { BehaviorSubject, forkJoin, fromEvent, Subscription } from "rxjs";
import {
  AfterViewInit,
  Component, ComponentFactoryResolver, ComponentRef,
  ElementRef,
  NgZone, OnDestroy,
  OnInit,
  ViewChild,
  ViewContainerRef
} from "@angular/core";
import { ProgressRingComponent } from "../progress-ring/progress-ring.component";
import { generateTextures, isInsideBoundsBBox } from "../../helpers/canvas.helper";
import { debounceTime, delay, mergeMap, tap } from "rxjs/operators";
import { ShaderService } from "../../services/shader.service";
import { ApiService } from "../../services/api.service";
import { DicomConstants } from "../../dicom.constants";
import { UntilDestroy } from "@ngneat/until-destroy";
import { ActivatedRoute } from "@angular/router";
import { Camera } from "../../model/camera";
import { Dicom } from "../../model/dicom";
import * as GLM from "gl-matrix";
import { Tag } from "../../tag";
import { Orientations } from "../../model/orientations.model";
import { Progress } from "../../model/progress";
import { CanvasPartComponent } from "../canvas-part/canvas-part.component";
import { Program } from "../../model/program";
import { vec4 } from "gl-matrix";
import { Shape, Tool } from "../../model/interfaces";

export interface CanvasDrawingArea {
  camera: Camera;
  currentSlice: number;
  orientation: 'x' | 'y' | 'z';
  windowing: {
    wc: number;
    ww: number;
    min: number;
    max: number;
  };
}

@UntilDestroy({ arrayName: 'subscriptions' })
@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
})
export class EditorComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild('container', { read: ViewContainerRef }) container!: ViewContainerRef;
  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('progressIndicator') progressIndicator!: ProgressRingComponent;
  @ViewChild('sidebar') sidebar!: ElementRef<HTMLDivElement>;
  @ViewChild('parent') parent!: ElementRef<HTMLSpanElement>;

  seriesId!: number;
  sidebarActive = true;

  shapes: Shape[] = [];

  canvases: ComponentRef<CanvasPartComponent>[] = [];

  context!: WebGL2RenderingContext;

  dicom!: Dicom;
  tools: Tool[] = DicomConstants.TOOLS;
  subscriptions: Subscription[] = [];

  tool = this.tools[0];

  slope = 0;
  intercept = 0;

  canvasResolution$ = new BehaviorSubject<{
    width: number;
    height: number;
  }>({ width: 0, height: 0 });


  orientation = Orientations.DEFAULT();

  private positionBuffer!: WebGLBuffer;
  private texCoordBuffer!: WebGLBuffer;
  private texCoordLocation!: number;
  private positionLocation!: number;

  private programs: { [key: string]: Program } = {};

  progress = new Progress(1, 0);

  constructor(
    private readonly resolver: ComponentFactoryResolver,
    private readonly shaderService: ShaderService,
    private readonly route: ActivatedRoute,
    private readonly api: ApiService,
    private readonly zone: NgZone
  ) {}


  onShapeFinish(shape: Shape) {
    const routeParams = this.route.snapshot.paramMap;
    this.api.addArea(routeParams.get('seriesId')!, shape).subscribe(x => {
      console.log(x)
    })
  }

  ngOnDestroy() {
    this.canvases.forEach(x => x.destroy())
  }

  ngOnInit() {
    const routeParams = this.route.snapshot.paramMap;
    this.seriesId = Number(routeParams.get('seriesId')!);
    const args = {
      patientId: routeParams.get('patientId')!,
      seriesId: routeParams.get('seriesId')!,
    };

    this.api
      .getSeriesMetadata(args)
      .pipe(mergeMap((series) => {
        this.progress.full = series.instances.length + 1;
        console.log(series)

        const $frames = series.instances.map(instance =>
          this.api.getInstanceStream(instance.id)
            .pipe(tap(() => this.progress.increment())));

        return forkJoin([
          this.api.getInstanceMeta(series.instances[0].id),
          this.api.getAreas(args.seriesId),
          ...$frames,
        ]);
      }))
      .pipe(tap(() => this.progressIndicator.label = 'Generating textures'), delay(300))
      .subscribe((response) => {
        const meta = response.shift() as Dicom;
        console.log(meta)
        this.shapes = response.shift() as Shape[];
        console.log(meta)
        const frames = response as ArrayBuffer[];

        const width = meta.asNumber(Tag.WIDTH);
        const height = meta.asNumber(Tag.HEIGHT);
        const bitsPerPixel = meta.asNumber(Tag.BITS_PER_PIXEL);
        const sliceThickness = meta.asNumber(Tag.SLICE_THICKNESS);
        const pixelRepresentation = meta.asNumber(Tag.PIXEL_REPRESENTATION);
        console.log(width)
        console.log(height)

        this.setup(meta);

        console.log(this.context)
        this.orientation = generateTextures({
          gl: this.context,
          buffers: frames,
          width: width,
          height: height,
          sliceThickness: sliceThickness,
          bitsPerPixel: bitsPerPixel,
          pixelRepresentation: pixelRepresentation,
        });

        this.progress.increment();

        this.initShaders().subscribe(() => {
          this.canvases.push(this.createCanvasPart());
        });
      });
  }

  ngAfterViewInit() {
    const observer = new ResizeObserver((entries) => {
      this.zone.run(() => {
        this.canvasResolution$.next({
          width: entries[0].contentRect.width,
          height: entries[0].contentRect.height,
        });
      });
    });

    observer.observe(this.parent.nativeElement);

    this.subscriptions.push(
      fromEvent<MouseEvent>(window, 'mousedown').subscribe((event) => this.onMouseDown(event)),
      fromEvent<MouseEvent>(window, 'mousemove').subscribe((event) => this.onMouseMove(event)),
      fromEvent<MouseEvent>(window, 'mouseup').subscribe((event) => this.onMouseUp(event)),
      fromEvent<WheelEvent>(window, 'wheel').subscribe((event) => this.onWheel(event)),
      this.canvasResolution$.pipe(debounceTime(100)).subscribe((_) => this.onResize())
    );
  }

  initBuffers = () => {
    const gl = this.context;
    this.positionBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 0.0, 0.0]),
      gl.STATIC_DRAW
    );

    this.texCoordBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 0.0, 0.0]),
      gl.STATIC_DRAW
    );
  };

  getOrientationSlices = (orientation: string) => {
    if (orientation === 'x') return this.orientation.x;
    if (orientation === 'y') return this.orientation.y;
    if (orientation === 'z') return this.orientation.z;
    throw 'Unknown orientation';
  };

  getCanvasPartFromMousePosition(x: number, y: number) {
    return this.canvases.find(canvas => {
      const bbox = canvas.instance.canvas.nativeElement?.getBoundingClientRect();
      return bbox && isInsideBoundsBBox(x, y, bbox);
    });
  }

  getCanvasSliceBBox = (canvas: DOMRect, slice: DOMRect) => {
    // webgl bb starts from down-left corner
    return {
      x: slice.left - canvas.left,
      y: canvas.bottom - slice.bottom,
      width: slice.width,
      height: slice.height,
    }
  }

  render = (canvasPart: CanvasPartComponent) => {
    const gl = this.context;
    const canvasSlice = canvasPart.canvasPart;
    const canvas = this.canvas.nativeElement.getBoundingClientRect();
    const slice = canvasPart.canvas.nativeElement.getBoundingClientRect();
    const { width, height, x, y } = this.getCanvasSliceBBox(canvas, slice);

    const orientation = this.getOrientationSlices(canvasSlice.orientation);
    const texture = orientation.slices[canvasSlice.currentSlice];
    const camera = canvasSlice.camera;

    camera.updateViewProjection(width, height);

    gl.enable(gl.SCISSOR_TEST);
    gl.viewport(x, y, width, height);
    gl.scissor(x, y, width, height);
    gl.clearColor(0, 0, 0, 1);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(this.programs['default'].gl);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
    gl.vertexAttribPointer(this.texCoordLocation, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.vertexAttribPointer(this.positionLocation, 2, gl.FLOAT, false, 0, 0);

    const uniforms = {
      u_matrix: camera.viewProjectionMat,
      wc: canvasSlice.windowing.wc,
      ww: canvasSlice.windowing.ww,
      slope: this.slope,
      intercept:this.intercept,
    };

    this.programs['default'].assignUniforms(gl, uniforms);

    this.updateRectangle(orientation.width, orientation.height);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    gl.useProgram(this.programs['shape'].gl);

    this.shapes
      .filter(shape => shape.orientation === canvasSlice.orientation)
      .filter(shape => shape.slice === canvasSlice.currentSlice)
      .filter(shape => shape.isVisible)
      .forEach(shape => {
        const vertex_buffer = gl.createBuffer()!;
        gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(shape.vertices), gl.STATIC_DRAW);

        // Get the attribute location
        const coord = gl.getAttribLocation(this.programs['shape'].gl, 'a_position');
        gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
        gl.vertexAttribPointer(coord, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(coord);

        this.programs['shape'].assignUniforms(gl, {
          u_matrix: camera.viewProjectionMat,
          u_color: vec4.fromValues(1.0, 0.0, 0.0, 1.0),
        });

        gl.drawArrays(gl.LINE_LOOP, 0, shape.vertices.length / 2);
      })
  };

  getClipSpaceMousePosition = (clientX: number, clientY: number, rect: DOMRect) => {
    // get canvas relative css position
    const cssX = clientX - rect.left;
    const cssY = clientY - rect.top;

    // get normalized 0 to 1 position across and down canvas
    const normalizedX = cssX / rect.width;
    const normalizedY = cssY / rect.height;

    // convert to clip space
    const clipX = normalizedX * 2 - 1;
    const clipY = normalizedY * -2 + 1;

    return [clipX, clipY];
  };

  getClipSpaceMousePositionVec2 = (clientX: number, clientY: number, rect: DOMRect) => {
    const [x, y] = this.getClipSpaceMousePosition(clientX, clientY, rect);
    return GLM.vec2.fromValues(x, y);
  };

  updateRectangle = (width: number, height: number) => {
    const gl = this.context;
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([width, height, 0, height, width, 0, 0, 0]),
      gl.STATIC_DRAW
    );
  };

  private setup = (dicom: Dicom) => {
    this.dicom = dicom;
    this.slope = dicom.asNumber(Tag.SLOPE);
    this.intercept = dicom.asNumber(Tag.INTERCEPT);

    this.context = this.canvas.nativeElement.getContext('webgl2', {
      desynchronized: true,
      preserveDrawingBuffer: true
    })!;

    this.context.canvas.width = this.parent.nativeElement.clientWidth;
    this.context.canvas.height = this.parent.nativeElement.clientHeight;

    this.initBuffers();
  };

  private createCanvasPart = () => {
    const canvasDrawingArea: CanvasDrawingArea = {
      camera: new Camera(),
      currentSlice: 0,
      orientation: 'z',
      windowing: this.getDefaultWindowing(),
    };

    const factory = this.resolver.resolveComponentFactory(CanvasPartComponent);
    let component = this.container.createComponent(factory);

    component.instance.editor = this;
    component.instance.canvasPart = canvasDrawingArea;
    component.instance.slices = this.getOrientationSlices(canvasDrawingArea.orientation)

    component.instance.onAxisChange.subscribe(x => this.render(x));
    component.instance.onSliceChange.subscribe(x => this.render(x));
    component.instance.onResize
      .pipe(debounceTime(100))
      .subscribe(x => this.onResize())

    component.instance.whenDestroyed = () => this.onResize();

    return component;
  }

  private initShaders = () => {
    const gl = this.context;
    const bpp = this.dicom.asNumber(Tag.BITS_PER_PIXEL);
    const pixels = this.dicom.asNumber(Tag.PIXEL_REPRESENTATION);
    const [frag, vert] = this.shaderService.matchShadersFor(pixels, bpp);

    const $mainProgram = this.shaderService.createProgramFromAssets(this.context, vert, frag);
    const $shapeProgram = this.shaderService.createProgramFromAssets(
      this.context,
      'shaders/sh/shader_shape_vert.glsl',
      'shaders/sh/shader_shape_frag.glsl'
    );

    return forkJoin([$mainProgram, $shapeProgram])
      .pipe(tap(([mainProgram, shapeProgram]) => {
        this.programs['default'] = new Program(mainProgram[0], mainProgram[1]);
        this.programs['shape'] = new Program(shapeProgram[0], shapeProgram[1]);

        this.texCoordLocation = gl.getAttribLocation(this.programs['default'].gl, 'a_texCoord');
        this.positionLocation = gl.getAttribLocation(this.programs['default'].gl, 'a_position');
        gl.enableVertexAttribArray(this.texCoordLocation);
        gl.enableVertexAttribArray(this.positionLocation);
      })
    );
  };

  private getDefaultWindowing = () => {
    const dicom = this.dicom;
    if (dicom.hasTag(Tag.WINDOW_CENTER) && dicom.hasTag(Tag.WINDOW_WIDTH)) {
      let wc = dicom.getValue(Tag.WINDOW_CENTER, true).value;
      let ww = dicom.getValue(Tag.WINDOW_CENTER, true).value;
      if (wc.constructor.name == 'Array') wc = wc[0];
      if (ww.constructor.name == 'Array') ww = ww[0];
      return {
        wc: Number(wc),
        ww: Number(ww),
        min: 0,
        max: 0,
      };
    } else {
      return {
        wc: 0,
        ww: 0,
        min: 0,
        max: 0
      }
    }
  };

  changeTool = (tool: Tool) => {
    this.tool = tool;
  };

  private onResize = () => {
    if (this.context) {
      this.context.canvas.width = this.parent.nativeElement.clientWidth;
      this.context.canvas.height = this.parent.nativeElement.clientHeight;
      this.canvases.forEach(x => {
        if (x.instance.isRendered) {
          x.instance.resetPosition();
          this.render(x.instance);
        }
      })
    }
  };

  private onWheel = (event: WheelEvent) =>
    this.tool.onScroll(event, this);

  private onMouseUp = (event: MouseEvent) =>
    this.tool.onMouseUp(event, this);

  private onMouseDown = (event: MouseEvent) =>
    this.tool.onMouseDown(event, this);

  private onMouseMove = (event: MouseEvent) =>
    this.tool.onMouseMove(event, this);

  grid(count: number) {
    if (this.canvases.length < count) {
      const diff = count - this.canvases.length;
      for (let i = 1; i <= diff; ++i) {
        this.canvases.push(this.createCanvasPart());
      }
    } else {
      for (let i = this.canvases.length - 1; i >= count; --i) {
        //todo unsubscribe
        const last = this.canvases.pop();
        last?.destroy();
      }
    }
  }

  enabled = false;
  currentHover = -1;
  hover(number: number) {
    this.currentHover = number;
  }

  goToArea(shape: Shape) {
    for (let canvas of this.canvases) {
      if (canvas.instance.canvasPart.orientation === shape.orientation) {
        canvas.instance.canvasPart.currentSlice = shape.slice;
        this.render(canvas.instance);
        return;
      }
    }
    this.canvases[0].instance.canvasPart.orientation = shape.orientation;
    this.canvases[0].instance.canvasPart.currentSlice = shape.slice;
    this.render(this.canvases[0].instance);
  }

  export() {
    const img = this.canvas.nativeElement.toDataURL('image/png')
    this.saveImage(img, "a.png");
  }

  private saveImage(imagePath: string, imageName: string ){
    const link = document.createElement('a');
    link.style.display = 'none';
    document.body.appendChild(link)
    link.setAttribute('download', imageName + '.png');
    link.setAttribute('href', imagePath.replace("image/png", "image/octet-stream"));
    link.click();
    link.remove();
  }
}
