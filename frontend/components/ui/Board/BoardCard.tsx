import { Card, Text } from "@mantine/core";

export interface CardData {
    id: string;
    name: string;
    imageUrl: string;
}

interface BoardCardProps {
    card: CardData;
    onClick: () => void;
}

export default function BoardCard({ card, onClick }: BoardCardProps) {
  return (
    <Card shadow="sm" p="lg" radius="md" withBorder onClick={onClick} key={card.id}>
      <Card.Section>
        <img src={card.imageUrl} alt={card.name} />
      </Card.Section>
      <Card.Section>
        <Text>{card.name}</Text>
      </Card.Section>
    </Card>
  )
}