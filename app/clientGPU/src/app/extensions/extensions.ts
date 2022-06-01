import { vec2 } from "gl-matrix";

export {};

CanvasRenderingContext2D.prototype.moveToVec = function(vec: vec2): void {
  this.moveTo(vec[0], vec[1]);
}

CanvasRenderingContext2D.prototype.lineToVec = function(vec: vec2): void {
  this.lineTo(vec[0], vec[1]);
}

CanvasRenderingContext2D.prototype.fillTextVec = function(text: string, vec: vec2): void {
  this.fillText(text, vec[0], vec[1]);
}

CanvasRenderingContext2D.prototype.arcVec = function(vec: vec2, a: number, b: number, c: number): void {
  this.arc(vec[0], vec[1], a, b, c);
}

CanvasRenderingContext2D.prototype.strokeRectVec = function(p1: vec2, p2: vec2): void {
  this.strokeRect(p1[0], p1[1], p2[0], p2[1]);
}

