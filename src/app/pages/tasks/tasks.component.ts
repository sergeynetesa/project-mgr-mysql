import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';

import { Router, ActivatedRoute, Params } from '@angular/router';

import { Observable, combineLatest, BehaviorSubject, Subject } from 'rxjs';
import { tap, map } from 'rxjs/operators';

import { MatButtonToggleChange } from '@angular/material';
import { MatSnackBar, SimpleSnackBar, MatSnackBarRef } from '@angular/material';

import { UserService } from '../../shared/services/user.service';
import { ProjectService } from '../../shared/services/project.service';

import { UserWithTokenInterface } from 'src/app/shared/model/user.interface';
import { ProjectInterface, WrongProject, IsProjectsChangedInterface,
  ProjectStateEnum, ChangeResultEnum, OpStateInterface } from 'src/app/shared/model/project.interface';


import { ProjectStateService } from 'src/app/shared/services/project-state.service';
import { TaskInterface, TaskListFilterType, WrongTaskArray } from 'src/app/shared/model/task.interface';
import { TaskService } from 'src/app/shared/services/task.service';

@Component({
  selector: 'app-projects',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss'],
  providers: [
    ProjectStateService
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TasksComponent implements OnInit, OnDestroy {
  protected currentUser$: Observable<UserWithTokenInterface> = null;

  currentProject$: Observable<ProjectInterface> = null;
  currentProject: ProjectInterface = null;
  currentProjectId = '-1';

  curProjectFromRoute$: Observable<ProjectInterface> = null;

  currentTasks$: Observable<TaskInterface[]> = null;

  private onDestroySub$ = new Subject<boolean>();

  filteredTasks$: Observable<TaskInterface[]>;
  taskFilterTypes: TaskListFilterType[] = ['all', 'open', 'done'];
  private  activeTaskFilterTypeSub$ = new BehaviorSubject<TaskListFilterType>('all');
  activeTaskFilterType$ = this.activeTaskFilterTypeSub$.asObservable();

  // --------------------------------------------------------------
  protected isTasksChanged$: Observable<OpStateInterface> = null;
  private simpleSnackBarRef: MatSnackBarRef<SimpleSnackBar> = null;

  // --------------------------------------------------------------
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    protected userSrv: UserService,
    protected projectSrv: ProjectService,
    protected taskSrv: TaskService,
    protected tasksStateSrv: ProjectStateService,
    private snackBarSrv: MatSnackBar

  ) {
    tasksStateSrv.context = 'TasksComponent';
  }

  ngOnInit() {
    this.currentUser$ = this.userSrv.curUser$
    .pipe(
      tap((user: UserWithTokenInterface) => {
        if (this.userSrv.isAnonymUser(user)) {
          this.taskSrv.emptyTaskArrayByPrj();    // ???
        }
      })
    );
    // --------------------
    this.currentProject$ = this.projectSrv.currentProject$
    .pipe(
      tap((p: ProjectInterface) => {
        if (this.projectSrv.isProjectWrong(p)) {
          this.taskSrv.setCurTaskArrByPrj(null);
        }
        const prevProject = this.taskSrv.curTaskArrayByPrj.project;
        if (prevProject.id !== p.id) {
          this.taskSrv.setCurTaskArrByPrj(null);
        }
      }),
    );
    // --------------------
    this.curProjectFromRoute$ = this.route.parent.params
    .pipe(
      map((pm: Params) => pm.prj_id),
      map((routeProjectId: string) => {
        if (routeProjectId.length !== 0 && routeProjectId === '0') {
          throw new Error('Route parameter [prj_id] has value 0');
        }
        const curProjects = this.projectSrv.curProjects;
        const isWrongCurProjects = !this.projectSrv.isProjectsNotEmpty(curProjects);
        if (isWrongCurProjects) {
          return WrongProject;
        }
        const taskArr = this.taskSrv.curTaskArrayByPrj;
        if (this.taskSrv.isTaskArrayByPrjWrong(taskArr)) {  // TaskArr=Wrong
          const curPrj = curProjects.find(project => project.id === routeProjectId);
          if (curPrj) {
            this.currentProjectId = curPrj.id;
            this.currentProject = curPrj;

            this.taskSrv.loadTaskArrayByProject(curPrj, this.tasksStateSrv);

            return curPrj;
          } else {
              return WrongProject;
          }
        }
        const prevProject = this.taskSrv.curTaskArrayByPrj.project;
        const prevProjectId = this.taskSrv.curTaskArrayByPrj.project.id;
        if (prevProjectId !== routeProjectId) {
          const curPrj = curProjects.find(project => project.id === routeProjectId);
          if (curPrj) {
            this.currentProjectId = curPrj.id;
            this.currentProject = curPrj;

            this.taskSrv.loadTaskArrayByProject(curPrj, this.tasksStateSrv);

            return curPrj;
          } else {
              return WrongProject;
          }
        } else {
          this.currentProjectId = prevProject.id;
          this.currentProject = prevProject;

          return prevProject;
        }
      })
    );
    // --------------------
    this.filteredTasks$ = combineLatest(this.taskSrv.curTaskArrayByPrj$, this.activeTaskFilterType$)
      .pipe(
        map(([taskArray, activeTaskFilterType]) => {
              return [taskArray.tasks, activeTaskFilterType] as
                      [TaskInterface[], TaskListFilterType];
            }),
        map(([tasks, activeTaskFilterType]) => {
          if (!this.taskSrv.isTasksNotEmpty(tasks)) {
            return WrongTaskArray;
          }
          return tasks.filter((task: TaskInterface) => {
            if (activeTaskFilterType === 'all') {
              return true;
            } else if (activeTaskFilterType === 'open') {
              return !task.done;
            } else {
              return task.done;
            }
          });
        })
    );
    // --------------------
    this.isTasksChanged$ = this.tasksStateSrv.isProjectsChanged$
    .pipe(
      map((r: IsProjectsChangedInterface): OpStateInterface   => {
        if (r.op === ProjectStateEnum.NOSET) {
          if (!r.isEnd && r.opResult === ChangeResultEnum.NOSET) {
            if (this.simpleSnackBarRef != null) {
              this.simpleSnackBarRef.dismiss();
              this.simpleSnackBarRef = null;
            }
            return {op: 'NOSET', isEnd: false, opResult: 'NOSET'};
          }
        } else if (r.op === ProjectStateEnum.LOAD) {
          if (!r.isEnd && r.opResult === ChangeResultEnum.NOSET) {
            if (this.simpleSnackBarRef != null) {
              this.simpleSnackBarRef.dismiss();
              this.simpleSnackBarRef = null;
            }
            return {op: 'LOAD', isEnd: false, opResult: 'NOSET'};
          } else if (r.isEnd && r.opResult === ChangeResultEnum.ERROR) {
              this.simpleSnackBarRef = this.snackBarSrv.open(`ERROR: ${r.message}`,
                'X', {
                duration: 0,
                panelClass: 'mat-snack-bar-container_err'
              });
              return {op: 'LOAD', isEnd: true, opResult: 'ERROR'};
          } else if (r.isEnd && r.opResult === ChangeResultEnum.SUCCESS) {
            return {op: 'LOAD', isEnd: true, opResult: 'SUCCESS'};
          }
        } else if (r.op === ProjectStateEnum.DELETE) {
          if (!r.isEnd && r.opResult === ChangeResultEnum.NOSET) {
            if (this.simpleSnackBarRef != null) {
              this.simpleSnackBarRef.dismiss();
              this.simpleSnackBarRef = null;
            }
            return {op: 'DELETE', isEnd: false, opResult: 'NOSET'};
          } else if (!r.isEnd && r.opResult === ChangeResultEnum.ERROR) { // Error
            this.simpleSnackBarRef = this.snackBarSrv.open(`ERROR: ${r.message}`,
              'X', {
              duration: 0,
              panelClass: 'mat-snack-bar-container_err'
            });
            return {op: 'DELETE', isEnd: true, opResult: 'ERROR'};
          } else if (r.isEnd && r.opResult === ChangeResultEnum.SUCCESS) {
            this.simpleSnackBarRef =
              this.snackBarSrv.open(`Selected Project has been deleted!`,
              'X', {
              duration: 0,
              panelClass: 'mat-snack-bar-container_info'
            });
            return {op: 'DELETE', isEnd: true, opResult: 'SUCCESS'};
          }
        }
      })
    );
    // -------------------------------------------
  }
  activateFilterType(e: MatButtonToggleChange) {
    this.activeTaskFilterTypeSub$.next(e.value);
  }
  addTask(): void {
    const url = `/projects/${this.currentProjectId}/tasks/0000000`;
    this.router.navigateByUrl(url);
  }
  editTask(task: TaskInterface) {
    this.router.navigate(['/projects', this.currentProjectId, 'tasks', task.id]);
  }
  // ---------------------------------------------
  ngOnDestroy() {
    // this.taskSrv.emptyTasks();  // ???

    if (this.simpleSnackBarRef != null) {
      this.simpleSnackBarRef.dismiss();
      this.simpleSnackBarRef = null;
    }
  }
}
