import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity.js';
import { TopicType } from '../../common/enums/topic-type.enum.js';
import { Visibility } from '../../common/enums/visibility.enum.js';

@Entity('topics')
export class Topic {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  teacherId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'teacherId' })
  teacher!: User;

  @Column({ type: 'enum', enum: TopicType })
  type!: TopicType;

  @Column()
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ nullable: true, type: 'varchar' })
  coverUrl!: string | null;

  @Column({ type: 'enum', enum: Visibility, default: Visibility.PUBLIC })
  visibility!: Visibility;

  // Denormalized counters for fast reads on feed — updated on like/comment actions.
  @Column({ default: 0 })
  likeCount!: number;

  @Column({ default: 0 })
  commentCount!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
