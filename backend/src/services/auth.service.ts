import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';
import { config } from 'src/constants/env.js';

const client = new OAuth2Client(
  config.googleClientId,
  config.googleClientSecret,
  config.googleRedirectUri
);

export class AuthService {
  getGoogleAuthUrl(): string {
    return client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
      ],
    });
  }

  async handleGoogleCallback(code: string) {
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: config.googleClientId,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      throw new Error('Failed to get user info from Google');
    }

    const user = await prisma.user.upsert({
      where: { googleId: payload.sub },
      update: {
        email: payload.email!,
        name: payload.name,
        profilePicUrl: payload.picture,
      },
      create: {
        googleId: payload.sub,
        email: payload.email!,
        name: payload.name!,
        profilePicUrl: payload.picture,
      },
    });

    const jwtToken = jwt.sign(
      { userId: user.id, email: user.email },
      config.jwtSecret!,
      { expiresIn: '7d' }
    );

    return { user, token: jwtToken };
  }

  verifyToken(token: string) {
    try {
      return jwt.verify(token, config.jwtSecret!) as {
        userId: string;
        email: string;
      };
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}
