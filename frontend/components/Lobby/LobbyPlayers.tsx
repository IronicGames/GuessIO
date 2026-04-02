'use client';

import { Avatar, Box, Button, Divider, Group, Menu, Text } from '@mantine/core';
import { IconCrown, IconDotsVertical, IconSword, IconUserX } from '@tabler/icons-react';
import { type LobbyPlayer } from '@/hooks/useLobby';
import { buttonThemes } from '@styles/buttonThemes';

interface LobbyPlayersProps {
  players: LobbyPlayer[];
  currentUserId: string;
  isHost: boolean;
  onReady: () => void;
  onKick: (userId: string) => void;
  onTransferHost: (userId: string) => void;
  onStartGame: () => void;
}

function PlayerRow({
  player,
  isCurrentUser,
  isHost,
  currentUserId,
  onKick,
  onTransferHost,
}: {
  player: LobbyPlayer;
  isCurrentUser: boolean;
  isHost: boolean;
  currentUserId: string;
  onKick: (userId: string) => void;
  onTransferHost: (userId: string) => void;
}) {
  return (
    <Group justify="space-between" align="center" wrap="nowrap">
      <Group gap="sm" align="center" wrap="nowrap" style={{ minWidth: 0 }}>
        {/* Connection dot */}
        <Box
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: player.isConnected ? '#4caf7d' : '#6b7f96',
            flexShrink: 0,
          }}
        />

        <Avatar size="sm" src={player.profilePicture} radius="xl" color="cyan">
          {player.name?.[0]?.toUpperCase() ?? '?'}
        </Avatar>

        <Box style={{ minWidth: 0 }}>
          <Group gap={6} align="center" wrap="nowrap">
            <Text size="sm" c="#e6edf3" truncate>
              {player.name}
              {isCurrentUser && (
                <Text span size="xs" c="#6b7f96" ml={4}>
                  (you)
                </Text>
              )}
            </Text>
            {player.isHost && (
              <IconCrown size={14} color="#f5c542" style={{ flexShrink: 0 }} />
            )}
          </Group>
        </Box>
      </Group>

      <Group gap="xs" align="center" style={{ flexShrink: 0 }}>
        {/* Ready indicator */}
        <Box
          style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            backgroundColor: player.isReady ? '#4caf7d' : '#33465f',
            border: `2px solid ${player.isReady ? '#4caf7d' : '#6b7f96'}`,
            flexShrink: 0,
          }}
          title={player.isReady ? 'Ready' : 'Not ready'}
        />

        {/* Host actions — kick and transfer (shown to host for other players) */}
        {isHost && !isCurrentUser && (
          <Menu shadow="md" width={160} position="bottom-end">
            <Menu.Target>
              <Box style={{ cursor: 'pointer', padding: '2px 4px', color: '#6b7f96' }}>
                <IconDotsVertical size={14} />
              </Box>
            </Menu.Target>
            <Menu.Dropdown
              styles={{ dropdown: { backgroundColor: '#243040', borderColor: '#33465f' } }}
            >
              <Menu.Item
                leftSection={<IconSword size={14} />}
                style={{ color: '#8ecae6' }}
                onClick={() => onTransferHost(player.userId)}
              >
                Make host
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item
                leftSection={<IconUserX size={14} />}
                color="red"
                onClick={() => onKick(player.userId)}
              >
                Kick
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        )}
      </Group>
    </Group>
  );
}

// Ghost row for when the second slot is empty
function WaitingRow() {
  return (
    <Group gap="sm" align="center">
      <Box
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: '#6b7f96',
          flexShrink: 0,
        }}
      />
      <Avatar size="sm" radius="xl" color="gray">
        ?
      </Avatar>
      <Text size="sm" c="#6b7f96" style={{ fontStyle: 'italic' }}>
        Waiting for player…
      </Text>
    </Group>
  );
}

export function LobbyPlayers({
  players,
  currentUserId,
  isHost,
  onReady,
  onKick,
  onTransferHost,
  onStartGame,
}: LobbyPlayersProps) {
  const currentPlayer = players.find((p) => p.userId === currentUserId);
  const otherPlayers = players.filter((p) => p.userId !== currentUserId);
  const allReady = players.length === 2 && players.every((p) => p.isReady);

  // Sort: current user first, then others
  const sortedPlayers = currentPlayer ? [currentPlayer, ...otherPlayers] : players;

  return (
    <Box style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <Box style={{ flexShrink: 0, padding: '10px 12px 8px', borderBottom: '1px solid #33465f' }}>
        <Text size="sm" fw={600} c="#e6edf3">
          Players
        </Text>
      </Box>

      {/* Player list */}
      <Box style={{ flex: 1, padding: '12px' }}>
        <Box style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {sortedPlayers.map((player) => (
            <PlayerRow
              key={player.userId}
              player={player}
              isCurrentUser={player.userId === currentUserId}
              isHost={isHost}
              currentUserId={currentUserId}
              onKick={onKick}
              onTransferHost={onTransferHost}
            />
          ))}

          {/* Always show second slot if only 1 player */}
          {players.length < 2 && <WaitingRow />}
        </Box>
      </Box>

      <Divider color="#33465f" />

      {/* Footer — ready / start */}
      <Box style={{ flexShrink: 0, padding: '10px 12px' }}>
        {allReady && isHost ? (
          // Both players ready — host can start
          <Button
            fullWidth
            size="sm"
            color={buttonThemes.primary.color}
            c={buttonThemes.primary.textColor}
            styles={{ root: { borderColor: buttonThemes.primary.borderColor } }}
            onClick={() => {
              // TODO: socket.io — emit('lobby:start-game')
              onStartGame();
            }}
          >
            Start Game
          </Button>
        ) : currentPlayer && !currentPlayer.isReady ? (
          <Button
            fullWidth
            size="sm"
            color={buttonThemes.primary.color}
            c={buttonThemes.primary.textColor}
            styles={{ root: { borderColor: buttonThemes.primary.borderColor } }}
            onClick={onReady}
          >
            Ready
          </Button>
        ) : currentPlayer?.isReady && !allReady ? (
          <Text size="xs" c="#4caf7d" ta="center">
            ✓ You're ready — waiting for opponent
          </Text>
        ) : null}
      </Box>
    </Box>
  );
}
