import { Body, Controller, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { JwtUser } from '../auth/interfaces/jwt-user.interface.js';
import { CreateSubmissionDto } from './dto/create-submission.dto.js';
import { GradeSubmissionDto } from './dto/grade-submission.dto.js';
import { SubmissionsService } from './submissions.service.js';
import {
  ApiGetSubmission,
  ApiGetSubmissionsByEnrollment,
  ApiGradeSubmission,
  ApiSubmit,
} from './decorators/submissions-api.decorator.js';

@ApiTags('submissions')
@Controller('submissions')
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @ApiSubmit()
  submit(@CurrentUser() user: JwtUser, @Body() dto: CreateSubmissionDto) {
    return this.submissionsService.submit(user.id, dto);
  }

  // Static sub-routes before parameterized to avoid shadowing.
  @ApiGetSubmissionsByEnrollment()
  findByEnrollment(
    @Param('enrollmentId', ParseUUIDPipe) enrollmentId: string,
    @CurrentUser() user: JwtUser,
  ) {
    return this.submissionsService.findByEnrollment(enrollmentId, user.id);
  }

  @ApiGetSubmission()
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtUser) {
    return this.submissionsService.findById(id, user.id, user.role);
  }

  @ApiGradeSubmission()
  grade(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtUser,
    @Body() dto: GradeSubmissionDto,
  ) {
    return this.submissionsService.grade(id, user.id, dto);
  }
}
