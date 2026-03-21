'use client';

import Button from '@/components/ui/Button';
import Header from '@/components/ui/Header/Header';
import BoardGrid from '@components/ui/Board/BoardGrid';
import { api } from '@lib/api';
import { Center, Container, Flex, Paper, SimpleGrid, Text, TextInput } from '@mantine/core';
import { BoardDto } from '@shared/board.types';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Boards() {
    const [boards, setBoards] = useState<BoardDto[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if(!loading) return;
        api.boards.getBoardsForUser().then((data) => {
            setBoards(data);
            setLoading(false);
        }).catch((err) => {
            console.error(err);
            setLoading(false);
        });
        console.log("boards: ", boards);
    }, [loading]);

    return (
        <>
            <Header />
            <Flex h="100vh" w="100vw" justify={"center"} align={"flex-end"} pb={20}>
                <Paper p="lg" w={"50%"} h={"85%"}
                    withBorder shadow="xl" radius="md">
                    <TextInput placeholder="Board Name" size="xl" mb="md" />
                    <BoardGrid cards={boards.map((board) => ({ id: board.id, name: board.name, imageUrl: board.image.imageUrl}))} 
                    addButton={true} />
                </Paper>
            </Flex>
        </>

    );
}
