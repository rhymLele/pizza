import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { AppModule } from './app.module.js';
import { TransformInterceptor } from './common/interceptors/transform.interceptor.js';
import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';

// Cấu hình Winston logger — thay thế built-in Logger của NestJS.
// Mọi Logger instance trong app (middleware, filter, service...) đều dùng Winston này.
const winstonLogger = WinstonModule.createLogger({
  transports: [
    // Console: dùng trong dev — colorize + format dễ đọc.
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp({ format: 'HH:mm:ss' }),
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, context }) =>
          `[${timestamp}] ${level} [${context ?? 'App'}] ${message}`,
        ),
      ),
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    }),
  ],
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: winstonLogger });

  // ExceptionFilter phải đăng ký TRƯỚC interceptor.
  // Thứ tự: Filter (bắt lỗi) → Guard → Interceptor (bọc response thành công).
  app.useGlobalFilters(new HttpExceptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalInterceptors(new TransformInterceptor(app.get(Reflector)));

  // Swagger — chỉ bật ở môi trường không phải production để tránh expose API schema ra ngoài.
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Pizza API')
      .setDescription(
        'Tài liệu API. Mọi response thành công đều có dạng:\n\n' +
        '```json\n{ "message": { "code": "SUCCESS", "message": "..." }, "reason": "...", "status": true, "data": {}, "count": 1 }\n```\n\n' +
        'Lỗi có dạng:\n\n' +
        '```json\n{ "message": { "code": "UNAUTHORIZED", "message": "..." }, "reason": "...", "status": false, "data": null, "count": 0 }\n```',
      )
      .setVersion('1.0')
      // addBearerAuth: thêm ô nhập access token vào UI — khớp với tên 'access-token' dùng trong @ApiBearerAuth().
      .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'access-token')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    // Swagger UI accessible tại /api/docs
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        // Giữ token sau khi reload trang — tiện khi test.
        persistAuthorization: true,
      },
    });
  }

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
