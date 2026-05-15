import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity.js';

// Tầng duy nhất được phép trực tiếp query DB liên quan đến User.
// AuthService và JwtStrategy gọi qua đây thay vì inject Repository<User> trực tiếp —
// giúp tách biệt data access khỏi business logic, dễ mock khi viết unit test.
@Injectable()
export class UsersService {
  // @InjectRepository(User): NestJS lấy Repository<User> từ IoC container.
  // Repository này chỉ tồn tại sau khi TypeOrmModule.forFeature([User]) được khai báo trong UsersModule.
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  // Dùng để kiểm tra email đã tồn tại chưa (register) và lấy user để so sánh password (login).
  findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  // Dùng trong JwtStrategy.validate() để xác nhận user vẫn còn tồn tại trong DB
  // sau khi token được giải mã — tránh trường hợp token hợp lệ nhưng user đã bị xóa.
  findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  // create() chỉ tạo instance trong memory, save() mới thực sự INSERT vào DB.
  // Tách ra 2 bước để TypeORM có thể apply các hook (@BeforeInsert nếu có).
  async create(email: string, hashedPassword: string, name?: string): Promise<User> {
    const user = this.usersRepository.create({ email, password: hashedPassword, name });
    return this.usersRepository.save(user);
  }

  // Lưu hash của refresh token sau mỗi lần login/register.
  // Dùng update() thay vì save() để tránh load toàn bộ entity — chỉ cần update 1 field.
  async updateRefreshToken(id: string, hashedToken: string | null): Promise<void> {
    await this.usersRepository.update(id, { refreshToken: hashedToken });
  }
}
