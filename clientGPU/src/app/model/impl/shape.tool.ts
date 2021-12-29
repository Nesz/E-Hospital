import { Tool } from '../tool';
import { Shape, ShapeType } from '../shape';
import { EditorComponent } from '../../components/editor/editor.component';
import { isInsideBounds, orientShape } from '../../helpers/canvas.helper';
import { Button } from '../../button';
import { mat3, vec2 } from 'gl-matrix';

export class ShapeTool implements Tool {
  public readonly toolIcon = 'assets/select.svg';
  public readonly toolName = 'Shape';
  public readonly extraOptions = {
    type: 'buttons',
    name: 'type',
    choices: [
      {
        name: 'rect',
        display: 'assets/select.svg',
        tooltip: 'Rectangle tool',
      },
      {
        name: 'circ',
        display: 'assets/circle.svg',
        tooltip: 'Ellipse tool',
      },
    ],
  };

  private _currentTool = 'rect';
  private _dragging = false;
  private _shape: {
    vertices: number[];
    isSelected: boolean;
    isVisible: boolean;
  } = { vertices: [], isSelected: false, isVisible: true };

  onExtraOption = (index: number, editor: EditorComponent) => {};

  onScroll = (event: WheelEvent, editor: EditorComponent) => {};

  onMouseDown = (event: MouseEvent, editor: EditorComponent) => {
    const bound = (editor.context.canvas as HTMLCanvasElement).getBoundingClientRect();
    this._dragging = isInsideBounds({
      x: event.clientX,
      y: event.clientY,
      boundX: bound.x,
      boundY: bound.y,
      width: bound.width,
      height: bound.height,
    });
    if (this._dragging) {
      this._shape = { vertices: [], isSelected: false, isVisible: true };
      editor.shapes.push(this._shape);
    }
  };

  onMouseMove = (event: MouseEvent, editor: EditorComponent) => {
    /*if (this._dragging) {
      event.preventDefault();
      const mpPos = editor.getClipSpaceMousePositionVec2(event.clientX, event.clientY);
      const matInv = mat3.create();
      mat3.invert(matInv, editor.camera.viewProjectionMat);
      vec2.transformMat3(mpPos, mpPos, matInv);
      this._shape.vertices.push(mpPos[0], mpPos[1]);
      editor.shapes[editor.shapes.length - 1] = this._shape;
      //console.log(this._points);
      //console.log([mpPos[0], mpPos[1]]);
      editor.renderQuad();
    }*/
  };

  onMouseUp = (event: MouseEvent, editor: EditorComponent) => {
    if (this._dragging) {
      this._dragging = false;
      const currShape = editor.shapes[editor.shapes.length - 1];
      for (let i = 0; i < currShape.vertices.length; i += 2) {
        const x = currShape.vertices[i];
        const y = currShape.vertices[i + 1];
        //if (x < 0 || x > editor.width || y < 0 || y > editor.height) {
        editor.shapes.pop();
        //editor.render();
        break;
        //}
      }
    }
  };
}
