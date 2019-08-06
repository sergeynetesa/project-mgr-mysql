import { TestBed } from '@angular/core/testing';

import { ViewportService } from './viewport.service';

describe('Viewport.ServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('01 - should be created', () => {
    const service: ViewportService = TestBed.get(ViewportService);
    expect(service).toBeTruthy();
  });
});
