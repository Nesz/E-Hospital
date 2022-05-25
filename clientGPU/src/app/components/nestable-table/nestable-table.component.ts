import { Component, Input, OnInit } from "@angular/core";

export interface Row {
  isNested: boolean
  selfData: string[]
  data: (string | Row)[]
}

export interface TableData {
  headers: string[],
  rows: Row[]
}

@Component({
  selector: 'app-nestable-table',
  templateUrl: './nestable-table.component.html',
  styleUrls: ['./nestable-table.component.scss']
})
export class NestableTableComponent implements OnInit {
  @Input() data!: TableData;

  constructor() { }

  ngOnInit(): void {
  }

}
