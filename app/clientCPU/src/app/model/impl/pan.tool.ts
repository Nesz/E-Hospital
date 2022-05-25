import { Tool } from '../tool';
import { EditorComponent } from '../../components/editor/editor.component';
import { isInsideBounds } from '../../helpers/canvas.helper';

export class PanTool implements Tool {
  public readonly toolIcon = 'assets/move.svg';
  public readonly toolName = 'Pan';
  public readonly extraOptions = [];

  private _dragging = false;
  private _dragStart = new DOMPoint();

  onExtraOption = (index: number, editor: EditorComponent) => {};

  onScroll = (event: WheelEvent, editor: EditorComponent) => {};

  onMouseDown = (event: MouseEvent, editor: EditorComponent) => {
    const bound = editor.context.canvas.getBoundingClientRect();

    this._dragStart = editor.relativePoint(event.clientX - bound.left, event.clientY - bound.top);

    this._dragging = isInsideBounds({
      x: event.clientX,
      y: event.clientY,
      boundX: bound.x,
      boundY: bound.y,
      width: bound.width,
      height: bound.height,
    });
  };

  onMouseUp = (event: MouseEvent, editor: EditorComponent) => {
    if (this._dragging) {
      this._dragging = false;
      editor.paint(false);
    }
  };

  onMouseMove = (event: MouseEvent, editor: EditorComponent) => {
    event.preventDefault();
    if (this._dragging && editor.context) {
      const bound = editor.context.canvas.getBoundingClientRect();
      const current = editor.relativePoint(event.clientX - bound.left, event.clientY - bound.top);

      editor.context.translate(current.x - this._dragStart.x, current.y - this._dragStart.y);
      editor.paint(false);
    }
  };
}
