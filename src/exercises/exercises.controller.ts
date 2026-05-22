import { Body, Controller, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { JwtUser } from '../auth/interfaces/jwt-user.interface.js';
import { PaginationDto } from '../common/dto/pagination.dto.js';
import { CreateExerciseDto } from './dto/create-exercise.dto.js';
import { ExercisesService } from './exercises.service.js';
import {
  ApiCreateExercise,
  ApiDeleteExercise,
  ApiGetExercise,
  ApiGetExercisesByTeacher,
  ApiUpdateExercise,
} from './decorators/exercises-api.decorator.js';

@ApiTags('exercises')
@Controller('exercises')
export class ExercisesController {
  constructor(private readonly exercisesService: ExercisesService) {}

  @ApiCreateExercise()
  create(@CurrentUser() user: JwtUser, @Body() dto: CreateExerciseDto) {
    return this.exercisesService.create(user.id, dto);
  }

  @ApiGetExercisesByTeacher()
  findByTeacher(
    @Param('teacherId', ParseUUIDPipe) teacherId: string,
    @Query() pagination: PaginationDto,
  ) {
    // Teacher listing is public; role check happens per-item in findById.
    return this.exercisesService.findByTeacher(teacherId, pagination);
  }

  @ApiGetExercise()
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtUser) {
    return this.exercisesService.findById(id, user.id, user.role);
  }

  @ApiUpdateExercise()
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtUser,
    @Body() dto: CreateExerciseDto,
  ) {
    return this.exercisesService.update(id, user.id, dto);
  }

  @ApiDeleteExercise()
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtUser) {
    return this.exercisesService.remove(id, user.id);
  }
}
