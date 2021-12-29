import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { combineLatest, forkJoin } from 'rxjs';
import { combineAll } from 'rxjs/operators';

@Component({
  selector: 'app-studies',
  templateUrl: './studies.component.html',
  styleUrls: ['./studies.component.scss'],
})
export class StudiesComponent implements OnInit {
  studies: any;

  constructor(private readonly api: ApiService) {}

  ngOnInit(): void {
    console.log('x');
    const groups = ['patientId', 'studyId', 'seriesId'];
    const grouped: any[] = [];

    /*this.api.getList().subscribe((x) => {
      x.forEach((a: any) => {
        const group = groups.reduce((o: any, g: any, i: number) => {
          o[a[g]] = o[a[g]] || (i + 1 === groups.length ? [] : {});
          return o[a[g]];
        }, grouped);
        group.push(a);
        group.length = Object.keys(group).length;
      });

      this.studies = grouped;
    });*/
  }

  keys(studies: any) {
    console.log(Object.keys(studies)[0]);
    return Object.keys(studies);
  }

  getKey(src: any, key: any) {
    console.log(Object.keys(src[key]).find((x) => x === key));
    return Object.keys(src)!.find((x) => x === key)![0];
  }
}
