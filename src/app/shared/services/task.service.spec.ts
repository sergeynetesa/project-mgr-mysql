import { TestBed } from '@angular/core/testing';

import { TaskService } from './task.service';

class TaskServiceStub {
  // navigateByUrl(url: string) { return url; }
  open: () => { };
}

describe('TaskService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      { provide: TaskService, useClass: TaskServiceStub }
    ]
  }));

  it('01 - should be created', () => {
    const service: TaskService = TestBed.get(TaskService);
    expect(service).toBeTruthy();
  });
});
