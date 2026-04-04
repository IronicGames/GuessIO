'use client';

import { Flex } from '@mantine/core';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { IconPlus, IconUpload } from '@tabler/icons-react';

import GridContainer from '@components/Board/GridContainer';
import ContentPaper from '@components/ContentPaper';
import LoadingOverlay from '@components/LoadingOverlay';
import { api } from '@lib/api';
import { getErrorMessage } from '@lib/errors';
import { type GridItemData } from '@components/Board/GridCard';
import { useBoardMutations } from '@/hooks/useBoardMutations';
import { useNotify } from '@/hooks/useNotify';

export default function BoardsPage() {
  const router = useRouter();
  const notify = useNotify();
  const {
    data: boards,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['boards'],
    queryFn: () => api.boards.getBoardsForUser(),
  });
  const { importBoard, isPending, pendingLabel } = useBoardMutations({
    onBoardImported: () => notify.success('Board imported!'),
  });

  if (isLoading || isPending)
    return <LoadingOverlay mode="screen" status="loading" text={pendingLabel ?? 'Loading'} />;
  if (error) return <LoadingOverlay mode="screen" status="error" text={getErrorMessage(error)} />;

  const gridItems: GridItemData[] =
    boards
      ?.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
      .map((board) => ({
        id: board.id,
        name: board.name,
        imageUrl: board.image?.imageUrl,
      })) ?? [];

  const handleImportClick = () => {
    const input = document.createElement('input');
    input.type = 'file';

    // Accept .zip and .guessio
    input.accept = '.guessio';

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      try {
        const formData = new FormData();
        formData.append('file', file);

        importBoard(file);

        console.log('Import successful');
      } catch (err) {
        console.error('Import failed', err);
      }
    };

    input.click();
  };

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
            {
              id: 'import',
              icon: <IconUpload size="70%" color="white" strokeWidth={2} />,
              label: 'Import',
              onClick: handleImportClick,
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
