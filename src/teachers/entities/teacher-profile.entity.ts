import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity.js';

export enum TeachingMode {
  ONLINE = 'online',
  OFFLINE = 'offline',
  BOTH = 'both',
}

@Entity('teacher_profiles')
export class TeacherProfile {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // One-to-one: each teacher user has exactly one profile.
  @Column({ unique: true })
  userId!: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  // Stored as comma-separated string by simple-array, queried as string[].
  @Column({ type: 'simple-array', nullable: true })
  subjects!: string[] | null;

  @Column({ type: 'enum', enum: TeachingMode, default: TeachingMode.ONLINE })
  teachingMode!: TeachingMode;

  // Aggregate rating; updated by review service in Phase 4.
  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating!: number;

  @Column({ default: 0 })
  reviewCount!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
