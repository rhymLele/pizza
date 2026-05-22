import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class GradeSubmissionDto {
  @ApiProperty({ minimum: 0, maximum: 100 })
  @IsNumber()
  @Min(0)
  @Max(100)
  score!: number;

  @ApiPropertyOptional({ example: 'Phát âm tốt nhưng cần chú ý trọng âm.' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  feedback?: string;
}
