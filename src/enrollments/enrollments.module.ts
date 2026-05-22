import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Journey } from '../journeys/entities/journey.entity.js';
import { JourneyDay } from '../journeys/entities/journey-day.entity.js';
import { DayTask } from '../journeys/entities/day-task.entity.js';
import { Enrollment } from './entities/enrollment.entity.js';
import { DailyProgress } from './entities/daily-progress.entity.js';
import { EnrollmentsController } from './enrollments.controller.js';
import { EnrollmentsService } from './enrollments.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Enrollment, DailyProgress, Journey, JourneyDay, DayTask]),
  ],
  controllers: [EnrollmentsController],
  providers: [EnrollmentsService],
  exports: [EnrollmentsService],
})
export class EnrollmentsModule {}
