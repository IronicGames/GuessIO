import { describe, it, expect, beforeEach } from 'vitest';
import * as boardService from '@services/board.service';
import { NotFoundError } from '@errors/app-error';
import * as userService from '@services/user.service';
import { generateUniqueUserData } from '@tests/helpers/test-data';

describe('Board Service Unit Tests', () => {
  let userId: string;

  beforeEach(async () => {
    // Create a user for testing
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
      const uniqueName = `Successful Board ${crypto.randomUUID()}`;
      const boardId = await boardService.createBoard({
        userId,
        name: uniqueName,
        description: 'Test',
        isPublic: false,
      });

      expect(typeof boardId).toBe('string');
      expect(boardId).toBeTruthy();
    });

    it('should create board with only required fields', async () => {
      const uniqueName = `Minimal Board ${crypto.randomUUID()}`;
      const boardId = await boardService.createBoard({
        userId,
        name: uniqueName,
      });

      expect(typeof boardId).toBe('string');
      expect(boardId).toBeTruthy();
    });
  });

  describe('updateBoard', () => {
    it('should throw NotFoundError when board does not exist', async () => {
      const fakeId = crypto.randomUUID();

      await expect(
        boardService.updateBoard(fakeId, {
          name: 'Non-existent Board',
        })
      ).rejects.toThrow(NotFoundError);
    });

    it('should successfully update existing board', async () => {
      // First create a board
      const createName = `Board to Update ${crypto.randomUUID()}`;
      const boardId = await boardService.createBoard({
        userId,
        name: createName,
      });

      // Then update it
      const updateName = `Updated Board ${crypto.randomUUID()}`;
      const updatedId = await boardService.updateBoard(boardId, {
        name: updateName,
        description: 'Updated description',
      });

      expect(updatedId).toBe(boardId);
    });
  });

  describe('deleteBoard', () => {
    it('should throw NotFoundError when board does not exist', async () => {
      const fakeId = crypto.randomUUID();

      await expect(boardService.deleteBoard(fakeId)).rejects.toThrow(
        NotFoundError
      );
    });

    it('should successfully delete existing board', async () => {
      // First create a board
      const boardName = `Board to Delete ${crypto.randomUUID()}`;
      const boardId = await boardService.createBoard({
        userId,
        name: boardName,
      });

      // Then delete it
      const deletedId = await boardService.deleteBoard(boardId);

      expect(deletedId).toBe(boardId);

      // Verify it's gone
      await expect(boardService.deleteBoard(boardId)).rejects.toThrow(
        NotFoundError
      );
    });
  });

  describe('getBoardsForUser', () => {
    it('should return empty array when user has no boards', async () => {
      // Create a new user who has no boards
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
      const board1Name = `User Board 1 ${crypto.randomUUID()}`;
      const board2Name = `User Board 2 ${crypto.randomUUID()}`;

      // Create boards for this user
      const board1Id = await boardService.createBoard({
        userId,
        name: board1Name,
      });
      const board2Id = await boardService.createBoard({
        userId,
        name: board2Name,
      });

      // Create another user and their board
      const otherUserData = generateUniqueUserData();
      const otherUser = await userService.createOrGetGoogleUser(
        otherUserData.googleId,
        otherUserData.name,
        otherUserData.email,
        otherUserData.profilePictureUrl
      );
      await boardService.createBoard({
        userId: otherUser.id,
        name: `Other User Board ${crypto.randomUUID()}`,
      });

      // Get boards for original user
      const boards = await boardService.getBoardsForUser(userId);

      // Filter to only boards created in this test
      const testBoards = boards.filter(
        (b) => b!.id === board1Id || b!.id === board2Id
      );

      expect(testBoards).toHaveLength(2);
      expect(testBoards.every((b) => b!.userId === userId)).toBe(true);
    });

    it('should include image and characterInstances relations', async () => {
      const imageUrl = `https://example.com/image-${crypto.randomUUID()}.jpg`;
      const boardName = `Board with Relations ${crypto.randomUUID()}`;

      // Create board with image
      const boardId = await boardService.createBoard({
        userId,
        name: boardName,
        imageUrl,
      });

      // Get boards
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
