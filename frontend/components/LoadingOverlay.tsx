import { Box, Flex, Loader, Text } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';

// ─── Screen mode ────────────────────────────────────────────────────────────
// Full-area replacement for loading, error, or empty states.
// Use this where StatusScreen was used before.

interface ScreenProps {
  mode: 'screen';
  status?: 'loading' | 'error' | 'empty';
  text?: string;
}

// ─── Overlay mode ────────────────────────────────────────────────────────────
// Absolutely positioned over the parent. Parent must have position: relative.
// Use this during mutations to block interaction and show a progress message.

interface OverlayProps {
  mode: 'overlay';
  visible: boolean;
  message?: string;
}

type LoadingOverlayProps = ScreenProps | OverlayProps;

const screenDefaults = {
  loading: 'Loading...',
  error: 'Something went wrong',
  empty: 'Nothing here yet',
};

export default function LoadingOverlay(props: LoadingOverlayProps) {
  if (props.mode === 'overlay') {
    if (!props.visible) return null;

    return (
      <Box
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(27, 36, 48, 0.75)',
          backdropFilter: 'blur(2px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 12,
          zIndex: 50,
          borderRadius: 'inherit',
        }}
      >
        <Loader color="#8ecae6" size="md" />
        {props.message && (
          <Text c="#8ecae6" size="sm" fw={500}>
            {props.message}
          </Text>
        )}
      </Box>
    );
  }

  // Screen mode
  const { status = 'loading', text } = props;
  const message = text ?? screenDefaults[status];

  return (
    <Flex justify="center" align="center" h="100%" gap="sm">
      {status === 'loading' && <Loader color="#8ecae6" size="sm" />}
      {status === 'error' && <IconAlertCircle size={20} color="#fa5252" />}
      <Text c={status === 'error' ? 'red' : 'dimmed'} size="sm">
        {message}
      </Text>
    </Flex>
  );
}
