import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ApiService, Series } from "../../services/api.service";
import { TableComponent } from "../../components/table/table.component";
import { HttpEventType } from "@angular/common/http";
import { SignalRService } from "../../services/signal-r.service";
import { OrderDirection, Role, User } from "../../model/interfaces";
import { AuthenticationService } from "../../services/authentication.service";

@Component({
  selector: 'app-patient',
  templateUrl: './patient.component.html',
  styleUrls: ['./patient.component.scss'],
  //encapsulation: ViewEncapsulation.None
})
export class PatientComponent implements OnInit, AfterViewInit {
  role = Role;

  @ViewChild('table') table!: TableComponent<Series>;
  @ViewChild('table2') table2!: TableComponent<User>;
  @ViewChild('filesInput') filesInput!: HTMLInputElement;

  current: number = 0;
  total: number = 0;

  isBeingUploaded: boolean = false;
  uploadProgress: number = 0;

  patientId!: string;
  patient!: User;
  currentUser?: User;

  headers_patient = [
    { name: 'patient ID', sortable: true, accessor: (patient: User) => patient.id },
    { name: 'email', sortable: true, accessor: (patient: User) => patient.email },
    { name: 'first name', sortable: false, accessor: (patient: User) => patient.firstName },
    { name: 'last name', sortable: false, accessor: (patient: User) => patient.lastName },
    { name: 'Birth Date', sortable: true, accessor: (patient: User) => patient.birthDate },
    { name: 'phone number', sortable: true, accessor: (patient: User) => patient.phoneNumber },
    { name: 'gender', sortable: true, accessor: (patient: User) => patient.gender },
  ]

  headers = [
    { name: '#', sortable: false, accessor: (series: Series) => 0 },
    { name: 'study id', sortable: false, accessor: (series: Series) => series.study.id },
    { name: 'series id', sortable: false, accessor: (series: Series) => series.id },
    { name: 'description', sortable: false, accessor: (series: Series) => series.description },
    { name: 'modality', sortable: false, accessor: (series: Series) => series.modality },
    { name: 'date', sortable: false, accessor: (series: Series) => series.date },
    { name: 'instances', sortable: false, accessor: (series: Series) => series.instances.length },
  ]

  files: File[] = [];

  constructor(
    private readonly api: ApiService,
    private readonly auth: AuthenticationService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly signalR: SignalRService,
  ) { }

  ngOnInit(): void {
    const routeParams = this.route.snapshot.paramMap;
    this.patientId = routeParams.get('patientId')!;
    this.api.getUser(this.patientId)
      .subscribe(user => {
        this.patient = user;
        this.table2.page = {
          pageCurrent: 0,
          pageSize: 1,
          pageTotal: 1,
          pageOrder: 'id',
          orderDirection: OrderDirection.ASCENDING,
          data: [this.patient]
        }
      })

    this.auth.user.subscribe(user => {
      this.currentUser = user;
    })

    this.api.getSeriesList(this.patientId, 1, 10).subscribe((page) => {
      this.table.page = page;
    });
  }

  ngAfterViewInit() {
    this.table.pageRequested.subscribe(request => {
      this.api.getSeriesList(
        this.patientId,
        request.pageNumber,
        request.itemsPerPage,
      ).subscribe((page) => {
        this.table.page = page;
      });
    })
  }

  goToSeries($event: Series) {
    this.router.navigate([`/view/${this.patientId}/${$event.study.id}/${$event.id}`])
  }

  filesChanged($event: Event) {
    const files = ($event.target as HTMLInputElement).files!;
    this.files = Array.from(files);
  }

  upload() {
    this.isBeingUploaded = true;
    this.uploadProgress = 0;
    this.api.uploadFiles(this.patientId, this.files)
      .subscribe(event => {
        switch (event.type) {
          case HttpEventType.Response:
            this.signalR.listen(event.body.id).subscribe((data) => {
              const progress = Math.round(100 * data?.currentProgress / data?.totalProgress);
              this.uploadProgress = progress;
              if (progress === 100) {
                this.api.getSeriesList(this.patientId, 1, 10).subscribe((page) => {
                  this.table.page = page;
                  this.isBeingUploaded = false;
                  this.files = [];

                });
              }
            })

            break;
          case HttpEventType.UploadProgress:
            this.total = event.total! + this.files.length
            this.current = event.loaded
            const progress = Math.round(100 * event.loaded / (event.total! + this.files.length));
            this.uploadProgress = progress;
            break;
        }
      })
  }

  getFilesText() {
    if (this.files.length === 0)
      return 'Choose files.'
    return `${this.files.length} files`;
  }
}
