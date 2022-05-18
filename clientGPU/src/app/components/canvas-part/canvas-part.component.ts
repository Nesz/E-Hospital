import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnDestroy,
  Output,
  ViewChild
} from "@angular/core";
import { EditorComponent } from "../editor/editor.component";
import { FpsLoop } from "../../helpers/fps-loop";
import { Camera } from "../../model/camera";
import { LookupTable, Orientation, Windowing } from "../../model/interfaces";

@Component({
  selector: 'app-canvas-part',
  templateUrl: './canvas-part.component.html',
  styleUrls: ['./canvas-part.component.scss']
})
export class CanvasPartComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas') canvas!: ElementRef<HTMLDivElement>
  @ViewChild('canvas2d') canvas2d!: ElementRef<HTMLCanvasElement>
  @Input() whenDestroyed: () => void = () => {};
  @Output() onChanges = new EventEmitter<CanvasPartComponent>();
  @Output() onResize = new EventEmitter<CanvasPartComponent>();

  editor!: EditorComponent;
  lut!: LookupTable;
  camera!: Camera;
  currentSlice!: number;
  orientation!: Orientation;
  windowing!: Windowing;
  context2D!: CanvasRenderingContext2D;

  isRendered = false;
  fps = 30;
  timer = new FpsLoop(this.fps, () => this.nextSlice());

  constructor(
    private readonly zone: NgZone
  ) { }

  public ngOnDestroy(): void {
    this.whenDestroyed();
  }

  public ngAfterViewInit(): void {
    const observer = new ResizeObserver(() => {
      this.zone.run(() => {
        this.resetPosition();
        this.onResize.emit(this);
      });
    });

    observer.observe(this.canvas.nativeElement);
    this.isRendered = true;

    this.context2D = this.canvas2d.nativeElement.getContext('2d', {
      alpha: true,
      desynchronized: true
    })!;

  }

  public getTextureDimensions() {
    return this.editor.getDimensionsForOrientation(this.orientation);
  }

  public resetPosition() {
    this.camera = new Camera();
    const bbox = this.canvas?.nativeElement?.getBoundingClientRect();
    if (bbox) {
      const dimensions = this.getTextureDimensions();
      const [scale, offX, offY] = this.calculateAspectRatio({
        width: bbox.width,
        height: bbox.height,
        elWidth: dimensions.width,
        elHeight: dimensions.height,
      });

      this.camera.zoom = scale;
      this.camera.x = -offX;
      this.camera.y = -offY;
      this.canvas2d.nativeElement.width = bbox.width;
      this.canvas2d.nativeElement.height = bbox.height;
      //const ctx = this.canvas2d.nativeElement.getContext('2d')!;
      //ctx.translate(-offX, -offY);
      //ctx.scale(scale, scale);
    }
  }

  public calculateAspectRatio(dimensions: {
    width: number;
    height: number;
    elWidth: number;
    elHeight: number;
  }) {
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

  public nextSlice() {
    if (this.currentSlice === this.editor.slicesCountForOrientation(this.orientation)) {
      this.currentSlice = 0;
    }
    this.currentSlice++;
    this.onChanges.emit(this);
  }

  public changeAxis($event: Event) {
    this.orientation = this.orientationEnumFromString(($event.target as HTMLInputElement).value);
    this.currentSlice = 0;
    this.resetPosition();
    this.onChanges.emit(this);
  }

  public changeSlice($event: Event) {
    this.currentSlice = Number(($event.target as HTMLInputElement).value);
    this.onChanges.emit(this);
  }

  public windowingChanged(type: string, $event: Event) {
    const newVal = Number(($event.target as HTMLInputElement).value);
    if (type === 'wc')
      this.windowing.wc = newVal;
    else
      this.windowing.ww = newVal;

    this.onChanges.emit(this);
  }

  public fpsChanged($event: Event) {
    this.fps = Number(($event.target as HTMLInputElement).value);
    this.timer.changeFPS(this.fps)
  }

  public togglePlayer() {
    if (this.timer.isPlaying) {
      this.timer.stop();
    } else {
      this.timer.start();
    }
  }

  getOrientationName() {
    return Orientation[this.orientation];
  }

  private orientationEnumFromString(orientation: string) {
    switch (orientation) {
      case 'top': return Orientation.TOP;
      case 'left': return Orientation.LEFT;
      case 'right': return Orientation.RIGHT;
      case 'bottom': return Orientation.BOTTOM;
      case 'front': return Orientation.FRONT;
      case 'back': return Orientation.BACK;
      default: throw 'bad orientation';
    }
  }

  changeLut($event: Event) {
    this.lut = this.editor.lookupTables
      .find(lut => lut.name === ($event.target as HTMLInputElement).value)!;
    this.onChanges.emit(this);
  }
}
