import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { IdempotencyService } from './services/idempotency.service.js';
import { IdempotencyInterceptor } from './interceptors/idempotency.interceptor.js';

// CommonModule tập trung các provider dùng chung toàn app.
// APP_INTERCEPTOR: đăng ký IdempotencyInterceptor global thông qua IoC container —
// cách duy nhất để interceptor có thể inject service (IdempotencyService).
// Khác với app.useGlobalInterceptors() trong main.ts (không hỗ trợ DI).
@Module({
  providers: [
    IdempotencyService,
    {
      provide: APP_INTERCEPTOR,
      useClass: IdempotencyInterceptor,
    },
  ],
})
export class CommonModule {}
