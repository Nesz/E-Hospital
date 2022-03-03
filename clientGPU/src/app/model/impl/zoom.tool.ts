import { EditorComponent } from '../../components/editor/editor.component';
import { mat3, vec2 } from 'gl-matrix';
import { CanvasPartComponent } from "../../components/canvas-part/canvas-part.component";
import { Tool } from "../interfaces";

export class ZoomTool implements Tool {
  private readonly minZoom = 0.25;
  private readonly maxZoom = 20;

  public readonly toolIcon = 'zoom';
  public readonly toolName = 'Zoom';
  public readonly extraOptions = [];

  private startPos = vec2.create();
  private startClip = vec2.create();
  private startCssY = 0;
  private lastY = 0;

  private _dragging = false;

  private canvasPart!: CanvasPartComponent;

  onExtraOption = (index: number, editor: EditorComponent) => {};
  onScroll = (event: WheelEvent, editor: EditorComponent) => {
    /*const clip = editor.getClipSpaceMousePositionVec2(event.clientX, event.clientY);

    // position before zooming
    const inverted1 = mat3.create();
    mat3.invert(inverted1, editor.camera.viewProjectionMat);

    const preZoom = vec2.create();
    vec2.transformMat3(preZoom, clip, inverted1);

    // multiply the wheel movement by the current zoom level
    // so we zoom less when zoomed in and more when zoomed out
    const newZoom = editor.camera.zoom * Math.pow(2, event.deltaY * -0.01);
    editor.camera.zoom = Math.max(0.02, Math.min(100, newZoom));
    console.log(editor.camera.zoom);

    editor.camera.updateViewProjection(editor.context.canvas.width, editor.context.canvas.height);

    // position after zooming
    const postZoom = vec2.create();
    const inverted2 = mat3.create();
    mat3.invert(inverted2, editor.camera.viewProjectionMat);
    vec2.transformMat3(postZoom, clip, inverted2);
    // camera needs to be moved the difference of before and after
    editor.camera.x += preZoom[0] - postZoom[0];
    editor.camera.y += preZoom[1] - postZoom[1];
    editor.renderQuad();*/
  };

  onMouseDown = (event: MouseEvent, editor: EditorComponent) => {
    const canvasPart = editor.getCanvasPartFromMousePosition(
      event.clientX,
      event.clientY
    );

    if (canvasPart != null) {
      this._dragging = true;
      this.canvasPart = canvasPart.instance;
      const bbox = this.canvasPart.canvas?.nativeElement.getBoundingClientRect()!;

      const inverted = mat3.create();
      mat3.invert(inverted, this.canvasPart.canvasPart.camera.viewProjectionMat);

      this.startClip = editor.getClipSpaceMousePositionVec2(event.clientX, event.clientY, bbox);
      vec2.transformMat3(this.startPos, this.startClip, inverted);

      this.startCssY = event.clientY;
      this.lastY = this.startClip[1];
    }
  };

  onMouseMove(event: MouseEvent, editor: EditorComponent) {
    event.preventDefault();
    if (this._dragging) {
      const bbox = this.canvasPart.canvas?.nativeElement.getBoundingClientRect()!;

      const currPos = editor.getClipSpaceMousePositionVec2(event.clientX, event.clientY, bbox);

      const zoom = currPos[1] - this.lastY;
      const factor = Math.pow(10, zoom);
      this.lastY = currPos[1];
      this.canvasPart.canvasPart.camera.zoom *= factor;

      this.canvasPart.canvasPart.camera.updateViewProjection(bbox.width, bbox.height);

      const inverted = mat3.create();
      mat3.invert(inverted, this.canvasPart.canvasPart.camera.viewProjectionMat);

      const postZoom = vec2.create();
      vec2.transformMat3(postZoom, this.startClip, inverted);

      // camera needs to be moved the difference of before and after
      this.canvasPart.canvasPart.camera.x += this.startPos[0] - postZoom[0];
      this.canvasPart.canvasPart.camera.y += this.startPos[1] - postZoom[1];

      editor.render(this.canvasPart);
    }
  }
  onMouseUp(event: MouseEvent, editor: EditorComponent) {
    if (this._dragging) {
      this._dragging = false;
    }
  }
}
