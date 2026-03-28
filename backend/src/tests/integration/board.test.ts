import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '@backend/app';
import * as userService from '@services/user.service';
import { authService } from '@services/auth.service';
import prisma from '@lib/prisma';
import { generateUniqueUserData } from '@tests/helpers/test-data';
import { type BoardDto } from '@shared/types/board.types';
import { API_ENDPOINTS } from '@shared/endpoints';

describe('Board Integration Tests', () => {
  let userToken: string;
  let userId: string;
  let otherUserId: string;

  beforeEach(async () => {
    const userData = generateUniqueUserData();
    const user = await userService.createOrGetGoogleUser(
      userData.googleId,
      userData.name,
      userData.email,
      userData.profilePictureUrl,
    );
    userId = user.id;
    userToken = authService.generateToken(user.id);

    const otherUserData = generateUniqueUserData();
    const otherUser = await userService.createOrGetGoogleUser(
      otherUserData.googleId,
      otherUserData.name,
      otherUserData.email,
      otherUserData.profilePictureUrl,
    );
    otherUserId = otherUser.id;
  });

  describe(`POST ${API_ENDPOINTS.boards.root}`, () => {
    it('should create a board with valid data', async () => {
      const uniqueName = `Pokemon Board ${crypto.randomUUID()}`;

      const response = await request(app)
        .post(API_ENDPOINTS.boards.root)
        .set('Cookie', [`token=${userToken}`])
        .send({
          name: uniqueName,
          description: 'All 151 original pokemon',
          isPublic: false,
        })
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(typeof response.body.id).toBe('string');

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
      const boardData = {
        name: `Board with Image ${crypto.randomUUID()}`,
        description: 'Has an image',
        isPublic: true,
        imageUrl: `https://example.com/board-image-${crypto.randomUUID()}.jpg`,
      };

      const response = await request(app)
        .post(API_ENDPOINTS.boards.root)
        .set('Cookie', [`token=${userToken}`])
        .send(boardData)
        .expect(200);

      const boardInDb = await prisma.board.findUnique({
        where: { id: response.body.id },
        include: { image: true },
      });

      expect(boardInDb!.image).not.toBeNull();
      expect(boardInDb!.image!.imageUrl).toBe(boardData.imageUrl);
    });

    it('should return 400 when name is missing', async () => {
      const response = await request(app)
        .post(API_ENDPOINTS.boards.root)
        .set('Cookie', [`token=${userToken}`])
        .send({ description: 'Missing name', isPublic: false })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Board name is required');
    });

    it('should return 401 when no auth token is provided', async () => {
      const response = await request(app)
        .post(API_ENDPOINTS.boards.root)
        .send({ name: 'Unauthorized Board' })
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('No token provided');
    });

    it('should return 401 when invalid token is provided', async () => {
      const response = await request(app)
        .post(API_ENDPOINTS.boards.root)
        .set('Authorization', 'Bearer invalid-token')
        .send({ name: 'Invalid Token Board' })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe(`GET ${API_ENDPOINTS.boards.root}`, () => {
    it('should return all boards for authenticated user', async () => {
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

      await prisma.board.createMany({
        data: [
          { name: `Other Board 1 ${crypto.randomUUID()}`, userId: otherUserId },
          { name: `Other Board 2 ${crypto.randomUUID()}`, userId: otherUserId },
        ],
      });

      const response = await request(app)
        .get(API_ENDPOINTS.boards.root)
        .set('Cookie', [`token=${userToken}`])
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);

      const testBoards = response.body.filter(
        (board: BoardDto) =>
          board.name === board1Name || board.name === board2Name || board.name === board3Name,
      );

      expect(testBoards).toHaveLength(3);
      expect(testBoards.every((board: BoardDto) => board.userId === userId)).toBe(true);
    });

    it('should not return other users boards', async () => {
      const otherUserBoardName = `Other User Board ${crypto.randomUUID()}`;
      await prisma.board.create({
        data: { name: otherUserBoardName, userId: otherUserId },
      });

      const response = await request(app)
        .get(API_ENDPOINTS.boards.root)
        .set('Cookie', [`token=${userToken}`])
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.every((board: BoardDto) => board.name !== otherUserBoardName)).toBe(
        true,
      );
    });

    it('should return 401 when no auth token is provided', async () => {
      await request(app).get(API_ENDPOINTS.boards.root).expect(401);
    });
  });

  describe('PUT /api/boards/:boardId', () => {
    let boardId: string;

    beforeEach(async () => {
      const board = await prisma.board.create({
        data: {
          name: `Original Board ${crypto.randomUUID()}`,
          description: 'Original description',
          isPublic: false,
          userId,
        },
      });
      boardId = board.id;
    });

    it('should update a board with valid data', async () => {
      const updatedName = `Updated Board ${crypto.randomUUID()}`;

      const response = await request(app)
        .put(API_ENDPOINTS.boards.byId(boardId))
        .set('Cookie', [`token=${userToken}`])
        .send({
          name: updatedName,
          description: 'Updated description',
          isPublic: true,
        })
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body.id).toBe(boardId);

      const boardInDb = await prisma.board.findUnique({
        where: { id: boardId },
      });
      expect(boardInDb!.name).toBe(updatedName);
      expect(boardInDb!.description).toBe('Updated description');
      expect(boardInDb!.isPublic).toBe(true);
    });

    it('should update board image URL', async () => {
      const imageUrl = `https://example.com/new-image-${crypto.randomUUID()}.jpg`;

      await request(app)
        .put(API_ENDPOINTS.boards.byId(boardId))
        .set('Cookie', [`token=${userToken}`])
        .send({ name: `Board with New Image ${crypto.randomUUID()}`, imageUrl })
        .expect(200);

      const boardInDb = await prisma.board.findUnique({
        where: { id: boardId },
        include: { image: true },
      });

      expect(boardInDb!.image).not.toBeNull();
      expect(boardInDb!.image!.imageUrl).toBe(imageUrl);
    });

    it('should return 400 when name is missing', async () => {
      const response = await request(app)
        .put(API_ENDPOINTS.boards.byId(boardId))
        .set('Cookie', [`token=${userToken}`])
        .send({ description: 'Missing name' })
        .expect(400);

      expect(response.body.error).toBe('Board name is required');
    });

    it('should return 404 when board does not exist', async () => {
      const response = await request(app)
        .put(API_ENDPOINTS.boards.byId(crypto.randomUUID()))
        .set('Cookie', [`token=${userToken}`])
        .send({ name: 'Non-existent Board' })
        .expect(404);

      expect(response.body.error).toBe('Board not found');
    });
  });

  describe('DELETE /api/boards/:boardId', () => {
    let boardId: string;

    beforeEach(async () => {
      const board = await prisma.board.create({
        data: { name: `Board to Delete ${crypto.randomUUID()}`, userId },
      });
      boardId = board.id;
    });

    it('should delete a board', async () => {
      const response = await request(app)
        .delete(API_ENDPOINTS.boards.byId(boardId))
        .set('Cookie', [`token=${userToken}`])
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body.id).toBe(boardId);

      const boardInDb = await prisma.board.findUnique({
        where: { id: boardId },
      });
      expect(boardInDb).toBeNull();
    });

    it('should return 404 when board does not exist', async () => {
      const response = await request(app)
        .delete(API_ENDPOINTS.boards.byId(crypto.randomUUID()))
        .set('Cookie', [`token=${userToken}`])
        .expect(404);

      expect(response.body.error).toBe('Board not found');
    });
  });
});
