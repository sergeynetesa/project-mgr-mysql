import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse, HttpResponse } from '@angular/common/http';

import { of, Subject } from 'rxjs';
import { map, catchError, tap, takeUntil, shareReplay, startWith } from 'rxjs/operators';

import { API_URL } from './user.service';
import { ProjectInterface, IsProjectsChangedInterface, ProjectStateEnum,
          ChangeResultEnum, MessageTypeEnum } from '../model/project.interface';
import { TaskInterface, WrongTask, WrongTaskArray, TaskArrayByProjectInterface,
          WrongTaskArrayByProject } from '../model/task.interface';
import { ProjectStateService } from './project-state.service';


@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private curTaskArrayByPrjSub$ = new Subject<TaskArrayByProjectInterface>();
  public curTaskArrayByPrj$ = this.curTaskArrayByPrjSub$.asObservable()
                        .pipe(
                          startWith(WrongTaskArrayByProject),
                          shareReplay(1)
                        );
  public curTaskArrayByPrj: TaskArrayByProjectInterface = WrongTaskArrayByProject;
  // --------------------------------
  private currentTaskSub$ = new Subject<TaskInterface>();
  public currentTask$ = this.currentTaskSub$.asObservable()
                        .pipe(
                          startWith(WrongTask),
                          shareReplay(1)
                        );
  public currentTask: TaskInterface = WrongTask;
  // --------------------------------

  private onDestroySub$ = new Subject<boolean>();

  constructor(
    @Inject(API_URL) private apiUrl: string,
    private http: HttpClient,

  ) {
    this.curTaskArrayByPrj$.subscribe(
      tasks => {
        this.curTaskArrayByPrj = tasks;
      }
    );
    this.currentTask$.subscribe(
      task => {
        this.currentTask = task;
      }
    );
  }
  // ------------------------------------------------------------------
  public isTaskArrayByPrjWrong(taskArr: TaskArrayByProjectInterface): boolean {
    if (!taskArr) {
      throw new Error('Parameter [taskArr] is null');
    }
    if (taskArr === WrongTaskArrayByProject) {
      return true;
    } else {
        return false;
    }
  }
  public isTaskWrong(task: TaskInterface): boolean {
    if (!task) {
      throw new Error('Parameter [task] is null');
    }
    if (task === WrongTask) {
      return true;
    } else {
        return false;
    }
  }
  public isTasksNotEmpty(tasks: TaskInterface[]) {
    if (!tasks) {
      throw new Error('Parameter [tasks] is null');
    }
    if (tasks !== WrongTaskArray) {
      return true;
    }
  }
  public emptyTaskArrayByPrj() {
    if (!this.isTaskArrayByPrjWrong(this.curTaskArrayByPrj)) {
      this.curTaskArrayByPrjSub$.next(WrongTaskArrayByProject);
    }
  }
  public setCurTaskArrByPrj(taskArr: TaskArrayByProjectInterface): void {
    if (taskArr) {
      if (this.isTaskArrayByPrjWrong(taskArr)) {
        if (this.curTaskArrayByPrj !== WrongTaskArrayByProject) {
          this.curTaskArrayByPrjSub$.next(taskArr);
        }
      } else if (this.curTaskArrayByPrj !== taskArr) {
          this.curTaskArrayByPrjSub$.next(taskArr);
      }
    } else {
        this.curTaskArrayByPrjSub$.next(WrongTaskArrayByProject);
    }
  }
  public setCurrentTask(task: TaskInterface): void {
    if (task) {
      this.currentTaskSub$.next(task);
    } else {
        this.currentTaskSub$.next(WrongTask);
    }
  }

  loadTaskArrayByProject(project: ProjectInterface, stateService: ProjectStateService): void {
    if (stateService) {
      const isProjectsChangedEnter: IsProjectsChangedInterface = {
        op: ProjectStateEnum.LOAD,
        isEnd: false,
        opResult: ChangeResultEnum.NOSET
      };
      stateService.nextIsProjectsChanged(isProjectsChangedEnter);
    }
    this.http.get<any>(`${this.apiUrl}/api/list_task_by_project`, {
      params: new HttpParams()
          .set('projectId', project.id)
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
          } else if (status >= 500) {
            msg = err.error ? (err.error.error ? err.error.error.message : err.message) : err.message;
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
      takeUntil(this.onDestroySub$)
    ).subscribe(
      (tasks: TaskInterface[]) => {
        if (stateService) {
          const isProjectsChangedExit: IsProjectsChangedInterface = {
            op: ProjectStateEnum.LOAD,
            isEnd: true,
            opResult: ChangeResultEnum.SUCCESS
          };
          stateService.nextIsProjectsChanged(isProjectsChangedExit);
        }
        this.curTaskArrayByPrjSub$.next({project, tasks});
      }
    );
  }
  addTaskByProject(project: ProjectInterface, task: TaskInterface, stateService: ProjectStateService): void {
    if (stateService) {
      const isProjectsChangedEnter: IsProjectsChangedInterface = {
        op: ProjectStateEnum.ADD,
        isEnd: false,
        opResult: ChangeResultEnum.NOSET
      };
      stateService.nextIsProjectsChanged(isProjectsChangedEnter);
    }
    this.http.post<TaskInterface>(`${this.apiUrl}/api/add_task`, task)
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
            } else if (status >= 500) {
              msg = err.error ? (err.error.error ? err.error.error.message : err.message) : err.message;
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
        map((newTask: TaskInterface) => {
          let newTaskArr: TaskArrayByProjectInterface = null;
          const curTaskArray = this.curTaskArrayByPrj;
          if (this.isTaskArrayByPrjWrong(curTaskArray)) {
            newTaskArr = {
              project,
              tasks: [newTask]
            };
          } else {
            newTaskArr = {
              project: curTaskArray.project,
              tasks: [...curTaskArray.tasks, newTask]
            };
          }
          if (stateService) {
            const isProjectsChangedExit: IsProjectsChangedInterface = {
              op: ProjectStateEnum.ADD,
              isEnd: true,
              opResult: ChangeResultEnum.SUCCESS,
              message: newTask.title
            };
            stateService.nextIsProjectsChanged(isProjectsChangedExit);
          }
          return {token: 'OK', taskArr: newTaskArr};
        }),
        takeUntil(this.onDestroySub$)
      ).subscribe(
        (rezObj: {token: string; taskArr: TaskArrayByProjectInterface} ) => {
          if (rezObj.token === 'OK') {
                this.curTaskArrayByPrjSub$.next(rezObj.taskArr);
          }
        }
      );
  }
  updateTaskByProject(project: ProjectInterface, task: TaskInterface, stateService: ProjectStateService): void {
    if (stateService) {
      const isProjectsChangedEnter: IsProjectsChangedInterface = {
        op: ProjectStateEnum.UPDATE,
        isEnd: false,
        opResult: ChangeResultEnum.NOSET
      };
      stateService.nextIsProjectsChanged(isProjectsChangedEnter);
    }
    this.http.post<TaskInterface>(`${this.apiUrl}/api/update_task`, task)
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
              isProjectsChangedError.messageType = MessageTypeEnum.ERROR;
              isProjectsChangedError.message = msg;
            } else if (status >= 500) {
              msg = err.error ? (err.error.error ? err.error.error.message : err.message) : err.message;
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
        map((newTask: TaskInterface) => {
          let newTaskArr: TaskArrayByProjectInterface = null;
          const curTaskArray = this.curTaskArrayByPrj;
          if (this.isTaskArrayByPrjWrong(curTaskArray)) {
            throw new Error('Current Task Array is wrong');
          } else {
            const newTasks = curTaskArray.tasks.map((t: TaskInterface) => {
              if (t.id === newTask.id) {
                return newTask;
              } else {
                return t;
              }
            });
            newTaskArr = {
              project: curTaskArray.project,
              tasks: newTasks
            };
          }
          if (stateService) {
            const isProjectsChangedExit: IsProjectsChangedInterface = {
              op: ProjectStateEnum.UPDATE,
              isEnd: true,
              opResult: ChangeResultEnum.SUCCESS,
              message: newTask.title
            };
            stateService.nextIsProjectsChanged(isProjectsChangedExit);
          }
          return {token: 'OK', taskArr: newTaskArr};
        }),
        takeUntil(this.onDestroySub$)
      ).subscribe(
        (rezObj: {token: string; taskArr: TaskArrayByProjectInterface} ) => {
          if (rezObj.token === 'OK') {
                this.curTaskArrayByPrjSub$.next(rezObj.taskArr);
          }
        }
      );
  }
  deleteTaskByProject(project: ProjectInterface, task: TaskInterface, stateService: ProjectStateService): void {
    if (stateService) {
      const isProjectsChangedEnter: IsProjectsChangedInterface = {
        op: ProjectStateEnum.DELETE,
        isEnd: false,
        opResult: ChangeResultEnum.NOSET,
      };
      stateService.nextIsProjectsChanged(isProjectsChangedEnter);
    }
    this.http.post<ProjectInterface>(`${this.apiUrl}/api/delete_task`, task)
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
            } else if (status >= 500) {
              msg = err.error ? (err.error.error ? err.error.error.message : err.message) : err.message;
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
        map((_: any) => {
          let newTaskArr: TaskArrayByProjectInterface = null;
          const curTaskArray = this.curTaskArrayByPrj;
          if (this.isTaskArrayByPrjWrong(curTaskArray)) {
            throw new Error('Current Task Array is wrong');
          } else if (curTaskArray.project.id !== project.id) {
            throw new Error('Current Task Array Project is wrong');
          } else {
            const curTasks = curTaskArray.tasks;
            const newTasks = curTasks.filter((t: TaskInterface) => {
              if (t.id !== task.id) {
                return t;
              }
            });
            newTaskArr = {
              project: curTaskArray.project,
              tasks: newTasks
            };
          }
          if (stateService) {
            const isProjectsChangedExit: IsProjectsChangedInterface = {
              op: ProjectStateEnum.DELETE,
              isEnd: true,
              opResult: ChangeResultEnum.SUCCESS,
              message: task.title
            };
            stateService.nextIsProjectsChanged(isProjectsChangedExit);
          }
          return {token: 'OK', taskArr: newTaskArr};
        }),
        takeUntil(this.onDestroySub$)
      ).subscribe(
        (rezObj: {token: string; taskArr: TaskArrayByProjectInterface} ) => {
          if (rezObj.token === 'OK') {
              this.curTaskArrayByPrjSub$.next(rezObj.taskArr);
          }
        }
      );
  }
// --------------------------------------------------
}
