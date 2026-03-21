import { SimpleGrid } from '@mantine/core';
import BoardCard, { CardData } from './BoardCard';

interface BoardGridProps {
  addButton?: boolean;
  colCount?: number;
  cards: CardData[];
}

export default function BoardGrid({
  cards,
  colCount = 4,
  addButton,
}: BoardGridProps) {
  return (
    <SimpleGrid cols={colCount} spacing="md">
      {addButton && <BoardCard add={true} />}
      {cards.map((card) => (
        <BoardCard key={card.id} card={card} onClick={() => {}} />
      ))}
    </SimpleGrid>
  );
}
