import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity.js';
import { Exercise } from '../../exercises/entities/exercise.entity.js';
import { Enrollment } from '../../enrollments/entities/enrollment.entity.js';
import { DayTask } from '../../journeys/entities/day-task.entity.js';
import { GradedBy } from '../../common/enums/graded-by.enum.js';

@Entity('submissions')
export class Submission {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column()
  exerciseId!: string;

  @ManyToOne(() => Exercise, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'exerciseId' })
  exercise!: Exercise;

  @Column()
  enrollmentId!: string;

  @ManyToOne(() => Enrollment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'enrollmentId' })
  enrollment!: Enrollment;

  @Column()
  dayTaskId!: string;

  @ManyToOne(() => DayTask, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'dayTaskId' })
  dayTask!: DayTask;

  // Student's answer — structure depends on exercise type.
  @Column({ type: 'jsonb' })
  answer!: Record<string, unknown>;

  // 0-100; null = pending manual grading.
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  score!: number | null;

  @Column({ type: 'text', nullable: true })
  feedback!: string | null;

  @Column({ nullable: true, type: 'timestamp' })
  gradedAt!: Date | null;

  @Column({ type: 'enum', enum: GradedBy, nullable: true })
  gradedBy!: GradedBy | null;

  @CreateDateColumn()
  submittedAt!: Date;
}
