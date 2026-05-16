import { Body, Controller, Request } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { JwtUser } from './interfaces/jwt-user.interface.js';
import {
  ApiGetMe,
  ApiLogin,
  ApiLogout,
  ApiRefreshToken,
  ApiRegister,
} from './decorators/auth-api.decorator.js';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiRegister()
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @ApiLogin()
  login(@Request() req: Express.Request & { user: any }) {
    return this.authService.login(req.user);
  }

  @ApiRefreshToken()
  refresh(@Request() req: Express.Request & { user: any }) {
    return this.authService.refreshTokens(req.user.sub, req.user.refreshToken);
  }

  @ApiLogout()
  logout(@CurrentUser() user: JwtUser) {
    return this.authService.logout(user.id);
  }

  @ApiGetMe()
  me(@CurrentUser() user: JwtUser) {
    return user;
  }
}
