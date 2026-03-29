'use client';

import { AspectRatio, Box, Button, Center, Image, Text, TextInput } from '@mantine/core';
import { IconCamera, IconX } from '@tabler/icons-react';
import { useRef, useState } from 'react';

interface ImageUploadSectionProps {
  value?: string;
  onChange: (url: string | undefined) => void;
}

const isDataUrl = (s: string) => s.startsWith('data:');

export default function ImageUploadSection({ value, onChange }: ImageUploadSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hovered, setHovered] = useState(false);
  const [urlInput, setUrlInput] = useState<string>(value && !isDataUrl(value) ? value : '');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      onChange(reader.result as string);
      setUrlInput('');
    };
    reader.readAsDataURL(file);
  };

  const handleUrlChange = (url: string) => {
    setUrlInput(url);
    onChange(url.trim() || undefined);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(undefined);
    setUrlInput('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePreviewClick = () => {
    // Always open the file picker when clicking the preview area —
    // whether there's no image yet, a data URL, or a regular URL.
    // For URL images this clears the URL field first so they're not fighting.
    if (urlInput) {
      setUrlInput('');
      onChange(undefined);
    }
    fileInputRef.current?.click();
  };

  return (
    <Box>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* Square preview — matches the GridCard aspect ratio */}
      <AspectRatio ratio={1} w="40%" maw={180} mx="auto">
        <Box
          onClick={handlePreviewClick}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#1f2a3a',
            borderRadius: 8,
            overflow: 'hidden',
            cursor: 'pointer',
            border: hovered ? '1px solid #8ecae6' : '1px solid transparent',
            transition: 'border-color 0.15s ease',
            position: 'relative',
          }}
        >
          {value ? (
            <>
              <Image
                src={value}
                alt="Preview"
                w="100%"
                h="100%"
                fit="contain"
                style={{ backgroundColor: '#1f2a3a' }}
              />

              {/* Clear button */}
              <Button
                size="xs"
                color="red"
                variant="filled"
                style={{ position: 'absolute', top: 6, right: 6, zIndex: 2 }}
                onClick={handleClear}
              >
                <IconX size={12} />
              </Button>

              {/* Replace overlay — shown on hover regardless of URL or file */}
              {hovered && (
                <Box
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: 4,
                    pointerEvents: 'none',
                  }}
                >
                  <IconCamera size={22} color="white" />
                  <Text size="xs" c="white">
                    Replace
                  </Text>
                </Box>
              )}
            </>
          ) : (
            <Center h="100%" style={{ flexDirection: 'column', gap: 6 }}>
              <IconCamera
                size={28}
                color={hovered ? '#8ecae6' : '#6b7f96'}
                style={{ transition: 'color 0.15s ease' }}
              />
              <Text
                size="xs"
                c={hovered ? '#8ecae6' : 'dimmed'}
                ta="center"
                style={{ transition: 'color 0.15s ease', lineHeight: 1.3 }}
              >
                Click to upload
              </Text>
            </Center>
          )}
        </Box>
      </AspectRatio>

      {/* URL input — secondary option */}
      <TextInput
        placeholder="Or paste image URL..."
        mt="sm"
        value={urlInput}
        onChange={(e) => handleUrlChange(e.target.value)}
        // Disable when a file is loaded — mutually exclusive with file upload
        disabled={!!value && isDataUrl(value)}
        styles={{
          input: {
            backgroundColor: '#1f2a3a',
            borderColor: '#33465f',
            color: 'white',
          },
        }}
      />
    </Box>
  );
}
