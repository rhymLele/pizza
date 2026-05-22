import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Enrollment } from '../enrollments/entities/enrollment.entity.js';
import { EnrollmentsModule } from '../enrollments/enrollments.module.js';
import { ExercisesModule } from '../exercises/exercises.module.js';
import { DayTask } from '../journeys/entities/day-task.entity.js';
import { Submission } from './entities/submission.entity.js';
import { SubmissionsController } from './submissions.controller.js';
import { SubmissionsService } from './submissions.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Submission, DayTask, Enrollment]),
    ExercisesModule,
    EnrollmentsModule,
  ],
  controllers: [SubmissionsController],
  providers: [SubmissionsService],
  exports: [SubmissionsService],
})
export class SubmissionsModule {}
