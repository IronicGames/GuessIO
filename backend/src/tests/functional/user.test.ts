import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../app';
import { getAllUsers } from '../../repositories/user.repository';

describe('User Integration Tests', () => {
  describe('POST /api/users/google - createOrGetGoogleUser', () => {
    it('should create a new user when googleId does not exist', async () => {
      // Creates unique user data
      const uniqueId = crypto.randomUUID().toString();
      const userData = {
        name: 'Test User',
        email: `test-${uniqueId}@test.com`,
        googleId: uniqueId,
        profilePictureUrl: 'http://example.com/profile.jpg',
      };

      // creates the user and checks the response
      const response = await request(app)
        .post('/api/users/google')
        .send(userData);
      expect(response.status).toBe(201);
      expect(response.body).property('name', userData.name);
      expect(response.body).property('email', userData.email);
      expect(response.body).property('googleId', userData.googleId);
      expect(response.body.profilePicture).property(
        'imageUrl',
        userData.profilePictureUrl
      );
    });

    it('should return existing user when googleId already exists', async () => {
      // Creates unique user data
      const uniqueId = crypto.randomUUID().toString();
      const userData = {
        name: 'Test User',
        email: `test-${uniqueId}@test.com`,
        googleId: uniqueId,
        profilePictureUrl: 'http://example.com/profile.jpg',
      };

      // assert that the user does not already exist
      let allUsers = await getAllUsers();
      expect(
        allUsers.filter((x) => x?.googleId === userData.googleId)
      ).toHaveLength(0);

      // create the user and check that the user is created
      await request(app).post('/api/users/google').send(userData);
      allUsers = await getAllUsers();
      expect(
        allUsers.filter((x) => x?.googleId === userData.googleId)
      ).toHaveLength(1);

      // tries to create the same user again and checks that no duplicate is created
      await request(app).post('/api/users/google').send(userData);
      allUsers = await getAllUsers();
      expect(
        allUsers.filter((x) => x?.googleId === userData.googleId)
      ).toHaveLength(1);
    });
  });
});
