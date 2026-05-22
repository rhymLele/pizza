import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity.js';
import { Journey } from '../../journeys/entities/journey.entity.js';

@Entity('enrollments')
@Unique(['userId', 'journeyId'])
export class Enrollment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column()
  journeyId!: string;

  @ManyToOne(() => Journey, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'journeyId' })
  journey!: Journey;

  // The day the student is currently working on (1-based).
  @Column({ default: 1 })
  currentDay!: number;

  // Consecutive days completed without a gap.
  @Column({ default: 0 })
  streak!: number;

  // Remaining freeze tokens (set from journey.freezeTokens on enroll).
  @Column({ default: 0 })
  freezeTokensLeft!: number;

  // Last calendar date (YYYY-MM-DD) the student completed a day — used for streak calculation.
  @Column({ type: 'date', nullable: true })
  lastCompletedDate!: string | null;

  // Set when the student finishes the last day of the journey.
  @Column({ nullable: true, type: 'timestamp' })
  completedAt!: Date | null;

  @CreateDateColumn()
  startedAt!: Date;
}
