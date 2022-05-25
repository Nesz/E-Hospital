import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { EditorComponent } from './components/editor/editor.component';

const routes: Routes = [
  {
    path: '',
    component: AppComponent,
  },
  {
    path: 'view/:patientId/:studyId/:seriesId',
    component: EditorComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
