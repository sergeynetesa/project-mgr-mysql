import { ProjectInterface, WrongProject } from './project.interface';
export interface TaskInterface {
    id?: string;
    projectId: string;
    title: string;
    description: string;
    done: boolean;
 }
export const WrongTask: TaskInterface = {
    id: '00000000-0000-0000-0000-000000000000',
    projectId: '00000000-0000-0000-0000-000000000000',
    title: 'WRONG',
    description: 'WRONG',
    done: false
  };

export const WrongTaskArray: TaskInterface[] = [WrongTask];

export interface TaskArrayByProjectInterface {
  project: ProjectInterface;
  tasks: TaskInterface[];
}
export const WrongTaskArrayByProject: TaskArrayByProjectInterface = {
  project: WrongProject,
  tasks: WrongTaskArray
};

export type TaskListFilterType = 'all' | 'open' | 'done';

