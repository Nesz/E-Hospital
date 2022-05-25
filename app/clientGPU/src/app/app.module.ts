import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { HttpClientModule } from '@angular/common/http';
import { EditorComponent } from './components/editor/editor.component';
import { DicomViewComponent } from './pages/dicom-view/dicom-view.component';
import { ProgressRingComponent } from './components/progress-ring/progress-ring.component';
import { CanvasPartComponent } from './components/canvas-part/canvas-part.component';
import { LoginComponent } from './pages/login/login.component';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HomeComponent } from './pages/home/home.component';
import { PatientsComponent } from './pages/patients/patients.component';
import { TableComponent } from './components/table/table.component';
import { IconComponent } from './components/icon/icon.component';
import { DelayedInputComponent } from './delayed-input/delayed-input.component';
import { PatientComponent } from './pages/patient/patient.component';
import { ClickOutsideDirective } from "./directives/click-outside.directive";
import { AreasSidebarComponent } from './components/areas-sidebar/areas-sidebar.component';
import { NestableTableComponent } from './components/nestable-table/nestable-table.component';
import { KeysPipe } from './pipes/keys.pipe';
import { InputRangeComponent } from './components/input-range/input-range.component';
import { SettingsComponent } from './components/settings/settings.component';
import { HistogramComponent } from './components/histogram/histogram.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    EditorComponent,
    DicomViewComponent,
    ProgressRingComponent,
    CanvasPartComponent,
    LoginComponent,
    HomeComponent,
    PatientsComponent,
    TableComponent,
    IconComponent,
    DelayedInputComponent,
    PatientComponent,
    ClickOutsideDirective,
    AreasSidebarComponent,
    NestableTableComponent,
    KeysPipe,
    InputRangeComponent,
    SettingsComponent,
    HistogramComponent,
  ],
  imports: [BrowserModule, AppRoutingModule, HttpClientModule, FormsModule, ReactiveFormsModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
