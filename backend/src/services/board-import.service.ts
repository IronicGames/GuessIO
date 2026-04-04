import { type IZipEntry } from 'adm-zip';
import { type BoardImportPreview, type CreateBoardDto } from '@shared/types/board.types';
import { fileTypeFromBuffer } from 'file-type';
import { createBoard } from '@services/board.service';
import { createCharacter } from '@services/character.service';
import { type CreateCharacterDto } from '@shared/types/character.types';
import { validateBoardImport } from '@backend/utils/misc-validation';

export const importBoard = async (userId: string, fileBuffer: Buffer): Promise<string> => {
  const { zip, boardJson } = await validateBoardImport(fileBuffer);

  const importedBoardId = await createBoard(userId, {
    name: boardJson.name,
    description: boardJson.description,
    imageUrl: await toImageUrl(zip.getEntry(boardJson.image)),
  } as CreateBoardDto);

  for (const character of boardJson.characters) {
    await createCharacter(importedBoardId, {
      name: character.name,
      tags: character.tags,
      imageUrl: await toImageUrl(zip.getEntry(character.image)),
    } as CreateCharacterDto);
  }

  return importedBoardId;
};

export const previewImport = async (fileBuffer: Buffer): Promise<BoardImportPreview> => {
  const { zip, boardJson } = await validateBoardImport(fileBuffer);
  const firstImageEntry = boardJson.image ? zip.getEntry(boardJson.image) : null;
  return {
    name: boardJson.name,
    characterCount: boardJson.characters.length,
    firstImageUrl: await toImageUrl(firstImageEntry),
  };
};

const toImageUrl = async (image: IZipEntry | null): Promise<string | undefined> => {
  // TODO: when S3 is set up, store the image and return the URL instead.
  if (!image) return;
  const imageBytes = image.getData();
  const ext = image.entryName.split('.').pop()?.toLowerCase();

  if (ext === 'svg') {
    const base64 = imageBytes.toString('base64');
    return `data:image/svg+xml;base64,${base64}`;
  }

  const type = await fileTypeFromBuffer(imageBytes);
  if (!type) return;
  const base64 = imageBytes.toString('base64');
  return `data:${type.mime};base64,${base64}`;
};
