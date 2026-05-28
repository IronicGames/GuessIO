'use client';

import { use, useEffect, useState } from 'react';
import { Flex, Group, Stack } from '@mantine/core';
import { useAuth } from '@providers/auth-provider';
import { useHeaderSlot } from '@providers/header-slot-provider';
import { useGame } from '@/hooks/useGame';
import { TurnAction, GamePhase } from '@shared/types/game-state.types';
import LoadingOverlay from '@components/LoadingOverlay';
import ContentPaperComponent from '@components/ContentPaper';
import { LobbyHeaderContent } from '@components/Lobby/LobbyHeaderContent';
import { GameBoard } from '@components/Game/GameBoard';
import { GameInfo } from '@components/Game/GameInfo';
import { GameActionPanel } from '@components/Game/GameActionPanel';
import { GameChatLog } from '@components/Game/GameChatLog';
import { GameOverBanner } from '@components/Game/GameOverBanner';

export default function GamePage({ params }: { params: Promise<{ gameId: string }> }) {
  const { gameId } = use(params);
  const { user } = useAuth();
  const { setCenterSlot } = useHeaderSlot();

  const {
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
  } = useGame(gameId, user);

  // Cross-offs are frontend-only — never sent to server, never persisted
  const [crossedOffIds, setCrossedOffIds] = useState<Set<string>>(new Set());

  // The card currently highlighted on the board — used for both CHARACTER_SELECTION
  // (choosing your secret) and SUBMIT+GUESS (selecting who to guess)
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Inject player chips into the header center slot (same pattern as lobby page)
  useEffect(() => {
    setCenterSlot(
      <LobbyHeaderContent
        link="" // no join link during an active game
        players={gameState.players}
      />,
    );
    return () => setCenterSlot(null);
  }, [gameState.players, setCenterSlot]);

  // ── Guards ────────────────────────────────────────────────────────────
  // Wait until this player's data appears in the game state (server sends game:state on join)
  if (!gameState.players.some((p) => p.user.id === user?.id)) {
    return <LoadingOverlay mode="screen" status="loading" />;
  }

  // ── Derived state ─────────────────────────────────────────────────────
  const drawnCharacters = gameState.board.characters?.filter((c) =>
    gameState.drawnCharacterIds.includes(c.id),
  ) ?? [];

  const yourCharacter = drawnCharacters.find((c) => c.id === yourCharacterId) ?? null;
  const selectedCharacter = drawnCharacters.find((c) => c.id === selectedId) ?? null;
  const myPlayer = gameState.players.find((p) => p.isPlayer1 === isPlayer1);

  // Determine board interaction mode based on current phase
  const boardMode = ((): 'crossoff' | 'select' | 'locked' => {
    if (gameState.phase === GamePhase.GAME_OVER) return 'locked';
    if (gameState.phase === GamePhase.CHARACTER_SELECTION)
      return myPlayer?.hasChosen ? 'locked' : 'select';
    if (gameState.phase === GamePhase.SUBMIT && gameState.currentAction === TurnAction.GUESS && isMyTurn) return 'select';
    if (gameState.phase === GamePhase.RESOLVE) return 'locked';
    if (!isMyTurn) return 'locked';
    return 'crossoff';
  })();

  // Handlers
  const toggleCrossOff = (id: string) => {
    setCrossedOffIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleBoardSelect = (id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
  };

  const handleConfirmCharacter = () => {
    if (!selectedId) return;
    selectCharacter(selectedId);
    setSelectedId(null);
  };

  const handleSubmitGuess = () => {
    if (!selectedId) return;
    submitGuess(selectedId);
    setSelectedId(null);
  };

  const handlePickRandom = () => {
    if (drawnCharacters.length === 0) return;
    const random = drawnCharacters[Math.floor(Math.random() * drawnCharacters.length)];
    selectCharacter(random.id);
    setSelectedId(null);
  };

  return (
    <Flex justify="center" p="md">
      <Stack gap="md" w={{ base: '100%', sm: '95%', lg: '90%' }} style={{ maxWidth: 1400 }}>
        <Group align="stretch" gap="md" style={{ flexWrap: 'wrap' }}>

          {/* Left panel — character board (65%) */}
          <ContentPaperComponent
            w={{ base: '100%', md: '65%' }}
            h={{ base: 500, md: '82vh' }}
            style={{ flex: 1, minWidth: 300 }}
          >
            <GameBoard
              characters={drawnCharacters}
              crossedOffIds={crossedOffIds}
              selectedId={selectedId}
              yourCharacterId={yourCharacterId}
              mode={boardMode}
              onCrossOff={toggleCrossOff}
              onSelect={handleBoardSelect}
            />
          </ContentPaperComponent>

          {/* Right panel — info + actions + chat/log (30%) */}
          <Stack
            gap="md"
            w={{ base: '100%', md: '30%' }}
            h={{ base: 'auto', md: '82vh' }}
            style={{ minWidth: 260, display: 'flex', flexDirection: 'column' }}
          >
            {/* Game info — turn indicator, lives, your character, timers */}
            <ContentPaperComponent style={{ flexShrink: 0 }}>
              <GameInfo
                players={gameState.players}
                isPlayer1={isPlayer1}
                yourCharacterId={yourCharacterId}
                yourCharacter={yourCharacter}
                phase={gameState.phase}
                turnNumber={gameState.turnNumber}
                currentTurnIsPlayer1={gameState.currentTurnIsPlayer1}
                settings={gameState.settings}
                turnTimerExpiresAt={gameState.turnTimerExpiresAt}
                gameTimerExpiresAt={gameState.gameTimerExpiresAt}
              />
            </ContentPaperComponent>

            {/* Action panel — changes content based on phase */}
            <ContentPaperComponent style={{ flexShrink: 0 }}>
              {gameState.phase === GamePhase.GAME_OVER &&
              gameState.result &&
              gameState.resultReason ? (
                <GameOverBanner
                  result={gameState.result}
                  resultReason={gameState.resultReason}
                  winnerIsPlayer1={gameState.winnerIsPlayer1}
                  isPlayer1={isPlayer1}
                />
              ) : (
                <GameActionPanel
                  phase={gameState.phase}
                  isMyTurn={isMyTurn}
                  mode={gameState.settings.mode}
                  currentAction={gameState.currentAction}
                  selectedId={selectedId}
                  selectedCharacter={selectedCharacter}
                  myPlayer={myPlayer}
                  onChooseAction={chooseAction}
                  onConfirmCharacter={handleConfirmCharacter}
                  onPickRandom={handlePickRandom}
                  onSubmitAsk={submitAsk}
                  onSubmitGuess={handleSubmitGuess}
                  onEndTurn={endTurn}
                />
              )}
            </ContentPaperComponent>

            {/* Chat + game log tabs */}
            <ContentPaperComponent style={{ flex: 1, minHeight: 220 }}>
              <GameChatLog
                messages={gameState.chat}
                log={log}
                currentUserName={user?.name ?? 'You'}
                player1Name={gameState.players.find((p) => p.isPlayer1)?.user.name ?? 'Player 1'}
                player2Name={gameState.players.find((p) => !p.isPlayer1)?.user.name ?? 'Player 2'}
                onSend={sendChatMessage}
              />
            </ContentPaperComponent>
          </Stack>

        </Group>
      </Stack>
    </Flex>
  );
}
