import { Get, Post, UseGuards, applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Role } from '../../common/enums/role.enum.js';
import { ResponseMessage } from '../../common/decorators/response-message.decorator.js';

export const ApiCreateJourney = () =>
  applyDecorators(
    Post(),
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles(Role.TEACHER),
    ResponseMessage('Tạo hành trình thành công'),
    ApiBearerAuth('access-token'),
    ApiOperation({ summary: 'Giáo viên tạo hành trình học mới' }),
    ApiResponse({ status: 201, description: 'Journey đã tạo' }),
  );

export const ApiGetJourneys = () =>
  applyDecorators(
    Get(),
    ResponseMessage('Danh sách hành trình'),
    ApiOperation({ summary: 'Lấy danh sách tất cả hành trình' }),
    ApiResponse({ status: 200, description: 'Journey list' }),
  );

export const ApiGetJourney = () =>
  applyDecorators(
    Get(':id'),
    ResponseMessage('Chi tiết hành trình'),
    ApiOperation({ summary: 'Lấy chi tiết hành trình kèm days và tasks' }),
    ApiResponse({ status: 200, description: 'Journey detail' }),
    ApiResponse({ status: 404, description: 'Không tìm thấy' }),
  );

export const ApiAddJourneyDay = () =>
  applyDecorators(
    Post(':id/days'),
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles(Role.TEACHER),
    ResponseMessage('Thêm ngày học thành công'),
    ApiBearerAuth('access-token'),
    ApiOperation({ summary: 'Giáo viên thêm ngày học vào hành trình' }),
    ApiResponse({ status: 201, description: 'JourneyDay đã tạo' }),
  );

export const ApiAddDayTask = () =>
  applyDecorators(
    Post('days/:dayId/tasks'),
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles(Role.TEACHER),
    ResponseMessage('Thêm bài tập vào ngày học thành công'),
    ApiBearerAuth('access-token'),
    ApiOperation({ summary: 'Giáo viên thêm Exercise vào một ngày học' }),
    ApiResponse({ status: 201, description: 'DayTask đã tạo' }),
  );

export const ApiEnrollJourney = () =>
  applyDecorators(
    Post(':id/enroll'),
    UseGuards(JwtAuthGuard),
    ResponseMessage('Đăng ký hành trình thành công'),
    ApiBearerAuth('access-token'),
    ApiOperation({ summary: 'Học sinh đăng ký tham gia hành trình' }),
    ApiResponse({ status: 201, description: 'Enrollment đã tạo' }),
    ApiResponse({ status: 409, description: 'Đã đăng ký' }),
  );
