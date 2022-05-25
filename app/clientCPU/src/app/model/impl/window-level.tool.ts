import { Tool } from '../tool';
import { EditorComponent } from '../../components/editor/editor.component';
import { isInsideBounds } from '../../helpers/canvas.helper';

export class WindowLevelTool implements Tool {
  public readonly toolIcon = 'assets/contrast.svg';
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
  private _clicked = false;

  onExtraOption = (index: number, editor: EditorComponent) => {
    const data = this.extraOptions.choices[index].data;
    this.setVoi(data.ww, data.wc, editor);
    editor.paint(true);
  };
  onScroll = (event: WheelEvent, view: EditorComponent) => {};

  onMouseDown = (event: MouseEvent, view: EditorComponent) => {
    if (view.canvas) {
      const bound = view.context.canvas.getBoundingClientRect();
      this._startX = Number(event.clientX - bound.left);
      this._startY = Number(event.clientY - bound.top);
      this._clicked = isInsideBounds({
        x: event.clientX,
        y: event.clientY,
        boundX: bound.x,
        boundY: bound.y,
        width: bound.width,
        height: bound.height,
      });
    }
  };

  onMouseMove = (e: MouseEvent, editor: EditorComponent) => {
    e.preventDefault();
    if (this._clicked) {
      const bound = editor.context.canvas.getBoundingClientRect();
      const mouseX = Number(e.clientX - bound.left);
      const mouseY = Number(e.clientY - bound.top);

      // move the image by the amount of the latest drag
      const movedByX = mouseX - this._startX;
      const movedByY = mouseY - this._startY;
      // reset the startXY for next time
      this._startX = mouseX;
      this._startY = mouseY;

      const ww = Math.max(0, editor.windowing.ww + movedByX);
      const wc = editor.windowing.wc + movedByY;
      this.setVoi(ww, wc, editor);

      editor.paint(true);
    }
  };

  public onMouseUp(event: MouseEvent, view: EditorComponent): void {
    if (this._clicked) {
      this._clicked = false;
    }
  }

  private setVoi(ww: number, wc: number, editor: EditorComponent) {
    editor.windowing.ww = Math.max(0, ww);
    editor.windowing.wc = wc;
    editor.windowing.min = editor.windowing.wc - editor.windowing.ww / 2;
    editor.windowing.max = editor.windowing.wc + editor.windowing.ww / 2;
    editor.frames.forEach((frame) => {
      frame.dirty = true;
    });
  }
}
