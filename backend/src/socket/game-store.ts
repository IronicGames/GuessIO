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

const gameTimers = new Map<string, NodeJS.Timeout>();
const GAME_MAX_DURATION_MS = 1800000; // 30 minutes — if a game hits this, it will be automatically ended in a draw to prevent stale games from lingering indefinitely. Note that this is not a hard limit — if both players are AFK for the entire game, the timer won't start until the game actually starts, so the total time from creation to deletion could be up to 60 minutes in that case. This is a tradeoff to avoid accidentally deleting games that haven't actually started yet but have been waiting for players to join.
const turnTimers = new Map<string, NodeJS.Timeout>();

export function scheduleGameDelete(gameId: string): void {
  cancelGameDelete(gameId);
  cancelAutoSkip(gameId);
  cancelGameTimer(gameId);
  cancelTurnTimer(gameId);
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
      cancelTurnTimer(gameId);
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

export function scheduleGameTimer(gameId: string, onExpire: () => void): void {
  cancelGameTimer(gameId); // reset if one's already running
  const game = games.get(gameId);
  if (game) {
    game.gameTimerExpiresAt = new Date(Date.now() + GAME_MAX_DURATION_MS).toISOString(); // 30 minutes from now
    storeGame(game);
  }

  gameTimers.set(
    gameId,
    setTimeout(() => {
      gameTimers.delete(gameId);
      onExpire();
    }, GAME_MAX_DURATION_MS),
  ); // 30 minutes
}

export function cancelGameTimer(gameId: string): void {
  const timer = gameTimers.get(gameId);
  if (timer !== undefined) {
    clearTimeout(timer);
    const game = games.get(gameId);
    if (game) {
      game.gameTimerExpiresAt = null;
      storeGame(game);
    }
    gameTimers.delete(gameId);
  }
}

export function scheduleTurnTimer(
  gameId: string,
  durationMs: number | null,
  onExpire: () => void,
): void {
  if (durationMs === null) return; // no timer for this game
  cancelTurnTimer(gameId);
  const game = games.get(gameId);
  if (game) {
    game.turnTimerExpiresAt = new Date(Date.now() + durationMs).toISOString();
    storeGame(game);
  }

  turnTimers.set(
    gameId,
    setTimeout(() => {
      turnTimers.delete(gameId);
      onExpire();
    }, durationMs),
  );
}

export function cancelTurnTimer(gameId: string): void {
  const timer = turnTimers.get(gameId);
  if (timer !== undefined) {
    clearTimeout(timer);
    const game = games.get(gameId);
    if (game) {
      game.turnTimerExpiresAt = null;
      storeGame(game);
    }
    turnTimers.delete(gameId);
  }
}
