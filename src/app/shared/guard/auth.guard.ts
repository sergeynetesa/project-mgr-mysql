import { UserWithTokenInterface } from '../model/user.interface';
import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { UserService } from '../services/user.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {

  constructor(
        private router: Router,
        private userSrv: UserService
  ) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
      const curUser: UserWithTokenInterface = this.userSrv.curUserWithToken;
      if (curUser.token.length !== 0) {
          // authorised so return true
          return true;
      }
      // not logged in so redirect to login page with the return url
      // this.router.navigate(['/login-signup'], { queryParams: { returnUrl: state.url }});
      // this.router.navigate(['/login-signup']);
      this.router.navigateByUrl('/login-signup');
      return false;
  }
}
