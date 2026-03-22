'use client';

import { api } from '@lib/api';
import { Flex } from '@mantine/core';
import { useBoardContext } from '@providers/board-provider';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GridItemData } from '@components/Board/GridCard';
import GridContainer from '@components/Board/GridContainer';
import ItemGrid from '@components/Board/ItemGrid';

export default function BoardsPage() {
  const router = useRouter();
  const { boards, setBoards, setSelectedBoard, refreshBoards } =
    useBoardContext();
  const [filteredBoards, setFilteredBoards] = useState<GridItemData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.boards
      .getBoardsForUser()
      .then((data) => {
        setBoards(data); // Store full BoardDto objects in context

        const boardItems = data.map((board) => ({
          id: board.id,
          name: board.name,
          imageUrl: board.image?.imageUrl,
        }));
        setFilteredBoards(boardItems);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [refreshBoards, loading]); // Re-fetch when refresh is triggered

  const handleSearch = (value: string) => {
    const filtered = boards
      .filter((board) => board.name.toLowerCase().includes(value.toLowerCase()))
      .map((board) => ({
        id: board.id,
        name: board.name,
        imageUrl: board.image?.imageUrl,
      }));
    setFilteredBoards(filtered);
  };

  const handleAddBoard = () => {
    router.push('/boards/create');
  };

  const handleBoardClick = (boardItem: GridItemData) => {
    // Find the full board data
    const fullBoard = boards.find((b) => b.id === boardItem.id);

    if (fullBoard) {
      // Store in context for edit page
      setSelectedBoard(fullBoard);
      router.push(`/boards/${boardItem.id}`);
    }
  };

  return (
    <Flex h="90vh" w="100vw" justify="center" align="center">
      <GridContainer
        showSearch={true}
        searchPlaceholder="Search boards..."
        onSearchChange={handleSearch}
        scrollable={true}
        height="90%"
        width="50%"
      >
        <ItemGrid
          items={filteredBoards}
          columns={4}
          showAddButton={true}
          onAddClick={handleAddBoard}
          onItemClick={handleBoardClick}
          imageHeight={200}
          showNames={true}
          spacing="md"
        />
      </GridContainer>
    </Flex>
  );
}
