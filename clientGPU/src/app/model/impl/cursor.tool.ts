import { Tool } from '../tool';
import { EditorComponent } from '../../components/editor/editor.component';

export class CursorTool implements Tool {
  public readonly toolIcon = 'assets/cursor.svg';
  public readonly toolName = 'Cursor';
  public readonly extraOptions = {};

  onExtraOption(index: number, editor: EditorComponent) {}
  onScroll(event: WheelEvent, editor: EditorComponent) {}
  onMouseDown(event: MouseEvent, editor: EditorComponent) {}
  onMouseMove(event: MouseEvent, editor: EditorComponent) {}
  onMouseUp(event: MouseEvent, editor: EditorComponent) {}
}
