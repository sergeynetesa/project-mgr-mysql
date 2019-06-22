import { Route } from '@angular/router';

import { AuthGuard } from '../shared/guard/auth.guard';

import { ProjectsComponent } from './projects/projects.component';
import { SignupFormComponent } from '../forms/signup-form/signup-form.component';
import { ProjectEditComponent } from '../forms/project-edit/project-edit.component';
import { TasksComponent } from './tasks/tasks.component';
import { TaskEditComponent } from '../forms/task-edit/task-edit.component';

export interface PageRoute extends Route {
  data: {
    readonly pathRegex: string;
    readonly leftNavTitle: string;
    readonly topNavTitle: string;
    readonly isLeftNav: boolean;
    readonly orderId: number;
  }[];
}

export type PageRoutes = PageRoute[];

export const PAGE_ROUTES: PageRoutes = [
  {
    path: 'projects',
    component: ProjectsComponent,
    pathMatch: 'full',
    data: [{
      pathRegex: '^\/projects$',
      leftNavTitle: 'Projects',
      topNavTitle: 'Projects',
      isLeftNav: true,
      orderId: 1
    }],
    canActivate: [AuthGuard],
    runGuardsAndResolvers: 'always'
  },
  {
    path: 'projects/:prj_id',
    component: ProjectEditComponent,
    // pathMatch: 'full', // not used with children: []
    data: [{
      pathRegex: '^\/projects\/0{7}$',
      leftNavTitle: 'Add New Project',
      topNavTitle: 'Add New Project',
      isLeftNav: false,
      orderId: 2
    }, {
      pathRegex: '^\/projects\/[a-zA-Z0-9_-]{7,14}\/tasks$',
      leftNavTitle: 'Project Edit',
      topNavTitle: 'Edit Project and View Tasks',
      isLeftNav: false,
      orderId: 2
    }
  ],
    canActivate: [AuthGuard],
    children: [
      {
        path: 'tasks',
        component: TasksComponent
      },
    ]
  },
  {
    path: 'projects/:prj_id/tasks/:task_id',
    component: TaskEditComponent,
    // pathMatch: 'full',
    data: [{
      pathRegex: '^\/projects\/[a-zA-Z0-9_-]{7,14}\/tasks\/0{7}$',
      leftNavTitle: 'Add New Task',
      topNavTitle: 'Add New Task',
      isLeftNav: false,
      orderId: 3
    }, {
      pathRegex: '^\/projects\/[a-zA-Z0-9_-]{7,14}\/tasks\/[a-zA-Z0-9_-]{7,14}$',
      leftNavTitle: 'Task Edit',
      topNavTitle: 'Edit / Delete Task',
      isLeftNav: false,
      orderId: 3
    }
  ],
    canActivate: [AuthGuard]
  },
  {
    path: 'login-signup',
    component: SignupFormComponent,
    data: [{
      pathRegex: '^\/login-signup$',
      leftNavTitle: 'Login / Signup',
      topNavTitle: 'Login / Signup',
      isLeftNav: true,
      orderId: 6
    }]
  }
];
