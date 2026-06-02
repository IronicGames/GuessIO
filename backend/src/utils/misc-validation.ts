import { BadRequestError, InvalidBoardImportError } from '@backend/errors/app-error';
import {
  manifestJsonSchema,
  boardJsonSchema,
} from '@backend/middleware/validation/validation.schemas';
import { type ManifestJson, type BoardJson } from '@shared/types/board.types';
import AdmZip, { type IZipEntry } from 'adm-zip';
import { config } from '@utils/constants/env';
import crypto from 'crypto';

export const MAX_CHARACTERS_PER_BOARD = 200;
export const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024; // 2MB
export enum ImageType {
  DATA_URI,
  REMOTE_URL,
  NONE,
}
// Private IP ranges as literal strings in the URL host — covers the most dangerous
// SSRF vectors (including the AWS EC2 metadata endpoint at 169.254.169.254) without
// requiring a DNS round-trip. DNS-rebinding attacks are out of scope for v1.
export const PRIVATE_HOST_PATTERNS = [
  /^127\./, // loopback
  /^10\./, // private class A
  /^172\.(1[6-9]|2\d|3[01])\./, // private class B
  /^192\.168\./, // private class C
  /^169\.254\./, // link-local — includes AWS metadata endpoint
  /^::1$/, // IPv6 loopback
  /^fc00:/i, // IPv6 unique-local
  /^localhost$/i, // hostname alias for loopback
];

export function validateImageUrl(imageUrl: string | undefined | null): ImageType {
  if (!imageUrl || imageUrl === '') return ImageType.NONE;

  if (imageUrl.startsWith('data:')) {
    const match = imageUrl.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
    if (!match || !match[1].startsWith('image/')) {
      throw new BadRequestError('Image must be a valid image format');
    }
    const estimatedBytes = Math.floor(match[2].length * 0.75);
    if (estimatedBytes > MAX_IMAGE_SIZE_BYTES) {
      throw new BadRequestError('Image must not exceed 2MB');
    }
    return ImageType.DATA_URI;
  }

  let parsed: URL;
  try {
    parsed = new URL(imageUrl);
  } catch {
    throw new BadRequestError('Invalid image URL');
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new BadRequestError('Image URL must use http or https');
  }

  if (PRIVATE_HOST_PATTERNS.some((pattern) => pattern.test(parsed.hostname))) {
    throw new BadRequestError('Invalid image URL');
  }
  return ImageType.REMOTE_URL;
}

// ---- Validation helpers ----

export const parseZip = (fileBuffer: Buffer): AdmZip => {
  try {
    return new AdmZip(fileBuffer);
  } catch {
    throw new InvalidBoardImportError();
  }
};

export const validateUncompressedSize = (entries: IZipEntry[]): void => {
  const uncompressedSize = entries.reduce((total, entry) => total + entry.getData().length, 0);
  if (uncompressedSize > 25 * 1024 * 1024) {
    throw new InvalidBoardImportError();
  }
};

export const validateEntryNames = (entries: IZipEntry[]): void => {
  if (entries.some((entry) => !isValidZipEntry(entry))) {
    throw new InvalidBoardImportError();
  }
};

export const parseAndValidateManifest = (zip: AdmZip): ManifestJson => {
  let manifestJson: ManifestJson;
  try {
    manifestJson = JSON.parse(zip.readAsText('manifest.json'));
  } catch {
    throw new InvalidBoardImportError();
  }
  if (manifestJson.version !== config.export_version) {
    throw new InvalidBoardImportError();
  }
  const parseResult = manifestJsonSchema.safeParse(manifestJson);
  if (!parseResult.success) {
    throw new InvalidBoardImportError();
  }
  return manifestJson;
};

export const validateFileHashes = (zip: AdmZip, manifestJson: ManifestJson): void => {
  for (const [filename, expectedHash] of Object.entries(manifestJson.files)) {
    const entry = zip.getEntry(filename);
    if (!entry) {
      throw new InvalidBoardImportError();
    }
    const data = entry.getData();
    const actualHash = `sha256:${crypto.createHash('sha256').update(data).digest('hex')}`;
    const actual = Buffer.from(actualHash, 'utf8');
    const expected = Buffer.from(expectedHash, 'utf8');
    if (actual.byteLength !== expected.byteLength || !crypto.timingSafeEqual(actual, expected)) {
      throw new InvalidBoardImportError();
    }
  }
};

export const parseAndValidateBoard = (zip: AdmZip): BoardJson => {
  let boardJson: BoardJson;
  try {
    boardJson = JSON.parse(zip.readAsText('board.json'));
  } catch {
    throw new InvalidBoardImportError();
  }
  const parseResult = boardJsonSchema.safeParse(boardJson);
  if (!parseResult.success) {
    throw new InvalidBoardImportError();
  }
  return boardJson;
};

export const validateImageNames = (images: IZipEntry[], boardJson: BoardJson): void => {
  const actualImageNames = images.map((e) => e.entryName);
  const expectedImageNames = [boardJson.image]
    .concat(boardJson.characters.map((char) => char.image))
    .filter((value): value is string => value != null);

  if (
    actualImageNames.length !== expectedImageNames.length ||
    actualImageNames.some((name) => !expectedImageNames.includes(name)) ||
    expectedImageNames.some((name) => !actualImageNames.includes(name))
  ) {
    throw new InvalidBoardImportError();
  }
};

export const validateImageBytes = async (images: IZipEntry[]): Promise<void> => {
  const allValid = await Promise.all(images.map(isValidImage));
  if (!allValid.every(Boolean)) {
    throw new InvalidBoardImportError();
  }
};

const isValidZipEntry = (entry: AdmZip.IZipEntry): boolean => {
  const validNamePattern = /^(board\.json|manifest\.json|images\/[a-zA-Z0-9_-]+\.[a-z0-9]+)$/;
  return validNamePattern.test(entry.entryName) && !entry.isDirectory;
};

const isValidSvg = (bytes: Buffer): boolean => {
  const text = bytes.toString('utf8').trimStart();
  return text.startsWith('<svg') || text.startsWith('<?xml');
};

const isValidImage = async (image: IZipEntry): Promise<boolean> => {
  const imageBytes = image.getData();
  if (imageBytes.length > MAX_IMAGE_SIZE_BYTES) return false;

  const ext = image.entryName.split('.').pop()?.toLowerCase();

  if (ext === 'svg') return isValidSvg(imageBytes);

  // @ts-ignore — file-type is ESM-only; dynamic import works at runtime despite moduleResolution: node
  const { fileTypeFromBuffer } = await import('file-type');
  const type = await fileTypeFromBuffer(imageBytes);
  if (!type || !type.mime.startsWith('image/')) return false;

  // jpeg and jpg are the same format — file-type always returns 'jpg'
  const normalizedExt = ext === 'jpeg' ? 'jpg' : ext;
  return normalizedExt === type.ext;
};

export interface ValidatedBoardImport {
  zip: AdmZip;
  boardJson: BoardJson;
  manifestJson: ManifestJson;
  images: IZipEntry[];
}

export const validateBoardImport = async (fileBuffer: Buffer): Promise<ValidatedBoardImport> => {
  const zip = parseZip(fileBuffer);
  const entries = zip.getEntries();
  validateUncompressedSize(entries);
  validateEntryNames(entries);
  const manifestJson = parseAndValidateManifest(zip);
  validateFileHashes(zip, manifestJson);
  const boardJson = parseAndValidateBoard(zip);
  const images = entries.filter((e) => e.entryName.startsWith('images/'));
  validateImageNames(images, boardJson);
  await validateImageBytes(images);
  return { zip, boardJson, manifestJson, images };
};
