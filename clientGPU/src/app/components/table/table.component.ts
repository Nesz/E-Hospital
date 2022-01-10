import { Component, EventEmitter, Input, OnInit } from "@angular/core";
import { ApiService } from "../../services/api.service";

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit {

  @Input() pageCurrent!: number;
  @Input() pageTotal!: number;
  @Input() pageSize!: number;
  @Input() tableHeaders!: string[];
  @Input() tableData!: string[][];
  @Input() getPage!: (page: number) => void;

  constructor(private api: ApiService) { }

  ngOnInit(): void {
    //this.api.getPatientsList()
  }

}
