import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity.js';
import { Follow } from './entities/follow.entity.js';
import { FollowsController } from './follows.controller.js';
import { FollowsService } from './follows.service.js';

@Module({
  // Imports User repository to validate that teacherId belongs to a teacher-role user.
  imports: [TypeOrmModule.forFeature([Follow, User])],
  controllers: [FollowsController],
  providers: [FollowsService],
  exports: [FollowsService],
})
export class FollowsModule {}
