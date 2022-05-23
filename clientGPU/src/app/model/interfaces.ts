import { EditorComponent } from "../components/editor/editor.component";
import { Header } from "../components/table/table.component";
import { CanvasPartComponent } from "../components/canvas-part/canvas-part.component";
import { mat3, vec2 } from "gl-matrix";

export interface Windowing {
  ww: number;
  wc: number;
}

export class Dictionary<T> {
  [Key: string]: T;
}

export interface HeaderSorted<T> extends Header<T> {
  efField: string
}


export interface Measurement {
  id: number,
  label: string;
  description: string;
  slice: number;
  plane: Plane;
  vertices: vec2[];
  isVisible: boolean;
  isSelected: boolean;
  detailsToggled: boolean;
  type: MeasurementType;
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

export enum SidebarMode {
  NONE,
  TAGS,
  MEASUREMENTS,
  HISTOGRAM,
  SETTINGS
}

export enum OrderDirection {
  ASCENDING = 'ASCENDING',
  DESCENDING = 'DESCENDING',
}

export enum Role {
  Admin = 'Admin',
  Doctor = 'Doctor',
  Patient = 'Patient'
}

export enum Gender {
  MALE,
  FEMALE
}

export interface Page<T> {
  pageCurrent: number,
  pageOrder: string,
  pageSize: number,
  pageTotal: number,
  orderDirection: OrderDirection,
  data: T[]
}

export enum Plane {
  TRANSVERSE = 0, // up-down
  SAGITTAL = 1, // left-right
  CORONAL = 2, // front-back
}

export type LookupTablesData = RawLutData[]

export interface LookupTable {
  name: string,
  texture: WebGLTexture;
}

export interface RawLutData {
  name: string;
  r: number[];
  g: number[];
  b: number[];
}

export abstract class Tool {
  public readonly toolName: string;
  public readonly toolIcon: string;
  public readonly editor: EditorComponent;

  constructor(toolIcon: string, toolName: string, editor: EditorComponent) {
    this.toolIcon = toolIcon;
    this.toolName = toolName;
    this.editor = editor;
  }

  public abstract onScroll(event: WheelEvent): void;

  public abstract onMouseDown(event: MouseEvent): void;

  public abstract onMouseMove(event: MouseEvent): void;

  public abstract onMouseUp(event: MouseEvent): void;

  protected getRealCanvasPos(canvasPart: CanvasPartComponent, x: number, y: number): vec2 {
    const bbox = canvasPart.canvas.nativeElement.getBoundingClientRect()!;
    const clipPos = this.editor.getClipSpaceMousePositionVec2(x, y, bbox);

    const matrix = mat3.create();
    mat3.invert(matrix, canvasPart.camera.viewProjectionMat);

    const canvasCoords = vec2.fromValues(clipPos[0], clipPos[1]);
    vec2.transformMat3(canvasCoords, canvasCoords, matrix);
    return canvasCoords;
  }
}

export enum MeasurementType {
  DISTANCE,
  ANGLE,
  RECTANGLE,
}

export interface Layout {
  icon: string,
  regions: number,
  templateAreas: string,
  areaIdentifiers: string[]
}
