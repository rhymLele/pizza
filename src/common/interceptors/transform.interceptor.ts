import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import type { ApiResponse } from '../interfaces/api-response.interface.js';

// Key dùng để lưu/đọc metadata giữa @ResponseMessage decorator và interceptor này.
// Phải export để decorator dùng cùng key — nếu dùng string literal riêng sẽ không đọc được.
export const RESPONSE_MESSAGE_KEY = 'response_message';

// Interface đã chuyển sang common/interfaces/api-response.interface.ts để tránh circular dependency.
// Re-export để các file đang import từ đây không cần đổi import path.
export type { ApiResponse, MessageItem } from '../interfaces/api-response.interface.js';

// Interceptor chạy sau Guard, trước khi response gửi đi client.
// Nhiệm vụ: bọc output của mọi controller thành ApiResponse chuẩn.
// Nếu không có interceptor này, mỗi controller trả về shape khác nhau —
// client phải xử lý từng case riêng lẻ.
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  // Reflector là công cụ của NestJS để đọc metadata được gắn bằng SetMetadata/@ResponseMessage.
  constructor(private readonly reflector: Reflector) { }

  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    // Đọc message từ metadata của handler (method) trước, rồi class (controller) sau.
    // getAllAndOverride trả về giá trị đầu tiên tìm được — ưu tiên method-level.
    const reason =
      this.reflector.getAllAndOverride<string>(RESPONSE_MESSAGE_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? 'Thành công';

    // next.handle() trả về Observable chứa kết quả của controller.
    // pipe(map(...)) biến đổi kết quả đó thành ApiResponse trước khi gửi đi.
    return next.handle().pipe(
      map((data) => ({
        message: { code: 'SUCCESS', message: reason },
        reason,
        status: true,
        data: data ?? null,
        // Tự tính count: mảng → độ dài, object → 1, null → 0.
        count: Array.isArray(data) ? data.length : data != null ? 1 : 0,
      })),
    );
  }
}
