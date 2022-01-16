import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { User } from "../../model/user";
import { AuthenticationService } from "../../services/authentication.service";
import { Router } from "@angular/router";
import { Role } from "../../model/role";

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SidebarComponent implements OnInit {

  role = Role;

  user?: User;

  constructor(
    private readonly router: Router,
    private readonly auth: AuthenticationService) { }

  ngOnInit(): void {
    this.auth.user.subscribe(user => {
      this.user = user;
    })
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login'])
  }
}
