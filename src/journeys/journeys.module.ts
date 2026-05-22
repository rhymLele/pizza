import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Journey } from './entities/journey.entity.js';
import { JourneyDay } from './entities/journey-day.entity.js';
import { DayTask } from './entities/day-task.entity.js';
import { JourneysController } from './journeys.controller.js';
import { JourneysService } from './journeys.service.js';
import { EnrollmentsModule } from '../enrollments/enrollments.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([Journey, JourneyDay, DayTask]), EnrollmentsModule],
  controllers: [JourneysController],
  providers: [JourneysService],
  exports: [JourneysService],
})
export class JourneysModule {}
