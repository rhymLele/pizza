import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

// @Entity('users') ánh xạ class này sang bảng 'users' trong PostgreSQL.
// TypeORM đọc các decorator bên dưới để biết cột nào, kiểu dữ liệu gì, ràng buộc gì.
// Không cần viết SQL CREATE TABLE thủ công — synchronize:true trong AppModule tự tạo bảng khi dev.
@Entity('users')
export class User {
  // uuid thay vì auto-increment integer: không đoán được id kế tiếp, an toàn hơn khi expose ra API.
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // unique: true → tạo UNIQUE constraint trên DB, đảm bảo không trùng email dù service có bug.
  @Column({ unique: true })
  email!: string;

  // Lưu hash bcrypt, không bao giờ lưu plain text.
  // Việc strip field này ra khỏi response được xử lý ở AuthService.
  @Column()
  password!: string;

  // Lưu hash bcrypt của refresh token — không lưu plain text để DB bị lộ cũng không dùng được token.
  // null: user đã logout hoặc chưa từng login.
  @Column({ nullable: true, type: 'text' })
  refreshToken!: string | null;

  // nullable: true → cột cho phép NULL trong DB, khớp với name?: string ở DTO.
  @Column({ nullable: true })
  name!: string;

  // TypeORM tự set giá trị lúc INSERT, không cần truyền thủ công.
  @CreateDateColumn()
  createdAt!: Date;

  // TypeORM tự update giá trị lúc UPDATE.
  @UpdateDateColumn()
  updatedAt!: Date;
}
