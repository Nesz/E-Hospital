import { AfterViewInit, Component, ViewChild, ViewEncapsulation } from "@angular/core";
import { ApiService, Series } from "../../services/api.service";
import { Header, TableComponent } from "../../components/table/table.component";
import { Router } from "@angular/router";
import { HeaderSorted, User } from "../../model/interfaces";
import { OrderDirection, Role } from "../../model/enums";

@Component({
  selector: 'app-patients',
  templateUrl: './patients.component.html',
  styleUrls: ['./patients.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PatientsComponent implements AfterViewInit {
  @ViewChild('table') table!: TableComponent<User>;

  filter: string = '';
  headers = [
    { name: '#', sortable: false, accessor: (user: User) => 0 },
    { name: 'id', efField: 'Id', sortable: true, accessor: (user: User) => user.id },
    { name: 'first name', efField: 'FirstName', sortable: true, accessor: (user: User) => user.firstName },
    { name: 'last name', efField: 'LastName', sortable: true, accessor: (user: User) => user.lastName  },
    { name: 'e-mail', sortable: false, accessor: (user: User) => user.email },
    { name: 'role', sortable: false, accessor: (user: User) => user.role },
  ]

  constructor(
    private readonly router: Router,
    private readonly api: ApiService
  ) { }

  ngAfterViewInit() {
    this.table.pageRequested.subscribe(request => {
      this.api.getPatientsList({
        pageNumber: request.pageNumber,
        pageSize: request.itemsPerPage,
        pageOrder: this.table.sortedBy ? (this.table.sortedBy.header as HeaderSorted<User>).efField : 'Id',
        orderDirection: this.table.sortedBy ? this.table.sortedBy.order : OrderDirection.ASCENDING,
        keyFilter: this.filter,
        roleFilter: Role.Patient
      }).subscribe((page) => {
        this.table.page = page;
      });
    })
  }

  ngOnInit(): void {
    this.api.getPatientsList({
      pageNumber: 1,
      pageSize: 10,
      pageOrder: 'Id',
      orderDirection: OrderDirection.ASCENDING,
      keyFilter: this.filter,
      roleFilter: Role.Patient
    }).subscribe((page) => {
      this.table.page = page;
    });
  }

  onFilterChange($event: string) {
    this.filter = $event;
    this.table.requestPage(1)
  }

  goToPatient($event: User) {
    this.router.navigate([`/patient/${$event.id}`])
  }
}
