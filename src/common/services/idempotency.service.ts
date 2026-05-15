import { Injectable } from '@nestjs/common';

// Trạng thái của một idempotency key trong store.
type IdempotencyEntry =
  | { state: 'processing' }                          // đang xử lý, chưa có kết quả
  | { state: 'done'; data: unknown; expiresAt: number }; // đã xong, có cache

// In-memory store cho idempotency keys.
// Production nên dùng Redis để:
//   1. Chia sẻ giữa nhiều instance (horizontal scaling).
//   2. TTL tự xoá mà không cần setInterval.
//   3. Atomic check-and-set để tránh race condition giữa nhiều pod.
@Injectable()
export class IdempotencyService {
  // TTL mặc định: 24 giờ — đủ dài để client retry, đủ ngắn để không chiếm RAM vô hạn.
  private readonly TTL_MS = 24 * 60 * 60 * 1000;
  private readonly store = new Map<string, IdempotencyEntry>();

  isProcessing(key: string): boolean {
    return this.store.get(key)?.state === 'processing';
  }

  // Lấy cached response — trả null nếu chưa có hoặc đã hết TTL.
  get(key: string): unknown | null {
    const entry = this.store.get(key);
    if (!entry || entry.state !== 'done') return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.data;
  }

  // Đánh dấu key đang xử lý — ngăn request song song cùng key chạy 2 lần.
  markProcessing(key: string): void {
    this.store.set(key, { state: 'processing' });
  }

  // Lưu kết quả sau khi xử lý xong.
  set(key: string, data: unknown): void {
    this.store.set(key, {
      state: 'done',
      data,
      expiresAt: Date.now() + this.TTL_MS,
    });
  }

  // Xoá key nếu xử lý thất bại — cho phép client retry với cùng key.
  delete(key: string): void {
    this.store.delete(key);
  }
}
