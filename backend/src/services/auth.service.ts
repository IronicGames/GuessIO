import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import * as userService from './user.service.js';
import { config } from '../constants/env';
import {
  adjectives,
  animals,
  uniqueNamesGenerator,
} from 'unique-names-generator';

export class AuthService {
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
    // Step 1: Exchange code for tokens
    const { tokens } = await this.client.getToken(code);
    this.client.setCredentials(tokens);

    // Step 2: Verify the ID token and get user info
    const ticket = await this.client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: config.googleClientId,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      throw new Error('Failed to get user info from Google');
    }

    // Generate random username
    const username = uniqueNamesGenerator({
      dictionaries: [adjectives, animals],
      separator: '',
      style: 'capital',
      length: 2,
    });

    // Step 3: Create or get user in our database
    const user = await userService.createOrGetGoogleUser(
      payload.sub,
      username,
      payload.email,
      payload.picture
    );

    // Step 4: Generate our own session token
    const jwtToken = this.generateToken(user.id, user.email);

    return { user, token: jwtToken };
  }

  generateToken(userId: string, email: string | null): string {
    return jwt.sign({ userId, email }, config.jwtSecret);
  }

  verifyToken(token: string): { userId: string; email: string | null } {
    try {
      return jwt.verify(token, config.jwtSecret) as {
        userId: string;
        email: string | null;
      };
    } catch (_error) {
      const errorMessage =
        _error instanceof Error ? _error.message : 'Unknown error';
      console.error(errorMessage);
      throw new Error('Invalid or expired token');
    }
  }
}
