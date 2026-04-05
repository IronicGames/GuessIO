'use client';

import {
  Stack,
  Textarea,
  TextInput,
  SegmentedControl,
  Text,
  Box,
  Modal,
  Group,
  Button,
} from '@mantine/core';
import { IconLock, IconWorld } from '@tabler/icons-react';
import { useState } from 'react';
import { Role } from '@shared/types/misc.types';
import { useAuth } from '@providers/auth-provider';
import FormShell from './FormShell';
import ImageUploadSection from './ImageUploadSection';

export interface BoardFormData {
  name: string;
  description?: string;
  imageUrl?: string;
  isPublic?: boolean;
}

interface BoardFormProps {
  title?: string;
  initialData?: BoardFormData;
  onBack?: () => void;
  onSubmit: (data: BoardFormData) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

export default function BoardForm({
  title = 'Board',
  initialData,
  onBack,
  onSubmit,
  onCancel,
  onDelete,
}: BoardFormProps) {
  const { user } = useAuth();
  const [name, setName] = useState(initialData?.name ?? '');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [imageUrl, setImageUrl] = useState<string | undefined>(initialData?.imageUrl);
  const [isPublic, setIsPublic] = useState(initialData?.isPublic ?? false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit({ name, description, imageUrl, isPublic });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    if (!onDelete) return;
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    setDeleteModalOpen(false);
    setIsDeleting(true);
    try {
      await onDelete!();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Board"
        centered
        size="sm"
        styles={{
          content: { backgroundColor: '#2f3e55' },
          header: { backgroundColor: '#2f3e55' },
          title: { color: 'white', fontWeight: 600 },
        }}
      >
        <Text size="sm" c="dimmed">
          This cannot be undone. All characters will be detached from this board.
        </Text>
        <Group justify="flex-end" mt="md">
          <Button variant="subtle" c="dimmed" onClick={() => setDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button color="red" onClick={confirmDelete} loading={isDeleting}>
            Delete Board
          </Button>
        </Group>
      </Modal>
      <FormShell
        title={title}
        onBack={onBack}
        onSubmit={handleSubmit}
        onCancel={onCancel}
        onDelete={onDelete ? handleDelete : undefined}
        isSubmitting={isSubmitting}
        isDeleting={isDeleting}
        canSubmit={name.trim().length > 0}
        submitText={initialData ? 'Save' : 'Create'}
      >
        <ImageUploadSection value={imageUrl} onChange={setImageUrl} />

        <TextInput
          placeholder="Board name..."
          required
          size="lg"
          value={name}
          onChange={(e) => setName(e.target.value)}
          styles={{
            input: { backgroundColor: '#1f2a3a', borderColor: '#33465f', color: 'white' },
          }}
        />

        <Textarea
          placeholder="Describe your board..."
          size="lg"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          styles={{
            input: { backgroundColor: '#1f2a3a', borderColor: '#33465f', color: 'white' },
          }}
        />

        {user?.role === Role.ADMIN && (
          <Box>
            <SegmentedControl
              fullWidth
              value={isPublic ? 'public' : 'private'}
              onChange={(val) => setIsPublic(val === 'public')}
              data={[
                {
                  value: 'private',
                  label: (
                    <Stack gap={4} align="center" py={4}>
                      <IconLock size={16} />
                      <Text size="xs">Private</Text>
                    </Stack>
                  ),
                },
                {
                  value: 'public',
                  label: (
                    <Stack gap={4} align="center" py={4}>
                      <IconWorld size={16} />
                      <Text size="xs">Public</Text>
                    </Stack>
                  ),
                },
              ]}
              styles={{
                root: {
                  backgroundColor: '#1f2a3a',
                  border: '1px solid #33465f',
                },
                indicator: {
                  backgroundColor: isPublic ? '#2d6a4f' : '#2f3e55',
                },
                label: {
                  color: 'white',
                },
              }}
            />
          </Box>
        )}
      </FormShell>
    </>
  );
}
