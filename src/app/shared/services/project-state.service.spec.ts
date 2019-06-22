import { TestBed } from '@angular/core/testing';

import { ProjectStateService } from './project-state.service';

describe('ProjectStateService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ProjectStateService = TestBed.get(ProjectStateService);
    expect(service).toBeTruthy();
  });
});
