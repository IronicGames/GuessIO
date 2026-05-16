'use client';

import { Box, Divider, SegmentedControl, Stack, Text } from '@mantine/core';
import { GameMode, TurnTimer, type LobbySettings } from '@shared/types/lobby.types';
interface LobbySettingsProps {
  settings: LobbySettings;
  isHost: boolean;
  onChange: (patch: Partial<LobbySettings>) => void;
}

const segmentStyles = {
  root: { backgroundColor: '#1f2a3a', border: '1px solid #33465f' },
  indicator: { backgroundColor: '#8ecae6' },
  label: { color: '#e6edf3' },
  control: { borderColor: 'transparent' },
};

export function LobbySettingsPanel({ settings, isHost, onChange }: LobbySettingsProps) {
  const isCasual = settings.mode === GameMode.CASUAL;
  // TODO: Remove this when we are sure about Tag Mode
  const disabled = true;
  const handleModeChange = (value: string) => {
    const mode = value as LobbySettings['mode'];
    // Casual always forces timer off
    onChange({ mode, turnTimer: mode === GameMode.CASUAL ? TurnTimer.OFF : settings.turnTimer });
  };

  return (
    <Stack
      gap="sm"
      p="md"
      style={{ pointerEvents: isHost ? 'auto' : 'none', opacity: isHost ? 1 : 0.7 }}
    >
      <Text size="sm" fw={600} c="#e6edf3">
        Settings
        {!isHost && (
          <Text span size="xs" c="#6b7f96" ml="xs">
            (host controls)
          </Text>
        )}
      </Text>

      <Divider color="#33465f" />

      <Box>
        <Text size="xs" c="#6b7f96" mb={4}>
          Mode
        </Text>
        <SegmentedControl
          fullWidth
          size="sm"
          value={settings.mode}
          onChange={handleModeChange}
          disabled={disabled}
          data={[
            { label: 'Casual', value: 'CASUAL' },
            { label: 'Tag', value: 'TAG' },
          ]}
          styles={segmentStyles}
        />
      </Box>

      <Box>
        <Text size="xs" c={isCasual ? '#4a5c70' : '#6b7f96'} mb={4}>
          Turn Timer {isCasual && '(Casual — always off)'}
        </Text>
        <SegmentedControl
          fullWidth
          size="sm"
          value={settings.turnTimer}
          onChange={(v) => onChange({ turnTimer: v as LobbySettings['turnTimer'] })}
          disabled={isCasual}
          data={[
            { label: 'Off', value: 'OFF' },
            { label: '30s', value: '30s' },
            { label: '1m', value: '1m' },
            { label: '3m', value: '3m' },
          ]}
          styles={segmentStyles}
        />
      </Box>

      <Box>
        <Text size="xs" c="#6b7f96" mb={4}>
          Lives
        </Text>
        <SegmentedControl
          fullWidth
          size="sm"
          value={settings.lives}
          onChange={(v) => onChange({ lives: v as LobbySettings['lives'] })}
          data={[
            { label: '1', value: '1' },
            { label: '3', value: '3' },
            { label: '∞', value: 'INF' },
          ]}
          styles={segmentStyles}
        />
      </Box>
    </Stack>
  );
}
