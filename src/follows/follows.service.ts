import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../common/enums/role.enum.js';
import { User } from '../users/entities/user.entity.js';
import type { PaginationDto } from '../common/dto/pagination.dto.js';
import { Follow } from './entities/follow.entity.js';

@Injectable()
export class FollowsService {
  constructor(
    @InjectRepository(Follow)
    private readonly followRepo: Repository<Follow>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async follow(followerId: string, teacherId: string): Promise<void> {
    if (followerId === teacherId) {
      throw new BadRequestException('Không thể tự follow bản thân');
    }

    const teacher = await this.userRepo.findOne({ where: { id: teacherId } });
    if (!teacher || teacher.role !== Role.TEACHER) {
      throw new NotFoundException('Không tìm thấy giáo viên');
    }

    const existing = await this.followRepo.findOne({ where: { followerId, teacherId } });
    if (existing) throw new ConflictException('Đã follow giáo viên này');

    await this.followRepo.save(this.followRepo.create({ followerId, teacherId }));
  }

  async unfollow(followerId: string, teacherId: string): Promise<void> {
    const follow = await this.followRepo.findOne({ where: { followerId, teacherId } });
    if (!follow) throw new NotFoundException('Chưa follow giáo viên này');
    await this.followRepo.remove(follow);
  }

  isFollowing(followerId: string, teacherId: string): Promise<boolean> {
    return this.followRepo.exists({ where: { followerId, teacherId } });
  }

  // Returns paginated list of students who follow a given teacher.
  async getFollowers(teacherId: string, dto: PaginationDto) {
    const { page, limit } = dto;
    const [items, total] = await this.followRepo.findAndCount({
      where: { teacherId },
      relations: ['follower'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items: items.map((f) => f.follower), total, page, limit };
  }

  // Returns paginated list of teachers the given user follows.
  async getFollowing(followerId: string, dto: PaginationDto) {
    const { page, limit } = dto;
    const [items, total] = await this.followRepo.findAndCount({
      where: { followerId },
      relations: ['teacher'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items: items.map((f) => f.teacher), total, page, limit };
  }

  // Returns IDs of all teachers a user follows (used by FeedService for feed query).
  async getFollowingIds(followerId: string): Promise<string[]> {
    const rows = await this.followRepo.find({
      where: { followerId },
      select: ['teacherId'],
    });
    return rows.map((r) => r.teacherId);
  }
}
