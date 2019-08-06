import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, NG_VALIDATORS } from '@angular/forms';

import {
  MatButtonModule,
  MatCardModule,
  MatCheckboxModule,
  MatDialogModule,
  MatIconModule,
  MatFormFieldModule,
  MatInputModule,
  MatRadioModule,
  MatSelectModule,
  MatTabsModule,
  MatProgressBarModule,
  MatProgressSpinnerModule
} from '@angular/material';

import { SignupFormComponent } from './signup-form/signup-form.component';
import { ProjectEditComponent } from './project-edit/project-edit.component';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { TaskEditComponent } from './task-edit/task-edit.component';
import { AboutImageDialogComponent } from './about-image-dialog/about-image-dialog.component';

@NgModule({
  declarations: [
    SignupFormComponent,
    ProjectEditComponent,
    ConfirmDialogComponent,
    TaskEditComponent,
    AboutImageDialogComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatCheckboxModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    MatSelectModule,
    MatTabsModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
  ],
  entryComponents: [
    ConfirmDialogComponent,
    AboutImageDialogComponent
  ],
  providers: [
    // Uuid4Service,
    // UserService
  ],
  // exports: [
  //   SignupFormComponent,
  //   ProjectEditComponent
  // ]
})
export class PrjFormsModule { }
