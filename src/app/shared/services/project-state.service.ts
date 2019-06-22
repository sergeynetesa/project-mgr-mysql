import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { WrongProject, IsProjectsChangedInterface,
  ProjectStateEnum, ChangeResultEnum, ProjectStateInterface } from '../model/project.interface';

@Injectable()
export class ProjectStateService implements ProjectStateInterface {
  private isProjectsChangedInit: IsProjectsChangedInterface = {
    op: ProjectStateEnum.NOSET,
    isEnd: false,
    opResult: ChangeResultEnum.NOSET,
    project: WrongProject
  };
  private isProjectsChangedSub$ =
    new BehaviorSubject<IsProjectsChangedInterface>(this.isProjectsChangedInit);
  public isProjectsChanged$ = this.isProjectsChangedSub$.asObservable();
  public isProjectsChangedValue = this.isProjectsChangedSub$.value;
  public context = 'N/A';

  constructor() {
  }

  public resetIsProjectsChanged() {
      this.isProjectsChangedSub$.next(this.isProjectsChangedInit);
  }
  public completeIsProjectsChanged() {
    this.isProjectsChangedSub$.complete();
  }
  public nextIsProjectsChanged(projectsChangedState: IsProjectsChangedInterface) {
    if (projectsChangedState) {
      this.isProjectsChangedSub$.next(projectsChangedState);
    } else {
        this.isProjectsChangedSub$.next(this.isProjectsChangedInit);
    }
  }

}
