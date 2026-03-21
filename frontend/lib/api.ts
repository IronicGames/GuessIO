/* global RequestInit */
import { UserProfile } from '@shared/user.types';
import { BoardDto, CreateBoardDto, UpdateBoardDto } from '@shared/board.types';

const API_URL = 'http://localhost:8080';

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
      // Only clear localStorage if we're using the stored token (not custom)
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
      const response = await fetchWithAuth('/api/auth/profile', {}, token);
      return response.json();
    },
  },

  boards: {
    getBoardsForUser: async (): Promise<BoardDto[]> => {
      const response = await fetchWithAuth('/api/board');
      return response.json();
    },
    createBoard: async (createBoardDto: CreateBoardDto): Promise<string> => {
      const response = await fetchWithAuth('/api/board', {
        method: 'POST',
        body: JSON.stringify(createBoardDto),
      });
      return response.json();
    },
    updateBoard: async (
      id: string,
      updateBoardDto: UpdateBoardDto
    ): Promise<string> => {
      const response = await fetchWithAuth(`/api/board/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updateBoardDto),
      });
      return response.json();
    },
    deleteBoard: async (id: string): Promise<string> => {
      const response = await fetchWithAuth(`/api/board/${id}`, {
        method: 'DELETE',
      });
      return response.json();
    },
  },
};
