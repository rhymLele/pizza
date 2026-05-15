import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

// Middleware chạy đầu tiên trong pipeline — trước Guard, Pipe, Interceptor.
// Nhiệm vụ: ghi log mỗi HTTP request vào auth routes.
// Lý do đặt ở middleware thay vì interceptor: middleware chạy kể cả khi
// Guard reject request (401/403), còn interceptor chỉ chạy khi request vào được controller.
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl } = req;
    // requestId được gắn bởi RequestIdMiddleware — chạy trước middleware này.
    // Dùng để nhóm toàn bộ log của một request lại khi debug.
    const requestId = (req as any).requestId ?? '-';
    const start = Date.now();

    // Lắng nghe sự kiện 'finish' của response thay vì log ngay lập tức
    // để có đủ thông tin: status code và thời gian xử lý thực tế.
    res.on('finish', () => {
      const ms = Date.now() - start;
      this.logger.log(
        `[${requestId}] ${method} ${originalUrl} ${res.statusCode} — ${ms}ms`,
      );
    });

    // Bắt buộc phải gọi next() — nếu không request bị treo, không đi tiếp được.
    next();
  }
}
