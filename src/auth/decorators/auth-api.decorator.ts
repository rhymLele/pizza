import { Get, HttpCode, HttpStatus, Post, UseGuards, applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ResponseMessage } from '../../common/decorators/response-message.decorator.js';
import { LocalAuthGuard } from '../guards/local-auth.guard.js';
import { JwtAuthGuard } from '../guards/jwt-auth.guard.js';
import { RefreshTokenGuard } from '../guards/refresh-token.guard.js';

// applyDecorators() gom nhiều decorator thành 1 — kỹ thuật "composite decorator".
// Mỗi hàm bên dưới đại diện cho toàn bộ metadata của 1 endpoint:
// route path, HTTP method, guards, swagger docs, response message.
// Controller chỉ cần gọi 1 decorator thay vì 6-8 dòng lặp lại.

const tokenExample = {
  message: { code: 'SUCCESS', message: 'Thành công' },
  reason: 'Thành công',
  status: true,
  data: { accessToken: 'eyJhbGciOiJIUzI1NiJ9...', refreshToken: 'eyJhbGciOiJIUzI1NiJ9...' },
  count: 1,
};

const userExample = {
  message: { code: 'SUCCESS', message: 'Thành công' },
  reason: 'Thành công',
  status: true,
  data: { id: 'uuid-v4', email: 'user@example.com', name: 'Nguyễn Văn A', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' },
  count: 1,
};

export const ApiRegister = () =>
  applyDecorators(
    Post('register'),
    ResponseMessage('Đăng ký thành công'),
    ApiOperation({ summary: 'Đăng ký tài khoản mới' }),
    ApiHeader({ name: 'Idempotency-Key', description: 'UUID để tránh đăng ký trùng lặp', required: false }),
    ApiResponse({ status: 201, description: 'Đăng ký thành công', example: tokenExample }),
    ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' }),
    ApiResponse({ status: 409, description: 'Email đã tồn tại' }),
  );

export const ApiLogin = () =>
  applyDecorators(
    Post('login'),
    HttpCode(HttpStatus.OK),
    UseGuards(LocalAuthGuard),
    ResponseMessage('Đăng nhập thành công'),
    ApiOperation({ summary: 'Đăng nhập' }),
    ApiResponse({ status: 200, description: 'Đăng nhập thành công', example: tokenExample }),
    ApiResponse({ status: 401, description: 'Email hoặc mật khẩu không đúng' }),
  );

export const ApiRefreshToken = () =>
  applyDecorators(
    Post('refresh'),
    HttpCode(HttpStatus.OK),
    UseGuards(RefreshTokenGuard),
    ResponseMessage('Làm mới token thành công'),
    ApiBearerAuth('access-token'),
    ApiOperation({ summary: 'Làm mới access token bằng refresh token' }),
    ApiResponse({ status: 200, description: 'Cặp token mới', example: tokenExample }),
    ApiResponse({ status: 401, description: 'Refresh token không hợp lệ hoặc đã hết hạn' }),
  );

export const ApiLogout = () =>
  applyDecorators(
    Post('logout'),
    HttpCode(HttpStatus.OK),
    UseGuards(JwtAuthGuard),
    ResponseMessage('Đăng xuất thành công'),
    ApiBearerAuth('access-token'),
    ApiOperation({ summary: 'Đăng xuất — vô hiệu hoá refresh token' }),
    ApiResponse({ status: 200, description: 'Đăng xuất thành công' }),
    ApiResponse({ status: 401, description: 'Chưa đăng nhập hoặc token hết hạn' }),
  );

export const ApiGetMe = () =>
  applyDecorators(
    Get('me'),
    UseGuards(JwtAuthGuard),
    ResponseMessage('Lấy thông tin người dùng thành công'),
    ApiBearerAuth('access-token'),
    ApiOperation({ summary: 'Lấy thông tin người dùng hiện tại' }),
    ApiResponse({ status: 200, description: 'Thông tin user', example: userExample }),
    ApiResponse({ status: 401, description: 'Chưa đăng nhập hoặc token hết hạn' }),
  );
