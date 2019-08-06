import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BrowserModule, By } from '@angular/platform-browser';
import {BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { DebugElement } from '@angular/core';

import { NgMaterialModule } from '../../shared/ng-material.module';

import { SignupFormComponent } from './signup-form.component';

describe('SignupFormComponent', () => {
  let component: SignupFormComponent;
  let fixture: ComponentFixture<SignupFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SignupFormComponent ],
      imports: [
        BrowserModule,

        RouterTestingModule,
        HttpClientTestingModule,
        BrowserAnimationsModule,

        FormsModule,
        ReactiveFormsModule,

        NgMaterialModule,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SignupFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('01 - should be created', () => {
    expect(component).toBeTruthy();
  });
});
