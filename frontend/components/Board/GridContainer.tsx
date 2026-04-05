'use client';

import { Box, TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { type ReactNode, useState } from 'react';
import ItemGrid from './ItemGrid';
import BackButton from '@components/BackButton';
import { type ActionCardConfig, type GridItemData, type QuickAction } from './GridCard';

interface GridContainerProps {
  items: GridItemData[];
  actionCards?: ActionCardConfig[];
  onBack?: () => void;
  showSearch?: boolean;
  searchPlaceholder?: string;
  onItemClick?: (item: GridItemData) => void;
  colCount?: number;
  headerAddon?: ReactNode;
  getItemQuickActions?: (item: GridItemData) => QuickAction[];
  selectable?: boolean;
  selectedIds?: Set<string>;
  onItemSelect?: (item: GridItemData) => void;
  footer?: ReactNode;
}

export default function GridContainer({
  items,
  actionCards = [],
  onBack,
  showSearch = true,
  searchPlaceholder = 'Search...',
  onItemClick,
  colCount = 5,
  headerAddon,
  getItemQuickActions,
  selectable = false,
  selectedIds,
  onItemSelect,
  footer,
}: GridContainerProps) {
  const [searchValue, setSearchValue] = useState('');

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchValue.toLowerCase()),
  );

  const columns = {
    base: Math.min(2, colCount),
    sm: Math.min(3, colCount),
    md: Math.min(4, colCount),
    lg: colCount,
  };

  const showHeader = onBack || showSearch || headerAddon;

  return (
    <Box
      style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}
      p="lg"
    >
      {showHeader && (
        <Box
          style={{
            flexShrink: 0,
            backgroundColor: '#243040',
            paddingBottom: '1rem',
            display: 'flex',
            gap: '0.75rem',
            alignItems: 'center',
          }}
        >
          {onBack && <BackButton onClick={onBack} />}

          {showSearch && (
            <TextInput
              style={{ flex: 1 }}
              leftSection={<IconSearch size={20} />}
              placeholder={searchPlaceholder}
              size="lg"
              value={searchValue}
              onChange={(e) => setSearchValue(e.currentTarget.value)}
              styles={{
                input: { backgroundColor: '#1f2a3a', borderColor: '#33465f', color: 'white' },
              }}
            />
          )}

          {headerAddon}
        </Box>
      )}

      <Box style={{ flex: 1, overflowY: 'auto' }}>
        <ItemGrid
          items={filteredItems}
          actionCards={actionCards}
          onItemClick={selectable ? onItemSelect : onItemClick}
          columns={columns}
          getItemQuickActions={getItemQuickActions}
          selectable={selectable}
          selectedIds={selectedIds}
        />
      </Box>

      {footer && (
        <Box
          style={{
            flexShrink: 0,
            borderTop: '1px solid #33465f',
            paddingTop: 12,
          }}
        >
          {footer}
        </Box>
      )}
    </Box>
  );
}
