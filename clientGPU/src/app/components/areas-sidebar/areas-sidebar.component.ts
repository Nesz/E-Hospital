import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Shape } from "../../model/interfaces";

@Component({
  selector: 'app-areas-sidebar',
  templateUrl: './areas-sidebar.component.html',
  styleUrls: ['./areas-sidebar.component.scss']
})
export class AreasSidebarComponent implements OnInit {
  @Input() isHidden = true;
  @Input() shapes: Shape[] = [];
  @Output() onEvent = new EventEmitter<string>();

  constructor() { }

  ngOnInit(): void {

  }

  toggleDetails(shape: Shape) {
    shape.detailsToggled = !shape.detailsToggled;
  }

  goToArea(shape: Shape) {

  }
}
