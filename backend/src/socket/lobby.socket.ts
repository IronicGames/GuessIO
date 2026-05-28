import type { Server, Socket } from 'socket.io';
import type { UserProfile } from '@shared/types/user.types';
import { lobbies, generateCode, scheduleLobbyDelete, cancelLobbyDelete } from './lobby-store';
import {
  GameMode,
  Lives,
  LobbyPhase,
  type LobbyState,
  parseLives,
  parseTurnTimer,
  TurnTimer,
} from '@shared/types/lobby.types';
import { GamePhase } from '@shared/types/game-state.types';
import type { ActiveGameState } from '@shared/types/game-state.types';
import { getBoard } from '@services/board.service';
import { drawCharacters, storeGame } from './game-store';
import prisma from '@backend/lib/prisma';

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
      lobby.phase === LobbyPhase.WAITING_FOR_READY &&
      !lobby.gameStarting
    ) {
      lobby.gameStarting = true;
      // Signal clients to start the 3-second countdown overlay
      io.to(code).emit('lobby:game-starting');

      // After the countdown, create the DB record and navigate both clients to the game
      setTimeout(() => {
        void startGame(io, code, lobby);
      }, 3000);
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

// ── Game start ────────────────────────────────────────────────────────────────
// Called after the 3-second countdown. Creates the GameInstance DB record, builds
// the in-memory ActiveGameState, joins both sockets to the game room, then emits
// lobby:game-ready with the gameId so both clients can navigate to /game/[gameId].

async function startGame(io: Server, code: string, lobby: LobbyState): Promise<void> {
  try {
    if (lobby.players.length !== 2) {
      io.to(code).emit('lobby:error', {
        message: 'Game cancelled — a player disconnected during the countdown.',
      });
      return;
    }

    const [p1, p2] = lobby.players;
    const settings = lobby.settings;

    const instance = await prisma.gameInstance.create({
      data: {
        boardId: lobby.selectedBoardId,
        boardName: lobby.board!.name,
        mode: settings.mode,
        turnTimer: parseTurnTimer(settings.turnTimer),
        lives: parseLives(settings.lives),
        isPublic: false,
        player1UserId: p1.user.isGuest ? null : p1.user.id,
        player1Name: p1.user.name,
        player2UserId: p2.user.isGuest ? null : p2.user.id,
        player2Name: p2.user.name,
        // result, resultReason, winnerIsPlayer1, completedAt left null — game in progress
      },
    });

    const drawnCharacterIds = drawCharacters(lobby.board!, lobby.disabledCharacterIds);
    const livesCount = parseLives(settings.lives);

    const gameState: ActiveGameState = {
      gameId: instance.id,
      lobbyCode: code,
      phase: GamePhase.CHARACTER_SELECTION,
      settings,
      board: lobby.board!,
      drawnCharacterIds,
      players: lobby.players.map((p, i) => ({
        user: p.user,
        socketId: p.socketId,
        isConnected: p.isConnected,
        isPlayer1: i === 0,
        livesRemaining: livesCount,
        hasChosen: false,
        timesDisconnected: 0,
        isHost: p.isHost,
      })),
      currentTurnIsPlayer1: true, // host (player 1) goes first
      turnNumber: 1,
      currentAction: null,
      chat: [...lobby.chat], // seed from lobby chat history
      result: null,
      resultReason: null,
      winnerIsPlayer1: null,
      turnTimerExpiresAt: null,
      gameTimerExpiresAt: null,
      log: [],
    };
    storeGame(gameState);

    // Move both player sockets into the game room
    for (const player of lobby.players) {
      io.in(player.socketId).socketsJoin(instance.id);
    }

    // Signal both clients to navigate — lobby:game-starting started the countdown,
    // lobby:game-ready delivers the gameId once the game is actually ready
    io.to(code).emit('lobby:game-ready', { gameId: instance.id });
  } catch (err) {
    console.error('Failed to start game:', err);
    io.to(code).emit('lobby:error', { message: 'Failed to start game. Please try again.' });
  }
}
