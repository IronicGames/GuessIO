'use client';

import { IconArrowLeft } from '@tabler/icons-react';
import { Box } from '@mantine/core';

interface BackButtonProps {
  onClick: () => void;
}

export default function BackButton({ onClick }: BackButtonProps) {
  return (
    <Box
      onClick={onClick}
      style={{
        cursor: 'pointer',
        color: '#8ecae6',
        display: 'flex',
        alignItems: 'center',
        flexShrink: 0,
        transition: 'opacity 0.15s ease',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.7')}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
    >
      <IconArrowLeft size={22} />
    </Box>
  );
}
