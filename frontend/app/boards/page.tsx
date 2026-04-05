'use client';

import { Button, Center, Flex, Group, Select, Text } from '@mantine/core';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { IconDownload, IconPlus, IconTrash, IconUpload } from '@tabler/icons-react';

import GridContainer from '@components/Board/GridContainer';
import ContentPaper from '@components/ContentPaper';
import ImportPreviewModal from '@components/Board/ImportPreviewModal';
import ConfirmDeleteModal from '@components/Board/ConfirmDeleteModal';
import LoadingOverlay from '@components/LoadingOverlay';
import { api } from '@lib/api';
import { getErrorMessage } from '@lib/errors';
import { type GridItemData, type QuickAction } from '@components/Board/GridCard';
import { useBoardMutations } from '@/hooks/useBoardMutations';
import { useNotify } from '@/hooks/useNotify';

type SortBy = 'updatedAt' | 'name' | 'characters';

export default function BoardsPage() {
  const router = useRouter();
  const notify = useNotify();

  const [sortBy, setSortBy] = useState<SortBy>('updatedAt');
  const [isDragging, setIsDragging] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<{
    name: string;
    characterCount: number;
    firstImageUrl?: string;
  } | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedBoardIds, setSelectedBoardIds] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState<string[] | null>(null);

  const {
    data: boards,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['boards'],
    queryFn: () => api.boards.getBoardsForUser(),
  });

  const { importBoard, deleteBoard, deleteBoards, isPending, pendingLabel } = useBoardMutations({
    onBoardImported: () => notify.success('Board imported!'),
    onBoardDeleted: () => notify.success('Board deleted'),
  });

  const triggerImportPreview = async (file: File) => {
    try {
      const preview = await api.boards.previewImport(file);
      setPendingFile(file);
      setPreviewData(preview);
      setPreviewModalOpen(true);
    } catch (e) {
      notify.error(getErrorMessage(e as Error));
    }
  };

  const handleImportClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.guessio';
    input.onchange = () => {
      const file = input.files?.[0];
      if (file) triggerImportPreview(file);
    };
    input.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.name.endsWith('.guessio')) {
      triggerImportPreview(file);
    }
  };

  const toggleBoardSelection = (item: GridItemData) => {
    setSelectedBoardIds((prev) => {
      const next = new Set(prev);
      next.has(item.id) ? next.delete(item.id) : next.add(item.id);
      return next;
    });
  };

  const getBoardQuickActions = (item: GridItemData): QuickAction[] => [
    {
      label: 'Export',
      icon: <IconDownload size={14} />,
      onClick: () =>
        api.boards.exportBoard(item.id).catch((e) => notify.error(getErrorMessage(e as Error))),
    },
    {
      label: 'Delete',
      icon: <IconTrash size={14} />,
      color: 'red',
      onClick: () => setConfirmDelete([item.id]),
    },
  ];

  if (isLoading || isPending)
    return <LoadingOverlay mode="screen" status="loading" text={pendingLabel ?? 'Loading'} />;
  if (error) return <LoadingOverlay mode="screen" status="error" text={getErrorMessage(error)} />;

  const sortedBoards = [...(boards ?? [])].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'characters') return (b.characters?.length ?? 0) - (a.characters?.length ?? 0);
    return a.updatedAt < b.updatedAt ? 1 : -1;
  });

  const gridItems: GridItemData[] = sortedBoards.map((board) => {
    const count = board.characters?.length ?? 0;
    return {
      id: board.id,
      name: board.name,
      imageUrl: board.image?.imageUrl,
      badge: {
        label: count >= 24 ? `${count} chars` : `${count}/24`,
        color: count >= 24 ? '#4caf7d' : '#fa5252',
      },
    };
  });

  const sortControl = (
    <Select
      size="sm"
      value={sortBy}
      onChange={(v) => setSortBy((v as SortBy) ?? 'updatedAt')}
      data={[
        { value: 'updatedAt', label: 'Recent' },
        { value: 'name', label: 'Name' },
        { value: 'characters', label: 'Characters' },
      ]}
      styles={{
        input: { backgroundColor: '#1f2a3a', borderColor: '#33465f', color: 'white' },
      }}
      w={120}
      allowDeselect={false}
    />
  );

  const headerAddon = (
    <Group gap="xs">
      {isSelectMode && selectedBoardIds.size > 0 && (
        <Button size="xs" color="red" onClick={() => setConfirmDelete([...selectedBoardIds])}>
          Delete {selectedBoardIds.size}
        </Button>
      )}
      <Button
        size="xs"
        variant={isSelectMode ? 'filled' : 'outline'}
        styles={{ root: { borderColor: '#33465f', color: 'white' } }}
        onClick={() => {
          setIsSelectMode((v) => !v);
          setSelectedBoardIds(new Set());
        }}
      >
        {isSelectMode ? 'Cancel' : 'Select'}
      </Button>
      {sortControl}
    </Group>
  );

  return (
    <>
      <div
        style={{ position: 'relative' }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isDragging && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 100,
              backgroundColor: 'rgba(0,0,0,0.6)',
              border: '3px dashed #4fc3f7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
            }}
          >
            <Text size="xl" fw={600} c="#4fc3f7">
              Drop to import board
            </Text>
          </div>
        )}

        <Flex justify="center" p="md">
          <ContentPaper w={{ base: '90%', md: '85%', lg: '75%' }} h="70vh">
            {boards?.length === 0 ? (
              <Flex direction="column" h="100%" gap={0}>
                <div style={{ flexShrink: 0 }}>
                  <GridContainer
                    items={[]}
                    showSearch={false}
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
                    colCount={5}
                    onBack={() => router.push('/')}
                  />
                </div>
                <Center style={{ flex: 1 }}>
                  <Text c="dimmed" size="sm">
                    No boards yet — create one or import a .guessio file
                  </Text>
                </Center>
              </Flex>
            ) : (
              <GridContainer
                items={gridItems}
                showSearch={true}
                searchPlaceholder="Search boards..."
                headerAddon={headerAddon}
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
                getItemQuickActions={!isSelectMode ? getBoardQuickActions : undefined}
                selectable={isSelectMode}
                selectedIds={selectedBoardIds}
                onItemSelect={toggleBoardSelection}
                onItemClick={!isSelectMode ? (b) => router.push(`/boards/${b.id}`) : undefined}
                colCount={5}
                onBack={() => router.push('/')}
              />
            )}
          </ContentPaper>
        </Flex>
      </div>

      <ImportPreviewModal
        opened={previewModalOpen}
        onClose={() => {
          setPreviewModalOpen(false);
          setPendingFile(null);
          setPreviewData(null);
        }}
        onConfirm={() => importBoard(pendingFile!)}
        preview={previewData}
      />

      <ConfirmDeleteModal
        opened={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => {
          const ids = confirmDelete!;
          if (ids.length === 1) {
            deleteBoard(ids[0]);
          } else {
            deleteBoards(ids);
            setSelectedBoardIds(new Set());
            setIsSelectMode(false);
          }
          setConfirmDelete(null);
        }}
        message={
          confirmDelete?.length === 1
            ? 'Delete this board? This cannot be undone.'
            : `Delete ${confirmDelete?.length} boards? This cannot be undone.`
        }
      />
    </>
  );
}
