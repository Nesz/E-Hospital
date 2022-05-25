import {
  HttpEvent,
  HttpEventType,
  HttpProgressEvent,
  HttpResponse
} from "@angular/common/http";
import { Observable } from "rxjs";
import { distinctUntilChanged, scan, map, tap } from "rxjs/operators";

function isHttpResponse<T>(event: HttpEvent<T>): event is HttpResponse<T> {
  return event.type === HttpEventType.Response;
}

function isHttpProgressEvent(
  event: HttpEvent<unknown>
): event is HttpProgressEvent {
  return (
    event.type === HttpEventType.DownloadProgress ||
    event.type === HttpEventType.UploadProgress
  );
}

export interface Download {
  content: ArrayBuffer | null;
  progress: number;
  state: "PENDING" | "IN_PROGRESS" | "DONE";
}

export function download(): (source: Observable<HttpEvent<ArrayBuffer>>) => Observable<Download> {
  return (source: Observable<HttpEvent<ArrayBuffer>>) =>
    source.pipe(
      scan(
        (download: Download, event): Download => {
          if (isHttpProgressEvent(event)) {
            return {
              progress: event.total
                ? Math.round((100 * event.loaded) / event.total)
                : download.progress,
              state: "IN_PROGRESS",
              content: null
            };
          }
          if (isHttpResponse(event)) {
            return {
              progress: 100,
              state: "DONE",
              content: event.body
            };
          }
          return download;
        },
        { state: "PENDING", progress: 0, content: null }
      ),
      distinctUntilChanged((a, b) => a.state === b.state
        && a.progress === b.progress
        && a.content === b.content
      )
    );
}
