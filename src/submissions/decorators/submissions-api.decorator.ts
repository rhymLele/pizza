import { Get, Patch, Post, UseGuards, applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Role } from '../../common/enums/role.enum.js';
import { ResponseMessage } from '../../common/decorators/response-message.decorator.js';

export const ApiSubmit = () =>
  applyDecorators(
    Post(),
    UseGuards(JwtAuthGuard),
    ResponseMessage('Nộp bài thành công'),
    ApiBearerAuth('access-token'),
    ApiOperation({ summary: 'Học sinh nộp bài cho một DayTask' }),
    ApiResponse({ status: 201, description: 'Submission + điểm (nếu auto-grade)' }),
    ApiResponse({ status: 400, description: 'Task không thuộc ngày hiện tại hoặc không cho nộp lại' }),
  );

export const ApiGetSubmission = () =>
  applyDecorators(
    Get(':id'),
    UseGuards(JwtAuthGuard),
    ResponseMessage('Chi tiết bài nộp'),
    ApiBearerAuth('access-token'),
    ApiOperation({ summary: 'Lấy chi tiết bài nộp (học sinh xem bài của mình, giáo viên xem bài bài mình tạo)' }),
    ApiResponse({ status: 200, description: 'Submission detail' }),
    ApiResponse({ status: 403, description: 'Không có quyền' }),
  );

export const ApiGradeSubmission = () =>
  applyDecorators(
    Patch(':id/grade'),
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles(Role.TEACHER),
    ResponseMessage('Chấm bài thành công'),
    ApiBearerAuth('access-token'),
    ApiOperation({ summary: 'Giáo viên chấm tay bài nộp (recording / essay)' }),
    ApiResponse({ status: 200, description: 'Submission sau khi chấm' }),
    ApiResponse({ status: 403, description: 'Không phải giáo viên sở hữu bài tập' }),
  );

export const ApiGetSubmissionsByEnrollment = () =>
  applyDecorators(
    Get('enrollment/:enrollmentId'),
    UseGuards(JwtAuthGuard),
    ResponseMessage('Lịch sử nộp bài'),
    ApiBearerAuth('access-token'),
    ApiOperation({ summary: 'Lấy tất cả bài nộp của một enrollment' }),
    ApiResponse({ status: 200, description: 'Submission list' }),
  );
