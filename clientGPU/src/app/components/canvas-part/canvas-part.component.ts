import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone, OnDestroy,
  Output,
  ViewChild
} from "@angular/core";
import { CanvasDrawingArea, EditorComponent } from "../editor/editor.component";
import { FpsLoop } from "../../helpers/fps-loop";

@Component({
  selector: 'app-canvas-part',
  templateUrl: './canvas-part.component.html',
  styleUrls: ['./canvas-part.component.scss']
})
export class CanvasPartComponent implements AfterViewInit, OnDestroy {
  editor!: EditorComponent;
  isRendered = false;
  @ViewChild('canvas') canvas!: ElementRef<HTMLDivElement>
  @Input() whenDestroyed: () => void = () => {};
  @Input() canvasPart!: CanvasDrawingArea;
  @Input() slices!: {
    width: number;
    height: number;
    slices: WebGLTexture[];
  };
  @Output() onAxisChange = new EventEmitter<CanvasPartComponent>();
  @Output() onSliceChange = new EventEmitter<CanvasPartComponent>();
  @Output() onResize = new EventEmitter<CanvasPartComponent>();
  fps = 30;
  timer = new FpsLoop(this.fps, (_: any) => this.nextSlice());

  constructor(
    private readonly zone: NgZone
  ) { }

  ngOnDestroy(): void {
    this.whenDestroyed();
  }

  ngAfterViewInit() {
    const observer = new ResizeObserver((_) => {
      this.zone.run(() => {
        this.resetPosition();
        this.onResize.emit(this);
      });
    });

    observer.observe(this.canvas.nativeElement);
    this.isRendered = true;
  }

  getWidth = () =>
    this.editor.getOrientationSlices(this.canvasPart.orientation).width;

  getHeight = () =>
    this.editor.getOrientationSlices(this.canvasPart.orientation).height;

  resetPosition = () => {
    const bbox = this.canvas?.nativeElement?.getBoundingClientRect();
    if (bbox) {
      const [scale, offX, offY] = this.calculateAspectRatio({
        width: bbox.width,
        height: bbox.height,
        elWidth: this.editor.orientation[this.canvasPart.orientation].width,
        elHeight: this.editor.orientation[this.canvasPart.orientation].height,
      });

      this.canvasPart.camera.zoom = scale;
      this.canvasPart.camera.x = -offX;
      this.canvasPart.camera.y = -offY;
    }
  }

  calculateAspectRatio = (dimensions: {
    width: number;
    height: number;
    elWidth: number;
    elHeight: number;
  }) => {
    const { width, height, elWidth, elHeight } = dimensions;

    const scaleX = width / elWidth;
    const scaleY = height / elHeight;
    const scale = Math.min(scaleX, scaleY);

    return [
      scale,
      (width - elWidth * scale) / 2 / scale,
      (height - elHeight * scale) / 2 / scale
    ];
  };

  nextSlice() {
    if (this.canvasPart.currentSlice === this.editor.orientation[this.canvasPart.orientation].slices.length) {
      this.canvasPart.currentSlice = 0;
    }
    this.canvasPart.currentSlice++;
    this.onSliceChange.emit(this);
  }

  changeAxis($event: Event) {
    // @ts-ignore
    this.canvasPart.orientation = ($event.target as HTMLInputElement).value;
    this.slices = this.editor.getOrientationSlices(this.canvasPart.orientation)
    this.canvasPart.currentSlice = 0;
    this.resetPosition();
    this.onAxisChange.emit(this);
  }

  changeSlice($event: Event) {
    this.canvasPart.currentSlice = Number(($event.target as HTMLInputElement).value);
    this.onSliceChange.emit(this);
  }

  windowingChanged(type: string, $event: Event) {
    const newVal = Number(($event.target as HTMLInputElement).value);
    if (type === 'wc')
      this.canvasPart.windowing[type] = newVal;
    else
      this.canvasPart.windowing.ww = newVal;

    this.editor.render(this);
  }

  fpsChanged($event: Event) {
    this.fps = Number(($event.target as HTMLInputElement).value);
    this.timer.changeFPS(this.fps)
  }

  togglePlayer() {
    if (this.timer.isPlaying) {
      this.timer.stop();
    } else {
      this.timer.start();
    }
  }
}
