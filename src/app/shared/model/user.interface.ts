import { Observable } from 'rxjs';
import { ChangeResultEnum, MessageTypeEnum } from './project.interface';

export interface UserInterface {
    id?: string;
    name: string;
    email: string;
}
export interface UserWithTokenInterface {
    user: UserInterface;
    token: string;
}
export const WrongUser: UserInterface = {
    id: '00000000-0000-0000-0000-000000000000',
    name: 'Wrong',
    email: 'Wrong'
};
export const WrongUserWithJWT: UserWithTokenInterface = {
    token: '',
    user: null
};
export enum UserStateEnum {
    NOSET = 'NOSET',
    // ADD = 'ADD',
    // UPDATE = 'UPDATE',
    // DELETE = 'DELETE',
    SIGNUP = 'SIGNUP',
    LOGIN = 'LOGIN'
}
export interface IsUserChangedInterface {
    op: UserStateEnum;
    isEnd: boolean;
    opResult: ChangeResultEnum;
    userWithToken: UserWithTokenInterface;
    messageType?: MessageTypeEnum;
    message?: string;
}
export interface UserStateInterface {
    context: string;
    isUserChanged$: Observable<IsUserChangedInterface>;
    isUserChangedValue: IsUserChangedInterface;
    reset(): void;
    complete(): void;
    next(state: IsUserChangedInterface): void;
  }
