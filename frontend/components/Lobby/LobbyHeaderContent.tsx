'use client';

import { Avatar, Divider, Group, Text } from '@mantine/core';
import { JoinCodePill } from './JoinCodePill';
import { type LobbyPlayer } from '@/hooks/useLobby';

interface LobbyHeaderContentProps {
  code: string;
  players: LobbyPlayer[];
}

function PlayerChip({ player }: { player: LobbyPlayer | undefined }) {
  if (!player) return null;
  return (
    <Group gap="xs" align="center">
      <Avatar size="sm" src={player.profilePicture} radius="xl" color="cyan">
        {player.name?.[0]?.toUpperCase() ?? '?'}
      </Avatar>
      <Text size="sm" c={player.isConnected ? '#e6edf3' : '#6b7f96'} style={{ maxWidth: 100 }} truncate>
        {player.name}
      </Text>
      {/* Connection dot */}
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: player.isConnected ? '#4caf7d' : '#6b7f96',
          flexShrink: 0,
        }}
      />
    </Group>
  );
}

export function LobbyHeaderContent({ code, players }: LobbyHeaderContentProps) {
  const host = players.find((p) => p.isHost);
  const joiner = players.find((p) => !p.isHost);

  return (
    <Group gap="md" align="center" wrap="nowrap">
      <PlayerChip player={host} />
      <Text size="sm" c="#6b7f96">
        vs
      </Text>
      {joiner ? (
        <PlayerChip player={joiner} />
      ) : (
        <Text size="sm" c="#6b7f96" style={{ fontStyle: 'italic' }}>
          Waiting for player…
        </Text>
      )}
      <Divider orientation="vertical" color="#33465f" />
      <JoinCodePill code={code} />
    </Group>
  );
}
