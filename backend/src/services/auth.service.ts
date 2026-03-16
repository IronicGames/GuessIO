import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { config } from '../utils/constants/env';
import {
  adjectives,
  animals,
  uniqueNamesGenerator,
} from 'unique-names-generator';
import * as userService from '../services/user.service';
import { InternalServerError } from '../errors/app-error';

class AuthService {
  private client: OAuth2Client;

  constructor() {
    this.client = new OAuth2Client(
      config.googleClientId,
      config.googleClientSecret,
      config.googleRedirectUri
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

    const username = uniqueNamesGenerator({
      dictionaries: [adjectives, animals],
      separator: '',
      style: 'capital',
      length: 2,
    });

    const user = await userService.createOrGetGoogleUser(
      payload.sub,
      username,
      payload.email,
      payload.picture
    );

    const jwtToken = this.generateToken(user.id);

    return jwtToken;
  }

  generateToken(userId: string): string {
    return jwt.sign({ userId }, config.jwtSecret, { expiresIn: '90d' });
  }

  verifyToken(token: string): { userId: string } {
    return jwt.verify(token, config.jwtSecret) as { userId: string };
  }
}

export const authService = new AuthService();
