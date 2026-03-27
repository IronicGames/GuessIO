'use client';

import ItemForm from '@components/Board/ItemForm';
import ContentPaper from '@components/ContentPaper';
import { api } from '@lib/api';
import { Flex } from '@mantine/core';
import { useAuth } from '@providers/auth-provider';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

export default function CreateBoardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  if (!user?.id) router.push('/');

  const { mutate: createBoard } = useMutation({
    mutationFn: api.boards.createBoard,
    onSuccess: (createdBoard) => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      router.push(`/boards/${createdBoard.id}`);
    },
    onError: (error) => {
      console.error('Failed to create board:', error);
    },
  });

  const handleSubmit = (data: { name: string; description?: string; imageUrl?: string }) => {
    createBoard({
      name: data.name,
      description: data.description,
      isPublic: false,
      imageUrl: data.imageUrl,
    });
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
