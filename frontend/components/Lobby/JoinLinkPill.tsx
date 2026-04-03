'use client';

import { Group, Text } from '@mantine/core';
import { IconCopy, IconLink } from '@tabler/icons-react';
import { useEffect, useState } from 'react';

interface JoinLinkPillProps {
  link: string; // full URL, e.g. https://playguess.io/lobby/ABC123
}

export function JoinLinkPill({ link }: JoinLinkPillProps) {
  const [copied, setCopied] = useState(false);

  // Extract the lobby code from the end of the URL for display
  const displayCode = link.split('/').pop()?.toUpperCase() ?? link;

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(t);
  }, [copied]);

  const handleClick = () => {
    navigator.clipboard.writeText(link).then(() => setCopied(true));
  };

  return (
    <Group gap="xs" align="center">
      <Text size="xs" c="#6b7f96" style={{ userSelect: 'none' }}>
        Invite:
      </Text>
      <Group
        gap="xs"
        align="center"
        onClick={handleClick}
        title={link}
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
        <IconLink size={14} color="#6b7f96" />
        <Text size="sm" fw={600} c={copied ? '#4caf7d' : '#8ecae6'} ff="monospace">
          {copied ? 'Copied!' : displayCode}
        </Text>
        <IconCopy size={14} color="#6b7f96" />
      </Group>
    </Group>
  );
}
