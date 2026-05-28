'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { io, type Socket } from 'socket.io-client';
import { type UserProfile } from '@shared/types/user.types';
import {
  type ActiveGameState,
  type GamePlayerState,
  GamePhase,
  TurnAction,
} from '@shared/types/game-state.types';
import { type ChatMessage, GameMode, Lives, TurnTimer } from '@shared/types/lobby.types';
import { type BoardDto } from '@shared/types/board.types';
import { type GameLogEntryDto } from '@shared/types/game.types';
import { useNotify } from './useNotify';

// ─── Initial state ────────────────────────────────────────────────────────────
// Empty shell — server sends the real state via game:state immediately on join.

function createInitialGameState(gameId: string): ActiveGameState {
  return {
    gameId,
    lobbyCode: '',
    phase: GamePhase.CHARACTER_SELECTION,
    settings: { mode: GameMode.CASUAL, turnTimer: TurnTimer.OFF, lives: Lives.THREE },
    board: {} as BoardDto, // replaced immediately by game:state
    drawnCharacterIds: [],
    players: [],
    currentTurnIsPlayer1: true,
    turnNumber: 1,
    currentAction: null,
    chat: [],
    result: null,
    resultReason: null,
    winnerIsPlayer1: null,
    turnTimerExpiresAt: null,
    gameTimerExpiresAt: null,
    log: [],
  };
}

// ─── Return type ──────────────────────────────────────────────────────────────

export interface UseGameReturn {
  gameState: ActiveGameState;
  isPlayer1: boolean;
  isMyTurn: boolean;
  yourCharacterId: string | null; // secret — received personally via game:your-character
  log: GameLogEntryDto[];
  selectCharacter: (characterId: string) => void;
  chooseAction: (action: TurnAction) => void;
  submitAsk: () => void;
  submitGuess: (characterId: string) => void;
  endTurn: () => void;
  sendChatMessage: (text: string) => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useGame(gameId: string, user: UserProfile | null): UseGameReturn {
  const router = useRouter();
  const socketRef = useRef<Socket | null>(null);
  const notify = useNotify();
  // Ref so the socket effect can always call the latest notify without being
  // in its dependency array (which would cause reconnects on every render)
  const notifyRef = useRef(notify);
  notifyRef.current = notify;

  const [gameState, setGameState] = useState<ActiveGameState>(() => createInitialGameState(gameId));
  const [yourCharacterId, setYourCharacterId] = useState<string | null>(null);
  const [log, setLog] = useState<GameLogEntryDto[]>([]);

  const isPlayer1 = gameState.players.find((p) => p.user.id === user?.id)?.isPlayer1 ?? false;

  // During CHARACTER_SELECTION both players are simultaneously active, not turn-based.
  // isMyTurn is only meaningful from DECIDE onwards.
  const isMyTurn = gameState.currentTurnIsPlayer1 === isPlayer1;

  // ── Connect, join, and register all incoming event handlers ──────────
  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
      withCredentials: true,
      autoConnect: false,
    });
    socketRef.current = socket;
    socket.connect();

    // Full game state snapshot — received on join, replaces initial state
    socket.on('game:state', (state: ActiveGameState) => {
      setGameState(state);
      setLog(state.log); // seed log for reconnects
    });

    // Personal event — only this player sees their chosen character
    socket.on('game:your-character', ({ characterId }: { characterId: string }) => {
      setYourCharacterId(characterId);
    });

    // A player locked in their secret character (not which one — just that they have)
    socket.on('game:player-chosen', ({ playerId }: { playerId: string }) => {
      setGameState((prev) => ({
        ...prev,
        players: prev.players.map((p) => (p.user.id === playerId ? { ...p, hasChosen: true } : p)),
      }));
    });

    // Phase changed — server sends a partial patch of the fields that changed
    socket.on('game:phase-changed', (patch: Partial<ActiveGameState>) => {
      setGameState((prev) => ({ ...prev, ...patch }));
    });

    // Opponent disconnected mid-game
    socket.on('game:player-disconnected', ({ userId }: { userId: string }) => {
      setGameState((prev) => ({
        ...prev,
        players: prev.players.map((p) => (p.user.id === userId ? { ...p, isConnected: false } : p)),
      }));
    });

    // Game over — server sends result fields + phase: GAME_OVER
    socket.on(
      'game:game-over',
      (
        patch: Pick<
          ActiveGameState,
          'result' | 'resultReason' | 'winnerIsPlayer1' | 'phase' | 'players'
        >,
      ) => {
        setGameState((prev) => ({ ...prev, ...patch }));
      },
    );

    // Chat message received (from either player — server echoes to both)
    socket.on('game:chat', (message: ChatMessage) => {
      setGameState((prev) => ({ ...prev, chat: [...prev.chat, message] }));
    });

    // New game log entry — appended in real-time as actions happen
    socket.on('game:log-entry', (entry: GameLogEntryDto) => {
      setLog((prev) => [...prev, entry]);
    });

    // Game timer started — broadcast to the player already in the room when the second joins
    socket.on('game:game-timer-started', ({ gameTimerExpiresAt }: { gameTimerExpiresAt: string }) => {
      setGameState((prev) => ({ ...prev, gameTimerExpiresAt }));
    });

    // Validation errors — show notification, stay in game
    socket.on('game:error', ({ message }: { message: string }) => {
      notifyRef.current.error(message, 'Game error');
    });

    // Fatal errors (game not found, not in game) — redirect home
    socket.on('game:fatal-error', ({ message }: { message: string }) => {
      notifyRef.current.error(message, 'Game error');
      router.push('/');
    });

    socket.on('connect_error', (err) => {
      notifyRef.current.error(err.message, 'Could not connect to game');
      router.push('/');
    });

    // Tell server we're joining this game
    socket.emit('game:join', { gameId });

    // Cleanup: disconnect when page unmounts
    return () => {
      socket.disconnect();
    };
  }, [gameId, router]);

  // ── Outgoing event handlers ───────────────────────────────────────────

  // Select a character — used both in CHARACTER_SELECTION (picking your secret) and
  // in SUBMIT+GUESS (selecting a character to guess). Context is determined server-side.
  const selectCharacter = useCallback(
    (characterId: string) => {
      socketRef.current?.emit('game:character-select', { gameId, characterId });
    },
    [gameId],
  );

  // Asker chooses Ask or Guess during DECIDE phase
  const chooseAction = useCallback(
    (action: TurnAction) => {
      socketRef.current?.emit('game:action', { gameId, action });
    },
    [gameId],
  );

  // Casual Mode only: asker signals they've asked their question (externally)
  const submitAsk = useCallback(() => {
    socketRef.current?.emit('game:submit-ask', { gameId });
  }, [gameId]);

  // Submit a character guess
  const submitGuess = useCallback(
    (characterId: string) => {
      socketRef.current?.emit('game:submit-guess', { gameId, characterId });
    },
    [gameId],
  );

  // Asker confirms they're done crossing off, ending their turn
  const endTurn = useCallback(() => {
    socketRef.current?.emit('game:end-turn', { gameId });
  }, [gameId]);

  const sendChatMessage = useCallback(
    (text: string) => {
      socketRef.current?.emit('game:chat', { gameId, text });
    },
    [gameId],
  );

  return {
    gameState,
    isPlayer1,
    isMyTurn,
    yourCharacterId,
    log,
    selectCharacter,
    chooseAction,
    submitAsk,
    submitGuess,
    endTurn,
    sendChatMessage,
  };
}
