import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Enrollment } from './enrollment.entity.js';
import { JourneyDay } from '../../journeys/entities/journey-day.entity.js';

// One record per (enrollment, day) — tracks how many tasks were completed and when.
@Entity('daily_progress')
@Unique(['enrollmentId', 'dayId'])
export class DailyProgress {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  enrollmentId!: string;

  @ManyToOne(() => Enrollment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'enrollmentId' })
  enrollment!: Enrollment;

  @Column()
  dayId!: string;

  @ManyToOne(() => JourneyDay, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'dayId' })
  day!: JourneyDay;

  @Column({ default: 0 })
  tasksCompleted!: number;

  // Set when all required tasks for this day are passed.
  @Column({ nullable: true, type: 'timestamp' })
  completedAt!: Date | null;

  @CreateDateColumn()
  createdAt!: Date;
}
