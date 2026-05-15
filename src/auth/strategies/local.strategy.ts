import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service.js';

// LocalStrategy xử lý xác thực bằng email + password (POST /auth/login).
// Passport tách logic xác thực ra khỏi controller — controller không cần biết
// "xác thực bằng email/password nghĩa là làm gì".
// Strategy này được LocalAuthGuard kích hoạt tự động.
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    // usernameField: 'email' — mặc định passport-local dùng field 'username'.
    // Override sang 'email' để khớp với DTO và DB của project này.
    super({ usernameField: 'email' });
  }

  // validate() được Passport gọi tự động sau khi extract email/password từ request body.
  // Trả về user → Passport gán vào req.user để controller dùng tiếp.
  // Throw exception → Passport trả 401, controller không chạy.
  async validate(email: string, password: string) {
    const user = await this.authService.validateUser(email, password);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    return user;
  }
}
