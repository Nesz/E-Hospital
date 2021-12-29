import { Injectable } from '@angular/core';
import { Dicom, request } from '../model/dicom';
import { Observable, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

export interface DicomMeta {
  id: number;
  patientId: string;
  studyId: string;
  seriesId: string;
  instanceId: number;
  mongoId: string;
}

export interface SeriesMeta {
  patientId: string;
  studyId: string;
  seriesId: string;
  instancesCount: number;
  instances: number[];
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private readonly http: HttpClient) {}

  public getDicomFrame(args: {
    patientId: string;
    studyId: string;
    seriesId: string;
    instanceId: number;
  }): Observable<ArrayBuffer> {
    return this.http.get(
      `https://localhost:5001/dicom/${args.patientId}/${args.studyId}/${args.seriesId}/${args.instanceId}/frame`,
      {
        responseType: 'arraybuffer',
      }
    );
  }

  public getDicomMetadata(args: {
    patientId: string;
    studyId: string;
    seriesId: string;
    instanceId: number;
  }) {
    return this.http
      .get<request>(
        `https://localhost:5001/dicom/${args.patientId}/${args.studyId}/${args.seriesId}/${args.instanceId}/meta`
      )
      .pipe(
        map((x) => {
          return new Dicom(x.preamble, x.prefix, x.entries);
        })
      );
  }

  public getSeriesMetadata(args: { patientId: string; studyId: string; seriesId: string }) {
    return this.http.get<SeriesMeta>(
      `https://localhost:5001/dicom/${args.patientId}/${args.studyId}/${args.seriesId}`
    );
  }

  public getList(): Observable<DicomMeta[]> {
    return this.http.get<DicomMeta[]>('https://localhost:5001/WeatherForecast');
  }
}
