import { type UserProfile } from './user.types';
import { type BoardDto } from './board.types';
import { type LobbySettings } from './lobby.types';
import { type ChatMessage } from './lobby.types';
import { type GameResult, type GameResultReason } from './game.types';

// ─── Phase & action enums ─────────────────────────────────────────────────────

export enum GamePhase {
  CHARACTER_SELECTION = 'CHARACTER_SELECTION', // both players secretly pick their character
  DECIDE = 'DECIDE', // asker chooses Ask or Guess
  SUBMIT = 'SUBMIT', // asker submits the action
  RESOLVE = 'RESOLVE', // action resolving — skipped in Casual (Tag/Managed only)
  END_TURN = 'END_TURN', // after resolve, asker crosses off before ending turn
  GAME_OVER = 'GAME_OVER', // terminal state
}

export enum TurnAction {
  ASK = 'ASK',
  GUESS = 'GUESS',
}

// ─── Per-player runtime state ─────────────────────────────────────────────────

export interface GamePlayerState {
  user: UserProfile;
  socketId: string;
  isConnected: boolean;
  isPlayer1: boolean;
  livesRemaining: number;
  hasChosen: boolean; // true once the player has locked in their secret character
  timesDisconnected: number; // for tracking disconnect loss condition (5 consecutive skipped turns)
  isHost: boolean; // for display purposes only — host is always player 1 and goes first
}

// ─── Full active game state ───────────────────────────────────────────────────
// Broadcast to both players. NEVER include chosen character IDs here —
// those are stored server-side only and sent personally via game:your-character.

export interface ActiveGameState {
  gameId: string; // = DB GameInstance.id
  lobbyCode: string;
  phase: GamePhase;
  settings: LobbySettings; // snapshot from lobby at game start
  board: BoardDto; // confirmed board (full DTO with characters)
  drawnCharacterIds: string[]; // the 24 randomly selected for this game
  players: GamePlayerState[];
  currentTurnIsPlayer1: boolean;
  turnNumber: number;
  currentAction: TurnAction | null; // set in DECIDE phase, cleared on turn advance
  chat: ChatMessage[]; // seeded from lobby chat on game creation

  // Result fields — null while game is in progress, set on GAME_OVER
  result: GameResult | null;
  resultReason: GameResultReason | null;
  winnerIsPlayer1: boolean | null;
}
