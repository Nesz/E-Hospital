import { AfterViewInit, Component, Input, OnInit, SimpleChanges, ViewEncapsulation } from "@angular/core";
import { IconRegistryService } from "../../services/icon-registry.service";
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-icon',
  templateUrl: './icon.component.html',
  styleUrls: ['./icon.component.scss'],
  //encapsulation: ViewEncapsulation.None
})
export class IconComponent implements OnInit {

  @Input() icon!: string;
  data!: SafeHtml;

  constructor(
    private readonly registry: IconRegistryService,
    private readonly sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.registry.requestIcon(this.icon)
      .subscribe(iconData => this.data = this.sanitizer.bypassSecurityTrustHtml(iconData))
  }

  ngOnChanges(changes: SimpleChanges) {
    this.registry.requestIcon(this.icon)
      .subscribe(iconData => this.data = this.sanitizer.bypassSecurityTrustHtml(iconData))
  }

}
