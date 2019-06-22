import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { MatSnackBar, SimpleSnackBar, MatSnackBarRef,
  MatSnackBarDismiss } from '@angular/material';

import { UserInterface, UserWithTokenInterface, IsUserChangedInterface, UserStateEnum } from '../../shared/model/user.interface';
import { UserService } from '../../shared/services/user.service';
import { ProjectService } from '../../shared/services/project.service';

import { CustomValidators } from '../custom-validators';
import { ChangeResultEnum } from 'src/app/shared/model/project.interface';
import { UserStateService } from 'src/app/shared/services/user-state.service';

@Component({
  selector: 'app-signup-form',
  templateUrl: './signup-form.component.html',
  styleUrls: ['./signup-form.component.scss'],
  providers: [
    UserStateService
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignupFormComponent implements OnInit, OnDestroy {
  returnUrl: string;
  loginFG: FormGroup;
  userFG: FormGroup;
  // --------------------------------------------------------------
  private simpleSnackBarRef: MatSnackBarRef<SimpleSnackBar> = null;
  // --------------------------------------------------------------

  currentUser$: Observable<UserWithTokenInterface>;

  protected isUserChanged$: Observable<IsUserChangedInterface> = null;
  // Accessors
  get login_name() { return this.loginFG.get('login_name'); }
  get isLoginNameInvalid() {
    const c = this.loginFG.get('login_name');
    return  c && c.errors && (c.dirty || c.touched);
  }
  get login_email() { return this.loginFG.get('login_email'); }

  get signup_name() { return this.userFG.get('signup_name'); }
  get signup_email() { return this.userFG.get('signup_email'); }


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    protected userSrv: UserService,
    protected projectSrv: ProjectService,
    protected userStateSrv: UserStateService,
    private snackBarSrv: MatSnackBar
  ) { }

  ngOnInit() {
    this.returnUrl = '/projects/';

    this.loginFG = this.fb.group({
      login_name: ['', {
        validators: [
        Validators.required,
        CustomValidators.userNameValidator()
        ], updateOn: 'change' }
      ],
      login_email: ['', {
      validators: [
        Validators.required,
        Validators.email
        ], updateOn: 'change' }
      ]
    });
    this.userFG = this.fb.group({
      signup_name: ['', {
        validators: [
          Validators.required,
          CustomValidators.userNameValidator()
        ],
        updateOn: 'change' }
      ],
      signup_email: ['', {
        validators: [
          Validators.required,
          Validators.email
        ],
        updateOn: 'change' }
      ]
    });
    this.currentUser$ = this.userSrv.curUser$
      .pipe(
        tap((user: UserWithTokenInterface) => {
          if (typeof user.token === 'string' && user.token.length === 0) {
            const loginNameFC = this.loginFG.get('login_name') as FormControl;
            // loginNameFC.reset(null, {onlySelf: true, emitEvent: false}); // ~
            if (loginNameFC) {
              loginNameFC.reset();
              loginNameFC.setErrors(null);
            }
            const loginEmailFC = this.loginFG.get('login_email') as FormControl;
            if (loginEmailFC) {
              loginEmailFC.reset();
              loginEmailFC.setErrors(null);
            }
            const signupNameFC = this.userFG.get('signup_name') as FormControl;
            if (signupNameFC) {
              signupNameFC.reset();
              signupNameFC.setErrors(null);
            }
            const signupEmailFC = this.userFG.get('signup_email') as FormControl;
            if (signupEmailFC) {
              signupEmailFC.reset();
              signupEmailFC.setErrors(null);
            }
          }
        })
      );

    this.isUserChanged$ = this.userStateSrv.isUserChanged$
    .pipe(
      tap((r: IsUserChangedInterface) => {
        if (r.op === UserStateEnum.SIGNUP) {
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
              this.snackBarSrv.open(`User: '${r.userWithToken.user.name}' has been created`,
              'X', {
              duration: 0,
              panelClass: 'mat-snack-bar-container_info'
            });
            this.simpleSnackBarRef.afterDismissed()
            .subscribe(
              (res: MatSnackBarDismiss) => {
                if (res.dismissedByAction) {
                  this.router.navigate([this.returnUrl]);
                }
              }
            );
          }
        } else if (r.op === UserStateEnum.LOGIN) {
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
              this.snackBarSrv.open(`User: '${r.userWithToken.user.name}' is logged in`,
              'X', {
              duration: 0,
              panelClass: 'mat-snack-bar-container_info'
            });
            this.simpleSnackBarRef.afterDismissed()
            .subscribe(
              (res: MatSnackBarDismiss) => {
                if (res.dismissedByAction) {
                  this.router.navigate([this.returnUrl]);
                }
              }
            );
          }
        }
      })
    );
  }
  onLoginSubmit({ value, valid }: { value: any, valid: boolean }) {
    if (valid) {
      const u: UserInterface = {email: value.login_email, name: value.login_name};
      this.userSrv.loginUser(u, this.userStateSrv);
    }
  }
  onSignupSubmit({ value, valid }: { value: any, valid: boolean }) {
    if (valid) {
      const u: UserInterface = {email: value.signup_email, name: value.signup_name};
      this.userSrv.signupUser(u, this.userStateSrv);
    }
  }
  ngOnDestroy() {
    if (this.simpleSnackBarRef != null) {
      this.simpleSnackBarRef.dismiss();
      this.simpleSnackBarRef = null;
    }
  }
}
