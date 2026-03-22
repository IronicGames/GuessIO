'use client';

import GridContainer from '@components/Board/GridContainer';
import ItemForm from '@components/Board/ItemForm';
import { api } from '@lib/api';
import { Flex } from '@mantine/core';
import { useRouter } from 'next/navigation';

export default function CreateBoardPage() {
  const router = useRouter();

  const handleSubmit = async (data: {
    name: string;
    description?: string;
    imageUrl?: string;
  }) => {
    try {
      // TODO: Upload image to S3 first if needed, then get URL

      const response = await api.boards.createBoard({
        name: data.name,
        description: data.description,
        isPublic: false,
        imageUrl: data.imageUrl,
      });

      console.log('Board created:', response);
      router.push('/boards');
    } catch (error) {
      console.error('Failed to create board:', error);
      // TODO: Show error toast/notification
    }
  };

  const handleCancel = () => {
    router.push('/boards');
  };

  return (
    <Flex h="90vh" w="100vw" justify="center" align="center">
      <GridContainer
        showSearch={false}
        scrollable={false}
        height="auto"
        width="50%"
      >
        <ItemForm
          title="Create New Board"
          namePlaceholder="Enter board name..."
          descriptionPlaceholder="Describe your board..."
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitText="Create Board"
          cancelText="Cancel"
        />
      </GridContainer>
    </Flex>
  );
}
