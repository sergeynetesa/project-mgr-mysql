import { TestBed } from '@angular/core/testing';

import { ProjectService } from './project.service';

class ProjectServiceStub {
  // navigateByUrl(url: string) { return url; }
  open: () => { };
}

describe('ProjectService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      { provide: ProjectService, useClass: ProjectServiceStub }
    ]
  }));

  it('01 - should be created', () => {
    const service: ProjectService = TestBed.get(ProjectService);
    expect(service).toBeTruthy();
  });
});
