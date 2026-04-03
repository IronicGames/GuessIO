'use client';

import { Flex } from '@mantine/core';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { IconPlus } from '@tabler/icons-react';

import GridContainer from '@components/Board/GridContainer';
import ContentPaper from '@components/ContentPaper';
import LoadingOverlay from '@components/LoadingOverlay';
import { api } from '@lib/api';
import { getErrorMessage } from '@lib/errors';
import { type GridItemData } from '@components/Board/GridCard';

export default function BoardsPage() {
  const router = useRouter();

  const {
    data: boards,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['boards'],
    queryFn: () => api.boards.getBoardsForUser(),
  });

  if (isLoading) return <LoadingOverlay mode="screen" status="loading" />;
  if (error) return <LoadingOverlay mode="screen" status="error" text={getErrorMessage(error)} />;

  const gridItems: GridItemData[] =
    boards
      ?.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
      .map((board) => ({
        id: board.id,
        name: board.name,
        imageUrl: board.image?.imageUrl,
      })) ?? [];

  return (
    <Flex justify="center" p="md">
      <ContentPaper w={{ base: '90%', md: '85%', lg: '75%' }} h="70vh">
        <GridContainer
          items={gridItems}
          showSearch={true}
          searchPlaceholder="Search boards..."
          actionCards={[
            {
              id: 'create',
              icon: <IconPlus size="70%" color="white" strokeWidth={2} />,
              label: 'Create',
              onClick: () => router.push('/boards/create'),
            },
          ]}
          onItemClick={(board) => router.push(`/boards/${board.id}`)}
          colCount={5}
          onBack={() => router.push('/')}
        />
      </ContentPaper>
    </Flex>
  );
}
