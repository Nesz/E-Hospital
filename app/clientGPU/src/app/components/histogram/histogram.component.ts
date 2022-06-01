import {
  AfterViewInit,
  Component,
  ElementRef,
  forwardRef,
  Inject,
  OnChanges,
  SimpleChanges,
  ViewChild
} from "@angular/core";
import { getMinMax } from "../../helpers/canvas.helper";
import { EditorComponent } from "../editor/editor.component";
import { GPU } from "gpu.js";

@Component({
  selector: 'app-histogram',
  templateUrl: './histogram.component.html',
  styleUrls: ['./histogram.component.scss']
})
export class HistogramComponent implements AfterViewInit {
  @ViewChild('histogram') canvas!: ElementRef<HTMLCanvasElement>;
  private context!: CanvasRenderingContext2D;
  public buckets: number = 64;

  constructor(@Inject(forwardRef(() => EditorComponent)) public readonly editor: EditorComponent) { }

  ngAfterViewInit(): void {
    this.context = this.canvas.nativeElement.getContext('2d')!;
    this.drawHistogram();
  }

  public onBucketChange($event: Event) {
    this.buckets = Number(($event.target as HTMLInputElement).value);
    this.drawHistogram();
  }

  public plotBuckets(pixels: Float32Array, buckets: number) {
    const { min, max } = getMinMax(pixels);
    console.log(min, max)
    const bucketSize  = (max - min) / buckets;
    const bucketsList = new Array(buckets).fill(0)

    for (let i = 0; i < pixels.length; ++i) {
      const pixel = pixels[i];
      const index = Math.floor((pixel - min) / bucketSize);
      bucketsList[index]++;
    }

    return {
      min: min,
      max: max,
      bucketSize: bucketSize,
      buckets: bucketsList
    };
  }


  public drawHistogram() {
    const data = this.plotBuckets(this.editor.readCurrentSlicePixelsForPlane(), this.buckets);

    const ctx = this.context;

    if (!ctx) {
      return;
    }

    const clamp = (num: number, min: number, max: number) => Math.min(Math.max(num, min), max);
    const { wc, ww } = this.editor.currentCanvas.windowing;
    const colors = [];
    for (let i = 0; i < data.buckets.length - 1; ++i) {
      // color = (color - (u_wc - 0.5)) / (max(u_ww, 1.0)) + 0.5;
      // color = clamp(color, 0.0, 1.0);
      const intensityMin = data.min + i * data.bucketSize;
      const intensityMax = data.max + i * (data.bucketSize + 1);
      const intensityAvg = (intensityMin + intensityMax) / 2;

      let color = (intensityMin - (wc - 0.5)) / (Math.max(ww, 1.0)) + 0.5;
      color = Math.round(clamp(color, 0.0, 1.0) * 255);
      const inverted = this.editor.currentCanvas.isInverted;
      if (!inverted)
        colors.push(
          [
            this.editor.currentCanvas.lut.r[color],
            this.editor.currentCanvas.lut.g[color],
            this.editor.currentCanvas.lut.b[color]
          ]
        )
      else
        colors.push(
          [
            255 - this.editor.currentCanvas.lut.r[color],
            255 - this.editor.currentCanvas.lut.g[color],
            255 - this.editor.currentCanvas.lut.b[color]
          ]
        )
    }


    const width = this.canvas.nativeElement.clientWidth;
    const height = this.canvas.nativeElement.clientHeight;

    const histogramXOffset = 50;
    const desiredHistogramWidth = width - 100;
    const histogramHeight = height - 100;

    ctx.imageSmoothingEnabled = false;

    ctx.canvas.width = width;
    ctx.canvas.height = height;

    ctx.fillStyle = '#ebecd2';
    ctx.clearRect(0, 0, width, height);
    ctx.fillRect(0, 0, width, height);


    const { max } = getMinMax(data.buckets);
    // const bucketWidth = desiredHistogramWidth / (data.buckets.length - 1)
    // const bucketWidth = Math.ceil(desiredHistogramWidth / (data.buckets.length - 1))

    const bucketWidth = desiredHistogramWidth / (data.buckets.length - 1)
    let histogramWidth = bucketWidth * (data.buckets.length - 1) + bucketWidth;


    const heightPixelRatio = ((histogramHeight - 50) / max);

    const minSpacing = 50;
    let lastLabel = 0;

    for (let i = 0; i < data.buckets.length - 1; ++i) {
      ctx.fillStyle = `rgb(${colors[i][0]}, ${colors[i][1]}, ${colors[i][2]})`;
      const x = histogramXOffset + i * bucketWidth;
      ctx.fillRect(x, histogramHeight, bucketWidth + 0.5, -data.buckets[i] * heightPixelRatio);
      ctx.fillRect(x, histogramHeight + 20, bucketWidth + 0.5, 20);
      if (x >= lastLabel + minSpacing) {
        ctx.font = 'bold 12px Arial';
        ctx.fillStyle = '#000';
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.floor(data.min + i * data.bucketSize)}`, x, histogramHeight + 60);
        lastLabel = x;
      }
    }

  }

}
