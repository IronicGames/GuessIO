import { SimpleGrid } from '@mantine/core';
import GridCard, { type GridItemData } from './GridCard';

interface ItemGridProps {
  items: GridItemData[];
  showAddButton?: boolean;
  onAddClick?: () => void;
  onItemClick?: (item: GridItemData) => void;
  columns?: number | Record<string, number>;
}

export default function ItemGrid({
  items,
  showAddButton = false,
  onAddClick,
  onItemClick,
  columns = { base: 2, sm: 3, md: 4, lg: 5 },
}: ItemGridProps) {
  return (
    <SimpleGrid cols={columns} spacing="md">
      {/* Add Button */}
      {showAddButton && <GridCard key="add" onClick={onAddClick} />}
      {/* Items */}
      {items.map((item) => (
        <GridCard key={item.id} item={item} onClick={() => onItemClick?.(item)} />
      ))}
    </SimpleGrid>
  );
}
