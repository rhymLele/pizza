import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Exercise } from './entities/exercise.entity.js';
import { ExercisesController } from './exercises.controller.js';
import { ExercisesService } from './exercises.service.js';
import { ExerciseGraderService } from './services/exercise-grader.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Exercise])],
  controllers: [ExercisesController],
  providers: [ExercisesService, ExerciseGraderService],
  exports: [ExercisesService, ExerciseGraderService],
})
export class ExercisesModule {}
