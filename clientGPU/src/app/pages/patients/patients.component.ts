import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { AuthenticationService } from "../../services/authentication.service";
import { ApiService } from "../../services/api.service";
import { OrderDirection } from "../../model/order-direction";
import { Page } from "../../model/page";
import { User } from "../../model/user";

@Component({
  selector: 'app-patients',
  templateUrl: './patients.component.html',
  styleUrls: ['./patients.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PatientsComponent implements OnInit {

  filter: string = '';
  itemsPerPage = 10;
  headers = ['#', 'id', 'firstName', 'lastName', 'email']
  page!: Page<User>;
  rowHover = -1;

  constructor(
    private readonly api: ApiService
  ) { }

  ngOnInit(): void {
    this.api.getPatientsList({
      pageNumber: 1,
      pageSize: 10,
      pageOrder: 'Id',
      orderDirection: OrderDirection.ASCENDING,
      filterKey: ''
    }).subscribe((page) => {
      this.page = page;
    });
  }

  getField(index: number, field: string) {
    if (field === '#')
      return `[${index + 1}]`;
    // @ts-ignore
    return this.page?.data[index][field];
  }

  goToPage(number: number) {
    this.api.getPatientsList({
      pageNumber: number,
      pageSize: this.itemsPerPage,
      pageOrder: 'Id',
      orderDirection: OrderDirection.ASCENDING,
      filterKey: this.filter
    }).subscribe((page) => {
      this.page = page;
    });
  }

  onSelect(target: EventTarget | null) {
    this.itemsPerPage = Number((target as HTMLOptionElement).value)
    this.goToPage(1)
  }

  onFilterChange($event: string) {
    this.filter = $event;
    this.goToPage(1)
  }
}
