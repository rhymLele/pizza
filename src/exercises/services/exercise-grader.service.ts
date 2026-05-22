import { Injectable } from '@nestjs/common';
import { GradedBy } from '../../common/enums/graded-by.enum.js';
import { AUTO_GRADED_TYPES, ExerciseType } from '../enums/exercise-type.enum.js';
import type { Exercise } from '../entities/exercise.entity.js';

export interface GradeResult {
  score: number | null;
  feedback: string | null;
  gradedBy: GradedBy | null;
}

@Injectable()
export class ExerciseGraderService {
  grade(exercise: Exercise, studentAnswer: Record<string, unknown>): GradeResult {
    if (!AUTO_GRADED_TYPES.has(exercise.type) || !exercise.answerKey) {
      return { score: null, feedback: null, gradedBy: null };
    }

    switch (exercise.type) {
      case ExerciseType.MULTIPLE_CHOICE:
        return this.gradeMultipleChoice(exercise.answerKey, studentAnswer);
      case ExerciseType.FILL_BLANK:
        return this.gradeFillBlank(exercise.answerKey, studentAnswer);
      case ExerciseType.ARRANGE:
        return this.gradeArrange(exercise.answerKey, studentAnswer);
      case ExerciseType.MATCHING:
        return this.gradeMatching(exercise.answerKey, studentAnswer);
      default:
        return { score: null, feedback: null, gradedBy: null };
    }
  }

  private gradeMultipleChoice(
    answerKey: Record<string, unknown>,
    answer: Record<string, unknown>,
  ): GradeResult {
    const correct = answerKey['correctOptionId'] as string;
    const score = correct === answer['selectedOptionId'] ? 100 : 0;
    return { score, feedback: null, gradedBy: GradedBy.AUTO };
  }

  private gradeFillBlank(
    answerKey: Record<string, unknown>,
    answer: Record<string, unknown>,
  ): GradeResult {
    const correct = answerKey['blanks'] as { position: number; answer: string }[];
    const student = (answer['blanks'] as { position: number; answer: string }[]) ?? [];

    const matched = correct.filter((c) => {
      const s = student.find((b) => b.position === c.position);
      return s?.answer.trim().toLowerCase() === c.answer.trim().toLowerCase();
    });

    const score = correct.length > 0 ? (matched.length / correct.length) * 100 : 0;
    return { score, feedback: null, gradedBy: GradedBy.AUTO };
  }

  private gradeArrange(
    answerKey: Record<string, unknown>,
    answer: Record<string, unknown>,
  ): GradeResult {
    const correct = answerKey['correct'] as string[];
    const student = (answer['words'] as string[]) ?? [];
    const ok =
      correct.length === student.length && correct.every((w, i) => w === student[i]);
    return { score: ok ? 100 : 0, feedback: null, gradedBy: GradedBy.AUTO };
  }

  private gradeMatching(
    answerKey: Record<string, unknown>,
    answer: Record<string, unknown>,
  ): GradeResult {
    const correct = answerKey['pairs'] as { left: string; right: string }[];
    const student = (answer['pairs'] as { left: string; right: string }[]) ?? [];

    const matched = correct.filter((c) => {
      const s = student.find((p) => p.left === c.left);
      return s?.right === c.right;
    });

    const score = correct.length > 0 ? (matched.length / correct.length) * 100 : 0;
    return { score, feedback: null, gradedBy: GradedBy.AUTO };
  }
}
