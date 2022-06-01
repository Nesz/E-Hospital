import { APP_INITIALIZER, NgModule } from "@angular/core";
import { RouterModule, Routes } from '@angular/router';
import { EditorComponent } from './components/editor/editor.component';
import { LoginComponent } from "./pages/login/login.component";
import { AuthenticationGuard } from "./guards/authentication.guard";
import { AuthenticationService } from "./services/authentication.service";
import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { TokenInterceptor } from "./interceptors/token.interceptor";
import { HomeComponent } from "./pages/home/home.component";
import { PatientsComponent } from "./pages/patients/patients.component";
import { NotAuthenticatedGuard } from "./guards/not-authenticated.guard";
import { PatientComponent } from "./pages/patient/patient.component";
import { SignalRService } from "./services/signal-r.service";
import { IconRegistryService } from "./services/icon-registry.service";

const initializer = (auth: AuthenticationService, signalR: SignalRService): (() => Promise<void>) => {
  if (!localStorage.getItem('access_token')) {
    return () => Promise.resolve();
  }

  return () =>
    auth
      .me()
      .toPromise()
      .then((result) => {
        return signalR.startConnection();
      })
      .catch((error) => console.log(error))
};

const initializeTags = (icons: IconRegistryService): (() => Promise<void>) => {
  return () =>
    icons
      .loadDefinitions()
      .toPromise()
      .then((result) => console.log())
      .catch((error) => console.log(error))
};

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    canActivate: [AuthenticationGuard],
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [NotAuthenticatedGuard],
  },
  {
    path: 'patients',
    component: PatientsComponent,
    canActivate: [AuthenticationGuard],
  },
  {
    path: 'patient/:patientId',
    component: PatientComponent,
    canActivate: [AuthenticationGuard],
  },
  {
    path: 'view/:patientId/:studyId/:seriesId',
    component: EditorComponent,
    canActivate: [AuthenticationGuard/*, RoleGuard*/]//,
    /*data: { roles: [Role.Admin, Role.Doctor] }*/
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [
    AuthenticationGuard,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    },
    {
      provide: APP_INITIALIZER,
      useFactory: initializer,
      deps: [AuthenticationService, SignalRService],
      multi: true,
    },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeTags,
      deps: [IconRegistryService],
      multi: true,
    },
  ],
})
export class AppRoutingModule {}
