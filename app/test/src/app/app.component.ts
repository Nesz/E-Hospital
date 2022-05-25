import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Observable, timer } from "rxjs";
import { HttpClient } from "@angular/common/http";
import * as dicomParser from "dicom-parser"
import { Tag } from "./utilities/tags.constants";
import { CanvasGpu } from "./canvas/canvas-gpu";
import { ShaderService } from "./services/shader.service";
import { CanvasCpu } from "./canvas/canvas-cpu";
import { files } from "./test.suite";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  title = 'test';
  files = files;

  @ViewChild('canvasCPU') canvasCpuRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('canvasGPU') canvasGpuRef!: ElementRef<HTMLCanvasElement>;

  public iprogress = 0;
  public progress = 0;
  public iterations = 1000;
  public canvasGpu!: CanvasGpu;
  public canvasCpu!: CanvasCpu;

  constructor(
    private readonly http: HttpClient,
    private readonly shaderService: ShaderService,
  ) {}

  public ngAfterViewInit() {
    this.canvasGpu = new CanvasGpu({
      canvas: this.canvasGpuRef,
      service: this.shaderService
    });
    this.canvasCpu = new CanvasCpu(this.canvasCpuRef);
  }

  public runTest() {
    // @ts-ignore
    const sleep = ms => new Promise(res => setTimeout(res, ms))
    const windowingData = this.generateRandomWindowingData(this.iterations, 1, 10000);

    setTimeout(async () => {
      console.log("iterations: " + this.iterations)
      Observable.create(async() => {
        for (let f = 0; f < files.length; ++f) {
          const file = files[f];
          const buffer = await this.getDicomStream(file).toPromise();
          const uint8array = new Uint8Array(buffer);
          const dicomStream = dicomParser.parseDicom(uint8array);

          let accumulate = 0;
          this.canvasCpu.changeSource(dicomStream);
          for (let i = 0; i < this.iterations; ++i) {
            const start = Date.now();
            this.canvasCpu.setWindowing(windowingData[i]);
            this.canvasCpu.render();
            const end = Date.now();
            accumulate += end - start
            this.iprogress++;
            await sleep(1);
          }

          const width = dicomStream.int16(Tag.WIDTH);
          const height = dicomStream.int16(Tag.HEIGHT);

          console.log(`${width}x${height};CPU;${accumulate / this.iterations}`)
        }
      }).subscribe();

      Observable.create(async() => {
        for (let f = 0; f < files.length; ++f) {
          const file = files[f];
          const buffer = await this.getDicomStream(file).toPromise();
          const uint8array = new Uint8Array(buffer);
          const dicomStream = dicomParser.parseDicom(uint8array);

          let accumulate = 0;
          this.canvasGpu.changeSource(dicomStream);
          for (let i = 0; i < this.iterations; ++i) {
            const start = Date.now();
            this.canvasGpu.setWindowing(windowingData[i]);
            this.canvasGpu.render();
            const end = Date.now();
            accumulate += end - start
            this.iprogress++;
            await sleep(1);
          }

          const width = dicomStream.int16(Tag.WIDTH);
          const height = dicomStream.int16(Tag.HEIGHT);

          console.log(`${width}x${height};GPU;${accumulate / this.iterations}`)
        }
      }).subscribe();


    }, 1)
  }

  public generateRandomWindowingData = (iterations: number, min: number, max: number) => {
    const windowing = [];
    for (let i = 0; i < iterations; ++i) {
      windowing[i] = [
        this.getRandomInt(min, max),
        this.getRandomInt(min, max)
      ];
    }
    return windowing;
  }

  public getDicomStream(path: string): Observable<ArrayBuffer> {
    return this.http.get(`assets/${path}`, {
        responseType: 'arraybuffer',
    });
  }

  public getRandomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
  }

  changeInput($event: Event) {
    const value = ($event.target as HTMLInputElement).value;
    this.iterations = Number(value);
  }
}
