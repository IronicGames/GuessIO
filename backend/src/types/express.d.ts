import { type UserProfile } from '@shared/types/user.types';

declare global {
  namespace Express {
    interface Request {
      user: UserProfile;
    }
  }
}

export {};
