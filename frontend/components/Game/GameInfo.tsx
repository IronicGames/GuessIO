'use client';

import { Divider, Group, Image, Paper, Stack, Text } from '@mantine/core';
import { IconHeart, IconHeartBroken } from '@tabler/icons-react';
import { type CharacterDto } from '@shared/types/character.types';
import { type LobbySettings, Lives } from '@shared/types/lobby.types';
import { type GamePlayerState, GamePhase } from '@shared/types/game-state.types';
import { useCountdown } from '@/hooks/useCountdown';

function formatMs(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

interface GameInfoProps {
  players: GamePlayerState[];
  isPlayer1: boolean;
  yourCharacterId: string | null;
  yourCharacter: CharacterDto | null;
  phase: GamePhase;
  turnNumber: number;
  currentTurnIsPlayer1: boolean;
  settings: LobbySettings;
  turnTimerExpiresAt: string | null;
  gameTimerExpiresAt: string | null;
}

function LivesDisplay({ remaining, infinite }: { remaining: number; infinite: boolean }) {
  if (infinite) {
    return (
      <Text c="#6b7f96" fz="xs">
        ∞
      </Text>
    );
  }
  return (
    <Group gap={2}>
      {Array.from({ length: remaining }).map((_, i) => (
        <IconHeart key={i} size={14} color="#fa5252" fill="#fa5252" />
      ))}
      {remaining === 0 && <IconHeartBroken size={14} color="#fa5252" />}
    </Group>
  );
}

export function GameInfo({
  players,
  isPlayer1,
  yourCharacterId,
  yourCharacter,
  phase,
  turnNumber,
  currentTurnIsPlayer1,
  settings,
  turnTimerExpiresAt,
  gameTimerExpiresAt,
}: GameInfoProps) {
  const isMyTurn = currentTurnIsPlayer1 === isPlayer1;
  const turnRemaining = useCountdown(turnTimerExpiresAt);
  const gameRemaining = useCountdown(gameTimerExpiresAt);
  const isInfinite = settings.lives === Lives.INFINITE;

  const me = players.find((p) => p.isPlayer1 === isPlayer1);
  const opponent = players.find((p) => p.isPlayer1 !== isPlayer1);

  return (
    <Stack gap="sm" p="xs">
      {/* Turn indicator */}
      {phase !== GamePhase.CHARACTER_SELECTION && phase !== GamePhase.GAME_OVER && (
        <Text fw={600} fz="sm" c={isMyTurn ? '#8ecae6' : '#6b7f96'}>
          {isMyTurn ? 'Your turn' : "Opponent's turn"}
        </Text>
      )}

      {phase === GamePhase.CHARACTER_SELECTION && (
        <Text fw={600} fz="sm" c="#8ecae6">
          Choose your character
        </Text>
      )}

      {/* Turn number */}
      {phase !== GamePhase.CHARACTER_SELECTION && (
        <Text fz="xs" c="#6b7f96">
          Turn {turnNumber}
        </Text>
      )}

      <Divider color="#33465f" />

      {/* Lives — both players */}
      <Stack gap={4}>
        <Text fz="xs" c="#6b7f96" fw={500}>
          Lives
        </Text>
        <Group justify="space-between">
          <Stack gap={2} align="center">
            <Text fz="xs" c="#6b7f96">
              You
            </Text>
            <LivesDisplay remaining={me?.livesRemaining ?? 0} infinite={isInfinite} />
          </Stack>
          <Stack gap={2} align="center">
            <Text fz="xs" c="#6b7f96">
              Opponent
            </Text>
            <LivesDisplay
              remaining={opponent?.livesRemaining ?? 0}
              infinite={isInfinite}
            />
          </Stack>
        </Group>
      </Stack>

      <Divider color="#33465f" />

      {/* Your secret character */}
      <Stack gap={4}>
        <Text fz="xs" c="#6b7f96" fw={500}>
          Your character
        </Text>
        {yourCharacterId && yourCharacter ? (
          <Paper
            radius="sm"
            style={{
              backgroundColor: '#1f2a3a',
              border: '1px solid #33465f',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '4px 8px',
            }}
          >
            {yourCharacter.image && (
              <Image
                src={yourCharacter.image.imageUrl}
                alt={yourCharacter.name}
                w={32}
                h={32}
                radius="sm"
                style={{ objectFit: 'cover', flexShrink: 0 }}
              />
            )}
            <Text fz="xs" fw={500} c="#e6edf3" lineClamp={1}>
              {yourCharacter.name}
            </Text>
          </Paper>
        ) : (
          <Text fz="xs" c="#6b7f96" fs="italic">
            {phase === GamePhase.CHARACTER_SELECTION
              ? 'Click a character on the board'
              : 'Not chosen'}
          </Text>
        )}
      </Stack>

      <Divider color="#33465f" />

      {/* Timers — only rendered when at least one is active */}
      {(turnRemaining !== null || gameRemaining !== null) && (
        <>
          <Divider color="#33465f" />
          <Stack gap={4}>
            {turnRemaining !== null && (
              <Group justify="space-between" align="center">
                <Text fz="xs" c="#6b7f96" fw={500}>
                  {isMyTurn ? 'Your turn' : 'Their turn'}
                </Text>
                <Text fz="sm" fw={700} c={turnRemaining < 10_000 ? '#fa5252' : '#e6edf3'}>
                  {formatMs(turnRemaining)}
                </Text>
              </Group>
            )}
            {gameRemaining !== null && (
              <Group justify="space-between" align="center">
                <Text fz="xs" c="#6b7f96" fw={500}>
                  Game
                </Text>
                <Text fz="sm" fw={600} c={gameRemaining < 60_000 ? '#fa5252' : '#6b7f96'}>
                  {formatMs(gameRemaining)}
                </Text>
              </Group>
            )}
          </Stack>
        </>
      )}
    </Stack>
  );
}
