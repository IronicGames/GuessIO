export const API_ENDPOINTS = {
  auth: {
    profile: '/api/auth/profile',
    logout: '/api/auth/logout',
    loginAsGuest: '/api/auth/loginAsGuest',
  },
  boards: {
    root: '/api/boards',
    byId: (boardId: string) => `/api/boards/${boardId}`,
  },
  characters: {
    root: (boardId: string) => `/api/boards/${boardId}/characters`,
    byId: (boardId: string, characterId: string) =>
      `/api/boards/${boardId}/characters/${characterId}`,
  },
} as const;
export const API_URL = 'http://localhost:8080';
