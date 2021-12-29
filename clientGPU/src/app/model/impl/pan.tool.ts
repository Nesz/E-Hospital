import { Tool } from '../tool';
import { EditorComponent } from "../../components/editor/editor.component";
import { mat3, vec2 } from 'gl-matrix';
import { Camera } from '../camera';
import { CanvasPartComponent } from "../../components/canvas-part/canvas-part.component";

export class PanTool implements Tool {
  public readonly toolIcon = 'assets/move.svg';
  public readonly toolName = 'Pan';
  public readonly extraOptions = [];

  private _dragging = false;

  private canvasPart!: CanvasPartComponent;
  private startInvViewProjMat = mat3.create();
  private startCamera!: Camera;
  private startPos = vec2.create();

  onExtraOption = (index: number, editor: EditorComponent) => {};

  onScroll = (event: WheelEvent, editor: EditorComponent) => {};

  onMouseDown = (event: MouseEvent, editor: EditorComponent) => {
    const canvasPart = editor.getCanvasPartFromMousePosition(
      event.clientX,
      event.clientY
    );

    if (canvasPart != null) {
      this._dragging = true;
      this.canvasPart = canvasPart.instance;
      this.startCamera = Object.assign({}, this.canvasPart.canvasPart.camera);
      mat3.invert(this.startInvViewProjMat, this.canvasPart.canvasPart.camera.viewProjectionMat);
      const bbox = this.canvasPart.canvas?.nativeElement.getBoundingClientRect()!;
      const startclipvec = editor.getClipSpaceMousePositionVec2(event.clientX, event.clientY, bbox);
      vec2.transformMat3(this.startPos, startclipvec, this.startInvViewProjMat);
    }
  };

  onMouseUp = (event: MouseEvent, editor: EditorComponent) => {
    if (this._dragging) {
      this._dragging = false;
    }
  };

  onMouseMove = (event: MouseEvent, editor: EditorComponent) => {
    if (this._dragging && editor.context) {
      event.preventDefault();
      const pos = vec2.create();
      const bbox = this.canvasPart.canvas?.nativeElement.getBoundingClientRect()!;
      const mpPos = editor.getClipSpaceMousePositionVec2(event.clientX, event.clientY, bbox);
      vec2.transformMat3(pos, mpPos, this.startInvViewProjMat);

      this.canvasPart.canvasPart.camera.x = this.startCamera.x + this.startPos[0] - pos[0];
      this.canvasPart.canvasPart.camera.y = this.startCamera.y + this.startPos[1] - pos[1];
      editor.render(this.canvasPart);
    }
  };
}
