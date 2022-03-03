import { Orientations } from '../model/orientations.model';

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
  if (type === 'uint16') {
    return new Uint16Array(size);
  }
  throw `unknown type '${type}' cannot allocate buffer`;
};

export const getView = (buffer: ArrayBuffer, type: string) => {
  if (type === 'int16') {
    return new Int16Array(buffer);
  }
  if (type === 'uint16') {
    return new Uint16Array(buffer);
  }
  throw `unknown type '${type}' cannot get view`;
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
  throw `Unknown or not supported configuration BPP: '${bitsPerPixel}', PR: '${pixelRepresentation}'`;
};

export const isInsideBoundsBBox = (x: number, y: number, bbox: DOMRect) => {
  return x > bbox.x && x < bbox.x + bbox.width && y > bbox.y && y < bbox.y + bbox.height;
};
