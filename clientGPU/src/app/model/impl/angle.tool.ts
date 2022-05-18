import { CanvasPartComponent } from "../../components/canvas-part/canvas-part.component";
import { MeasurementType, Measurement, Tool } from "../interfaces";
import { isInsideBounds } from "../../helpers/canvas.helper";
import { vec2 } from 'gl-matrix';

export class AngleTool extends Tool {

  private canvasPart!: CanvasPartComponent;
  private isDrawing = false;
  private count: number = 1;
  private measurement!: Measurement;

  public onScroll = (event: WheelEvent) => {};

  public onMouseDown = (event: MouseEvent) => {
    const canvasPart = this.editor.getCanvasPartFromMousePosition(event.clientX, event.clientY)?.instance;

    if (this.isDrawing) {
      this.count++;
      if (this.count >= 3) {
        this.isDrawing = false;
        if (this.isValid(this.editor.props.width, this.editor.props.height)) {
          this.editor.shapes.push(this.measurement);
        } else {
          this.editor.renderMeasurements(this.canvasPart);
        }
      } else {
        this.measurement.vertices.push(vec2.fromValues(0, 0));
      }
      return
    }

    if (canvasPart != null) {
      this.isDrawing = true;
      this.canvasPart = canvasPart;

      const real = this.getRealCanvasPos(canvasPart, event.clientX, event.clientY);

      this.count = 1;
      this.measurement = {
        id: -1,
        label: "label",
        description: "description",
        vertices: [real, real],
        slice: this.canvasPart.currentSlice,
        orientation: this.canvasPart.orientation,
        isSelected: false,
        isVisible: true,
        detailsToggled: false,
        type: MeasurementType.ANGLE
      };
    }
  };

  public onMouseMove = (event: MouseEvent) => {
    if (this.isDrawing) {
      event.preventDefault();
      const real = this.getRealCanvasPos(this.canvasPart, event.clientX, event.clientY);
      this.measurement.vertices[this.count] = real;
      this.editor.renderMeasurements(this.canvasPart);
      this.editor.renderMeasurement(this.measurement, this.canvasPart);
    }
  };

  public onMouseUp = (event: MouseEvent) => {

  }

  private isValid = (width: number, height: number) => {
    for (let i = 0; i < this.measurement.vertices.length; i += 2) {
      if (!isInsideBounds(this.measurement.vertices[i], width, height)) {
        return false;
      }
    }
    return true;
  }
}
