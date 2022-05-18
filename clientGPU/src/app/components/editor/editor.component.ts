import { BehaviorSubject, forkJoin, fromEvent, Observable, Subscription } from "rxjs";
import {
  AfterViewInit,
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  ElementRef,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewContainerRef
} from "@angular/core";
import { ProgressRingComponent } from "../progress-ring/progress-ring.component";
import {
  generate3DTexture,
  getAngle, getAreaMM,
  getDistanceMM,
  isInsideBoundsBBox,
  loadLUT, toRectangle
} from "../../helpers/canvas.helper";
import { debounceTime, map, tap } from "rxjs/operators";
import { ShaderService } from "../../services/shader.service";
import { ApiService } from "../../services/api.service";
import { ActivatedRoute } from "@angular/router";
import { Camera } from "../../model/camera";
import { Dicom } from "../../model/dicom";
import * as GLM from "gl-matrix";
import { Tag } from "../../tag";
import { CanvasPartComponent } from "../canvas-part/canvas-part.component";
import { Shader } from "../../model/shader";
import {
  LookupTable,
  LookupTablesData,
  MeasurementType,
  Orientation,
  Measurement,
  Tool,
  Windowing
} from "../../model/interfaces";
import { HttpClient } from "@angular/common/http";
import { vec2 } from "gl-matrix";
import { Download } from "../../model/download";
import { CursorTool } from "../../model/impl/cursor.tool";
import { PanTool } from "../../model/impl/pan.tool";
import { ZoomTool } from "../../model/impl/zoom.tool";
import { RotateTool } from "../../model/impl/rotate.tool";
import { WindowLevelTool } from "../../model/impl/window-level.tool";
import { ArbitraryAreaTool } from "../../model/impl/arbitrary-area.tool";
import { RectangularArea } from "../../model/impl/reactangular-area.tool";
import { DistanceTool } from "../../model/impl/distance.tool";
import { AngleTool } from "../../model/impl/angle.tool";

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

  shapes: Measurement[] = [];

  canvases: ComponentRef<CanvasPartComponent>[] = [];

  context!: WebGL2RenderingContext;

  dicom!: Dicom;
  tools: Tool[] = [
    new CursorTool('cursor', 'Cursor', this),
    new PanTool('move', 'Pan', this),
    new ZoomTool('zoom', 'Zoom', this),
    new RotateTool('rotate', 'Rotate', this),
    new WindowLevelTool('contrast', 'Window level', this),
    new ArbitraryAreaTool('arbitrary', 'Arbitrary area', this),
    new RectangularArea('select', 'Rectangular area', this),
    new DistanceTool('ruler', 'Distance', this),
    new AngleTool('angle', 'Angle', this),
  ];
  subs: Subscription = new Subscription();

  tool = this.tools[0];

  canvasResolution$ = new BehaviorSubject<{ width: number; height: number; }>({ width: 0, height: 0 });

  public props!: {
    pixelSpacing: number[],
    sliceCount: number,
    width: number,
    height: number,
    sliceThickness: number,
    slope: number,
    intercept: number,
    texture3d: WebGLTexture;
  };

  private positionBuffer!: WebGLBuffer;
  private texCoordBuffer!: WebGLBuffer;
  private texCoordLocation!: number;
  private positionLocation!: number;

  private programs: { [key: string]: Shader } = {};
  public lookupTables!: LookupTable[];
  // progress = new Progress(1, 0);
  download$!: Observable<Download>
  download?: Download

  constructor(
    private readonly httpClient: HttpClient,
    private readonly resolver: ComponentFactoryResolver,
    private readonly shaderService: ShaderService,
    private readonly route: ActivatedRoute,
    private readonly api: ApiService,
    private readonly zone: NgZone
  ) {}

  public slicesCountForOrientation(orientation: Orientation): number {
    switch (orientation) {
      case Orientation.TOP:
      case Orientation.BOTTOM:
        return this.props.sliceCount;
      default:
        return this.props.width;
    }
  }

  public getDimensionsForOrientation(orientation: Orientation): { width: number, height: number } {
    switch (orientation) {
      case Orientation.TOP:
      case Orientation.BOTTOM:
        return { width: this.props.width, height: this.props.height };
      default:
        return { width: this.props.width, height: this.props.sliceCount };
    }
  }

  public onShapeFinish(shape: Measurement) {

    // const context2D = this.canvas.nativeElement.getContext('2d')!;
    // context2D.lineWidth = 3;
    // context2D.strokeStyle = 'yellow';
    // context2D.fillStyle = 'white';
    // context2D.beginPath();
    // context2D.moveTo(shape.vertices[0], shape.vertices[1]);
    // context2D.lineTo(shape.vertices[2], shape.vertices[3]);
    // context2D.stroke();

    const routeParams = this.route.snapshot.paramMap;
    this.api.addArea(routeParams.get('seriesId')!, shape).subscribe(x => {
      console.log(x)
    })
  }

  public ngOnDestroy() {
    this.canvases.forEach(x => x.destroy())
    this.subs.unsubscribe();
  }

  public ngOnInit() {
    const routeParams = this.route.snapshot.paramMap;
    this.seriesId = Number(routeParams.get('seriesId')!);
    const args = {
      patientId: routeParams.get('patientId')!,
      seriesId: routeParams.get('seriesId')!,
    };

    this.download$ = this.api.get3DTexture(args.seriesId);
    forkJoin([
      this.api.getInstanceMetaForSeries(args.seriesId),
      this.api.getSeriesMetadata(args),
      this.api.getAreas(args.seriesId),
      this.download$.pipe(map(x => this.download = x)),
    ])
    .pipe(tap(() => this.progressIndicator.label = 'Generating textures'))
    .subscribe(([dicom, series, shapes, stream]) => {
      this.dicom = dicom;
      this.shapes = shapes;
      const buffer = stream.content!;

      const width = dicom.asNumber(Tag.WIDTH);
      const height = dicom.asNumber(Tag.HEIGHT);
      const slope = dicom.asNumber(Tag.SLOPE);
      const intercept = dicom.asNumber(Tag.INTERCEPT);
      const bitsPerPixel = dicom.asNumber(Tag.BITS_PER_PIXEL);
      const sliceThickness = dicom.asNumber(Tag.SLICE_THICKNESS);
      const pixelRepresentation = dicom.asNumber(Tag.PIXEL_REPRESENTATION);

      this.setupContext();
      this.initBuffers();

      console.log(dicom)
      console.log(dicom.asNumber(Tag.PIXEL_SPACING))
      this.props = {
        sliceCount: series.instances.length,
        width: width,
        height: height,
        sliceThickness: sliceThickness,
        slope: slope,
        intercept: intercept,
        pixelSpacing: dicom.asList<number>(Tag.PIXEL_SPACING),
        texture3d: generate3DTexture({
          gl: this.context,
          buffer: buffer,
          width: width,
          height: height,
          depth: series.instances.length,
          sliceThickness: sliceThickness,
          bitsPerPixel: bitsPerPixel,
          pixelRepresentation: pixelRepresentation,
        })!
      }

      forkJoin([this.loadLUTs(), this.initShaders()])
        .subscribe(() => this.canvases.push(this.createCanvasPart()))
    });
  }

  public ngAfterViewInit() {
    const observer = new ResizeObserver((entries) => {
      this.zone.run(() => {
        this.canvasResolution$.next({
          width: entries[0].contentRect.width,
          height: entries[0].contentRect.height,
        });
      });
    });

    observer.observe(this.parent.nativeElement);

    this.subs
      .add(fromEvent<MouseEvent>(window, 'mousedown').subscribe((event) => this.tool.onMouseDown(event)))
      .add(fromEvent<MouseEvent>(window, 'mousemove').subscribe((event) => this.tool.onMouseMove(event)))
      .add(fromEvent<MouseEvent>(window, 'mouseup').subscribe((event) => this.tool.onMouseUp(event)))
      .add(fromEvent<WheelEvent>(window, 'wheel').subscribe((event) => this.tool.onScroll(event)))
      .add(this.canvasResolution$.pipe(debounceTime(100)).subscribe((_) => this.onResize()));
  }

  private initBuffers() {
    const gl = this.context;
    this.positionBuffer = gl.createBuffer()!;
    this.texCoordBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 0.0, 0.0]), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 0.0, 0.0]), gl.STATIC_DRAW);
  };

  public getCanvasPartFromMousePosition(x: number, y: number) {
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

  public oti(o: Orientation) {
    switch (o) {
      case Orientation.TOP: return 0;
      case Orientation.LEFT: return 1;
      case Orientation.RIGHT: return 2;
      case Orientation.BOTTOM: return 3;
      case Orientation.FRONT: return 4;
      case Orientation.BACK: return 5;
    }
  }

  public render(canvasPart: CanvasPartComponent) {
    const gl = this.context;
    const canvas = this.canvas.nativeElement.getBoundingClientRect();
    const slice = canvasPart.canvas.nativeElement.getBoundingClientRect();
    const { width, height, x, y } = this.getCanvasSliceBBox(canvas, slice);

    const texture = this.props.texture3d;
    const camera = canvasPart.camera;
    const shader = this.programs['default'];

    camera.updateViewProjection(width, height);

    gl.enable(gl.SCISSOR_TEST);
    gl.viewport(x, y, width, height);
    gl.scissor(x, y, width, height);
    gl.clearColor(0, 0, 0, 1);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(shader.program);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
    gl.vertexAttribPointer(this.texCoordLocation, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.vertexAttribPointer(this.positionLocation, 2, gl.FLOAT, false, 0, 0);

    const uniforms = {
      u_matrix: camera.viewProjectionMat,
      u_wc: canvasPart.windowing.wc,
      u_ww: canvasPart.windowing.ww,
      u_slope: this.props.slope,
      u_intercept: this.props.intercept,
      u_currentSlice: canvasPart.currentSlice,
      u_orientation: this.oti(canvasPart.orientation),
      u_maxSlice: this.slicesCountForOrientation(canvasPart.orientation),
      u_image: 0,
      u_lut: 1
    };

    shader.assignUniforms(gl, uniforms);

    const dimensions = this.getDimensionsForOrientation(canvasPart.orientation);
    this.updateRectangle(dimensions.width, dimensions.height);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_3D, texture);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, canvasPart.lut.texture);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    gl.useProgram(this.programs['shape'].program);
    this.renderMeasurements(canvasPart);
  };

  renderMeasurements(canvasPart: CanvasPartComponent) {
    const bbox = canvasPart.canvas?.nativeElement.getBoundingClientRect()!;
    const ctx = canvasPart.canvas2d.nativeElement.getContext('2d')!;
    ctx.clearRect(0, 0, bbox.width, bbox.height)
    this.shapes
      .filter(shape => shape.orientation === canvasPart.orientation)
      .filter(shape => shape.slice === canvasPart.currentSlice)
      .filter(shape => shape.isVisible)
      .forEach(shape => this.renderMeasurement(shape, canvasPart))
  }

  public renderMeasurement(shape: Measurement, canvasPart: CanvasPartComponent) {
    const spacing = this.props.pixelSpacing;
    const ctx = canvasPart.canvas2d.nativeElement.getContext('2d')!;
    ctx.font = 'bold 15px Arial';
    ctx.fillStyle = '#ffe749';
    ctx.strokeStyle = '#ffe749';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 3])

    if (MeasurementType.DISTANCE === shape.type) {
      const vertices = this.getTransformedVertices(shape, canvasPart);

      const mm = getDistanceMM(spacing, shape.vertices[0], shape.vertices[1]).toFixed(2);
      ctx.fillTextVec(`${mm} mm`, vertices[0]);
      ctx.beginPath()
      ctx.moveToVec(vertices[0]);
      ctx.lineToVec(vertices[1]);
      ctx.stroke();
      ctx.closePath();
      return
    }

    if (MeasurementType.RECTANGLE === shape.type) {
      const vertices = this.getTransformedVertices(shape, canvasPart);

      const mm = getAreaMM(spacing, shape.vertices[3], shape.vertices[1]).toFixed(2);

      ctx.fillTextVec(`Area: ${mm} mm`, vertices[0]);

      ctx.beginPath()

      ctx.moveToVec(vertices[0]);
      ctx.lineToVec(vertices[1]);

      ctx.moveToVec(vertices[1]);
      ctx.lineToVec(vertices[2]);

      ctx.moveToVec(vertices[2]);
      ctx.lineToVec(vertices[3]);

      ctx.moveToVec(vertices[3]);
      ctx.lineToVec(vertices[0]);

      ctx.stroke();
      ctx.closePath();

      return
    }

    if (MeasurementType.ANGLE === shape.type) {
      const vertices = this.getTransformedVertices(shape, canvasPart);

      ctx.beginPath()
      for (let i = 0; i < vertices.length - 1; i++) {
        ctx.moveToVec(vertices[i + 0]);
        ctx.lineToVec(vertices[i + 1]);
      }
      ctx.stroke();
      ctx.closePath();

      if (shape.vertices.length === 3) {
        const [a1, a2, angle] = getAngle(vertices[0], vertices[1], vertices[2]);
        ctx.fillTextVec(`${angle.toFixed(2)}°`, vertices[0]);
        ctx.beginPath();
        ctx.moveToVec(vertices[1]);
        ctx.arcVec(vertices[1], 20, a1, a2);
        ctx.closePath();
        ctx.setLineDash([])
        ctx.stroke();
      }
    }
  }

  public getTransformedVertices(shape: Measurement, canvasPart: CanvasPartComponent): vec2[] {
    return shape.vertices.map(p => this.transformPoint(canvasPart, p));
  }

  public transformPoint(canvasPart: CanvasPartComponent, point: vec2): vec2 {
    const bbox = canvasPart.canvas?.nativeElement.getBoundingClientRect()!;
    const transformed = vec2.create();
    vec2.transformMat3(transformed, point, canvasPart.camera.viewProjectionMat);
    transformed[0] = ((transformed[0] + 1) / 2) * bbox.width;
    transformed[1] = ((transformed[1] - 1) / -2) * bbox.height;
    return transformed;
  }

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

  private setupContext(): void {
    this.context = this.canvas.nativeElement.getContext('webgl2', {
      desynchronized: true,
      preserveDrawingBuffer: true
    })!;

    this.context.canvas.width = this.parent.nativeElement.clientWidth;
    this.context.canvas.height = this.parent.nativeElement.clientHeight;
  };

  private createCanvasPart() {
    const factory = this.resolver.resolveComponentFactory(CanvasPartComponent);
    let component = this.container.createComponent(factory);

    component.instance.editor = this;
    component.instance.lut = this.lookupTables[0];
    component.instance.camera = new Camera();
    component.instance.currentSlice = 0;
    component.instance.orientation = Orientation.BOTTOM;
    component.instance.windowing = this.getDefaultWindowing();
    component.instance.onChanges.subscribe(x => this.render(x));
    component.instance.onResize
      .pipe(debounceTime(100))
      .subscribe(_ => this.onResize())

    component.instance.whenDestroyed = () => this.onResize();

    return component;
  }


  private loadLUTs(): Observable<void> {
    return this.httpClient.get<LookupTablesData>('assets/luts/luts.json')
      .pipe(map(data => {
        this.lookupTables = data.map(lut => {
          return {
            name: lut.name,
            texture: loadLUT(this.context, lut)
          }
        })
    }))
  }

  private initShaders(): Observable<any> {
    const gl = this.context;
    const bpp = this.dicom.asNumber(Tag.BITS_PER_PIXEL);
    const pixels = this.dicom.asNumber(Tag.PIXEL_REPRESENTATION);
    const [frag, vert] = this.shaderService.matchShadersFor(pixels, bpp);

    const $mainProgram = this.shaderService.createProgramFromAssets(this.context, vert, frag);
    const $shapeProgram = this.shaderService.createProgramFromAssets(
      this.context, 'shaders/shader_shape_vert.glsl', 'shaders/shader_shape_frag.glsl');

    return forkJoin([$mainProgram, $shapeProgram])
      .pipe(tap(([mainProgram, shapeProgram]) => {
        this.programs['default'] = new Shader(mainProgram[0], mainProgram[1]);
        this.programs['shape'] = new Shader(shapeProgram[0], shapeProgram[1]);

        this.texCoordLocation = gl.getAttribLocation(this.programs['default'].program, 'a_texCoord');
        this.positionLocation = gl.getAttribLocation(this.programs['default'].program, 'a_position');
        gl.enableVertexAttribArray(this.texCoordLocation);
        gl.enableVertexAttribArray(this.positionLocation);
      })
    );
  };

  private getDefaultWindowing(): Windowing {
    const dicom = this.dicom;
    if (dicom.hasTag(Tag.WINDOW_CENTER) && dicom.hasTag(Tag.WINDOW_WIDTH)) {
      let wc = dicom.getValue(Tag.WINDOW_CENTER, true).value;
      let ww = dicom.getValue(Tag.WINDOW_WIDTH, true).value;
      if (wc.constructor.name == 'Array') wc = wc[0];
      if (ww.constructor.name == 'Array') ww = ww[0];
      return {
        wc: Number(wc),
        ww: Number(ww),
      };
    } else {
      return {
        wc: 0,
        ww: 0,
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

  public export() {
    const img = this.canvas.nativeElement.toDataURL('image/png')
    const filename = this.dicom.getValue(Tag.PATIENT_NAME).asString();
    const link = document.createElement('a');
    link.style.display = 'none';
    document.body.appendChild(link)
    link.setAttribute('download', filename + '.png');
    link.setAttribute('href', img.replace('image/png', 'image/octet-stream'));
    link.click();
    link.remove();
  }

  public reset() {
    this.canvases.forEach(canvas => {
      const instance = canvas.instance;
      instance.camera = new Camera();
      instance.currentSlice = 0;
      instance.windowing = this.getDefaultWindowing();
      instance.resetPosition();
      this.render(instance);
    })
  }

}
