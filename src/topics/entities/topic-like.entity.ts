import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { User } from '../../users/entities/user.entity.js';
import { Topic } from './topic.entity.js';

@Entity('topic_likes')
@Unique(['userId', 'topicId'])
export class TopicLike {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column()
  topicId!: string;

  @ManyToOne(() => Topic, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'topicId' })
  topic!: Topic;

  @CreateDateColumn()
  createdAt!: Date;
}
