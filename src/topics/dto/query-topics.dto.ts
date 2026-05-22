import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto.js';
import { TopicType } from '../../common/enums/topic-type.enum.js';

export class QueryTopicsDto extends PaginationDto {
  @ApiPropertyOptional({ enum: TopicType })
  @IsOptional()
  @IsEnum(TopicType)
  type?: TopicType;
}
