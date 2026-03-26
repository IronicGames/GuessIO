import { describe, it, expect, beforeEach } from 'vitest';
import * as characterService from '@services/character.service';
import * as boardService from '@services/board.service';
import * as userService from '@services/user.service';
import { NotFoundError } from '@errors/app-error';
import { generateUniqueUserData } from '@tests/helpers/test-data';
import {
  CreateCharacterDto,
  UpdateCharacterDto,
} from '@shared/types/character.types';

describe('Character Service Unit Tests', () => {
  let userId: string;
  let boardId: string;

  beforeEach(async () => {
    const userData = generateUniqueUserData();
    const user = await userService.createOrGetGoogleUser(
      userData.googleId,
      userData.name,
      userData.email,
      userData.profilePictureUrl
    );
    userId = user.id;
    boardId = await boardService.createBoard(userId, {
      name: `Test Board ${crypto.randomUUID()}`,
    });
  });

  describe('createCharacter', () => {
    it('should create a new character and return characterId and boardId', async () => {
      const result = await characterService.createCharacter(boardId, {
        name: `New Character ${crypto.randomUUID()}`,
        description: 'Test',
        tags: ['tag1'],
      } as CreateCharacterDto);

      expect(result.characterId).toBeDefined();
      expect(result.boardId).toBe(boardId);
    });

    it('should create a character with only a name', async () => {
      const result = await characterService.createCharacter(boardId, {
        name: `Minimal Character ${crypto.randomUUID()}`,
      } as CreateCharacterDto);

      expect(result.characterId).toBeDefined();
    });

    it('should add an existing character to a board', async () => {
      const board2Id = await boardService.createBoard(userId, {
        name: `Second Board ${crypto.randomUUID()}`,
      });

      const { characterId } = await characterService.createCharacter(boardId, {
        name: `Shared Character ${crypto.randomUUID()}`,
      } as CreateCharacterDto);

      const result = await characterService.createCharacter(board2Id, {
        characterId,
      });

      expect(result.characterId).toBe(characterId);
      expect(result.boardId).toBe(board2Id);
    });
  });

  describe('updateCharacter', () => {
    it('should throw NotFoundError when character does not exist', async () => {
      await expect(
        characterService.updateCharacter(crypto.randomUUID(), {
          name: 'Non-existent Character',
        } as UpdateCharacterDto)
      ).rejects.toThrow(NotFoundError);
    });

    it('should successfully update an existing character', async () => {
      const { characterId } = await characterService.createCharacter(boardId, {
        name: `Character to Update ${crypto.randomUUID()}`,
      } as CreateCharacterDto);

      const result = await characterService.updateCharacter(characterId, {
        name: `Updated Name ${crypto.randomUUID()}`,
        description: 'Updated description',
        tags: ['newTag'],
      });

      expect(result.characterId).toBe(characterId);
    });
  });

  describe('deleteCharacter', () => {
    it('should delete character entirely when it only belongs to one board', async () => {
      const { characterId } = await characterService.createCharacter(boardId, {
        name: `Character to Delete ${crypto.randomUUID()}`,
      } as CreateCharacterDto);

      const result = await characterService.deleteCharacter(
        characterId,
        boardId
      );
      expect(result.characterId).toBe(characterId);

      await expect(
        characterService.updateCharacter(characterId, {
          name: 'Should fail',
        } as UpdateCharacterDto)
      ).rejects.toThrow(NotFoundError);
    });

    it('should disconnect character from board when it belongs to multiple boards', async () => {
      const board2Id = await boardService.createBoard(userId, {
        name: `Second Board ${crypto.randomUUID()}`,
      });

      const { characterId } = await characterService.createCharacter(boardId, {
        name: `Shared Character ${crypto.randomUUID()}`,
      } as CreateCharacterDto);

      await characterService.createCharacter(board2Id, { characterId });

      const result = await characterService.deleteCharacter(
        characterId,
        boardId
      );
      expect(result.characterId).toBe(characterId);

      await expect(
        characterService.updateCharacter(characterId, {
          name: `Still alive ${crypto.randomUUID()}`,
        } as UpdateCharacterDto)
      ).resolves.toBeDefined();
    });

    it('should throw NotFoundError when character does not exist', async () => {
      await expect(
        characterService.deleteCharacter(crypto.randomUUID(), boardId)
      ).rejects.toThrow(NotFoundError);
    });
  });
});
