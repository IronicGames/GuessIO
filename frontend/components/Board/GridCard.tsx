import { Card, Center, Text, AspectRatio } from '@mantine/core';
import { IconPlus, IconUpload } from '@tabler/icons-react';
import { useState } from 'react';

export interface GridItemData {
  id: string;
  name: string;
  imageUrl?: string;
  tags?: string[];
}

interface GridCardProps {
  item?: GridItemData;
  cardType?: 'add' | 'import' | 'item';
  disabled?: boolean;
  onClick?: () => void;
}

export default function GridCard({
  item,
  cardType = 'item',
  disabled = false,
  onClick,
}: GridCardProps) {
  const [hovered, setHovered] = useState(false);

  const isClickable = !!onClick && !disabled;

  return (
    <AspectRatio ratio={1} w="100%">
      <Card
        shadow="sm"
        p="lg"
        radius="md"
        withBorder
        onClick={isClickable ? onClick : undefined}
        onMouseEnter={() => isClickable && setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        bg="#2f3e55"
        style={{
          borderColor: '#33465f',
          cursor: isClickable ? 'pointer' : 'not-allowed',
          // Hover scale — only when clickable
          transform: hovered ? 'scale(1.02)' : 'scale(1)',
          transition: 'transform 0.2s ease, opacity 0.2s ease',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          // Visually communicate disabled state
          opacity: disabled ? 0.4 : 1,
          filter: disabled ? 'grayscale(40%)' : 'none',
        }}
      >
        {/* Image Section */}
        <Card.Section style={{ flex: 1, overflow: 'hidden' }}>
          {!item ? (
            <Center h="100%">
              {cardType === 'add' ? (
                <IconPlus size="70%" color="white" strokeWidth={2} />
              ) : (
                <IconUpload size="70%" color="white" strokeWidth={2} />
              )}
            </Center>
          ) : item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
            />
          ) : (
            <Center h="100%" bg="#1f2a3a">
              {/* TODO: Replace with default image */}
              <Text c="dimmed">No Image</Text>
            </Center>
          )}
        </Card.Section>

        {/* Name */}
        <Card.Section p="xs" style={{ flexShrink: 0 }}>
          <Text c="white" fw={500} ta="center" lineClamp={2} size="lg">
            {item?.name ? item.name : cardType === 'add' ? 'Add' : 'Import'}
          </Text>
        </Card.Section>
      </Card>
    </AspectRatio>
  );
}
