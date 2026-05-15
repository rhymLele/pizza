import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { JwtPayload } from './interfaces/jwt-payload.interface.js';
import { User } from '../users/entities/user.entity.js';

// Tầng business logic của auth — controller và strategy không xử lý logic, chỉ gọi service này.
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  // Được gọi bởi LocalStrategy.validate() — kiểm tra email/password có đúng không.
  // Trả null thay vì throw để strategy tự quyết định xử lý lỗi (tách trách nhiệm).
  async validateUser(email: string, password: string): Promise<Omit<User, 'password' | 'refreshToken'> | null> {
    const user = await this.usersService.findByEmail(email);
    if (!user) return null;

    const match = await bcrypt.compare(password, user.password);
    if (!match) return null;

    const { password: _, refreshToken: __, ...result } = user;
    return result;
  }

  // Xử lý đăng ký: kiểm tra trùng email → hash password → lưu DB → trả cả 2 token.
  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email already in use');

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create(dto.email, hashed, dto.name);
    return this.issueTokens(user);
  }

  // Được gọi từ controller sau khi LocalStrategy xác thực xong.
  async login(user: Omit<User, 'password' | 'refreshToken'>) {
    return this.issueTokens(user as User);
  }

  // Được gọi từ RefreshTokenStrategy sau khi verify refresh token.
  // Xác minh refresh token gửi lên có khớp với hash đã lưu trong DB không.
  // Cơ chế này cho phép logout từ xa: xoá hash trong DB → token cũ không còn hợp lệ.
  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.usersService.findById(userId);

    // Kiểm tra user tồn tại và đang có refresh token hợp lệ (chưa logout).
    if (!user?.refreshToken) throw new UnauthorizedException('Access denied');

    const tokenMatch = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!tokenMatch) throw new UnauthorizedException('Access denied');

    return this.issueTokens(user);
  }

  // Xoá refresh token khỏi DB — token cũ không dùng được nữa dù chưa hết hạn.
  async logout(userId: string): Promise<void> {
    await this.usersService.updateRefreshToken(userId, null);
  }

  // Sinh cả 2 token và lưu hash refresh token vào DB.
  // private: không để controller ký token tùy tiện bên ngoài flow chuẩn.
  private async issueTokens(user: Pick<User, 'id' | 'email'>) {
    const payload: JwtPayload = { sub: user.id, email: user.email };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      // Refresh token dùng secret riêng — nếu access secret bị lộ thì refresh token vẫn an toàn.
      this.jwtService.signAsync(payload, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN', '7d') as any,
      }),
    ]);

    // Lưu hash refresh token — không lưu plain text để DB bị lộ cũng không dùng được.
    const hashed = await bcrypt.hash(refreshToken, 10);
    await this.usersService.updateRefreshToken(user.id, hashed);

    return { accessToken, refreshToken };
  }
}
