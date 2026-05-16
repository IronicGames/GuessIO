'use client';

import { TagsInput, TextInput } from '@mantine/core';
import { useState } from 'react';
import { Role } from '@shared/types/misc.types';
import { useAuth } from '@providers/auth-provider';
import FormShell from './FormShell';
import ImageUploadSection from './ImageUploadSection';

export interface CharacterFormData {
  name: string;
  imageUrl?: string;
  tags?: string[];
}

interface CharacterFormProps {
  title?: string;
  initialData?: CharacterFormData;
  onBack?: () => void;
  onSubmit: (data: CharacterFormData) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

export default function CharacterForm({
  title = 'Character',
  initialData,
  onBack,
  onSubmit,
  onCancel,
  onDelete,
}: CharacterFormProps) {
  const { user } = useAuth();
  const [name, setName] = useState(initialData?.name ?? '');
  const [imageUrl, setImageUrl] = useState<string | undefined>(initialData?.imageUrl);
  const [tags, setTags] = useState<string[]>(initialData?.tags ?? []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  // TODO: Remove this when we are sure about Tag Mode
  const enabled = false;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit({ name, imageUrl, tags });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    if (!confirm('Are you sure you want to delete this character? This cannot be undone.')) return;
    setIsDeleting(true);
    try {
      await onDelete();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
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
        placeholder="Character name..."
        required
        size="lg"
        value={name}
        onChange={(e) => setName(e.target.value)}
        styles={{
          input: { backgroundColor: '#1f2a3a', borderColor: '#33465f', color: 'white' },
        }}
      />

      {/* Tags are admin-only for now */}
      {enabled && user?.role === Role.ADMIN && (
        <TagsInput
          placeholder="Add tags..."
          size="lg"
          value={tags}
          onChange={setTags}
          styles={{
            input: { backgroundColor: '#1f2a3a', borderColor: '#33465f', color: 'white' },
          }}
        />
      )}
    </FormShell>
  );
}
