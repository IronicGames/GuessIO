import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useNotify } from '@/hooks/useNotify';
import { api } from '@lib/api';
import { getErrorMessage } from '@lib/errors';
import { type UpdateBoardDto } from '@shared/types/board.types';
import { type CreateCharacterDto, type UpdateCharacterDto } from '@shared/types/character.types';

interface UseBoardMutationsOptions {
  onBoardSaved?: () => void;
  onBoardDeleted?: () => void;
  onCharacterSaved?: () => void;
  onCharacterDeleted?: () => void;
  onCharacterImported?: () => void;
  onBoardImported?: () => void;
}

export function useBoardMutations(options: UseBoardMutationsOptions, boardId?: string) {
  const queryClient = useQueryClient();
  const notify = useNotify();

  // Awaited so the callback only fires once the cache has fresh data.
  // This prevents the stale flash when returning to the character grid.
  const invalidateBoards = () => queryClient.invalidateQueries({ queryKey: ['boards'] });

  const { mutate: updateBoardMutation, isPending: isSavingBoard } = useMutation({
    mutationFn: (dto: UpdateBoardDto) => api.boards.updateBoard(boardId!, dto),
    onSuccess: async () => {
      await invalidateBoards();
      if (options.onBoardSaved) options.onBoardSaved();
    },
    onError: (e) => notify.error(getErrorMessage(e)),
  });

  const { mutate: deleteBoardMutation, isPending: isDeletingBoard } = useMutation({
    mutationFn: (id?: string) => api.boards.deleteBoard(id ?? boardId!),
    onSuccess: async () => {
      await invalidateBoards();
      if (options.onBoardDeleted) options.onBoardDeleted();
    },
    onError: (e) => notify.error(getErrorMessage(e)),
  });

  const { mutate: deleteBoardsMutation, isPending: isDeletingBoards } = useMutation({
    mutationFn: (ids: string[]) => api.boards.deleteBoards(ids),
    onSuccess: async () => {
      await invalidateBoards();
    },
    onError: (e) => notify.error(getErrorMessage(e)),
  });

  const { mutate: createCharacterMutation, isPending: isCreatingCharacter } = useMutation({
    mutationFn: (dto: CreateCharacterDto) => api.characters.createCharacter(boardId!, dto),
    onSuccess: async () => {
      await invalidateBoards();
      if (options.onCharacterSaved) options.onCharacterSaved();
    },
    onError: (e) => notify.error(getErrorMessage(e)),
  });

  const { mutate: updateCharacterMutation, isPending: isSavingCharacter } = useMutation({
    mutationFn: ({ characterId, dto }: { characterId: string; dto: UpdateCharacterDto }) =>
      api.characters.updateCharacter(boardId!, characterId, dto),
    onSuccess: async () => {
      await invalidateBoards();
      if (options.onCharacterSaved) options.onCharacterSaved();
    },
    onError: (e) => notify.error(getErrorMessage(e)),
  });

  const { mutate: deleteCharacterMutation, isPending: isDeletingCharacter } = useMutation({
    mutationFn: (characterId: string) => api.characters.deleteCharacter(boardId!, characterId),
    onSuccess: async () => {
      await invalidateBoards();
      if (options.onCharacterDeleted) options.onCharacterDeleted();
    },
    onError: (e) => notify.error(getErrorMessage(e)),
  });

  const { mutate: importBoardMutation, isPending: isImportingBoard } = useMutation({
    mutationFn: (file: File) => api.boards.importBoard(file),
    onSuccess: async () => {
      await invalidateBoards();
      if (options.onBoardImported) options.onBoardImported();
    },
    onError: (e) => notify.error(getErrorMessage(e)),
  });

  // Bulk create: drag-in images — no extra callback
  const { mutate: createCharactersMutation, isPending: isCreatingCharacters } = useMutation({
    mutationFn: (dtos: CreateCharacterDto[]) => api.characters.createCharacters(boardId!, dtos),
    onSuccess: async () => {
      await invalidateBoards();
    },
    onError: (e) => notify.error(getErrorMessage(e)),
  });

  // Bulk import: import panel — fires onCharacterImported
  const { mutate: importCharactersMutation, isPending: isImportingCharacters } = useMutation({
    mutationFn: (dtos: CreateCharacterDto[]) => api.characters.createCharacters(boardId!, dtos),
    onSuccess: async () => {
      await invalidateBoards();
      if (options.onCharacterImported) options.onCharacterImported();
    },
    onError: (e) => notify.error(getErrorMessage(e)),
  });

  const { mutate: deleteCharactersMutation, isPending: isDeletingCharacters } = useMutation({
    mutationFn: (ids: string[]) => api.characters.deleteCharacters(boardId!, ids),
    onSuccess: async () => {
      await invalidateBoards();
    },
    onError: (e) => notify.error(getErrorMessage(e)),
  });

  const pendingLabel =
    isSavingBoard || isSavingCharacter || isCreatingCharacter || isCreatingCharacters
      ? 'Saving...'
      : isDeletingBoard || isDeletingCharacter || isDeletingBoards || isDeletingCharacters
        ? 'Deleting...'
        : isImportingBoard || isImportingCharacters
          ? 'Importing...'
          : '';

  const isPending =
    isSavingBoard ||
    isDeletingBoard ||
    isCreatingCharacter ||
    isSavingCharacter ||
    isDeletingCharacter ||
    isImportingBoard ||
    isCreatingCharacters ||
    isDeletingBoards ||
    isDeletingCharacters ||
    isImportingCharacters;

  return {
    updateBoard: (dto: UpdateBoardDto) => updateBoardMutation(dto),
    deleteBoard: (id?: string) => deleteBoardMutation(id),
    createCharacter: (dto: CreateCharacterDto) => createCharacterMutation(dto),
    updateCharacter: (characterId: string, dto: UpdateCharacterDto) =>
      updateCharacterMutation({ characterId, dto }),
    deleteCharacter: (characterId: string) => deleteCharacterMutation(characterId),
    importBoard: (file: File) => importBoardMutation(file),
    createCharacters: (dtos: CreateCharacterDto[]) => createCharactersMutation(dtos),
    importCharacters: (dtos: CreateCharacterDto[]) => importCharactersMutation(dtos),
    deleteBoards: (ids: string[]) => deleteBoardsMutation(ids),
    deleteCharacters: (ids: string[]) => deleteCharactersMutation(ids),
    isPending,
    pendingLabel,
  };
}
