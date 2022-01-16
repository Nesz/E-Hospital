import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { User } from "../../model/user";
import { ApiService, Series } from "../../services/api.service";
import { TableComponent } from "../../components/table/table.component";
import { HttpEventType } from "@angular/common/http";

@Component({
  selector: 'app-patient',
  templateUrl: './patient.component.html',
  styleUrls: ['./patient.component.scss']
})
export class PatientComponent implements OnInit, AfterViewInit {
  @ViewChild('table') table!: TableComponent<Series>;

  patientId!: string;
  patient!: User;

  headers = [
    { name: '#', sortable: false, accessor: (series: Series) => 0 },
    { name: 'study id', sortable: true, accessor: (series: Series) => series.study.id },
    { name: 'series id', sortable: true, accessor: (series: Series) => series.id },
    { name: 'description', sortable: false, accessor: (series: Series) => series.description },
    { name: 'modality', sortable: false, accessor: (series: Series) => series.modality },
    { name: 'date', sortable: true, accessor: (series: Series) => series.date },
    { name: 'instances', sortable: true, accessor: (series: Series) => series.instances.length },
  ]

  private files: File[] = [];

  constructor(
    private readonly api: ApiService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) { }

  ngOnInit(): void {
    const routeParams = this.route.snapshot.paramMap;
    this.patientId = routeParams.get('patientId')!;
    this.api.getUser(this.patientId)
      .subscribe(user => {
        this.patient = user;
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
    this.api.uploadFiles(this.patientId, this.files)
      .subscribe(event => {
        switch (event.type) {
          case HttpEventType.Sent:
            console.log('Request sent!');
            break;
          case HttpEventType.ResponseHeader:
            console.log('Response header received!');
            break;
          case HttpEventType.Response:
            console.log('😺 Done!');
            break;
          case HttpEventType.UploadProgress:
            console.log(`progress: ${ Math.round(100 * event.loaded / event.total!) }`)
            break;
        }
      })
  }
}
