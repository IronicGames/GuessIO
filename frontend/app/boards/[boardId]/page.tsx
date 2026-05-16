'use client';

import { Badge, Box, Button, Flex, Group, ScrollArea } from '@mantine/core';
import { IconPlus, IconTrash, IconUpload } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { use, useState } from 'react';

import BoardForm from '@components/Board/BoardForm';
import CharacterForm from '@components/Board/CharacterForm';
import GridContainer from '@components/Board/GridContainer';
import ConfirmDeleteModal from '@components/Board/ConfirmDeleteModal';
import ContentPaper from '@components/ContentPaper';
import LoadingOverlay from '@components/LoadingOverlay';
import { useCharacterPanel } from '@/hooks/useCharacterPanel';
import { useBoardMutations } from '@/hooks/useBoardMutations';
import { api } from '@lib/api';
import { getErrorMessage } from '@lib/errors';
import { useAuth } from '@providers/auth-provider';
import { useNotify } from '@/hooks/useNotify';
import { type GridItemData, type QuickAction } from '@components/Board/GridCard';

const fileToDataUri = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export default function EditBoardPage({ params }: { params: Promise<{ boardId: string }> }) {
  const router = useRouter();
  const { boardId } = use(params);
  const { user } = useAuth();
  const panel = useCharacterPanel();
  const notify = useNotify();

  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isDraggingImages, setIsDraggingImages] = useState(false);
  const [isCharSelectMode, setIsCharSelectMode] = useState(false);
  const [selectedCharIds, setSelectedCharIds] = useState<Set<string>>(new Set());
  const [selectedImportIds, setSelectedImportIds] = useState<Set<string>>(new Set());
  const [confirmDeleteChars, setConfirmDeleteChars] = useState<string[] | null>(null);

  const {
    data: boards,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['boards'],
    queryFn: () => api.boards.getBoardsForUser(),
  });

  const mutations = useBoardMutations(
    {
      onBoardSaved: () => router.push('/boards'),
      onBoardDeleted: () => router.push('/boards'),
      onCharacterSaved: panel.close,
      onCharacterDeleted: panel.close,
      onCharacterImported: () => {
        panel.close();
        setSelectedImportIds(new Set());
      },
    },
    boardId,
  );

  const handleImageDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (panel.view === 'grid') setIsDraggingImages(true);
  };

  const handleImageDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDraggingImages(false);
    }
  };

  const handleImageDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingImages(false);
    if (panel.view !== 'grid') return;

    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'));
    if (files.length === 0) return;
    if (files.length > 50) {
      notify.error('Too many images — drop up to 50 at a time');
      return;
    }

    const stubs = await Promise.all(
      files.map(async (file) => ({
        name: file.name.replace(/\.[^.]+$/, ''),
        imageUrl: await fileToDataUri(file),
      })),
    );

    mutations.createCharacters(stubs.map((s) => ({ name: s.name, imageUrl: s.imageUrl })));
  };

  const toggleCharSelection = (item: GridItemData) => {
    setSelectedCharIds((prev) => {
      const next = new Set(prev);
      next.has(item.id) ? next.delete(item.id) : next.add(item.id);
      return next;
    });
  };

  const toggleImportSelection = (item: GridItemData) => {
    setSelectedImportIds((prev) => {
      const next = new Set(prev);
      next.has(item.id) ? next.delete(item.id) : next.add(item.id);
      return next;
    });
  };

  const getCharQuickActions = (item: GridItemData): QuickAction[] => [
    {
      label: 'Delete',
      icon: <IconTrash size={14} />,
      color: 'red',
      onClick: () => setConfirmDeleteChars([item.id]),
    },
  ];

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
  // TODO: Remove this when we are sure about Tag Mode
  const enabled = false;
  const allTags = [...new Set(characterItems.flatMap((c) => c.tags ?? []))].sort();

  const filteredCharacterItems = selectedTag
    ? characterItems.filter((c) => c.tags?.includes(selectedTag))
    : characterItems;

  const charGridHeaderAddon = (
    <Group gap="xs">
      {isCharSelectMode && selectedCharIds.size > 0 && (
        <Button size="xs" color="red" onClick={() => setConfirmDeleteChars([...selectedCharIds])}>
          Delete {selectedCharIds.size}
        </Button>
      )}
      <Button
        size="xs"
        variant={isCharSelectMode ? 'filled' : 'outline'}
        styles={{ root: { borderColor: '#33465f', color: 'white' } }}
        onClick={() => {
          setIsCharSelectMode((v) => !v);
          setSelectedCharIds(new Set());
        }}
      >
        {isCharSelectMode ? 'Cancel' : 'Select'}
      </Button>
    </Group>
  );

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
          />
        </ContentPaper>

        {/* Character panel — full width when stacked, remaining width when side by side */}
        <ContentPaper
          w={{ base: '100%', md: '65%' }}
          h={{ base: 'auto', md: '100%' }}
          style={{ minHeight: 500, flex: 1 }}
        >
          {/* position: relative scopes the loading overlay and drag overlay to this panel */}
          <Box
            style={{ position: 'relative', height: '100%', minHeight: 'inherit' }}
            onDragOver={handleImageDragOver}
            onDragLeave={handleImageDragLeave}
            onDrop={handleImageDrop}
          >
            <LoadingOverlay
              mode="overlay"
              visible={mutations.isPending}
              message={mutations.pendingLabel}
            />

            {isDraggingImages && panel.view === 'grid' && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  zIndex: 10,
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  border: '3px dashed #4fc3f7',
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pointerEvents: 'none',
                }}
              >
                <Box style={{ color: '#4fc3f7', fontWeight: 600, fontSize: '1.1rem' }}>
                  Drop images to add characters
                </Box>
              </div>
            )}

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
                onBack={() => {
                  panel.close();
                  setSelectedImportIds(new Set());
                }}
                showSearch={true}
                searchPlaceholder="Search characters..."
                selectable={true}
                selectedIds={selectedImportIds}
                onItemSelect={toggleImportSelection}
                colCount={5}
                footer={
                  <Group justify="flex-end" px="lg" pb="sm">
                    <Button
                      disabled={selectedImportIds.size === 0}
                      onClick={() => {
                        mutations.importCharacters(
                          [...selectedImportIds].map((id) => ({ characterId: id })),
                        );
                        setSelectedImportIds(new Set());
                      }}
                    >
                      Import{selectedImportIds.size > 0 ? ` ${selectedImportIds.size}` : ''}{' '}
                      character{selectedImportIds.size !== 1 ? 's' : ''}
                    </Button>
                  </Group>
                }
              />
            )}

            {panel.view === 'grid' && (
              <Box style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                {enabled && allTags.length > 0 && (
                  <ScrollArea type="auto" style={{ flexShrink: 0 }} px="lg" pt="sm">
                    <Group gap="xs" wrap="nowrap" pb="xs">
                      {allTags.map((tag) => (
                        <Badge
                          key={tag}
                          variant={selectedTag === tag ? 'filled' : 'outline'}
                          color="blue"
                          style={{ cursor: 'pointer', flexShrink: 0 }}
                          onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </Group>
                  </ScrollArea>
                )}

                <Box style={{ flex: 1, minHeight: 0 }}>
                  <GridContainer
                    items={filteredCharacterItems}
                    showSearch={true}
                    searchPlaceholder="Search characters..."
                    headerAddon={charGridHeaderAddon}
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
                    getItemQuickActions={!isCharSelectMode ? getCharQuickActions : undefined}
                    selectable={isCharSelectMode}
                    selectedIds={selectedCharIds}
                    onItemSelect={toggleCharSelection}
                    onItemClick={!isCharSelectMode ? panel.openEdit : undefined}
                    colCount={5}
                    onBack={() => router.push('/boards')}
                  />
                </Box>
              </Box>
            )}
          </Box>
        </ContentPaper>
      </Group>

      <ConfirmDeleteModal
        opened={!!confirmDeleteChars}
        onClose={() => setConfirmDeleteChars(null)}
        onConfirm={() => {
          const ids = confirmDeleteChars!;
          if (ids.length === 1) {
            mutations.deleteCharacter(ids[0]);
          } else {
            mutations.deleteCharacters(ids);
            setSelectedCharIds(new Set());
            setIsCharSelectMode(false);
          }
          setConfirmDeleteChars(null);
        }}
        message={
          confirmDeleteChars?.length === 1
            ? 'Delete this character? This cannot be undone.'
            : `Delete ${confirmDeleteChars?.length} characters? This cannot be undone.`
        }
      />
    </Flex>
  );
}
