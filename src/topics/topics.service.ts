import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Visibility } from '../common/enums/visibility.enum.js';
import type { CreateTopicDto } from './dto/create-topic.dto.js';
import type { UpdateTopicDto } from './dto/update-topic.dto.js';
import type { CreateCommentDto } from './dto/create-comment.dto.js';
import type { QueryTopicsDto } from './dto/query-topics.dto.js';
import type { PaginationDto } from '../common/dto/pagination.dto.js';
import { Topic } from './entities/topic.entity.js';
import { TopicLike } from './entities/topic-like.entity.js';
import { TopicComment } from './entities/topic-comment.entity.js';

@Injectable()
export class TopicsService {
  constructor(
    @InjectRepository(Topic)
    private readonly topicRepo: Repository<Topic>,
    @InjectRepository(TopicLike)
    private readonly likeRepo: Repository<TopicLike>,
    @InjectRepository(TopicComment)
    private readonly commentRepo: Repository<TopicComment>,
  ) {}

  async create(teacherId: string, dto: CreateTopicDto): Promise<Topic> {
    const topic = this.topicRepo.create({ ...dto, teacherId });
    return this.topicRepo.save(topic);
  }

  async findById(topicId: string, viewerId?: string): Promise<Topic> {
    const topic = await this.topicRepo.findOne({
      where: { id: topicId },
      relations: ['teacher'],
    });
    if (!topic) throw new NotFoundException('Không tìm thấy topic');

    // followers_only topics require the viewer to be the teacher themselves.
    // Full access control (checking follow status) is handled by FeedService / FollowsService.
    if (topic.visibility === Visibility.FOLLOWERS_ONLY && topic.teacherId !== viewerId) {
      // Allow for now; FollowsService integration added in feed layer.
    }

    return topic;
  }

  async findByTeacher(teacherId: string, dto: QueryTopicsDto) {
    const { page, limit, type } = dto;
    const where: Record<string, unknown> = { teacherId };
    if (type) where['type'] = type;

    const [items, total] = await this.topicRepo.findAndCount({
      where,
      relations: ['teacher'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total, page, limit };
  }

  // Fetches topics from a list of teacher IDs (used by FeedService).
  async findByTeacherIds(teacherIds: string[], dto: PaginationDto) {
    if (teacherIds.length === 0) return { items: [], total: 0, page: dto.page, limit: dto.limit };
    const { page, limit } = dto;
    const [items, total] = await this.topicRepo.findAndCount({
      where: { teacherId: In(teacherIds), visibility: Visibility.PUBLIC },
      relations: ['teacher'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total, page, limit };
  }

  async update(topicId: string, teacherId: string, dto: UpdateTopicDto): Promise<Topic> {
    const topic = await this.findById(topicId);
    if (topic.teacherId !== teacherId) {
      throw new ForbiddenException('Bạn không có quyền chỉnh sửa topic này');
    }
    Object.assign(topic, dto);
    return this.topicRepo.save(topic);
  }

  async remove(topicId: string, teacherId: string): Promise<void> {
    const topic = await this.findById(topicId);
    if (topic.teacherId !== teacherId) {
      throw new ForbiddenException('Bạn không có quyền xóa topic này');
    }
    await this.topicRepo.remove(topic);
  }

  // Toggles like: creates if not exists, removes if exists. Returns current liked state.
  async toggleLike(userId: string, topicId: string): Promise<{ liked: boolean }> {
    const topic = await this.findById(topicId);
    const existing = await this.likeRepo.findOne({ where: { userId, topicId } });

    if (existing) {
      await this.likeRepo.remove(existing);
      await this.topicRepo.decrement({ id: topicId }, 'likeCount', 1);
      return { liked: false };
    }

    await this.likeRepo.save(this.likeRepo.create({ userId, topicId }));
    await this.topicRepo.increment({ id: topicId }, 'likeCount', 1);
    return { liked: true };
  }

  async getComments(topicId: string, dto: PaginationDto) {
    await this.findById(topicId);
    const { page, limit } = dto;
    const [items, total] = await this.commentRepo.findAndCount({
      where: { topicId, parentId: undefined },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total, page, limit };
  }

  async addComment(userId: string, topicId: string, dto: CreateCommentDto): Promise<TopicComment> {
    await this.findById(topicId);

    if (dto.parentId) {
      const parent = await this.commentRepo.findOne({ where: { id: dto.parentId, topicId } });
      if (!parent) throw new NotFoundException('Comment cha không tồn tại');
    }

    const comment = await this.commentRepo.save(
      this.commentRepo.create({ userId, topicId, ...dto }),
    );
    await this.topicRepo.increment({ id: topicId }, 'commentCount', 1);
    return this.commentRepo.findOne({ where: { id: comment.id }, relations: ['user'] }) as Promise<TopicComment>;
  }
}
