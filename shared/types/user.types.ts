import { type ImageDto } from './image.types';

export interface UserDto {
  id: string;
  name: string;
  email: string | null;
  googleId: string | null;
  profilePicture: ImageDto | null;
  createdAt: string; // ISO string for JSON transfer
  updatedAt: string;
}

export interface CreateUserDto {
  name: string;
  email?: string;
  googleId?: string;
  profilePictureUrl?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  profilePicture?: string;
}
