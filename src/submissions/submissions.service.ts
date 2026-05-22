import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { GradedBy } from '../common/enums/graded-by.enum.js';
import { Role } from '../common/enums/role.enum.js';
import { EnrollmentsService } from '../enrollments/enrollments.service.js';
import { ExercisesService } from '../exercises/exercises.service.js';
import { ExerciseGraderService } from '../exercises/services/exercise-grader.service.js';
import { DayTask } from '../journeys/entities/day-task.entity.js';
import type { CreateSubmissionDto } from './dto/create-submission.dto.js';
import type { GradeSubmissionDto } from './dto/grade-submission.dto.js';
import { Submission } from './entities/submission.entity.js';
import { Enrollment } from '../enrollments/entities/enrollment.entity.js';

@Injectable()
export class SubmissionsService {
  constructor(
    @InjectRepository(Submission)
    private readonly repo: Repository<Submission>,
    @InjectRepository(DayTask)
    private readonly dayTaskRepo: Repository<DayTask>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepo: Repository<Enrollment>,
    private readonly exercisesService: ExercisesService,
    private readonly graderService: ExerciseGraderService,
    private readonly enrollmentsService: EnrollmentsService,
  ) {}

  async submit(userId: string, dto: CreateSubmissionDto): Promise<Submission> {
    const { enrollmentId, dayTaskId, answer } = dto;

    // Validate the enrollment belongs to the student.
    const enrollment = await this.enrollmentRepo.findOne({
      where: { id: enrollmentId },
      relations: ['journey'],
    });
    if (!enrollment) throw new NotFoundException('Không tìm thấy enrollment');
    if (enrollment.userId !== userId) throw new ForbiddenException();

    // Validate the dayTask belongs to the current day of the enrollment.
    const dayTask = await this.dayTaskRepo.findOne({
      where: { id: dayTaskId },
      relations: ['day'],
    });
    if (!dayTask) throw new NotFoundException('Không tìm thấy task');
    if (dayTask.day.journeyId !== enrollment.journeyId) {
      throw new BadRequestException('Task không thuộc hành trình này');
    }
    if (dayTask.day.dayNumber !== enrollment.currentDay) {
      throw new BadRequestException('Task không thuộc ngày học hiện tại');
    }

    // Check if already submitted and resubmit is not allowed.
    const existing = await this.repo.findOne({ where: { enrollmentId, dayTaskId } });
    if (existing && !enrollment.journey.allowResubmit) {
      throw new BadRequestException('Không được phép nộp lại bài này');
    }

    const exercise = await this.exercisesService.findByIdInternal(dayTask.exerciseId);
    const { score, feedback, gradedBy } = this.graderService.grade(exercise, answer);

    const submission = await this.repo.save(
      this.repo.create({
        userId,
        exerciseId: dayTask.exerciseId,
        enrollmentId,
        dayTaskId,
        answer,
        score,
        feedback,
        gradedBy,
        gradedAt: gradedBy ? new Date() : null,
      }),
    );

    // Attempt to advance the enrollment if this was a passing auto-graded submission.
    if (score !== null && score >= Number(enrollment.journey.passingScore)) {
      await this.enrollmentsService.checkAndAdvance(enrollmentId, {
        count: (opts: any) =>
          this.repo.count({
            ...opts,
            where: {
              ...opts.where,
              score: MoreThanOrEqual(enrollment.journey.passingScore),
            },
          }),
      });
    }

    return submission;
  }

  async findById(submissionId: string, requesterId: string, requesterRole: Role): Promise<Submission> {
    const submission = await this.repo.findOne({
      where: { id: submissionId },
      relations: ['exercise', 'user'],
    });
    if (!submission) throw new NotFoundException('Không tìm thấy submission');

    const isOwner = submission.userId === requesterId;
    const isTeacher = requesterRole === Role.TEACHER && submission.exercise.teacherId === requesterId;
    if (!isOwner && !isTeacher) throw new ForbiddenException();

    return submission;
  }

  async grade(submissionId: string, teacherId: string, dto: GradeSubmissionDto): Promise<Submission> {
    const submission = await this.repo.findOne({
      where: { id: submissionId },
      relations: ['exercise', 'enrollment', 'enrollment.journey'],
    });
    if (!submission) throw new NotFoundException('Không tìm thấy submission');
    if (submission.exercise.teacherId !== teacherId) {
      throw new ForbiddenException('Chỉ giáo viên sở hữu bài tập mới có thể chấm');
    }

    await this.repo.update(submissionId, {
      score: dto.score,
      feedback: dto.feedback ?? null,
      gradedBy: GradedBy.TEACHER,
      gradedAt: new Date(),
    });

    // Check if this graded submission advances the enrollment.
    if (dto.score >= Number(submission.enrollment.journey.passingScore)) {
      await this.enrollmentsService.checkAndAdvance(submission.enrollmentId, {
        count: (opts: any) =>
          this.repo.count({
            ...opts,
            where: {
              ...opts.where,
              score: MoreThanOrEqual(submission.enrollment.journey.passingScore),
            },
          }),
      });
    }

    return this.repo.findOne({ where: { id: submissionId } }) as Promise<Submission>;
  }

  async findByEnrollment(enrollmentId: string, userId: string) {
    const enrollment = await this.enrollmentRepo.findOne({ where: { id: enrollmentId } });
    if (!enrollment) throw new NotFoundException('Không tìm thấy enrollment');
    if (enrollment.userId !== userId) throw new ForbiddenException();

    return this.repo.find({
      where: { enrollmentId },
      order: { submittedAt: 'DESC' },
    });
  }
}
