import {
  ConflictException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import type { PaginationDto } from '../common/dto/pagination.dto.js';
import { Journey } from '../journeys/entities/journey.entity.js';
import { JourneyDay } from '../journeys/entities/journey-day.entity.js';
import { DayTask } from '../journeys/entities/day-task.entity.js';
import { Enrollment } from './entities/enrollment.entity.js';
import { DailyProgress } from './entities/daily-progress.entity.js';

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectRepository(Enrollment)
    private readonly enrollmentRepo: Repository<Enrollment>,
    @InjectRepository(DailyProgress)
    private readonly progressRepo: Repository<DailyProgress>,
    @InjectRepository(Journey)
    private readonly journeyRepo: Repository<Journey>,
    @InjectRepository(JourneyDay)
    private readonly dayRepo: Repository<JourneyDay>,
    @InjectRepository(DayTask)
    private readonly taskRepo: Repository<DayTask>,
  ) {}

  async enroll(userId: string, journeyId: string): Promise<Enrollment> {
    const journey = await this.journeyRepo.findOne({ where: { id: journeyId } });
    if (!journey) throw new NotFoundException('Không tìm thấy hành trình');

    const existing = await this.enrollmentRepo.findOne({ where: { userId, journeyId } });
    if (existing) throw new ConflictException('Bạn đã đăng ký hành trình này');

    return this.enrollmentRepo.save(
      this.enrollmentRepo.create({
        userId,
        journeyId,
        freezeTokensLeft: journey.freezeTokens,
      }),
    );
  }

  async getMyEnrollments(userId: string, dto: PaginationDto) {
    const { page, limit } = dto;
    const [items, total] = await this.enrollmentRepo.findAndCount({
      where: { userId },
      relations: ['journey'],
      order: { startedAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total, page, limit };
  }

  async getTodayTasks(enrollmentId: string, userId: string) {
    const enrollment = await this.enrollmentRepo.findOne({
      where: { id: enrollmentId },
      relations: ['journey'],
    });
    if (!enrollment) throw new NotFoundException('Không tìm thấy enrollment');
    if (enrollment.userId !== userId) throw new ForbiddenException();

    const day = await this.dayRepo.findOne({
      where: { journeyId: enrollment.journeyId, dayNumber: enrollment.currentDay },
      relations: ['tasks', 'tasks.exercise'],
    });
    if (!day) return { day: null, tasks: [], progress: null };

    const progress = await this.progressRepo.findOne({
      where: { enrollmentId, dayId: day.id },
    });

    return { day, tasks: day.tasks, progress };
  }

  // Called by SubmissionsService after each passing submission.
  // Checks if all required tasks for the current day are passed; if so, advances enrollment.
  async checkAndAdvance(
    enrollmentId: string,
    submissionRepo: { count: (opts: any) => Promise<number> },
  ): Promise<void> {
    const enrollment = await this.enrollmentRepo.findOne({
      where: { id: enrollmentId },
      relations: ['journey'],
    });
    if (!enrollment || enrollment.completedAt) return;

    const day = await this.dayRepo.findOne({
      where: { journeyId: enrollment.journeyId, dayNumber: enrollment.currentDay },
      relations: ['tasks'],
    });
    if (!day) return;

    const requiredTaskIds = day.tasks.filter((t) => t.required).map((t) => t.id);
    if (requiredTaskIds.length === 0) return;

    const passedCount = await submissionRepo.count({
      where: {
        enrollmentId,
        dayTaskId: In(requiredTaskIds),
        score: { $gte: enrollment.journey.passingScore } as any,
      },
    });

    if (passedCount < requiredTaskIds.length) return;

    // All required tasks passed — mark day complete, advance streak, move to next day.
    await this.progressRepo.upsert(
      { enrollmentId, dayId: day.id, completedAt: new Date(), tasksCompleted: requiredTaskIds.length },
      ['enrollmentId', 'dayId'],
    );

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86_400_000).toISOString().split('T')[0];
    const newStreak =
      enrollment.lastCompletedDate === yesterday ? enrollment.streak + 1 : 1;

    const nextDay = enrollment.currentDay + 1;
    const isFinished = nextDay > enrollment.journey.totalDays;

    await this.enrollmentRepo.update(enrollmentId, {
      currentDay: isFinished ? enrollment.currentDay : nextDay,
      streak: newStreak,
      lastCompletedDate: today,
      completedAt: isFinished ? new Date() : undefined,
    });
  }

  async useFreeze(enrollmentId: string, userId: string): Promise<Enrollment> {
    const enrollment = await this.enrollmentRepo.findOne({ where: { id: enrollmentId } });
    if (!enrollment) throw new NotFoundException('Không tìm thấy enrollment');
    if (enrollment.userId !== userId) throw new ForbiddenException();
    if (enrollment.freezeTokensLeft <= 0) {
      throw new ConflictException('Bạn đã dùng hết freeze token');
    }
    await this.enrollmentRepo.update(enrollmentId, {
      freezeTokensLeft: enrollment.freezeTokensLeft - 1,
      // Preserve current streak by marking today as completed (skip penalty).
      lastCompletedDate: new Date().toISOString().split('T')[0],
    });
    return this.enrollmentRepo.findOne({ where: { id: enrollmentId } }) as Promise<Enrollment>;
  }
}
