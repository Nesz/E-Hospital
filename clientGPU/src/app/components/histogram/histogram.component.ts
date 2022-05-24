import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild
} from "@angular/core";
import { CanvasPartComponent } from "../canvas-part/canvas-part.component";
import { fastMax, getMinMax } from "../../helpers/canvas.helper";

@Component({
  selector: 'app-histogram',
  templateUrl: './histogram.component.html',
  styleUrls: ['./histogram.component.scss']
})
export class HistogramComponent implements AfterViewInit, OnChanges {
  @ViewChild('histogram') canvas!: ElementRef<HTMLCanvasElement>;
  private context!: CanvasRenderingContext2D;

  constructor(private readonly ref: ElementRef) { }

  @Input() data!: {
    min: number,
    max: number,
    bucketSize: number,
    buckets: number[]
  };

  ngAfterViewInit(): void {
    this.context = this.canvas.nativeElement.getContext('2d')!;
  }

  ngOnChanges(changes: SimpleChanges) {
    this.readPixels();
  }

  public readPixels() {
    // this.render(canvasPart);
    // const gl = this.context;
    // const view = new Uint8Array(512*512 * 4);
    // gl.readPixels(0, 0, 512, 512, gl.RGBA, gl.UNSIGNED_BYTE, view);
    // console.log(view)
    // const buckets = Array(512);
    // for (let i = 0; i < view.length; i +=4) {
    //   const r = view[i + 0];
    //   const g = view[i + 1];
    //   const b = view[i + 2];
    //
    // }

    const data = this.data;
    const ctx = this.context;

    const width = this.canvas.nativeElement.clientWidth;
    const height = this.canvas.nativeElement.clientHeight;

    const histogramXOffset = 50;
    const desiredHistogramWidth = 700;
    const histogramHeight = 750;

    ctx.imageSmoothingEnabled = false;

    ctx.canvas.width = width;
    ctx.canvas.height = height;

    ctx.fillStyle = '#ebecd2';
    ctx.clearRect(0, 0, width, height);
    ctx.fillRect(0, 0, width, height);


    console.log("================================")
    console.log(data.buckets)
    const { max } = getMinMax(data.buckets);
    console.log(max)
    // const bucketWidth = desiredHistogramWidth / (data.buckets.length - 1)
    // const bucketWidth = Math.ceil(desiredHistogramWidth / (data.buckets.length - 1))

    const bucketWidth = (Math.round(((desiredHistogramWidth/ (data.buckets.length - 1))) * 100) / 100)
    let histogramWidth = bucketWidth * (data.buckets.length - 1) + bucketWidth;
    const heightPixelRatio = ((histogramHeight - 50) / max);

    console.log("bucketWidth: " + bucketWidth)
    console.log("histogramWidth: " + histogramWidth)
    const minSpacing = 50;
    let lastLabel = 0;
    for (let i = 0; i < data.buckets.length - 1; ++i) {
      ctx.fillStyle = '#000';
      const x = histogramXOffset + i * bucketWidth;
      // console.log(`bucket: ${i} at x: ${i * bucketWidth}`)
      ctx.fillRect(
        x,
        histogramHeight,
        bucketWidth,
        -data.buckets[i] * heightPixelRatio
      );
      if (x >= lastLabel + minSpacing) {
        console.log('label for bucket: ' + i)
        ctx.font = 'bold 12px Arial';
        ctx.fillStyle = '#000';
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.floor(data.min + i * data.bucketSize)}`,
          x,
          histogramHeight + 20
        );
        lastLabel = x;
      }
    }


    // draw Y axis {
    // ctx.strokeStyle = '#ff6b6b';
    // ctx.beginPath();
    // ctx.moveTo(histogramXOffset, histogramHeight);
    // ctx.lineTo(histogramXOffset, height - histogramHeight);
    // ctx.closePath();
    // ctx.stroke();

    // draw X axis {
    ctx.strokeStyle = '#ff6b6b';
    ctx.beginPath();
    ctx.moveTo(histogramXOffset, histogramHeight);
    ctx.lineTo(histogramXOffset + histogramWidth, histogramHeight);
    ctx.closePath();
    ctx.stroke();


    // console.log(data)
    // const minSpacing = 50;
    // const labelsCount = Math.floor(histogramWidth / minSpacing);
    // // this.drawXLabel(histogramXOffset)
    // ctx.font = 'bold 12px Arial';
    // ctx.fillStyle = '#000';
    // ctx.textAlign = 'center';
    // // ctx.fillText(`${data.min}`, histogramXOffset, histogramHeight + 20);
    // // ctx.fillText(`${data.max}`, histogramWidth, histogramHeight + 20);
    // console.log("bucketWidth: " + bucketWidth)
    // for (let i = 0; i < labelsCount; ++i) {
    //   const x = histogramXOffset + i * minSpacing;
    //   const bucket = Math.floor((i * minSpacing) / bucketWidth);
    //   console.log("bucket: " + bucket)
    //   ctx.fillText(`${Math.floor(data.min + bucket * data.bucketSize)}`, x, histogramHeight + 20);
    // }

  }

  private drawXLabels(x: number) {
    const minDistance = 100;

    const labels = [];

  }


}
