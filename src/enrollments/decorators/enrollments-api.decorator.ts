import { Get, Post, HttpCode, HttpStatus, UseGuards, applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { ResponseMessage } from '../../common/decorators/response-message.decorator.js';

export const ApiGetMyEnrollments = () =>
  applyDecorators(
    Get('me'),
    UseGuards(JwtAuthGuard),
    ResponseMessage('Danh sách hành trình đang học'),
    ApiBearerAuth('access-token'),
    ApiOperation({ summary: 'Lấy danh sách hành trình mà tôi đã đăng ký' }),
    ApiResponse({ status: 200, description: 'Enrollment list' }),
  );

export const ApiGetTodayTasks = () =>
  applyDecorators(
    Get(':id/today'),
    UseGuards(JwtAuthGuard),
    ResponseMessage('Task hôm nay'),
    ApiBearerAuth('access-token'),
    ApiOperation({ summary: 'Lấy task cần làm hôm nay cho một enrollment' }),
    ApiResponse({ status: 200, description: 'Today tasks + progress' }),
    ApiResponse({ status: 404, description: 'Không tìm thấy enrollment' }),
  );

export const ApiUseFreeze = () =>
  applyDecorators(
    Post(':id/freeze'),
    HttpCode(HttpStatus.OK),
    UseGuards(JwtAuthGuard),
    ResponseMessage('Dùng freeze token thành công'),
    ApiBearerAuth('access-token'),
    ApiOperation({ summary: 'Dùng 1 freeze token để giữ streak khi bỏ lỡ 1 ngày' }),
    ApiResponse({ status: 200, description: 'Enrollment sau khi dùng freeze' }),
    ApiResponse({ status: 409, description: 'Hết freeze token' }),
  );
