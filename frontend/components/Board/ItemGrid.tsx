import { SimpleGrid } from '@mantine/core';
import GridCard, { type ActionCardConfig, type GridItemData } from './GridCard';

interface ItemGridProps {
  items: GridItemData[];
  // Action cards (add, import, etc.) are passed as data — no boolean flags needed.
  // To add a new action in gameplay, just push another config object. Zero component changes.
  actionCards?: ActionCardConfig[];
  onItemClick?: (item: GridItemData) => void;
  columns?: number | Record<string, number>;
}

export default function ItemGrid({
  items,
  actionCards = [],
  onItemClick,
  columns = { base: 2, sm: 3, md: 4, lg: 5 },
}: ItemGridProps) {
  return (
    <SimpleGrid cols={columns} spacing="md">
      {/* Action cards always render first */}
      {actionCards.map((card) => (
        <GridCard
          key={card.id}
          variant="action"
          icon={card.icon}
          label={card.label}
          disabled={card.disabled}
          onClick={card.onClick}
        />
      ))}

      {/* Item cards */}
      {items.map((item) => (
        <GridCard key={item.id} variant="item" item={item} onClick={() => onItemClick?.(item)} />
      ))}
    </SimpleGrid>
  );
}
