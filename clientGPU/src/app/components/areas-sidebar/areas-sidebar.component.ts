import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Measurement } from "../../model/interfaces";
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
  @Input() shapes: Measurement[] = [];
  @Output() onEvent = new EventEmitter<string>();
  readonly DicomTag: typeof Tag = Tag;

  readonly infoToDisplay: [string, () => string][] = [
    [ "Description: ", (() => this.getTagValue(Tag.SERIES_DESCRIPTION)) ],
    [ "Date: ", (() => this.getTagValue(Tag.SERIES_DATE)) ],
    [ "Modality: ", (() => this.getTagValue(Tag.MODALITY)) ],
    [ "Patient Name: ", (() => this.getTagValue(Tag.PATIENT_NAME)) ],
    [ "Patient Gender: ", (() => this.getTagValue(Tag.PATIENT_SEX)) ],
    [ "Slices: ", (() => `${this.editor?.props?.sliceCount}`) ]
  ]

  constructor(private readonly apiService: ApiService) { }

  ngOnInit(): void {

  }

  toggleDetails(shape: Measurement) {
    shape.detailsToggled = !shape.detailsToggled;
  }

  goToArea(shape: Measurement) {
    const canvas = this.editor.canvases
      .find(c => c.instance.orientation === shape.orientation) ?? this.editor.canvases[0];

    canvas.instance.currentSlice = shape.slice;
    canvas.instance.orientation = shape.orientation;
    this.editor.render(canvas.instance);
  }

  delete(shape: Measurement) {
    this.apiService.deleteArea(this.editor.seriesId, shape)
      .pipe(tap(() => {
        const shapeToDelete = this.shapes.findIndex(s => s.id === shape.id);
        this.shapes.splice(shapeToDelete);
        const canvas = this.editor.canvases
          .map(c => c.instance)
          .find(c =>
            c.orientation === shape.orientation &&
            c.currentSlice === shape.slice
          );
        if (canvas) {
          this.editor.render(canvas);
        }
      }))
      .subscribe()
  }

  hide(shape: Measurement) {
    shape.isVisible = !shape.isVisible;
    const canvas = this.editor.canvases
      .map(c => c.instance)
      .find(c =>
        c.orientation === shape.orientation &&
        c.currentSlice === shape.slice
      );
    if (canvas) {
      this.editor.render(canvas);
    }
  }

  updateLabel($event: Event, shape: Measurement) {
    shape.label = ($event.target as HTMLInputElement).value;
    this.apiService.updateAreaLabel(this.editor.seriesId, shape).subscribe();
  }

  getTagValue(tag: any) {
    return this.editor.dicom?.getValue(tag, false)?.asString();
  }
}
