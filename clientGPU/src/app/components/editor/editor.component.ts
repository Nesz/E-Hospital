import { BehaviorSubject, forkJoin, fromEvent, Observable, Subscription } from "rxjs";
import {
  AfterViewInit,
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  ElementRef, forwardRef,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewContainerRef
} from "@angular/core";
import { ProgressRingComponent } from "../progress-ring/progress-ring.component";
import {
  fastMax, fastMin,
  generate3DTexture,
  getAngle,
  getAreaMM,
  getDistanceMM,
  isInsideBoundsBBox,
  loadLUT
} from "../../helpers/canvas.helper";
import { debounceTime, map, tap } from "rxjs/operators";
import { ShaderService } from "../../services/shader.service";
import { ApiService } from "../../services/api.service";
import { ActivatedRoute } from "@angular/router";
import { Camera } from "../../model/camera";
import { Dicom, Sequence } from "../../model/dicom";
import * as GLM from "gl-matrix";
import { vec2 } from "gl-matrix";
import { Tag } from "../../tag";
import { CanvasPartComponent } from "../canvas-part/canvas-part.component";
import { Shader } from "../../model/shader";
import {
  Layout,
  LookupTable,
  LookupTablesData,
  Measurement,
  MeasurementType,
  Plane,
  SidebarMode,
  Tool,
  Windowing
} from "../../model/interfaces";
import { HttpClient } from "@angular/common/http";
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
import { TableData } from "../nestable-table/nestable-table.component";
import { IconRegistryService } from "../../services/icon-registry.service";
import { layouts } from "../../dicom.constants";
import { Settings } from "../settings/settings.component";

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

  readonly SidebarMode: typeof SidebarMode = SidebarMode;
  sidebarMode: SidebarMode = SidebarMode.NONE;

  seriesId!: number;
  sidebarActive = true;
  tagsActive = false;

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

  currentCanvas!: CanvasPartComponent;
  canvasResolution$ = new BehaviorSubject<{ width: number; height: number; }>({ width: 0, height: 0 });
  public tagsTable!: TableData;
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
  private texCoordLocationH!: number;
  private positionLocationH!: number;

  private programs: { [key: string]: Shader } = {};
  public lookupTables!: LookupTable[];

  download$!: Observable<Download>
  download?: Download

  buckets!: any;

  constructor(
    private readonly httpClient: HttpClient,
    private readonly iconService: IconRegistryService,
    private readonly resolver: ComponentFactoryResolver,
    private readonly shaderService: ShaderService,
    private readonly route: ActivatedRoute,
    private readonly api: ApiService,
    private readonly zone: NgZone
  ) {}

  public slicesCountForPlane(plane: Plane): number {
    switch (plane) {
      case Plane.TRANSVERSE:
        return this.props.sliceCount;
      default:
        return this.props.width;
    }
  }

  public getDimensionsForPlane(plane: Plane): { width: number, height: number } {
    switch (plane) {
      case Plane.TRANSVERSE:
        return { width: this.props.width, height: this.props.height };
      default:
        return { width: this.props.width, height: this.props.sliceCount };
    }
  }

  public onShapeFinish(shape: Measurement) {
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
      this.tagsTable = this.buildTagsTable(this.dicom.dataset)
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

      const [texture, buckets] = generate3DTexture({
        gl: this.context,
        buffer: buffer,
        width: width,
        height: height,
        depth: series.instances.length,
        sliceThickness: sliceThickness,
        bitsPerPixel: bitsPerPixel,
        pixelRepresentation: pixelRepresentation,
      })

      this.buckets = buckets;

      this.props = {
        sliceCount: series.instances.length,
        width: width,
        height: height,
        sliceThickness: sliceThickness,
        slope: slope,
        intercept: intercept,
        pixelSpacing: dicom.asList<number>(Tag.PIXEL_SPACING).map(x => Number(x)),
        texture3d: texture
      }

      forkJoin([this.loadLUTs(), this.initShaders()])
        .subscribe(() => {
          const part = this.createCanvasPart();
          this.currentCanvas = part.instance;
          this.canvases.push(part)
        })
    });
  }

  public buildTagsTable(sq: Sequence) {
    const table: TableData = {
      headers: ['TAG ID', 'VR', 'NAME', 'VALUE'],
      rows: []
    };
    Object.entries(sq.entries)
      .forEach(e => {
        if (e[1].vr === 'SQ') {
          let combine:any[] = [];
          for (let i = 0; i < e[1].value.length; ++i) {
            combine.push({
              isNested: false,
              selfData: [],
              data: [`ITEM -> ${i + 1}`, '', '', ''],
            })
            this.buildTagsTable(new Sequence(e[1].value[i])).rows
              .forEach(r => {
                combine.push(r)
              })
          }
          table.rows.push({
            isNested: true,
            selfData: [this.formatTag(e[0]), e[1].vr, this.iconService.getTagDefinition(e[0]), ''],
            data: combine
          })
        } else {
          table.rows.push({
            isNested: false,
            selfData: [],
            data: [this.formatTag(e[0]), e[1].vr, this.iconService.getTagDefinition(e[0]), e[1].value]
          })
        }
      })
    return table;
  }

  public formatTag(tagStr: string) {
    const group = tagStr.substr(0, 4);
    const tag = tagStr.substr(4);
    return `(${group}, ${tag})`
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
      .add(fromEvent<MouseEvent>(window, 'mousedown').subscribe((event) => {
        const canvasPart = this.getCanvasPartFromMousePosition(event.x, event.y);
        if (canvasPart) {
          this.currentCanvas = canvasPart.instance;
          this.canvases.forEach(ref => ref.location.nativeElement.children[0].style.border = '1px solid #12a5a4')
          canvasPart.location.nativeElement.children[0].style.border = '1px solid red'
          console.log(this.currentCanvas.plane)
        }
        this.tool.onMouseDown(event)
      }))
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

  public oti(o: Plane) {
    switch (o) {
      case Plane.TRANSVERSE: return 0;
      case Plane.SAGITTAL: return 1;
      case Plane.CORONAL: return 2;
    }
  }


  public readCurrentSlicePixels() {
    const gl = this.context;
    const canvasPart = this.currentCanvas;

    const { width, height } = this.getDimensionsForPlane(canvasPart.plane);

    const shader = this.programs['histogram'];
    gl.disable(gl.SCISSOR_TEST)
    gl.viewport(0, 0, width, height);
    gl.useProgram(shader.program);

    {
      const positionLocation = gl.getAttribLocation(shader.program, 'a_position');
      const positionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        -1, -1, -1, 1, 1, -1,
        1, 1, 1, -1, -1, 1,
      ]), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
      const texCoordLocation = gl.getAttribLocation(shader.program, "a_texCoord");
      const texCoordBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        0.0, 1.0,
        0.0, 0.0,
        1.0, 1.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 0.0]), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(texCoordLocation);
      gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);
    }

    // creating texture
    const targetTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, targetTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.R16I, width, height, 0, gl.RED_INTEGER, gl.SHORT, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    const frameBuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, targetTexture, 0);

    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE) {
      alert("this combination of attachments does not work");
    }

    const uniforms = {
      u_slope: this.props.slope,
      u_intercept: this.props.intercept,
      u_plane: this.oti(canvasPart.plane),
      u_currentSlice: canvasPart.currentSlice,
      u_maxSlice: this.slicesCountForPlane(canvasPart.plane),
      u_image: 1,
      u_inverted: canvasPart.isInverted
    };

    shader.assignUniforms(gl, uniforms);

    //gl.clearColor(0, 0, 0, 1);
    //this.updateRectangle(width, height)

    const results = new Int16Array (width * height);

    // gl.clearDepth(1.0);
    //gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, targetTexture);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_3D, this.props.texture3d);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 6);
    gl.readPixels(0, 0, width, height, gl.RED_INTEGER, gl.SHORT, results);
    console.log(results)
    console.log("fastMin(view2): " + fastMin(results))
    console.log("fastMax(view2): " + fastMax(results))

    return results;
  }



  public render(canvasPart: CanvasPartComponent) {
    // return
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
      u_plane: this.oti(canvasPart.plane),
      u_maxSlice: this.slicesCountForPlane(canvasPart.plane),
      u_image: 0,
      u_lut: 1,
      u_inverted: canvasPart.isInverted
    };

    shader.assignUniforms(gl, uniforms);

    const dimensions = this.getDimensionsForPlane(canvasPart.plane);
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
      .filter(shape => shape.plane === canvasPart.plane)
      .filter(shape => shape.slice === canvasPart.currentSlice)
      .filter(shape => shape.isVisible)
      .forEach(shape => this.renderMeasurement(shape, canvasPart))
    canvasPart.writeInfoOntoCanvas2D();
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
    const gl = this.canvas.nativeElement.getContext('webgl2', {
      desynchronized: true,
      preserveDrawingBuffer: true
    })!;

    // TODO: OPIS
    gl.getExtension('EXT_color_buffer_float');

    gl.canvas.width = this.parent.nativeElement.clientWidth;
    gl.canvas.height = this.parent.nativeElement.clientHeight;

    this.context = gl;
  };

  private createCanvasPart() {
    const factory = this.resolver.resolveComponentFactory(CanvasPartComponent);
    let component = this.container.createComponent(factory);

    component.instance.editor = this;
    component.instance.lut = this.lookupTables[0];
    component.instance.camera = new Camera();
    component.instance.currentSlice = 0;
    component.instance.plane = Plane.TRANSVERSE;
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
    const $histogramProgram = this.shaderService.createProgramFromAssets(
      this.context, 'shaders/shader_vert_signed_histogram.glsl', 'shaders/shader_frag_signed_histogram.glsl');

    return forkJoin([$mainProgram, $shapeProgram, $histogramProgram])
      .pipe(tap(([mainProgram, shapeProgram, histogramProgram]) => {
        this.programs['histogram'] = new Shader(histogramProgram[0], histogramProgram[1]);
        this.programs['default'] = new Shader(mainProgram[0], mainProgram[1]);
        this.programs['shape'] = new Shader(shapeProgram[0], shapeProgram[1]);

        this.texCoordLocation = gl.getAttribLocation(this.programs['default'].program, 'a_texCoord');
        this.texCoordLocationH = gl.getAttribLocation(this.programs['histogram'].program, 'a_texCoord');
        this.positionLocation = gl.getAttribLocation(this.programs['default'].program, 'a_position');
        this.positionLocationH = gl.getAttribLocation(this.programs['histogram'].program, 'a_position');
        gl.enableVertexAttribArray(this.texCoordLocation);
        gl.enableVertexAttribArray(this.positionLocation);
        gl.enableVertexAttribArray(this.texCoordLocationH);
        gl.enableVertexAttribArray(this.positionLocationH);
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
          const gl = this.context;
          gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
          gl.clearColor(0, 0, 0, 1);
          gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

          x.instance.resetPosition();
          setTimeout(() => this.render(x.instance))
        }
      })
    }
  };

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

  switchSidebar(mode: SidebarMode) {
    if (mode === this.sidebarMode) {
      this.sidebarMode = SidebarMode.NONE;
      return
    }
    this.sidebarMode = mode;
  }

  layouts: Layout[] = [
    {
      icon: 'layout_4',
      regions: 1,
      templateAreas: '"a"',
      areaIdentifiers: ['a']
    },
    {
      icon: 'layout_3',
      regions: 3,
      templateAreas: '"a b c"',
      areaIdentifiers: ['a', 'b', 'c']
    },
    {
      icon: 'layout_2',
      regions: 3,
      templateAreas: '"a b" "a c"',
      areaIdentifiers: ['a', 'b', 'c']
    },
    {
      icon: 'layout_1',
      regions: 3,
      templateAreas: '"a b" "c c"',
      areaIdentifiers: ['a', 'b', 'c']
    }
  ]
  currentLayout = this.layouts[0];

  public changeLayout(layout: Layout) {
    const planes = [Plane.TRANSVERSE, Plane.CORONAL, Plane.SAGITTAL]
    this.currentLayout = layout;
    if (this.canvases.length < layout.regions) {
      const diff = layout.regions - this.canvases.length;
      for (let i = 1; i <= diff; ++i) {
        this.canvases.push(this.createCanvasPart());
      }
    } else {
      for (let i = this.canvases.length - 1; i >= layout.regions; --i) {
        //todo unsubscribe
        const last = this.canvases.pop();
        last?.destroy();
      }
    }

    setTimeout(() => {
      for (let i = 0; i < this.canvases.length; ++i) {
        this.canvases[i].instance.plane = planes.pop()!;
        this.canvases[i].location.nativeElement.childNodes[0].style.gridArea = layout.areaIdentifiers[i]
      }
    })

  }

  public gathserSettings(): any {
    const cp = this.currentCanvas;
    return {
      slice: {
        min: 1,
        max: this.slicesCountForPlane(cp.plane),
        current: cp.currentSlice
      },
      zoom: {
        min: 20,
        max: 1000,
        current: Math.ceil(cp.camera.zoom * 100)
      },
      windowing: {
        wc_min: 0,
        wc_max: 1000,
        ww_min: 0,
        ww_max: 1000,
        wc_current: cp.windowing.wc,
        ww_current: cp.windowing.ww,
        presets: []
      },
      luts: this.lookupTables
    }
  }
}
