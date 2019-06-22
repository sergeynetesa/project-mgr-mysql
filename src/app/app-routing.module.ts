import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PAGE_ROUTES } from './pages/pages.routes';

export const PROJECT_MANAGER_ROUTES: Routes = [
  ...PAGE_ROUTES
  , { path: '**', redirectTo: PAGE_ROUTES[0].path, data: PAGE_ROUTES[0].data}
];

const routes: Routes = [];

@NgModule({
  imports: [
    RouterModule.forRoot(PROJECT_MANAGER_ROUTES, {
      enableTracing: false,
      onSameUrlNavigation: 'reload'
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
