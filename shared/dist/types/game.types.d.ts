import { type GameMode } from './lobby.types';
export declare enum GameResult {
    WIN = "WIN",
    DRAW = "DRAW",
    ABANDONED = "ABANDONED"
}
export declare enum GameResultReason {
    CORRECT_GUESS = "CORRECT_GUESS",
    LIVES_EXHAUSTED = "LIVES_EXHAUSTED",
    TIMEOUT = "TIMEOUT",
    DISCONNECT = "DISCONNECT",
    MUTUAL_SKIP = "MUTUAL_SKIP"
}
export declare enum LogActionType {
    ASK = "ASK",
    GUESS = "GUESS",
    SKIP = "SKIP"
}
export interface GameLogEntryDto {
    id: string;
    createdAt: string;
    gameInstanceId: string;
    turnNumber: number;
    playerIsPlayer1: boolean;
    actionType: LogActionType;
    subject: string | null;
    result: string | null;
}
export interface GameInstanceSummaryDto {
    id: string;
    createdAt: string;
    boardId: string | null;
    boardName: string;
    mode: GameMode;
    turnTimer: number | null;
    lives: number;
    isPublic: boolean;
    player1UserId: string | null;
    player1Name: string;
    player2UserId: string | null;
    player2Name: string;
    result: GameResult;
    resultReason: GameResultReason;
    winnerIsPlayer1: boolean | null;
}
export interface GameInstanceDetailDto extends GameInstanceSummaryDto {
    log: GameLogEntryDto[];
}
//# sourceMappingURL=game.types.d.ts.map