import { Tool } from '../tool';
import { EditorComponent } from '../../components/editor/editor.component';
import { isInsideBounds } from '../../helpers/canvas.helper';

export class RotateTool implements Tool {
  public readonly toolIcon = 'assets/rotate.svg';
  public readonly toolName = 'Rotate';
  public readonly extraOptions = [];

  private _startX = 0;
  private _startY = 0;
  private _dragging = false;

  onExtraOption = (index: number, editor: EditorComponent) => {};
  onScroll = (event: WheelEvent, editor: EditorComponent) => {};

  onMouseDown = (event: MouseEvent, editor: EditorComponent) => {
    const bound = editor.context.canvas.getBoundingClientRect();
    this._startX = event.clientX - bound.left;
    this._startY = event.clientY - bound.top;
    this._dragging = isInsideBounds({
      x: event.clientX,
      y: event.clientY,
      boundX: bound.x,
      boundY: bound.y,
      width: bound.width,
      height: bound.height,
    });
  };

  public onMouseMove(event: MouseEvent, editor: EditorComponent): void {
    event.preventDefault();
    if (this._dragging) {
      const bound = editor.context.canvas.getBoundingClientRect();
      this._startX = event.clientX - bound.left;
      this._startY = event.clientY - bound.top;

      const tt = editor.relativePoint(this._startX, this._startY);
      const dx = tt.x;
      const dy = tt.y;
      const angle = Math.atan2(dy, dx);

      editor.angle = (editor.angle - angle) % 6.28;
      console.log(angle);
      editor.context.rotate(angle);
      editor.paint(false);
    }
  }

  public onMouseUp(event: MouseEvent, editor: EditorComponent): void {
    if (this._dragging) {
      this._dragging = false;
    }
  }
}
