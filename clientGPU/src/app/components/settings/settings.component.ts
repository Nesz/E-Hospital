import { Component, forwardRef, Inject, Input, OnInit } from "@angular/core";
import { LookupTable } from "../../model/interfaces";
import { EditorComponent } from "../editor/editor.component";
import { CanvasPartComponent } from "../canvas-part/canvas-part.component";
import { mat3, vec2 } from "gl-matrix";
import { degreesToRadians, radiansToDegrees } from "../../helpers/canvas.helper";

export interface Settings {
  slice: {
    min: number,
    max: number,
    current: number
  },
  zoom: {
    min: number,
    max: number,
    current: number
  },
  windowing: {
    wc_min: number,
    wc_max: number,
    ww_min: number,
    ww_max: number,
    wc_current: number,
    ww_current: number,
    presets: {
      name: string,
      wc: number,
      ww: number
    }[]
  },
  luts: LookupTable[]
}

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  @Input() settings!: Settings;

  public isSynchronized: boolean = false;

  constructor(
    @Inject(forwardRef(() => EditorComponent)) public readonly editor: EditorComponent
  ) {

  }

  get scene(): CanvasPartComponent {
    return this.editor.currentCanvas;
  }

  ngOnInit(): void {

  }

  changeRotation(deg: number) {
    if (this.isSynchronized) {
      this.editor.canvases.forEach(ref => {
        this.rotate(ref.instance, deg);
      })
    } else {
      this.rotate(this.scene, deg);
    }
  }



  getZoom(zoom: number) {
    return Math.floor(zoom * 100)
  }

  radiansToDegrees(rotation: number) {
    return Math.floor(radiansToDegrees(rotation))
  }

  changeZoom($event: number) {
    if (this.isSynchronized) {
      this.editor.canvases.forEach(ref => {
        this.zoom(ref.instance, $event);
      })
    } else {
      this.zoom(this.scene, $event);
    }
  }

  changeLut($event: Event) {
    if (this.isSynchronized) {
      this.editor.canvases.forEach(ref => {
        const scene = ref.instance;
        scene.lut = this.editor.lookupTables
          .find(lut => lut.name === ($event.target as HTMLInputElement).value)!;
        this.editor.render(scene)
      })
    } else {
      this.scene.lut = this.editor.lookupTables
        .find(lut => lut.name === ($event.target as HTMLInputElement).value)!;
      this.editor.render(this.scene)
    }

  }

  private zoom(scene: CanvasPartComponent, $event: number) {
    const zoom =  $event / 100;
    const cam = scene.camera;

    const camMat = mat3.create();
    const dimensions = this.editor.getDimensionsForPlane(scene.plane);
    const cx = dimensions.width / 2;
    const cy = dimensions.height / 2;

    mat3.translate(camMat, camMat, vec2.fromValues(cx, cy));
    mat3.scale(camMat, camMat, vec2.fromValues(1 / (zoom / cam.zoom), 1 / (zoom / cam.zoom)));
    mat3.translate(camMat, camMat, vec2.fromValues(-cx, -cy));
    mat3.multiply(camMat, camMat, scene.camera.makeCameraMatrix());

    scene.camera.zoom = zoom;
    scene.camera.x = camMat[6];
    scene.camera.y = camMat[7];

    this.editor.render(scene)
  }

  private rotate(scene: CanvasPartComponent, degrees: number) {
    const radians = degreesToRadians(degrees);
    const camMat = mat3.create();

    const dimensions = this.editor.getDimensionsForPlane(scene.plane);
    const cx = dimensions.width / 2;
    const cy = dimensions.height / 2;

    mat3.translate(camMat, camMat, vec2.fromValues(cx, cy));
    mat3.rotate(camMat, camMat, radians - scene.camera.rotation);
    mat3.translate(camMat, camMat, vec2.fromValues(-cx, -cy));
    mat3.multiply(camMat, camMat, scene.camera.makeCameraMatrix());

    scene.camera.rotation = radians;
    scene.camera.x = camMat[6];
    scene.camera.y = camMat[7];

    this.editor.render(scene)
  }

  changeWW($event: number) {
    if (this.isSynchronized) {
      this.editor.canvases.forEach(ref => {
        const scene = ref.instance;
        scene.windowing.ww = $event;
        this.editor.render(scene)
      })
    } else {
      this.scene.windowing.ww = $event;
      this.editor.render(this.scene)
    }
  }

  changeWC($event: number) {
    if (this.isSynchronized) {
      this.editor.canvases.forEach(ref => {
        const scene = ref.instance;
        scene.windowing.wc = $event;
        this.editor.render(scene)
      })
    } else {
      this.scene.windowing.wc = $event;
      this.editor.render(this.scene)
    }
  }

  toggleInversion() {
    if (this.isSynchronized) {
      this.editor.canvases.forEach(ref => {
        const scene = ref.instance;
        scene.isInverted = !scene.isInverted;
        this.editor.render(scene)
      })
    } else {
      this.scene.isInverted = !this.scene.isInverted;
      this.editor.render(this.scene)
    }
  }
}
