import { Card, Center, Text } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';

export interface CardData {
  id: string;
  name: string;
  imageUrl: string;
}

interface BoardCardProps {
  add?: boolean;
  card?: CardData;
  onClick?: () => void;
}

export default function BoardCard({ add, card, onClick }: BoardCardProps) {
  return (
    <Card
      shadow="sm"
      p="lg"
      radius="md"
      withBorder
      onClick={onClick}
      key={card?.id}
      bg="#2f3e55"
      style={{ borderColor: '#33465f' }}
    >
      <Card.Section>
        {add ? (
          <Center h={200}>
            <IconPlus size={128} color="white" /> {/* Big plus icon */}
          </Center>
        ) : (
          <img src={card?.imageUrl} alt={card?.name} />
        )}
      </Card.Section>
      <Card.Section>
        <Text c="white" style={{ fontWeight: 12, textAlign: 'center' }}>
          {add ? 'Add' : card?.name}
        </Text>
      </Card.Section>
    </Card>
  );
}
