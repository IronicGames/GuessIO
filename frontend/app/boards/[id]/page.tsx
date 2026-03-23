'use client';

import { GridItemData } from '@components/Board/GridCard';
import GridContainer from '@components/Board/GridContainer';
import ItemForm from '@components/Board/ItemForm';
import ContentPaper from '@components/ContentPaper';
import { api } from '@lib/api';
import { Group, Flex } from '@mantine/core';
import { useAuth } from '@providers/auth-provider';
import { useBoardContext } from '@providers/board-provider';
import { BoardDto } from '@shared/board.types';
import { useRouter } from 'next/navigation';
import { useEffect, use, useState } from 'react';

export default function EditBoardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id: boardId } = use(params);
  const { boards, getBoards } = useBoardContext();
  const [boardData, setBoardData] = useState<BoardDto | undefined>(undefined);
  const { user } = useAuth();

  useEffect(() => {
    const loadBoard = async () => {
      try {
        if (!boardId && !boardData) {
          router.push('/boards');
          return;
        }

        const retrievedBoards = await getBoards();
        const board = retrievedBoards.find((b) => b.id === boardId);

        if (!board || (board && board.userId != user?.id)) {
          router.push('/boards');
          return;
        }

        setBoardData(board);
      } catch (error) {
        console.error('Failed to load board:', error);
        router.push('/boards');
      }
    };

    loadBoard();
  }, []);

  // Convert characters to GridItemData
  const characterItems: GridItemData[] = boardData?.characters
    ? boardData.characters.map((char) => ({
        id: char.id,
        name: char.name,
        imageUrl: char.image?.imageUrl,
      }))
    : [];

  const handleSubmit = async (data: {
    name: string;
    description?: string;
    imageUrl?: string;
  }) => {
    try {
      await api.boards.updateBoard(boardId, {
        name: data.name,
        description: data.description,
        imageUrl: data.imageUrl,
      });

      router.push('/boards');
    } catch (error) {
      console.error('Failed to update board:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await api.boards.deleteBoard(boardId);
      router.push('/boards');
    } catch (error) {
      console.error('Failed to delete board:', error);
    }
  };

  const handleCancel = () => {
    router.push('/boards');
  };

  const handleAddCharacter = () => {
    // TODO: Implement character creation
    console.log('Add character clicked');
  };

  const handleCharacterClick = (character: GridItemData) => {
    // TODO: Implement character editing
    console.log('Character clicked:', character);
  };

  if (!boardData) {
    return (
      <Flex justify="center" align="center">
        <div>Loading...</div>
      </Flex>
    );
  }

  return (
    <Flex justify="center" p="md">
      <Group
        align="stretch"
        gap="md"
        w={{ base: '95%', md: '90%', lg: '85%' }}
        h="70vh"
        style={{ flexWrap: 'nowrap' }}
      >
        {/* Left: Board Form (30%) */}
        <ContentPaper w={{ base: '100%', sm: '35%', md: '30%' }}>
          <ItemForm
            title="Edit Board"
            namePlaceholder="Enter board name..."
            descriptionPlaceholder="Describe your board..."
            initialData={{
              name: boardData.name,
              description: boardData.description,
              imageUrl: boardData.image?.imageUrl,
            }}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            onDelete={handleDelete}
          />
        </ContentPaper>

        {/* Right: Characters Grid (70%) */}
        <ContentPaper w={{ base: '100%', sm: '65%', md: '70%' }}>
          <GridContainer
            items={characterItems}
            showSearch={true}
            searchPlaceholder="Search characters..."
            showAddButton={true}
            onAddClick={handleAddCharacter}
            onItemClick={handleCharacterClick}
            colCount={5}
          />
        </ContentPaper>
      </Group>
    </Flex>
  );
}
