import { vec2 } from "gl-matrix";

export {}
declare global {

  interface CanvasRenderingContext2D {
    arcVec(vec: vec2, a: number, b: number, c: number): void;
    moveToVec(vec: vec2): void;
    lineToVec(vec: vec2): void;
    fillTextVec(text: string, vec: vec2): void;
    strokeRectVec(p1: vec2, p2: vec2): void;
  }


}
