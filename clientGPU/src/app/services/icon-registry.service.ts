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

export interface Tag {
  vr: string,
  name: string
}

@Injectable({
  providedIn: 'root'
})
export class IconRegistryService {

  private readonly registeredIcons: {[key: string]: string | undefined} = {};
  private readonly tagDefinitions: {[key: string]: Tag | undefined} = {};

  constructor(private readonly http: HttpClient) {
    ICONS.map(name => {
      this.registeredIcons[name] = undefined;
    });
  }

  loadDefinitions = () => {
    return this.http.get(`assets/attribs.csv`, { responseType: 'text' })
      .pipe(map(data => {
        console.log("getting")
        const rows = data.split('\n');
        rows.map(row => {
          const split = row.split(';');
          this.tagDefinitions[split[0] + split[1]] = {
            vr: split[2],
            name: split[3]
          }
        })
        return data;
      }));
  }

  getTagDefinition = (tagStr: string) => {
    const tag = this.tagDefinitions[tagStr];
    if (tag) {
      return tag.name;
    }
    return 'unknown'
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
