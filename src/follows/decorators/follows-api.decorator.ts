import { Delete, Get, HttpCode, HttpStatus, Post, UseGuards, applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { ResponseMessage } from '../../common/decorators/response-message.decorator.js';

export const ApiFollow = () =>
  applyDecorators(
    Post(':teacherId'),
    UseGuards(JwtAuthGuard),
    ResponseMessage('Follow giáo viên thành công'),
    ApiBearerAuth('access-token'),
    ApiOperation({ summary: 'Follow một giáo viên' }),
    ApiResponse({ status: 201, description: 'Follow thành công' }),
    ApiResponse({ status: 409, description: 'Đã follow' }),
    ApiResponse({ status: 404, description: 'Không tìm thấy giáo viên' }),
  );

export const ApiUnfollow = () =>
  applyDecorators(
    Delete(':teacherId'),
    HttpCode(HttpStatus.OK),
    UseGuards(JwtAuthGuard),
    ResponseMessage('Unfollow giáo viên thành công'),
    ApiBearerAuth('access-token'),
    ApiOperation({ summary: 'Unfollow một giáo viên' }),
    ApiResponse({ status: 200, description: 'Unfollow thành công' }),
    ApiResponse({ status: 404, description: 'Chưa follow' }),
  );

export const ApiGetFollowers = () =>
  applyDecorators(
    Get(':teacherId/followers'),
    ResponseMessage('Danh sách người follow'),
    ApiOperation({ summary: 'Lấy danh sách học sinh follow giáo viên' }),
    ApiResponse({ status: 200, description: 'Danh sách followers' }),
  );

export const ApiGetFollowing = () =>
  applyDecorators(
    Get('following'),
    UseGuards(JwtAuthGuard),
    ResponseMessage('Danh sách giáo viên đang follow'),
    ApiBearerAuth('access-token'),
    ApiOperation({ summary: 'Lấy danh sách giáo viên mà tôi đang follow' }),
    ApiResponse({ status: 200, description: 'Danh sách following' }),
  );
