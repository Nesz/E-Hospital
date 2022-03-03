import { Component, ElementRef, ViewChild, ViewEncapsulation } from "@angular/core";
import { Router } from "@angular/router";
import { AuthenticationService } from "../../services/authentication.service";
import { User } from "../../model/interfaces";
import { Role } from "../../model/enums";

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class NavbarComponent {
  @ViewChild('more', {read: ElementRef}) more!: ElementRef;
  isUserMenuEnabled = false;
  role = Role;
  user?: User;


  constructor(
    private readonly router: Router,
    private readonly auth: AuthenticationService
  ) { }

  ngOnInit(): void {
    this.auth.user.subscribe(user => {
      this.user = user;
    })
  }

  on() {
    this.isUserMenuEnabled = true
  }

  off($event: MouseEvent) {
    if (!this.more.nativeElement.contains($event.target)) {
      this.isUserMenuEnabled = false
    }
  }

  logout() {
    this.auth.logout();
    this.user = undefined;
    this.isUserMenuEnabled = false;
    this.router.navigate(['/']);
  }

  goToPatient() {
    this.router.navigate([`/patient/${this.user?.id}`])
  }
}
