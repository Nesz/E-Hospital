import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { HttpClientModule } from '@angular/common/http';
import { EditorComponent } from './components/editor/editor.component';
import { DicomViewComponent } from './pages/dicom-view/dicom-view.component';
import { StudiesComponent } from './pages/studies/studies.component';

@NgModule({
  declarations: [AppComponent, NavbarComponent, EditorComponent, DicomViewComponent, StudiesComponent],
  imports: [BrowserModule, AppRoutingModule, HttpClientModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
