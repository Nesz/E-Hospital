import { mat3, vec2 } from 'gl-matrix';
import { CanvasPartComponent } from "../../components/canvas-part/canvas-part.component";
import { Tool } from "../interfaces";

const minZoom = 0.25;
const maxZoom = 20;

export class ZoomTool extends Tool {
  private startPos = vec2.create();
  private startClip = vec2.create();
  private startCssY = 0;
  private lastY = 0;

  private _dragging = false;

  private canvasPart!: CanvasPartComponent;

  onScroll = (event: WheelEvent) => {};

  public onMouseDown = (event: MouseEvent) => {
    const canvasPart = this.editor.getCanvasPartFromMousePosition(event.clientX, event.clientY);

    if (canvasPart != null) {
      this._dragging = true;
      this.canvasPart = canvasPart.instance;
      const bbox = this.canvasPart.canvas?.nativeElement.getBoundingClientRect()!;

      const inverted = mat3.create();
      mat3.invert(inverted, this.canvasPart.camera.viewProjectionMat);

      this.startClip = this.editor.getClipSpaceMousePositionVec2(event.clientX, event.clientY, bbox);
      vec2.transformMat3(this.startPos, this.startClip, inverted);

      this.startCssY = event.clientY;
      this.lastY = this.startClip[1];
    }
  };

  public onMouseMove(event: MouseEvent) {
    event.preventDefault();
    if (this._dragging) {
      const bbox = this.canvasPart.canvas?.nativeElement.getBoundingClientRect()!;

      const currPos = this.editor.getClipSpaceMousePositionVec2(event.clientX, event.clientY, bbox);

      const zoom = currPos[1] - this.lastY;
      const factor = Math.pow(10, zoom);
      this.lastY = currPos[1];
      this.canvasPart.camera.zoom *= factor;
      this.canvasPart.camera.zoom = Math.min(maxZoom, this.canvasPart.camera.zoom);
      this.canvasPart.camera.zoom = Math.max(minZoom, this.canvasPart.camera.zoom);

      this.canvasPart.camera.updateViewProjection(bbox.width, bbox.height);

      const inverted = mat3.create();
      mat3.invert(inverted, this.canvasPart.camera.viewProjectionMat);

      const postZoom = vec2.create();
      vec2.transformMat3(postZoom, this.startClip, inverted);

      // camera needs to be moved the difference of before and after
      this.canvasPart.camera.x += this.startPos[0] - postZoom[0];
      this.canvasPart.camera.y += this.startPos[1] - postZoom[1];

      this.editor.render(this.canvasPart);
    }
  }

  public onMouseUp(event: MouseEvent) {
    if (this._dragging) {
      this._dragging = false;
    }
  }
}
