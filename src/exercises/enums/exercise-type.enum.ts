export enum ExerciseType {
  MULTIPLE_CHOICE = 'multiple_choice',
  FILL_BLANK = 'fill_blank',
  ARRANGE = 'arrange',
  MATCHING = 'matching',
  RECORDING = 'recording',
  ESSAY = 'essay',
}

// Types graded automatically without teacher intervention.
export const AUTO_GRADED_TYPES = new Set([
  ExerciseType.MULTIPLE_CHOICE,
  ExerciseType.FILL_BLANK,
  ExerciseType.ARRANGE,
  ExerciseType.MATCHING,
]);
