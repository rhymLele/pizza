import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsObject, IsOptional, IsString, MinLength } from 'class-validator';
import { ExerciseType } from '../enums/exercise-type.enum.js';

/*
  config + answerKey shapes per type:

  MULTIPLE_CHOICE
    config:    { options: [{ id: string, text: string }] }
    answerKey: { correctOptionId: string }

  FILL_BLANK
    config:    { text: string }   ("The ___ is on the table")
    answerKey: { blanks: [{ position: number, answer: string }] }

  ARRANGE
    config:    { words: string[] }  (shuffled words shown to student)
    answerKey: { correct: string[] }

  MATCHING
    config:    { leftItems: string[], rightItems: string[] }
    answerKey: { pairs: [{ left: string, right: string }] }

  RECORDING
    config:    { prompt: string, referenceText?: string }
    answerKey: null  (manual grading)

  ESSAY
    config:    { prompt: string, maxWords?: number }
    answerKey: null  (manual grading)
*/
export class CreateExerciseDto {
  @ApiProperty({ enum: ExerciseType })
  @IsEnum(ExerciseType)
  type!: ExerciseType;

  @ApiProperty({ example: 'Choose the correct meaning of "apple".' })
  @IsString()
  @MinLength(3)
  question!: string;

  @ApiProperty({ description: 'Type-specific display config (see comments in DTO file)' })
  @IsObject()
  config!: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Correct answer key (null for recording/essay)' })
  @IsOptional()
  @IsObject()
  answerKey?: Record<string, unknown>;
}
