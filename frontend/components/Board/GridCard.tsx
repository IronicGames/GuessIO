import { Card, Center, Text, AspectRatio } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';

export interface GridItemData {
  id: string;
  name: string;
  imageUrl?: string;
}

interface GridCardProps {
  item?: GridItemData;
  onClick?: () => void;
}

export default function GridCard({ item, onClick }: GridCardProps) {
  return (
    <AspectRatio ratio={1} w="100%">
      <Card
        shadow="sm"
        p="lg"
        radius="md"
        withBorder
        onClick={onClick}
        bg="#2f3e55"
        style={{
          borderColor: '#33465f',
          cursor: onClick ? 'pointer' : 'default',
          transition: 'transform 0.2s ease',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
        styles={{
          root: {
            '&:hover': {
              transform: onClick ? 'scale(1.02)' : 'none',
            },
          },
        }}
      >
        {/* Image Section - Takes Most Space */}
        <Card.Section style={{ flex: 1, overflow: 'hidden' }}>
          {!item ? (
            <Center h="100%">
              <IconPlus size="70%" color="white" strokeWidth={2} />
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

        {/* Name - Fixed Height at Bottom */}
        <Card.Section p="xs" style={{ flexShrink: 0 }}>
          <Text c="white" fw={500} ta="center" lineClamp={2} size="lg">
            {item?.name ?? 'Add'}
          </Text>
        </Card.Section>
      </Card>
    </AspectRatio>
  );
}
