import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { MsUserSafe } from '@repo/shared';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): MsUserSafe | undefined => {
    const request = ctx.switchToHttp().getRequest<{ user?: MsUserSafe }>();
    return request.user;
  },
);
