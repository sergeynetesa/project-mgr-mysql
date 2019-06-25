import { Injectable, Inject, InjectionToken } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { of, Subject } from 'rxjs';
import { catchError, takeUntil, shareReplay, startWith } from 'rxjs/operators';

// export const API_URL = new InjectionToken<string>('API URL', {
//   providedIn: 'root',
//   factory: () => 'https://localhost:3043'
// });
export const API_URL = new InjectionToken<string>('API URL', {
  providedIn: 'root',
  factory: () => 'https://jsonserverjwt-env.hqzyn7t6mf.us-east-2.elasticbeanstalk.com'
});

import { UserInterface, WrongUser, UserWithTokenInterface,
          WrongUserWithJWT, UserStateEnum, IsUserChangedInterface } from '../model/user.interface';
import { ChangeResultEnum, MessageTypeEnum } from '../model/project.interface';

import { UserStateService } from './user-state.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private curUserSub$ = new Subject<UserWithTokenInterface>();
  public curUser$ = this.curUserSub$.asObservable()
                      .pipe(
                        startWith(WrongUserWithJWT),
                        shareReplay(1)
                      );
  public curUserWithToken: UserWithTokenInterface = WrongUserWithJWT;

  private onDestroySub$ = new Subject<boolean>();

  constructor(
    @Inject(API_URL) private apiUrl: string,
    private http: HttpClient
  ) {
    this.curUser$
    .subscribe(
      user => {
        this.curUserWithToken = user;
      }
    );
  }

  public isAnonymUser(user: UserWithTokenInterface): boolean {
    if (!user) {
      throw new Error('Parameter [user] is null');
    } else if (typeof user.token === 'string' && user.token.length === 0) {
      return true;
    }
    return false;
  }

  public isWrongUser(user: UserInterface): boolean {
    if (!user) {
      throw new Error('Parameter [user] is null');
    } else if (user === WrongUser) {
      return true;
    }
    return false;
  }

  public signupUser(userInfo: UserInterface, stateService: UserStateService): void {
    if (stateService) {
      const isUserChangedEnter: IsUserChangedInterface = {
        op: UserStateEnum.SIGNUP,
        isEnd: false,
        opResult: ChangeResultEnum.NOSET,
        userWithToken: this.curUserWithToken
      };
      stateService.next(isUserChangedEnter);
    }

    this.http.post<UserInterface>(`${this.apiUrl}/auth/signup`, userInfo)
    .pipe(
      catchError((err: any): any => {
        let msg: string;
        let isUserChangedError: IsUserChangedInterface = null;
        if (stateService) {
          isUserChangedError = {
            op: UserStateEnum.SIGNUP,
            isEnd: true,
            opResult: ChangeResultEnum.ERROR,
            userWithToken: this.curUserWithToken
          };
        }
        if (err instanceof HttpErrorResponse) {
          const status = err.status;
          if (status === 400 || status === 500) {
            msg = err.error ? err.error.message : err.message;
            isUserChangedError.messageType = MessageTypeEnum.ERROR;
            isUserChangedError.message = msg;
          } else {
            msg = err.statusText;
            isUserChangedError.messageType = MessageTypeEnum.ERROR;
            isUserChangedError.message = msg;
          }
        } else {
          msg = 'UNKNOWN ERROR';
          isUserChangedError.messageType = MessageTypeEnum.ERROR;
          isUserChangedError.message = msg;
        }
        if (stateService) {
          stateService.next(isUserChangedError);
        }
        this.onDestroySub$.next(true);

        return of('ERROR');
      }),
      takeUntil(this.onDestroySub$)
    ).subscribe(
      (userWithToken: UserWithTokenInterface) => {
        if (stateService) {
          const isUserChangedExit: IsUserChangedInterface = {
            op: UserStateEnum.SIGNUP,
            isEnd: true,
            opResult: ChangeResultEnum.SUCCESS,
            userWithToken
          };
          stateService.next(isUserChangedExit);
        }
        this.curUserSub$.next(userWithToken);
      }
    );
  }

  public loginUser(userInfo: UserInterface, stateService: UserStateService): void {
    if (this.curUserWithToken.token.length !== 0) {
      this.curUserSub$.next(WrongUserWithJWT);
    }
    if (stateService) {
      const isUserChangedEnter: IsUserChangedInterface = {
        op: UserStateEnum.LOGIN,
        isEnd: false,
        opResult: ChangeResultEnum.NOSET,
        userWithToken: this.curUserWithToken
      };
      stateService.next(isUserChangedEnter);
    }

    this.http.post<UserInterface>(`${this.apiUrl}/auth/login`, userInfo)
    .pipe(
      catchError((err: any): any => {
        let msg: string;
        let isUserChangedError: IsUserChangedInterface = null;
        if (stateService) {
          isUserChangedError = {
            op: UserStateEnum.LOGIN,
            isEnd: true,
            opResult: ChangeResultEnum.ERROR,
            userWithToken: this.curUserWithToken
          };
        }
        if (err instanceof HttpErrorResponse) {
          const status = err.status;
          if (status === 400 || status === 500) {
            msg = err.error ? err.error.message : err.message;
            isUserChangedError.messageType = MessageTypeEnum.ERROR;
            isUserChangedError.message = msg;
          } else {
            msg = err.statusText;
            isUserChangedError.messageType = MessageTypeEnum.ERROR;
            isUserChangedError.message = msg;
          }
        } else {
          msg = 'UNKNOWN ERROR';
          isUserChangedError.messageType = MessageTypeEnum.ERROR;
          isUserChangedError.message = msg;
        }
        if (stateService) {
          stateService.next(isUserChangedError);
        }
        this.onDestroySub$.next(true);

        return of('ERROR');
      }),
      takeUntil(this.onDestroySub$)
    ).subscribe(
      (userWithToken: UserWithTokenInterface) => {
        if (stateService) {
            const isUserChangedExit: IsUserChangedInterface = {
              op: UserStateEnum.LOGIN,
              isEnd: true,
              opResult: ChangeResultEnum.SUCCESS,
              userWithToken
            };
            stateService.next(isUserChangedExit);
          }
        this.curUserSub$.next(userWithToken);
      }
    );
  }

  logoutUser(): void {
    if (this.curUserWithToken !== WrongUserWithJWT) {
      this.curUserSub$.next(WrongUserWithJWT);
    }
  }
}
