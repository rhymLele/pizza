import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto.js';
import { TeachingMode } from '../entities/teacher-profile.entity.js';

export class QueryTeachersDto extends PaginationDto {
  @ApiPropertyOptional({ example: 'IELTS' })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiPropertyOptional({ enum: TeachingMode })
  @IsOptional()
  @IsEnum(TeachingMode)
  teachingMode?: TeachingMode;
}
