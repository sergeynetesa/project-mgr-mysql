import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

// import { FormsModule } from '@angular/forms';

import { NgMaterialModule } from './shared/ng-material.module';
import { AppRoutingModule } from './app-routing.module';

import { ProjectsModule } from './pages/projects/projects.module';
import { PrjFormsModule } from './forms/prj-forms.module';
import { TasksModule } from './pages/tasks/tasks.module';

import { TestsModule } from './tests/tests.module';

import { JwtInterceptor } from './shared/Interceptor/jwt.Interceptor';
import { AboutModule } from './pages/about/about.module';

import { AppComponent } from './app.component';
import { PageNotFoundComponent } from './page-not-found.component';
import { AppDetailsComponent } from './pages/app-details/app-details.component';

@NgModule({
  declarations: [
    AppComponent,
    PageNotFoundComponent,
    AppDetailsComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    // FormsModule,
    NgMaterialModule,
    AppRoutingModule,
    AboutModule,
    ProjectsModule,
    PrjFormsModule,
    TasksModule,
    TestsModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule {}
