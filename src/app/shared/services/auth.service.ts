import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';

import { UserInterface } from '../model/user.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authKey = 'userInfo';

  constructor(
    @Inject(PLATFORM_ID) private platformId: any,
    private http: HttpClient
  ) { }

  // performs the logout
  logout(): boolean {
      this.setAuth(null);
      return true;
  }

  // persist auth into localStorage or removes it if a NULL argument is given
  setAuth(auth: UserInterface | null): boolean {
      if (isPlatformBrowser(this.platformId)) {
          if (auth) {
              localStorage.setItem(this.authKey, JSON.stringify(auth));
              // const i: string = localStorage.getItem(this.authKey);
              // console.log(`AuthService: setAuth(): %O`,JSON.parse(i));k
          } else {
              localStorage.removeItem(this.authKey);
          }
      }
      return true;
  }

  // retrieves the auth JSON object (or NULL if none)
  getAuth(): UserInterface | null {
      if (isPlatformBrowser(this.platformId)) {
          const i: string = localStorage.getItem(this.authKey);
          if (i) {
              return JSON.parse(i);
          }
      }
      return null;
  }

  // returns TRUE if the user is logged in, FALSE otherwise.
  isLoggedIn(): boolean {
      if (isPlatformBrowser(this.platformId)) {
          return localStorage.getItem(this.authKey) != null;
      }
      return false;
  }
}
