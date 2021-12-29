export interface Orientations {
  x: {
    width: number;
    height: number;
    slices: WebGLTexture[];
  };
  y: {
    width: number;
    height: number;
    slices: WebGLTexture[];
  };
  z: {
    width: number;
    height: number;
    slices: WebGLTexture[];
  };
}

export class Orientations {
  public static readonly DEFAULT: Orientations = {
    x: {
      width: 0,
      height: 0,
      slices: [],
    },
    y: {
      width: 0,
      height: 0,
      slices: [],
    },
    z: {
      width: 0,
      height: 0,
      slices: [],
    },
  };
}
