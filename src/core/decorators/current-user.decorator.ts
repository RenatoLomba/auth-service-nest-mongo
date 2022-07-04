import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface IUser {
  id: string;
  email: string;
  name: string;
}

export const CurrentUser = createParamDecorator(
  (_: unknown, context: ExecutionContext): IUser => {
    return context.switchToHttp().getRequest().user;
  },
);
