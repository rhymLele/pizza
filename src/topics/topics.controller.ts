import { Body, Controller, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { JwtUser } from '../auth/interfaces/jwt-user.interface.js';
import { PaginationDto } from '../common/dto/pagination.dto.js';
import { CreateTopicDto } from './dto/create-topic.dto.js';
import { UpdateTopicDto } from './dto/update-topic.dto.js';
import { CreateCommentDto } from './dto/create-comment.dto.js';
import { QueryTopicsDto } from './dto/query-topics.dto.js';
import { TopicsService } from './topics.service.js';
import {
  ApiAddComment,
  ApiCreateTopic,
  ApiDeleteTopic,
  ApiGetComments,
  ApiGetTopic,
  ApiGetTopicsByTeacher,
  ApiToggleLike,
  ApiUpdateTopic,
} from './decorators/topics-api.decorator.js';

@ApiTags('topics')
@Controller('topics')
export class TopicsController {
  constructor(private readonly topicsService: TopicsService) {}

  @ApiCreateTopic()
  create(@CurrentUser() user: JwtUser, @Body() dto: CreateTopicDto) {
    return this.topicsService.create(user.id, dto);
  }

  // Static routes declared before parameterized ones to avoid shadowing.
  @ApiGetTopicsByTeacher()
  findByTeacher(
    @Param('teacherId', ParseUUIDPipe) teacherId: string,
    @Query() query: QueryTopicsDto,
  ) {
    return this.topicsService.findByTeacher(teacherId, query);
  }

  @ApiGetTopic()
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user?: JwtUser) {
    return this.topicsService.findById(id, user?.id);
  }

  @ApiUpdateTopic()
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtUser,
    @Body() dto: UpdateTopicDto,
  ) {
    return this.topicsService.update(id, user.id, dto);
  }

  @ApiDeleteTopic()
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtUser) {
    return this.topicsService.remove(id, user.id);
  }

  @ApiToggleLike()
  toggleLike(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtUser) {
    return this.topicsService.toggleLike(user.id, id);
  }

  @ApiGetComments()
  getComments(@Param('id', ParseUUIDPipe) id: string, @Query() pagination: PaginationDto) {
    return this.topicsService.getComments(id, pagination);
  }

  @ApiAddComment()
  addComment(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtUser,
    @Body() dto: CreateCommentDto,
  ) {
    return this.topicsService.addComment(user.id, id, dto);
  }
}
