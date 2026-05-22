import { Body, Controller, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { JwtUser } from '../auth/interfaces/jwt-user.interface.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { UsersService } from './users.service.js';
import {
  ApiBecomeTeacher,
  ApiGetMe,
  ApiGetUserProfile,
  ApiUpdateMe,
} from './decorators/users-api.decorator.js';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiGetMe()
  me(@CurrentUser() user: JwtUser) {
    return user;
  }

  @ApiUpdateMe()
  updateMe(@CurrentUser() user: JwtUser, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(user.id, dto);
  }

  @ApiBecomeTeacher()
  becomeTeacher(@CurrentUser() user: JwtUser) {
    return this.usersService.becomeTeacher(user.id);
  }

  // Declare after non-parameterized routes to avoid 'me' matching :id.
  @ApiGetUserProfile()
  getProfile(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findPublicProfile(id);
  }
}
