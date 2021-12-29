export enum ShapeType {
  CIRCLE,
  RECTANGLE,
}

export interface Shape {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  isActive: boolean;
  type: ShapeType;
}
