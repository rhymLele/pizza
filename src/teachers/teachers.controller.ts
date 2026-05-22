import { Body, Controller, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { JwtUser } from '../auth/interfaces/jwt-user.interface.js';
import { UpdateTeacherProfileDto } from './dto/update-teacher-profile.dto.js';
import { QueryTeachersDto } from './dto/query-teachers.dto.js';
import { TeachersService } from './teachers.service.js';
import {
  ApiGetTeacher,
  ApiGetTeachers,
  ApiUpdateTeacherProfile,
} from './decorators/teachers-api.decorator.js';

@ApiTags('teachers')
@Controller('teachers')
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @ApiGetTeachers()
  findAll(@Query() query: QueryTeachersDto) {
    return this.teachersService.findAll(query);
  }

  // 'me' must be declared before ':userId' to avoid route shadowing.
  @ApiUpdateTeacherProfile()
  updateMe(@CurrentUser() user: JwtUser, @Body() dto: UpdateTeacherProfileDto) {
    return this.teachersService.updateProfile(user.id, dto);
  }

  @ApiGetTeacher()
  findOne(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.teachersService.findByUserId(userId);
  }
}
