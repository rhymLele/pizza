import { Injectable } from '@nestjs/common';
import { FollowsService } from '../follows/follows.service.js';
import { TopicsService } from '../topics/topics.service.js';
import type { PaginationDto } from '../common/dto/pagination.dto.js';

@Injectable()
export class FeedService {
  constructor(
    private readonly followsService: FollowsService,
    private readonly topicsService: TopicsService,
  ) {}

  // Returns paginated topics from all teachers the user follows, sorted newest first.
  // Returns empty feed if user follows nobody.
  async getFeed(userId: string, dto: PaginationDto) {
    const teacherIds = await this.followsService.getFollowingIds(userId);
    return this.topicsService.findByTeacherIds(teacherIds, dto);
  }
}
