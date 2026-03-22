'use client';

import GridContainer from '@components/Board/GridContainer';
import ItemForm from '@components/Board/ItemForm';
import { api } from '@lib/api';
import { Flex } from '@mantine/core';
import { useBoardContext } from '@providers/board-provider';
import { useRouter } from 'next/navigation';
import { useEffect, use } from 'react';

export default function EditBoardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id: boardId } = use(params); // Unwrap params Promise
  const { selectedBoard, boards, triggerRefresh } = useBoardContext();

  // If no selected board, try to find it from boards array
  const boardData =
    selectedBoard?.id === boardId
      ? selectedBoard
      : boards.find((b) => b.id === boardId);

  useEffect(() => {
    // If no board data found, redirect back to boards list
    if (!boardData) {
      router.push('/boards');
    }
  }, [boardData, router]);

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

      console.log('Board updated:', data);

      // Trigger refresh of boards list
      triggerRefresh();

      // Navigate back to boards list
      router.push('/boards');
    } catch (error) {
      console.error('Failed to update board:', error);
      // TODO: Show error toast/notification
    }
  };

  const handleDelete = async () => {
    try {
      await api.boards.deleteBoard(boardId);

      console.log('Board deleted:', boardId);

      // Trigger refresh of boards list
      triggerRefresh();

      // Navigate back to boards list
      router.push('/boards');
    } catch (error) {
      console.error('Failed to delete board:', error);
      // TODO: Show error toast/notification
    }
  };

  const handleCancel = () => {
    router.push('/boards');
  };

  // Show loading while retrieving board data
  if (!boardData) {
    return (
      <Flex h="90vh" w="100vw" justify="center" align="center">
        <div>Loading...</div>
      </Flex>
    );
  }

  return (
    <Flex h="90vh" w="100vw" justify="center" align="center">
      <GridContainer
        showSearch={false}
        scrollable={false}
        height="auto"
        width="50%"
      >
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
          submitText="Save Changes"
          cancelText="Cancel"
          deleteText="Delete Board"
          showDelete={true}
        />
      </GridContainer>
    </Flex>
  );
}
