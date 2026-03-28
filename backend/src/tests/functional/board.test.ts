import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '@backend/app';
import * as userService from '@services/user.service';
import { authService } from '@services/auth.service';
import { generateUniqueUserData } from '@tests/helpers/test-data';
import { type BoardDto } from '@shared/types/board.types';
import { API_ENDPOINTS } from '@shared/endpoints';

describe('Board Functional Tests', () => {
  let userToken: string;
  let userId: string;

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
  });

  it('should complete full CRUD workflow: Create → Get → Update → Delete', async () => {
    const uniqueName = `Test Board ${crypto.randomUUID()}`;
    const updatedName = `Updated Test Board ${crypto.randomUUID()}`;

    // 1. Create board
    const createResponse = await request(app)
      .post(API_ENDPOINTS.boards.root)
      .set('Cookie', [`token=${userToken}`])
      .send({
        name: uniqueName,
        description: 'Test Description',
        isPublic: false,
      })
      .expect(200);

    const boardId = createResponse.body.id;
    expect(boardId).toBeDefined();

    // 2. Get boards - verify it exists
    const getResponse = await request(app)
      .get(API_ENDPOINTS.boards.root)
      .set('Cookie', [`token=${userToken}`])
      .expect(200);

    const createdBoard = getResponse.body.find((b: { id: string }) => b.id === boardId);
    expect(createdBoard).toBeDefined();
    expect(createdBoard.name).toBe(uniqueName);

    // 3. Update board - verify changes
    await request(app)
      .put(API_ENDPOINTS.boards.byId(boardId))
      .set('Cookie', [`token=${userToken}`])
      .send({
        name: updatedName,
        description: 'Updated Description',
        isPublic: true,
      })
      .expect(200);

    const getAfterUpdate = await request(app)
      .get(API_ENDPOINTS.boards.root)
      .set('Cookie', [`token=${userToken}`])
      .expect(200);

    const updatedBoard = getAfterUpdate.body.find((b: { id: string }) => b.id === boardId);
    expect(updatedBoard.name).toBe(updatedName);
    expect(updatedBoard.description).toBe('Updated Description');
    expect(updatedBoard.isPublic).toBe(true);

    // 4. Delete board - verify gone
    await request(app)
      .delete(API_ENDPOINTS.boards.byId(boardId))
      .set('Cookie', [`token=${userToken}`])
      .expect(200);

    const getAfterDelete = await request(app)
      .get(API_ENDPOINTS.boards.root)
      .set('Cookie', [`token=${userToken}`])
      .expect(200);

    const deletedBoard = getAfterDelete.body.find((b: { id: string }) => b.id === boardId);
    expect(deletedBoard).toBeUndefined();
  });

  it('should allow user to create multiple boards and retrieve them all', async () => {
    const board1Name = `Pokemon Board ${crypto.randomUUID()}`;
    const board2Name = `Star Wars Board ${crypto.randomUUID()}`;
    const board3Name = `Marvel Board ${crypto.randomUUID()}`;

    const board1 = await request(app)
      .post(API_ENDPOINTS.boards.root)
      .set('Cookie', [`token=${userToken}`])
      .send({ name: board1Name })
      .expect(200);

    const board2 = await request(app)
      .post(API_ENDPOINTS.boards.root)
      .set('Cookie', [`token=${userToken}`])
      .send({ name: board2Name, isPublic: true })
      .expect(200);

    const board3 = await request(app)
      .post(API_ENDPOINTS.boards.root)
      .set('Cookie', [`token=${userToken}`])
      .send({ name: board3Name, description: 'Superheroes' })
      .expect(200);

    const boardIds = [board1.body.id, board2.body.id, board3.body.id];

    const response = await request(app)
      .get(API_ENDPOINTS.boards.root)
      .set('Cookie', [`token=${userToken}`])
      .expect(200);

    const createdBoards = response.body.filter((b: { id: string }) => boardIds.includes(b.id));

    expect(createdBoards).toHaveLength(3);

    const boardNames = createdBoards.map((b: BoardDto) => b.name);
    expect(boardNames).toContain(board1Name);
    expect(boardNames).toContain(board2Name);
    expect(boardNames).toContain(board3Name);
    expect(createdBoards.every((b: BoardDto) => b.userId === userId)).toBe(true);
  });

  it('should properly handle board with image through full lifecycle', async () => {
    const imageUrl = `https://example.com/board-image-${crypto.randomUUID()}.jpg`;
    const newImageUrl = `https://example.com/new-image-${crypto.randomUUID()}.jpg`;
    const boardName = `Board with Image ${crypto.randomUUID()}`;

    const createResponse = await request(app)
      .post(API_ENDPOINTS.boards.root)
      .set('Cookie', [`token=${userToken}`])
      .send({ name: boardName, imageUrl })
      .expect(200);

    const boardId = createResponse.body.id;

    const getResponse = await request(app)
      .get(API_ENDPOINTS.boards.root)
      .set('Cookie', [`token=${userToken}`])
      .expect(200);

    const createdBoard = getResponse.body.find((b: { id: string }) => b.id === boardId);
    expect(createdBoard.image).not.toBeNull();
    expect(createdBoard.image.imageUrl).toBe(imageUrl);

    await request(app)
      .put(API_ENDPOINTS.boards.byId(boardId))
      .set('Cookie', [`token=${userToken}`])
      .send({ name: `${boardName} updated`, imageUrl: newImageUrl })
      .expect(200);

    const getAfterUpdate = await request(app)
      .get(API_ENDPOINTS.boards.root)
      .set('Cookie', [`token=${userToken}`])
      .expect(200);

    const updatedBoard = getAfterUpdate.body.find((b: { id: string }) => b.id === boardId);
    expect(updatedBoard.image.imageUrl).toBe(newImageUrl);

    await request(app)
      .delete(API_ENDPOINTS.boards.byId(boardId))
      .set('Cookie', [`token=${userToken}`])
      .expect(200);

    const finalGet = await request(app)
      .get(API_ENDPOINTS.boards.root)
      .set('Cookie', [`token=${userToken}`])
      .expect(200);

    const deletedBoard = finalGet.body.find((b: { id: string }) => b.id === boardId);
    expect(deletedBoard).toBeUndefined();
  });
});
