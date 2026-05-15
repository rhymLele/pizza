import * as Joi from 'joi';

// Schema validate toàn bộ biến môi trường khi app khởi động.
// Nếu thiếu hoặc sai kiểu → app crash ngay lập tức với thông báo rõ ràng,
// thay vì chạy được rồi fail âm thầm lúc runtime (ví dụ: JWT_SECRET undefined → mọi token đều invalid).
export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),

  PORT: Joi.number().default(3000),

  // DB — required: không có DB thì app vô nghĩa.
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(5432),
  DB_USER: Joi.string().required(),
  DB_PASSWORD: Joi.string().allow('').default(''),
  DB_NAME: Joi.string().required(),

  // min(32): secret quá ngắn thì JWT dễ bị brute-force.
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string().default('15m'),

  // Secret riêng cho refresh token — nếu access secret bị lộ, refresh token vẫn an toàn.
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),
});
