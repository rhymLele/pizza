import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'crypto';

// Mỗi request được gắn một UUID duy nhất (X-Request-ID).
// Nếu client tự gửi header này (ví dụ: frontend, mobile) thì giữ nguyên giá trị đó —
// giúp trace end-to-end từ client đến server log mà không bị đứt.
// Nếu client không gửi thì server tự sinh — đảm bảo mọi request đều có ID.
@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const requestId =
      (req.headers['x-request-id'] as string | undefined) ?? randomUUID();

    // Gắn vào req để middleware/interceptor/service sau đọc được (ví dụ: LoggerMiddleware).
    (req as any).requestId = requestId;

    // Trả về header cho client — client dùng ID này để báo cáo lỗi hoặc hỗ trợ kỹ thuật.
    res.setHeader('X-Request-ID', requestId);

    next();
  }
}
