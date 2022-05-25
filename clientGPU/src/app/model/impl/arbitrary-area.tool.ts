import { vec2 } from "gl-matrix";
import { CanvasPartComponent } from "../../components/canvas-part/canvas-part.component";
import { Measurement, Tool } from "../interfaces";

export class ArbitraryAreaTool extends Tool {
  private canvasPart!: CanvasPartComponent;
  private _startPoint = vec2.create();
  private _dragging = false;
  private _shape!: Measurement;
  private _isDrawing = false;

  public onScroll = (event: WheelEvent) => {};

  public onMouseDown = (event: MouseEvent) => {
    const canvasPart = this.editor.getCanvasPartFromMousePosition(event.clientX, event.clientY);

    if (canvasPart != null) {
      this._dragging = true;
      this.canvasPart = canvasPart.instance;

    }
  };

  public onMouseMove = (event: MouseEvent) => {
    if (this._dragging) {
      event.preventDefault();

    }
  };

  public onMouseUp = (event: MouseEvent) => {
    if (this._dragging) {
      this._dragging = false;

      }
  };
}
