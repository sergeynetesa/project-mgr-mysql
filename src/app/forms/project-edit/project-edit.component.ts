import { WrongTaskArray } from '../../shared/model/task.interface';
import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

import { Observable, Subject } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { MatSnackBar, SimpleSnackBar, MatSnackBarRef,
          MatSnackBarDismiss, MatDialog } from '@angular/material';

import { UserService } from '../../shared/services/user.service';
import { ProjectInterface, ProjectStateEnum, IsProjectsChangedInterface,
        WrongProject, ChangeResultEnum } from '../../shared/model/project.interface';
import { ProjectService } from '../../shared/services/project.service';

import { UserWithTokenInterface } from '../../shared/model/user.interface';
import { ProjectStateService } from 'src/app/shared/services/project-state.service';
import { TaskService } from 'src/app/shared/services/task.service';

import { ConfirmDialogComponent } from '../../forms/confirm-dialog/confirm-dialog.component';
import { TaskArrayByProjectInterface, TaskInterface } from 'src/app/shared/model/task.interface';

@Component({
  selector: 'app-project-edit',
  templateUrl: './project-edit.component.html',
  styleUrls: ['./project-edit.component.scss'],
  providers: [
    ProjectStateService
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectEditComponent implements OnInit, OnDestroy {
  projectFG: FormGroup;
  prjState = ProjectStateEnum.NOSET;
  // Accessors
  get form_title(): string {
    if (this.prjState === ProjectStateEnum.ADD) {
      return 'Add New Project Information';
    } else if (this.prjState === ProjectStateEnum.UPDATE) {
      return 'Edit Project Information';
    } else if (this.prjState === ProjectStateEnum.NOSET) {
      return 'N/A Project Information';
    }
  }
  get form_btn_title(): string {
    if (this.prjState === ProjectStateEnum.ADD) {
      return 'ADD PROJECT';
    } else if (this.prjState === ProjectStateEnum.UPDATE) {
      return 'UPDATE PROJECT';
    } else if (this.prjState === ProjectStateEnum.DELETE) {
      return 'UPDATE PROJECT';
    } else if (this.prjState === ProjectStateEnum.NOSET) {
      return 'N/A';
    }
  }
  get project_title() { return this.projectFG.get('project_title'); }
  get project_desc() { return this.projectFG.get('project_desc'); }
  // --------------------------------------------------------------
  private simpleSnackBarRef: MatSnackBarRef<SimpleSnackBar> = null;
  // --------------------------------------------------------------
  public currentUser$: Observable<UserWithTokenInterface> = null;

  curProjectFromRoute$: Observable<ProjectInterface> = null;
  curProject: ProjectInterface = null;
  curProjectId = '-1';

  public curTaskArray$: Observable<TaskInterface[]> = null;

  public isProjectsChanged$: Observable<IsProjectsChangedInterface> = null;

  // private onDestroySub$ = new Subject<boolean>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private dialog: MatDialog,
    protected userSrv: UserService,
    protected projectSrv: ProjectService,
    protected taskSrv: TaskService,
    protected projectStateSrv: ProjectStateService,
    private snackBarSrv: MatSnackBar
  ) {
    projectStateSrv.context = 'ProjectEditComponent';
  }

  ngOnInit() {
    this.projectFG = this.fb.group({
      project_title: ['', {
        validators: [
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(64)
        ], updateOn: 'change' }
      ],
      project_desc: ['', {
      validators: [
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(256)
        ], updateOn: 'change' }
      ]
    });

    this.currentUser$ = this.userSrv.curUser$
    .pipe(
      tap((user: UserWithTokenInterface) => {
        if (this.userSrv.isAnonymUser(user)) {
          this.projectSrv.emptyProjects();
          this.prjState  = ProjectStateEnum.NOSET;
          this.curProjectId = '-1';
          this.projectFG.patchValue({
            project_desc: '',
            project_title: ''
          });
        }
      })
    );
    this.curProjectFromRoute$ = this.route.paramMap
    .pipe(
      map((params: ParamMap) => params.get('prj_id')),
      map((projectId: string) => {
        if (projectId.length !== 0 && projectId === '0000000') {
          this.prjState  = ProjectStateEnum.ADD;
          this.curProjectId = '';
          return {title: '', description: ''};
        }
        this.prjState = ProjectStateEnum.UPDATE;
        const curProjects = this.projectSrv.curProjects;
        const curPrj = curProjects.find(project => project.id === projectId);
        if (curPrj) {
          this.curProject = curPrj;
          this.curProjectId = curPrj.id;
          this.projectSrv.setCurrentProject(curPrj);
          return curPrj;
        } else {
          this.projectSrv.setCurrentProject(null);
          return WrongProject;
        }
      }),
      tap((p: ProjectInterface) => {
        this.projectFG.patchValue({
          project_desc: p.description,
          project_title: p.title
        });
      })
    );
    this.curTaskArray$ = this.taskSrv.curTaskArrayByPrj$
    .pipe(
      map((curTaskArrWithPrj: TaskArrayByProjectInterface) => {
        if (this.taskSrv.isTaskArrayByPrjWrong(curTaskArrWithPrj)) {
          return WrongTaskArray;
        }
        const prevProject = curTaskArrWithPrj.project;
        const prevProjectId = prevProject.id;

        return curTaskArrWithPrj.tasks; // ?????????
      })
    );
    this.isProjectsChanged$ = this.projectStateSrv.isProjectsChanged$
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
          } else if (r.isEnd && r.opResult === ChangeResultEnum.ERROR) {
            this.simpleSnackBarRef = this.snackBarSrv.open(`ERROR: ${r.message}`,
              'X', {
              duration: 0,
              panelClass: 'mat-snack-bar-container_err'
              });
          } else if (r.isEnd && r.opResult === ChangeResultEnum.SUCCESS) {
            this.simpleSnackBarRef =
              this.snackBarSrv.open(`OK: Project '${(r.project as ProjectInterface).title}' has been created!`,
                'X', {
                duration: 0,
                panelClass: 'mat-snack-bar-container_info'
              });
            this.simpleSnackBarRef.afterDismissed()
            .subscribe(
              (res: MatSnackBarDismiss) => {
                  if (res.dismissedByAction) {
                    this.router.navigate(['projects/']);
                  }
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
            this.simpleSnackBarRef = this.snackBarSrv.open(`ERROR: ${r.message}`,
              'X', {
              duration: 0,
              panelClass: 'mat-snack-bar-container_err'
            });
          } else if (r.isEnd && r.opResult === ChangeResultEnum.SUCCESS) {
            this.simpleSnackBarRef =
              this.snackBarSrv.open(`OK: Project '${(r.project as ProjectInterface).title}' has been updated!`,
                'X', {
                duration: 0,
                panelClass: 'mat-snack-bar-container_info'
              });
            this.simpleSnackBarRef.afterDismissed()
            .subscribe(
              (res: MatSnackBarDismiss) => {
                if (res.dismissedByAction) {
                  this.router.navigate(['projects']);
                }
              }
            );
          }
        } else if (r.op === ProjectStateEnum.DELETE) {
          if (!r.isEnd && r.opResult === ChangeResultEnum.NOSET) {
            if (this.simpleSnackBarRef != null) {
              this.simpleSnackBarRef.dismiss();
              this.simpleSnackBarRef = null;
            }
          } else if (r.isEnd && r.opResult === ChangeResultEnum.ERROR) { // Error
            this.simpleSnackBarRef = this.snackBarSrv.open(`ERROR: ${r.message}`,
              'X', {
              duration: 0,
              panelClass: 'mat-snack-bar-container_err'
            });
          } else if (r.isEnd && r.opResult === ChangeResultEnum.SUCCESS) {
            this.simpleSnackBarRef =
              this.snackBarSrv.open(`OK: Project '${(r.project as ProjectInterface).title}' has been deleted!`,
              'X', {
              duration: 0,
              panelClass: 'mat-snack-bar-container_info'
            });
            this.simpleSnackBarRef.afterDismissed()
            .subscribe(
              (res: MatSnackBarDismiss) => {
                if (res.dismissedByAction) {
                  this.router.navigate(['projects']);
                }
              }
            );
          }
        }
      })
    );
  }

  onProjectSubmit({ value, valid }: { value: any, valid: boolean }) {
    if (valid) {
      const userWithToken: UserWithTokenInterface = this.userSrv.curUserWithToken;
      if (this.userSrv.isAnonymUser(userWithToken)) {
        throw new Error('Current User is Anonymous');
      } else if (userWithToken.user != null &&
                  !this.userSrv.isWrongUser(userWithToken.user)) {
        // OK
      } else {
          throw new Error('User is null or WrongUser');
      }
      const user = userWithToken.user;
      let p: ProjectInterface = null;
      if (this.prjState === ProjectStateEnum.ADD) {
        p = {
          userId: user.id,
          title: value.project_title,
          description: value.project_desc
        };
        this.projectSrv.addProjectByUser(user, p, this.projectStateSrv);
      } else if (this.prjState === ProjectStateEnum.UPDATE) {
        p = {
          id: this.curProjectId,
          userId: user.id,
          title: value.project_title,
          description: value.project_desc
        };
        this.projectSrv.updateProjectByUser(user, p, this.projectStateSrv);
      }
    }
  }
  private alertMessageOutput(project: ProjectInterface, taskNumber: number) {
    const alertDialogData = {
      title: 'Project has Tasks',
      content: `Prohibited to delete the Project with Tasks!`,
      cancel: '',
      ok: 'OK'
    };
    const alertRef = this.dialog.open(ConfirmDialogComponent, {
      data: alertDialogData,
      disableClose: true,
    });
    alertRef.afterClosed()
    .subscribe(
      (r: boolean) => {
          return;
      }
    );
  }
  deleteProjectWithConfirm(project = this.curProject): void {
    const curTaskArrayByPrj = this.taskSrv.curTaskArrayByPrj;
    if (this.taskSrv.isTaskArrayByPrjWrong(curTaskArrayByPrj)) {
      throw new Error('Current Task Array is wrong');
    }
    const taskArrayProject = curTaskArrayByPrj.project;
    if (taskArrayProject.id !== project.id) {
      throw new Error('Task Array Project is not equal Current Project');
    }
    const taskArray = curTaskArrayByPrj.tasks;
    if (taskArray.length > 0) {
      this.alertMessageOutput(project, taskArray.length);
      return;
    }
    const confirmDialogData = {
      title: 'Confirm Delete Project',
      content: `Are you sure to delete '${project.title}' Project?`,
      cancel: 'CANCEL',
      ok: 'DELETE'
    };
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: confirmDialogData,
      disableClose: true,
    });
    dialogRef.afterClosed()
    .subscribe(
      (r: boolean) => {
          if (r) {
            this.deleteProject(project);
        }
      }
    );
  }

  deleteProject(project: ProjectInterface) {
    const userWithToken: UserWithTokenInterface = this.userSrv.curUserWithToken;
    if (this.userSrv.isAnonymUser(userWithToken)) {
      throw new Error('Current User is Anonymous');
    } else if (userWithToken.user != null &&
                !this.userSrv.isWrongUser(userWithToken.user)) {
    } else {
        throw new Error('User is null or WrongUser');
    }
    const user = userWithToken.user;
    this.projectSrv.deleteProjectByUser(user, project, this.projectStateSrv);
  }

  ngOnDestroy() {
    if (this.simpleSnackBarRef != null) {
      this.simpleSnackBarRef.dismiss();
      this.simpleSnackBarRef = null;
    }
  }
}
