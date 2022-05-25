import { EditorComponent } from '../components/editor/editor.component';

export interface Tool {
  readonly toolName: string;
  readonly toolIcon: string;
  readonly extraOptions: any;

  onExtraOption(index: number, editor: EditorComponent): void;

  onScroll(event: WheelEvent, editor: EditorComponent): void;

  onMouseDown(event: MouseEvent, editor: EditorComponent): void;

  onMouseMove(event: MouseEvent, editor: EditorComponent): void;

  onMouseUp(event: MouseEvent, editor: EditorComponent): void;
}
