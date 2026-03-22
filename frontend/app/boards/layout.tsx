import { BoardProvider } from '@providers/board-provider';

export default function BoardsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <BoardProvider>{children}</BoardProvider>;
}
