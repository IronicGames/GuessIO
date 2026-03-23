'use client';

import ItemForm from '@components/Board/ItemForm';
import ContentPaper from '@components/ContentPaper';
import { api } from '@lib/api';
import { Flex } from '@mantine/core';
import { useBoardContext } from '@providers/board-provider';
import { useRouter } from 'next/navigation';

export default function CreateBoardPage() {
  const router = useRouter();
  const { getBoards } = useBoardContext();
  const handleSubmit = async (data: {
    name: string;
    description?: string;
    imageUrl?: string;
  }) => {
    try {
      const createdBoard = await api.boards.createBoard({
        name: data.name,
        description: data.description,
        isPublic: false,
        imageUrl: data.imageUrl,
      });
      const retrievedBoards = await getBoards();
      if (retrievedBoards.find((b) => b.id == createdBoard.id)) {
        router.push(`/boards/${createdBoard.id}`);
      }
    } catch (error) {
      console.error('Failed to create board:', error);
    }
  };

  const handleCancel = () => {
    router.push('/boards');
  };

  return (
    <Flex justify="center" p="md">
      <ContentPaper w={{ base: '60%', md: '50%', lg: '40%' }} h="70vh">
        <ItemForm
          title="Create New Board"
          namePlaceholder="Enter board name..."
          descriptionPlaceholder="Describe your board..."
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </ContentPaper>
    </Flex>
  );
}
function useAuth(): { isLoggedIn: any } {
  throw new Error('Function not implemented.');
}
