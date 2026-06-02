export const API_ENDPOINTS = {
    auth: {
        profile: '/auth/profile',
        logout: '/auth/logout',
        loginAsGuest: '/auth/loginAsGuest',
        updateName: '/auth/name',
    },
    boards: {
        root: '/boards',
        byId: (boardId) => `/boards/${boardId}`,
        export: (boardId) => `/boards/${boardId}/export`,
        import: () => `/boards/import`,
        importPreview: () => `/boards/import/preview`,
        bulk: () => `/boards/bulk`,
    },
    characters: {
        root: (boardId) => `/boards/${boardId}/characters`,
        byId: (boardId, characterId) => `/boards/${boardId}/characters/${characterId}`,
        bulk: (boardId) => `/boards/${boardId}/characters/bulk`,
    },
};
