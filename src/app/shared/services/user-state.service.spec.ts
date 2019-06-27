import { TestBed } from '@angular/core/testing';

import { UserStateService } from './user-state.service';

class UserStateServiceStub {
  // navigateByUrl(url: string) { return url; }
  open: () => { };
}

describe('UserStateService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      { provide: UserStateService, useClass: UserStateServiceStub }
    ]
  }));

  it('01 - should be created', () => {
    const service: UserStateService = TestBed.get(UserStateService);
    expect(service).toBeTruthy();
  });
});
