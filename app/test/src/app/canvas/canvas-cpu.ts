import { ElementRef } from "@angular/core";
import { Camera } from "../utilities/camera";
import { Program } from "../utilities/program";
import { ShaderService } from "../services/shader.service";
import { DicomData, readDicomData } from "../utilities/dicom.data";
import { DataSet } from "dicom-parser";
import { Tag } from "../utilities/tags.constants";

export class CanvasCpu {

  private readonly _context: CanvasRenderingContext2D;
  private readonly _canvasRef: ElementRef<HTMLCanvasElement>;
  private camera: Camera = new Camera();
  private positionBuffer!: WebGLBuffer;
  private dicomData!: DicomData;
  private rawBuffer!: ArrayBuffer;
  private data!: ImageData;
  private texture!: HTMLCanvasElement ;

  constructor(canvas: ElementRef<HTMLCanvasElement>) {
    this._canvasRef = canvas;
    this._context = this._canvasRef.nativeElement.getContext('2d', {
      desynchronized: true,
    })!;
  }

  public changeSource = (dicom: DataSet) => {

    this.dicomData = readDicomData(dicom);
    const pixelDataElement = dicom.elements[Tag.PIXEL_DATA];
    const sliced = dicom.byteArray.buffer.slice(pixelDataElement.dataOffset, pixelDataElement.length)
    this.rawBuffer = sliced;
    this.data = this.getImageData(sliced);
    this.texture = this.imageDataToCanvas(this.data);
    this.calculateAspectRatio({
      width: this._canvasRef.nativeElement.clientWidth,
      height: this._canvasRef.nativeElement.clientHeight
    });
  }

  public render = () => {
    const start = Date.now();
    this.clearCanvas();

    this._context.drawImage(
      this.texture,
      (-this.dicomData.width / 2 + 0.5) | 0,
      (-this.dicomData.height / 2 + 0.5) | 0
    );

    const end = Date.now();
    return end - start;
  };

  calculateAspectRatio = (dimensions: { width: number; height: number }) => {
    const dw = dimensions.width;
    const dh = dimensions.height;

    const scaleX = dw / this.dicomData.width;
    const scaleY = dh / this.dicomData.height;

    this._context.canvas.width = dw;
    this._context.canvas.height = dh;

    const scale = Math.min(scaleX, scaleY);

    this._context.resetTransform();
    this._context.translate((dw / 2 + 0.5) | 0, (dh / 2 + 0.5) | 0);
    this._context.scale(scale, scale);
  };

  clearCanvas = () => {
    this._context.save();
    this._context.setTransform(1, 0, 0, 1, 0, 0);
    this._context.clearRect(0, 0, this._context.canvas.width, this._context.canvas.height);
    this._context.restore();
  };


  private getImageData = (buffer: ArrayBuffer) => {

    const dstBmp = new Uint8ClampedArray(this.dicomData.width * this.dicomData.height * 4);

    //console.log(this.dicomData)
    if (this.dicomData.bitsPerPixel == 16) {
      const view = this.dicomData.pixelRepresentation == 1 ?
        new Int16Array(buffer) :
        new Uint16Array(buffer);

      const min = this.dicomData.wc - this.dicomData.ww / 2;
      const max = this.dicomData.wc + this.dicomData.ww / 2;
      for (let i = 0, j = 0; i < dstBmp.length; i += 4, ++j) {
        let pixel = view[j] * this.dicomData.slope + this.dicomData.intercept;

        if (pixel <= min) pixel = 0;
        else if (pixel > max) pixel = 255;
        else pixel = ((pixel - (this.dicomData.wc - 0.5)) / (this.dicomData.ww - 1) + 0.5) * 255;

        dstBmp[i] = pixel;
        dstBmp[i + 1] = pixel;
        dstBmp[i + 2] = pixel;
        dstBmp[i + 3] = 255;
      }

      return new ImageData(dstBmp, this.dicomData.width, this.dicomData.height);
    }

    if (this.dicomData.bitsPerPixel == 8) {
      const view = this.dicomData.pixelRepresentation == 1 ?
        new Int8Array(buffer) :
        new Uint8Array(buffer);

      const min = this.dicomData.wc - this.dicomData.ww / 2;
      const max = this.dicomData.wc + this.dicomData.ww / 2;
      for (let i = 0, j = 0; i < dstBmp.length; i += 4, ++j) {
        let pixel = view[j] * this.dicomData.slope + this.dicomData.intercept;

        if (pixel <= min) pixel = 0;
        else if (pixel > max) pixel = 255;
        else pixel = ((pixel - (this.dicomData.wc - 0.5)) / (this.dicomData.ww - 1) + 0.5) * 255;

        dstBmp[i] = pixel;
        dstBmp[i + 1] = pixel;
        dstBmp[i + 2] = pixel;
        dstBmp[i + 3] = 255;
      }
      return new ImageData(dstBmp, this.dicomData.width, this.dicomData.height);
    }
    console.log("not supported")
    /*if (bitsPerPixel == 16 && pixelRepresentation == 0) {
      const scale = (windowing.max - windowing.min) / 256;
      for (let i = 0, j = 0; i < dstBmp.length; i += 4, j += 2) {
        const pixelValue = buffer[j] + buffer[j + 1] * 255;
        const displayValue = (pixelValue - windowing.min) / scale;
        dstBmp[i] = displayValue;
        dstBmp[i + 1] = displayValue;
        dstBmp[i + 2] = displayValue;
        dstBmp[i + 3] = 255;
      }
      return new ImageData(dstBmp, entryWidth, entryHeight);
    }
    } else {
      for (let i = 0, j = 0; i < dstBmp.length; i += 4, ++j) {
        dstBmp[i] = buffer[j];
        dstBmp[i + 1] = buffer[j];
        dstBmp[i + 2] = buffer[j];
        dstBmp[i + 3] = 255;
      }
    }*/
    const end = new Date().getMilliseconds();

    return new ImageData(dstBmp, 0, 0);
  };

  private imageDataToCanvas = (data: ImageData): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    canvas.width = data.width;
    canvas.height = data.height;
    context.putImageData(data, 0, 0);
    return canvas;
  };

  setWindowing(windowingDatum: number[]) {
    const [wc, ww] = windowingDatum;
    this.dicomData.wc = wc;
    this.dicomData.ww = ww;
    this.data = this.getImageData(this.rawBuffer);
    this.texture = this.imageDataToCanvas(this.data);
  }
}
