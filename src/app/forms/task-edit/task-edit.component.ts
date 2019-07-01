import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

import { Observable, Subject } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { MatSnackBar, SimpleSnackBar, MatSnackBarRef, MatSnackBarDismiss, MatDialog } from '@angular/material';

import { UserService } from '../../shared/services/user.service';
import { ProjectInterface, ProjectStateEnum, IsProjectsChangedInterface,
        WrongProject, ChangeResultEnum, OpStateInterface } from '../../shared/model/project.interface';
import { ProjectService } from '../../shared/services/project.service';

import { UserWithTokenInterface } from '../../shared/model/user.interface';
import { ProjectStateService } from 'src/app/shared/services/project-state.service';
import { TaskInterface, WrongTask } from 'src/app/shared/model/task.interface';
import { TaskService } from 'src/app/shared/services/task.service';

import { ConfirmDialogComponent } from '../../forms/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-task-edit',
  templateUrl: './task-edit.component.html',
  styleUrls: ['./task-edit.component.scss'],
  providers: [
    ProjectStateService
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskEditComponent implements OnInit, OnDestroy {
  taskFG: FormGroup;
  taskState = ProjectStateEnum.NOSET;
  // get form_subtitle(): string {
  //   if (!this.currentProject) {
  //     return `Project: ${this.currentProject.title}`;
  //   } else {
  //     return `Project: N/A`;
  //   }
  // }
  get form_title(): string {
    if (this.taskState === ProjectStateEnum.ADD) {
      return 'Add New Task Information';
    } else if (this.taskState === ProjectStateEnum.UPDATE) {
      return 'Edit Task Information';
    } else if (this.taskState === ProjectStateEnum.NOSET) {
      return 'N/A';
    }
  }
  get form_btn_title(): string {
    if (this.taskState === ProjectStateEnum.ADD) {
      return 'ADD TASK';
    } else if (this.taskState === ProjectStateEnum.UPDATE) {
      return 'UPDATE TASK';
    } else if (this.taskState === ProjectStateEnum.DELETE) {
      return 'UPDATE TASK';
    } else if (this.taskState === ProjectStateEnum.NOSET) {
      return 'N/A';
    }
  }
  get task_title() { return this.taskFG.get('task_title'); }
  get task_desc() { return this.taskFG.get('task_desc'); }
  get task_done() { return this.taskFG.get('task_done'); }
  // --------------------------------------------------------------
  public currentUser$: Observable<UserWithTokenInterface> = null;

  currentProject$: Observable<ProjectInterface> = null;
  currentProject: ProjectInterface = null;
  currentProjectId = '-1';

  formSubtitle = 'Project: N/A';

  curProjectFromRoute$: Observable<ProjectInterface> = null;
  // ---------------------------------------
  currentTasks$: Observable<TaskInterface[]> = null;

  curTaskFromRoute$: Observable<TaskInterface> = null;
  currentTask: TaskInterface = null;
  currentTaskId = '-1';
  // --------------------------------------------------------------
  public isTaskChanged$: Observable<OpStateInterface> = null;
  private onDestroySub$ = new Subject<boolean>();
  private simpleSnackBarRef: MatSnackBarRef<SimpleSnackBar> = null;

  constructor(  // ---------- constructor() ----------------------
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private dialog: MatDialog,
    protected userSrv: UserService,
    protected projectSrv: ProjectService,
    protected taskSrv: TaskService,
    protected taskStateSrv: ProjectStateService,
    private snackBarSrv: MatSnackBar
  ) {
    taskStateSrv.context = 'TaskEditComponent';
  }

  ngOnInit() {  // ---------- ngOnInit() ----------------------
    this.taskFG = this.fb.group({
      task_title: ['', {
        validators: [
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(64)
        ], updateOn: 'change' }
      ],
      task_desc: ['', {
      validators: [
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(256)
        ], updateOn: 'change' }
      ],
      task_done: ['', {
        validators: [
          Validators.required
          ], updateOn: 'change' }
        ]
    });
    // --------------------------------
    this.currentUser$ = this.userSrv.curUser$
    .pipe(
      tap((user: UserWithTokenInterface) => {
        if (this.userSrv.isAnonymUser(user)) {
          this.taskSrv.emptyTaskArrayByPrj();    // ???
        }
      }),
    );
    // --------------------------------
    this.curProjectFromRoute$ = this.route.paramMap
    .pipe(
      map((params: ParamMap) => params.get('prj_id')),
      map((projectId: string) => {
        if (projectId && projectId.length !== 0 && projectId === '0000000') {
          throw new Error('Route parameter [prj_id] has value 0000000');
        }
        const curProjects = this.projectSrv.curProjects;
        const curPrj = curProjects.find(project => project.id === projectId);
        if (curPrj) {
          this.currentProjectId = curPrj.id;
          this.currentProject = curPrj;
          this.formSubtitle = `Project: ${curPrj.title}`;
          return curPrj;
        } else {
          return WrongProject;
        }
      })
    );
    // --------------------------------
    this.curTaskFromRoute$ = this.route.paramMap
    .pipe(
      map((params: ParamMap) => params.get('task_id')),
      map((taskId: string) => {
        if (taskId && taskId.length !== 0 && taskId === '0000000') {
          this.taskState  = ProjectStateEnum.ADD;
          this.currentTaskId = '0000000';
          return {
            projectId: this.currentProjectId,
            title: '',
            description: '',
            done: false
          };
        }
        this.taskState = ProjectStateEnum.UPDATE;

        const taskArr = this.taskSrv.curTaskArrayByPrj;
        if (this.taskSrv.isTaskArrayByPrjWrong(taskArr)) {
          return WrongTask;
        }
        const curTasks = taskArr.tasks;
        const curTask = curTasks.find(task => task.id === taskId);
        if (curTask) {
          this.currentTaskId = curTask.id;
          this.currentTask = curTask;
          return curTask;
        } else {
          this.taskState = ProjectStateEnum.WRONG;
          return WrongTask;
        }
      }),
      tap((t: TaskInterface) => {
        this.taskFG.patchValue({
          task_desc: t.description,
          task_title: t.title,
          task_done: t.done
        });
      })
    );
    // --------------------------------
    this.isTaskChanged$ = this.taskStateSrv.isProjectsChanged$
    .pipe(
      tap((r: IsProjectsChangedInterface) => {
        if (r.op === ProjectStateEnum.NOSET) {
          if (!r.isEnd && r.opResult === ChangeResultEnum.NOSET) {
            if (this.simpleSnackBarRef != null) {
              this.simpleSnackBarRef.dismiss();
              this.simpleSnackBarRef = null;
            }
          }
        } else if (r.op === ProjectStateEnum.ADD) {
            if (!r.isEnd && r.opResult === ChangeResultEnum.NOSET) {
            if (this.simpleSnackBarRef != null) {
              this.simpleSnackBarRef.dismiss();
              this.simpleSnackBarRef = null;
            }
          } else if (r.isEnd && r.opResult === ChangeResultEnum.ERROR) { // Error
            // console.log(`\tPIPE: ProjectEditComponent.OnInit() projectSrv.isProjectsChanged$:ADD ERROR`);
            this.simpleSnackBarRef = this.snackBarSrv.open(`ERROR: ${r.message}`,
              'X', {
              duration: 0,
              panelClass: 'mat-snack-bar-container_err'
              });
          } else if (r.isEnd && r.opResult === ChangeResultEnum.SUCCESS) {
            this.simpleSnackBarRef =
              this.snackBarSrv.open(`OK: Task '${r.message}' has been created!`,
                '', {
                duration: 1500,
                panelClass: 'mat-snack-bar-container_info'
              });
            this.simpleSnackBarRef.afterDismissed()
            .subscribe(
              (res: MatSnackBarDismiss) => {
                  // if (res.dismissedByAction) {
                  //   this.router.navigate(['projects', this.currentProjectId, 'tasks']);
                  // }
                  this.router.navigateByUrl(`/projects/${this.currentProjectId}/tasks`);
                }
              );
          }
        } else if (r.op === ProjectStateEnum.UPDATE) {
          if (!r.isEnd && r.opResult === ChangeResultEnum.NOSET) {
            if (this.simpleSnackBarRef != null) {
              this.simpleSnackBarRef.dismiss();
              this.simpleSnackBarRef = null;
            }
          } else if (r.isEnd && r.opResult === ChangeResultEnum.ERROR) { // Error
            // console.log(`\tPIPE: ProjectsComponent.OnInit() projectSrv.isProjectsChanged$:EDIT ERROR`);
            this.simpleSnackBarRef = this.snackBarSrv.open(`ERROR: ${r.message}`,
              'X', {
              duration: 0,
              panelClass: 'mat-snack-bar-container_err'
            });
          } else if (r.isEnd && r.opResult === ChangeResultEnum.SUCCESS) {
            // console.log(`\tPIPE: ProjectsComponent.OnInit() projectSrv.isProjectsChanged$:EDIT OK %O`, r.project);
            this.simpleSnackBarRef =
              this.snackBarSrv.open(`OK: Task '${r.message}' has been updated!`,
                '', {
                duration: 1500,
                panelClass: 'mat-snack-bar-container_info'
              });
            this.simpleSnackBarRef.afterDismissed()
            .subscribe(
              (res: MatSnackBarDismiss) => {
                // if (res.dismissedByAction) {
                //   this.router.navigate(['projects', this.currentProjectId, 'tasks']);
                // }
                this.router.navigateByUrl(`/projects/${this.currentProjectId}/tasks`);
              }
            );
          }
        } else if (r.op === ProjectStateEnum.DELETE) {
          if (!r.isEnd && r.opResult === ChangeResultEnum.NOSET) {
            if (this.simpleSnackBarRef != null) {
              this.simpleSnackBarRef.dismiss();
              this.simpleSnackBarRef = null;
            }
          } else if (!r.isEnd && r.opResult === ChangeResultEnum.ERROR) { // Error
            this.simpleSnackBarRef = this.snackBarSrv.open(`ERROR: ${r.message}`,
              'X', {
              duration: 0,
              panelClass: 'mat-snack-bar-container_err'
            });
          } else if (r.isEnd && r.opResult === ChangeResultEnum.SUCCESS) {
            this.simpleSnackBarRef =
              this.snackBarSrv.open(`Selected Task '${r.message}' has been deleted!`,
              '', {
              duration: 1500,
              panelClass: 'mat-snack-bar-container_info'
            });
            this.simpleSnackBarRef.afterDismissed()
            .subscribe(
              (res: MatSnackBarDismiss) => {
                  // if (res.dismissedByAction) {
                  //   this.router.navigate(['projects', this.currentProjectId, 'tasks']);
                  // }
                  this.router.navigateByUrl(`/projects/${this.currentProjectId}/tasks`);
                }
              );
          }
        }
      })
    );
  }
  // --------------------------------------------------------------
  onTaskSubmit({ value, valid }: { value: any, valid: boolean }) {
    if (valid) {
      let t: TaskInterface = null;
      if (this.taskState === ProjectStateEnum.ADD) {
        t = {
          projectId: this.currentProjectId,
          title: value.task_title,
          description: value.task_desc,
          done: value.task_done
        };
        this.taskSrv.addTaskByProject(this.currentProject, t, this.taskStateSrv);
      } else if (this.taskState === ProjectStateEnum.UPDATE) {
        t = {
          id: this.currentTaskId,
          projectId: this.currentProjectId,
          title: value.task_title,
          description: value.task_desc,
          done: value.task_done
        };
        this.taskSrv.updateTaskByProject(this.currentProject, t, this.taskStateSrv);
      }
    }
  }
  deleteTaskWithConfirm(task = this.currentTask) {
    // this.taskState = ProjectStateEnum.DELETE;

    const confirmDialogData = {
      title: 'Confirm Delete Task',
      content: `Are you sure to delete '${task.title}' Task?`,
      cancel: 'Cancel',
      ok: 'Delete'
    };
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: confirmDialogData,
      disableClose: true,
    });
    dialogRef.afterClosed()
    .subscribe(
      (r: boolean) => {
          if (r) {
            this.deleteTask(task);
        }
      }
      );
  }
  deleteTask(task: TaskInterface) {
    this.taskSrv.deleteTaskByProject(this.currentProject, task, this.taskStateSrv);
  }
  // --------------------------------------------------------------------------
  ngOnDestroy() {
    // this.taskSrv.emptyTasks();   // ???

    if (this.simpleSnackBarRef != null) {
      this.simpleSnackBarRef.dismiss();
      this.simpleSnackBarRef = null;
    }
  }
  // ------------------------------------------------------------
}
