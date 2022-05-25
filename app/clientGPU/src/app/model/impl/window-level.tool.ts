import { CanvasPartComponent } from "../../components/canvas-part/canvas-part.component";
import { Tool } from "../interfaces";

export class WindowLevelTool extends Tool {

  private _startX = 0;
  private _startY = 0;
  private _dragging = false;
  private canvasPart!: CanvasPartComponent;


  public onScroll = (event: WheelEvent) => {};

  public onMouseDown = (event: MouseEvent) => {
    const canvasPart = this.editor.getCanvasPartFromMousePosition(event.clientX, event.clientY);

    if (canvasPart != null) {
      this._dragging = true;
      this.canvasPart = canvasPart.instance;
      const bbox = this.canvasPart.canvas?.nativeElement.getBoundingClientRect()!;
      this._startX = Number(event.clientX - bbox.left);
      this._startY = Number(event.clientY - bbox.top);
    }
  };

  public onMouseMove = (event: MouseEvent) => {
    if (this._dragging) {
      event.preventDefault();
      const bbox = this.canvasPart.canvas?.nativeElement.getBoundingClientRect()!;
      const mouseX = Number(event.clientX - bbox.left);
      const mouseY = Number(event.clientY - bbox.top);

      // move the image by the amount of the latest drag
      const movedByX = mouseX - this._startX;
      const movedByY = mouseY - this._startY;
      // reset the startXY for next time
      this._startX = mouseX;
      this._startY = mouseY;

      const ww = Math.max(0, this.canvasPart.windowing.ww + movedByX);
      const wc = this.canvasPart.windowing.wc + movedByY;
      this.setWindowing(ww, wc);
    }
  };

  public onMouseUp = (event: MouseEvent) => {
    if (this._dragging) {
      this._dragging = false;
    }
  }

  private setWindowing(ww: number, wc: number) {
    this.canvasPart.windowing.ww = Math.max(0, ww);
    this.canvasPart.windowing.wc = wc;
    this.editor.render(this.canvasPart);
  }
}
