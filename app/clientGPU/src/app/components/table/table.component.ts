import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from "@angular/core";
import { Page, OrderDirection } from "../../model/interfaces";

export interface Header<T> {
  name: string,
  sortable: boolean,
  accessor: (t: T) => any,
}

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TableComponent<T> implements OnInit {

  OrderDirection = OrderDirection;

  itemsPerPage = 10;
  sortedBy?: {
    header: Header<T>,
    order: OrderDirection
  };

  @Input() displayControls = true;
  @Input() headers!: Header<T>[];
  @Output() onRowClick = new EventEmitter<T>();
  @Output() pageRequested = new EventEmitter<{
    pageNumber: number
    itemsPerPage: number
  }>();

  page!: Page<T>;

  constructor() { }

  ngOnInit(): void {

  }

  getField(index: number, header: Header<T>) {
    if (header.name === '#')
      return `[${((this.page.pageCurrent - 1) * this.itemsPerPage) + index + 1}]`;
    return header.accessor(this.page?.data[index]);
  }

  onSelect(target: EventTarget | null) {
    this.itemsPerPage = Number((target as HTMLOptionElement).value)
    this.requestPage(1)
  }

  requestPage(pageNumber: number) {
    this.pageRequested.emit({
      pageNumber: pageNumber,
      itemsPerPage: this.itemsPerPage
    })
  }

  sort(header: Header<T>) {
    if (header === this.sortedBy?.header) {
      if (OrderDirection.ASCENDING === this.sortedBy?.order) {
        this.sortedBy.order = OrderDirection.DESCENDING
      }
      else if (OrderDirection.DESCENDING === this.sortedBy?.order) {
        this.sortedBy = undefined;
      }
    }
    else {
      if (header.sortable) {
        this.sortedBy = {
          header: header,
          order: OrderDirection.ASCENDING
        }
      }
    }
    console.log(this.sortedBy)
    this.requestPage(1)
  }
}
