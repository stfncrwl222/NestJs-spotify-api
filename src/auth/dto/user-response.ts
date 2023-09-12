import { Role } from '@prisma/client';

export class UserResponse {
  id: string;
  username: string;
  email: string;
  photoName: string;
  confirmed: boolean;
  role: Role;
}
