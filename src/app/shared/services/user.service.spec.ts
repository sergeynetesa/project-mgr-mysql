import { TestBed } from '@angular/core/testing';

// import { HttpClient, HttpParams, HttpErrorResponse, HttpResponse } from '@angular/common/http';

import { UserService } from './user.service';


class UserServiceStub {
  // navigateByUrl(url: string) { return url; }
  open: () => { };
}

describe('UserService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      { provide: UserService, useClass: UserServiceStub }
    ]
  }));

  it('01 - should be created', () => {
    const service: UserService = TestBed.get(UserService);
    expect(service).toBeTruthy();
  });
});
/* */
/*
describe('UserService', () => {

  let service: UserService;
  const http: HttpClient = null;

  beforeEach(() => {
    service = new UserService('http://localhost:3000', http);
  });

  afterEach(() => {
    service = null;

  });

  it('UserService should be created', () => {
    service = TestBed.get(UserService);
    expect(service).toBeTruthy();
  });


  it('UserServicee should return true from isCurUserAnonym', () => {

    expect(service.isCurUserAnonym()).toBeTruthy();
  });

});
*/
