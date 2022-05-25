import { Tool } from '../tool';
import { Shape, ShapeType } from '../shape';
import { EditorComponent } from '../../components/editor/editor.component';
import { isInsideBounds, orientShape } from '../../helpers/canvas.helper';
import { Button } from '../../button';

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
  private _clicked = false;
  private _startPoint = {
    x: 0,
    y: 0,
  };
  private _lastShape?: Shape;

  onExtraOption = (index: number, editor: EditorComponent) => {};

  onScroll = (event: WheelEvent, editor: EditorComponent) => {};

  onMouseDown = (event: MouseEvent, editor: EditorComponent) => {
    if (editor.context && Button.LEFT_CLICK === event.button) {
      const bound = editor.context.canvas.getBoundingClientRect();
      this._startPoint = editor.relativePoint(
        event.clientX - bound.left,
        event.clientY - bound.top
      );
      this._clicked = isInsideBounds({
        x: event.clientX,
        y: event.clientY,
        boundX: bound.x,
        boundY: bound.y,
        width: bound.width,
        height: bound.height,
      });
      if (this._clicked) {
        event.preventDefault();
      }
    }
  };

  onMouseMove = (event: MouseEvent, editor: EditorComponent) => {
    if (this._clicked) {
      const bound = editor.context.canvas.getBoundingClientRect();

      const p1 = this._startPoint;
      const p2 = editor.relativePoint(event.clientX - bound.left, event.clientY - bound.top);

      this._lastShape = {
        x: p1.x,
        y: p1.y,
        w: p2.x - p1.x,
        h: p2.y - p1.y,
        label: 'empty',
        isActive: false,
        type: ShapeType.RECTANGLE,
      };

      editor.paint(false);
      editor.paintShape(this._lastShape);
    }
  };

  onMouseUp = (event: MouseEvent, editor: EditorComponent) => {
    if (this._clicked && this._lastShape) {
      this._clicked = false;

      /*const shape = this._lastShape;
      const px = Math.min(shape.x, shape.x + shape.w);
      const py = Math.min(shape.y, shape.y + shape.h);

      this._lastShape = {
        x: px,
        y: py,
        w: Math.abs(shape.w),
        h: Math.abs(shape.h),
        type: ShapeType.RECTANGLE,
      };*/

      //orientShape(this._lastShape);
      orientShape(this._lastShape);
      editor.shapes.push(this._lastShape);
      this._lastShape = undefined;
    }
  };
}
