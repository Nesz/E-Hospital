import { Injectable } from '@angular/core';
import { Dicom, request } from '../model/dicom';
import { Observable } from 'rxjs';
import { HttpClient, HttpEvent, HttpRequest } from "@angular/common/http";
import { map } from 'rxjs/operators';
import { OrderDirection, Page, Role, Measurement, User } from "../model/interfaces";
import { Download, download } from "../model/download";

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

  public getInstanceMetaForSeries(seriesId: string) {
    return this.http.get<request>(
        `https://localhost:5001/api/series/${seriesId}/meta`
      )
      .pipe(
        map((x) => {
          return new Dicom(x.preamble, x.prefix, x.dataset);
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

  public addArea(seriesId: string, measurement: Measurement) {
    return this.http.post<Measurement>(`https://localhost:5001/api/series/${seriesId}/area`, {
      label: measurement.label,
      orientation: measurement.orientation,
      slice: measurement.slice,
      vertices: measurement.vertices.map(x => [x[0] | 0, x[1] | 0])
    })
    .pipe(map(s => measurement.id = s.id))
  }

  public deleteArea(seriesId: number, measurement: Measurement) {
    return this.http.delete(`https://localhost:5001/api/series/${seriesId}/area/${measurement.id}`)
  }

  public updateAreaLabel(seriesId: number, measurement: Measurement) {
    return this.http.patch(`https://localhost:5001/api/series/${seriesId}/area/${measurement.id}`, {
      label: measurement.label
    })
  }

  public getAreas(seriesId: string) {
    return this.http.get<Measurement[]>(`https://localhost:5001/api/series/${seriesId}/area`)
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

  get3DTexture(seriesId: string): Observable<Download> {
    return this.http.get(`https://localhost:5001/api/series/${seriesId}/stream`, {
      responseType: 'arraybuffer',
      observe: 'events',
      reportProgress: true
    }).pipe(download());
  }
}
