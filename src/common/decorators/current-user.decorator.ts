import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtUser } from '../../auth/interfaces/jwt-user.interface.js';

// @CurrentUser() inject thẳng req.user vào parameter của controller method.
// Thay thế pattern lặp đi lặp lại: @Request() req → req.user.
// Bắt buộc dùng cùng với @UseGuards(JwtAuthGuard) —
// nếu không có guard, req.user sẽ undefined vì JwtStrategy chưa chạy.
//
// Dùng: doSomething(@CurrentUser() user: JwtUser)
// Thay vì: doSomething(@Request() req: Express.Request & { user: any }) → req.user
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
