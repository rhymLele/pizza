import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../common/enums/role.enum.js';
import type { UpdateProfileDto } from './dto/update-profile.dto.js';
import { User } from './entities/user.entity.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  findByEmail(email: string): Promise<User | null> {
    return this.repo.findOne({ where: { email } });
  }

  findById(id: string): Promise<User | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findPublicProfile(id: string): Promise<Omit<User, 'password' | 'refreshToken'>> {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Không tìm thấy người dùng');
    const { password: _, refreshToken: __, ...profile } = user;
    return profile;
  }

  async create(email: string, hashedPassword: string, name?: string): Promise<User> {
    const user = this.repo.create({ email, password: hashedPassword, name });
    return this.repo.save(user);
  }

  async updateRefreshToken(id: string, hashedToken: string | null): Promise<void> {
    await this.repo.update(id, { refreshToken: hashedToken });
  }

  async updateProfile(id: string, dto: UpdateProfileDto): Promise<Omit<User, 'password' | 'refreshToken'>> {
    await this.repo.update(id, dto);
    return this.findPublicProfile(id);
  }

  // Upgrades a student to teacher role. Throws if already a teacher.
  async becomeTeacher(id: string): Promise<Omit<User, 'password' | 'refreshToken'>> {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Không tìm thấy người dùng');
    if (user.role === Role.TEACHER) throw new ConflictException('Tài khoản đã là giáo viên');
    await this.repo.update(id, { role: Role.TEACHER });
    return this.findPublicProfile(id);
  }
}
