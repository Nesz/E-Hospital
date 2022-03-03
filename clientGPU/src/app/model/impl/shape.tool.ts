import { EditorComponent } from '../../components/editor/editor.component';
import { mat3, vec2 } from 'gl-matrix';
import { CanvasPartComponent } from "../../components/canvas-part/canvas-part.component";
import { Shape, Tool } from "../interfaces";

export class ShapeTool implements Tool {
  public readonly toolIcon = 'select';
  public readonly toolName = 'Shape';
  public readonly extraOptions = {};

  private canvasPart!: CanvasPartComponent;
  private _startPoint = vec2.create();
  private _dragging = false;
  private _shape!: Shape;

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
      this._startPoint = vec2.fromValues(event.clientX, event.clientY);
      this._shape = {
        label: "label",
        description: "description",
        vertices: [],
        slice: this.canvasPart.canvasPart.currentSlice,
        orientation: this.canvasPart.canvasPart.orientation,
        isSelected: false,
        isVisible: true,
        detailsToggled: false
      };
      editor.shapes.push(this._shape);
    }
  };

  onMouseMove = (event: MouseEvent, editor: EditorComponent) => {
    if (this._dragging) {
      event.preventDefault();
      const bbox = this.canvasPart.canvas?.nativeElement.getBoundingClientRect()!;
      const mpPos = editor.getClipSpaceMousePositionVec2(event.clientX, event.clientY, bbox);
      const matInv = mat3.create();
      mat3.invert(matInv, this.canvasPart.canvasPart.camera.viewProjectionMat);
      vec2.transformMat3(mpPos, mpPos, matInv);
      this._shape.vertices.push(mpPos[0], mpPos[1]);
      editor.shapes[editor.shapes.length - 1] = this._shape;
      //console.log(this._points);
      //console.log([mpPos[0], mpPos[1]]);
      editor.render(this.canvasPart);
    }
  };

  onMouseUp = (event: MouseEvent, editor: EditorComponent) => {
    if (this._dragging) {
      this._dragging = false;
      const currShape = editor.shapes[editor.shapes.length - 1];
      for (let i = 0; i < currShape.vertices.length; i += 2) {
        const x = currShape.vertices[i];
        const y = currShape.vertices[i + 1];
        //if (x < 0 || x > editor.width || y < 0 || y > editor.height) {
        //editor.shapes.pop();
        //editor.render();
        //break;
        //}
      }
      editor.onShapeFinish(this._shape);
    }
  };
}
