import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { PaginationDto } from '../common/dto/pagination.dto.js';
import { Role } from '../common/enums/role.enum.js';
import type { CreateExerciseDto } from './dto/create-exercise.dto.js';
import { Exercise } from './entities/exercise.entity.js';

@Injectable()
export class ExercisesService {
  constructor(
    @InjectRepository(Exercise)
    private readonly repo: Repository<Exercise>,
  ) {}

  async create(teacherId: string, dto: CreateExerciseDto): Promise<Exercise> {
    const exercise = this.repo.create({ ...dto, teacherId });
    return this.repo.save(exercise);
  }

  // Returns full exercise including answerKey for teachers; strips it for students.
  async findById(exerciseId: string, requesterId: string, requesterRole: Role): Promise<Exercise> {
    const exercise = await this.repo.findOne({
      where: { id: exerciseId },
      relations: ['teacher'],
    });
    if (!exercise) throw new NotFoundException('Không tìm thấy bài tập');

    if (requesterRole !== Role.TEACHER || exercise.teacherId !== requesterId) {
      // Students and other teachers see the exercise without the answer key.
      exercise.answerKey = null;
    }

    return exercise;
  }

  // Bypasses role check — used internally by grader service.
  async findByIdInternal(exerciseId: string): Promise<Exercise> {
    const exercise = await this.repo.findOne({ where: { id: exerciseId } });
    if (!exercise) throw new NotFoundException('Không tìm thấy bài tập');
    return exercise;
  }

  async findByTeacher(teacherId: string, dto: PaginationDto) {
    const { page, limit } = dto;
    const [items, total] = await this.repo.findAndCount({
      where: { teacherId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total, page, limit };
  }

  async update(
    exerciseId: string,
    teacherId: string,
    dto: Partial<CreateExerciseDto>,
  ): Promise<Exercise> {
    const exercise = await this.findByIdInternal(exerciseId);
    if (exercise.teacherId !== teacherId) {
      throw new ForbiddenException('Bạn không có quyền chỉnh sửa bài tập này');
    }
    Object.assign(exercise, dto);
    return this.repo.save(exercise);
  }

  async remove(exerciseId: string, teacherId: string): Promise<void> {
    const exercise = await this.findByIdInternal(exerciseId);
    if (exercise.teacherId !== teacherId) {
      throw new ForbiddenException('Bạn không có quyền xóa bài tập này');
    }
    await this.repo.remove(exercise);
  }
}
