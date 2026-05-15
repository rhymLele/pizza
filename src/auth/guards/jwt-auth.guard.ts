import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Guard bảo vệ các route cần đăng nhập — dùng @UseGuards(JwtAuthGuard) trên controller/method.
// AuthGuard('jwt') kích hoạt JwtStrategy: tự động extract Bearer token từ header,
// verify signature, giải mã payload, rồi gọi JwtStrategy.validate().
// Nếu token không hợp lệ/hết hạn/thiếu → tự động trả 401 Unauthorized.
// Kết quả từ JwtStrategy.validate() (user không có password) được gán vào req.user.
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
