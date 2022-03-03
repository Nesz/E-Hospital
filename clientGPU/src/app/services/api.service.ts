import { Injectable } from '@angular/core';
import { Dicom, request } from '../model/dicom';
import { Observable } from 'rxjs';
import { HttpClient, HttpEvent, HttpRequest } from "@angular/common/http";
import { map } from 'rxjs/operators';
import { Shape, User } from "../model/interfaces";
import { OrderDirection, Page, Role } from "../model/enums";

export interface Series {
  id: number;
  originalId: string;
  description: string;
  modality: string;
  date: string;
  study: Study
  instances: Instance[];
}

export interface Instance {
  id: number;
  originalId: string;
}

export interface Study {
  id: number;
  originalId: string;
  description: string;
  date: string;
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private readonly http: HttpClient) {}

  public getInstanceStream(instanceId: number): Observable<ArrayBuffer> {
    return this.http.get(
      `https://localhost:5001/api/instances/${instanceId}`,
      {
        responseType: 'arraybuffer',
      }
    );
  }

  public getInstanceMeta(instanceId: number) {
    return this.http.get<request>(
        `https://localhost:5001/api/instances/${instanceId}/meta`
      )
      .pipe(
        map((x) => {
          return new Dicom(x.preamble, x.prefix, x.entries);
        })
      );
  }

  public getSeriesMetadata(args: { patientId: string; seriesId: string }) {
    return this.http.get<Series>(
      `https://localhost:5001/api/series/${args.patientId}/${args.seriesId}`
    );
  }

  public uploadFiles(patientId: string, files: File[]): Observable<HttpEvent<any>> {
    const formData: FormData = new FormData();
    files.forEach(file => formData.append('files', file));
    const req = new HttpRequest('POST', `https://localhost:5001/api/dicom/${patientId}`, formData,
      {
        reportProgress: true
      });
    //return this.http.post<HttpEvent<any>>(`https://localhost:5001/api/dicom/${patientId}`, formData, {
    //  reportProgress: true
    //})
    return this.http.request(req);
  }

  public getSeriesList(patientId: string, pageNumber: number, pageSize: number) {
    return this.http.get<Page<Series>>(
      `https://localhost:5001/api/series/${patientId}`, {
        params: {
          pageNumber: pageNumber,
          pageSize: pageSize
        }
      }
    );
  }

  public addArea(seriesId: string, shape: Shape) {
    return this.http.post(`https://localhost:5001/api/series/${seriesId}/area`, {
      label: shape.label,
      orientation: shape.orientation,
      slice: shape.slice,
      vertices: shape.vertices.map(x => x | 0)
    })
  }

  public getAreas(seriesId: string) {
    return this.http.get<Shape[]>(`https://localhost:5001/api/series/${seriesId}/area`)
  }

  public getPatientsList(args: {
    pageNumber: number,
    pageSize: number,
    pageOrder: string,
    orderDirection: OrderDirection,
    keyFilter: string,
    roleFilter: Role
  }) {
    console.log(args)
    return this.http.get<Page<User>>('https://localhost:5001/api/user', {
      params: args
    });
  }

  getUser(patientId: string) {
    return this.http.get<User>(`https://localhost:5001/api/user/${patientId}`);
  }
}
