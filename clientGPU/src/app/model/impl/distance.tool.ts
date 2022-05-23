import { CanvasPartComponent } from "../../components/canvas-part/canvas-part.component";
import { MeasurementType, Measurement, Tool } from "../interfaces";
import { isInsideBounds } from "../../helpers/canvas.helper";

export class DistanceTool extends Tool {

  private canvasPart!: CanvasPartComponent;
  private isDragging = false;
  private shape!: Measurement;

  public onScroll = (event: WheelEvent) => {};

  public onMouseDown = (event: MouseEvent) => {
    const canvasPart = this.editor.getCanvasPartFromMousePosition(event.clientX, event.clientY)?.instance;

    if (canvasPart != null) {
      this.isDragging = true;
      this.canvasPart = canvasPart;

      const real = this.getRealCanvasPos(canvasPart, event.clientX, event.clientY);

      this.shape = {
        id: -1,
        label: "label",
        description: "description",
        vertices: [real, real],
        slice: this.canvasPart.currentSlice,
        plane: this.canvasPart.plane,
        isSelected: false,
        isVisible: true,
        detailsToggled: false,
        type: MeasurementType.DISTANCE
      };
    }
  };

  public onMouseMove = (event: MouseEvent) => {
     if (this.isDragging) {
        event.preventDefault();
        const real = this.getRealCanvasPos(this.canvasPart, event.clientX, event.clientY);
        this.shape.vertices[1] = real;
        this.editor.renderMeasurements(this.canvasPart);
        this.editor.renderMeasurement(this.shape, this.canvasPart);
     }
  };

  public onMouseUp = (event: MouseEvent) => {
    if (this.isDragging) {
      this.isDragging = false;
      if (this.isValid(this.editor.props.width, this.editor.props.height)) {
        this.editor.shapes.push(this.shape)
      } else {
        this.editor.renderMeasurements(this.canvasPart);
      }
    }
  };

  private isValid = (width: number, height: number) => {
    for (let i = 0; i < this.shape.vertices.length; i += 2) {
      if (!isInsideBounds(this.shape.vertices[i], width, height)) {
        return false;
      }
    }
    return true;
  }
}
