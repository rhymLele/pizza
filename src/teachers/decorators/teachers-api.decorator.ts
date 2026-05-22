import { Get, Patch, UseGuards, applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Role } from '../../common/enums/role.enum.js';
import { ResponseMessage } from '../../common/decorators/response-message.decorator.js';

export const ApiGetTeachers = () =>
  applyDecorators(
    Get(),
    ResponseMessage('Danh sách giáo viên'),
    ApiOperation({ summary: 'Lấy danh sách giáo viên (có thể filter theo môn, mode)' }),
    ApiResponse({ status: 200, description: 'Danh sách giáo viên' }),
  );

export const ApiGetTeacher = () =>
  applyDecorators(
    Get(':userId'),
    ResponseMessage('Thông tin giáo viên'),
    ApiOperation({ summary: 'Lấy public profile của giáo viên' }),
    ApiResponse({ status: 200, description: 'Profile giáo viên + user info' }),
    ApiResponse({ status: 404, description: 'Không tìm thấy giáo viên' }),
  );

export const ApiUpdateTeacherProfile = () =>
  applyDecorators(
    Patch('me'),
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles(Role.TEACHER),
    ResponseMessage('Cập nhật profile giáo viên thành công'),
    ApiBearerAuth('access-token'),
    ApiOperation({ summary: 'Giáo viên cập nhật profile của mình (subject, teachingMode)' }),
    ApiResponse({ status: 200, description: 'Profile sau khi cập nhật' }),
    ApiResponse({ status: 403, description: 'Không phải giáo viên' }),
  );
