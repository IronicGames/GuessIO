import { Card, Center, Text, Box } from '@mantine/core';
import { IconPlus, IconX } from '@tabler/icons-react';

export interface GridItemData {
  id: string;
  name: string;
  imageUrl?: string;
}

interface GridCardProps {
  add?: boolean;
  item?: GridItemData;
  onClick?: () => void;
  crossed?: boolean; // For crossing out items in game
  imageHeight?: number; // Customizable image height
  showName?: boolean; // Option to hide name
}

export default function GridCard({ 
  add, 
  item, 
  onClick, 
  crossed = false,
  imageHeight = 200,
  showName = true
}: GridCardProps) {
  return (
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
        position: 'relative',
        opacity: crossed ? 0.4 : 1,
      }}
    >
      <Card.Section>
        {add ? (
          <Center h={imageHeight}>
            <IconPlus size={Math.min(128, imageHeight * 0.6)} color="white" />
          </Center>
        ) : (
          <Box style={{ position: 'relative' }}>
            {item?.imageUrl ? (
              <img 
                src={item.imageUrl} 
                alt={item.name} 
                style={{ 
                  height: imageHeight, 
                  width: '100%', 
                  objectFit: 'cover' 
                }} 
              />
            ) : (
              <Center h={imageHeight} bg="#1f2a3a">
                <Text c="dimmed">No Image</Text>
              </Center>
            )}
            {crossed && (
              <Box
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                }}
              >
                <IconX size={64} color="red" strokeWidth={3} />
              </Box>
            )}
          </Box>
        )}
      </Card.Section>
      {showName && (
        <Card.Section>
          <Text c="white" fw={500} ta="center" mt="sm">
            {add ? 'Add' : item?.name}
          </Text>
        </Card.Section>
      )}
    </Card>
  );
}
