import type { Server, Socket } from 'socket.io';
import type { UserProfile } from '@shared/types/user.types';
import { lobbies, generateCode, scheduleLobbyDelete, cancelLobbyDelete } from './lobby-store';
import { GameMode, Lives, LobbyPhase, type LobbyState, TurnTimer } from '@shared/types/lobby.types';
import { getBoard } from '@services/board.service';

export function registerLobbyHandlers(io: Server, socket: Socket) {
  const user = socket.data.user as UserProfile;

  // ── CREATE LOBBY ────────────────────────────────────────────────────
  // Emitted by /lobby page (app/lobby/page.tsx) before redirecting to /lobby/[code]
  socket.on('lobby:create', () => {
    const code = generateCode();
    lobbies.set(code, {
      code,
      players: [{ user, socketId: socket.id, isHost: true, isReady: false, isConnected: true }],
      settings: { mode: GameMode.CASUAL, turnTimer: TurnTimer.OFF, lives: Lives.THREE },
      phase: LobbyPhase.BOARD_SELECTION,
      selectedBoardId: null,
      board: null,
      disabledCharacterIds: [],
      chat: [],
      gameStarting: false,
    });
    socket.join(code);
    socket.emit('lobby:state', lobbies.get(code));
    // Client handles 'lobby:state' by navigating to /lobby/[code]
  });

  // ── JOIN LOBBY ──────────────────────────────────────────────────────
  // Emitted by useLobby hook on mount
  socket.on('lobby:join', ({ code }: { code: string }) => {
    const lobby = lobbies.get(code);
    if (!lobby) return socket.emit('lobby:error', { message: 'Lobby not found or has expired' });
    if (lobby.players.length >= 2) return socket.emit('lobby:error', { message: 'Lobby is full' });

    cancelLobbyDelete(code); // player reconnected — cancel any pending cleanup

    const player = lobby.players.find((p) => p.user.id === user.id);
    if (player) {
      // Already in lobby (e.g. page refresh) — just send current state
      socket.join(code);
      player.socketId = socket.id;
      player.isConnected = true;
      return socket.emit('lobby:state', lobby);
    }

    lobby.players.push({
      user,
      socketId: socket.id,
      isHost: lobby.players.length === 0,
      isReady: false,
      isConnected: true,
    });
    socket.join(code);
    socket.emit('lobby:state', lobby);
    socket.to(code).emit('lobby:player-joined', lobby.players); // host gets updated player list
  });

  // ── SETTINGS CHANGE ─────────────────────────────────────────────────
  socket.on(
    'lobby:settings-change',
    ({ code, patch }: { code: string; patch: Partial<LobbyState['settings']> }) => {
      const lobby = lobbies.get(code);
      if (!lobby || !isHost(lobby, user.id)) return;
      lobby.settings = { ...lobby.settings, ...patch };
      io.to(code).emit('lobby:settings-updated', lobby.settings);
    },
  );

  // ── BOARD CONFIRM ──────────────────────────────────────────────────
  socket.on('lobby:board-confirm', async ({ code, boardId }: { code: string; boardId: string }) => {
    const lobby = lobbies.get(code);
    if (!lobby || !isHost(lobby, user.id)) return;

    const board = await getBoard(user.id, boardId, true);
    if (!board) return socket.emit('lobby:error', { message: 'Board not found' });

    lobby.selectedBoardId = boardId;
    lobby.board = board;
    lobby.phase = LobbyPhase.CHARACTER_CONFIG;

    // Broadcast to both players so joiner's panel switches from spinner to character grid
    io.to(code).emit('lobby:board-confirmed', {
      boardId,
      board: board,
    });
  });

  // ── BOARD UNDO ──────────────────────────────────────────────────────
  // Allows host to go back from character-config to board-selection
  socket.on('lobby:board-undo', ({ code }: { code: string }) => {
    const lobby = lobbies.get(code);
    if (!lobby || !isHost(lobby, user.id)) return;
    lobby.phase = LobbyPhase.BOARD_SELECTION;
    lobby.selectedBoardId = null;
    lobby.board = null;
    lobby.disabledCharacterIds = [];
    io.to(code).emit('lobby:board-undone');
  });

  // ── CHARACTER TOGGLE ─────────────────────────────────────────────────
  socket.on(
    'lobby:char-toggle',
    ({ code, characterId, enabled }: { code: string; characterId: string; enabled: boolean }) => {
      const lobby = lobbies.get(code);
      if (!lobby || !isHost(lobby, user.id)) return;
      if (enabled) {
        lobby.disabledCharacterIds = lobby.disabledCharacterIds.filter((id) => id !== characterId);
      } else if (!lobby.disabledCharacterIds.includes(characterId)) {
        lobby.disabledCharacterIds.push(characterId);
      }
      // Broadcast so joiner's read-only character grid stays in sync
      io.to(code).emit('lobby:char-toggled', { characterId, enabled });
    },
  );

  // ── CHARACTERS CONFIRMED ─────────────────────────────────────────────
  // Host confirms their character selection — both players advance to ready phase
  socket.on('lobby:chars-confirmed', ({ code }: { code: string }) => {
    const lobby = lobbies.get(code);
    if (!lobby || !isHost(lobby, user.id)) return;
    lobby.phase = LobbyPhase.WAITING_FOR_READY;
    io.to(code).emit('lobby:chars-confirmed');
  });

  // ── READY ────────────────────────────────────────────────────────────
  socket.on('lobby:ready', ({ code }: { code: string }) => {
    const lobby = lobbies.get(code);
    if (!lobby) return;
    const player = lobby.players.find((p) => p.user.id === user.id);
    if (!player) return;
    player.isReady = true;
    io.to(code).emit('lobby:player-ready', { playerId: user.id, isReady: true });

    // When both players are ready, trigger the countdown on both clients
    if (
      lobby.players.length === 2 &&
      lobby.players.every((p) => p.isReady) &&
      lobby.phase === LobbyPhase.WAITING_FOR_READY
    ) {
      lobby.gameStarting = true;
      io.to(code).emit('lobby:game-starting');
      // TODO: after countdown, create the GameInstance in the DB and emit the gameId
    }
  });

  // ── UNREADY ──────────────────────────────────────────────────────────
  // Lets a player retract their ready state before the countdown starts
  socket.on('lobby:unready', ({ code }: { code: string }) => {
    const lobby = lobbies.get(code);
    if (!lobby || lobby.gameStarting) return;
    const player = lobby.players.find((p) => p.user.id === user.id);
    if (!player) return;
    player.isReady = false;
    io.to(code).emit('lobby:player-ready', { playerId: user.id, isReady: false });
  });

  // ── KICK ────────────────────────────────────────────────────────────
  socket.on('lobby:kick', ({ code, userId }: { code: string; userId: string }) => {
    const lobby = lobbies.get(code);
    if (!lobby || !isHost(lobby, user.id)) return;
    const kicked = lobby.players.find((p) => p.user.id === userId);
    if (!kicked) return;
    lobby.players = lobby.players.filter((p) => p.user.id !== userId);
    io.to(kicked.socketId).emit('lobby:kicked'); // personal message — triggers redirect on client
    socket.to(code).emit('lobby:player-left', { userId }); // notify others
  });

  // ── TRANSFER HOST ────────────────────────────────────────────────────
  socket.on('lobby:transfer-host', ({ code, userId }: { code: string; userId: string }) => {
    const lobby = lobbies.get(code);
    if (!lobby || !isHost(lobby, user.id)) return;
    lobby.players.forEach((p) => {
      p.isHost = p.user.id === userId;
    });
    io.to(code).emit('lobby:host-changed', { newHostId: userId });
  });

  // ── CHAT ────────────────────────────────────────────────────────────
  socket.on('lobby:chat', ({ code, text }: { code: string; text: string }) => {
    if (!lobbies.get(code)) return;
    io.to(code).emit('lobby:chat', {
      id: `${Date.now()}-${Math.random()}`,
      senderName: user.name,
      text: text.trim().substring(0, 200), // server-side length cap
      timestamp: Date.now(),
    });
  });

  // ── DISCONNECT ──────────────────────────────────────────────────────
  // Fires automatically when a socket loses connection for any reason:
  // browser close, navigation away, network drop, etc.
  socket.on('disconnect', () => {
    lobbies.forEach((lobby, code) => {
      const player = lobby.players.find((p) => p.socketId === socket.id);
      if (!player) return;

      lobby.players = lobby.players.filter((p) => p.socketId !== socket.id);
      io.to(code).emit('lobby:player-left', { userId: player.user.id });

      if (lobby.players.length === 0) {
        scheduleLobbyDelete(code); // grace period — allows reconnect after page navigation
      } else if (player.isHost && lobby.players.length > 0) {
        // Auto-transfer host to the remaining player
        lobby.players[0].isHost = true;
        io.to(code).emit('lobby:host-changed', { newHostId: lobby.players[0].user.id });
      }
    });
  });
}

function isHost(lobby: LobbyState, userId: string): boolean {
  return lobby.players.find((p) => p.user.id === userId)?.isHost ?? false;
}
