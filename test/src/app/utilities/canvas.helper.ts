import { DataSet } from "dicom-parser";
import { Tag } from "./tags.constants";

export const generateTextures = (args: {
  gl: WebGL2RenderingContext;
  pixelRepresentation: number;
  bitsPerPixel: number;
  //buffers: ArrayBuffer;
  width: number;
  height: number;
  dicom: DataSet;
}) => {
  const [format, internalFormat, dataType, viewType] = getEnumsFor(
    args.pixelRepresentation,
    args.bitsPerPixel
  );

  const pixelDataElement = args.dicom.elements[Tag.PIXEL_DATA];

  let offset = pixelDataElement.dataOffset;
  let length = pixelDataElement.length;
  /*if (!!pixelDataElement.fragments) {
    const fragment = pixelDataElement.fragments[0];
    offset = pixelDataElement.dataOffset + fragment.offset;
    length = fragment.length;
  }*/


  const view = getView(args.dicom.byteArray.buffer, viewType, offset, length);

  return  generateTexture({
    gl: args.gl,
    format: format,
    internalFormat: internalFormat,
    dataType: dataType,
    view: view,
    width: args.width,
    height: args.height,
  })!;
};

export const getView = (buffer: ArrayBuffer, type: string, offset: number, length: number) => {
  if (type === 'int16') {
    return new Int16Array(buffer, offset, length / 2);
  }
  if (type === 'uint16') {
    return new Uint16Array(buffer, offset, length / 2);
  }
  if (type === 'uint8') {
    return new Uint8Array(buffer, offset, length );
  }
  throw `unknown type '${type}' cannot get view`;
};

const generateTexture = (args: {
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
  throw `Unknown or not supported configuration BPP: '${bitsPerPixel}', PR: '${pixelRepresentation}'`;
};
