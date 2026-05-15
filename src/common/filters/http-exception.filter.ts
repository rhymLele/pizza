import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

// Map HTTP status code → error code string để client nhận diện lỗi mà không phụ thuộc vào số.
const ERROR_CODE_MAP: Record<number, string> = {
  400: 'BAD_REQUEST',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
  422: 'UNPROCESSABLE_ENTITY',
  429: 'TOO_MANY_REQUESTS',
  500: 'INTERNAL_SERVER_ERROR',
};

// @Catch() không truyền argument → bắt MỌI exception, kể cả lỗi không phải HttpException.
// Nếu chỉ viết @Catch(HttpException) thì lỗi DB, lỗi runtime sẽ không bị bắt → trả HTML 500 mặc định của Express.
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Lỗi hệ thống, vui lòng thử lại sau';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();

      // ValidationPipe trả body dạng { message: string[] } — lấy phần tử đầu tiên.
      // HttpException thông thường trả body dạng string hoặc { message: string }.
      if (typeof body === 'string') {
        message = body;
      } else if (typeof body === 'object' && body !== null) {
        const bodyMsg = (body as any).message;
        message = Array.isArray(bodyMsg) ? bodyMsg[0] : (bodyMsg ?? message);
      }
    } else if (exception instanceof Error) {
      // Lỗi runtime không phải HttpException — log stack để debug, không expose ra client.
      this.logger.error(exception.message, exception.stack);
    }

    const code = ERROR_CODE_MAP[status] ?? 'ERROR';

    // Trả cùng format với TransformInterceptor nhưng status: false và data: null.
    // Client chỉ cần xử lý một format duy nhất cho cả success và error.
    response.status(status).json({
      message: { code, message },
      reason: message,
      status: false,
      data: null,
      count: 0,
    });
  }
}
