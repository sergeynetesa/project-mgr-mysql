import { TestBed } from '@angular/core/testing';

import { ScreenService } from './screen.service';

describe('ScreenService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('01 - should be created', () => {
    const service: ScreenService = TestBed.get(ScreenService);
    expect(service).toBeTruthy();
  });
});
