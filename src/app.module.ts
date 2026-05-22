import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { envValidationSchema } from './config/env.validation.js';

// Domain modules — Phase 1
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { TeachersModule } from './teachers/teachers.module.js';
import { FollowsModule } from './follows/follows.module.js';
import { TopicsModule } from './topics/topics.module.js';
import { FeedModule } from './feed/feed.module.js';
import { CommonModule } from './common/common.module.js';

// Domain modules — Phase 2
import { ExercisesModule } from './exercises/exercises.module.js';
import { JourneysModule } from './journeys/journeys.module.js';
import { EnrollmentsModule } from './enrollments/enrollments.module.js';
import { SubmissionsModule } from './submissions/submissions.module.js';

// Entities — Phase 1
import { User } from './users/entities/user.entity.js';
import { TeacherProfile } from './teachers/entities/teacher-profile.entity.js';
import { Follow } from './follows/entities/follow.entity.js';
import { Topic } from './topics/entities/topic.entity.js';
import { TopicLike } from './topics/entities/topic-like.entity.js';
import { TopicComment } from './topics/entities/topic-comment.entity.js';

// Entities — Phase 2
import { Exercise } from './exercises/entities/exercise.entity.js';
import { Journey } from './journeys/entities/journey.entity.js';
import { JourneyDay } from './journeys/entities/journey-day.entity.js';
import { DayTask } from './journeys/entities/day-task.entity.js';
import { Enrollment } from './enrollments/entities/enrollment.entity.js';
import { DailyProgress } from './enrollments/entities/daily-progress.entity.js';
import { Submission } from './submissions/entities/submission.entity.js';

// Middleware
import { RequestIdMiddleware } from './common/middleware/request-id.middleware.js';
import { LoggerMiddleware } from './common/middleware/logger.middleware.js';

const entities = [
  // Phase 1
  User, TeacherProfile, Follow, Topic, TopicLike, TopicComment,
  // Phase 2
  Exercise, Journey, JourneyDay, DayTask, Enrollment, DailyProgress, Submission,
];

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validationSchema: envValidationSchema }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USER'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        entities,
        synchronize: config.get('NODE_ENV') !== 'production',
      }),
    }),

    // Phase 1
    CommonModule,
    AuthModule,
    UsersModule,
    TeachersModule,
    FollowsModule,
    TopicsModule,
    FeedModule,

    // Phase 2
    ExercisesModule,
    JourneysModule,
    EnrollmentsModule,
    SubmissionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestIdMiddleware)
      .forRoutes({ path: '*path', method: RequestMethod.ALL });

    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: '*path', method: RequestMethod.ALL });
  }
}
