'use client';

import { type CSSProperties } from 'react';
import { Box, Button, Center, Group, Text } from '@mantine/core';
import { type BoardDto } from '@shared/types/board.types';
import { type LobbyPhase } from '@/hooks/useLobby';
import { type GridItemData } from '@components/Board/GridCard';
import GridContainer from '@components/Board/GridContainer';
import LoadingOverlay from '@components/LoadingOverlay';
import { CharacterToggleGrid } from './CharacterToggleGrid';
import { buttonThemes } from '@styles/buttonThemes';
import { useNotify } from '@/hooks/useNotify';
import { useRouter } from 'next/navigation';

interface LobbyBoardPanelProps {
  phase: LobbyPhase;
  isHost: boolean;
  boards: BoardDto[];
  selectedBoardId: string | null;
  disabledCharacterIds: string[];
  onSelectBoard: (boardId: string) => void;
  onConfirmBoard: () => void;
  onToggleCharacter: (characterId: string) => void;
  onConfirmCharacters: () => void;
}

const FOOTER_STYLE: CSSProperties = {
  flexShrink: 0,
  padding: '12px 16px',
  borderTop: '1px solid #33465f',
  backgroundColor: '#243040',
};

export function LobbyBoardPanel({
  phase,
  isHost,
  boards,
  selectedBoardId,
  disabledCharacterIds,
  onSelectBoard,
  onConfirmBoard,
  onToggleCharacter,
  onConfirmCharacters,
}: LobbyBoardPanelProps) {
  const notify = useNotify();
  const router = useRouter();

  const selectedBoard = boards.find((b) => b.id === selectedBoardId) ?? null;

  // ── Phase 1: Board selection ──────────────────────────────────

  if (phase === 'board-selection') {
    if (!isHost) {
      return <LoadingOverlay mode="screen" status="loading" text="Host is selecting a board…" />;
    }

    const gridItems: GridItemData[] = boards.map((board) => {
      const count = board.characters?.length ?? 0;
      return {
        id: board.id,
        name: board.name,
        imageUrl: board.image?.imageUrl,
        selected: board.id === selectedBoardId,
        badge: {
          label: count >= 24 ? `${count} chars` : `${count}/24`,
          color: count >= 24 ? '#4caf7d' : '#fa5252',
        },
      };
    });

    const handleBoardClick = (item: GridItemData) => {
      const board = boards.find((b) => b.id === item.id);
      if (!board) return;
      if ((board.characters?.length ?? 0) < 24) {
        notify.error('This board needs at least 24 characters to be used in a game.');
        return;
      }
      onSelectBoard(item.id);
    };

    return (
      <Box style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box style={{ flex: 1, overflow: 'hidden' }}>
          <GridContainer
            items={gridItems}
            showSearch
            searchPlaceholder="Search boards…"
            onItemClick={handleBoardClick}
            colCount={4}
            onBack={() => router.push('/')}
          />
        </Box>
        <Box style={FOOTER_STYLE}>
          <Button
            fullWidth
            size="sm"
            disabled={!selectedBoardId}
            onClick={onConfirmBoard}
            color={buttonThemes.primary.color}
            c={buttonThemes.primary.textColor}
            styles={{ root: { borderColor: buttonThemes.primary.borderColor } }}
          >
            {selectedBoardId ? `Confirm — ${selectedBoard?.name ?? 'Board'}` : 'Select a board'}
          </Button>
        </Box>
      </Box>
    );
  }

  // ── Phase 2+: Character config / waiting-for-ready ──────────

  const characters = selectedBoard?.characters?.filter(Boolean) ?? [];
  const enabledCount = characters.length - disabledCharacterIds.length;
  const canConfirm = enabledCount >= 24;

  return (
    <Box style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Board info header — always visible so you know what board is selected */}
      <Box
        style={{
          flexShrink: 0,
          padding: '10px 16px',
          borderBottom: '1px solid #33465f',
          backgroundColor: '#1f2a3a',
        }}
      >
        <Group gap="sm" align="center">
          {selectedBoard?.image?.imageUrl ? (
            <img
              src={selectedBoard.image.imageUrl}
              alt={selectedBoard.name}
              style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }}
            />
          ) : (
            <Center
              w={36}
              h={36}
              style={{ borderRadius: 6, backgroundColor: '#2f3e55', flexShrink: 0 }}
            >
              <Text size="xs" c="#6b7f96">
                ?
              </Text>
            </Center>
          )}
          <Box>
            <Text size="sm" fw={600} c="#e6edf3">
              {selectedBoard?.name ?? 'Board'}
            </Text>
            <Text size="xs" c="#6b7f96">
              {characters.length} characters
            </Text>
          </Box>
        </Group>
      </Box>

      {/* Character grid */}
      <Box style={{ flex: 1, overflow: 'hidden' }}>
        <CharacterToggleGrid
          characters={characters}
          disabledCharacterIds={disabledCharacterIds}
          isHost={isHost}
          onToggle={onToggleCharacter}
        />
      </Box>

      {/* Footer — only shown to host during character-config phase */}
      {isHost && phase === 'character-config' && (
        <Box style={FOOTER_STYLE}>
          <Button
            fullWidth
            size="sm"
            disabled={!canConfirm}
            onClick={onConfirmCharacters}
            color={buttonThemes.primary.color}
            c={buttonThemes.primary.textColor}
            styles={{ root: { borderColor: buttonThemes.primary.borderColor } }}
          >
            {canConfirm ? 'Confirm Characters' : `Need ${24 - enabledCount} more enabled`}
          </Button>
        </Box>
      )}
    </Box>
  );
}
