import { describe, it, expect } from 'vitest';
import * as userService from '@services/user.service';
import prisma from '@lib/prisma';

describe('User Service Tests', () => {
  describe('createOrGetGoogleUser', () => {
    it('should create a new user when googleId does not exist', async () => {
      const uniqueId = crypto.randomUUID();

      const user = await userService.createOrGetGoogleUser(
        uniqueId,
        'Test User',
        `test-${uniqueId}@test.com`,
        'http://example.com/profile.jpg',
      );

      expect(user).toBeDefined();
      expect(user.name).toBe('Test User');
      expect(user.email).toBe(`test-${uniqueId}@test.com`);
      expect(user.googleId).toBe(uniqueId);

      const userInDb = await prisma.user.findUnique({
        where: { googleId: uniqueId },
        include: { profilePicture: true },
      });

      expect(userInDb).not.toBeNull();
      expect(userInDb!.googleId).toBe(uniqueId);
      expect(userInDb!.profilePicture?.imageUrl).toBe('http://example.com/profile.jpg');
    });

    it('should return existing user when googleId already exists', async () => {
      const uniqueId = crypto.randomUUID();

      const firstUser = await userService.createOrGetGoogleUser(
        uniqueId,
        'Test User',
        `test-${uniqueId}@test.com`,
        'http://example.com/profile.jpg',
      );

      const secondUser = await userService.createOrGetGoogleUser(
        uniqueId,
        'Different Name',
        'different@test.com',
        'http://example.com/different.jpg',
      );

      expect(secondUser.id).toBe(firstUser.id);
      expect(secondUser.name).toBe('Test User');
      expect(secondUser.email).toBe(`test-${uniqueId}@test.com`);

      const allUsers = await prisma.user.findMany({
        where: { googleId: uniqueId },
      });
      expect(allUsers).toHaveLength(1);
    });
  });
});
