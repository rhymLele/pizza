import { Module } from '@nestjs/common';
import { FollowsModule } from '../follows/follows.module.js';
import { TopicsModule } from '../topics/topics.module.js';
import { FeedController } from './feed.controller.js';
import { FeedService } from './feed.service.js';

@Module({
  // FeedService composes FollowsService + TopicsService — no direct DB access.
  imports: [FollowsModule, TopicsModule],
  controllers: [FeedController],
  providers: [FeedService],
})
export class FeedModule {}
