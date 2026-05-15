import { SetMetadata } from '@nestjs/common';
import { RESPONSE_MESSAGE_KEY } from '../interceptors/transform.interceptor.js';

// Decorator gắn message tùy chỉnh vào route handler.
// SetMetadata đính dữ liệu vào metadata của handler/class —
// TransformInterceptor đọc lại qua Reflector để đưa vào field 'reason' của response.
// Nếu không dùng decorator này, mọi response đều trả message mặc định "Thành công".
export const ResponseMessage = (message: string) => SetMetadata(RESPONSE_MESSAGE_KEY, message);
