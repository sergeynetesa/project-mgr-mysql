import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  MatButtonModule,
  MatCardModule,
  MatDialogModule,
  MatIconModule
} from '@angular/material';

import { AboutComponent } from './about.component';
@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatIconModule
  ],
  declarations: [
    AboutComponent,
  ],
  exports: [
    AboutComponent,
  ]
})
export class AboutModule { }
