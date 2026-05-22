import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUrl, MaxLength, MinLength } from 'class-validator';
import { TopicType } from '../../common/enums/topic-type.enum.js';
import { Visibility } from '../../common/enums/visibility.enum.js';

export class CreateTopicDto {
  @ApiProperty({ enum: TopicType })
  @IsEnum(TopicType)
  type!: TopicType;

  @ApiProperty({ example: '10 cụm từ tiếng Anh hay gặp nhất' })
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title!: string;

  @ApiPropertyOptional({ example: 'Bài học này giúp bạn...' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/cover.jpg' })
  @IsOptional()
  @IsUrl()
  coverUrl?: string;

  @ApiPropertyOptional({ enum: Visibility, default: Visibility.PUBLIC })
  @IsOptional()
  @IsEnum(Visibility)
  visibility?: Visibility;
}
