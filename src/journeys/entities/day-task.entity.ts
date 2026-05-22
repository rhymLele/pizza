import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Exercise } from '../../exercises/entities/exercise.entity.js';
import { JourneyDay } from './journey-day.entity.js';

@Entity('day_tasks')
export class DayTask {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  dayId!: string;

  @ManyToOne(() => JourneyDay, (d) => d.tasks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'dayId' })
  day!: JourneyDay;

  @Column()
  exerciseId!: string;

  @ManyToOne(() => Exercise, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'exerciseId' })
  exercise!: Exercise;

  // Display order within the day.
  @Column({ default: 0 })
  order!: number;

  // Required tasks must be passed before the day is considered complete.
  @Column({ default: true })
  required!: boolean;
}
