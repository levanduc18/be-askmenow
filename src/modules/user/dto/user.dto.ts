import { Exclude } from 'class-transformer';

export class UserDto {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  googleId?: string;
  provider: string;
  role: string;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;

  @Exclude()
  passwordHash?: string;
}
