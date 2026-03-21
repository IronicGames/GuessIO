'use client';

import BoardGrid from '@components/Board/BoardGrid';
import { api } from '@lib/api';
import {
  Box,
  Center,
  Container,
  Flex,
  Paper,
  SimpleGrid,
  Text,
  TextInput,
} from '@mantine/core';
import { BoardDto } from '@shared/board.types';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Boards() {
  const [boards, setBoards] = useState<BoardDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!loading) return;
    api.boards
      .getBoardsForUser()
      .then((data) => {
        setBoards(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
    console.log('boards: ', boards);
  }, [loading]);

  return (
    <>
      <Flex h="90vh" w="100vw" justify={'center'} align={'center'}>
        <Paper
          p="lg"
          w={'50%'}
          h={'90%'}
          withBorder
          shadow="xl"
          radius="md"
          bg="#243040"
          style={{
            borderColor: '#33465f',
            borderWidth: 1,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <TextInput
            styles={{
              input: { backgroundColor: '#1f2a3a', borderColor: '#33465f' },
            }}
            placeholder="Board Name"
            size="xl"
            mb="md"
            style={{ position: 'sticky', top: 0, zIndex: 10 }}
          />
          <Box style={{ flex: 1, overflow: 'auto' }}>
            <BoardGrid
              cards={boards.map((board) => ({
                id: board.id,
                name: board.name,
                imageUrl: board.image.imageUrl,
              }))}
              addButton={true}
            />
          </Box>
        </Paper>
      </Flex>
    </>
  );
}
