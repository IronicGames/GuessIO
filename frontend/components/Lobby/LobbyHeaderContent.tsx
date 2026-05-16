'use client';

import { Avatar, Divider, Group, Text } from '@mantine/core';
import { JoinLinkPill } from './JoinLinkPill';
import { type LobbyPlayer } from '@shared/types/lobby.types';
import { GamePlayerState } from '@shared/types/game-state.types';

interface LobbyHeaderContentProps {
  link: string;
  players: LobbyPlayer[] | GamePlayerState[]; // either LobbyPlayer or GamePlayerState is fine since we only read user and isConnected
}

function PlayerChip({ player }: { player: LobbyPlayer | GamePlayerState | undefined }) {
  if (!player) return null;
  return (
    <Group gap="xs" align="center">
      <Avatar size="sm" src={player.user.profilePicture} radius="xl" color="cyan">
        {player.user.name?.[0]?.toUpperCase() ?? '?'}
      </Avatar>
      <Text
        size="sm"
        c={player.isConnected ? '#e6edf3' : '#6b7f96'}
        style={{ maxWidth: 100 }}
        truncate
      >
        {player.user.name}
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

export function LobbyHeaderContent({ link, players }: LobbyHeaderContentProps) {
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
      <JoinLinkPill link={link} />
    </Group>
  );
}
