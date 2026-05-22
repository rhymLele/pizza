import { Get, UseGuards, applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { ResponseMessage } from '../../common/decorators/response-message.decorator.js';

export const ApiGetFeed = () =>
  applyDecorators(
    Get(),
    UseGuards(JwtAuthGuard),
    ResponseMessage('Feed của bạn'),
    ApiBearerAuth('access-token'),
    ApiOperation({ summary: 'Lấy feed bài đăng từ các giáo viên đang follow' }),
    ApiResponse({ status: 200, description: 'Danh sách topic theo thứ tự mới nhất' }),
    ApiResponse({ status: 401, description: 'Chưa đăng nhập' }),
  );
