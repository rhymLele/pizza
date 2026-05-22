import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { TeachingMode } from '../entities/teacher-profile.entity.js';

export class UpdateTeacherProfileDto {
  @ApiPropertyOptional({ example: ['IELTS', 'TOEIC', 'Giao tiếp'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  subjects?: string[];

  @ApiPropertyOptional({ enum: TeachingMode })
  @IsOptional()
  @IsEnum(TeachingMode)
  teachingMode?: TeachingMode;
}
