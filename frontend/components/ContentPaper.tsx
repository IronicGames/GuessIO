import { Paper } from '@mantine/core';
import { type ReactNode, type CSSProperties } from 'react';

interface ContentPaperProps {
  children: ReactNode;
  w?: string | number | Record<string, string | number>;
  h?: string | number | Record<string, string | number>;
  style?: CSSProperties;
}

export default function ContentPaper({
  children,
  w = '100%',
  h = 'auto',
  style,
}: ContentPaperProps) {
  return (
    <Paper
      w={w}
      h={h}
      withBorder
      shadow="xl"
      radius="md"
      bg="#243040"
      style={{
        borderColor: '#33465f',
        borderWidth: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        ...style,
      }}
    >
      {children}
    </Paper>
  );
}
