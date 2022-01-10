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
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { PatientsComponent } from './pages/patients/patients.component';
import { TableComponent } from './components/table/table.component';
import { IconComponent } from './components/icon/icon.component';
import { DelayedInputComponent } from './delayed-input/delayed-input.component';

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
    SidebarComponent,
    PatientsComponent,
    TableComponent,
    IconComponent,
    DelayedInputComponent,
  ],
  imports: [BrowserModule, AppRoutingModule, HttpClientModule, FormsModule, ReactiveFormsModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
