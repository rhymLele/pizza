import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { JwtStrategy } from './strategies/jwt.strategy.js';
import { LocalStrategy } from './strategies/local.strategy.js';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy.js';

@Module({
  imports: [
    UsersModule,
    PassportModule,

    // registerAsync thay vì register để đọc secret từ ConfigService —
    // tránh hardcode process.env.JWT_SECRET và đảm bảo giá trị đã được validate.
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        // as any: expiresIn yêu cầu branded type StringValue từ thư viện ms,
        // không nhận string thông thường dù giá trị runtime hoàn toàn hợp lệ.
        signOptions: { expiresIn: config.get('JWT_EXPIRES_IN', '1d') as any },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy, RefreshTokenStrategy],
  exports: [AuthService],
})
export class AuthModule {}
