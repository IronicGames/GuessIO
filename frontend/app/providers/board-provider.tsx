'use client';

import { BoardDto } from '@shared/board.types';
import { createContext, useContext, useState, ReactNode } from 'react';

interface BoardContextType {
  boards: BoardDto[];
  setBoards: (boards: BoardDto[]) => void;
  selectedBoard: BoardDto | null;
  setSelectedBoard: (board: BoardDto | null) => void;
  refreshBoards: boolean;
  triggerRefresh: () => void;
}

const BoardContext = createContext<BoardContextType | undefined>(undefined);

export function BoardProvider({ children }: { children: ReactNode }) {
  const [boards, setBoards] = useState<BoardDto[]>([]);
  const [selectedBoard, setSelectedBoard] = useState<BoardDto | null>(null);
  const [refreshBoards, setRefreshBoards] = useState(false);

  const triggerRefresh = () => {
    setRefreshBoards((prev) => !prev);
  };

  return (
    <BoardContext.Provider
      value={{
        boards,
        setBoards,
        selectedBoard,
        setSelectedBoard,
        refreshBoards,
        triggerRefresh,
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
