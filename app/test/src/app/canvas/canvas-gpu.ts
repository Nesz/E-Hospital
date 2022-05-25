import { tap } from "rxjs/operators";
import { Program } from "../utilities/program";
import { ShaderService } from "../services/shader.service";
import { forkJoin } from "rxjs";
import { ElementRef } from "@angular/core";
import { Tag } from "../utilities/tags.constants";
import { DataSet } from "dicom-parser";
import { Camera } from "../utilities/camera";
import { generateTextures } from "../utilities/canvas.helper";
import { DicomData, readDicomData } from "../utilities/dicom.data";

export class CanvasGpu {

  private readonly _context: WebGL2RenderingContext;
  private readonly _canvasRef: ElementRef<HTMLCanvasElement>;
  private camera: Camera = new Camera();
  private positionBuffer!: WebGLBuffer;
  private texCoordBuffer!: WebGLBuffer;
  private texCoordLocation!: number;
  private positionLocation!: number;
  private signedPixelProgram!: Program;
  private unsignedPixelProgram!: Program;
  private texture!: WebGLTexture;
  private dicomData!: DicomData;

  constructor(args: {
    canvas: ElementRef<HTMLCanvasElement>,
    service: ShaderService,
  }) {
    this._canvasRef = args.canvas;
    this._context = args.canvas.nativeElement.getContext('webgl2', {
      desynchronized: true,
      preserveDrawingBuffer: true
    })!;

    this.initBuffers();
    this.createPrograms(args.service);
  }

  public changeSource = (dicom: DataSet) => {
    this._context.canvas.width = this._canvasRef.nativeElement.clientWidth;
    this._context.canvas.height = this._canvasRef.nativeElement.clientHeight;


    this.dicomData = readDicomData(dicom);
    this.setupProgramForType(this.dicomData.pixelRepresentation)

    this.texture = generateTextures({
      gl: this._context,
      pixelRepresentation: this.dicomData.pixelRepresentation,
      bitsPerPixel: this.dicomData.bitsPerPixel,
      //buffers: pixelData,
      width: this.dicomData.width,
      height: this.dicomData.height,
      dicom: dicom
    })
    this.setScalingAndPosition();



  }

  public render = (): number => {
    const start = Date.now();
    const gl = this._context;
    const program = this.dicomData.pixelRepresentation === 0 ? this.unsignedPixelProgram : this.signedPixelProgram;
    const canvas = this._canvasRef.nativeElement.getBoundingClientRect();
    const { width, height, x, y } = this.getCanvasSliceBBox(canvas);

    //this.camera.x += this.getRandomInt(-10, 10);
    //this.camera.y += this.getRandomInt(-10, 10);
    this.camera.updateViewProjection(width, height);
    gl.enable(gl.SCISSOR_TEST);
    gl.viewport(0, 0, width, height);
    gl.scissor(0, 0, width, height);
    gl.clearColor(0, 0, 0, 1);
    gl.useProgram(program.gl);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
    gl.vertexAttribPointer(this.texCoordLocation, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.vertexAttribPointer(this.positionLocation, 2, gl.FLOAT, false, 0, 0);

    const uniforms = {
      u_matrix: this.camera.viewProjectionMat,
      wc: this.dicomData.wc,
      ww: this.dicomData.ww,
      slope: this.dicomData.slope,
      intercept:this.dicomData.intercept,
    };

    program.assignUniforms(gl, uniforms);

    this.updateRectangle(this.dicomData.width, this.dicomData.height);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    gl.useProgram(program.gl);

    const end = Date.now();
    return end-start;
  }

  private setScalingAndPosition = () => {
    const bbox = this._canvasRef?.nativeElement?.getBoundingClientRect();
    if (bbox) {
      const [scale, offX, offY] = this.calculateAspectRatio({
        width: bbox.width,
        height: bbox.height,
        elWidth: this.dicomData.width,
        elHeight: this.dicomData.height,
      });

      this.camera.zoom = scale;
      this.camera.x = -offX;
      this.camera.y = -offY;
    }
  }

  private calculateAspectRatio = (dimensions: {
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

  private createPrograms = (shaderService: ShaderService) => {
    const [fragUnsigned, vertUnsigned] = shaderService.matchShadersFor(0);
    const [fragSigned, vertSigned] = shaderService.matchShadersFor(1);

    const $unsignedProgram = shaderService.createProgramFromAssets(this._context, vertUnsigned, fragUnsigned);
    const $signedProgram = shaderService.createProgramFromAssets(this._context, vertSigned, fragSigned);

    return forkJoin([$unsignedProgram, $signedProgram])
      .pipe(tap(([unsignedProgram, signedProgram]) => {
          this.unsignedPixelProgram = new Program(unsignedProgram[0], unsignedProgram[1]);
          this.signedPixelProgram = new Program(signedProgram[0], signedProgram[1]);
        })
      ).subscribe()
  };

  private setupProgramForType = (pixelRepresentation: number) => {
    const gl = this._context;
    const program = pixelRepresentation === 0 ? this.unsignedPixelProgram : this.signedPixelProgram;

    this.texCoordLocation = gl.getAttribLocation(program.gl, 'a_texCoord');
    this.positionLocation = gl.getAttribLocation(program.gl, 'a_position');
    gl.enableVertexAttribArray(this.texCoordLocation);
    gl.enableVertexAttribArray(this.positionLocation);
  }

  private initBuffers = () => {
    const gl = this._context;
    this.positionBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 0.0, 0.0]),
      gl.STATIC_DRAW
    );

    this.texCoordBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 0.0, 0.0]),
      gl.STATIC_DRAW
    );
  };

  updateRectangle = (width: number, height: number) => {
    const gl = this._context;
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([width, height, 0, height, width, 0, 0, 0]),
      gl.STATIC_DRAW
    );
  };

  getCanvasSliceBBox = (canvas: DOMRect) => {
    return {
      x: canvas.left,
      y: canvas.bottom,
      width: canvas.width,
      height: canvas.height,
    }
  }

  setWindowing(windowingDatum: number[]) {
    const [wc, ww] = windowingDatum;
    this.dicomData.wc = wc;
    this.dicomData.ww = ww;
  }
}
