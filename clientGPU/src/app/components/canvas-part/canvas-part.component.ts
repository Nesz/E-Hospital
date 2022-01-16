import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone, OnDestroy,
  OnInit,
  Output,
  ViewChild
} from "@angular/core";
import { CanvasDrawingArea, EditorComponent } from "../editor/editor.component";

@Component({
  selector: 'app-canvas-part',
  templateUrl: './canvas-part.component.html',
  styleUrls: ['./canvas-part.component.scss']
})
export class CanvasPartComponent implements OnInit, AfterViewInit, OnDestroy {
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


  constructor(
    private readonly zone: NgZone
  ) { }

  ngOnInit(): void {

  }

  ngOnDestroy(): void {
    console.log("destroy")
    this.whenDestroyed();
  }



  ngAfterViewInit() {
    const observer = new ResizeObserver((entries) => {
      this.zone.run(() => {
        console.log("resize")
        this.resetPosition();
        this.onResize.emit(this);
      });
    });

    observer.observe(this.canvas.nativeElement);
    this.isRendered = true;
  }

  randomId() {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < 6; ++i ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    console.log(result)
    return result;
  }

  resetPosition = () => {
    const bbox = this.canvas?.nativeElement?.getBoundingClientRect();
    if (!bbox) {
      return
    }
    console.log("XD")
    console.log(bbox)
    const [scale, offX, offY] = this.calculateAspectRatio({
      width: bbox.width,
      height: bbox.height,
      elWidth: this.editor.orientation.z.width,
      elHeight: this.editor.orientation.z.height,
    });

    this.canvasPart.camera.zoom = scale;
    this.canvasPart.camera.x = -offX;
    this.canvasPart.camera.y = -offY;
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
}
