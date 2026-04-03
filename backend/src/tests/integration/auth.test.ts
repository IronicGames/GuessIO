import { describe, it, expect } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '@backend/app';
import * as userService from '@services/user.service';
import { authService } from '@services/auth.service';
import { config } from '@utils/constants/env';
import { generateUniqueUserData } from '@tests/helpers/test-data';
import { API_ENDPOINTS } from '@shared/endpoints';

describe('Auth Integration Tests', () => {
  describe(`POST /api${API_ENDPOINTS.auth.loginAsGuest}`, () => {
    it('should set a cookie and return success when no name is provided', async () => {
      const response = await request(app)
        .post(`/api${API_ENDPOINTS.auth.loginAsGuest}`)
        .send({})
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('should set a cookie and return success when a valid name is provided', async () => {
      const response = await request(app)
        .post(`/api${API_ENDPOINTS.auth.loginAsGuest}`)
        .send({ name: 'TestPlayer' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('should return 400 when name is too short', async () => {
      const response = await request(app)
        .post(`/api${API_ENDPOINTS.auth.loginAsGuest}`)
        .send({ name: 'X' })
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
      expect(response.body.issues[0].message).toBe('Name must be at least 2 characters');
    });

    it('should return 400 when name is too long', async () => {
      const response = await request(app)
        .post(`/api${API_ENDPOINTS.auth.loginAsGuest}`)
        .send({ name: 'A'.repeat(21) })
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
      expect(response.body.issues[0].message).toBe('Name must not exceed 20 characters');
    });
  });

  describe(`GET /api${API_ENDPOINTS.auth.profile}`, () => {
    it('should return guest data from JWT without hitting the DB', async () => {
      const guestToken = authService.createGuestToken('GuestUser');

      const response = await request(app)
        .get(`/api${API_ENDPOINTS.auth.profile}`)
        .set('Cookie', [`token=${guestToken}`])
        .expect(200);

      expect(response.body.name).toBe('GuestUser');
      expect(response.body.role).toBe('GUEST');
    });

    it('should return player profile data from DB', async () => {
      const userData = generateUniqueUserData();
      const user = await userService.createOrGetGoogleUser(
        userData.googleId,
        userData.name,
        userData.email,
        userData.profilePictureUrl,
      );
      const playerToken = authService.generateToken({
        id: user.id,
        name: user.name,
        role: user.role,
        isGuest: false,
        profilePicture: user.profilePicture?.imageUrl,
      });

      const response = await request(app)
        .get(`/api${API_ENDPOINTS.auth.profile}`)
        .set('Cookie', [`token=${playerToken}`])
        .expect(200);

      expect(response.body.id).toBe(user.id);
      expect(response.body.name).toBe(user.name);
    });

    it('should return 401 when no token is provided', async () => {
      const response = await request(app).get(`/api${API_ENDPOINTS.auth.profile}`).expect(401);

      expect(response.body.error).toBe('No token provided');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return full user data for a player token', async () => {
      const userData = generateUniqueUserData();
      const user = await userService.createOrGetGoogleUser(
        userData.googleId,
        userData.name,
        userData.email,
        userData.profilePictureUrl,
      );
      const playerToken = authService.generateToken({
        id: user.id,
        name: user.name,
        role: user.role,
        isGuest: false,
        profilePicture: user.profilePicture?.imageUrl,
      });

      const response = await request(app)
        .get('/api/auth/me')
        .set('Cookie', [`token=${playerToken}`])
        .expect(200);

      expect(response.body.id).toBe(user.id);
    });

    it('should return 403 for a guest token', async () => {
      const guestToken = authService.createGuestToken();

      const response = await request(app)
        .get('/api/auth/me')
        .set('Cookie', [`token=${guestToken}`])
        .expect(403);

      expect(response.body.error).toBe('Insufficient permissions');
    });

    it('should return 401 when no token is provided', async () => {
      const response = await request(app).get('/api/auth/me').expect(401);

      expect(response.body.error).toBe('No token provided');
    });
  });

  describe(`POST /api${API_ENDPOINTS.auth.logout}`, () => {
    it('should return success and clear the token cookie', async () => {
      const guestToken = authService.createGuestToken();

      const response = await request(app)
        .post(`/api${API_ENDPOINTS.auth.logout}`)
        .set('Cookie', [`token=${guestToken}`])
        .expect(200);

      expect(response.body.success).toBe(true);

      const setCookieHeader = response.headers['set-cookie'] as string[] | string | undefined;
      const cookieArr = Array.isArray(setCookieHeader)
        ? setCookieHeader
        : setCookieHeader
          ? [setCookieHeader]
          : [];
      const tokenCookie = cookieArr.find((c: string) => c.startsWith('token='));
      expect(tokenCookie).toBeDefined();
      // Cleared cookies have an empty value before the first semicolon
      expect(tokenCookie).toMatch(/^token=;/);
    });
  });

  describe('Auth middleware edge cases', () => {
    it('should return 401 with "Token expired" for an expired JWT', async () => {
      const now = Math.floor(Date.now() / 1000);
      // Embed exp directly in payload so the token is already expired when created
      const expiredToken = jwt.sign(
        { id: 'test-id', name: 'Test', role: 'PLAYER', isGuest: false, exp: now - 3600 },
        config.jwtSecret,
      );

      const response = await request(app)
        .get(`/api${API_ENDPOINTS.boards.root}`)
        .set('Cookie', [`token=${expiredToken}`])
        .expect(401);

      expect(response.body.error).toBe('Token expired');
    });

    it('should return 401 with "Invalid token" for a tampered JWT', async () => {
      const validToken = authService.createGuestToken();
      const tamperedToken = `${validToken.slice(0, -5)}XXXXX`;

      const response = await request(app)
        .get(`/api${API_ENDPOINTS.boards.root}`)
        .set('Cookie', [`token=${tamperedToken}`])
        .expect(401);

      expect(response.body.error).toBe('Invalid token');
    });
  });
});
