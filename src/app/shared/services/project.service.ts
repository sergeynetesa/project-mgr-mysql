import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';

import { of, Subject } from 'rxjs';
import { map, catchError, takeUntil, shareReplay, startWith } from 'rxjs/operators';

import { API_URL, UserService } from './user.service';
import { ProjectInterface, WrongProject, IsProjectsChangedInterface, ProjectStateEnum,
          ChangeResultEnum, MessageTypeEnum, WrongProjectArray } from '../model/project.interface';
import { UserInterface } from '../model/user.interface';
import { ProjectStateService } from './project-state.service';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private curProjectsSub$ = new Subject<ProjectInterface[]>();
  public curProjects$ = this.curProjectsSub$.asObservable()
                        .pipe(
                          startWith(WrongProjectArray),
                          shareReplay(1)
                        );
  public curProjects: ProjectInterface[] = WrongProjectArray;
  // ------------
  private currentProjectSub$ = new Subject<ProjectInterface>();
  public currentProject$ = this.currentProjectSub$.asObservable()
                        .pipe(
                          startWith(WrongProject),
                          shareReplay(1)
                        );
  public currentProject: ProjectInterface = WrongProject;
  // ------------
  private onDestroySub$ = new Subject<boolean>();
  // ------------
  constructor(
    @Inject(API_URL) private apiUrl: string,
    private http: HttpClient,
    private userSrv: UserService
  ) {
    this.curProjects$.subscribe(
      projects => {
        this.curProjects = projects;
      }
    );

    this.currentProject$.subscribe(
      project => {
        this.currentProject = project;
      }
    );
  }

  public isProjectsNotEmpty(projects: ProjectInterface[]): boolean {
    if (!projects) {
      throw new Error('Parameter [projects] is null');
    }
    if (projects === WrongProjectArray) {
      return false;
    } else {
        return true;
    }
  }
  public isProjectWrong(project: ProjectInterface): boolean {
    if (!project) {
      throw new Error('Parameter [project] is null');
    }
    if (project === WrongProject) {
      return true;
    } else {
        return false;
    }
  }
  private isProjectsEmpty(): boolean {
    return !this.isProjectsNotEmpty(this.curProjects);
  }
  public emptyProjects(): void {
    if (!this.isProjectsEmpty()) {
      this.curProjectsSub$.next(WrongProjectArray);
    }
  }
  public setCurrentProject(project: ProjectInterface): void {
    if (project) {
      this.currentProjectSub$.next(project);
    } else {
        this.currentProjectSub$.next(WrongProject);
    }
  }
  // ------------------------------------------------------------
  loadProjectsByUser(user: UserInterface, stateService: ProjectStateService): void {
    if (!this.isProjectsEmpty()) {
      return; // ???
    }
    if (stateService) {
      const isProjectsChangedEnter: IsProjectsChangedInterface = {
        op: ProjectStateEnum.LOAD,
        isEnd: false,
        opResult: ChangeResultEnum.NOSET
      };
      stateService.nextIsProjectsChanged(isProjectsChangedEnter);
    }
    this.http.get<any>(`${this.apiUrl}/api/projects`, {
      params: new HttpParams()
          .set('userId', user.id)
    })
    .pipe(
      catchError((err: any): any => {
        let retMsg = 'ERROR';
        let msg: string;
        let isProjectsChangedError: IsProjectsChangedInterface = null;
        if (stateService) {
          isProjectsChangedError = {
            op: ProjectStateEnum.LOAD,
            isEnd: true,
            opResult: ChangeResultEnum.ERROR,
          };
        }
        if (err instanceof HttpErrorResponse) {
          const status = err.status;
          if (status === 401) {
            retMsg = 'JWT_EXPIRED';
            msg = 'Authentication has been expired!';
            isProjectsChangedError.messageType = MessageTypeEnum.ERROR;
            isProjectsChangedError.message = msg;
          } else if (status === 400 || status === 500) {
            msg = err.error ? err.error.message : err.message;
            isProjectsChangedError.messageType = MessageTypeEnum.ERROR;
            isProjectsChangedError.message = msg;
          } else {
            retMsg = 'ERROR';
            msg = err.statusText;
            isProjectsChangedError.messageType = MessageTypeEnum.ERROR;
            isProjectsChangedError.message = msg;
          }
        } else {
          retMsg = 'ERROR';
          msg = 'UNKNOWN ERROR';
          isProjectsChangedError.messageType = MessageTypeEnum.ERROR;
          isProjectsChangedError.message = msg;
        }
        if (stateService) {
          stateService.nextIsProjectsChanged(isProjectsChangedError);
        }
        this.onDestroySub$.next(true);

        return of('ERROR');
      }),
      map((p: any) => {
        let retObj: any;
        let retMsg: string;
        if (typeof p === 'object') {
          retObj = p;
          retMsg = 'OK';
        }
        return {token: 'OK', projects: retObj};
      }),
      takeUntil(this.onDestroySub$)
    ).subscribe(
      (rezObj: {token: string; projects: ProjectInterface[]} ) => {
        if (rezObj.token === 'ERROR') {
          if (stateService) {
            const isProjectsChangedError: IsProjectsChangedInterface = {
              op: ProjectStateEnum.LOAD,
              isEnd: true,
              opResult: ChangeResultEnum.ERROR,
            };
            stateService.nextIsProjectsChanged(isProjectsChangedError);
          }
          this.emptyProjects();
        } else if (rezObj.token === 'OK') {
          if (stateService) {
            const isProjectsChangedExit: IsProjectsChangedInterface = {
              op: ProjectStateEnum.LOAD,
              isEnd: true,
              opResult: ChangeResultEnum.SUCCESS
            };
            stateService.nextIsProjectsChanged(isProjectsChangedExit);
          }
          this.curProjectsSub$.next(rezObj.projects);
        }
      }
    );
  }
  addProjectByUser(user: UserInterface, prj: ProjectInterface, stateService: ProjectStateService): void {
    if (stateService) {
      const isProjectsChangedEnter: IsProjectsChangedInterface = {
        op: ProjectStateEnum.ADD,
        isEnd: false,
        opResult: ChangeResultEnum.NOSET,
        project: prj
      };
      stateService.nextIsProjectsChanged(isProjectsChangedEnter);
    }
    this.http.post<ProjectInterface>(`${this.apiUrl}/api/projects`, prj)
      .pipe(
        catchError((err: any): any => {
          let retMsg = 'ERROR';
          let msg: string;
          let isProjectsChangedError: IsProjectsChangedInterface = null;
          if (stateService) {
            isProjectsChangedError = {
              op: ProjectStateEnum.ADD,
              isEnd: true,
              opResult: ChangeResultEnum.ERROR,
            };
          }
          if (err instanceof HttpErrorResponse) {
            const status = err.status;
            if (status === 401) {
              retMsg = 'JWT_EXPIRED';
              msg = 'Authentication has been expired!';
              isProjectsChangedError.messageType = MessageTypeEnum.ERROR;
              isProjectsChangedError.message = msg;
            } else if (status === 400 || status === 500) {
              msg = err.error ? err.error.message : err.message;
              isProjectsChangedError.messageType = MessageTypeEnum.ERROR;
              isProjectsChangedError.message = msg;
            } else {
              retMsg = 'ERROR';
              msg = err.statusText;
              isProjectsChangedError.messageType = MessageTypeEnum.ERROR;
              isProjectsChangedError.message = msg;
            }
          } else {
            retMsg = 'ERROR';
            msg = 'UNKNOWN ERROR';
            isProjectsChangedError.messageType = MessageTypeEnum.ERROR;
            isProjectsChangedError.message = msg;
          }
          if (stateService) {
            stateService.nextIsProjectsChanged(isProjectsChangedError);
          }
          this.onDestroySub$.next(true);

          return of(retMsg);
        }),
        map((newProj: any) => {
          const newProject = newProj as ProjectInterface;
          const projectId = newProject.id;

          let newProjects: ProjectInterface[];
          if (this.isProjectsEmpty()) {
            newProjects = [newProj];
          } else {
            newProjects = [...this.curProjects, newProj];
          }
          if (stateService) {
            const isProjectsChangedExit: IsProjectsChangedInterface = {
              op: ProjectStateEnum.ADD,
              isEnd: true,
              opResult: ChangeResultEnum.SUCCESS,
              project: newProject
            };
            stateService.nextIsProjectsChanged(isProjectsChangedExit);
          }
          return {token: 'OK', projects: newProjects};
        }),
        takeUntil(this.onDestroySub$)
      ).subscribe(
        (rezObj: {token: string; projects: ProjectInterface[]} ) => {
          if (rezObj.token === 'ERROR') {
            if (stateService) { // twice ???
              const isProjectsChangedError: IsProjectsChangedInterface = {
                op: ProjectStateEnum.ADD,
                isEnd: true,
                opResult: ChangeResultEnum.ERROR,
                project: WrongProject
              };
              stateService.nextIsProjectsChanged(isProjectsChangedError);
            }
            this.emptyProjects();
          } else if (rezObj.token === 'OK') {
              this.curProjectsSub$.next(rezObj.projects);
          }
        }
      );
  }
  updateProjectByUser(user: UserInterface, prj: ProjectInterface, stateService: ProjectStateService): void  {
    if (stateService) {
      const isProjectsChangedEnter: IsProjectsChangedInterface = {
        op: ProjectStateEnum.UPDATE,
        isEnd: false,
        opResult: ChangeResultEnum.NOSET,
        project: prj
      };
      stateService.nextIsProjectsChanged(isProjectsChangedEnter);
    }
    this.http.put<ProjectInterface>(`${this.apiUrl}/api/projects/${prj.id}`, prj)
      .pipe(
        catchError((err: any): any => {
          let retMsg = 'ERROR';
          let msg: string;
          let isProjectsChangedError: IsProjectsChangedInterface = null;
          if (stateService) {
            isProjectsChangedError = {
              op: ProjectStateEnum.UPDATE,
              isEnd: true,
              opResult: ChangeResultEnum.ERROR,
            };
          }
          if (err instanceof HttpErrorResponse) {
            const status = err.status;
            if (status === 401) {
              retMsg = 'JWT_EXPIRED';
              msg = 'Authentication has been expired!';
              // this.userSrv.logoutUser();
              // this.emptyProjects();
              isProjectsChangedError.messageType = MessageTypeEnum.ERROR;
              isProjectsChangedError.message = msg;
            } else if (status === 400 || status === 500) {
              msg = err.error ? err.error.message : err.message;
              isProjectsChangedError.messageType = MessageTypeEnum.ERROR;
              isProjectsChangedError.message = msg;
            } else {
              retMsg = 'ERROR';
              msg = err.statusText;
              isProjectsChangedError.messageType = MessageTypeEnum.ERROR;
              isProjectsChangedError.message = msg;
            }
          } else {
            retMsg = 'ERROR';
            msg = 'UNKNOWN ERROR';
            isProjectsChangedError.messageType = MessageTypeEnum.ERROR;
            isProjectsChangedError.message = msg;
          }
          if (stateService) {
            stateService.nextIsProjectsChanged(isProjectsChangedError);
          }
          this.onDestroySub$.next(true);

          return of(retMsg);
        }),
        map((newProj: any) => {
          if (typeof newProj === 'string' && newProj === 'ERROR') {
            return {token: 'ERROR', projects: [WrongProject]};
          }
          const newProject = newProj as ProjectInterface;
          const projectId = newProject.id;

          const newProjects = this.curProjects.map((p: ProjectInterface) => {
            if (p.id === projectId) {
              return newProject;
            } else {
              return p;
            }
          });
          if (stateService) {
            const isProjectsChangedExit: IsProjectsChangedInterface = {
              op: ProjectStateEnum.UPDATE,
              isEnd: true,
              opResult: ChangeResultEnum.SUCCESS,
              project: newProject
            };
            stateService.nextIsProjectsChanged(isProjectsChangedExit);
          }
          return {token: 'OK', projects: newProjects};
        }),
        takeUntil(this.onDestroySub$)
      ).subscribe(
        (rezObj: {token: string; projects: ProjectInterface[]} ) => {
          if (rezObj.token === 'ERROR') {
            if (stateService) {
            const isProjectsChangedError: IsProjectsChangedInterface = {
              op: ProjectStateEnum.UPDATE,
              isEnd: true,
              opResult: ChangeResultEnum.ERROR,
              project: WrongProject
            };
            stateService.nextIsProjectsChanged(isProjectsChangedError);
            }
            this.emptyProjects(); // this.curProjectsSub$.next(projects);
          } else if (rezObj.token === 'OK') {
              this.curProjectsSub$.next(rezObj.projects);
          }
        }
      );
  }
  deleteProjectByUser(user: UserInterface, prj: ProjectInterface, stateService: ProjectStateService): void  {
    if (stateService) {
      const isProjectsChangedEnter: IsProjectsChangedInterface = {
        op: ProjectStateEnum.DELETE,
        isEnd: false,
        opResult: ChangeResultEnum.NOSET,
        project: prj
      };
      stateService.nextIsProjectsChanged(isProjectsChangedEnter);
    }
    this.http.delete<ProjectInterface>(`${this.apiUrl}/api/projects/${prj.id}`)
      .pipe(
        catchError((err: any): any => {
          let retMsg = 'ERROR';
          let msg: string;
          let isProjectsChangedError: IsProjectsChangedInterface = null;
          if (stateService) {
            isProjectsChangedError = {
              op: ProjectStateEnum.DELETE,
              isEnd: true,
              opResult: ChangeResultEnum.ERROR,
            };
          }
          if (err instanceof HttpErrorResponse) {
            const status = err.status;
            if (status === 401) {
              retMsg = 'JWT_EXPIRED';
              msg = 'Authentication has been expired!';
              isProjectsChangedError.messageType = MessageTypeEnum.ERROR;
              isProjectsChangedError.message = msg;
            } else if (status === 400 || status === 500) {
              msg = err.error ? err.error.message : err.message;
              isProjectsChangedError.messageType = MessageTypeEnum.ERROR;
              isProjectsChangedError.message = msg;
            } else {
              retMsg = 'ERROR';
              msg = err.statusText;
              isProjectsChangedError.messageType = MessageTypeEnum.ERROR;
              isProjectsChangedError.message = msg;
            }
          } else {
            retMsg = 'ERROR';
            msg = 'UNKNOWN ERROR';
            isProjectsChangedError.messageType = MessageTypeEnum.ERROR;
            isProjectsChangedError.message = msg;
          }
          if (stateService) {
            stateService.nextIsProjectsChanged(isProjectsChangedError);
          }
          this.onDestroySub$.next(true);

          return of(retMsg);
        }),
        map((newProj: any) => {
          if (typeof newProj === 'string' && newProj === 'ERROR') {
            return {token: 'ERROR', projects: [WrongProject]};
          }
          const newPrjs = this.curProjects.filter((project: ProjectInterface) => {
            if (project.id !== prj.id) {
              return project;
            }
          });
          if (stateService) {
            const isProjectsChangedExit: IsProjectsChangedInterface = {
              op: ProjectStateEnum.DELETE,
              isEnd: true,
              opResult: ChangeResultEnum.SUCCESS,
              project: prj
            };
            stateService.nextIsProjectsChanged(isProjectsChangedExit);
          }
          return {token: 'OK', projects: newPrjs};
        }),
        takeUntil(this.onDestroySub$)
      ).subscribe(
        (rezObj: {token: string; projects: ProjectInterface[]} ) => {
          if (rezObj.token === 'ERROR') {
            if (stateService) {
              const isProjectsChangedError: IsProjectsChangedInterface = {
                op: ProjectStateEnum.DELETE,
                isEnd: true,
                opResult: ChangeResultEnum.ERROR,
                project: WrongProject
              };
              stateService.nextIsProjectsChanged(isProjectsChangedError);
            }
            this.emptyProjects(); // this.curProjectsSub$.next(projects);
          } else if (rezObj.token === 'OK') {
              this.curProjectsSub$.next(rezObj.projects);
          }
        }
      );
  }

  // --------------------------------------------------------------
}
