'use client';

import { Box, TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { useState } from 'react';
import ItemGrid from './ItemGrid';
import { GridItemData } from './GridCard';

interface GridContainerProps {
  items: GridItemData[];
  showSearch?: boolean;
  searchPlaceholder?: string;
  showAddButton?: boolean;
  onAddClick?: () => void;
  onItemClick?: (item: GridItemData) => void;
  colCount?: number;
}

export default function GridContainer({
  items,
  showSearch = true,
  searchPlaceholder = 'Search...',
  showAddButton = false,
  onAddClick,
  onItemClick,
  colCount = 5,
}: GridContainerProps) {
  const [searchValue, setSearchValue] = useState('');

  // Filter items based on search
  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchValue.toLowerCase())
  );

  // Responsive columns based on colCount
  const columns = {
    base: Math.min(2, colCount),
    sm: Math.min(3, colCount),
    md: Math.min(4, colCount),
    lg: colCount,
  };

  return (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}
      p="lg"
    >
      {/* Search Bar (Sticky) */}
      {showSearch && (
        <Box
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
            backgroundColor: '#243040',
            paddingBottom: '1rem',
          }}
        >
          <TextInput
            leftSection={<IconSearch size={20} />}
            placeholder={searchPlaceholder}
            size="lg"
            value={searchValue}
            onChange={(e) => setSearchValue(e.currentTarget.value)}
            styles={{
              input: {
                backgroundColor: '#1f2a3a',
                borderColor: '#33465f',
                color: 'white',
              },
            }}
          />
        </Box>
      )}

      <Box
        style={{
          flex: 1,
        }}
      >
        <ItemGrid
          items={filteredItems}
          showAddButton={showAddButton}
          onAddClick={onAddClick}
          onItemClick={onItemClick}
          columns={columns}
        />
      </Box>
    </Box>
  );
}
