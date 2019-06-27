import { TestBed } from '@angular/core/testing';

import { ProjectStateService } from './project-state.service';

class ProjectStateServiceStub {
  // navigateByUrl(url: string) { return url; }
  open: () => { };
}

describe('ProjectStateService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      { provide: ProjectStateService, useClass: ProjectStateServiceStub }
    ]
  }));

  it('01 - should be created', () => {
    const service: ProjectStateService = TestBed.get(ProjectStateService);
    expect(service).toBeTruthy();
  });
});
