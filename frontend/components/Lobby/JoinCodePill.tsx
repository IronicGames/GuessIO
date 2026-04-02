'use client';

import { Group, Text } from '@mantine/core';
import { IconCopy, IconEye, IconEyeOff } from '@tabler/icons-react';
import { useEffect, useState } from 'react';

interface JoinCodePillProps {
  code: string;
}

export function JoinCodePill({ code }: JoinCodePillProps) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  // Reset "Copied!" feedback after 1.5 seconds
  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(t);
  }, [copied]);

  const handleClick = () => {
    if (!revealed) {
      setRevealed(true);
    } else {
      navigator.clipboard.writeText(code).then(() => setCopied(true));
    }
  };

  const EyeIcon = revealed ? IconEyeOff : IconEye;
  const ActionIcon = revealed ? IconCopy : null;

  return (
    <Group gap="xs" align="center">
      <Text size="xs" c="#6b7f96" style={{ userSelect: 'none' }}>
        Lobby Code
      </Text>
      <Group
        gap="xs"
        align="center"
        onClick={handleClick}
        style={{
          borderRadius: 20,
          backgroundColor: '#2f3e55',
          border: '1px solid #33465f',
          padding: '4px 12px',
          cursor: 'pointer',
          userSelect: 'none',
          transition: 'border-color 0.15s ease',
        }}
      >
        <EyeIcon size={14} color="#6b7f96" />
        <Text size="sm" fw={600} c={revealed ? '#8ecae6' : '#6b7f96'} ff="monospace">
          {copied ? 'Copied!' : revealed ? code : '••••••'}
        </Text>
        {ActionIcon && <ActionIcon size={14} color="#6b7f96" />}
      </Group>
    </Group>
  );
}
