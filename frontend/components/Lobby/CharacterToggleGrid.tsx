'use client';

import { AspectRatio, Box, Card, Center, Group, SimpleGrid, Text } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import { useState } from 'react';
import { type CharacterDto } from '@shared/types/character.types';

interface CharacterToggleGridProps {
  characters: CharacterDto[];
  disabledCharacterIds: string[];
  isHost: boolean;
  onToggle: (characterId: string) => void;
}

// Tag filter strip — shows all unique tags, click to filter
function TagFilter({
  tags,
  activeTag,
  onSelect,
}: {
  tags: string[];
  activeTag: string | null;
  onSelect: (tag: string | null) => void;
}) {
  if (tags.length === 0) return null;

  return (
    <Group gap="xs" style={{ flexWrap: 'wrap' }}>
      <Text size="xs" c="#6b7f96" style={{ flexShrink: 0 }}>
        Filter by tag:
      </Text>
      <Box
        onClick={() => onSelect(null)}
        style={{
          padding: '2px 8px',
          borderRadius: 12,
          backgroundColor: activeTag === null ? '#8ecae6' : '#2f3e55',
          border: `1px solid ${activeTag === null ? '#8ecae6' : '#33465f'}`,
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <Text size="xs" c={activeTag === null ? 'black' : '#e6edf3'} fw={500}>
          All
        </Text>
      </Box>
      {tags.map((tag) => (
        <Box
          key={tag}
          onClick={() => onSelect(activeTag === tag ? null : tag)}
          style={{
            padding: '2px 8px',
            borderRadius: 12,
            backgroundColor: activeTag === tag ? '#8ecae6' : '#2f3e55',
            border: `1px solid ${activeTag === tag ? '#8ecae6' : '#33465f'}`,
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          <Text size="xs" c={activeTag === tag ? 'black' : '#e6edf3'} fw={500}>
            {tag}
          </Text>
        </Box>
      ))}
    </Group>
  );
}

// Individual character card — custom rendering to support toggle without GridCard click-blocking
function CharacterCard({
  character,
  isDisabled,
  isHost,
  onToggle,
}: {
  character: CharacterDto;
  isDisabled: boolean;
  isHost: boolean;
  onToggle: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <AspectRatio ratio={1} w="100%">
      <Box
        style={{ position: 'relative', cursor: isHost ? 'pointer' : 'default' }}
        onClick={isHost ? onToggle : undefined}
        onMouseEnter={isHost ? () => setHovered(true) : undefined}
        onMouseLeave={() => setHovered(false)}
      >
        <Card
          shadow="sm"
          p="lg"
          radius="md"
          withBorder
          bg="#2f3e55"
          style={{
            borderColor: '#33465f',
            transform: isHost && hovered && !isDisabled ? 'scale(1.02)' : 'scale(1)',
            transition: 'transform 0.15s ease, opacity 0.15s ease, filter 0.15s ease',
            opacity: isDisabled ? 0.4 : 1,
            filter: isDisabled ? 'grayscale(60%)' : 'none',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Card.Section style={{ flex: 1, overflow: 'hidden' }}>
            {character.image?.imageUrl ? (
              <img
                src={character.image.imageUrl}
                alt={character.name}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            ) : (
              <Center h="100%" bg="#1f2a3a">
                <Text c="dimmed">No Image</Text>
              </Center>
            )}
          </Card.Section>
          <Card.Section p="xs" style={{ flexShrink: 0 }}>
            <Text c="white" fw={500} ta="center" lineClamp={1} size="sm">
              {character.name}
            </Text>
          </Card.Section>
        </Card>

        {/* X overlay when host has disabled this character */}
        {isDisabled && (
          <Box
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
              zIndex: 5,
            }}
          >
            <IconX size={36} color="#fa5252" strokeWidth={3} />
          </Box>
        )}
      </Box>
    </AspectRatio>
  );
}

export function CharacterToggleGrid({
  characters,
  disabledCharacterIds,
  isHost,
  onToggle,
}: CharacterToggleGridProps) {
  const [activeTag, setActiveTag] = useState<string | null>(null);

  // Collect all unique tags across all characters
  const allTags = Array.from(new Set(characters.flatMap((c) => c.tags ?? []))).sort();

  // Filter characters by active tag
  const visibleCharacters = activeTag
    ? characters.filter((c) => c.tags?.includes(activeTag))
    : characters;

  const enabledCount = characters.length - disabledCharacterIds.length;
  const isValid = enabledCount >= 24;

  return (
    <Box style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Tag filter + validity counter */}
      <Box
        style={{
          flexShrink: 0,
          padding: '10px 16px',
          borderBottom: '1px solid #33465f',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        <Group justify="space-between" align="center">
          <Text size="xs" fw={600} c={isValid ? '#4caf7d' : '#f5c542'}>
            {isValid
              ? `${enabledCount}/${characters.length} enabled ✓`
              : `⚠ ${enabledCount} enabled — need 24`}
          </Text>
          {isHost && (
            <Text size="xs" c="#6b7f96">
              Click to toggle
            </Text>
          )}
        </Group>
        {allTags.length > 0 && (
          <TagFilter tags={allTags} activeTag={activeTag} onSelect={setActiveTag} />
        )}
      </Box>

      {/* Grid */}
      <Box style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        {visibleCharacters.length === 0 ? (
          <Center h={100}>
            <Text c="#6b7f96" size="sm">
              No characters match this tag
            </Text>
          </Center>
        ) : (
          <SimpleGrid cols={{ base: 3, sm: 4, md: 5, lg: 6 }} spacing="sm">
            {visibleCharacters.map((char) => (
              <CharacterCard
                key={char.id}
                character={char}
                isDisabled={disabledCharacterIds.includes(char.id)}
                isHost={isHost}
                onToggle={() => onToggle(char.id)}
              />
            ))}
          </SimpleGrid>
        )}
      </Box>
    </Box>
  );
}
