'use client';

import { use, useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Box, Flex, Group, Progress, Stack, Text, Title } from '@mantine/core';
import { useAuth } from '@providers/auth-provider';
import { useHeaderSlot } from '@providers/header-slot-provider';
import { useLobby } from '@/hooks/useLobby';
import { api } from '@lib/api';
import { getErrorMessage } from '@lib/errors';
import ContentPaperComponent from '@components/ContentPaper';
import LoadingOverlay from '@components/LoadingOverlay';
import { LobbyHeaderContent } from '@components/Lobby/LobbyHeaderContent';
import { LobbySettings } from '@components/Lobby/LobbySettings';
import { LobbyPlayers } from '@components/Lobby/LobbyPlayers';
import { LobbyChat } from '@components/Lobby/LobbyChat';
import { LobbyBoardPanel } from '@components/Lobby/LobbyBoardPanel';
import { useRouter } from 'next/navigation';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Game Starting Overlay
// Shown when lobbyState.gameStarting = true
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function GameStartingOverlay({ visible }: { visible: boolean }) {
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!visible) {
      setProgress(0);
      return;
    }

    setProgress(0);
    const DURATION_MS = 3000;
    const TICK_MS = 50;
    const increment = (100 / DURATION_MS) * TICK_MS;

    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          // TODO: socket.io integration — on recv 'lobby:game-starting', navigate:
          // router.push(`/game/${gameId}`)
          return 100;
        }
        return next;
      });
    }, TICK_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [visible]);

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
  const router = useRouter();
  const { user } = useAuth();
  const { setCenterSlot } = useHeaderSlot();

  // Guests can't be hosts (no boards) — skip the fetch for them
  const canFetchBoards = !!user && !user.isGuest;
  const {
    data: boards,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['boards'],
    queryFn: api.boards.getBoardsForUser,
    enabled: canFetchBoards,
  });

  const {
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
  } = useLobby(code, user);

  // Inject lobby info into the header center slot
  useEffect(() => {
    setCenterSlot(<LobbyHeaderContent code={code} players={lobbyState.players} />);
    return () => setCenterSlot(null);
  }, [code, lobbyState.players, setCenterSlot]);

  // ── Guards ────────────────────────────────────────────────────
  if (isLoading) return <LoadingOverlay mode="screen" status="loading" />;
  if (error) return <LoadingOverlay mode="screen" status="error" text={getErrorMessage(error)} />;

  const currentUserId = user?.id ?? 'mock-host';

  return (
    <>
      <GameStartingOverlay visible={lobbyState.gameStarting} />

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
                isHost={isHost}
                boards={boards ?? []}
                selectedBoardId={lobbyState.selectedBoardId}
                disabledCharacterIds={lobbyState.disabledCharacterIds}
                onSelectBoard={selectBoard}
                onConfirmBoard={confirmBoard}
                onToggleCharacter={toggleCharacter}
                onConfirmCharacters={confirmCharacters}
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
                <LobbySettings
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
                  onReady={setReady}
                  onKick={kickPlayer}
                  onTransferHost={transferHost}
                  onStartGame={triggerGameStarting}
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
