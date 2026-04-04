import { getBoard } from './board.service';
import { BadRequestError } from '@backend/errors/app-error';
import { ImageType, MAX_IMAGE_SIZE_BYTES, validateImageUrl } from '@backend/utils/misc-validation';
import archiver from 'archiver';
import crypto from 'crypto';
import mime2ext from 'mime2ext';

export type ExportedFile = { id: string; filename: string; bytes: Buffer };
export const createBoardZip = async (userId: string, boardId: string): Promise<ExportedFile> => {
  const board = await getBoard(userId, boardId);
  const pad = (n: number) => n.toString().padStart(2, '0');

  const imageInfos = [
    { id: board.id, name: board.name, imageUrl: board.image?.imageUrl },
    ...board.characters.map((char) => ({
      id: char.id,
      name: char.name,
      imageUrl: char.image?.imageUrl,
    })),
  ];
  const imageFiles: ExportedFile[] = [];
  await Promise.all(
    imageInfos.map(async ({ id, name, imageUrl }, index) => {
      const prefix = pad(index);
      const safeName = toSafeName(name);
      const baseName = `${prefix}-${safeName}`;
      const imageType = validateImageUrl(imageUrl);
      if (imageType === ImageType.NONE) {
        return;
      } else if (imageType === ImageType.DATA_URI) {
        const matches = imageUrl!.match(/^data:(.+);base64,(.+)$/);
        if (!matches) {
          throw new BadRequestError(`Invalid data URI for image ${name}`);
        }
        const mimeType = matches[1];
        if (!mimeType.startsWith('image/') || !mime2ext(mimeType)) {
          throw new BadRequestError(`Unsupported MIME type for image ${name}`);
        }
        const base64Data = matches[2];
        const bytes = Buffer.from(base64Data, 'base64');
        imageFiles.push({
          id: id,
          filename: `images/${  baseName  }.${  mime2ext(mimeType)}`,
          bytes,
        } as ExportedFile);
      } else if (imageType === ImageType.REMOTE_URL) {
        const response = await fetch(imageUrl!, {
          method: 'GET',
          signal: AbortSignal.timeout(5000),
        });
        if (!response.ok || !response.headers.get('Content-Type')?.startsWith('image/')) {
          throw new BadRequestError(`Failed to fetch image from URL for ${name}`);
        }
        const contentType = response.headers.get('Content-Type')!.split(';')[0].trim();
        const arrayBuffer = await response.arrayBuffer();
        const bytes = Buffer.from(arrayBuffer);
        if (bytes.length > MAX_IMAGE_SIZE_BYTES) {
          throw new BadRequestError(
            `Image for ${name} exceeds maximum size limit of ${MAX_IMAGE_SIZE_BYTES} bytes`,
          );
        }
        imageFiles.push({
          id: id,
          filename: `images/${  baseName  }.${  mime2ext(contentType)}`,
          bytes,
        } as ExportedFile);
      }
    }),
  );
  const imageMap = new Map(imageFiles.map((f) => [f.id, f.filename]));
  const boardJson = JSON.stringify({
    version: 1,
    name: board.name,
    description: board.description,
    image: imageMap.get(board.id),
    characters: board.characters.map((char) => ({
      name: char.name,
      tags: char.tags,
      image: imageMap.get(char.id),
    })),
  });
  const manifestFiles: Record<string, string> = {};

  manifestFiles['board.json'] =
    `sha256:${  crypto.createHash('sha256').update(boardJson).digest('hex')}`;

  imageFiles.forEach((file) => {
    manifestFiles[file.filename] =
      `sha256:${  crypto.createHash('sha256').update(file.bytes).digest('hex')}`;
  });

  const manifestJson = JSON.stringify({
    version: 1,
    files: manifestFiles,
  });
  const archive = archiver('zip', { zlib: { level: 9 } });

  const buffer = await new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    archive.on('data', (chunk: Buffer) => chunks.push(chunk));
    archive.on('end', () => resolve(Buffer.concat(chunks)));
    archive.on('error', reject);

    archive.append(boardJson, { name: 'board.json' });
    archive.append(manifestJson, { name: 'manifest.json' });
    imageFiles.forEach((f) => archive.append(f.bytes, { name: f.filename }));

    archive.finalize();
  });
  return {
    id: board.id,
    filename: `${toSafeName(board.name)}.guessio`,
    bytes: buffer,
  };
};

export function toSafeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}
