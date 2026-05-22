import { Controller, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { JwtUser } from '../auth/interfaces/jwt-user.interface.js';
import { PaginationDto } from '../common/dto/pagination.dto.js';
import { FollowsService } from './follows.service.js';
import {
  ApiFollow,
  ApiGetFollowers,
  ApiGetFollowing,
  ApiUnfollow,
} from './decorators/follows-api.decorator.js';

@ApiTags('follows')
@Controller('follows')
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  // 'following' must be declared before ':teacherId' to avoid route shadowing.
  @ApiGetFollowing()
  getFollowing(@CurrentUser() user: JwtUser, @Query() pagination: PaginationDto) {
    return this.followsService.getFollowing(user.id, pagination);
  }

  @ApiFollow()
  follow(@CurrentUser() user: JwtUser, @Param('teacherId', ParseUUIDPipe) teacherId: string) {
    return this.followsService.follow(user.id, teacherId);
  }

  @ApiUnfollow()
  unfollow(@CurrentUser() user: JwtUser, @Param('teacherId', ParseUUIDPipe) teacherId: string) {
    return this.followsService.unfollow(user.id, teacherId);
  }

  @ApiGetFollowers()
  getFollowers(
    @Param('teacherId', ParseUUIDPipe) teacherId: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.followsService.getFollowers(teacherId, pagination);
  }
}
