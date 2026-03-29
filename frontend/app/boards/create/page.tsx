'use client';

import { Flex } from '@mantine/core';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import BoardForm from '@components/Board/BoardForm';
import ContentPaper from '@components/ContentPaper';
import { api } from '@lib/api';
import { getErrorMessage } from '@lib/errors';
import { useNotify } from '@/hooks/useNotify';

export default function CreateBoardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const notify = useNotify();

  const { mutate: createBoard } = useMutation({
    mutationFn: api.boards.createBoard,
    onSuccess: (createdBoard) => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      router.push(`/boards/${createdBoard.id}`);
    },
    onError: (e) => notify.error(getErrorMessage(e)),
  });

  return (
    <Flex justify="center" p="md">
      <ContentPaper w={{ base: '60%', md: '50%', lg: '40%' }} h="70vh">
        <BoardForm
          title="Create New Board"
          onSubmit={(data) => createBoard(data)}
          onCancel={() => router.push('/boards')}
        />
      </ContentPaper>
    </Flex>
  );
}
