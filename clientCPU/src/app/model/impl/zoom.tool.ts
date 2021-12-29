import { Tool } from '../tool';
import { EditorComponent } from '../../components/editor/editor.component';
import { isInsideBounds } from '../../helpers/canvas.helper';

export class ZoomTool implements Tool {
  private readonly minZoom = 0.25;
  private readonly maxZoom = 20;

  public readonly toolIcon = 'assets/zoom.svg';
  public readonly toolName = 'Zoom';
  public readonly extraOptions = [];

  private _zoomStart = new DOMPoint();
  private _clicked = false;
  private _lastY = 0;

  onExtraOption = (index: number, editor: EditorComponent) => {};
  onScroll = (event: WheelEvent, editor: EditorComponent) => {};

  onMouseDown = (event: MouseEvent, editor: EditorComponent) => {
    const bound = editor.context.canvas.getBoundingClientRect();
    this._zoomStart = new DOMPoint(event.clientX - bound.left, event.clientY - bound.top);
    this._lastY = event.clientY - bound.top;
    this._clicked = isInsideBounds({
      x: event.clientX,
      y: event.clientY,
      boundX: bound.x,
      boundY: bound.y,
      width: bound.width,
      height: bound.height,
    });
  };

  onMouseMove(event: MouseEvent, editor: EditorComponent) {
    event.preventDefault();
    if (this._clicked) {
      const bound = editor.context.canvas.getBoundingClientRect();
      const newY = event.clientY - bound.top;
      if (newY == this._lastY) return;

      const zoom = (this._lastY - newY) / 10;
      const factor = Math.pow(1.1, zoom);
      editor.scale *= factor;
      this._lastY = newY;

      const transformed = editor.relativePoint(this._zoomStart.x, this._zoomStart.y);
      editor.context.translate(transformed.x, transformed.y);
      editor.context.scale(factor, factor);
      editor.context.translate(-transformed.x, -transformed.y);
      editor.paint(false);
    }
  }
  onMouseUp(event: MouseEvent, editor: EditorComponent) {
    if (this._clicked) {
      this._clicked = false;
    }
  }
}
