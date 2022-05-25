import { mat3, vec2 } from 'gl-matrix';

export class Camera {
  viewProjectionMat: mat3;
  x: number;
  y: number;
  zoom: number;
  rotation: number;

  constructor() {
    this.x = 0;
    this.y = 0;
    this.zoom = 1;
    this.rotation = 0;
    this.viewProjectionMat = mat3.create();
  }

  public makeCameraMatrix() {
    const zoomScale = 1 / this.zoom;
    const cameraMat = mat3.create();
    const translate = vec2.fromValues(this.x, this.y);
    const scale = vec2.fromValues(zoomScale, zoomScale);
    mat3.translate(cameraMat, cameraMat, translate);
    mat3.rotate(cameraMat, cameraMat, this.rotation);
    mat3.scale(cameraMat, cameraMat, scale);
    return cameraMat;
  }

  public updateViewProjection(width: number, height: number) {
    // same as ortho(0, width, height, 0, -1, 1)
    const projectionMat = mat3.create();
    mat3.projection(projectionMat, width, height);

    const cameraMat = this.makeCameraMatrix();
    const viewMat = mat3.create();
    mat3.invert(viewMat, cameraMat);

    mat3.multiply(this.viewProjectionMat, projectionMat, viewMat);
  }

  public rotateAroundCenter() {
    // mat3.translate(
    //   camMat,
    //   camMat,
    //   vec2.fromValues(dimensions.width / 2, dimensions.height / 2)
    // );
    // mat3.rotate(camMat, camMat, delta);
    // mat3.translate(
    //   camMat,
    //   camMat,
    //   vec2.fromValues(-dimensions.width / 2, -dimensions.height / 2)
    // );

  }

  private degToRad(deg: number): number {
    return deg * Math.PI / 180;
  }
}
