import { Injectable } from '@angular/core';
import { Dicom, request } from '../model/dicom';
import { Observable, Subject } from 'rxjs';
import { HttpClient, HttpEvent, HttpRequest } from "@angular/common/http";
import { map } from 'rxjs/operators';
import { User } from "../model/user";
import { OrderDirection } from "../model/order-direction";
import { Page } from "../model/page";
import { Role } from "../model/role";

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

  public getSeriesList(patientId: string, pageNumber: number, pageSize: number,) {
    return this.http.get<Page<Series>>(
      `https://localhost:5001/api/series/${patientId}`, {
        params: {
          pageNumber: pageNumber,
          pageSize: pageSize
        }
      }
    );
  }

  public getPatientsList(args: {
    pageNumber: number,
    pageSize: number,
    pageOrder: string,
    orderDirection: OrderDirection,
    filterKey: string,
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
