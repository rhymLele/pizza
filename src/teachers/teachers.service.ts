import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { UpdateTeacherProfileDto } from './dto/update-teacher-profile.dto.js';
import type { QueryTeachersDto } from './dto/query-teachers.dto.js';
import { TeacherProfile } from './entities/teacher-profile.entity.js';

@Injectable()
export class TeachersService {
  constructor(
    @InjectRepository(TeacherProfile)
    private readonly repo: Repository<TeacherProfile>,
  ) {}

  // Auto-called when a user becomes a teacher (UsersService.becomeTeacher triggers this).
  async createProfile(userId: string): Promise<TeacherProfile> {
    const existing = await this.repo.findOne({ where: { userId } });
    if (existing) return existing;
    const profile = this.repo.create({ userId });
    return this.repo.save(profile);
  }

  async findAll(dto: QueryTeachersDto) {
    const { page, limit, subject, teachingMode } = dto;
    const qb = this.repo
      .createQueryBuilder('tp')
      .innerJoinAndSelect('tp.user', 'u')
      .where('u.role = :role', { role: 'teacher' })
      .orderBy('tp.rating', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (subject) {
      // simple-array stores as comma-separated; LIKE search covers partial matches.
      qb.andWhere('tp.subjects LIKE :subject', { subject: `%${subject}%` });
    }
    if (teachingMode) {
      qb.andWhere('tp.teachingMode = :teachingMode', { teachingMode });
    }

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit };
  }

  async findByUserId(userId: string): Promise<TeacherProfile> {
    const profile = await this.repo.findOne({
      where: { userId },
      relations: ['user'],
    });
    if (!profile) throw new NotFoundException('Không tìm thấy giáo viên');
    return profile;
  }

  async updateProfile(userId: string, dto: UpdateTeacherProfileDto): Promise<TeacherProfile> {
    const profile = await this.findByUserId(userId);
    Object.assign(profile, dto);
    return this.repo.save(profile);
  }
}
