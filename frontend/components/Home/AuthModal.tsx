'use client';

import { Modal, Stack, TextInput, Button, Divider, Text, Box } from '@mantine/core';
import { IconBrandGoogle, IconUser } from '@tabler/icons-react';
import { useState } from 'react';
import { useAuth } from '@providers/auth-provider';
import { buttonThemes } from '@styles/buttonThemes';
import { notifications } from '@mantine/notifications';

interface AuthModalProps {
  opened: boolean;
}

export function AuthModal({ opened }: AuthModalProps) {
  const { loginWithGoogle, loginAsGuest } = useAuth();
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const trimmed = name.trim();
  // If the user typed something it must meet the length requirement.
  // Empty is fine — the backend will generate a name.
  const nameError = trimmed.length > 0 && (trimmed.length < 2 || trimmed.length > 20);
  const canSubmit = !nameError && !isSubmitting;

  const handleGuestLogin = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    try {
      // Pass trimmed name, or undefined to let the backend generate one
      await loginAsGuest(trimmed || undefined);
    } catch {
      notifications.show({
        title: 'Something went wrong',
        message: 'Could not start a guest session. Please try again.',
        color: 'red',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={() => {}}
      withCloseButton={false}
      closeOnClickOutside={false}
      closeOnEscape={false}
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
        {/* Header */}
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
            Pick a name to jump in, or sign in for a permanent account
          </Text>
        </Box>

        {/* Guest Login */}
        <Stack gap="sm">
          <TextInput
            placeholder="Leave blank for a random name"
            size="md"
            leftSection={<IconUser size={18} />}
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleGuestLogin();
            }}
            maxLength={20}
            error={nameError ? 'Name must be between 2 and 20 characters' : undefined}
            styles={{
              input: {
                backgroundColor: '#1f2a3a',
                borderColor: '#33465f',
                color: 'white',
              },
            }}
          />

          <Button
            size="md"
            onClick={handleGuestLogin}
            disabled={!canSubmit}
            loading={isSubmitting}
            color={buttonThemes.primary.color}
            c={buttonThemes.primary.textColor}
            fullWidth
            styles={{
              root: { borderColor: buttonThemes.primary.borderColor },
            }}
          >
            Play as Guest
          </Button>
        </Stack>

        <Divider
          label="or"
          labelPosition="center"
          styles={{ label: { color: '#6b7f96', fontSize: '0.75rem' } }}
        />

        {/* Google Login */}
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
          Guest sessions last 90 days. Sign in with Google for a permanent account.
        </Text>
      </Stack>
    </Modal>
  );
}
