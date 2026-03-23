'use client';

import { Flex } from '@mantine/core';
import { useBoardContext } from '@providers/board-provider';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GridItemData } from '@components/Board/GridCard';
import GridContainer from '@components/Board/GridContainer';
import ContentPaper from '@components/ContentPaper';

export default function BoardsPage() {
  const router = useRouter();
  const { boards, getBoards, loading } = useBoardContext();

  useEffect(() => {
    if (!loading) {
      getBoards();
    }
  }, [loading]);

  // Convert boards to GridItemData
  // TODO: order by updatedAt
  const gridItems: GridItemData[] = boards.map((board) => ({
    id: board.id,
    name: board.name,
    imageUrl: board.image?.imageUrl,
  }));

  const handleAddBoard = () => {
    router.push('/boards/create');
  };

  const handleBoardClick = (boardItem: GridItemData) => {
    const fullBoard = boards.find((b) => b.id === boardItem.id);
    if (fullBoard) {
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
