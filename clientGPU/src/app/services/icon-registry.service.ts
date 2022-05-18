import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { of } from "rxjs";
import { map } from "rxjs/operators";

const ICONS = [
  'reset',
  'eye_on',
  'eye_off',
  'delete',
  'double_left',
  'double_right',
  'triangle',
  'goto',
  'logout',
  'user',
  'grid',
  'move',
  'contrast',
  'rotate',
  'select',
  'zoom',
  'cursor',
  'bell',
  'upload',
  'sort',
  'left',
  'right',
  'search',
  'folder',
  'settings',
  'double_left',
  'double_right',
]

@Injectable({
  providedIn: 'root'
})
export class IconRegistryService {

  private readonly registeredIcons: {[key: string]: string | undefined} = {};

  constructor(private readonly http: HttpClient) {
    ICONS.map(name => {
      this.registeredIcons[name] = undefined;
    });
  }

  /*const icons = ICONS.map(path => {
    return this.http.get(path, { responseType: 'text' })
      .pipe(map(data => {
        return {
          name: IconRegistryService.getFilename(path),
          data: data
        }
      }))
  })*/
  requestIcon = (iconName: string) => {
    const icon = this.registeredIcons[iconName];
    if (icon) {
      return of(icon)
    }
    const path = `assets/${iconName}.svg`
    return this.http.get(path, { responseType: 'text' })
      .pipe(map(data => {
        this.registeredIcons[iconName] = data;
        return data;
      }));
  }

  private static getFilename(path: string) {
    const filenameWithExtension = path.substring(path.lastIndexOf('/') + 1);
    return  filenameWithExtension.substring(0, filenameWithExtension.lastIndexOf('.'));
  }
}
