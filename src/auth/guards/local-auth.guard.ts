import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Guard kích hoạt LocalStrategy khi request vào POST /auth/login.
// AuthGuard('local') là cầu nối giữa decorator @UseGuards và LocalStrategy —
// 'local' phải khớp với tên strategy được đăng ký trong PassportStrategy(Strategy).
// Guard chạy trước controller: nếu LocalStrategy.validate() throw thì controller không bao giờ chạy.
// Kết quả trả về từ validate() được Passport gán vào req.user để controller dùng.
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}
