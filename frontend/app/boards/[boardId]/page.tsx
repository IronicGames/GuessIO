'use client';

import { GridItemData } from '@components/Board/GridCard';
import GridContainer from '@components/Board/GridContainer';
import ItemForm from '@components/Board/ItemForm';
import ContentPaper from '@components/ContentPaper';
import StatusScreen from '@components/StatusScreen';
import { api } from '@lib/api';
import { Group, Flex } from '@mantine/core';
import { useAuth } from '@providers/auth-provider';
import { UpdateBoardDto } from '@shared/types/board.types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { use } from 'react';

export default function EditBoardPage({
  params,
}: {
  params: Promise<{ boardId: string }>;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { boardId } = use(params);
  const { user } = useAuth();

  const {
    data: board,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['board', boardId],
    queryFn: () => api.boards.getBoard(boardId),
  });

  const { mutate: updateBoard } = useMutation({
    mutationFn: (dto: UpdateBoardDto) => api.boards.updateBoard(boardId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      queryClient.invalidateQueries({ queryKey: ['board', boardId] });
      router.push('/boards');
    },
    onError: (error) => console.error('Failed to update board:', error),
  });

  const handleSubmit = async (data: {
    name: string;
    description?: string;
    imageUrl?: string;
  }) => {
    updateBoard({
      name: data.name,
      description: data.description,
      imageUrl: data.imageUrl,
    });
  };

  const { mutate: deleteBoard } = useMutation({
    mutationFn: () => api.boards.deleteBoard(boardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      queryClient.invalidateQueries({ queryKey: ['board', boardId] });
      router.push('/boards');
    },
    onError: (error) => console.error('Failed to delete board:', error),
  });

  const handleDelete = async () => {
    deleteBoard();
  };

  const characterItems: GridItemData[] = board?.characters
    ? board.characters.map((char) => ({
        id: char.id,
        name: char.name,
        imageUrl: char.image?.imageUrl,
      }))
    : [];
  if (user?.id !== board?.userId)
    <StatusScreen text="This board does not belong to you" />;
  if (isLoading) return <StatusScreen />;
  if (error || !board) return <StatusScreen text="Error loading board" />;

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
              name: board.name,
              description: board.description,
              imageUrl: board.image?.imageUrl,
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
