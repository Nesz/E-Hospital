import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Shape } from "../../model/interfaces";
import { EditorComponent } from "../editor/editor.component";
import { ApiService } from "../../services/api.service";
import { tap } from "rxjs/operators";
import { Tag } from "../../tag";

@Component({
  selector: 'app-areas-sidebar',
  templateUrl: './areas-sidebar.component.html',
  styleUrls: ['./areas-sidebar.component.scss']
})
export class AreasSidebarComponent implements OnInit {

  @Input() editor!: EditorComponent;
  @Input() isHidden = false;
  @Input() shapes: Shape[] = [];
  @Output() onEvent = new EventEmitter<string>();
  readonly DicomTag: typeof Tag = Tag;

  readonly infoToDisplay: [string, () => string][] = [
    [ "Description: ", (() => this.getTagValue(Tag.SERIES_DESCRIPTION)) ],
    [ "Date: ", (() => this.getTagValue(Tag.SERIES_DATE)) ],
    [ "Modality: ", (() => this.getTagValue(Tag.MODALITY)) ],
    [ "Patient Name: ", (() => this.getTagValue(Tag.PATIENT_NAME)) ],
    [ "Patient Gender: ", (() => this.getTagValue(Tag.PATIENT_SEX)) ],
    [ "Slices: ", (() => `${this.editor.orientation.z.slices.length}`) ]
  ]

  constructor(private readonly apiService: ApiService) { }

  ngOnInit(): void {

  }

  toggleDetails(shape: Shape) {
    shape.detailsToggled = !shape.detailsToggled;
  }

  goToArea(shape: Shape) {
    const canvas = this.editor.canvases
      .find(c => c.instance.canvasPart.orientation === shape.orientation) ?? this.editor.canvases[0];

    canvas.instance.canvasPart.currentSlice = shape.slice;
    canvas.instance.canvasPart.orientation = shape.orientation;
    this.editor.render(canvas.instance);
  }

  delete(shape: Shape) {
    this.apiService.deleteArea(this.editor.seriesId, shape)
      .pipe(tap(() => {
        const shapeToDelete = this.shapes.findIndex(s => s.id === shape.id);
        this.shapes.splice(shapeToDelete);
        const canvas = this.editor.canvases
          .map(c => c.instance)
          .find(c =>
            c.canvasPart.orientation === shape.orientation &&
            c.canvasPart.currentSlice === shape.slice
          );
        if (canvas) {
          this.editor.render(canvas);
        }
      }))
      .subscribe()
  }

  hide(shape: Shape) {
    shape.isVisible = !shape.isVisible;
    const canvas = this.editor.canvases
      .map(c => c.instance)
      .find(c =>
        c.canvasPart.orientation === shape.orientation &&
        c.canvasPart.currentSlice === shape.slice
      );
    if (canvas) {
      this.editor.render(canvas);
    }
  }

  updateLabel($event: Event, shape: Shape) {
    shape.label = ($event.target as HTMLInputElement).value;
    this.apiService.updateAreaLabel(this.editor.seriesId, shape).subscribe();
  }

  getTagValue(tag: any) {
    return this.editor.dicom?.getValue(tag, false)?.asString();
  }
}
