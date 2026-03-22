import { SimpleGrid } from '@mantine/core';
import GridCard, { GridItemData } from './GridCard';

interface ItemGridProps {
  items: GridItemData[];
  columns?: number | { base?: number; sm?: number; md?: number; lg?: number }; // Responsive columns
  showAddButton?: boolean;
  onAddClick?: () => void;
  onItemClick?: (item: GridItemData) => void;
  imageHeight?: number; // Height of item images
  showNames?: boolean; // Show/hide names
  crossedOutIds?: string[]; // IDs of crossed out items
  maxItems?: number; // Max items to show (for game board)
  spacing?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export default function ItemGrid({
  items,
  columns = 4,
  showAddButton = false,
  onAddClick,
  onItemClick,
  imageHeight = 200,
  showNames = true,
  crossedOutIds = [],
  maxItems,
  spacing = 'md',
}: ItemGridProps) {
  // Limit items if maxItems is set
  const displayedItems = maxItems ? items.slice(0, maxItems) : items;

  return (
    <SimpleGrid cols={columns} spacing={spacing}>
      {/* Add Button */}
      {showAddButton && (
        <GridCard
          add={true}
          onClick={onAddClick}
          imageHeight={imageHeight}
          showName={showNames}
        />
      )}

      {/* Items */}
      {displayedItems.map((item) => (
        <GridCard
          key={item.id}
          item={item}
          onClick={() => onItemClick?.(item)}
          crossed={crossedOutIds.includes(item.id)}
          imageHeight={imageHeight}
          showName={showNames}
        />
      ))}
    </SimpleGrid>
  );
}
