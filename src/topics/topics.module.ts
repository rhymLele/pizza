import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Topic } from './entities/topic.entity.js';
import { TopicLike } from './entities/topic-like.entity.js';
import { TopicComment } from './entities/topic-comment.entity.js';
import { TopicsController } from './topics.controller.js';
import { TopicsService } from './topics.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Topic, TopicLike, TopicComment])],
  controllers: [TopicsController],
  providers: [TopicsService],
  exports: [TopicsService],
})
export class TopicsModule {}
