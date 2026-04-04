export const API_ENDPOINTS = {
  auth: {
    profile: '/auth/profile',
    logout: '/auth/logout',
    loginAsGuest: '/auth/loginAsGuest',
    updateName: '/auth/name',
  },
  boards: {
    root: '/boards',
    byId: (boardId: string) => `/boards/${boardId}`,
    export: (boardId: string) => `/boards/${boardId}/export`,
  },
  characters: {
    root: (boardId: string) => `/boards/${boardId}/characters`,
    byId: (boardId: string, characterId: string) => `/boards/${boardId}/characters/${characterId}`,
  },
} as const;
