import { EditorComponent } from '../../components/editor/editor.component';
import { CanvasPartComponent } from "../../components/canvas-part/canvas-part.component";
import { Tool } from "../interfaces";

export class WindowLevelTool implements Tool {
  public readonly toolIcon = 'contrast';
  public readonly toolName = 'Window level';
  public readonly extraOptions = {
    type: 'dropdown',
    name: 'Predefined WW/WC',
    choices: [
      { type: 'text', display: 'Brain 80 / 40', data: { ww: 80, wc: 40 } },
      { type: 'text', display: 'Subdural 250 / 75', data: { ww: 80, wc: 40 } },
      { type: 'text', display: 'Stroke 40 / 40', data: { ww: 40, wc: 40 } },
      { type: 'text', display: 'Temporal bones 2800 / 600', data: { ww: 2800, wc: 600 } },
      { type: 'text', display: 'Soft tissues 375 / 40', data: { ww: 375, wc: 40 } },
      { type: 'text', display: 'Lungs 1500 / -600', data: { ww: 1500, wc: -600 } },
      { type: 'text', display: 'Mediastinum 350 / 50', data: { ww: 350, wc: 50 } },
      { type: 'text', display: 'Liver 150 / 30', data: { ww: 150, wc: 30 } },
      { type: 'text', display: 'Bone 1800 / 400', data: { ww: 1800, wc: 400 } },
    ],
  };

  private _startX = 0;
  private _startY = 0;
  private _dragging = false;
  private canvasPart!: CanvasPartComponent;

  onExtraOption = (index: number, editor: EditorComponent) => {
    const data = this.extraOptions.choices[index].data;
    this.setVoi(data.ww, data.wc, editor);
  };
  onScroll = (event: WheelEvent, editor: EditorComponent) => {};

  onMouseDown = (event: MouseEvent, editor: EditorComponent) => {
    const canvasPart = editor.getCanvasPartFromMousePosition(
      event.clientX,
      event.clientY
    );

    if (canvasPart != null) {
      this._dragging = true;
      this.canvasPart = canvasPart.instance;
      const bbox = this.canvasPart.canvas?.nativeElement.getBoundingClientRect()!;
      this._startX = Number(event.clientX - bbox.left);
      this._startY = Number(event.clientY - bbox.top);
    }
  };

  onMouseMove = (event: MouseEvent, editor: EditorComponent) => {
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

      const ww = Math.max(0, this.canvasPart.canvasPart.windowing.ww + movedByX);
      const wc = this.canvasPart.canvasPart.windowing.wc + movedByY;
      this.setVoi(ww, wc, editor);
    }
  };

  public onMouseUp(event: MouseEvent, view: EditorComponent): void {
    if (this._dragging) {
      this._dragging = false;
    }
  }

  private setVoi(ww: number, wc: number, editor: EditorComponent) {
    this.canvasPart.canvasPart.windowing.ww = Math.max(0, ww);
    this.canvasPart.canvasPart.windowing.wc = wc;
    this.canvasPart.canvasPart.windowing.min =
      this.canvasPart.canvasPart.windowing.wc - this.canvasPart.canvasPart.windowing.ww / 2;
    this.canvasPart.canvasPart.windowing.max =
      this.canvasPart.canvasPart.windowing.wc + this.canvasPart.canvasPart.windowing.ww / 2;
    editor.render(this.canvasPart);
    //editor.frames.forEach((frame) => {
    //  frame.dirty = true;
    //});
  }
}
