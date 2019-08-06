import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';

class AuthServiceStub {
  // navigateByUrl(url: string) { return url; }
  open: () => { };
}

describe('AuthService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      { provide: AuthService, useClass: AuthServiceStub }
    ]
  }));

  it('01 - should be created', () => {
    const service: AuthService = TestBed.get(AuthService);
    expect(service).toBeTruthy();
  });
});
