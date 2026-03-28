import { SimpleGrid } from '@mantine/core';
import GridCard, { type GridItemData } from './GridCard';

interface ItemGridProps {
  items: GridItemData[];
  showAddButton?: boolean;
  showImportButton?: boolean;
  disableImportButton?: boolean;
  onAddClick?: () => void;
  onImportClick?: () => void;
  onItemClick?: (item: GridItemData) => void;
  columns?: number | Record<string, number>;
}

export default function ItemGrid({
  items,
  showAddButton = false,
  showImportButton = false,
  disableImportButton = false,
  onAddClick,
  onImportClick,
  onItemClick,
  columns = { base: 2, sm: 3, md: 4, lg: 5 },
}: ItemGridProps) {
  return (
    <SimpleGrid cols={columns} spacing="md">
      {/* Add Button */}
      {showAddButton && <GridCard key="add" cardType="add" onClick={onAddClick} />}
      {/* Import Button */}
      {showImportButton && (
        <GridCard
          key="import"
          cardType="import"
          onClick={onImportClick}
          disabled={disableImportButton}
        />
      )}
      {/* Items */}
      {items.map((item) => (
        <GridCard key={item.id} item={item} onClick={() => onItemClick?.(item)} />
      ))}
    </SimpleGrid>
  );
}
