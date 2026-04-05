'use client';

import { Modal, Text, Group, Button, Image, Stack, Center } from '@mantine/core';

interface ImportPreviewModalProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  preview: { name: string; characterCount: number; firstImageUrl?: string } | null;
}

export default function ImportPreviewModal({
  opened,
  onClose,
  onConfirm,
  preview,
}: ImportPreviewModalProps) {
  if (!preview) return null;

  const countColor = preview.characterCount >= 24 ? '#4caf7d' : '#fa5252';

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Import Board"
      centered
      size="sm"
      styles={{
        content: { backgroundColor: '#2f3e55' },
        header: { backgroundColor: '#2f3e55' },
        title: { color: 'white', fontWeight: 600 },
      }}
    >
      <Stack gap="sm">
        {preview.firstImageUrl && (
          <Center>
            <Image
              src={preview.firstImageUrl}
              alt="Board preview"
              mah={100}
              fit="contain"
              radius="sm"
            />
          </Center>
        )}

        <Text c="white" fw={600} size="lg">
          {preview.name}
        </Text>

        <Text size="sm" c={countColor}>
          {preview.characterCount} character{preview.characterCount !== 1 ? 's' : ''}
          {preview.characterCount < 24 && ' — below 24 minimum for a full board'}
        </Text>

        <Group justify="flex-end" mt="xs">
          <Button variant="subtle" c="dimmed" onClick={onClose}>
            Cancel
          </Button>
          <Button color="blue" onClick={handleConfirm}>
            Import
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
