'use client';

import { useState } from 'react';
import {
  Stack,
  TextInput,
  Textarea,
  Button,
  Group,
  FileInput,
  Text,
  Image,
  Box,
} from '@mantine/core';
import { IconUpload, IconX, IconTrash } from '@tabler/icons-react';
import { buttonThemes } from '@styles/buttonThemes';

interface ItemFormData {
  name: string;
  description?: string;
  imageUrl?: string;
}

interface ItemFormProps {
  title: string;
  namePlaceholder?: string;
  descriptionPlaceholder?: string;
  initialData?: ItemFormData;
  onSubmit: (data: ItemFormData) => void | Promise<void>;
  onCancel: () => void;
  onDelete?: () => void | Promise<void>; // Optional delete handler
  submitText?: string;
  cancelText?: string;
  deleteText?: string;
  showDelete?: boolean; // Show delete button
}

export default function ItemForm({
  title,
  namePlaceholder = 'Enter name...',
  descriptionPlaceholder = 'Enter description...',
  initialData,
  onSubmit,
  onCancel,
  onDelete,
  submitText = 'Create',
  cancelText = 'Cancel',
  deleteText = 'Delete',
  showDelete = false,
}: ItemFormProps) {
  const [formData, setFormData] = useState<ItemFormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    imageUrl: initialData?.imageUrl || '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.imageUrl || null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleImageChange = (file: File | null) => {
    setImageFile(file);

    if (file) {
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleImageUrlChange = (url: string) => {
    setFormData({ ...formData, imageUrl: url });
    setImagePreview(url || null);
    setImageFile(null);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // TODO: Upload image to S3 and get URL
      // For now, use preview URL or provided URL
      const dataToSubmit: ItemFormData = {
        ...formData,
        imageUrl: formData.imageUrl || imagePreview || undefined,
      };

      await onSubmit(dataToSubmit);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;

    // Confirm deletion
    if (
      !confirm(
        'Are you sure you want to delete this? This action cannot be undone.'
      )
    ) {
      return;
    }

    setIsDeleting(true);

    try {
      await onDelete();
    } finally {
      setIsDeleting(false);
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setFormData({ ...formData, imageUrl: '' });
  };

  return (
    <Stack gap="lg" w="100%">
      {/* Title */}
      <Text size="xl" fw={700} c="white">
        {title}
      </Text>

      {/* Name Input */}
      <TextInput
        label="Name"
        placeholder={namePlaceholder}
        required
        size="lg"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        styles={{
          label: { color: '#e6edf3', marginBottom: 8 },
          input: {
            backgroundColor: '#1f2a3a',
            borderColor: '#33465f',
            color: 'white',
          },
        }}
      />

      {/* Description Input (Optional) */}
      <Textarea
        label="Description (Optional)"
        placeholder={descriptionPlaceholder}
        size="lg"
        rows={4}
        value={formData.description}
        onChange={(e) =>
          setFormData({ ...formData, description: e.target.value })
        }
        styles={{
          label: { color: '#e6edf3', marginBottom: 8 },
          input: {
            backgroundColor: '#1f2a3a',
            borderColor: '#33465f',
            color: 'white',
          },
        }}
      />

      {/* Image Upload Section */}
      <Stack gap="sm">
        <Text size="sm" fw={500} c="#e6edf3">
          Image
        </Text>

        {/* Image Preview */}
        {imagePreview && (
          <Box style={{ position: 'relative' }}>
            <Image
              src={imagePreview}
              alt="Preview"
              height={200}
              fit="contain"
              radius="md"
              style={{ backgroundColor: '#1f2a3a' }}
            />
            <Button
              size="xs"
              color="red"
              variant="filled"
              style={{ position: 'absolute', top: 8, right: 8 }}
              onClick={clearImage}
            >
              <IconX size={16} />
            </Button>
          </Box>
        )}

        {/* File Upload */}
        <FileInput
          placeholder="Upload image"
          leftSection={<IconUpload size={20} />}
          accept="image/*"
          value={imageFile}
          onChange={handleImageChange}
          disabled={!!formData.imageUrl}
          styles={{
            input: {
              backgroundColor: '#1f2a3a',
              borderColor: '#33465f',
              color: 'white',
            },
          }}
        />

        {/* OR */}
        <Text ta="center" c="dimmed" size="sm">
          OR
        </Text>

        {/* Image URL Input */}
        <TextInput
          placeholder="Enter image URL"
          value={formData.imageUrl}
          onChange={(e) => handleImageUrlChange(e.target.value)}
          disabled={!!imageFile}
          styles={{
            input: {
              backgroundColor: '#1f2a3a',
              borderColor: '#33465f',
              color: 'white',
            },
          }}
        />
      </Stack>

      {/* Action Buttons */}
      <Group justify="space-between" mt="md">
        {/* Delete Button (Left Side) */}
        {showDelete && onDelete && (
          <Button
            variant="outline"
            size="lg"
            color="red"
            leftSection={<IconTrash size={20} />}
            onClick={handleDelete}
            disabled={isSubmitting || isDeleting}
            loading={isDeleting}
          >
            {deleteText}
          </Button>
        )}

        {/* Spacer if no delete button */}
        {!showDelete && <div />}

        {/* Cancel & Submit (Right Side) */}
        <Group>
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
            onClick={handleSubmit}
            disabled={!formData.name || isSubmitting || isDeleting}
            loading={isSubmitting}
            color={buttonThemes.primary.color}
            c={buttonThemes.primary.textColor}
            styles={{
              root: {
                borderColor: buttonThemes.primary.borderColor,
              },
            }}
          >
            {submitText}
          </Button>
        </Group>
      </Group>
    </Stack>
  );
}
