import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsUUID } from 'class-validator';

export class CreateSubmissionDto {
  @ApiProperty({ description: 'ID của Enrollment (hành trình đang học)' })
  @IsUUID()
  enrollmentId!: string;

  @ApiProperty({ description: 'ID của DayTask cần nộp bài' })
  @IsUUID()
  dayTaskId!: string;

  @ApiProperty({
    description: 'Câu trả lời — cấu trúc tuỳ theo loại bài tập',
    examples: {
      multiple_choice: { value: { selectedOptionId: 'a' } },
      fill_blank: { value: { blanks: [{ position: 0, answer: 'cat' }] } },
      arrange: { value: { words: ['The', 'cat', 'is', 'on', 'the', 'table'] } },
      matching: { value: { pairs: [{ left: 'Apple', right: 'Táo' }] } },
      recording: { value: { audioUrl: 'https://cdn.example.com/audio.mp3' } },
      essay: { value: { text: 'My favorite hobby is...' } },
    },
  })
  @IsObject()
  answer!: Record<string, unknown>;
}
