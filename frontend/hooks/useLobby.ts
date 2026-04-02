'use client';

import { useState, useCallback } from 'react';
import { type UserProfile } from '@shared/types/user.types';

// ─── Types ────────────────────────────────────────────────────────────────────

export type LobbyPhase = 'board-selection' | 'character-config' | 'waiting-for-ready';

export type GameMode = 'CASUAL' | 'TAG';
export type TurnTimer = 'OFF' | '30s' | '1m' | '3m';
export type Lives = '1' | '3' | 'INF';

export interface LobbySettings {
  mode: GameMode;
  turnTimer: TurnTimer;
  lives: Lives;
}

export interface LobbyPlayer {
  userId: string;
  name: string;
  profilePicture?: string;
  isHost: boolean;
  isConnected: boolean;
  isReady: boolean;
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
  disabledCharacterIds: string[];
  chat: ChatMessage[];
  gameStarting: boolean;
}

export interface UseLobbyReturn {
  lobbyState: LobbyState;
  isHost: boolean;
  selectBoard: (boardId: string) => void;
  confirmBoard: () => void;
  toggleCharacter: (characterId: string) => void;
  confirmCharacters: () => void;
  updateSettings: (patch: Partial<LobbySettings>) => void;
  setReady: () => void;
  kickPlayer: (userId: string) => void;
  transferHost: (userId: string) => void;
  sendChatMessage: (text: string) => void;
  triggerGameStarting: () => void;
}

// ─── Mock initial state ───────────────────────────────────────────────────────

function createMockLobbyState(user: UserProfile | null, code: string): LobbyState {
  return {
    code,
    phase: 'board-selection',
    settings: { mode: 'CASUAL', turnTimer: 'OFF', lives: '3' },
    players: [
      {
        userId: user?.id ?? 'mock-host',
        name: user?.name ?? 'You',
        profilePicture: user?.profilePicture,
        isHost: true,
        isConnected: true,
        isReady: false,
      },
      {
        userId: 'mock-opponent',
        name: 'PixelFox42',
        isHost: false,
        isConnected: true,
        isReady: false,
      },
    ],
    selectedBoardId: null,
    disabledCharacterIds: [],
    chat: [
      {
        id: 'mock-1',
        senderName: 'PixelFox42',
        text: 'hey, pick a good board 👀',
        timestamp: Date.now() - 60000,
      },
    ],
    gameStarting: false,
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useLobby(code: string, user: UserProfile | null): UseLobbyReturn {
  const [lobbyState, setLobbyState] = useState<LobbyState>(() => createMockLobbyState(user, code));

  const isHost =
    lobbyState.players.find((p) => p.userId === (user?.id ?? 'mock-host'))?.isHost ?? false;

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SOCKET.IO PLACEHOLDER — Connection + Join
  // On hook mount, emit: socket.emit('lobby:join', { code })
  // On recv 'lobby:state': setLobbyState(snapshot)
  // On recv 'lobby:player-joined': update players array
  // On recv 'lobby:player-left': remove player from array
  // On recv 'lobby:host-changed': update isHost flags
  // On recv 'lobby:kicked': router.push('/')
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SOCKET.IO PLACEHOLDER — Settings
  // On settings change, emit: socket.emit('lobby:settings-change', { patch })
  // On recv 'lobby:settings-updated': apply patch to lobbyState.settings
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const updateSettings = useCallback((patch: Partial<LobbySettings>) => {
    // TODO: replace with socket.emit('lobby:settings-change', { patch })
    setLobbyState((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...patch },
    }));
  }, []);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SOCKET.IO PLACEHOLDER — Board Selection (Phase 1)
  // On board click, emit: socket.emit('lobby:board-select', { boardId })
  // On confirm press, emit: socket.emit('lobby:board-confirm')
  // On recv 'lobby:board-confirmed': advance phase to 'character-config'
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const selectBoard = useCallback((boardId: string) => {
    // TODO: replace with socket.emit('lobby:board-select', { boardId })
    setLobbyState((prev) => ({ ...prev, selectedBoardId: boardId }));
  }, []);

  const confirmBoard = useCallback(() => {
    // TODO: replace with socket.emit('lobby:board-confirm')
    setLobbyState((prev) => ({ ...prev, phase: 'character-config' }));
  }, []);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SOCKET.IO PLACEHOLDER — Character Config (Phase 2)
  // On toggle, emit: socket.emit('lobby:char-toggle', { characterId, enabled })
  // On recv 'lobby:char-toggled': update disabledCharacterIds
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const toggleCharacter = useCallback((characterId: string) => {
    // TODO: replace with socket.emit('lobby:char-toggle', { characterId, enabled })
    setLobbyState((prev) => {
      const already = prev.disabledCharacterIds.includes(characterId);
      return {
        ...prev,
        disabledCharacterIds: already
          ? prev.disabledCharacterIds.filter((id) => id !== characterId)
          : [...prev.disabledCharacterIds, characterId],
      };
    });
  }, []);

  const confirmCharacters = useCallback(() => {
    // TODO: replace with socket.emit('lobby:characters-confirmed')
    setLobbyState((prev) => ({ ...prev, phase: 'waiting-for-ready' }));
  }, []);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SOCKET.IO PLACEHOLDER — Ready / Game Start
  // On ready, emit: socket.emit('lobby:ready', { isReady: true })
  // On recv 'lobby:player-ready': update that player's isReady
  // On recv 'lobby:game-starting': set gameStarting = true
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const setReady = useCallback(() => {
    // TODO: replace with socket.emit('lobby:ready', { isReady: true })
    setLobbyState((prev) => ({
      ...prev,
      players: prev.players.map((p) =>
        p.userId === (user?.id ?? 'mock-host') ? { ...p, isReady: true } : p,
      ),
    }));
  }, [user?.id]);

  const triggerGameStarting = useCallback(() => {
    // TODO: this is triggered by recv 'lobby:game-starting' from server
    setLobbyState((prev) => ({ ...prev, gameStarting: true }));
  }, []);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SOCKET.IO PLACEHOLDER — Chat
  // On send, emit: socket.emit('lobby:chat', { text })
  // On recv 'lobby:chat': append { senderName, text, timestamp } to chat
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const sendChatMessage = useCallback(
    (text: string) => {
      // TODO: replace with socket.emit('lobby:chat', { text })
      const message: ChatMessage = {
        id: `msg-${Date.now()}`,
        senderName: user?.name ?? 'You',
        text,
        timestamp: Date.now(),
      };
      setLobbyState((prev) => ({ ...prev, chat: [...prev.chat, message] }));
    },
    [user?.name],
  );

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SOCKET.IO PLACEHOLDER — Host Actions
  // Kick: emit socket.emit('lobby:kick', { userId })
  // Transfer: emit socket.emit('lobby:transfer-host', { userId })
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const kickPlayer = useCallback((userId: string) => {
    // TODO: replace with socket.emit('lobby:kick', { userId })
    setLobbyState((prev) => ({
      ...prev,
      players: prev.players.filter((p) => p.userId !== userId),
    }));
  }, []);

  const transferHost = useCallback((userId: string) => {
    // TODO: replace with socket.emit('lobby:transfer-host', { userId })
    setLobbyState((prev) => ({
      ...prev,
      players: prev.players.map((p) => ({
        ...p,
        isHost: p.userId === userId,
      })),
    }));
  }, []);

  return {
    lobbyState,
    isHost,
    selectBoard,
    confirmBoard,
    toggleCharacter,
    confirmCharacters,
    updateSettings,
    setReady,
    kickPlayer,
    transferHost,
    sendChatMessage,
    triggerGameStarting,
  };
}
