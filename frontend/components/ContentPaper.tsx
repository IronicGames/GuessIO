import { Paper, Stack } from '@mantine/core';
import { ReactNode, CSSProperties } from 'react';

interface ContentPaperProps {
  children: ReactNode;
  w?: string | number | Record<string, string | number>;
  h?: string | number | Record<string, string | number>;
  style?: CSSProperties;
}

export default function ContentPaper({
  children,
  w = '100%',
  h = '100%',
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
        overflow: 'auto',
        ...style,
      }}
    >
      <Stack gap="md" style={{ flex: 1 }}>
        {children}
      </Stack>
    </Paper>
  );
}
