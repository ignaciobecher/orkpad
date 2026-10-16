import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface PortalContext {
  share: any;
  workspaceId: string;
  projectId: string;
  actor: { userId: string; name: string };
}

export const PortalCtx = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): PortalContext => {
    const request = ctx.switchToHttp().getRequest();
    return request.portal;
  },
);
