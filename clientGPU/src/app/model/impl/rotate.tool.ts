import { EditorComponent } from '../../components/editor/editor.component';
import { mat3, vec2 } from 'gl-matrix';
import { Camera } from '../camera';
import { CanvasPartComponent } from "../../components/canvas-part/canvas-part.component";
import { Tool } from "../interfaces";

export class RotateTool extends Tool {

  private _startPoint = vec2.create();
  private _dragging = false;
  private canvasSliceIndex = -1;
  private canvasPart!: CanvasPartComponent;
  private startCamera!: Camera;

  public onScroll = (event: WheelEvent) => {};

  public onMouseDown = (event: MouseEvent) => {
    const canvasPart = this.editor.getCanvasPartFromMousePosition(event.clientX, event.clientY);

    if (canvasPart != null) {
      this._dragging = true;
      this.canvasPart = canvasPart.instance;
      this._startPoint = vec2.fromValues(event.clientX, event.clientY);
    }
  };

  public onMouseMove = (event: MouseEvent) => {
    if (this._dragging) {
      event.preventDefault();
      const delta =
        (event.clientX - this._startPoint[0] - (event.clientY - this._startPoint[1])) / 100;
      this._startPoint = vec2.fromValues(event.clientX, event.clientY);

      // compute a matrix to pivot around the camera space startPos
      const camMat = mat3.create();
      //mat3.projection(camMat, editor.context.canvas.width, editor.context.canvas.height);
      const dimensions = this.editor.getDimensionsForOrientation(this.canvasPart.orientation);
      mat3.translate(
        camMat,
        camMat,
        vec2.fromValues(dimensions.width / 2, dimensions.height / 2)
      );
      mat3.rotate(camMat, camMat, delta);
      mat3.translate(
        camMat,
        camMat,
        vec2.fromValues(-dimensions.width / 2, -dimensions.height / 2)
      );

      this.canvasPart.camera.updateViewProjection(
        this.editor.context.canvas.width,
        this.editor.context.canvas.height
      );
      //mat3.translate(camMat, camMat, vec2.fromValues(editor.camera.x, editor.camera.y));

      // multply in the original camera matrix
      this.startCamera = Object.assign({}, this.canvasPart.camera);
      mat3.multiply(camMat, camMat, this.canvasPart.camera.makeCameraMatrix());

      // now we can set the rotation and get the needed
      // camera position from the matrix
      this.canvasPart.camera.rotation = this.startCamera.rotation + delta;
      this.canvasPart.camera.x = camMat[6];
      this.canvasPart.camera.y = camMat[7];

      this.editor.render(this.canvasPart);
    }
  }

  public onMouseUp = (event: MouseEvent) => {
    if (this._dragging) {
      this._dragging = false;
    }
  }
}
