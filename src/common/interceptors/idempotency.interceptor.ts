import {
  CallHandler,
  ConflictException,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { IdempotencyService } from '../services/idempotency.service.js';

// Interceptor xử lý Idempotency-Key header.
// Luồng hoạt động:
//   1. Không có header → bỏ qua, xử lý bình thường.
//   2. Có header + key đang processing → 409 (tránh duplicate concurrent request).
//   3. Có header + key đã có cache → trả cache ngay, không chạy controller.
//   4. Có header + key mới → xử lý bình thường, lưu cache khi xong.
//   5. Có header + xử lý thất bại → xoá key khỏi store, client có thể retry.
//
// Chỉ áp dụng cho POST, PUT, PATCH — GET/DELETE đã idempotent theo bản chất HTTP.
@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  constructor(private readonly idempotencyService: IdempotencyService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest();
    const key = req.headers['idempotency-key'] as string | undefined;
    const method: string = req.method;

    // Bỏ qua nếu không có key hoặc là GET/DELETE.
    if (!key || !['POST', 'PUT', 'PATCH'].includes(method)) {
      return next.handle();
    }

    // Key đang processing: request song song cùng key — từ chối để tránh double execution.
    if (this.idempotencyService.isProcessing(key)) {
      return throwError(() => new ConflictException('Request with this Idempotency-Key is already being processed'));
    }

    // Key đã có kết quả: trả cache, không chạy controller.
    const cached = this.idempotencyService.get(key);
    if (cached !== null) {
      // of() tạo Observable từ giá trị tĩnh — giả lập kết quả của controller.
      return of(cached);
    }

    // Key mới: đánh dấu processing → chạy controller → lưu kết quả.
    this.idempotencyService.markProcessing(key);

    return next.handle().pipe(
      tap((response) => {
        // Lưu cache sau khi controller trả về thành công.
        this.idempotencyService.set(key, response);
      }),
      catchError((err) => {
        // Xử lý thất bại: xoá key để client có thể retry với cùng key.
        // Nếu không xoá, client bị kẹt ở trạng thái 'processing' vĩnh viễn.
        this.idempotencyService.delete(key);
        return throwError(() => err);
      }),
    );
  }
}
