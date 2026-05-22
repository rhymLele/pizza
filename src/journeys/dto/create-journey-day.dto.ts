import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsInt, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator';

export class CreateJourneyDayDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  dayNumber!: number;

  @ApiProperty({ example: 'Day 1: Chào hỏi cơ bản' })
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ description: 'Chỉ dùng khi paceMode = scheduled (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  unlockDate?: string;
}
