import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from "../../services/authentication.service";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { SignalRService } from "../../services/signal-r.service";
import { Role } from "../../model/interfaces";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  isSignInForm = true;

  signInForm = this.formBuilder.group({
    email: ['', Validators.required],
    password: ['', Validators.required]
  })

  signUpForm = this.formBuilder.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', Validators.required, Validators.email],
    phoneNumber: ['', Validators.required],
    birthDate: ['', Validators.required],
    gender: ['', Validators.required],
    password: ['', Validators.required],
    repassword: ['', Validators.required],
  })

  constructor(
    private readonly router: Router,
    private readonly auth: AuthenticationService,
    private readonly formBuilder: FormBuilder,
    private readonly signalR: SignalRService
  ) { }

  ngOnInit(): void {

  }

  signIn() {
    this.markAllAsTouched(this.signInForm);
    if (!this.formHasError(this.signInForm)) {
      this.auth.signIn(
        this.signInForm.value.email,
        this.signInForm.value.password,
      ).subscribe(x => {
        this.signalR.startConnection();
        if (Role.Patient === x.role)
          this.router.navigate([`/patient/${x.id}`])
        else
          this.router.navigate([`/patients`])
      })
    }

  }

  signUp() {
    this.markAllAsTouched(this.signUpForm);
    if (!this.formHasError(this.signUpForm)) {
      this.auth.signUp({
        firstName: this.signUpForm.value.firstName,
        lastName: this.signUpForm.value.lastName,
        email: this.signUpForm.value.email,
        phoneNumber: this.signUpForm.value.phoneNumber,
        birthDate: this.signUpForm.value.birthDate,
        gender: this.signUpForm.value.gender,
        password: this.signUpForm.value.password,
      }).subscribe(x => {
        this.signalR.startConnection();
        this.router.navigate([`/patient/${x.id}`])
      })
    }
  }

  markAllAsTouched(form: FormGroup) {
    Object.keys(form.controls).forEach(field => {
      form.get(field)?.markAsTouched({ onlySelf: true });
    });
  }

  isInvalid(form: FormGroup, key: string) {
    return form.controls[key].touched && this.hasError(form, key);
  }

  formHasError(form: FormGroup) {
    for (let key of Object.keys(form.controls)) {
      if (this.hasError(form, key)) return true;
    }
    return false;
  }

  hasError(form: FormGroup, formKey: string) {
    // @ts-ignore
    const errors = form.controls[formKey].errors;
    if (!errors) return false;
    for (const [key, value] of Object.entries(errors)) {
      console.log(`${key}: ${value}`);
      if (value === true) return true;
    }
    return false;
  }
}
