import { Dicom } from '../model/dicom';
import { Tag } from '../tag';
import { Windowing } from '../model/windowing';
import { Shape, ShapeType } from '../model/shape';
import { ProgressRingComponent } from '../components/progress-ring/progress-ring.component';
import { Orientations } from '../model/orientations.model';

export const base64ToUint8ArrayBuffer = (base64: string) => {
  const binary_string = window.atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes;
};

export const generateTextures = (args: {
  gl: WebGL2RenderingContext;
  pixelRepresentation: number;
  bitsPerPixel: number;
  buffers: ArrayBuffer[];
  sliceThickness: number;
  width: number;
  height: number;
}) => {
  const [format, internalFormat, dataType, viewType] = getEnumsFor(
    args.pixelRepresentation,
    args.bitsPerPixel
  );

  const response = Orientations.DEFAULT();

  response.z.width = args.width | 0;
  response.z.height = args.height | 0;
  response.y.width = args.height | 0;
  response.y.height = (args.buffers.length * args.sliceThickness) | 0;
  response.x.width = args.width | 0;
  response.x.height = (args.buffers.length * args.sliceThickness) | 0;

  /* z slices */
  for (const buffer of args.buffers) {
    const view = getView(buffer, viewType);
    const texture = generateTexture({
      gl: args.gl,
      format: format,
      internalFormat: internalFormat,
      dataType: dataType,
      view: view,
      width: args.width,
      height: args.height,
    })!;
    response.z.slices.push(texture);
  }

  /* y slices */
  for (let x = 0; x < args.width; ++x) {
    const tempBuffer = allocBufferView(viewType, args.width * args.buffers.length * 2);
    let offset = 0;
    for (let fi = 0; fi < args.buffers.length; ++fi) {
      const view = getView(args.buffers[fi], viewType);
      for (let y = 0; y < args.height; ++y) {
        tempBuffer[offset++] = view[y + args.width * x];
      }
    }

    const texture = generateTexture({
      gl: args.gl,
      format: format,
      internalFormat: internalFormat,
      dataType: dataType,
      view: tempBuffer,
      width: args.width,
      height: args.buffers.length,
    })!;
    response.y.slices.push(texture);
  }

  /* x slices */
  for (let x = 0; x < args.width; ++x) {
    const tempBuffer = allocBufferView(viewType, args.width * args.buffers.length * 2);
    let offset = 0;
    for (let fi = 0; fi < args.buffers.length; ++fi) {
      const view = getView(args.buffers[fi], viewType);
      for (let y = 0; y < args.height; ++y) {
        tempBuffer[offset++] = view[x + args.width * y];
      }
    }

    const texture = generateTexture({
      gl: args.gl,
      format: format,
      internalFormat: internalFormat,
      dataType: dataType,
      view: tempBuffer,
      width: args.width,
      height: args.buffers.length,
    })!;
    response.x.slices.push(texture);
  }

  return response;
};

export const allocBufferView = (type: string, size: number) => {
  if (type === 'int16') {
    return new Int16Array(size);
  }
  throw '';
};

export const getView = (buffer: ArrayBuffer, type: string) => {
  if (type === 'int16') {
    return new Int16Array(buffer);
  }
  throw '';
};

export const executeAsync = (func: () => void) => {
  setTimeout(func, 0);
};
export const generateTexture = (args: {
  gl: WebGL2RenderingContext;
  format: number;
  internalFormat: GLenum;
  dataType: GLenum;
  view: ArrayBufferView;
  width: number;
  height: number;
}) => {
  const gl = args.gl;

  // GL texture configuration
  const texture = gl.createTexture();

  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);

  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    args.format,
    //format,
    args.width,
    args.height,
    0,
    args.internalFormat,
    args.dataType,
    args.view
  );
  //gl.texImage2D(gl.TEXTURE_2D, 0, gl.R16UI, width, height, 0, gl.RED_INTEGER, gl.SHORT, image);

  return texture;
};

export const getEnumsFor = (
  pixelRepresentation: number,
  bitsPerPixel: number
): [number, GLenum, GLenum, string] => {
  if (bitsPerPixel == 16) {
    if (pixelRepresentation == 1)
      return [
        WebGL2RenderingContext.R16I,
        WebGL2RenderingContext.RED_INTEGER,
        WebGL2RenderingContext.SHORT,
        'int16',
      ];
    if (pixelRepresentation == 0)
      return [
        WebGL2RenderingContext.R16UI,
        WebGL2RenderingContext.RED_INTEGER,
        WebGL2RenderingContext.UNSIGNED_SHORT,
        'uint16',
      ];
  }
  if (bitsPerPixel == 8) {
    if (pixelRepresentation == 1)
      return [
        WebGL2RenderingContext.R8I,
        WebGL2RenderingContext.RED_INTEGER,
        WebGL2RenderingContext.UNSIGNED_BYTE,
        'int8',
      ];
    if (pixelRepresentation == 0)
      return [
        WebGL2RenderingContext.R8UI,
        WebGL2RenderingContext.RED_INTEGER,
        WebGL2RenderingContext.UNSIGNED_BYTE,
        'uint8',
      ];
  }
  throw '';
};

export const storedPixelDataToImageData = (image: Int16Array, width: number, height: number) => {
  const pixelData = image;
  const numberOfChannels = 3;
  const data = new Uint8Array(width * height * numberOfChannels);
  let offset = 0;

  for (let i = 0; i < pixelData.length; i++) {
    const val = Math.abs(pixelData[i]);

    data[offset++] = val & 0xff;
    data[offset++] = val >> 8;
    data[offset++] = pixelData[i] < 0 ? 0 : 1; // 0 For negative, 1 for positive
  }
  return data;
};

export const touf9 = (dicom: Dicom, buffer: ArrayBuffer) => {
  const pixelRepresentation = dicom.getValue(Tag.PIXEL_REPRESENTATION).asNumber();
  const bitsPerPixel = dicom.getValue(Tag.BITS_PER_PIXEL).asNumber();
  const height = dicom.getValue(Tag.HEIGHT).asNumber();
  const width = dicom.getValue(Tag.WIDTH).asNumber();

  if (bitsPerPixel == 16) {
    if (pixelRepresentation == 1) {
      const numberOfChannels = 3;
      const view = new Int16Array(buffer);
      const data = new Uint8Array(width * height * numberOfChannels);
      let offset = 0;

      for (let i = 0; i < view.length; i++) {
        const val = Math.abs(view[i]);

        data[offset++] = val & 0xff;
        data[offset++] = val >> 8;
        data[offset++] = view[i] < 0 ? 0 : 1; // 0 For negative, 1 for positive
      }

      return ['int16', WebGLRenderingContext.RGB, data];
    }

    if (pixelRepresentation == 0) {
      const numberOfChannels = 2;
      const view = new Uint16Array(buffer);
      const data = new Uint8Array(width * height * numberOfChannels);
      let offset = 0;

      for (let i = 0; i < view.length; i++) {
        const val = view[i];

        data[offset++] = val & 0xff;
        data[offset++] = val >> 8;
      }

      return ['uint16', WebGLRenderingContext.RGB, data];
    }
  }

  if (bitsPerPixel == 8) {
    if (pixelRepresentation == 1) {
    }
  }

  return null;
};

export const getImageData = (dicom: Dicom, windowing: Windowing, buffer: ArrayBuffer) => {
  const pixelRepresentation = dicom.getValue(Tag.PIXEL_REPRESENTATION).asNumber();
  const transferSyntax = dicom.getValue(Tag.TRANSFER_SYNTAX).asString();
  const entryWidth = dicom.getValue(Tag.WIDTH).asNumber();
  const entryHeight = dicom.getValue(Tag.HEIGHT).asNumber();
  const bitsPerPixel = dicom.getValue(Tag.BITS_PER_PIXEL).asNumber();
  const bitsStored = dicom.getValue(Tag.BITS_STORED).asNumber();
  const slope = dicom.getValue(Tag.SLOPE).asNumber();
  const intercept = dicom.getValue(Tag.INTERCEPT).asNumber();

  const start = new Date().getMilliseconds();
  const dstBmp = new Uint8ClampedArray(entryWidth * entryHeight * 4);

  return new ImageData(dstBmp, entryWidth, entryHeight);
};

export const isInsideBoundsBBox = (x: number, y: number, bbox: DOMRect) => {
  return x > bbox.x && x < bbox.x + bbox.width && y > bbox.y && y < bbox.y + bbox.height;
};

export const isInsideBounds = (args: {
  x: number;
  y: number;
  boundX: number;
  boundY: number;
  width: number;
  height: number;
}) => {
  return (
    args.x > args.boundX &&
    args.x < args.boundX + args.width &&
    args.y > args.boundY &&
    args.y < args.boundY + args.height
  );
};

export enum Side {
  LEFT_TOP,
  LEFT_BOT,
  RIGHT_TOP,
  RIGHT_BOT,
}
export const isAtPoint = (args: {
  clientX: number;
  clientY: number;
  radius: number;
  shape: Shape;
}) => {
  const dots = [
    [args.shape.x, args.shape.y, Side.LEFT_TOP], // left top
    [args.shape.x, args.shape.y + args.shape.h, Side.LEFT_BOT], // left bot
    [args.shape.x + args.shape.w, args.shape.y, Side.RIGHT_TOP], // right top
    [args.shape.x + args.shape.w, args.shape.y + args.shape.h, Side.RIGHT_BOT], // right bot
  ];

  for (const dot of dots) {
    const [x, y, side] = dot;
    const distanceSquared =
      (args.clientX - x) * (args.clientX - x) + (args.clientY - y) * (args.clientY - y);
    if (distanceSquared <= args.radius * args.radius) {
      return [x, y, side];
    }
  }
  return null;
};

export const orientShape = (shape: Shape) => {
  const px = Math.min(shape.x, shape.x + shape.w);
  const py = Math.min(shape.y, shape.y + shape.h);

  shape.x = px;
  shape.y = py;
  shape.w = Math.abs(shape.w);
  shape.h = Math.abs(shape.h);
};
