import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com', description: 'Địa chỉ email hợp lệ' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Str0ng!Pass', description: 'Mật khẩu tối thiểu 8 ký tự' })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiPropertyOptional({ example: 'Nguyễn Văn A', description: 'Tên hiển thị (tuỳ chọn)' })
  @IsOptional()
  @IsString()
  name?: string;
}
