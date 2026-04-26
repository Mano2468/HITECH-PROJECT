import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ViewPatientsComponent } from './view-patients/view-patients.component';

const routes: Routes = [
  {
    path: 'viewPatients',
    component: ViewPatientsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)]
})
export class PatientCareModule {}
