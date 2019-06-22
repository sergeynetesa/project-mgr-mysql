import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest, HttpHandler,
          HttpEvent, HttpInterceptor } from '@angular/common/http';

import { Observable } from 'rxjs';

import { UserService } from '../services/user.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  currentRequest: HttpRequest<any>;

  constructor(
      private http: HttpClient,
      private userSrv: UserService
    ) {

    }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
      if (request.url.indexOf('/api') === -1) {
          return next.handle(request); // do nothing
      }
      const curUser = this.userSrv.curUserWithToken;
      if (curUser.token.length !== 0) {
          request = request.clone({
              setHeaders: {
                  Authorization: `Bearer ${curUser.token}`
              }
          });
      }
      this.currentRequest = request;
      return next.handle(request);
  }
}
