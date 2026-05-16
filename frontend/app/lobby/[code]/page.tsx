'use client';

import { use, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation'; // used inside GameStartingOverlay
import { useQuery } from '@tanstack/react-query';
import { Box, Flex, Group, Progress, Stack, Text, Title } from '@mantine/core';
import { useAuth } from '@providers/auth-provider';
import { useHeaderSlot } from '@providers/header-slot-provider';
import { useLobby } from '@/hooks/useLobby';
import { useNotify } from '@/hooks/useNotify';
import { api } from '@lib/api';
import { getErrorMessage } from '@lib/errors';
import ContentPaperComponent from '@components/ContentPaper';
import LoadingOverlay from '@components/LoadingOverlay';
import { LobbyHeaderContent } from '@components/Lobby/LobbyHeaderContent';
import { LobbySettingsPanel } from '@components/Lobby/LobbySettingsPanel';
import { LobbyPlayers } from '@components/Lobby/LobbyPlayers';
import { LobbyChat } from '@components/Lobby/LobbyChat';
import { LobbyBoardPanel } from '@components/Lobby/LobbyBoardPanel';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Game Starting Overlay
// Shown when lobbyState.gameStarting = true.
// Navigates to /game/[gameId] when the countdown finishes and gameId is available.
// lobby:game-starting fires immediately (starts countdown).
// lobby:game-ready fires after ~3s once the DB record is created (delivers gameId).
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function GameStartingOverlay({ visible, gameId }: { visible: boolean; gameId: string | null }) {
  const router = useRouter();
  const notify = useNotify();
  const notifyRef = useRef(notify);
  notifyRef.current = notify;
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const gameIdRef = useRef(gameId);
  gameIdRef.current = gameId; // always up to date without re-running the effect

  useEffect(() => {
    if (!visible) {
      setProgress(0);
      return;
    }

    setProgress(0);
    const DURATION_MS = 3000;
    const TICK_MS = 50;
    const increment = (100 / DURATION_MS) * TICK_MS;
    let current = 0;

    intervalRef.current = setInterval(() => {
      current += increment;
      if (current >= 100) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setProgress(100);
        if (gameIdRef.current) {
          router.push(`/game/${gameIdRef.current}`);
        } else {
          notifyRef.current.error('Game failed to start. Please try again.', 'Error');
        }
      } else {
        setProgress(current);
      }
    }, TICK_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [visible, router]);

  if (!visible) return null;

  return (
    <Box
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(18, 24, 32, 0.92)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
      }}
    >
      <Stack align="center" gap="xl">
        <Title order={1} c="#8ecae6">
          Game Starting!
        </Title>
        <Progress
          value={progress}
          color="#8ecae6"
          size="lg"
          w={300}
          styles={{ root: { backgroundColor: '#2f3e55' } }}
        />
        <Text c="#6b7f96">Get ready…</Text>
      </Stack>
    </Box>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Lobby Page
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function LobbyPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const { user } = useAuth();
  const { setCenterSlot } = useHeaderSlot();

  // Guests can't be hosts (no boards) — skip the fetch for them
  const {
    data: boards,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['boards'],
    queryFn: () => api.boards.getBoardsForUser(true),
    enabled: !!user,
  });

  const {
    lobbyState,
    isHost,
    gameId,
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
  } = useLobby(code, user);

  // Inject lobby info into the header center slot
  useEffect(() => {
    setCenterSlot(
      <LobbyHeaderContent
        link={`${window.location.origin}/lobby/${code}`}
        players={lobbyState.players}
      />,
    );
    return () => setCenterSlot(null);
  }, [code, lobbyState.players, setCenterSlot]);

  // ── Guards ────────────────────────────────────────────────────
  if (isLoading || !lobbyState.players.some((p) => p.user.id === user?.id))
    return <LoadingOverlay mode="screen" status="loading" />;
  if (error) return <LoadingOverlay mode="screen" status="error" text={getErrorMessage(error)} />;

  const currentUserId = user?.id ?? 'mock-host';

  return (
    <>
      <GameStartingOverlay visible={lobbyState.gameStarting} gameId={gameId} />

      <Flex justify="center" p="md">
        <Stack gap="md" w={{ base: '100%', sm: '95%', lg: '90%' }} style={{ maxWidth: 1400 }}>
          {/* Two-column layout — stacks on mobile */}
          <Group align="stretch" gap="md" style={{ flexWrap: 'wrap' }}>
            {/* Left panel — board/character selection */}
            <ContentPaperComponent
              w={{ base: '100%', md: '65%' }}
              h={{ base: 500, md: '82vh' }}
              style={{ flex: 1, minWidth: 300 }}
            >
              <LobbyBoardPanel
                phase={lobbyState.phase}
                selectedBoard={lobbyState.board}
                isHost={isHost}
                boards={boards ?? []}
                selectedBoardId={lobbyState.selectedBoardId}
                disabledCharacterIds={lobbyState.disabledCharacterIds}
                onSelectBoard={selectBoard}
                onConfirmBoard={confirmBoard}
                onToggleCharacter={toggleCharacter}
                onConfirmCharacters={confirmCharacters}
                onUndoBoard={undoBoard}
              />
            </ContentPaperComponent>

            {/* Right panel — settings + players + chat */}
            <Stack
              gap="md"
              w={{ base: '100%', md: '30%' }}
              h={{ base: 'auto', md: '82vh' }}
              style={{ minWidth: 260, display: 'flex', flexDirection: 'column' }}
            >
              {/* Settings */}
              <ContentPaperComponent style={{ flexShrink: 0 }}>
                <LobbySettingsPanel
                  settings={lobbyState.settings}
                  isHost={isHost}
                  onChange={updateSettings}
                />
              </ContentPaperComponent>

              {/* Players */}
              <ContentPaperComponent style={{ flexShrink: 0 }}>
                <LobbyPlayers
                  players={lobbyState.players}
                  currentUserId={currentUserId}
                  isHost={isHost}
                  gameStarting={lobbyState.gameStarting}
                  phase={lobbyState.phase}
                  onReady={setReady}
                  onUnready={setUnready}
                  onKick={kickPlayer}
                  onTransferHost={transferHost}
                />
              </ContentPaperComponent>

              {/* Chat */}
              <ContentPaperComponent style={{ flex: 1, minHeight: 220 }}>
                <LobbyChat
                  messages={lobbyState.chat}
                  currentUserName={user?.name ?? 'You'}
                  onSend={sendChatMessage}
                />
              </ContentPaperComponent>
            </Stack>
          </Group>
        </Stack>
      </Flex>
    </>
  );
}
