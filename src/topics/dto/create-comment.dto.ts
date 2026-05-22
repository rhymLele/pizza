import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({ example: 'Bài học rất hay, cảm ơn thầy!' })
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  content!: string;

  @ApiPropertyOptional({ description: 'ID của comment cha nếu là reply' })
  @IsOptional()
  @IsUUID()
  parentId?: string;
}
