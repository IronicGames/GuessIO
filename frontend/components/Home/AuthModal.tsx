'use client';

import { Modal, Stack, Button, Text, Box } from '@mantine/core';
import { IconBrandGoogle } from '@tabler/icons-react';
import { useAuth } from '@providers/auth-provider';

// 'session'       — user has no session at all (first visit / expired)
// 'needs-account' — user is a guest trying to access a player-only feature
type AuthModalReason = 'session' | 'needs-account';

interface AuthModalProps {
  opened: boolean;
  onClose?: () => void; // only provided when the modal is dismissible (needs-account case)
  reason?: AuthModalReason;
}

const copy = {
  session: {
    subtitle: 'Sign in with Google for a permanent account.',
    // no dismiss — user must authenticate to use the app
    dismissible: false,
  },
  'needs-account': {
    subtitle: 'You need a permanent account to manage boards. Sign in with Google to continue.',
    dismissible: true,
  },
};

export function AuthModal({ opened, onClose, reason = 'session' }: AuthModalProps) {
  const { loginWithGoogle } = useAuth();
  const { subtitle, dismissible } = copy[reason];

  return (
    <Modal
      opened={opened}
      onClose={dismissible && onClose ? onClose : () => {}}
      withCloseButton={dismissible}
      closeOnClickOutside={dismissible}
      closeOnEscape={dismissible}
      centered
      size="sm"
      radius="md"
      overlayProps={{ blur: 4, backgroundOpacity: 0.6 }}
      styles={{
        content: {
          backgroundColor: '#243040',
          border: '1px solid #33465f',
        },
        header: {
          backgroundColor: '#243040',
        },
      }}
    >
      <Stack gap="xl" p="md">
        <Box ta="center">
          <Text
            fw={800}
            size="2rem"
            style={{
              color: '#8ecae6',
              letterSpacing: '-0.5px',
              lineHeight: 1,
            }}
          >
            guess.io
          </Text>
          <Text c="dimmed" size="sm" mt={6}>
            {subtitle}
          </Text>
        </Box>

        <Button
          size="md"
          variant="outline"
          leftSection={<IconBrandGoogle size={18} />}
          onClick={loginWithGoogle}
          fullWidth
          styles={{
            root: {
              borderColor: '#33465f',
              color: '#e6edf3',
            },
          }}
        >
          Sign in with Google
        </Button>

        <Text size="xs" c="dimmed" ta="center">
          Signing in gives you a permanent account and access to all features.
        </Text>
      </Stack>
    </Modal>
  );
}
