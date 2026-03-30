import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '@backend/app';
import * as userService from '@services/user.service';
import { authService } from '@services/auth.service';
import { generateUniqueUserData } from '@tests/helpers/test-data';
import { type CreateCharacterDto } from '@shared/types/character.types';
import { API_ENDPOINTS } from '@shared/endpoints';

describe('Character Functional Tests', () => {
  let userToken: string;
  let boardId: string;

  beforeEach(async () => {
    const userData = generateUniqueUserData();
    const user = await userService.createOrGetGoogleUser(
      userData.googleId,
      userData.name,
      userData.email,
      userData.profilePictureUrl,
    );
    userToken = authService.generateToken({
      id: user.id,
      name: user.name,
      role: user.role,
      isGuest: false,
      profilePicture: user.profilePicture?.imageUrl,
    });

    const boardResponse = await request(app)
      .post(`/api${API_ENDPOINTS.boards.root}`)
      .set('Cookie', [`token=${userToken}`])
      .send({ name: `Test Board ${crypto.randomUUID()}` });

    boardId = boardResponse.body.id;
  });

  it('should complete full CRUD workflow: Create → Update → Delete', async () => {
    const characterName = `Test Character ${crypto.randomUUID()}`;
    const updatedName = `Updated Character ${crypto.randomUUID()}`;

    // 1. Create character
    const createResponse = await request(app)
      .post(`/api${API_ENDPOINTS.characters.root(boardId)}`)
      .set('Cookie', [`token=${userToken}`])
      .send({
        name: characterName,
        tags: ['tag1', 'tag2'],
      })
      .expect(200);

    const characterId = createResponse.body.characterId;
    expect(characterId).toBeDefined();

    // 2. Update character
    await request(app)
      .put(`/api${API_ENDPOINTS.characters.byId(boardId, characterId)}`)
      .set('Cookie', [`token=${userToken}`])
      .send({
        name: updatedName,
        tags: ['tag3'],
      })
      .expect(200);

    // 3. Delete character (only board — should delete character entirely)
    await request(app)
      .delete(`/api${API_ENDPOINTS.characters.byId(boardId, characterId)}`)
      .set('Cookie', [`token=${userToken}`])
      .expect(200);
  });

  it('should add an existing character to a second board then remove it from first board without deleting it', async () => {
    const board2Response = await request(app)
      .post(`/api${API_ENDPOINTS.boards.root}`)
      .set('Cookie', [`token=${userToken}`])
      .send({ name: `Second Board ${crypto.randomUUID()}` });
    const board2Id = board2Response.body.id;

    // Create character on board1
    const createResponse = await request(app)
      .post(`/api${API_ENDPOINTS.characters.root(boardId)}`)
      .set('Cookie', [`token=${userToken}`])
      .send({ name: `Shared Character ${crypto.randomUUID()}` })
      .expect(200);

    const characterId = createResponse.body.characterId;

    // Add existing character to board2
    await request(app)
      .post(`/api${API_ENDPOINTS.characters.root(board2Id)}`)
      .set('Cookie', [`token=${userToken}`])
      .send({ characterId })
      .expect(200);

    // Remove from board1 — character should still exist (still on board2)
    await request(app)
      .delete(`/api${API_ENDPOINTS.characters.byId(boardId, characterId)}`)
      .set('Cookie', [`token=${userToken}`])
      .expect(200);

    // Verify character still exists by updating it successfully
    await request(app)
      .put(`/api${API_ENDPOINTS.characters.byId(board2Id, characterId)}`)
      .set('Cookie', [`token=${userToken}`])
      .send({ name: `Still Exists ${crypto.randomUUID()}` })
      .expect(200);
  });

  it('should delete character entirely when removed from its last board', async () => {
    const createResponse = await request(app)
      .post(`/api${API_ENDPOINTS.characters.root(boardId)}`)
      .set('Cookie', [`token=${userToken}`])
      .send({ name: `Doomed Character ${crypto.randomUUID()}` })
      .expect(200);

    const characterId = createResponse.body.characterId;

    const deleteResponse = await request(app)
      .delete(`/api${API_ENDPOINTS.characters.byId(boardId, characterId)}`)
      .set('Cookie', [`token=${userToken}`])
      .expect(200);

    expect(deleteResponse.body.characterId).toBe(characterId);

    // Verify gone — update should 404
    await request(app)
      .put(`/api${API_ENDPOINTS.characters.byId(boardId, characterId)}`)
      .set('Cookie', [`token=${userToken}`])
      .send({ name: 'Should not work' })
      .expect(404);
  });

  it('should create multiple characters on a board', async () => {
    const names = ['Alpha', 'Bravo', 'Charlie'];

    const ids = await Promise.all(
      names.map((name) =>
        request(app)
          .post(`/api${API_ENDPOINTS.characters.root(boardId)}`)
          .set('Cookie', [`token=${userToken}`])
          .send({
            name: `${name} ${crypto.randomUUID()}`,
          } as CreateCharacterDto)
          .expect(200)
          .then((res) => res.body.characterId),
      ),
    );

    expect(ids).toHaveLength(3);
    ids.forEach((id) => expect(id).toBeDefined());
  });
});
