import { EditorComponent } from "../components/editor/editor.component";
import { Gender, Role } from "./enums";
import { Header } from "../components/table/table.component";

export interface Windowing {
  ww: number;
  wc: number;
  min: number;
  max: number;
}

export interface HeaderSorted<T> extends Header<T> {
  efField: string
}

export interface Shape {
  label: string;
  description: string;
  slice: number;
  orientation: 'x' | 'y' | 'z';
  vertices: number[];
  isVisible: boolean;
  isSelected: boolean;
  detailsToggled: boolean;
}

export interface User {
  id: number,
  firstName: string,
  lastName: string,
  email: string,
  phoneNumber: string,
  birthDate: string,
  role: Role,
  gender: Gender
}

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
