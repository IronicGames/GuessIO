import { type ActiveGameState } from '@shared/types/game-state.types';
import { type BoardDto } from '@shared/types/board.types';

// In-memory map: gameId → active game state.
// Lives in server process memory. Cleared on server restart — fine for v1.
export const games = new Map<string, ActiveGameState>();

// Pending delete timers — keeps the game alive briefly after all players disconnect,
// allowing a reconnect without losing game state.
const deleteTimers = new Map<string, ReturnType<typeof setTimeout>>();

const skipTimers = new Map<string, ReturnType<typeof setTimeout>>();
const AUTO_SKIP_WAIT_MS = 10_000; // 10 seconds to reconnect before turn is skipped

// Longer grace period than lobbies — disconnect loss condition requires 5 consecutive
// skipped turns, so we need more time for the player to reconnect.
const GAME_DELETE_GRACE_MS = 30_000; // 30 seconds

export function scheduleGameDelete(gameId: string): void {
  cancelGameDelete(gameId);
  cancelAutoSkip(gameId);
  deleteTimers.set(
    gameId,
    setTimeout(() => {
      games.delete(gameId);
      deleteTimers.delete(gameId);
    }, GAME_DELETE_GRACE_MS),
  );
}

export function cancelGameDelete(gameId: string): void {
  const timer = deleteTimers.get(gameId);
  if (timer !== undefined) {
    clearTimeout(timer);
    deleteTimers.delete(gameId);
  }
}

export function storeGame(state: ActiveGameState): void {
  games.set(state.gameId, state);
}

// Randomly selects 24 character IDs from the eligible pool (excludes disabled characters).
// Caller guarantees eligible pool size >= 24 (enforced by lobby validation).
export function drawCharacters(board: BoardDto, disabledIds: string[]): string[] {
  const eligible = board.characters.filter((c) => !disabledIds.includes(c.id)).map((c) => c.id);

  // Fisher-Yates shuffle, then take first 24
  for (let i = eligible.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [eligible[i], eligible[j]] = [eligible[j], eligible[i]];
  }

  return eligible.slice(0, 24);
}

export function scheduleAutoSkip(gameId: string, callback: () => void): void {
  cancelAutoSkip(gameId); // reset if one's already running
  skipTimers.set(
    gameId,
    setTimeout(() => {
      skipTimers.delete(gameId);
      callback();
    }, AUTO_SKIP_WAIT_MS),
  );
}

export function cancelAutoSkip(gameId: string): void {
  const timer = skipTimers.get(gameId);
  if (timer !== undefined) {
    clearTimeout(timer);
    skipTimers.delete(gameId);
  }
}
