import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Role } from '../../common/enums/role.enum.js';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({ nullable: true, type: 'text' })
  refreshToken!: string | null;

  @Column({ nullable: true, type: 'varchar' })
  name!: string | null;

  @Column({ nullable: true, type: 'text' })
  bio!: string | null;

  @Column({ nullable: true, type: 'varchar' })
  avatarUrl!: string | null;

  // Stored as enum string in DB. Defaults to student on registration.
  @Column({ type: 'enum', enum: Role, default: Role.STUDENT })
  role!: Role;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
