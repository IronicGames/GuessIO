import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '@backend/app';
import * as userService from '@services/user.service';
import { authService } from '@services/auth.service';
import prisma from '@lib/prisma';
import { generateUniqueUserData } from '@tests/helpers/test-data';
import { API_ENDPOINTS } from '@shared/endpoints';

describe('Character Integration Tests', () => {
  let userToken: string;
  let userId: string;
  let boardId: string;

  beforeEach(async () => {
    const userData = generateUniqueUserData();
    const user = await userService.createOrGetGoogleUser(
      userData.googleId,
      userData.name,
      userData.email,
      userData.profilePictureUrl,
    );
    userId = user.id;
    userToken = authService.generateToken({
      id: user.id,
      name: user.name,
      role: user.role,
      isGuest: false,
      profilePicture: user.profilePicture?.imageUrl,
    });

    const board = await prisma.board.create({
      data: { name: `Test Board ${crypto.randomUUID()}`, userId },
    });
    boardId = board.id;
  });

  describe('POST /api/boards/:boardId/characters', () => {
    it('should create a new character and connect it to the board', async () => {
      const characterName = `Alpha ${crypto.randomUUID()}`;

      const response = await request(app)
        .post(`/api${API_ENDPOINTS.characters.root(boardId)}`)
        .set('Cookie', [`token=${userToken}`])
        .send({
          name: characterName,
          tags: ['tag1', 'tag2'],
        })
        .expect(200);

      expect(response.body).toHaveProperty('characterId');
      expect(response.body.boardId).toBe(boardId);

      const characterInDb = await prisma.character.findUnique({
        where: { id: response.body.characterId },
        include: { boards: true },
      });

      expect(characterInDb).not.toBeNull();
      expect(characterInDb!.name).toBe(characterName);
      expect(characterInDb!.boards.some((b) => b.id === boardId)).toBe(true);
    });

    it('should create a character with image URL', async () => {
      const imageUrl = `https://example.com/char-${crypto.randomUUID()}.jpg`;

      const response = await request(app)
        .post(`/api${API_ENDPOINTS.characters.root(boardId)}`)
        .set('Cookie', [`token=${userToken}`])
        .send({ name: `Character with Image ${crypto.randomUUID()}`, imageUrl })
        .expect(200);

      const characterInDb = await prisma.character.findUnique({
        where: { id: response.body.characterId },
        include: { image: true },
      });

      expect(characterInDb!.image).not.toBeNull();
      expect(characterInDb!.image!.imageUrl).toBe(imageUrl);
    });

    it('should add an existing character to a board', async () => {
      const board2 = await prisma.board.create({
        data: { name: `Second Board ${crypto.randomUUID()}`, userId },
      });

      const createResponse = await request(app)
        .post(`/api${API_ENDPOINTS.characters.root(boardId)}`)
        .set('Cookie', [`token=${userToken}`])
        .send({ name: `Shared Character ${crypto.randomUUID()}` })
        .expect(200);

      const characterId = createResponse.body.characterId;

      await request(app)
        .post(`/api${API_ENDPOINTS.characters.root(board2.id)}`)
        .set('Cookie', [`token=${userToken}`])
        .send({ characterId })
        .expect(200);

      const characterInDb = await prisma.character.findUnique({
        where: { id: characterId },
        include: { boards: true },
      });

      expect(characterInDb!.boards).toHaveLength(2);
      expect(characterInDb!.boards.some((b) => b.id === boardId)).toBe(true);
      expect(characterInDb!.boards.some((b) => b.id === board2.id)).toBe(true);
    });

    it('should return 400 when neither name nor characterId is provided', async () => {
      const response = await request(app)
        .post(`/api${API_ENDPOINTS.characters.root(boardId)}`)
        .set('Cookie', [`token=${userToken}`])
        .send({ tags: ['no-name'] })
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
      expect(response.body.issues).toHaveLength(1);
      expect(response.body.issues[0].message).toBe('Character name is required');
    });

    it('should return 401 when no auth token is provided', async () => {
      await request(app)
        .post(`/api${API_ENDPOINTS.characters.root(boardId)}`)
        .send({ name: 'Unauthorized Character' })
        .expect(401);
    });
  });

  describe('PUT /api/boards/:boardId/characters/:characterId', () => {
    let characterId: string;

    beforeEach(async () => {
      const response = await request(app)
        .post(`/api${API_ENDPOINTS.characters.root(boardId)}`)
        .set('Cookie', [`token=${userToken}`])
        .send({ name: `Character to Update ${crypto.randomUUID()}` });

      characterId = response.body.characterId;
    });

    it('should update a character with valid data', async () => {
      const updatedName = `Updated Character ${crypto.randomUUID()}`;

      const response = await request(app)
        .put(`/api${API_ENDPOINTS.characters.byId(boardId, characterId)}`)
        .set('Cookie', [`token=${userToken}`])
        .send({
          name: updatedName,
          tags: ['newTag'],
        })
        .expect(200);

      expect(response.body.characterId).toBe(characterId);

      const characterInDb = await prisma.character.findUnique({
        where: { id: characterId },
      });
      expect(characterInDb!.name).toBe(updatedName);
      expect(characterInDb!.tags).toContain('newTag');
    });

    it('should update character image URL', async () => {
      const imageUrl = `https://example.com/new-char-${crypto.randomUUID()}.jpg`;

      await request(app)
        .put(`/api${API_ENDPOINTS.characters.byId(boardId, characterId)}`)
        .set('Cookie', [`token=${userToken}`])
        .send({ name: `Character with Image ${crypto.randomUUID()}`, imageUrl })
        .expect(200);

      const characterInDb = await prisma.character.findUnique({
        where: { id: characterId },
        include: { image: true },
      });

      expect(characterInDb!.image).not.toBeNull();
      expect(characterInDb!.image!.imageUrl).toBe(imageUrl);
    });

    it('should return 400 when name is missing', async () => {
      const response = await request(app)
        .put(`/api${API_ENDPOINTS.characters.byId(boardId, characterId)}`)
        .set('Cookie', [`token=${userToken}`])
        .send({ tags: [] })
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
      expect(response.body.issues).toHaveLength(1);
      expect(response.body.issues[0].message).toBe('Character name is required');
    });

    it('should return 404 when character does not exist', async () => {
      const response = await request(app)
        .put(`/api${API_ENDPOINTS.characters.byId(boardId, crypto.randomUUID())}`)
        .set('Cookie', [`token=${userToken}`])
        .send({ name: 'Non-existent Character' })
        .expect(404);

      expect(response.body.error).toBe('Character not found');
    });
  });

  describe('DELETE /api/boards/:boardId/characters/:characterId', () => {
    let characterId: string;

    beforeEach(async () => {
      const response = await request(app)
        .post(`/api${API_ENDPOINTS.characters.root(boardId)}`)
        .set('Cookie', [`token=${userToken}`])
        .send({ name: `Character to Delete ${crypto.randomUUID()}` });

      characterId = response.body.characterId;
    });

    it('should delete character entirely when it only belongs to one board', async () => {
      const response = await request(app)
        .delete(`/api${API_ENDPOINTS.characters.byId(boardId, characterId)}`)
        .set('Cookie', [`token=${userToken}`])
        .expect(200);

      expect(response.body.characterId).toBe(characterId);

      const characterInDb = await prisma.character.findUnique({
        where: { id: characterId },
      });
      expect(characterInDb).toBeNull();
    });

    it('should only disconnect character from board when it belongs to multiple boards', async () => {
      const board2 = await prisma.board.create({
        data: { name: `Second Board ${crypto.randomUUID()}`, userId },
      });

      await request(app)
        .post(`/api${API_ENDPOINTS.characters.root(board2.id)}`)
        .set('Cookie', [`token=${userToken}`])
        .send({ characterId });

      await request(app)
        .delete(`/api${API_ENDPOINTS.characters.byId(boardId, characterId)}`)
        .set('Cookie', [`token=${userToken}`])
        .expect(200);

      const characterInDb = await prisma.character.findUnique({
        where: { id: characterId },
        include: { boards: true },
      });

      expect(characterInDb).not.toBeNull();
      expect(characterInDb!.boards).toHaveLength(1);
      expect(characterInDb!.boards[0].id).toBe(board2.id);
    });

    it('should return 404 when character does not exist', async () => {
      const response = await request(app)
        .delete(`/api${API_ENDPOINTS.characters.byId(boardId, crypto.randomUUID())}`)
        .set('Cookie', [`token=${userToken}`])
        .expect(404);

      expect(response.body.error).toBe('Character not found');
    });
  });
});
