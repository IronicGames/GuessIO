'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { type UserProfile } from '@shared/types/user.types';
import {
  type ChatMessage,
  type LobbyPlayer,
  type LobbySettings,
  type LobbyState,
  GameMode,
  Lives,
  LobbyPhase,
  TurnTimer,
} from '@shared/types/lobby.types';
import { io, type Socket } from 'socket.io-client';
import { useRouter } from 'next/navigation';
import { useNotify } from './useNotify';
import { type BoardDto } from '@shared/types/board.types';

export interface UseLobbyReturn {
  lobbyState: LobbyState;
  isHost: boolean;
  selectBoard: (boardId: string) => void;
  confirmBoard: () => void;
  undoBoard: () => void;
  toggleCharacter: (characterId: string) => void;
  confirmCharacters: () => void;
  updateSettings: (patch: Partial<LobbySettings>) => void;
  setReady: () => void;
  setUnready: () => void;
  kickPlayer: (userId: string) => void;
  transferHost: (userId: string) => void;
  sendChatMessage: (text: string) => void;
}

// ─── Initial state ────────────────────────────────────────────────────────────
// Empty — server will send the real state via lobby:state immediately on join.

function createInitialLobbyState(code: string): LobbyState {
  return {
    code,
    phase: LobbyPhase.BOARD_SELECTION,
    settings: { mode: GameMode.CASUAL, turnTimer: TurnTimer.OFF, lives: Lives.THREE },
    players: [],
    selectedBoardId: null,
    board: null,
    disabledCharacterIds: [],
    chat: [],
    gameStarting: false,
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useLobby(code: string, user: UserProfile | null): UseLobbyReturn {
  const router = useRouter();
  const socketRef = useRef<Socket | null>(null);
  const notify = useNotify();
  // Ref so the socket effect can always call the latest notify without being
  // in its dependency array (which would cause reconnects on every render)
  const notifyRef = useRef(notify);
  notifyRef.current = notify;

  const [lobbyState, setLobbyState] = useState<LobbyState>(() => createInitialLobbyState(code));

  const isHost = lobbyState.players.find((p) => p.user.id === (user?.id ?? ''))?.isHost ?? false;

  // ── Connect, join, and register all incoming event handlers ──────────
  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
      withCredentials: true,
      autoConnect: false,
    });
    socketRef.current = socket;
    socket.connect();

    // Full lobby snapshot — received on join, replaces initial state
    socket.on('lobby:state', (state: LobbyState) => {
      setLobbyState(state);
    });

    // A new player joined — update player list
    socket.on('lobby:player-joined', (players: LobbyPlayer[]) => {
      setLobbyState((prev) => ({ ...prev, players }));
    });

    // A player left or was kicked
    socket.on('lobby:player-left', ({ userId }: { userId: string }) => {
      setLobbyState((prev) => ({
        ...prev,
        players: prev.players.filter((p) => p.user.id !== userId),
      }));
    });

    // Host privileges transferred
    socket.on('lobby:host-changed', ({ newHostId }: { newHostId: string }) => {
      setLobbyState((prev) => ({
        ...prev,
        players: prev.players.map((p) => ({ ...p, isHost: p.user.id === newHostId })),
      }));
    });

    // Settings were changed by host — update UI on joiner's side
    socket.on('lobby:settings-updated', (settings: LobbySettings) => {
      setLobbyState((prev) => ({ ...prev, settings }));
    });

    // Board confirmed — advance both players to character-config phase with board data
    socket.on(
      'lobby:board-confirmed',
      ({ boardId, board }: { boardId: string; board: BoardDto }) => {
        setLobbyState((prev) => ({
          ...prev,
          phase: LobbyPhase.CHARACTER_CONFIG,
          selectedBoardId: boardId,
          board: board,
        }));
      },
    );

    // Host undid board selection — revert both players
    socket.on('lobby:board-undone', () => {
      setLobbyState((prev) => ({
        ...prev,
        phase: LobbyPhase.BOARD_SELECTION,
        selectedBoardId: null,
        board: null,
        disabledCharacterIds: [],
      }));
    });

    // Host toggled a character — sync to joiner's read-only grid
    socket.on(
      'lobby:char-toggled',
      ({ characterId, enabled }: { characterId: string; enabled: boolean }) => {
        setLobbyState((prev) => ({
          ...prev,
          disabledCharacterIds: enabled
            ? prev.disabledCharacterIds.filter((id) => id !== characterId)
            : prev.disabledCharacterIds.some((c) => c === characterId)
              ? prev.disabledCharacterIds
              : [...prev.disabledCharacterIds, characterId],
        }));
      },
    );

    // Host confirmed characters — both players advance to ready phase
    socket.on('lobby:chars-confirmed', () => {
      setLobbyState((prev) => ({ ...prev, phase: LobbyPhase.WAITING_FOR_READY }));
    });

    // A player's ready status changed
    socket.on(
      'lobby:player-ready',
      ({ playerId, isReady }: { playerId: string; isReady: boolean }) => {
        setLobbyState((prev) => ({
          ...prev,
          players: prev.players.map((p) => (p.user.id === playerId ? { ...p, isReady } : p)),
        }));
      },
    );

    // Both players ready — trigger countdown overlay
    socket.on('lobby:game-starting', () => {
      setLobbyState((prev) => ({ ...prev, gameStarting: true }));
    });

    // Received a chat message (from either player — server echoes back to all)
    socket.on('lobby:chat', (message: ChatMessage) => {
      setLobbyState((prev) => ({ ...prev, chat: [...prev.chat, message] }));
    });

    // This client was kicked — redirect home
    socket.on('lobby:kicked', () => {
      //TODO: show a notification that you were kicked
      //TODO: ban kicked users on the server to prevent rejoining with multiple tabs or after refresh
      router.push('/');
    });

    // Connection errors — show notification and return home
    socket.on('connect_error', (err) => {
      console.error('Socket error:', err.message);
      notifyRef.current.error(err.message, 'Could not join lobby');
      router.push('/');
    });

    socket.on('lobby:error', ({ message }: { message: string }) => {
      notifyRef.current.error(message, 'Could not join lobby');
      router.push('/');
    });

    // Tell server we're joining this lobby
    socket.emit('lobby:join', { code });

    // Cleanup: disconnect when page unmounts (triggers server disconnect handler)
    return () => {
      socket.disconnect();
    };
  }, [code, router]);

  // ── Outgoing event handlers ───────────────────────────────────────

  const selectBoard = useCallback((boardId: string) => {
    // Board selection is local only — no need to broadcast until Confirm
    setLobbyState((prev) => ({ ...prev, selectedBoardId: boardId }));
  }, []);

  const confirmBoard = useCallback(() => {
    const boardId = lobbyState.selectedBoardId;
    if (!boardId) return;
    socketRef.current?.emit('lobby:board-confirm', { code, boardId });
  }, [code, lobbyState.selectedBoardId]);

  const undoBoard = useCallback(() => {
    socketRef.current?.emit('lobby:board-undo', { code });
  }, [code]);

  const toggleCharacter = useCallback(
    (characterId: string) => {
      const isCurrentlyDisabled = lobbyState.disabledCharacterIds.includes(characterId);
      socketRef.current?.emit('lobby:char-toggle', {
        code,
        characterId,
        enabled: isCurrentlyDisabled,
      });
      setLobbyState((prev) => ({
        ...prev,
        disabledCharacterIds: isCurrentlyDisabled
          ? prev.disabledCharacterIds.filter((id) => id !== characterId)
          : [...prev.disabledCharacterIds, characterId],
      }));
    },
    [code, lobbyState.disabledCharacterIds],
  );

  const confirmCharacters = useCallback(() => {
    socketRef.current?.emit('lobby:chars-confirmed', { code });
  }, [code]);

  const updateSettings = useCallback(
    (patch: Partial<LobbySettings>) => {
      socketRef.current?.emit('lobby:settings-change', { code, patch });
      setLobbyState((prev) => ({ ...prev, settings: { ...prev.settings, ...patch } }));
    },
    [code],
  );

  const setReady = useCallback(() => {
    socketRef.current?.emit('lobby:ready', { code });
  }, [code]);

  const setUnready = useCallback(() => {
    socketRef.current?.emit('lobby:unready', { code });
  }, [code]);

  const kickPlayer = useCallback(
    (userId: string) => {
      socketRef.current?.emit('lobby:kick', { code, userId });
    },
    [code],
  );

  const transferHost = useCallback(
    (userId: string) => {
      socketRef.current?.emit('lobby:transfer-host', { code, userId });
    },
    [code],
  );

  const sendChatMessage = useCallback(
    (text: string) => {
      socketRef.current?.emit('lobby:chat', { code, text });
    },
    [code],
  );

  return {
    lobbyState,
    isHost,
    selectBoard,
    confirmBoard,
    undoBoard,
    toggleCharacter,
    confirmCharacters,
    updateSettings,
    setReady,
    setUnready,
    kickPlayer,
    transferHost,
    sendChatMessage,
  };
}
