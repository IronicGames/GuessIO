import { type UserProfile } from './user.types';
import { type BoardDto } from './board.types';

export enum LobbyPhase {
  BOARD_SELECTION = 'BOARD_SELECTION',
  CHARACTER_CONFIG = 'CHARACTER_CONFIG',
  WAITING_FOR_READY = 'WAITING_FOR_READY',
}

export enum GameMode {
  CASUAL = 'CASUAL',
  TAG = 'TAG',
}

export enum TurnTimer {
  OFF = 'OFF',
  THIRTY_SECONDS = '30s',
  ONE_MINUTE = '1m',
  THREE_MINUTES = '3m',
}

export enum Lives {
  ONE = '1',
  THREE = '3',
  INFINITE = 'INF',
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

export function parseTurnTimer(t: TurnTimer | null): number | null {
  if (t === TurnTimer.THIRTY_SECONDS) return 30 * 1000;
  if (t === TurnTimer.ONE_MINUTE) return 60 * 1000;
  if (t === TurnTimer.THREE_MINUTES) return 180 * 1000;
  return null; // TurnTimer.OFF
}

export function parseLives(l: Lives): number {
  if (l === Lives.ONE) return 1;
  if (l === Lives.THREE) return 3;
  return 0; // Lives.INFINITE — stored as 0 in DB convention
}
