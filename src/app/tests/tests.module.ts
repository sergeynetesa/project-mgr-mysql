import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


import { NgMaterialModule } from 'src/app/shared/ng-material.module';
import { MaterialModule } from './material.module';


@NgModule({
  declarations: [

  ],
  imports: [
    CommonModule,
    FormsModule, ReactiveFormsModule,
    RouterModule,

    NgMaterialModule,
    MaterialModule,

  ],
  exports: [


  ]
})
export class TestsModule {}
