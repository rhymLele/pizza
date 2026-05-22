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
import { ExerciseType } from '../enums/exercise-type.enum.js';

// config: display data shown to students (options, prompts, shuffled words, etc.)
// answerKey: correct answer — stripped from student responses, used only by the grader.
@Entity('exercises')
export class Exercise {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  teacherId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'teacherId' })
  teacher!: User;

  @Column({ type: 'enum', enum: ExerciseType })
  type!: ExerciseType;

  @Column()
  question!: string;

  @Column({ type: 'jsonb' })
  config!: Record<string, unknown>;

  // Null for manually-graded types (recording, essay).
  @Column({ type: 'jsonb', nullable: true })
  answerKey!: Record<string, unknown> | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
