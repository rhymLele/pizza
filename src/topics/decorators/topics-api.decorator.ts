import {
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  UseGuards,
  applyDecorators,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Role } from '../../common/enums/role.enum.js';
import { ResponseMessage } from '../../common/decorators/response-message.decorator.js';

export const ApiCreateTopic = () =>
  applyDecorators(
    Post(),
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles(Role.TEACHER),
    ResponseMessage('Tạo topic thành công'),
    ApiBearerAuth('access-token'),
    ApiOperation({ summary: 'Giáo viên tạo topic mới (lesson / exercise / journey)' }),
    ApiResponse({ status: 201, description: 'Topic đã tạo' }),
    ApiResponse({ status: 403, description: 'Không phải giáo viên' }),
  );

export const ApiGetTopicsByTeacher = () =>
  applyDecorators(
    Get('teacher/:teacherId'),
    ResponseMessage('Danh sách topic của giáo viên'),
    ApiOperation({ summary: 'Lấy danh sách topic công khai của một giáo viên' }),
    ApiResponse({ status: 200, description: 'Danh sách topic' }),
  );

export const ApiGetTopic = () =>
  applyDecorators(
    Get(':id'),
    ResponseMessage('Chi tiết topic'),
    ApiOperation({ summary: 'Lấy chi tiết một topic' }),
    ApiResponse({ status: 200, description: 'Topic detail' }),
    ApiResponse({ status: 404, description: 'Không tìm thấy topic' }),
  );

export const ApiUpdateTopic = () =>
  applyDecorators(
    Patch(':id'),
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles(Role.TEACHER),
    ResponseMessage('Cập nhật topic thành công'),
    ApiBearerAuth('access-token'),
    ApiOperation({ summary: 'Giáo viên cập nhật topic của mình' }),
    ApiResponse({ status: 200, description: 'Topic sau cập nhật' }),
    ApiResponse({ status: 403, description: 'Không có quyền' }),
  );

export const ApiDeleteTopic = () =>
  applyDecorators(
    Delete(':id'),
    HttpCode(HttpStatus.OK),
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles(Role.TEACHER),
    ResponseMessage('Xóa topic thành công'),
    ApiBearerAuth('access-token'),
    ApiOperation({ summary: 'Giáo viên xóa topic của mình' }),
    ApiResponse({ status: 200, description: 'Đã xóa' }),
    ApiResponse({ status: 403, description: 'Không có quyền' }),
  );

export const ApiToggleLike = () =>
  applyDecorators(
    Post(':id/like'),
    HttpCode(HttpStatus.OK),
    UseGuards(JwtAuthGuard),
    ResponseMessage('Cập nhật trạng thái like'),
    ApiBearerAuth('access-token'),
    ApiOperation({ summary: 'Like / unlike topic (toggle)' }),
    ApiResponse({ status: 200, description: '{ liked: boolean }' }),
  );

export const ApiGetComments = () =>
  applyDecorators(
    Get(':id/comments'),
    ResponseMessage('Danh sách bình luận'),
    ApiOperation({ summary: 'Lấy danh sách bình luận của topic' }),
    ApiResponse({ status: 200, description: 'Comment list' }),
  );

export const ApiAddComment = () =>
  applyDecorators(
    Post(':id/comments'),
    UseGuards(JwtAuthGuard),
    ResponseMessage('Bình luận thành công'),
    ApiBearerAuth('access-token'),
    ApiOperation({ summary: 'Thêm bình luận hoặc reply vào topic' }),
    ApiResponse({ status: 201, description: 'Comment đã tạo' }),
  );
