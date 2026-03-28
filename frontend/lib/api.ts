/* global RequestInit */
import { type UserProfile } from '@shared/types/user.types';
import { type BoardDto, type CreateBoardDto, type UpdateBoardDto } from '@shared/types/board.types';
import { type CreateCharacterDto, type UpdateCharacterDto } from '@shared/types/character.types';
import { API_ENDPOINTS, API_URL } from '@shared/endpoints';
import { ApiError } from '@lib/errors';

async function fetchWithAuth(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers: {
      ...options.headers,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
    if (response.status === 401) {
      throw new ApiError(401, 'Session expired', errorData);
    }
    throw new ApiError(response.status, errorData.error || 'Request failed', errorData);
  }
  return response;
}

export const api = {
  auth: {
    getUserProfile: async (): Promise<UserProfile> => {
      const response = await fetchWithAuth(API_ENDPOINTS.auth.profile);
      return response.json();
    },
    loginAsGuest: async (name?: string): Promise<UserProfile> => {
      const response = await fetchWithAuth(API_ENDPOINTS.auth.loginAsGuest, {
        method: 'POST',
        body: JSON.stringify({ name: name }),
      });
      return response.json();
    },
    logout: async (): Promise<UserProfile> => {
      const response = await fetchWithAuth(API_ENDPOINTS.auth.logout, {
        method: 'POST',
      });
      return response.json();
    },
  },
  boards: {
    getBoardsForUser: async (): Promise<BoardDto[]> => {
      const response = await fetchWithAuth(API_ENDPOINTS.boards.root);
      return response.json();
    },
    getBoard: async (boardId: string): Promise<BoardDto> => {
      const response = await fetchWithAuth(API_ENDPOINTS.boards.byId(boardId));
      return response.json();
    },
    createBoard: async (createBoardDto: CreateBoardDto): Promise<{ id: string }> => {
      const response = await fetchWithAuth(API_ENDPOINTS.boards.root, {
        method: 'POST',
        body: JSON.stringify(createBoardDto),
      });
      return response.json();
    },
    updateBoard: async (boardId: string, dto: UpdateBoardDto): Promise<{ id: string }> => {
      const response = await fetchWithAuth(API_ENDPOINTS.boards.byId(boardId), {
        method: 'PUT',
        body: JSON.stringify(dto),
      });
      return response.json();
    },
    deleteBoard: async (boardId: string): Promise<{ id: string }> => {
      const response = await fetchWithAuth(API_ENDPOINTS.boards.byId(boardId), {
        method: 'DELETE',
      });
      return response.json();
    },
  },
  characters: {
    createCharacter: async (boardId: string, dto: CreateCharacterDto) => {
      const response = await fetchWithAuth(API_ENDPOINTS.characters.root(boardId), {
        method: 'POST',
        body: JSON.stringify(dto),
      });
      return response.json();
    },
    updateCharacter: async (boardId: string, characterId: string, dto: UpdateCharacterDto) => {
      const response = await fetchWithAuth(API_ENDPOINTS.characters.byId(boardId, characterId), {
        method: 'PUT',
        body: JSON.stringify(dto),
      });
      return response.json();
    },
    deleteCharacter: async (boardId: string, characterId: string) => {
      const response = await fetchWithAuth(API_ENDPOINTS.characters.byId(boardId, characterId), {
        method: 'DELETE',
      });
      return response.json();
    },
  },
};
