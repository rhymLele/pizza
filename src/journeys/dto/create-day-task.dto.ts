import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsUUID, Min } from 'class-validator';

export class CreateDayTaskDto {
  @ApiProperty({ description: 'ID của Exercise cần thêm vào ngày học' })
  @IsUUID()
  exerciseId!: string;

  @ApiPropertyOptional({ default: 0, description: 'Thứ tự hiển thị trong ngày' })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @ApiPropertyOptional({ default: true, description: 'Bắt buộc hoàn thành để qua ngày' })
  @IsOptional()
  @IsBoolean()
  required?: boolean;
}
