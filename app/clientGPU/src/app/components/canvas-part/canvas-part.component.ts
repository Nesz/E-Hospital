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
import { LookupTable, Plane, Windowing } from "../../model/interfaces";
import { Tag } from "../../tag";

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

  readonly planes = Plane;

  editor!: EditorComponent;
  lut!: LookupTable;
  camera!: Camera;
  currentSlice!: number;
  plane!: Plane;
  windowing!: Windowing;
  context2D!: CanvasRenderingContext2D;
  isInverted: boolean = false;

  isRendered = false;

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
  getTagValue(tag: any) {
    return this.editor.dicom?.getValue(tag, false)?.asString();
  }

  public writeInfoOntoCanvas2D() {
    const spacing = [
      this.editor.props.pixelSpacing[0].toFixed(2),
      this.editor.props.pixelSpacing[1].toFixed(2),
    ]
    const planeName = Plane[this.plane].toString();
    const dimensions = this.getTextureDimensions();
    const modality = this.getTagValue(Tag.MODALITY);
    const curSlice = this.currentSlice + 1;
    const maxSlice = this.editor.slicesCountForPlane(this.plane) + 1;
    const ctx = this.context2D;
    const bottom = ctx.canvas.height;
    ctx.font = 'bold 15px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText(`Slice: ${curSlice} / ${maxSlice}`, 10, bottom - 100);
    ctx.fillText(`Zoom: ${this.camera.zoom.toFixed(2)}x`, 10, bottom - 80);
    ctx.fillText(`Window/Level: ${this.windowing.ww} / ${this.windowing.wc}`, 10, bottom - 60);
    ctx.fillText(`Spacing x/y: ${spacing[0]}/${spacing[1]}`, 10, bottom - 40);
    ctx.fillText(`${modality} (${dimensions.width}x${dimensions.height}) - ${planeName}`, 10, bottom - 20)

    ctx.fillText(`Series: ${this.getTagValue(Tag.SERIES_DESCRIPTION)}`, 10, 20);
    ctx.fillText(`Date: ${this.getTagValue(Tag.SERIES_DATE)}`, 10, 40);
    ctx.fillText(`Patient: ${this.getTagValue(Tag.PATIENT_NAME)}`, 10, 60);
    ctx.fillText(`Patient Sex: ${this.getTagValue(Tag.PATIENT_SEX)}`, 10, 80);
  }

  public getTextureDimensions() {
    return this.editor.getDimensionsForPlane(this.plane);
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
    if (this.currentSlice === this.editor.slicesCountForPlane(this.plane)) {
      this.currentSlice = 0;
    }
    this.currentSlice++;
    this.onChanges.emit(this);
  }

  public changeAxis($event: Event) {
    this.plane = Number(($event.target as HTMLInputElement).value);
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

  changeLut($event: Event) {
    this.lut = this.editor.lookupTables
      .find(lut => lut.name === ($event.target as HTMLInputElement).value)!;
    this.onChanges.emit(this);
  }
}
