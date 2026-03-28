'use client';

import { useNotify } from '@/hooks/useNotify';
import { type GridItemData } from '@components/Board/GridCard';
import GridContainer from '@components/Board/GridContainer';
import ItemForm, { FormType } from '@components/Board/ItemForm';
import ContentPaper from '@components/ContentPaper';
import StatusScreen from '@components/StatusScreen';
import { api } from '@lib/api';
import { getErrorMessage } from '@lib/errors';
import { Group, Flex } from '@mantine/core';
import { useAuth } from '@providers/auth-provider';
import { type UpdateBoardDto } from '@shared/types/board.types';
import { CreateCharacterDto, UpdateCharacterDto } from '@shared/types/character.types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { use, useState } from 'react';

export default function EditBoardPage({ params }: { params: Promise<{ boardId: string }> }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { boardId } = use(params);
  const { user } = useAuth();
  const notify = useNotify();

  const [characterFormType, setCharacterFormType] = useState<FormType>(FormType.Hidden);
  const [currentCharacter, setCurrentCharacter] = useState<GridItemData | null>(null);

  const {
    data: board,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['board', boardId],
    queryFn: () => api.boards.getBoard(boardId),
  });

  const { mutate: createCharacter } = useMutation({
    mutationFn: (dto: CreateCharacterDto) => api.characters.createCharacter(boardId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      queryClient.invalidateQueries({ queryKey: ['board', boardId] });
      setCharacterFormType(FormType.Hidden);
      setCurrentCharacter(null);
    },
    onError: (e) => notify.error(getErrorMessage(e)),
  });

  const { mutate: updateBoard } = useMutation({
    mutationFn: (dto: UpdateBoardDto) => api.boards.updateBoard(boardId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      queryClient.invalidateQueries({ queryKey: ['board', boardId] });
      router.push('/boards');
    },
    onError: (e) => notify.error(getErrorMessage(e)),
  });

    const { mutate: updateCharacter } = useMutation({
    mutationFn: (dto: UpdateCharacterDto) => api.characters.updateCharacter(boardId, currentCharacter!.id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      queryClient.invalidateQueries({ queryKey: ['board', boardId] });
      setCharacterFormType(FormType.Hidden);
      setCurrentCharacter(null);
    },
    onError: (e) => notify.error(getErrorMessage(e)),
  });

  const handleSubmit = async (formType: FormType, data: { name: string; description?: string; imageUrl?: string }) => {
    if (formType === FormType.Board) {
      updateBoard({
        name: data.name,
        description: data.description,
        imageUrl: data.imageUrl,
      });
    } else if (formType === FormType.AddCharacter) {
      createCharacter({
        name: data.name,
        imageUrl: data.imageUrl,
      });
    } else if (formType === FormType.EditCharacter) {
      updateCharacter({
        name: data.name,
        imageUrl: data.imageUrl,
        //TODO: adding tags
        tags: [],
      });
    } else {
      notify.error('Unknown form type');
    }
  };

  const { mutate: deleteCharacter } = useMutation({
    mutationFn: (characterId: string) => api.characters.deleteCharacter(boardId, characterId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      queryClient.invalidateQueries({ queryKey: ['board', boardId] });
      setCharacterFormType(FormType.Hidden);
      setCurrentCharacter(null);
    },
    onError: (e) => notify.error(getErrorMessage(e)),
  });

  const { mutate: deleteBoard } = useMutation({
    mutationFn: () => api.boards.deleteBoard(boardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      queryClient.invalidateQueries({ queryKey: ['board', boardId] });
      router.push('/boards');
    },
    onError: (e) => notify.error(getErrorMessage(e)),
  });

  const handleDelete = async (formType: FormType, characterId?: string ) => {
    if (formType === FormType.Board) {
      deleteBoard();
    } else {
      deleteCharacter(characterId!);
    }
  };

  const characterItems: GridItemData[] = board?.characters
    ? board.characters.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : a.updatedAt > b.updatedAt ? -1 : 0)).map((char) => ({
      id: char.id,
      name: char.name,
      imageUrl: char.image?.imageUrl,
    }))
    : [];
  if (user?.id !== board?.userId) <StatusScreen text="This board does not belong to you" />;
  if (isLoading) return <StatusScreen />;
  if (error || !board) return <StatusScreen text="Error loading board" />;

  const handleCancel = (formType: FormType) => {
    if (formType === FormType.Board) {
      router.push('/boards');
    } else {
      setCharacterFormType(FormType.Hidden);
      setCurrentCharacter(null);
    }
  };

  const handleAddCharacter = () => {
    setCharacterFormType(FormType.AddCharacter);
  };

  const handleCharacterClick = (character: GridItemData) => {
    setCharacterFormType(FormType.EditCharacter);
    setCurrentCharacter(character);
  };

  return (
    <Flex justify="center" p="md">
      <Group
        align="stretch"
        gap="md"
        w={{ base: '95%', md: '90%', lg: '85%' }}
        h="70vh"
        style={{ flexWrap: 'nowrap' }}
      >
        {/* Left: Board Form (30%) */}
        <ContentPaper w={{ base: '100%', sm: '35%', md: '30%' }}>
          <ItemForm
            title="Edit Board"
            namePlaceholder="Enter board name..."
            descriptionPlaceholder="Describe your board..."
            formType={FormType.Board}
            initialData={{
              name: board.name,
              description: board.description,
              imageUrl: board.image?.imageUrl,
            }}
            onSubmit={(data) => handleSubmit(FormType.Board, data)}
            onCancel={() => handleCancel(FormType.Board)}
            onDelete={() => handleDelete(FormType.Board)}
          />
        </ContentPaper>

        {/* Right: Characters Grid (70%) */}
        <ContentPaper w={{ base: '100%', sm: '65%', md: '70%' }}>
          {characterFormType !== FormType.Hidden ? (
            <ItemForm
              title={`${
                characterFormType === FormType.AddCharacter ? 'Add' : 'Edit'
              } Character`}
              namePlaceholder="Enter character name..."
              formType={characterFormType}
              initialData={characterFormType === FormType.EditCharacter && currentCharacter ? {
                name: currentCharacter.name,
                imageUrl: currentCharacter.imageUrl,
              }: undefined}
              onSubmit={(data) => handleSubmit(characterFormType, data)}
              onCancel={() => handleCancel(characterFormType)}
              onDelete={() => handleDelete(characterFormType, currentCharacter?.id)}
            />) :
            <GridContainer
              items={characterItems}
              showSearch={true}
              searchPlaceholder="Search characters..."
              showAddButton={true}
              onAddClick={handleAddCharacter}
              onItemClick={handleCharacterClick}
              colCount={5}
            />
          }
        </ContentPaper>
      </Group>
    </Flex>
  );
}
