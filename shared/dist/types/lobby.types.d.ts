import { type UserProfile } from './user.types';
import { type BoardDto } from './board.types';
export declare enum LobbyPhase {
    BOARD_SELECTION = "BOARD_SELECTION",
    CHARACTER_CONFIG = "CHARACTER_CONFIG",
    WAITING_FOR_READY = "WAITING_FOR_READY"
}
export declare enum GameMode {
    CASUAL = "CASUAL",
    TAG = "TAG"
}
export declare enum TurnTimer {
    OFF = "OFF",
    THIRTY_SECONDS = "30s",
    ONE_MINUTE = "1m",
    THREE_MINUTES = "3m"
}
export declare enum Lives {
    ONE = "1",
    THREE = "3",
    INFINITE = "INF"
}
export interface LobbySettings {
    mode: GameMode;
    turnTimer: TurnTimer | null;
    lives: Lives;
}
export interface LobbyPlayer {
    user: UserProfile;
    socketId: string;
    isHost: boolean;
    isReady: boolean;
    isConnected: boolean;
}
export interface ChatMessage {
    id: string;
    senderName: string;
    text: string;
    timestamp: number;
}
export interface LobbyState {
    code: string;
    phase: LobbyPhase;
    settings: LobbySettings;
    players: LobbyPlayer[];
    selectedBoardId: string | null;
    board: BoardDto | null;
    disabledCharacterIds: string[];
    chat: ChatMessage[];
    gameStarting: boolean;
}
export declare function parseTurnTimer(t: TurnTimer | null): number | null;
export declare function parseLives(l: Lives): number;
//# sourceMappingURL=lobby.types.d.ts.map