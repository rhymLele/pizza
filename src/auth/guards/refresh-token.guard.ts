import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Kích hoạt RefreshTokenStrategy ('jwt-refresh').
// Dùng cho endpoint POST /auth/refresh — client gửi refreshToken trong Authorization header.
@Injectable()
export class RefreshTokenGuard extends AuthGuard('jwt-refresh') {}
