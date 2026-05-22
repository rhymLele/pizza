import { Get, Patch, Post, UseGuards, applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { ResponseMessage } from '../../common/decorators/response-message.decorator.js';

export const ApiGetMe = () =>
  applyDecorators(
    Get('me'),
    UseGuards(JwtAuthGuard),
    ResponseMessage('Lấy thông tin cá nhân thành công'),
    ApiBearerAuth('access-token'),
    ApiOperation({ summary: 'Lấy profile của bản thân' }),
    ApiResponse({ status: 200, description: 'Profile người dùng' }),
    ApiResponse({ status: 401, description: 'Chưa đăng nhập' }),
  );

export const ApiUpdateMe = () =>
  applyDecorators(
    Patch('me'),
    UseGuards(JwtAuthGuard),
    ResponseMessage('Cập nhật thông tin thành công'),
    ApiBearerAuth('access-token'),
    ApiOperation({ summary: 'Cập nhật profile cá nhân' }),
    ApiResponse({ status: 200, description: 'Profile sau khi cập nhật' }),
    ApiResponse({ status: 401, description: 'Chưa đăng nhập' }),
  );

export const ApiBecomeTeacher = () =>
  applyDecorators(
    Post('me/become-teacher'),
    UseGuards(JwtAuthGuard),
    ResponseMessage('Đăng ký trở thành giáo viên thành công'),
    ApiBearerAuth('access-token'),
    ApiOperation({ summary: 'Nâng cấp tài khoản lên vai trò giáo viên' }),
    ApiResponse({ status: 201, description: 'Tài khoản đã được nâng cấp' }),
    ApiResponse({ status: 409, description: 'Đã là giáo viên' }),
  );

export const ApiGetUserProfile = () =>
  applyDecorators(
    Get(':id'),
    ResponseMessage('Lấy thông tin người dùng thành công'),
    ApiOperation({ summary: 'Lấy public profile của người dùng' }),
    ApiResponse({ status: 200, description: 'Public profile' }),
    ApiResponse({ status: 404, description: 'Không tìm thấy người dùng' }),
  );
