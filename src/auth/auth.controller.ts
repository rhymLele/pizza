import { Body, Controller, Get, HttpCode, HttpStatus, Post, Request, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service.js';
import { LocalAuthGuard } from './guards/local-auth.guard.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { RefreshTokenGuard } from './guards/refresh-token.guard.js';
import { RegisterDto } from './dto/register.dto.js';
import { ResponseMessage } from '../common/decorators/response-message.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { JwtUser } from './interfaces/jwt-user.interface.js';

// Ví dụ response wrapper dùng trong @ApiResponse — giúp Swagger hiển thị đúng shape.
const tokenResponseExample = {
  message: { code: 'SUCCESS', message: 'Thành công' },
  reason: 'Thành công',
  status: true,
  data: {
    accessToken: 'eyJhbGciOiJIUzI1NiJ9...',
    refreshToken: 'eyJhbGciOiJIUzI1NiJ9...',
  },
  count: 1,
};

const userResponseExample = {
  message: { code: 'SUCCESS', message: 'Thành công' },
  reason: 'Thành công',
  status: true,
  data: {
    id: 'uuid-v4',
    email: 'user@example.com',
    name: 'Nguyễn Văn A',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  count: 1,
};

// @ApiTags: nhóm các endpoint trong Swagger UI theo tên 'auth'.
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Đăng ký tài khoản mới' })
  @ApiHeader({
    name: 'Idempotency-Key',
    description: 'UUID để tránh đăng ký trùng lặp khi client retry',
    required: false,
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({ status: 201, description: 'Đăng ký thành công', example: tokenResponseExample })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ (email sai format, password < 8 ký tự)' })
  @ApiResponse({ status: 409, description: 'Email đã tồn tại' })
  @ResponseMessage('Đăng ký thành công')
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @ApiOperation({ summary: 'Đăng nhập' })
  @ApiResponse({ status: 200, description: 'Đăng nhập thành công', example: tokenResponseExample })
  @ApiResponse({ status: 401, description: 'Email hoặc mật khẩu không đúng' })
  @ResponseMessage('Đăng nhập thành công')
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Request() req: Express.Request & { user: any }) {
    return this.authService.login(req.user);
  }

  @ApiOperation({ summary: 'Làm mới access token bằng refresh token' })
  // @ApiBearerAuth('access-token'): yêu cầu điền token vào ô Bearer trong Swagger UI.
  // Tên 'access-token' phải khớp với tên đã khai báo trong DocumentBuilder.addBearerAuth().
  // Ở đây thực tế là refresh token, nhưng cơ chế Bearer header là giống nhau.
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 200, description: 'Cặp token mới', example: tokenResponseExample })
  @ApiResponse({ status: 401, description: 'Refresh token không hợp lệ hoặc đã hết hạn' })
  @ResponseMessage('Làm mới token thành công')
  @UseGuards(RefreshTokenGuard)
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  refresh(@Request() req: Express.Request & { user: any }) {
    return this.authService.refreshTokens(req.user.sub, req.user.refreshToken);
  }

  @ApiOperation({ summary: 'Đăng xuất — vô hiệu hoá refresh token' })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 200, description: 'Đăng xuất thành công' })
  @ApiResponse({ status: 401, description: 'Chưa đăng nhập hoặc token hết hạn' })
  @ResponseMessage('Đăng xuất thành công')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  logout(@CurrentUser() user: JwtUser) {
    return this.authService.logout(user.id);
  }

  @ApiOperation({ summary: 'Lấy thông tin người dùng hiện tại' })
  @ApiBearerAuth('access-token')
  @ApiResponse({ status: 200, description: 'Thông tin user', example: userResponseExample })
  @ApiResponse({ status: 401, description: 'Chưa đăng nhập hoặc token hết hạn' })
  @ResponseMessage('Lấy thông tin người dùng thành công')
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUser() user: JwtUser) {
    return user;
  }
}
