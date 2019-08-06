import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NgMaterialModule } from '../../shared/ng-material.module';

import { AppDetailsComponent } from './app-details.component';

describe('AppDetailsComponent', () => {
  let component: AppDetailsComponent;
  let fixture: ComponentFixture<AppDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppDetailsComponent ],
      imports: [
        NgMaterialModule,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('01 - should be created', () => {
    expect(component).toBeTruthy();
  });
});
