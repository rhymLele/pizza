import { Controller, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { JwtUser } from '../auth/interfaces/jwt-user.interface.js';
import { PaginationDto } from '../common/dto/pagination.dto.js';
import { EnrollmentsService } from './enrollments.service.js';
import {
  ApiGetMyEnrollments,
  ApiGetTodayTasks,
  ApiUseFreeze,
} from './decorators/enrollments-api.decorator.js';

@ApiTags('enrollments')
@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  // 'me' declared before ':id' to prevent route shadowing.
  @ApiGetMyEnrollments()
  getMyEnrollments(@CurrentUser() user: JwtUser, @Query() pagination: PaginationDto) {
    return this.enrollmentsService.getMyEnrollments(user.id, pagination);
  }

  @ApiGetTodayTasks()
  getTodayTasks(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtUser) {
    return this.enrollmentsService.getTodayTasks(id, user.id);
  }

  @ApiUseFreeze()
  useFreeze(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtUser) {
    return this.enrollmentsService.useFreeze(id, user.id);
  }
}
