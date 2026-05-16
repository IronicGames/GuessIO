import type { Server, Socket } from 'socket.io';
import type { UserProfile } from '@shared/types/user.types';
import {
  type ActiveGameState,
  GamePhase,
  GamePlayerState,
  TurnAction,
} from '@shared/types/game-state.types';
import { GameMode, Lives, type ChatMessage } from '@shared/types/lobby.types';
import {
  games,
  cancelGameDelete,
  scheduleGameDelete,
  cancelAutoSkip,
  scheduleAutoSkip,
} from './game-store';
import { GameResult, GameResultReason } from '@shared/types/game.types';
import { LogActionType } from '@prisma/client';
import prisma from '@backend/lib/prisma';

// Server-side secrets — never included in ActiveGameState broadcasts.
// Map<gameId, { player1CharacterId: string | null; player2CharacterId: string | null }>
const gameSecrets = new Map<
  string,
  { player1CharacterId: string | null; player2CharacterId: string | null }
>();

export function registerGameHandlers(io: Server, socket: Socket) {
  const user = socket.data.user as UserProfile;

  function validateGameState(
    gameId: string,
    expectedPhase?: GamePhase,
    expectedAction?: TurnAction,
    expectedMode?: GameMode,
  ): ActiveGameState | null {
    const game = games.get(gameId);
    if (!game) {
      socket.emit('game:fatal-error', { message: 'Game not found or has expired' });
      return null;
    }
    if (expectedPhase !== undefined && game.phase !== expectedPhase) {
      socket.emit('game:error', {
        message: `Invalid phase (expected: ${expectedPhase}, got: ${game.phase})`,
      });
      return null;
    }
    if (expectedAction !== undefined && game.currentAction !== expectedAction) {
      socket.emit('game:error', {
        message: `Invalid action (expected: ${expectedAction}, got: ${game.currentAction})`,
      });
      return null;
    }
    if (expectedMode !== undefined && game.settings.mode !== expectedMode) {
      socket.emit('game:error', {
        message: `Invalid game mode (expected: ${expectedMode}, got: ${game.settings.mode})`,
      });
      return null;
    }
    return game;
  }

  function validatePlayer(game: ActiveGameState): GamePlayerState | null {
    const player = game.players.find((p) => p.user.id === user.id);
    if (!player) {
      socket.emit('game:fatal-error', { message: 'You are not in this game' });
      return null;
    }
    return player;
  }

  function isCurrentPlayer(game: ActiveGameState, player: GamePlayerState): boolean {
    return game.currentTurnIsPlayer1 === player.isPlayer1;
  }

  function isCurrentTurn(game: ActiveGameState, player: GamePlayerState): boolean {
    if (!isCurrentPlayer(game, player)) {
      socket.emit('game:error', { message: 'It is not your turn' });
      return false;
    }
    return true;
  }

  function validateDrawnCharacter(game: ActiveGameState, characterId: string): boolean {
    if (game.drawnCharacterIds.every((id) => id !== characterId)) {
      socket.emit('game:error', { message: 'Character not in drawn characters' });
      return false;
    }
    return true;
  }

  // ── JOIN GAME ─────────────────────────────────────────────────────────────
  // Emitted by useGame hook on mount. Sends full state snapshot to the joining client.
  socket.on('game:join', ({ gameId }: { gameId: string }) => {
    const game = validateGameState(gameId);
    if (!game) return;

    const player = validatePlayer(game);
    if (!player) return;

    cancelGameDelete(gameId);
    socket.join(gameId);
    player.socketId = socket.id;
    player.isConnected = true;
    player.timesDisconnected = 0;
    cancelAutoSkip(gameId);

    socket.emit('game:state', game);

    // Re-send the player's own character if they've already chosen (page refresh during game)
    const secrets = gameSecrets.get(gameId);
    if (secrets) {
      const myCharacterId = player.isPlayer1
        ? secrets.player1CharacterId
        : secrets.player2CharacterId;
      if (myCharacterId) {
        socket.emit('game:your-character', { characterId: myCharacterId });
      }
    }
  });

  // ── CHARACTER SELECT ──────────────────────────────────────────────────────
  // Player picks their secret character during CHARACTER_SELECTION phase.
  socket.on(
    'game:character-select',
    ({ gameId, characterId }: { gameId: string; characterId: string }) => {
      const game = validateGameState(gameId, GamePhase.CHARACTER_SELECTION);
      if (!game) return;

      const player = validatePlayer(game);
      if (!player) return;

      if (!validateDrawnCharacter(game, characterId)) {
        return;
      }

      if (player.hasChosen) {
        socket.emit('game:error', { message: 'You have already chosen a character' });
        return;
      }

      gameSecrets.set(gameId, {
        player1CharacterId: player.isPlayer1
          ? characterId
          : gameSecrets.get(gameId)?.player1CharacterId || null,
        player2CharacterId: !player.isPlayer1
          ? characterId
          : gameSecrets.get(gameId)?.player2CharacterId || null,
      });
      player.hasChosen = true;

      socket.emit('game:your-character', { characterId });
      io.to(gameId).emit('game:player-chosen', { playerId: user.id });
      if (game.players.every((p) => p.hasChosen)) {
        game.phase = GamePhase.DECIDE;
        io.to(gameId).emit('game:phase-changed', { phase: GamePhase.DECIDE });
        maybeScheduleAutoSkip(gameId, io);
      }
    },
  );

  // ── ACTION ────────────────────────────────────────────────────────────────
  // Asker selects Ask or Guess during DECIDE phase.
  socket.on('game:action', ({ gameId, action }: { gameId: string; action: TurnAction }) => {
    const game = validateGameState(gameId, GamePhase.DECIDE);
    if (!game) return;
    const player = validatePlayer(game);
    if (!player || !isCurrentTurn(game, player)) return;
    if (!Object.values(TurnAction).includes(action)) {
      socket.emit('game:error', { message: 'Invalid action' });
      return;
    }
    game.currentAction = action;
    game.phase = GamePhase.SUBMIT;
    io.to(gameId).emit('game:phase-changed', { phase: GamePhase.SUBMIT, currentAction: action });
  });

  // ── SUBMIT ASK ────────────────────────────────────────────────────────────
  // Casual Mode only: asker has asked their question externally (voice/chat/etc.)
  // and clicks "Done asking" to advance to END_TURN.
  // NOTE: RESOLVE phase is skipped entirely in Casual Mode for ASK actions.
  // In Tag Mode: SUBMIT → system resolves → RESOLVE → END_TURN (separate handler).
  socket.on('game:submit-ask', ({ gameId }: { gameId: string }) => {
    const game = validateGameState(gameId, GamePhase.SUBMIT, TurnAction.ASK, GameMode.CASUAL);
    if (!game) return;
    const player = validatePlayer(game);
    if (!player || !isCurrentTurn(game, player)) return;
    void prisma.gameLogEntry.create({
      data: {
        gameInstanceId: gameId,
        turnNumber: game.turnNumber,
        playerIsPlayer1: player.isPlayer1,
        actionType: LogActionType.ASK,
        subject: null,
        result: null,
      },
    });
    game.phase = GamePhase.END_TURN;
    io.to(gameId).emit('game:phase-changed', { phase: GamePhase.END_TURN });
  });

  // ── SUBMIT GUESS ──────────────────────────────────────────────────────────
  // Player guesses a character. System resolves win/loss immediately.
  socket.on(
    'game:submit-guess',
    async ({ gameId, characterId }: { gameId: string; characterId: string }) => {
      const game = validateGameState(gameId, GamePhase.SUBMIT, TurnAction.GUESS);
      if (!game) return;
      const player = validatePlayer(game);
      if (!player || !isCurrentTurn(game, player)) return;
      if (!validateDrawnCharacter(game, characterId)) {
        return;
      }
      const secrets = gameSecrets.get(gameId);
      if (!secrets) {
        socket.emit('game:error', { message: 'Game state error — please rejoin' });
        return;
      }
      const opponentCharacterId = player.isPlayer1
        ? secrets.player2CharacterId
        : secrets.player1CharacterId;
      const isCorrect = characterId === opponentCharacterId;
      const charName =
        game.board.characters.find((c) => c.id === characterId)?.name || 'Unknown Character';

      void prisma.gameLogEntry.create({
        data: {
          gameInstanceId: gameId,
          turnNumber: game.turnNumber,
          playerIsPlayer1: player.isPlayer1,
          actionType: LogActionType.GUESS,
          subject: charName,
          result: isCorrect ? 'Correct' : 'Wrong',
        },
      });

      if (isCorrect) {
        await endGame(gameId, GameResult.WIN, GameResultReason.CORRECT_GUESS, player.isPlayer1, io);
        return;
      }

      player.livesRemaining -= 1;
      if (player.livesRemaining <= 0 && game.settings.lives !== Lives.INFINITE) {
        await endGame(
          gameId,
          GameResult.WIN,
          GameResultReason.LIVES_EXHAUSTED,
          !player.isPlayer1,
          io,
        );
      } else {
        game.phase = GamePhase.END_TURN;
        io.to(gameId).emit('game:phase-changed', {
          phase: GamePhase.END_TURN,
          players: game.players, // updated lives
          guessResult: 'Wrong',
          guessedCharacterId: characterId,
        });
      }
    },
  );

  // ── END TURN ──────────────────────────────────────────────────────────────
  // Asker confirms they're done crossing off characters, advancing to the next turn.
  socket.on('game:end-turn', ({ gameId }: { gameId: string }) => {
    const game = validateGameState(gameId, GamePhase.END_TURN);
    if (!game) return;
    const player = validatePlayer(game);
    if (!player || !isCurrentTurn(game, player)) return;
    game.turnNumber += 1;
    game.currentTurnIsPlayer1 = !game.currentTurnIsPlayer1;
    game.currentAction = null;
    game.phase = GamePhase.DECIDE;
    io.to(gameId).emit('game:phase-changed', {
      phase: GamePhase.DECIDE,
      currentTurnIsPlayer1: game.currentTurnIsPlayer1,
      turnNumber: game.turnNumber,
      currentAction: null,
    });
    maybeScheduleAutoSkip(gameId, io);
  });

  // ── CHAT ──────────────────────────────────────────────────────────────────
  // Identical pattern to lobby:chat — persists messages into game state.
  socket.on('game:chat', ({ gameId, text }: { gameId: string; text: string }) => {
    const game = games.get(gameId);
    if (!game) return;

    const message: ChatMessage = {
      id: `${Date.now()}-${Math.random()}`,
      senderName: user.name,
      text: text.trim().substring(0, 200),
      timestamp: Date.now(),
    };
    game.chat.push(message);
    io.to(gameId).emit('game:chat', message);
  });

  // ── DISCONNECT ────────────────────────────────────────────────────────────
  // Fires automatically when a socket loses connection for any reason.
  socket.on('disconnect', () => {
    games.forEach((game, gameId) => {
      const player = game.players.find((p) => p.socketId === socket.id);
      if (!player) return;

      player.isConnected = false;
      io.to(gameId).emit('game:player-disconnected', { userId: player.user.id });

      if (game.players.every((p) => !p.isConnected)) {
        // Nobody left — schedule cleanup after grace period
        scheduleGameDelete(gameId);
      } else {
        // Opponent is still connected — start auto-skip timer if it's the disconnected player's turn
        maybeScheduleAutoSkip(gameId, io);
      }
    });
  });
}

async function endGame(
  gameId: string,
  result: GameResult,
  resultReason: GameResultReason,
  winnerIsPlayer1: boolean | null,
  io: Server,
): Promise<void> {
  const game = games.get(gameId);
  if (!game) return;

  game.result = result;
  game.resultReason = resultReason;
  game.winnerIsPlayer1 = winnerIsPlayer1;
  game.phase = GamePhase.GAME_OVER;

  await prisma.gameInstance.update({
    where: { id: gameId },
    data: {
      result,
      resultReason,
      winnerIsPlayer1,
      completedAt: new Date(),
    },
  });

  io.to(gameId).emit('game:game-over', {
    phase: GamePhase.GAME_OVER,
    result,
    resultReason,
    winnerIsPlayer1,
  });

  gameSecrets.delete(gameId);
  scheduleGameDelete(gameId);
}

function maybeScheduleAutoSkip(gameId: string, io: Server): void {
  const game = games.get(gameId);
  // Only auto-skip during DECIDE — other phases (SUBMIT, END_TURN) the player
  // already acted so skipping mid-action would be confusing
  if (!game || game.phase !== GamePhase.DECIDE) return;

  const currentPlayer = game.players.find((p) => p.isPlayer1 === game.currentTurnIsPlayer1);
  if (!currentPlayer) return;

  if (!currentPlayer.isConnected) {
    scheduleAutoSkip(gameId, () => {
      void doAutoSkip(gameId, io);
    });
  }
  // If they're connected, do nothing — no timer needed
}

async function doAutoSkip(gameId: string, io: Server): Promise<void> {
  const game = games.get(gameId);
  if (!game || game.phase !== GamePhase.DECIDE) return; // game ended or phase changed

  const currentPlayer = game.players.find((p) => p.isPlayer1 === game.currentTurnIsPlayer1);
  if (!currentPlayer || currentPlayer.isConnected) return; // they reconnected in time

  // Log the skip
  void prisma.gameLogEntry.create({
    data: {
      gameInstanceId: gameId,
      turnNumber: game.turnNumber,
      playerIsPlayer1: currentPlayer.isPlayer1,
      actionType: LogActionType.SKIP,
      subject: null,
      result: null,
    },
  });

  currentPlayer.timesDisconnected += 1;

  // 5 consecutive skips → DISCONNECT loss for the absent player
  if (currentPlayer.timesDisconnected >= 5) {
    const opponent = game.players.find((p) => p.isPlayer1 !== currentPlayer.isPlayer1);
    await endGame(
      gameId,
      GameResult.WIN,
      GameResultReason.DISCONNECT,
      opponent?.isPlayer1 ?? null,
      io,
    );
    return;
  }

  // Advance turn
  game.turnNumber += 1;
  game.currentTurnIsPlayer1 = !game.currentTurnIsPlayer1;
  game.currentAction = null;
  // phase stays DECIDE

  io.to(gameId).emit('game:phase-changed', {
    phase: GamePhase.DECIDE,
    currentTurnIsPlayer1: game.currentTurnIsPlayer1,
    turnNumber: game.turnNumber,
    currentAction: null,
    players: game.players, // includes updated timesDisconnected
  });

  // If the opponent is also disconnected, check again
  maybeScheduleAutoSkip(gameId, io);
}
