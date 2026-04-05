'use client';

import { Box, Button, Group, Stack, Text } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import type { ReactNode } from 'react';
import { buttonThemes } from '@styles/buttonThemes';
import BackButton from '@components/BackButton';

interface FormShellProps {
  title: string;
  onBack?: () => void;
  children: ReactNode;
  onSubmit: () => void;
  onCancel: () => void;
  onDelete?: () => void;
  isSubmitting?: boolean;
  isDeleting?: boolean;
  canSubmit?: boolean;
  submitText?: string;
  cancelText?: string;
  deleteText?: string;
}

export default function FormShell({
  title,
  onBack,
  children,
  onSubmit,
  onCancel,
  onDelete,
  isSubmitting = false,
  isDeleting = false,
  canSubmit = true,
  submitText = 'Save',
  cancelText = 'Cancel',
  deleteText = 'Delete',
}: FormShellProps) {
  return (
    <Box
      p="lg"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <Box style={{ flex: 1, overflowY: 'auto', paddingRight: 8 }}>
        <Stack gap="lg" w="100%">
          <Group gap="xs" align="center">
            {onBack && <BackButton onClick={onBack} />}
            <Text size="xl" fw={700} c="white">
              {title}
            </Text>
          </Group>

          {children}
        </Stack>
      </Box>

      <Box
        style={{
          flexShrink: 0,
          backgroundColor: '#243040',
          paddingTop: '1.2rem',
          paddingRight: '0.5rem',
          borderTop: '1px solid #33465f',
          zIndex: 10,
        }}
      >
        <Stack gap="sm" w="100%">
          <Group wrap="nowrap" gap="md" grow>
            <Button
              variant="outline"
              size="lg"
              onClick={onCancel}
              disabled={isSubmitting || isDeleting}
              styles={{
                root: {
                  borderColor: buttonThemes.secondary.borderColor,
                  color: buttonThemes.secondary.textColor,
                },
              }}
            >
              {cancelText}
            </Button>

            <Button
              size="lg"
              onClick={onSubmit}
              disabled={!canSubmit || isSubmitting || isDeleting}
              loading={isSubmitting}
              color={buttonThemes.primary.color}
              c={buttonThemes.primary.textColor}
              styles={{
                root: { borderColor: buttonThemes.primary.borderColor },
              }}
            >
              {submitText}
            </Button>
          </Group>

          {onDelete && (
            <Button
              variant="outline"
              size="lg"
              color="red"
              leftSection={<IconTrash size={20} />}
              onClick={onDelete}
              disabled={isSubmitting || isDeleting}
              loading={isDeleting}
              fullWidth
            >
              {deleteText}
            </Button>
          )}
        </Stack>
      </Box>
    </Box>
  );
}
