import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';

import { Router } from '@angular/router';

import { Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';

import { MatSnackBar, SimpleSnackBar, MatSnackBarRef } from '@angular/material';

import { UserService } from '../../shared/services/user.service';
import { ProjectService } from '../../shared/services/project.service';

import { UserWithTokenInterface } from 'src/app/shared/model/user.interface';
import { ProjectInterface, IsProjectsChangedInterface,
  ProjectStateEnum, ChangeResultEnum, OpStateInterface } from 'src/app/shared/model/project.interface';

import { ProjectStateService } from 'src/app/shared/services/project-state.service';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss'],
  providers: [
    ProjectStateService
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectsComponent implements OnInit, OnDestroy {
  public currentUser$: Observable<UserWithTokenInterface> = null;
  public currentProjects$: Observable<ProjectInterface[]> = null;

  // --------------------------------------------------------------
  private simpleSnackBarRef: MatSnackBarRef<SimpleSnackBar> = null;
  public isProjectsChanged$: Observable<OpStateInterface> = null;
  // --------------------------------------------------------------

  protected stateIsEnd = '';
  protected stateOp = '';

  constructor(
    private router: Router,
    protected userSrv: UserService,
    protected projectSrv: ProjectService,
    protected projectsStateSrv: ProjectStateService,
    private snackBarSrv: MatSnackBar
  ) {
      projectsStateSrv.context = 'ProjectsComponent';

  }

  ngOnInit() {
    this.currentUser$ = this.userSrv.curUser$
    .pipe(
      tap((user: UserWithTokenInterface) => {
        if (this.userSrv.isAnonymUser(user)) {
          this.projectSrv.emptyProjects();
        }
      })
    );
    this.currentProjects$ = this.projectSrv.curProjects$
    .pipe(
      tap((projects: ProjectInterface[]) => {
        if (!this.projectSrv.isProjectsNotEmpty(projects)) {
          const userWithToken = this.userSrv.curUserWithToken;
          if (this.userSrv.isAnonymUser(userWithToken)) {
            // throw new Error('Current User is anonymous');
          } else if (userWithToken.user != null &&
                      !this.userSrv.isWrongUser(userWithToken.user)) {
              this.projectSrv.loadProjectsByUser(userWithToken.user, this.projectsStateSrv);
          } else {
              throw new Error('User is null or WrongUser');
          }
        }
      })
    );
    this.isProjectsChanged$ = this.projectsStateSrv.isProjectsChanged$
    .pipe(
      map((r: IsProjectsChangedInterface): OpStateInterface   => {
        this.stateIsEnd += ` ${r.isEnd};`;
        this.stateOp += ` ${r.op};`;

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
  }

  addProject() {
    this.router.navigate([`/projects`, '0000000']);
  }
  editProject(project: ProjectInterface): void {
    this.router.navigate([`/projects`, project.id, 'tasks']);
  }

  ngOnDestroy() {
    if (this.simpleSnackBarRef != null) {
      this.simpleSnackBarRef.dismiss();
      this.simpleSnackBarRef = null;
    }
  }
}
