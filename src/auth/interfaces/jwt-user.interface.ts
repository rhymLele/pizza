// Shape của req.user sau khi JwtStrategy.validate() chạy xong.
// Dùng để type-safe @CurrentUser() decorator thay vì any.
export interface JwtUser {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
  updatedAt: Date;
}
