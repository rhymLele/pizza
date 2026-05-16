// Shape chuẩn cho mọi response trả về client.
// Tách ra khỏi interceptor để các file khác (filter, test) import mà không tạo circular dependency.
export interface MessageItem {
  code: string;   // mã kết quả, ví dụ: 'SUCCESS', 'NOT_FOUND'
  message: string;
}

export interface ApiResponse<T> {
  message: MessageItem;
  reason: string;
  status: boolean;
  data: T;
  count: number;
}
