export declare const API_ENDPOINTS: {
    readonly auth: {
        readonly profile: "/auth/profile";
        readonly logout: "/auth/logout";
        readonly loginAsGuest: "/auth/loginAsGuest";
        readonly updateName: "/auth/name";
    };
    readonly boards: {
        readonly root: "/boards";
        readonly byId: (boardId: string) => string;
        readonly export: (boardId: string) => string;
        readonly import: () => string;
        readonly importPreview: () => string;
        readonly bulk: () => string;
    };
    readonly characters: {
        readonly root: (boardId: string) => string;
        readonly byId: (boardId: string, characterId: string) => string;
        readonly bulk: (boardId: string) => string;
    };
};
//# sourceMappingURL=endpoints.d.ts.map