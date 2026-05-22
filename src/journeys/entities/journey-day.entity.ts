import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Journey } from './journey.entity.js';
import { DayTask } from './day-task.entity.js';

@Entity('journey_days')
@Unique(['journeyId', 'dayNumber'])
export class JourneyDay {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  journeyId!: string;

  @ManyToOne(() => Journey, (j) => j.days, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'journeyId' })
  journey!: Journey;

  @Column()
  dayNumber!: number;

  @Column()
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  // Set only for PaceMode.SCHEDULED — the calendar date this day becomes available.
  @Column({ type: 'date', nullable: true })
  unlockDate!: string | null;

  @OneToMany(() => DayTask, (task) => task.day)
  tasks!: DayTask[];

  @CreateDateColumn()
  createdAt!: Date;
}
