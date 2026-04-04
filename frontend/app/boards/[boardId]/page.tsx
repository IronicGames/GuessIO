'use client';

import { Flex, Group, Box } from '@mantine/core';
import { IconPlus, IconUpload } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { use } from 'react';

import BoardForm from '@components/Board/BoardForm';
import CharacterForm from '@components/Board/CharacterForm';
import GridContainer from '@components/Board/GridContainer';
import ContentPaper from '@components/ContentPaper';
import LoadingOverlay from '@components/LoadingOverlay';
import { useCharacterPanel } from '@/hooks/useCharacterPanel';
import { useBoardMutations } from '@/hooks/useBoardMutations';
import { api } from '@lib/api';
import { getErrorMessage } from '@lib/errors';
import { useAuth } from '@providers/auth-provider';
import { type GridItemData } from '@components/Board/GridCard';

export default function EditBoardPage({ params }: { params: Promise<{ boardId: string }> }) {
  const router = useRouter();
  const { boardId } = use(params);
  const { user } = useAuth();
  const panel = useCharacterPanel();

  const {
    data: boards,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['boards'],
    queryFn: () => api.boards.getBoardsForUser(),
  });

  const mutations = useBoardMutations(boardId, {
    onBoardSaved: () => router.push('/boards'),
    onBoardDeleted: () => router.push('/boards'),
    onCharacterSaved: panel.close,
    onCharacterDeleted: panel.close,
    onCharacterImported: panel.close,
  });

  const handleExport = async () => {
    await api.boards.exportBoard(boardId);
  };

  if (isLoading) return <LoadingOverlay mode="screen" status="loading" />;
  if (error) return <LoadingOverlay mode="screen" status="error" text={getErrorMessage(error)} />;

  const board = boards?.find((b) => b.id === boardId);
  if (!board) return <LoadingOverlay mode="screen" status="error" text="Board not found" />;
  if (user?.id !== board.userId) {
    return <LoadingOverlay mode="screen" status="error" text="This board does not belong to you" />;
  }

  const importableCharacters: GridItemData[] = boards
    ? [
        ...new Map(
          boards
            .filter((b) => b.id !== boardId)
            .flatMap((b) => b.characters)
            .filter((c) => !c.boardIds.includes(boardId))
            .map((c) => [c.id, c]),
        ).values(),
      ].map((c) => ({ id: c.id, name: c.name, imageUrl: c.image?.imageUrl, tags: c.tags }))
    : [];

  const characterItems: GridItemData[] = board.characters
    ? [...board.characters]
        .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
        .map((c) => ({ id: c.id, name: c.name, imageUrl: c.image?.imageUrl, tags: c.tags }))
    : [];

  return (
    <Flex justify="center" p="md">
      <Group
        align="stretch"
        gap="md"
        w={{ base: '95%', md: '90%', lg: '85%' }}
        h={{ base: 'auto', md: '70vh' }}
        style={{ flexWrap: 'wrap' }}
      >
        {/* Board form — full width when stacked, 30% when side by side */}
        <ContentPaper
          w={{ base: '100%', md: '30%' }}
          h={{ base: 'auto', md: '100%' }}
          style={{ minHeight: 400 }}
        >
          <BoardForm
            title="Edit Board"
            initialData={{
              name: board.name,
              description: board.description,
              imageUrl: board.image?.imageUrl,
              isPublic: board.isPublic,
            }}
            onSubmit={(data) => mutations.updateBoard(data)}
            onCancel={() => router.push('/boards')}
            onDelete={() => mutations.deleteBoard()}
            onExport={handleExport}
          />
        </ContentPaper>

        {/* Character panel — full width when stacked, remaining width when side by side */}
        <ContentPaper
          w={{ base: '100%', md: '65%' }}
          h={{ base: 'auto', md: '100%' }}
          style={{ minHeight: 500, flex: 1 }}
        >
          {/* position: relative scopes the loading overlay to this panel */}
          <Box style={{ position: 'relative', height: '100%', minHeight: 'inherit' }}>
            <LoadingOverlay
              mode="overlay"
              visible={mutations.isPending}
              message={mutations.pendingLabel}
            />

            {panel.view === 'add' && (
              <CharacterForm
                title="Add Character"
                onBack={panel.close}
                onSubmit={(data) => mutations.createCharacter(data)}
                onCancel={panel.close}
              />
            )}

            {panel.view === 'edit' && panel.currentCharacter && (
              <CharacterForm
                title="Edit Character"
                onBack={panel.close}
                initialData={{
                  name: panel.currentCharacter.name,
                  imageUrl: panel.currentCharacter.imageUrl,
                  tags: panel.currentCharacter.tags,
                }}
                onSubmit={(data) => mutations.updateCharacter(panel.currentCharacter!.id, data)}
                onCancel={panel.close}
                onDelete={() => mutations.deleteCharacter(panel.currentCharacter!.id)}
              />
            )}

            {panel.view === 'import' && (
              <GridContainer
                items={importableCharacters}
                onBack={panel.close}
                showSearch={true}
                searchPlaceholder="Search characters..."
                onItemClick={(character) =>
                  mutations.importCharacter({ characterId: character.id })
                }
                colCount={5}
              />
            )}

            {panel.view === 'grid' && (
              <GridContainer
                items={characterItems}
                showSearch={true}
                searchPlaceholder="Search characters..."
                actionCards={[
                  {
                    id: 'add',
                    icon: <IconPlus size="70%" color="white" strokeWidth={2} />,
                    label: 'Add',
                    onClick: panel.openAdd,
                  },
                  {
                    id: 'import',
                    icon: <IconUpload size="70%" color="white" strokeWidth={2} />,
                    label: 'Import',
                    disabled: importableCharacters.length === 0,
                    onClick: panel.openImport,
                  },
                ]}
                onItemClick={panel.openEdit}
                colCount={5}
                onBack={() => router.push('/boards')}
              />
            )}
          </Box>
        </ContentPaper>
      </Group>
    </Flex>
  );
}
