'use client';

import { api } from '@lib/api';
import { BoardDto } from '@shared/board.types';
import { createContext, useContext, useState, ReactNode } from 'react';

interface BoardContextType {
  boards: BoardDto[];
  loading: boolean;
  getBoards: () => Promise<BoardDto[]>;
}

const BoardContext = createContext<BoardContextType | undefined>(undefined);

export function BoardProvider({ children }: { children: ReactNode }) {
  const [boards, setBoards] = useState<BoardDto[]>([]);
  const [loading, setLoading] = useState(false);

  const getBoards = async () => {
    setLoading(true);
    let retrievedBoards: BoardDto[] = [];
    await api.boards
      .getBoardsForUser()
      .then((data) => {
        retrievedBoards = data;
        setBoards(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
    return retrievedBoards;
  };
  return (
    <BoardContext.Provider
      value={{
        boards,
        getBoards,
        loading,
      }}
    >
      {children}
    </BoardContext.Provider>
  );
}

export function useBoardContext() {
  const context = useContext(BoardContext);
  if (!context) {
    throw new Error('useBoardContext must be used within BoardProvider');
  }
  return context;
}
