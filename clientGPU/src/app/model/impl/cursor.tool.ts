import { EditorComponent } from '../../components/editor/editor.component';
import { Tool } from "../interfaces";

export class CursorTool implements Tool {
  public readonly toolIcon = 'cursor';
  public readonly toolName = 'Cursor';
  public readonly extraOptions = {};

  onExtraOption(index: number, editor: EditorComponent) {}
  onScroll(event: WheelEvent, editor: EditorComponent) {}
  onMouseDown(event: MouseEvent, editor: EditorComponent) {}
  onMouseMove(event: MouseEvent, editor: EditorComponent) {}
  onMouseUp(event: MouseEvent, editor: EditorComponent) {}
}
