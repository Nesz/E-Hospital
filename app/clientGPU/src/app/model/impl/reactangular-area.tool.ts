import { EditorComponent } from "../../components/editor/editor.component";
import { mat3, vec2 } from "gl-matrix";
import { CanvasPartComponent } from "../../components/canvas-part/canvas-part.component";
import { MeasurementType, Measurement, Tool } from "../interfaces";
import { isInsideBounds, toRectangle } from "../../helpers/canvas.helper";

export class RectangularArea extends Tool {

  private canvasPart!: CanvasPartComponent;
  private measurement!: Measurement;
  private isDrawing = false;
  private startPos = vec2.create();

  public onScroll = (event: WheelEvent) => {};

  public onMouseDown = (event: MouseEvent) => {
    const canvasPart = this.editor.getCanvasPartFromMousePosition(event.clientX, event.clientY)?.instance;

    if (canvasPart != null) {
      this.isDrawing = true;
      this.canvasPart = canvasPart;

      const real = this.getRealCanvasPos(canvasPart, event.clientX, event.clientY);
      this.startPos = real;
      this.measurement = {
        id: -1,
        label: "label",
        vertices: [real, real],
        slice: this.canvasPart.currentSlice,
        plane: this.canvasPart.plane,
        isVisible: true,
        detailsToggled: false,
        type: MeasurementType.RECTANGLE
      };
    }
  };

  public onMouseMove = (event: MouseEvent) => {
    if (this.isDrawing) {
      event.preventDefault();
      const real = this.getRealCanvasPos(this.canvasPart, event.clientX, event.clientY);
      this.measurement.vertices = toRectangle(this.startPos, real);
      // this.shape.vertices = toRectangle(this.startPos, real);
      this.editor.renderMeasurements(this.canvasPart);
      this.editor.renderMeasurement(this.measurement, this.canvasPart);
    }
  };

  public onMouseUp = (event: MouseEvent) => {
    if (this.isDrawing) {
      this.isDrawing = false;
      if (this.isValid(this.editor.props.width, this.editor.props.height)) {
        this.editor.shapes.push(this.measurement)
        this.editor.onShapeFinish(this.measurement);
      } else {
        this.editor.renderMeasurements(this.canvasPart);
      }
    }
  };

  private isValid = (width: number, height: number) => {
    for (let i = 0; i < this.measurement.vertices.length; i += 2) {
      if (!isInsideBounds(this.measurement.vertices[i], width, height)) {
        return false;
      }
    }
    return true;
  }
}
