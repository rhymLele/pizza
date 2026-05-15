import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service.js';
import { JwtPayload } from '../interfaces/jwt-payload.interface.js';

// JwtStrategy xác thực Bearer token cho mọi route có @UseGuards(JwtAuthGuard).
// Passport-jwt tự động: extract token từ header → verify signature → giải mã payload →
// gọi validate() với payload đã giải mã.
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly usersService: UsersService,
    // ConfigService thay vì process.env trực tiếp — đảm bảo giá trị đã được validate
    // bởi envValidationSchema khi app boot, không thể undefined lúc runtime.
    config: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // ignoreExpiration: false — token hết hạn sẽ bị từ chối tự động, không cần check thủ công.
      ignoreExpiration: false,
      // secretOrKey phải giống với secret dùng lúc ký token trong AuthModule/JwtModule.registerAsync().
      // Dùng getOrThrow để TypeScript biết giá trị chắc chắn là string, không phải string | undefined.
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  // validate() chỉ được gọi sau khi signature đã được verify thành công.
  // payload là nội dung đã giải mã — chứa sub (user id) và email.
  // Query lại DB để đảm bảo user vẫn còn tồn tại (tránh token hợp lệ của user đã bị xóa).
  // Kết quả trả về (không có password) được gán vào req.user.
  async validate(payload: JwtPayload) {
    const user = await this.usersService.findById(payload.sub);
    if (!user) throw new UnauthorizedException();
    // Strip password trước khi gán vào req.user — tránh password lọt vào response.
    const { password: _, ...result } = user;
    return result;
  }
}
