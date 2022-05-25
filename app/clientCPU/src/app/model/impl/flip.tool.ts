import { Tool } from '../tool';
import { EditorComponent } from '../../components/editor/editor.component';
import { isInsideBounds } from '../../helpers/canvas.helper';

export class FlipTool implements Tool {
  public readonly toolIcon = 'assets/symmetry.svg';
  public readonly toolName = 'Flip';
  public readonly extraOptions = {
    type: 'dropdown',
    name: 'Direction',
    choices: [
      {
        type: 'text',
        display: 'Horizontal',
        data: { x: -1, y: 1 },
      },
      {
        type: 'text',
        display: 'Vertical',
        data: { x: 1, y: -1 },
      },
    ],
  };

  private data = this.extraOptions.choices[0].data;

  onExtraOption = (index: number, editor: EditorComponent) => {
    this.data = this.extraOptions.choices[index].data;
  };

  onScroll = (event: WheelEvent, editor: EditorComponent) => {};

  onMouseMove = (event: MouseEvent, editor: EditorComponent) => {};

  onMouseUp = (event: MouseEvent, editor: EditorComponent) => {};

  onMouseDown = (event: MouseEvent, editor: EditorComponent) => {
    const bound = editor.context.canvas.getBoundingClientRect();
    const isInBounds = isInsideBounds({
      x: event.clientX,
      y: event.clientY,
      boundX: bound.x,
      boundY: bound.y,
      width: bound.width,
      height: bound.height,
    });

    if (isInBounds) {
      event.preventDefault();
      editor.context.scale(this.data.x, this.data.y);
      editor.paint(false);
    }
  };
}
