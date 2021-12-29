import { Dicom } from '../model/dicom';
import { Tag } from '../tag';
import { Windowing } from '../model/windowing';
import { Shape, ShapeType } from '../model/shape';

export const base64ToUint8ArrayBuffer = (base64: string) => {
  const binary_string = window.atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes;
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

  if (bitsPerPixel == 16) {
    const view = pixelRepresentation == 1 ? new Int16Array(buffer) : new Uint16Array(buffer);
    for (let i = 0, j = 0; i < dstBmp.length; i += 4, ++j) {
      let pixel = view[j] * slope + intercept;

      if (pixel <= windowing.min) pixel = 0;
      else if (pixel > windowing.max) pixel = 255;
      else pixel = ((pixel - (windowing.wc - 0.5)) / (windowing.ww - 1) + 0.5) * 255;

      dstBmp[i] = pixel;
      dstBmp[i + 1] = pixel;
      dstBmp[i + 2] = pixel;
      dstBmp[i + 3] = 255;
    }
    return new ImageData(dstBmp, entryWidth, entryHeight);
  }

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

  return new ImageData(dstBmp, entryWidth, entryHeight);
};

export const imageDataToCanvas = (data: ImageData): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d')!;
  canvas.width = data.width;
  canvas.height = data.height;
  context.putImageData(data, 0, 0);
  return canvas;
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

export const isNearBounds = (args: {
  clientX: number;
  clientY: number;
  x: number;
  y: number;
  width: number;
  height: number;
  offset: number;
}) => {
  const rightX = args.x + args.width;
  const bottomY = args.y + args.height;
  const dx = Math.max(args.x - args.clientX, 0, args.clientX - rightX);
  const dy = Math.max(args.y - args.clientY, 0, args.clientY - bottomY);
  let dist = Math.sqrt(dx * dx + dy * dy);
  if (dist == 0) {
    dist = Math.min(
      args.clientX - args.x,
      args.clientY - args.y,
      rightX - args.clientX,
      bottomY - args.clientY
    );
  }
  return dist <= args.offset;
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
