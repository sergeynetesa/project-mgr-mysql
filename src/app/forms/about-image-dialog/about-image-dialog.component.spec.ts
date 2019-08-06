import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NgMaterialModule } from '../../shared/ng-material.module';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

import { AboutImageDialogComponent } from './about-image-dialog.component';

describe('AboutImageDialogComponent', () => {
  let component: AboutImageDialogComponent;
  let fixture: ComponentFixture<AboutImageDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AboutImageDialogComponent ],
      imports: [
        NgMaterialModule,
      ],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: [] }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AboutImageDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('01 - should be created', () => {
    expect(component).toBeTruthy();
  });
});
