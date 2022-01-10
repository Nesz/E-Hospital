import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from "../../services/authentication.service";
import { FormBuilder } from "@angular/forms";
import { Router } from "@angular/router";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  form = this.formBuilder.group({
    email: 'ahah@p2.pl',
    password: 'haslo'
  })

  constructor(
    private readonly router: Router,
    private readonly auth: AuthenticationService,
    private readonly formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
  }

  signIn() {
    this.auth.signIn(
      this.form.value.email,
      this.form.value.password,
    ).subscribe(x => {
      this.router.navigate(['/'])
    })
  }
}
