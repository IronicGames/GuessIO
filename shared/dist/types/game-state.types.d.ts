import { type UserProfile } from './user.types';
import { type BoardDto } from './board.types';
import { type LobbySettings } from './lobby.types';
import { type ChatMessage } from './lobby.types';
import { type GameResult, type GameResultReason, type GameLogEntryDto } from './game.types';
export declare enum GamePhase {
    CHARACTER_SELECTION = "CHARACTER_SELECTION",// both players secretly pick their character
    DECIDE = "DECIDE",// asker chooses Ask or Guess
    SUBMIT = "SUBMIT",// asker submits the action
    RESOLVE = "RESOLVE",// action resolving — skipped in Casual (Tag/Managed only)
    END_TURN = "END_TURN",// after resolve, asker crosses off before ending turn
    GAME_OVER = "GAME_OVER"
}
export declare enum TurnAction {
    ASK = "ASK",
    GUESS = "GUESS"
}
export interface GamePlayerState {
    user: UserProfile;
    socketId: string;
    isConnected: boolean;
    isPlayer1: boolean;
    livesRemaining: number;
    hasChosen: boolean;
    timesDisconnected: number;
    isHost: boolean;
}
export interface ActiveGameState {
    gameId: string;
    lobbyCode: string;
    phase: GamePhase;
    settings: LobbySettings;
    board: BoardDto;
    drawnCharacterIds: string[];
    players: GamePlayerState[];
    currentTurnIsPlayer1: boolean;
    turnNumber: number;
    currentAction: TurnAction | null;
    chat: ChatMessage[];
    turnTimerExpiresAt: string | null;
    gameTimerExpiresAt: string | null;
    result: GameResult | null;
    resultReason: GameResultReason | null;
    winnerIsPlayer1: boolean | null;
    log: GameLogEntryDto[];
}
//# sourceMappingURL=game-state.types.d.ts.map