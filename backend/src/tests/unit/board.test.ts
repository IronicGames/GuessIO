import { describe, it, expect, beforeEach } from 'vitest';
import * as boardService from '@services/board.service';
import { NotFoundError } from '@errors/app-error';
import * as userService from '@services/user.service';
import { generateUniqueUserData } from '@tests/helpers/test-data';

describe('Board Service Unit Tests', () => {
  let userId: string;

  beforeEach(async () => {
    const userData = generateUniqueUserData();
    const user = await userService.createOrGetGoogleUser(
      userData.googleId,
      userData.name,
      userData.email,
      userData.profilePictureUrl
    );
    userId = user.id;
  });

  describe('createBoard', () => {
    it('should return board ID when creation succeeds', async () => {
      const boardId = await boardService.createBoard(userId, {
        name: `Successful Board ${crypto.randomUUID()}`,
        description: 'Test',
        isPublic: false,
      });

      expect(typeof boardId).toBe('string');
      expect(boardId).toBeTruthy();
    });

    it('should create board with only required fields', async () => {
      const boardId = await boardService.createBoard(userId, {
        name: `Minimal Board ${crypto.randomUUID()}`,
      });

      expect(typeof boardId).toBe('string');
      expect(boardId).toBeTruthy();
    });
  });

  describe('updateBoard', () => {
    it('should throw NotFoundError when board does not exist', async () => {
      await expect(
        boardService.updateBoard(crypto.randomUUID(), {
          name: 'Non-existent Board',
        })
      ).rejects.toThrow(NotFoundError);
    });

    it('should successfully update existing board', async () => {
      const boardId = await boardService.createBoard(userId, {
        name: `Board to Update ${crypto.randomUUID()}`,
      });

      const updatedId = await boardService.updateBoard(boardId, {
        name: `Updated Board ${crypto.randomUUID()}`,
        description: 'Updated description',
      });

      expect(updatedId).toBe(boardId);
    });
  });

  describe('deleteBoard', () => {
    it('should throw NotFoundError when board does not exist', async () => {
      await expect(
        boardService.deleteBoard(crypto.randomUUID())
      ).rejects.toThrow(NotFoundError);
    });

    it('should successfully delete existing board', async () => {
      const boardId = await boardService.createBoard(userId, {
        name: `Board to Delete ${crypto.randomUUID()}`,
      });

      const deletedId = await boardService.deleteBoard(boardId);
      expect(deletedId).toBe(boardId);

      await expect(boardService.deleteBoard(boardId)).rejects.toThrow(
        NotFoundError
      );
    });
  });

  describe('getBoardsForUser', () => {
    it('should return empty array when user has no boards', async () => {
      const newUserData = generateUniqueUserData();
      const newUser = await userService.createOrGetGoogleUser(
        newUserData.googleId,
        newUserData.name,
        newUserData.email,
        newUserData.profilePictureUrl
      );

      const boards = await boardService.getBoardsForUser(newUser.id);
      expect(Array.isArray(boards)).toBe(true);
      expect(boards).toHaveLength(0);
    });

    it('should return only boards belonging to the user', async () => {
      const board1Id = await boardService.createBoard(userId, {
        name: `User Board 1 ${crypto.randomUUID()}`,
      });
      const board2Id = await boardService.createBoard(userId, {
        name: `User Board 2 ${crypto.randomUUID()}`,
      });

      const otherUserData = generateUniqueUserData();
      const otherUser = await userService.createOrGetGoogleUser(
        otherUserData.googleId,
        otherUserData.name,
        otherUserData.email,
        otherUserData.profilePictureUrl
      );
      await boardService.createBoard(otherUser.id, {
        name: `Other User Board ${crypto.randomUUID()}`,
      });

      const boards = await boardService.getBoardsForUser(userId);
      const testBoards = boards.filter(
        (b) => b!.id === board1Id || b!.id === board2Id
      );

      expect(testBoards).toHaveLength(2);
      expect(testBoards.every((b) => b!.userId === userId)).toBe(true);
    });

    it('should include image and characters relations', async () => {
      const imageUrl = `https://example.com/image-${crypto.randomUUID()}.jpg`;
      const boardId = await boardService.createBoard(userId, {
        name: `Board with Relations ${crypto.randomUUID()}`,
        imageUrl,
      });

      const boards = await boardService.getBoardsForUser(userId);
      const board = boards.find((b) => b!.id === boardId);

      expect(board).toBeDefined();
      expect(board!.image).not.toBeNull();
      expect(board!.image!.imageUrl).toBe(imageUrl);
      expect(board!.characters).toBeDefined();
      expect(Array.isArray(board!.characters)).toBe(true);
    });
  });
});
