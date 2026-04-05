'use client';

import { Modal, Text, Group, Button } from '@mantine/core';

interface ConfirmDeleteModalProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message?: string;
  loading?: boolean;
}

export default function ConfirmDeleteModal({
  opened,
  onClose,
  onConfirm,
  message = 'This cannot be undone.',
  loading = false,
}: ConfirmDeleteModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Confirm Delete"
      centered
      size="sm"
      styles={{
        content: { backgroundColor: '#2f3e55' },
        header: { backgroundColor: '#2f3e55' },
        title: { color: 'white', fontWeight: 600 },
      }}
    >
      <Text size="sm" c="dimmed">
        {message}
      </Text>
      <Group justify="flex-end" mt="md">
        <Button variant="subtle" c="dimmed" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button color="red" onClick={onConfirm} loading={loading}>
          Delete
        </Button>
      </Group>
    </Modal>
  );
}
