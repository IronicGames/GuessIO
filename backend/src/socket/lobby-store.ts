import { type LobbyState } from '@shared/types/lobby.types';

// In-memory map: lobby code → lobby state
// Lives in server process memory. Cleared on server restart — fine for v1.
export const lobbies = new Map<string, LobbyState>();

// Pending delete timers — keeps the lobby alive briefly after the last player
// disconnects, so page-navigation reconnects don't wipe the lobby.
const deleteTimers = new Map<string, ReturnType<typeof setTimeout>>();

const LOBBY_DELETE_GRACE_MS = 10_000; // 10 seconds

export function scheduleLobbyDelete(code: string): void {
  cancelLobbyDelete(code); // reset if one's already running
  deleteTimers.set(
    code,
    setTimeout(() => {
      lobbies.delete(code);
      deleteTimers.delete(code);
    }, LOBBY_DELETE_GRACE_MS),
  );
}

export function cancelLobbyDelete(code: string): void {
  const timer = deleteTimers.get(code);
  if (timer !== undefined) {
    clearTimeout(timer);
    deleteTimers.delete(code);
  }
}

export function generateCode(): string {
  // 6-character alphanumeric code, e.g. "K3F9AB"
  let code: string;
  do {
    code = Math.random().toString(36).substring(2, 8).toUpperCase();
  } while (lobbies.has(code));
  return code;
}
