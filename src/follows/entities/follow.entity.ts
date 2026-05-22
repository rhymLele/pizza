import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  Column,
} from 'typeorm';
import { User } from '../../users/entities/user.entity.js';

// Unique constraint prevents duplicate follows at the DB level.
@Entity('follows')
@Unique(['followerId', 'teacherId'])
export class Follow {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  followerId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'followerId' })
  follower!: User;

  @Column()
  teacherId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'teacherId' })
  teacher!: User;

  @CreateDateColumn()
  createdAt!: Date;
}
