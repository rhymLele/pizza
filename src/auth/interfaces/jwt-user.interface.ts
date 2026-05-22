import type { Role } from '../../common/enums/role.enum.js';

export interface JwtUser {
  id: string;
  email: string;
  name: string | null;
  bio: string | null;
  avatarUrl: string | null;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}
