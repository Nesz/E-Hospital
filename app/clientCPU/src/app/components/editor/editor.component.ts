import { AfterViewInit, Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { Tool } from '../../model/tool';
import { DicomConstants } from '../../dicom.constants';
import { BehaviorSubject, forkJoin, fromEvent, Subscription } from 'rxjs';
import { UntilDestroy } from '@ngneat/until-destroy';
import { Dicom } from '../../model/dicom';
import { Tag } from '../../tag';
import {
  getImageData,
  imageDataToCanvas,
  isAtPoint,
  isNearBounds,
  orientShape,
  Side,
} from '../../helpers/canvas.helper';
import { ApiService } from '../../services/api.service';
import { Shape, ShapeType } from '../../model/shape';
import { ActivatedRoute } from '@angular/router';
import { mergeMap } from 'rxjs/operators';

const EDGE_HOVER_OFFSET = 15;
const DOT_RADIUS = 5;

@UntilDestroy({ arrayName: 'subscriptions' })
@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
})
export class EditorComponent implements AfterViewInit, OnInit {
  sidebarActive = true;

  @ViewChild('sidebar')
  sidebar!: ElementRef<HTMLDivElement>;

  @ViewChild('parent')
  parent!: ElementRef<HTMLSpanElement>;

  @ViewChild('canvas')
  canvas!: ElementRef<HTMLCanvasElement>;

  context!: CanvasRenderingContext2D;

  shapes: Shape[] = [
    //  { x: 5, y: 5, w: 55, h: 55, type: ShapeType.RECTANGLE, label: 'empty', isActive: false },
  ];
  dicom!: Dicom;
  tools: Tool[] = DicomConstants.TOOLS;
  subscriptions: Subscription[] = [];

  tool = this.tools[0];

  lastRenderTime = 0;

  width = 0;
  height = 0;
  angle = 0;
  scale = 0;

  windowing = {
    wc: 0,
    ww: 0,
    min: 0,
    max: 0,
  };

  shapeDrag?: {
    isDragging: boolean;
    side: Side;
    action: number;
    shape: Shape;
    dragStart: {
      x: number;
      y: number;
    };
  };

  canvasResolution$ = new BehaviorSubject<{
    width: number;
    height: number;
  }>({ width: 0, height: 0 });

  frames: {
    id: number;
    dirty: boolean;
    raw?: ArrayBuffer;
    image?: HTMLCanvasElement;
  }[] = [];

  currentFrame = 0;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly api: ApiService,
    private readonly zone: NgZone
  ) {}

  ngOnInit() {
    const routeParams = this.route.snapshot.paramMap;
    const args = {
      patientId: routeParams.get('patientId')!,
      seriesId: routeParams.get('seriesId')!,
      studyId: routeParams.get('studyId')!,
    };

    this.api
      .getSeriesMetadata(args)
      .pipe(
        mergeMap((series) => {
          series.instances.forEach((v, i) => {
            this.frames[i] = {
              id: series.instances[i],
              dirty: false,
            };
          });
          return forkJoin([
            this.api.getDicomMetadata({ ...args, instanceId: series.instances[0] }),
            this.api.getDicomFrame({ ...args, instanceId: series.instances[0] }),
          ]);
        })
      )
      .subscribe(([meta, frame]) => {
        this.setup(meta);
        const data = getImageData(this.dicom, this.windowing, frame);
        this.frames[0] = { ...this.frames[0], raw: frame, image: imageDataToCanvas(data) };
        this.paint(false);
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
      this.canvasResolution$.subscribe((event) => this.onResize(event))
    );
  }

  private onResize = (dimensions: { width: number; height: number }) => {
    if (this.context) {
      this.calculateAspectRatio(dimensions);
      this.paint(false);
    }
  };

  private onWheel = (event: WheelEvent) => {};

  private onMouseUp = (event: MouseEvent) => {
    if (this.shapeDrag) {
      orientShape(this.shapeDrag.shape);
      this.shapeDrag.isDragging = false;
    }
    this.tool.onMouseUp(event, this);
  };

  private onMouseDown = (event: MouseEvent) => {
    if (event.button === 2 && this.shapeDrag) {
    }

    if (this.shapeDrag) {
      this.shapeDrag.isDragging = true;
    }
    if (!this.shapeDrag?.isDragging) {
      this.tool.onMouseDown(event, this);
    }
  };

  private onMouseMove = (event: MouseEvent) => {
    if (this.context && this.canvas && !this.shapeDrag?.isDragging) {
      const bound = this.context.canvas.getBoundingClientRect();
      const clientPos = this.relativePoint(event.clientX - bound.left, event.clientY - bound.top);

      let foundFlag = false;
      for (const shape of this.shapes) {
        const isAtDot = isAtPoint({
          clientX: clientPos.x,
          clientY: clientPos.y,
          shape: shape,
          radius: DOT_RADIUS / this.scale,
        });

        if (isAtDot) {
          foundFlag = true;
          this.shapeDrag = {
            side: isAtDot[2],
            isDragging: false,
            action: 1,
            shape: shape,
            dragStart: {
              x: shape.x - clientPos.x,
              y: shape.y - clientPos.y,
            },
          };
          this.paint(false);
          break;
        }

        const isNear = isNearBounds({
          clientX: clientPos.x,
          clientY: clientPos.y,
          height: shape.h,
          width: shape.w,
          offset: EDGE_HOVER_OFFSET / this.scale,
          x: shape.x,
          y: shape.y,
        });

        if (isNear) {
          foundFlag = true;
          this.shapeDrag = {
            side: Side.LEFT_TOP,
            isDragging: false,
            action: 0,
            shape: shape,
            dragStart: {
              x: shape.x - clientPos.x,
              y: shape.y - clientPos.y,
            },
          };
          this.paint(false);
          break;
        }
      }
      if (!foundFlag && this.shapeDrag) {
        this.shapeDrag = undefined;
        this.paint(false);
      }
    } else if (this.shapeDrag && this.shapeDrag.isDragging && this.shapeDrag.action == 0) {
      const bound = this.context.canvas.getBoundingClientRect();
      const current = this.relativePoint(event.clientX - bound.left, event.clientY - bound.top);
      const shape = this.shapeDrag.shape;
      const dragStart = this.shapeDrag.dragStart;
      shape.x = current.x + dragStart.x;
      shape.y = current.y + dragStart.y;
      this.paint(false);
    } else if (this.shapeDrag && this.shapeDrag.isDragging && this.shapeDrag.action == 1) {
      const bound = this.context.canvas.getBoundingClientRect();
      const shape = this.shapeDrag.shape;
      const current = this.relativePoint(event.clientX - bound.left, event.clientY - bound.top);
      switch (this.shapeDrag.side) {
        case Side.RIGHT_BOT: {
          shape.w = current.x - shape.x;
          shape.h = current.y - shape.y;
          break;
        }
        case Side.RIGHT_TOP: {
          const oldX = shape.x;
          const oldY = shape.y + shape.h;
          shape.y = current.y;
          shape.w = current.x - oldX;
          shape.h = oldY - current.y;
          break;
        }
        case Side.LEFT_BOT: {
          const oldPoint = {
            x: shape.x + shape.w,
            y: shape.y,
          };
          shape.x = current.x;
          //shape.y = current.y;
          shape.w = oldPoint.x - current.x;
          shape.h = current.y - oldPoint.y;
          break;
        }
        case Side.LEFT_TOP: {
          const oldPoint = {
            x: shape.x + shape.w,
            y: shape.y + shape.h,
          };
          shape.x = current.x;
          shape.y = current.y;
          shape.w = oldPoint.x - current.x;
          shape.h = oldPoint.y - current.y;
          break;
        }
      }
      this.paint(false);
    }

    this.tool.onMouseMove(event, this);
  };

  private setup = (dicom: Dicom) => {
    this.dicom = dicom;
    this.width = dicom.getValue(Tag.WIDTH).asNumber();
    this.height = dicom.getValue(Tag.HEIGHT).asNumber();
    this.setupWindowing();

    const context = this.canvas.nativeElement.getContext('2d', {
      desynchronized: true,
    });

    if (!context) {
      return;
    }

    this.context = context;
    this.calculateAspectRatio({
      width: this.parent.nativeElement.clientWidth,
      height: this.parent.nativeElement.clientHeight,
    });
  };

  private setupWindowing = () => {
    const dicom = this.dicom;
    if (dicom.hasTag(Tag.WINDOW_CENTER) && dicom.hasTag(Tag.WINDOW_WIDTH)) {
      this.windowing.wc = dicom.getValue(Tag.WINDOW_CENTER, true).asNumber();
      this.windowing.ww = dicom.getValue(Tag.WINDOW_WIDTH, true).asNumber();
      this.windowing.min = this.windowing.wc - this.windowing.ww / 2;
      this.windowing.max = this.windowing.wc + this.windowing.ww / 2;
      return;
    }
  };

  clearCanvas = () => {
    this.context.save();
    this.context.setTransform(1, 0, 0, 1, 0, 0);
    this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
    this.context.restore();
  };

  paintDebug = () => {
    const voi = this.windowing;
    this.context.save();
    this.context.resetTransform();
    this.context.font = 'bold 15px Arial';
    this.context.fillStyle = '#00B9AE';
    this.context.fillText(`WW: ${voi.ww} WC: ${voi.wc}`, 10, 20);
    this.context.fillText(`Scale: ${this.scale.toFixed(2)}x`, 10, 40);
    this.context.fillText(`Angle: ${(this.angle * (180 / Math.PI)).toFixed(2)}deg`, 10, 60);
    this.context.fillText(`Size: ${this.width}x${this.height}`, 10, 80);
    this.context.fillText(`Render: ${this.lastRenderTime}ms`, 10, 100);
    this.context.fillText(`Frame: ${this.currentFrame + 1}/${this.frames.length}`, 10, 120);
    this.context.restore();
  };

  calculateAspectRatio = (dimensions: { width: number; height: number }) => {
    const dw = dimensions.width;
    const dh = dimensions.height;

    const scaleX = dw / this.width;
    const scaleY = dh / this.height;

    this.context.canvas.width = dw;
    this.context.canvas.height = dh;

    this.scale = Math.min(scaleX, scaleY);

    this.context.resetTransform();
    this.context.translate((dw / 2 + 0.5) | 0, (dh / 2 + 0.5) | 0);
    this.context.scale(this.scale, this.scale);
    this.context.rotate(this.angle);
  };

  paint = (windowingChanged: boolean) => {
    const start = new Date().getMilliseconds();
    this.clearCanvas();

    const currFrame = this.frames[this.currentFrame];
    console.log(currFrame);

    if (currFrame.dirty || windowingChanged || !currFrame.image) {
      const data = getImageData(this.dicom, this.windowing, currFrame.raw!);
      currFrame.image = imageDataToCanvas(data);
      currFrame.dirty = false;
    }

    this.context.drawImage(
      currFrame.image,
      (-this.width / 2 + 0.5) | 0,
      (-this.height / 2 + 0.5) | 0
    );
    const end = new Date().getMilliseconds();

    this.paintDebug();
    this.paintShapes();
    this.lastRenderTime = end - start;
  };

  changeTool = (tool: Tool) => {
    this.tool = tool;
  };

  relativePoint(x: number, y: number) {
    const workingMatrix = this.context.getTransform();
    return new DOMPoint(x, y).matrixTransform(workingMatrix.inverse());
  }

  paintShapes = () => {
    for (const shape of this.shapes) {
      if (shape.isActive) {
        this.paintShape(shape, 'blue');
        continue;
      }
      if (this.shapeDrag?.action == 1 && this.shapeDrag.shape === shape) {
        this.paintShape(shape, 'red', 'white');
        continue;
      }
      if (this.shapeDrag?.action == 0 && this.shapeDrag.shape === shape) {
        this.paintShape(shape, 'blue');
        continue;
      }
      this.paintShape(shape);
    }
  };

  paintShape(shape: Shape, color = 'red', arcColor = 'red') {
    const ctx = this.context;
    if (ShapeType.RECTANGLE === shape.type) {
      const x = shape.x;
      const y = shape.y;
      const width = shape.w;
      const height = shape.h;
      const scale = Math.max(this.scale, 0.5);

      ctx.strokeStyle = color;
      ctx.lineWidth = 3 / scale;
      ctx.setLineDash([6 / scale, 3 / scale]);
      ctx.strokeRect(x, y, width, height);

      const dots = [
        [shape.x, shape.y],
        [shape.x, shape.y + shape.h],
        [shape.x + shape.w, shape.y],
        [shape.x + shape.w, shape.y + shape.h],
      ];

      ctx.setLineDash([0]);
      ctx.strokeStyle = arcColor;
      ctx.fillStyle = arcColor;
      ctx.lineWidth = 2 / this.scale;
      for (const dot of dots) {
        const [x, y] = dot;
        ctx.beginPath();
        ctx.arc(x, y, 5 / scale, 0, 2 * Math.PI, false);
        ctx.fill();
        ctx.stroke();
      }
      return;
    }
  }

  humanizeArea(w: number, h: number) {
    const spacing = this.dicom.getValue(Tag.PIXEL_SPACING, true).asList<number>();
    const spacingX = spacing[1];
    const spacingY = spacing[0];
    const areaMM = w * spacingX * (h * spacingY);
    return `${areaMM.toFixed(0)}`;
  }

  onMeasurementClick(shape: Shape) {
    const active = shape.isActive;
    this.shapes.filter((x) => x.isActive).forEach((x) => (x.isActive = false));
    shape.isActive = !active;
    this.paint(false);
  }

  onLabelChange(event: Event, shape: Shape) {
    shape.label = (event.target as HTMLInputElement).value;
  }

  onOptionChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.tool.onExtraOption(Number(value), this);
  }

  frameChanged($event: Event) {
    const routeParams = this.route.snapshot.paramMap;
    this.currentFrame = Number(($event.target as HTMLInputElement).value);

    const currFrame = this.frames[this.currentFrame];
    if (currFrame.raw) {
      this.paint(false);
      return;
    }

    const args = {
      patientId: routeParams.get('patientId')!,
      studyId: routeParams.get('studyId')!,
      seriesId: routeParams.get('seriesId')!,
      instanceId: currFrame.id,
    };

    const frameIndex = this.currentFrame;
    this.api.getDicomFrame(args).subscribe((x) => {
      const data = getImageData(this.dicom, this.windowing, x);
      this.frames[frameIndex].raw = x;
      this.frames[frameIndex].image = imageDataToCanvas(data);
      this.paint(true);
    });
  }

  reset() {
    this.angle = 0;
    this.setup(this.dicom);
    this.paint(true);
  }
}
