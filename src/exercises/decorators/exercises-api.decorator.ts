import { Delete, Get, HttpCode, HttpStatus, Patch, Post, UseGuards, applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Role } from '../../common/enums/role.enum.js';
import { ResponseMessage } from '../../common/decorators/response-message.decorator.js';

export const ApiCreateExercise = () =>
  applyDecorators(
    Post(),
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles(Role.TEACHER),
    ResponseMessage('Tạo bài tập thành công'),
    ApiBearerAuth('access-token'),
    ApiOperation({ summary: 'Giáo viên tạo bài tập mới' }),
    ApiResponse({ status: 201, description: 'Bài tập đã tạo' }),
    ApiResponse({ status: 403, description: 'Không phải giáo viên' }),
  );

export const ApiGetExercise = () =>
  applyDecorators(
    Get(':id'),
    UseGuards(JwtAuthGuard),
    ResponseMessage('Chi tiết bài tập'),
    ApiBearerAuth('access-token'),
    ApiOperation({ summary: 'Lấy chi tiết bài tập (answerKey ẩn với học sinh)' }),
    ApiResponse({ status: 200, description: 'Exercise detail' }),
    ApiResponse({ status: 404, description: 'Không tìm thấy' }),
  );

export const ApiGetExercisesByTeacher = () =>
  applyDecorators(
    Get('teacher/:teacherId'),
    UseGuards(JwtAuthGuard),
    ResponseMessage('Danh sách bài tập'),
    ApiBearerAuth('access-token'),
    ApiOperation({ summary: 'Lấy danh sách bài tập của giáo viên' }),
    ApiResponse({ status: 200, description: 'Exercise list' }),
  );

export const ApiUpdateExercise = () =>
  applyDecorators(
    Patch(':id'),
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles(Role.TEACHER),
    ResponseMessage('Cập nhật bài tập thành công'),
    ApiBearerAuth('access-token'),
    ApiOperation({ summary: 'Giáo viên cập nhật bài tập' }),
    ApiResponse({ status: 200, description: 'Bài tập sau cập nhật' }),
  );

export const ApiDeleteExercise = () =>
  applyDecorators(
    Delete(':id'),
    HttpCode(HttpStatus.OK),
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles(Role.TEACHER),
    ResponseMessage('Xóa bài tập thành công'),
    ApiBearerAuth('access-token'),
    ApiOperation({ summary: 'Giáo viên xóa bài tập' }),
    ApiResponse({ status: 200, description: 'Đã xóa' }),
  );
