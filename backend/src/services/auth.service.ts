import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { config } from '@utils/constants/env';
import { adjectives, animals, uniqueNamesGenerator } from 'unique-names-generator';
import * as userService from '@services/user.service';
import { InternalServerError } from '@errors/app-error';
import { type UserProfile } from '@shared/types/user.types';
import { Role } from '@prisma/client';

class AuthService {
  private client: OAuth2Client;

  constructor() {
    this.client = new OAuth2Client(
      config.googleClientId,
      config.googleClientSecret,
      config.googleRedirectUri,
    );
  }

  getGoogleAuthUrl(): string {
    return this.client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
      ],
    });
  }

  async handleGoogleCallback(code: string) {
    const { tokens } = await this.client.getToken(code);
    this.client.setCredentials(tokens);

    const ticket = await this.client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: config.googleClientId,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      throw new InternalServerError('Failed to get user info from Google');
    }

    const user = await userService.createOrGetGoogleUser(
      payload.sub,
      this.generateUsername(),
      payload.email,
      payload.picture,
    );

    return this.generateToken({
      id: user.id,
      name: user.name,
      role: user.role,
      isGuest: false,
      profilePicture: user.profilePicture?.imageUrl,
    } as UserProfile);
  }

  generateToken(user: UserProfile): string {
    return jwt.sign(user, config.jwtSecret, { expiresIn: '90d' });
  }

  verifyToken(token: string): UserProfile {
    return jwt.verify(token, config.jwtSecret) as UserProfile;
  }

  createGuestToken(name?: string): string {
    return this.generateToken({
      id: `guest_${crypto.randomUUID()}`,
      role: Role.GUEST,
      isGuest: true,
      name: name ?? this.generateUsername(),
      profilePicture: `https://api.dicebear.com/9.x/bottts/svg?seed=${name}`,
    });
  }
  generateUsername(): string {
    return uniqueNamesGenerator({
      dictionaries: [adjectives, animals],
      separator: '',
      style: 'capital',
      length: 2,
    });
  }
}

export const authService = new AuthService();
