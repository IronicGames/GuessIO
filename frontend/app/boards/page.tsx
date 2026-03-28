'use client';

import { Flex } from '@mantine/core';
import { useRouter } from 'next/navigation';
import { type GridItemData } from '@components/Board/GridCard';
import GridContainer from '@components/Board/GridContainer';
import ContentPaper from '@components/ContentPaper';
import { api } from '@lib/api';
import { useQuery } from '@tanstack/react-query';
import StatusScreen from '@components/StatusScreen';

export default function BoardsPage() {
  const router = useRouter();
  const {
    data: boards,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['boards'],
    queryFn: api.boards.getBoardsForUser,
  });
  if (isLoading) return <StatusScreen />;
  if (error || !boards) return <StatusScreen text="Error loading board" />;
  const gridItems: GridItemData[] =
    boards
      ?.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : a.updatedAt > b.updatedAt ? -1 : 0))
      .map((board) => ({
        id: board.id,
        name: board.name,
        imageUrl: board.image?.imageUrl,
        isPublic: board.isPublic,
      })) ?? [];

  const handleAddBoard = () => {
    router.push('/boards/create');
  };

  const handleBoardClick = (boardItem: GridItemData) => {
    if (boardItem.id) {
      router.push(`/boards/${boardItem.id}`);
    }
  };

  return (
    <Flex justify="center" p="md">
      <ContentPaper w={{ base: '90%', md: '85%', lg: '75%' }} h="70vh">
        <GridContainer
          items={gridItems}
          showSearch={true}
          searchPlaceholder="Search boards..."
          showAddButton={true}
          onAddClick={handleAddBoard}
          onItemClick={handleBoardClick}
          colCount={5}
        />
      </ContentPaper>
    </Flex>
  );
}
