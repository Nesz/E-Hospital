import { RawLutData, Measurement } from "../model/interfaces";
import { vec2 } from "gl-matrix";
import { retry } from "rxjs/operators";

export const loadLUT = (
  gl: WebGL2RenderingContext,
  lutData: RawLutData
): WebGLTexture => {
  // Re-pack as rgb
  const lookupTable = new Uint8Array(256 * 3);
  for (let i = 0; i < 256; ++i) {
    lookupTable[i * 3    ] = lutData.r[i];
    lookupTable[i * 3 + 1] = lutData.g[i];
    lookupTable[i * 3 + 2] = lutData.b[i];
  }

  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  gl.texImage2D(
    gl.TEXTURE_2D,      // target
    0,                  // level
    gl.RGB,             // internalformat
    256,                // width
    1,                  // height
    0,                  // border
    gl.RGB,             // format
    gl.UNSIGNED_BYTE,   // type
    lookupTable         // data
  );

  return texture!;
}

export const generate3DTexture = (args: {
  gl: WebGL2RenderingContext;
  pixelRepresentation: number;
  bitsPerPixel: number;
  buffer: ArrayBuffer;
  sliceThickness: number;
  width: number;
  height: number;
  depth: number;
}): [WebGLTexture, {
  min: number,
  max: number,
  bucketSize: number,
  buckets: number[]
}] => {
  const gl = args.gl;

  const [format, internalFormat, dataType, viewType] = getEnumsFor(
    args.pixelRepresentation,
    args.bitsPerPixel
  );

  const view = getView(args.buffer, viewType);

  const buckets = 64;
  const view2 = new Int16Array(args.buffer, 0, 512 * 512);
  const plot = {
    min: 0,
    max: 0,
    bucketSize: 0,
    buckets: new Array(buckets).fill(0)
  };
  console.log(view2)
  const intercept = -1024;
  const minIntensity = fastMin(view2) + intercept;
  const maxIntensity = fastMax(view2) + intercept;
  const binSize  = (maxIntensity - minIntensity) / buckets;
  console.log("minIntensity: " + minIntensity)
  console.log("maxIntensity: " + maxIntensity)
  console.log("fastMin(view2): " + fastMin(view2))
  console.log("fastMax(view2): " + fastMax(view2))
  console.log(binSize)

  for (let i = 0; i < view2.length; ++i) {
    const intensity = view2[i] + intercept;
    const index = Math.floor((intensity - minIntensity) / binSize);
    plot.buckets[index]++;
  }
  plot.min = minIntensity;
  plot.max = maxIntensity;
  plot.bucketSize = binSize;

  console.log(plot)
  // console.log("plot")
  // for (let i = 0; i < plot.length; ++i) {
  //   console.log(i + " " + plot[i])
  // }






  const texture = gl.createTexture();





  // console.log(view)
  // console.log(fastMin(view))
  // console.log(fastMax(view))

  gl.bindTexture(gl.TEXTURE_3D, texture);

  gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);

  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);

  gl.texImage3D(
    gl.TEXTURE_3D,
    0,
    format,
    args.width,
    args.height,
    args.depth,
    0,
    internalFormat,
    dataType,
    view
  );

  return [texture!, plot];
}

export const getView = (buffer: ArrayBuffer, type: string) => {
  switch (type) {
    case "int16" : return new Int16Array(buffer);
    case "uint16": return new Uint16Array(buffer);
    case "int8"  : return new Int8Array(buffer);
    case "uint8" : return new Uint8Array(buffer);
    default: throw `unknown type '${type}' cannot get view`;
  }
}

export const getEnumsFor = (
  pixelRepresentation: number,
  bitsPerPixel: number
): [GLenum, GLenum, GLenum, string] => {
  if (bitsPerPixel == 16) {
    if (pixelRepresentation == 1)
      return [
        WebGL2RenderingContext.R16F,
        WebGL2RenderingContext.RED,
        WebGL2RenderingContext.FLOAT,
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

export const isInsideBounds = (pos: vec2, width: number, height: number) => {
  return pos[0] <= width && pos[0] >= 0 && pos[1] <= height && pos[1] > 0;
};

export const vecLength = (vector: vec2) => {
  return Math.sqrt(Math.pow(vector[0], 2) + Math.pow(vector[1], 2));
}

export const getAngle = (p1: vec2, p2: vec2, p3: vec2) => {
  const d1 = vec2.subtract(vec2.create(), p1, p2);
  const d2 = vec2.subtract(vec2.create(), p3, p2);
  const a1 = Math.atan2(d1[1], d1[0]);
  const a2 = Math.atan2(d2[1], d2[0]);
  return [
    a1, a2, ((a2 - a1) * 180 / Math.PI + 360) % 360
  ]
}
//
// export const getSide = (spacing: number[], p1: vec2, p2: vec2) => {
//   return vec2.fromValues(
//     (p1[0] - p2[0]) * (spacing?.[0] || 1),
//     (p1[1] - p2[1]) * (spacing?.[1] || 1)
//   );
// }
//
// export const getAngle = (spacing: number[], start: vec2, mid: vec2, end: vec2) => {
//   const sideA = getSide(spacing, mid, start);
//   const sideB = getSide(spacing, end, mid);
//   const sideC = getSide(spacing, end, start);
//
//   const sideALength = vecLength(sideA);
//   const sideBLength = vecLength(sideB);
//   const sideCLength = vecLength(sideC);
//
//   // Cosine law
//   let angle = Math.acos(
//     (Math.pow(sideALength, 2) +
//       Math.pow(sideBLength, 2) -
//       Math.pow(sideCLength, 2)) /
//     (2 * sideALength * sideBLength)
//   );
//
//   angle *= 180 / Math.PI;
//   return angle;
// }

export const toRectangle = (p1: vec2, p2: vec2): [vec2, vec2, vec2, vec2] => {
  const left = Math.min(p1[0], p2[0]);
  const right = Math.max(p1[0], p2[0]);
  const top = Math.min(p1[1], p2[1]);
  const bottom = Math.max(p1[1], p2[1]);
  const width = right - left;
  const height = bottom - top;

  return [
    vec2.fromValues(left, top),
    vec2.fromValues(right, top),
    vec2.fromValues(right, bottom),
    vec2.fromValues(left, bottom),
  ]
}

export const getDistanceMM = (spacing: number[], p1: vec2, p2: vec2) => {
  const dx = (p1[0] - p1[1]) * (spacing?.[0] || 1);
  const dy = (p2[0] - p2[1]) * (spacing?.[1] || 1);
  //const distance = Math.hypot(dx, dy);
  return Math.sqrt(dx * dx + dy * dy);
}



export const getAreaMM = (spacing: number[], p1: vec2, p2: vec2) => {
  const x = Math.abs((p1[0] - p2[0]) * (spacing?.[0] || 1));
  const y = Math.abs((p1[1] - p2[1]) * (spacing?.[1] || 1));
  return x * y;
}


export const degreesToRadians = (degrees: number) => {
  return degrees * Math.PI / 180;
}
export const radiansToDegrees = (radians: number) =>{
  return radians * (180 / Math.PI);
}

function getTheoreticalMin(name: string) {
  switch (name) {
    case 'Int16Array': return -32768;
    case 'Uint16Array': return 0;
    case 'Int8Array': return -128;
    case 'Uint8Array': return 0;
    default: return -1;
  }
}

export function fastMin(
  numbers: any,
  { debug = false, no_data = undefined, theoretical_min = undefined } = {
    debug: false,
    no_data: undefined,
    theoretical_min: undefined,
  }
) {
  if (debug)
    console.log("[fast-min] starting with numbers:", numbers.slice(0, 10));

  if (!numbers.length) {
    if (debug)
      console.error(
        "[fast-min] Instead of an array of numbers, you passed in",
        numbers
      );
    throw new Error("[fast-min] You didn't pass in an array of numbers");
  }
  if (numbers.length === 0)
    throw new Error("[fast-min] You passed in an empty array");

  let min;
  const length = numbers.length;

  if (debug) console.log("[fast-min] constructor:", numbers.constructor.name);

  if (theoretical_min === undefined)
    { // @ts-ignore
      theoretical_min = getTheoreticalMin(numbers.constructor.name);
    }
  if (debug) console.log("[fast-min] theoretical minimunm is", theoretical_min);
  if (theoretical_min) {
    if (no_data !== undefined) {
      min = Infinity;
      for (let i = 0; i < length; i++) {
        const value = numbers[i];
        if (value < min && value !== no_data) {
          min = value;
          if (value === theoretical_min) {
            if (debug)
              console.log(
                "[fast-min] found minimum value of " +
                value +
                " at index " +
                i +
                " of " +
                length
              );
            break;
          }
        }
      }
      if (min === Infinity) min = undefined;
    } else {
      min = numbers[0];
      for (let i = 1; i < length; i++) {
        const value = numbers[i];
        if (value < min) {
          min = value;
          if (value === theoretical_min) {
            if (debug)
              console.log(
                "[fast-min] found minimum value of " +
                value +
                " at index " +
                i +
                " of " +
                length
              );
            break;
          }
        }
      }
    }
  } else {
    if (no_data !== undefined) {
      min = Infinity;
      for (let i = 1; i < length; i++) {
        const value = numbers[i];
        if (value < min && value !== no_data) {
          min = value;
        }
      }
      if (min === Infinity) min = undefined;
    } else {
      min = numbers[0];
      for (let i = 1; i < length; i++) {
        const value = numbers[i];
        if (value < min) {
          min = value;
        }
      }
    }
  }

  if (debug) console.log("[fast-min] returning", min);
  return min;
};

function getTheoreticalMax(name: string) {
  switch (name) {
    case 'Int16Array': return 32767;
    case 'Uint16Array': return 65535;
    case 'Int8Array': return 127;
    case 'Uint8Array': return 255;
    default: return -1;
  }
}

export function fastMax(
  numbers: any,
  { debug = false, no_data = undefined, theoretical_max = undefined } = {
    debug: false,
    no_data: undefined,
    theoretical_max: undefined,
  }
) {
  if (debug) console.log("[fast-max] starting with numbers:", numbers.slice(0, 10));

  if (!numbers.length) {
    if (debug) console.error("[fast-max] Instead of an array of numbers, you passed in", numbers);
    throw new Error("[fast-max] You didn't pass in an array of numbers");
  }
  if (numbers.length === 0) throw new Error("[fast-max] You passed in an empty array");

  let max;
  const length = numbers.length;

  if (debug) console.log("[fast-max] constructor:", numbers.constructor.name);

  if (theoretical_max === undefined) { // @ts-ignore
    theoretical_max = getTheoreticalMax(numbers.constructor.name);
  }

  if (debug) console.log("[fast-max] theoretical maximunm is", theoretical_max);
  if (theoretical_max) {
    if (no_data !== undefined) {
      max = -Infinity;
      for (let i = 1; i < length; i++) {
        const value = numbers[i];
        if (value > max && value !== no_data) {
          max = value;
          // @ts-ignore
          if (value >= theoretical_max) {
            if (debug) console.log("[fast-max] found maximum value of " + value + " at index " + i + " of " + length);
            break;
          }
        }
      }
      if (max === -Infinity) max = undefined;
    } else {
      max = numbers[0];
      for (let i = 1; i < length; i++) {
        const value = numbers[i];
        if (value > max) {
          max = value;
          // @ts-ignore
          if (value >= theoretical_max) {
            if (debug) console.log("[fast-max] found maximum value of " + value + " at index " + i + " of " + length);
            break;
          }
        }
      }
    }
  } else {
    if (no_data !== undefined) {
      max = -Infinity;
      for (let i = 0; i < length; i++) {
        const value = numbers[i];
        if (value > max && value !== no_data) {
          max = value;
        }
      }
      if (max === -Infinity) max = undefined;
    } else {
      max = numbers[0];
      for (let i = 1; i < length; i++) {
        const value = numbers[i];
        if (value > max) {
          max = value;
        }
      }
    }
  }

  if (debug) console.log("[fast-max] returning", max);
  return max;
};
