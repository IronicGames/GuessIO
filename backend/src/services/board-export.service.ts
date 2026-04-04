import { getBoard } from './board.service';
import { BadRequestError } from '@backend/errors/app-error';
import { config } from '@backend/utils/constants/env';
import { ImageType, MAX_IMAGE_SIZE_BYTES, validateImageUrl } from '@backend/utils/misc-validation';
import { type BoardDto } from '@shared/types/board.types';
import archiver from 'archiver';
import crypto from 'crypto';
import mime2ext from 'mime2ext';

export type ExportedFile = { id: string; filename: string; bytes: Buffer };
export type ImageInfo = { id: string; name: string; imageUrl?: string };
export const createBoardZip = async (userId: string, boardId: string): Promise<ExportedFile> => {
  const board = await getBoard(userId, boardId);

  const imageInfos = [
    { id: board.id, name: board.name, imageUrl: board.image?.imageUrl },
    ...board.characters.map((char) => ({
      id: char.id,
      name: char.name,
      imageUrl: char.image?.imageUrl,
    })),
  ] as ImageInfo[];

  const imageFiles = (await Promise.all(imageInfos.map(toImageFile))).filter(
    (f): f is ExportedFile => f !== null,
  );

  const imageMap = new Map(imageFiles.map((f) => [f.id, f.filename]));

  const boardJson = buildBoardJson(board, imageMap);
  const manifestJson = buildManifestJson(boardJson, imageFiles);

  const bytes = await buildZip(boardJson, manifestJson, imageFiles);

  return {
    id: board.id,
    filename: `${toSafeName(board.name)}.guessio`,
    bytes,
  };
};

// ---- Helpers ----

async function toImageFile(imageInfo: ImageInfo, index: number): Promise<ExportedFile | null> {
  const imageType = validateImageUrl(imageInfo.imageUrl);
  if (imageType === ImageType.NONE) return null;

  const baseName = `${pad(index)}-${toSafeName(imageInfo.name)}`;

  if (imageType === ImageType.DATA_URI) {
    return toImageFileFromDataUri(imageInfo, baseName);
  } else {
    return toImageFileFromRemoteUrl(imageInfo, baseName);
  }
}

function toImageFileFromDataUri(imageInfo: ImageInfo, baseName: string): ExportedFile {
  const matches = imageInfo.imageUrl!.match(/^data:(.+);base64,(.+)$/);
  if (!matches) throw new BadRequestError(`Invalid data URI for image ${imageInfo.name}`);

  const mimeType = matches[1];
  if (!mimeType.startsWith('image/') || !mime2ext(mimeType)) {
    throw new BadRequestError(`Unsupported MIME type for image ${imageInfo.name}`);
  }

  const bytes = Buffer.from(matches[2], 'base64');
  return { id: imageInfo.id, filename: `images/${baseName}.${mime2ext(mimeType)}`, bytes };
}

async function toImageFileFromRemoteUrl(
  imageInfo: ImageInfo,
  baseName: string,
): Promise<ExportedFile> {
  const response = await fetch(imageInfo.imageUrl!, {
    method: 'GET',
    signal: AbortSignal.timeout(5000),
  });

  if (!response.ok || !response.headers.get('Content-Type')?.startsWith('image/')) {
    throw new BadRequestError(`Failed to fetch image from URL for ${imageInfo.name}`);
  }

  const contentType = response.headers.get('Content-Type')!.split(';')[0].trim();
  const bytes = Buffer.from(await response.arrayBuffer());

  if (bytes.length > MAX_IMAGE_SIZE_BYTES) {
    throw new BadRequestError(
      `Image for ${imageInfo.name} exceeds maximum size limit of ${MAX_IMAGE_SIZE_BYTES} bytes`,
    );
  }

  return { id: imageInfo.id, filename: `images/${baseName}.${mime2ext(contentType)}`, bytes };
}

function buildBoardJson(board: BoardDto, imageMap: Map<string, string>): string {
  return JSON.stringify({
    name: board.name,
    description: board.description,
    image: imageMap.get(board.id),
    characters: board.characters.map((char) => ({
      name: char.name,
      tags: char.tags,
      image: imageMap.get(char.id),
    })),
  });
}

function buildManifestJson(boardJson: string, imageFiles: ExportedFile[]): string {
  const files: Record<string, string> = {};
  files['board.json'] = sha256(Buffer.from(boardJson));
  imageFiles.forEach((f) => (files[f.filename] = sha256(f.bytes)));
  return JSON.stringify({ version: config.export_version, files });
}

async function buildZip(
  boardJson: string,
  manifestJson: string,
  imageFiles: ExportedFile[],
): Promise<Buffer> {
  const archive = archiver('zip', { zlib: { level: 9 } });

  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    archive.on('data', (chunk: Buffer) => chunks.push(chunk));
    archive.on('end', () => resolve(Buffer.concat(chunks)));
    archive.on('error', reject);

    archive.append(boardJson, { name: 'board.json' });
    archive.append(manifestJson, { name: 'manifest.json' });
    imageFiles.forEach((f) => archive.append(f.bytes, { name: f.filename }));

    archive.finalize();
  });
}

// ---- Utils ----

const sha256 = (data: Buffer | string): string =>
  `sha256:${crypto.createHash('sha256').update(data).digest('hex')}`;

const pad = (n: number): string => n.toString().padStart(2, '0');

export function toSafeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}
