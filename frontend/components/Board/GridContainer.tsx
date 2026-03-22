import { Box, Paper, TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { ReactNode, useState } from 'react';

interface GridContainerProps {
  children: ReactNode;
  showSearch?: boolean;
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
  scrollable?: boolean; // Make grid scrollable or fixed
  height?: string | number; // Container height
  width?: string | number; // Container width
}

export default function GridContainer({
  children,
  showSearch = true,
  searchPlaceholder = 'Search...',
  onSearchChange,
  scrollable = true,
  height = '90%',
  width = '50%',
}: GridContainerProps) {
  const [searchValue, setSearchValue] = useState('');

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    onSearchChange?.(value);
  };

  return (
    <Paper
      p="lg"
      w={width}
      h={height}
      withBorder
      shadow="xl"
      radius="md"
      bg="#243040"
      style={{
        borderColor: '#33465f',
        borderWidth: 1,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Search Bar */}
      {showSearch && (
        <TextInput
          leftSection={<IconSearch size={20} />}
          styles={{
            input: { 
              backgroundColor: '#1f2a3a', 
              borderColor: '#33465f' 
            },
          }}
          placeholder={searchPlaceholder}
          size="xl"
          mb="md"
          value={searchValue}
          onChange={(e) => handleSearchChange(e.currentTarget.value)}
          style={{ 
            position: 'sticky', 
            top: 0, 
            zIndex: 10,
            flexShrink: 0,
          }}
        />
      )}

      {/* Content Area */}
      <Box 
        style={{ 
          flex: 1, 
          overflow: scrollable ? 'auto' : 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {children}
      </Box>
    </Paper>
  );
}
