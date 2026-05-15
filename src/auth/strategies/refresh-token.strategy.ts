import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../interfaces/jwt-payload.interface.js';

// Strategy riêng cho refresh token — dùng secret khác với access token.
// Tách strategy thay vì dùng JwtStrategy vì secret khác nhau và
// cần extract raw refresh token từ body để AuthService verify với hash trong DB.
@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(config: ConfigService) {
    super({
      // Extract từ Authorization header (Bearer <refreshToken>).
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      // passReqToCallback: true — cho phép validate() nhận request để lấy raw token.
      // Cần raw token để bcrypt.compare() với hash trong DB.
      passReqToCallback: true,
    });
  }

  // validate() nhận request và payload đã được verify.
  // Gắn refreshToken vào req.user để RefreshTokenGuard truyền cho AuthService.
  validate(req: Request, payload: JwtPayload) {
    // Extract raw token từ header để AuthService so sánh với hash trong DB.
    const refreshToken = req.get('Authorization')!.replace('Bearer', '').trim();
    return { ...payload, refreshToken };
  }
}
