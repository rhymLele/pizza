import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity.js';
import { UsersService } from './users.service.js';

@Module({
  // forFeature([User]) tạo Repository<User> và đăng ký vào IoC container của module này.
  // Nếu thiếu dòng này, @InjectRepository(User) trong UsersService sẽ báo lỗi runtime.
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService],
  // exports: cho phép AuthModule dùng UsersService sau khi import UsersModule.
  // Không export thì AuthService và JwtStrategy không inject được UsersService.
  exports: [UsersService],
})
export class UsersModule {}
