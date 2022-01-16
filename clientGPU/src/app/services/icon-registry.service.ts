import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { forkJoin } from "rxjs";
import { map, retry, tap } from "rxjs/operators";

const ICONS = [
  'assets/sort.svg',
  'assets/left.svg',
  'assets/right.svg',
  'assets/logout.svg',
  'assets/search.svg',
  'assets/folder.svg',
  'assets/settings.svg',
  'assets/double_left.svg',
  'assets/double_right.svg',
]

@Injectable({
  providedIn: 'root'
})
export class IconRegistryService {

  readonly registeredIcons: {[key: string]: string} = {};

  constructor(private readonly http: HttpClient) {}

  loadAssets = () => {

    const icons = ICONS.map(path => {
      return this.http.get(path, { responseType: 'text' })
        .pipe(map(data => {
          return {
            name: IconRegistryService.getFilename(path),
            data: data
          }
        }))
    })

    return forkJoin(icons).pipe(tap(icons => {
      icons.forEach(icon => {
        this.registeredIcons[icon.name] = icon.data
      })
    }));
  };

  private static getFilename(path: string) {
    const filenameWithExtension = path.substring(path.lastIndexOf('/') + 1);
    return  filenameWithExtension.substring(0, filenameWithExtension.lastIndexOf('.'));
  }
}
