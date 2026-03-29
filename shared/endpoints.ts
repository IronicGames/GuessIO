export const API_ENDPOINTS = {
  auth: {
    profile: '/auth/profile',
    logout: '/auth/logout',
    loginAsGuest: '/auth/loginAsGuest',
  },
  boards: {
    root: '/boards',
    byId: (boardId: string) => `/boards/${boardId}`,
  },
  characters: {
    root: (boardId: string) => `/boards/${boardId}/characters`,
    byId: (boardId: string, characterId: string) => `/boards/${boardId}/characters/${characterId}`,
  },
} as const;
