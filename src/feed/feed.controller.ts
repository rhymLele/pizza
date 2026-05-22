import { Controller, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { JwtUser } from '../auth/interfaces/jwt-user.interface.js';
import { PaginationDto } from '../common/dto/pagination.dto.js';
import { FeedService } from './feed.service.js';
import { ApiGetFeed } from './decorators/feed-api.decorator.js';

@ApiTags('feed')
@Controller('feed')
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @ApiGetFeed()
  getFeed(@CurrentUser() user: JwtUser, @Query() pagination: PaginationDto) {
    return this.feedService.getFeed(user.id, pagination);
  }
}
