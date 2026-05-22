import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { PaceMode } from '../enums/pace-mode.enum.js';

export class CreateJourneyDto {
  @ApiProperty({ example: '30 ngày nói tiếng Anh tự nhiên' })
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({ description: 'Topic ID liên kết với Journey này (type=journey)' })
  @IsOptional()
  @IsUUID()
  topicId?: string;

  @ApiPropertyOptional({ enum: PaceMode, default: PaceMode.SELF_PACED })
  @IsOptional()
  @IsEnum(PaceMode)
  paceMode?: PaceMode;

  @ApiPropertyOptional({ default: 70, minimum: 0, maximum: 100 })
  @IsOptional()
  @Min(0)
  @Max(100)
  passingScore?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  allowResubmit?: boolean;

  @ApiPropertyOptional({ default: 0, description: 'Số freeze token mỗi học sinh nhận khi enroll' })
  @IsOptional()
  @IsInt()
  @Min(0)
  freezeTokens?: number;

  @ApiPropertyOptional({ description: 'Bắt buộc nếu paceMode = deadline' })
  @IsOptional()
  @IsDateString()
  deadlineDate?: string;
}
