/* global RequestInit */
import { UserProfile } from '@shared/types/user.types';
import {
  BoardDto,
  CreateBoardDto,
  UpdateBoardDto,
} from '@shared/types/board.types';
import {
  CreateCharacterDto,
  UpdateCharacterDto,
} from '@shared/types/character.types';
import { API_ENDPOINTS, API_URL } from '@shared/endpoints';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchWithAuth(
  endpoint: string,
  options: RequestInit = {},
  customToken?: string
): Promise<Response> {
  const token = customToken || localStorage.getItem('authToken');
  if (!token) {
    window.location.href = '/';
    throw new ApiError(401, 'Not authenticated');
  }
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ error: 'Request failed' }));
    if (response.status === 401) {
      if (!customToken) {
        localStorage.removeItem('authToken');
      }
      window.location.href = '/?error=session_expired';
      throw new ApiError(401, 'Session expired', errorData);
    }
    throw new ApiError(
      response.status,
      errorData.error || 'Request failed',
      errorData
    );
  }
  return response;
}

export const api = {
  auth: {
    getUserProfile: async (token?: string): Promise<UserProfile> => {
      const response = await fetchWithAuth(
        API_ENDPOINTS.auth.profile,
        {},
        token
      );
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
    createBoard: async (
      createBoardDto: CreateBoardDto
    ): Promise<{ id: string }> => {
      const response = await fetchWithAuth(API_ENDPOINTS.boards.root, {
        method: 'POST',
        body: JSON.stringify(createBoardDto),
      });
      return response.json();
    },
    updateBoard: async (
      boardId: string,
      dto: UpdateBoardDto
    ): Promise<{ id: string }> => {
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
      const response = await fetchWithAuth(
        API_ENDPOINTS.characters.root(boardId),
        {
          method: 'POST',
          body: JSON.stringify(dto),
        }
      );
      return response.json();
    },
    updateCharacter: async (
      boardId: string,
      characterId: string,
      dto: UpdateCharacterDto
    ) => {
      const response = await fetchWithAuth(
        API_ENDPOINTS.characters.byId(boardId, characterId),
        {
          method: 'PUT',
          body: JSON.stringify(dto),
        }
      );
      return response.json();
    },
    deleteCharacter: async (boardId: string, characterId: string) => {
      const response = await fetchWithAuth(
        API_ENDPOINTS.characters.byId(boardId, characterId),
        {
          method: 'DELETE',
        }
      );
      return response.json();
    },
  },
};
