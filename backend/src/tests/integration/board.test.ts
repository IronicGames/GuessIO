import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '@backend/app';
import * as userService from '@services/user.service';
import { authService } from '@services/auth.service';
import prisma from '@lib/prisma';
import { generateUniqueUserData } from '@tests/helpers/test-data';
import { BoardDto } from '@shared/board.types';

describe('Board Integration Tests', () => {
  let userToken: string;
  let userId: string;
  // let otherUserToken: string;
  let otherUserId: string;

  beforeEach(async () => {
    // Create first user with unique data
    const userData = generateUniqueUserData();
    const user = await userService.createOrGetGoogleUser(
      userData.googleId,
      userData.name,
      userData.email,
      userData.profilePictureUrl
    );
    userId = user.id;
    userToken = authService.generateToken(user.id);

    // Create second user for authorization tests
    const otherUserData = generateUniqueUserData();
    const otherUser = await userService.createOrGetGoogleUser(
      otherUserData.googleId,
      otherUserData.name,
      otherUserData.email,
      otherUserData.profilePictureUrl
    );
    otherUserId = otherUser.id;
    // otherUserToken = authService.generateToken(otherUser.id);
  });

  describe('POST /api/board', () => {
    it('should create a board with valid data', async () => {
      const uniqueName = `Pokemon Board ${crypto.randomUUID()}`;
      const boardData = {
        name: uniqueName,
        description: 'All 151 original pokemon',
        isPublic: false,
      };

      const response = await request(app)
        .post('/api/board')
        .set('Authorization', `Bearer ${userToken}`)
        .send(boardData)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(typeof response.body.id).toBe('string');

      // Verify in database
      const boardInDb = await prisma.board.findUnique({
        where: { id: response.body.id },
      });

      expect(boardInDb).not.toBeNull();
      expect(boardInDb!.name).toBe(uniqueName);
      expect(boardInDb!.description).toBe('All 151 original pokemon');
      expect(boardInDb!.isPublic).toBe(false);
      expect(boardInDb!.userId).toBe(userId);
    });

    it('should create a board with image URL', async () => {
      const uniqueName = `Board with Image ${crypto.randomUUID()}`;
      const boardData = {
        name: uniqueName,
        description: 'Has an image',
        isPublic: true,
        imageUrl: `https://example.com/board-image-${crypto.randomUUID()}.jpg`,
      };

      const response = await request(app)
        .post('/api/board')
        .set('Authorization', `Bearer ${userToken}`)
        .send(boardData)
        .expect(200);

      // Verify image was created
      const boardInDb = await prisma.board.findUnique({
        where: { id: response.body.id },
        include: { image: true },
      });

      expect(boardInDb!.image).not.toBeNull();
      expect(boardInDb!.image!.imageUrl).toBe(boardData.imageUrl);
    });

    it('should return 400 when name is missing', async () => {
      const boardData = {
        description: 'Missing name',
        isPublic: false,
      };

      const response = await request(app)
        .post('/api/board')
        .set('Authorization', `Bearer ${userToken}`)
        .send(boardData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Board name is required');
    });

    it('should return 401 when no auth token is provided', async () => {
      const boardData = {
        name: 'Unauthorized Board',
      };

      const response = await request(app)
        .post('/api/board')
        .send(boardData)
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('No token provided');
    });

    it('should return 401 when invalid token is provided', async () => {
      const boardData = {
        name: 'Invalid Token Board',
      };

      const response = await request(app)
        .post('/api/board')
        .set('Authorization', 'Bearer invalid-token')
        .send(boardData)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/board', () => {
    it('should return all boards for authenticated user', async () => {
      // Create multiple boards for user with unique names
      const board1Name = `Board 1 ${crypto.randomUUID()}`;
      const board2Name = `Board 2 ${crypto.randomUUID()}`;
      const board3Name = `Board 3 ${crypto.randomUUID()}`;

      await prisma.board.createMany({
        data: [
          { name: board1Name, userId },
          { name: board2Name, userId },
          { name: board3Name, userId },
        ],
      });

      // Create boards for other user
      await prisma.board.createMany({
        data: [
          { name: `Other Board 1 ${crypto.randomUUID()}`, userId: otherUserId },
          { name: `Other Board 2 ${crypto.randomUUID()}`, userId: otherUserId },
        ],
      });

      const response = await request(app)
        .get('/api/board')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(3);

      // Filter to only boards created in this test
      const testBoards = response.body.filter(
        (board: BoardDto) =>
          board.name === board1Name ||
          board.name === board2Name ||
          board.name === board3Name
      );

      expect(testBoards).toHaveLength(3);
      expect(
        testBoards.every((board: BoardDto) => board.userId === userId)
      ).toBe(true);
    });

    it('should not return other users boards', async () => {
      // Create board for other user
      const otherUserBoardName = `Other User Board ${crypto.randomUUID()}`;
      await prisma.board.create({
        data: {
          name: otherUserBoardName,
          userId: otherUserId,
        },
      });

      const response = await request(app)
        .get('/api/board')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(
        response.body.every(
          (board: BoardDto) => board.name !== otherUserBoardName
        )
      ).toBe(true);
    });

    it('should return 401 when no auth token is provided', async () => {
      await request(app).get('/api/board').expect(401);
    });
  });

  describe('PUT /api/board/:id', () => {
    let boardId: string;
    let originalName: string;
    beforeEach(async () => {
      originalName = `Original Board ${crypto.randomUUID()}`;
      // Create a board for testing updates
      const board = await prisma.board.create({
        data: {
          name: originalName,
          description: 'Original description',
          isPublic: false,
          userId,
        },
      });
      boardId = board.id;
    });

    it('should update a board with valid data', async () => {
      const updatedName = `Updated Board ${crypto.randomUUID()}`;
      const updateData = {
        name: updatedName,
        description: 'Updated description',
        isPublic: true,
      };

      const response = await request(app)
        .put(`/api/board/${boardId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body.id).toBe(boardId);

      // Verify in database
      const boardInDb = await prisma.board.findUnique({
        where: { id: boardId },
      });

      expect(boardInDb!.name).toBe(updatedName);
      expect(boardInDb!.description).toBe('Updated description');
      expect(boardInDb!.isPublic).toBe(true);
    });

    it('should update board image URL', async () => {
      const imageUrl = `https://example.com/new-image-${crypto.randomUUID()}.jpg`;
      const updateData = {
        name: `Board with New Image ${crypto.randomUUID()}`,
        imageUrl,
      };

      await request(app)
        .put(`/api/board/${boardId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData)
        .expect(200);

      // Verify image was created/updated
      const boardInDb = await prisma.board.findUnique({
        where: { id: boardId },
        include: { image: true },
      });

      expect(boardInDb!.image).not.toBeNull();
      expect(boardInDb!.image!.imageUrl).toBe(imageUrl);
    });

    it('should return 400 when name is missing', async () => {
      const updateData = {
        description: 'Missing name',
      };

      const response = await request(app)
        .put(`/api/board/${boardId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData)
        .expect(400);

      expect(response.body.error).toBe('Board name is required');
    });

    it('should return 404 when board does not exist', async () => {
      const fakeId = crypto.randomUUID();
      const updateData = {
        name: 'Non-existent Board',
      };

      const response = await request(app)
        .put(`/api/board/${fakeId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body.error).toBe('Board not found');
    });
  });

  describe('DELETE /api/board/:id', () => {
    let boardId: string;

    beforeEach(async () => {
      // Create a board for testing deletion
      const board = await prisma.board.create({
        data: {
          name: `Board to Delete ${crypto.randomUUID()}`,
          userId,
        },
      });
      boardId = board.id;
    });

    it('should delete a board', async () => {
      const response = await request(app)
        .delete(`/api/board/${boardId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body.id).toBe(boardId);

      // Verify board was deleted
      const boardInDb = await prisma.board.findUnique({
        where: { id: boardId },
      });
      expect(boardInDb).toBeNull();
    });

    it('should return 404 when board does not exist', async () => {
      const fakeId = crypto.randomUUID();

      const response = await request(app)
        .delete(`/api/board/${fakeId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);

      expect(response.body.error).toBe('Board not found');
    });
  });
});
