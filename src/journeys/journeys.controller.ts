import { Body, Controller, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { JwtUser } from '../auth/interfaces/jwt-user.interface.js';
import { PaginationDto } from '../common/dto/pagination.dto.js';
import { EnrollmentsService } from '../enrollments/enrollments.service.js';
import { CreateJourneyDto } from './dto/create-journey.dto.js';
import { CreateJourneyDayDto } from './dto/create-journey-day.dto.js';
import { CreateDayTaskDto } from './dto/create-day-task.dto.js';
import { JourneysService } from './journeys.service.js';
import {
  ApiAddDayTask,
  ApiAddJourneyDay,
  ApiCreateJourney,
  ApiEnrollJourney,
  ApiGetJourney,
  ApiGetJourneys,
} from './decorators/journeys-api.decorator.js';

@ApiTags('journeys')
@Controller('journeys')
export class JourneysController {
  constructor(
    private readonly journeysService: JourneysService,
    private readonly enrollmentsService: EnrollmentsService,
  ) {}

  @ApiCreateJourney()
  create(@CurrentUser() user: JwtUser, @Body() dto: CreateJourneyDto) {
    return this.journeysService.create(user.id, dto);
  }

  @ApiGetJourneys()
  findAll(@Query() pagination: PaginationDto) {
    return this.journeysService.findAll(pagination);
  }

  // Static sub-routes declared before ':id' to prevent shadowing.
  @ApiAddDayTask()
  addTask(
    @Param('dayId', ParseUUIDPipe) dayId: string,
    @CurrentUser() user: JwtUser,
    @Body() dto: CreateDayTaskDto,
  ) {
    return this.journeysService.addTask(dayId, user.id, dto);
  }

  @ApiGetJourney()
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.journeysService.findById(id);
  }

  @ApiAddJourneyDay()
  addDay(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtUser,
    @Body() dto: CreateJourneyDayDto,
  ) {
    return this.journeysService.addDay(id, user.id, dto);
  }

  @ApiEnrollJourney()
  enroll(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtUser) {
    return this.enrollmentsService.enroll(user.id, id);
  }
}
