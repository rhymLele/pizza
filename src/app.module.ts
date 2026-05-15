import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { CommonModule } from './common/common.module.js';
import { User } from './users/entities/user.entity.js';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware.js';
import { LoggerMiddleware } from './common/middleware/logger.middleware.js';
import { envValidationSchema } from './config/env.validation.js';

@Module({
  imports: [
    // isGlobal: true — ConfigModule và ConfigService tự động available ở mọi module
    // mà không cần import lại. Đặt đầu tiên để các module khác dùng được ConfigService.
    // validationSchema: validate ngay khi app boot — crash sớm nếu env thiếu/sai.
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
    }),

    // forRootAsync: dùng khi cần inject dependency (ConfigService) vào factory.
    // Không thể dùng forRoot() vì process.env chưa chắc đã load xong khi module khởi tạo.
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USER'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        entities: [User],
        // Chỉ bật synchronize ở môi trường dev — production dùng migration để tránh mất dữ liệu.
        synchronize: config.get('NODE_ENV') !== 'production',
      }),
    }),

    // CommonModule: đăng ký IdempotencyInterceptor global qua APP_INTERCEPTOR.
    CommonModule,
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // RequestIdMiddleware phải chạy TRƯỚC LoggerMiddleware —
    // logger cần requestId đã được gắn vào req bởi middleware này.
    consumer
      .apply(RequestIdMiddleware)
      .forRoutes({ path: '*path', method: RequestMethod.ALL });

    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: 'auth/*path', method: RequestMethod.ALL });
  }
}
