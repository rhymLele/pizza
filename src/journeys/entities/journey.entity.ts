import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity.js';
import { PaceMode } from '../enums/pace-mode.enum.js';
import { JourneyDay } from './journey-day.entity.js';

@Entity('journeys')
export class Journey {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  teacherId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'teacherId' })
  teacher!: User;

  // Optional reference to the social Topic post for this journey.
  @Column({ nullable: true, type: 'varchar' })
  topicId!: string | null;

  @Column()
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'enum', enum: PaceMode, default: PaceMode.SELF_PACED })
  paceMode!: PaceMode;

  // Minimum score (%) to pass a day and advance. Applied per-submission.
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 70 })
  passingScore!: number;

  @Column({ default: true })
  allowResubmit!: boolean;

  // Number of freeze tokens each enrolled student receives (Duolingo-style streak skip).
  @Column({ default: 0 })
  freezeTokens!: number;

  // Auto-updated by JourneysService.addDay() to stay in sync with actual day count.
  @Column({ default: 0 })
  totalDays!: number;

  // Required for PaceMode.DEADLINE — the date by which the journey must be completed.
  @Column({ nullable: true, type: 'timestamp' })
  deadlineDate!: Date | null;

  @OneToMany(() => JourneyDay, (day) => day.journey)
  days!: JourneyDay[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
