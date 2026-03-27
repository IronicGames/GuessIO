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
  Center,
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
  onDelete?: () => void | Promise<void>;
  submitText?: string;
  cancelText?: string;
  deleteText?: string;
}

export default function ItemForm({
  title,
  namePlaceholder = 'Enter name...',
  descriptionPlaceholder = 'Enter description...',
  initialData,
  onSubmit,
  onCancel,
  onDelete,
  submitText,
  cancelText = 'Cancel',
  deleteText = 'Delete',
}: ItemFormProps) {
  const isEditMode = !!initialData;
  const defaultSubmitText = isEditMode ? 'Save' : 'Create';

  const [formData, setFormData] = useState<ItemFormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    imageUrl: initialData?.imageUrl || '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.imageUrl || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleImageChange = (file: File | null) => {
    setImageFile(file);

    if (file) {
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

    if (!confirm('Are you sure you want to delete this? This action cannot be undone.')) {
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
    <Box
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        alignContent: 'center',
        overflow: 'auto',
      }}
      p="lg"
    >
      {/* Scrollable Form Content */}
      <Box
        style={{
          flex: 1,
          paddingRight: '8px', // Only for scrollbar space
          overflow: 'hidden',
        }}
      >
        <Stack gap="lg" w="100%">
          {/* Title */}
          <Text size="xl" fw={700} c="white">
            {title}
          </Text>

          {/* Name Input */}
          <TextInput
            placeholder={namePlaceholder}
            required
            size="lg"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            styles={{
              input: {
                backgroundColor: '#1f2a3a',
                borderColor: '#33465f',
                color: 'white',
              },
            }}
          />

          {/* Description Input */}
          <Textarea
            placeholder={descriptionPlaceholder}
            size="lg"
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            styles={{
              input: {
                backgroundColor: '#1f2a3a',
                borderColor: '#33465f',
                color: 'white',
              },
            }}
          />

          {/* Image Upload Section */}
          <Stack gap="sm" w="100%" pb="lg">
            {/* Image Preview Container - Always Same Size */}
            <Box
              style={{
                position: 'relative',
                width: '100%',
                height: 200,
                backgroundColor: '#1f2a3a',
                borderRadius: '8px',
                overflow: 'hidden',
              }}
            >
              {imagePreview ? (
                <>
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    height={200}
                    width="100%"
                    fit="contain"
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
                </>
              ) : (
                <Center h="100%">
                  <Text c="dimmed" size="sm">
                    No image selected
                  </Text>
                </Center>
              )}
            </Box>

            {/* File Upload */}
            <FileInput
              placeholder="Upload image"
              leftSection={<IconUpload size={20} />}
              accept="image/*"
              value={imageFile}
              onChange={handleImageChange}
              disabled={!!formData.imageUrl}
              styles={{
                root: { width: '100%' },
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
                root: { width: '100%' },
                input: {
                  backgroundColor: '#1f2a3a',
                  borderColor: '#33465f',
                  color: 'white',
                },
              }}
            />
          </Stack>
        </Stack>
      </Box>

      {/* Sticky Action Buttons at Bottom */}
      <Box
        style={{
          position: 'sticky',
          bottom: 0,
          backgroundColor: '#243040',
          paddingTop: '1.2rem',
          paddingRight: '0.5rem',
          borderTop: '1px solid #33465f',
          marginTop: 'auto',
          zIndex: '10',
        }}
      >
        <Stack gap="sm" w="100%">
          {/* Cancel & Submit Row */}
          <Group wrap="nowrap" gap="md" grow w="100%">
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
              {submitText || defaultSubmitText}
            </Button>
          </Group>

          {/* Delete Button - Full Width */}
          {isEditMode && onDelete && (
            <Button
              variant="outline"
              size="lg"
              color="red"
              leftSection={<IconTrash size={20} />}
              onClick={handleDelete}
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
