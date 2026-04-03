import { NotFoundError, BadRequestError } from '../errors/app-error';
import { type CreateCharacterDto, type UpdateCharacterDto } from '@shared/types/character.types';
import * as characterRepository from '../repositories/character.repository';

const MAX_CHARACTERS_PER_BOARD = 200;
const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024; // 2MB

// Private IP ranges as literal strings in the URL host — covers the most dangerous
// SSRF vectors (including the AWS EC2 metadata endpoint at 169.254.169.254) without
// requiring a DNS round-trip. DNS-rebinding attacks are out of scope for v1.
const PRIVATE_HOST_PATTERNS = [
  /^127\./,                            // loopback
  /^10\./,                             // private class A
  /^172\.(1[6-9]|2\d|3[01])\./,       // private class B
  /^192\.168\./,                       // private class C
  /^169\.254\./,                       // link-local — includes AWS metadata endpoint
  /^::1$/,                             // IPv6 loopback
  /^fc00:/i,                           // IPv6 unique-local
  /^localhost$/i,                      // hostname alias for loopback
];

function validateImageUrl(imageUrl: string | undefined | null): void {
  if (!imageUrl || imageUrl === '') return;

  if (imageUrl.startsWith('data:')) {
    const match = imageUrl.match(/^data:(image\/(?:jpeg|png|gif|webp));base64,(.+)$/);
    if (!match) {
      throw new BadRequestError('Image must be a valid JPEG, PNG, GIF, or WebP');
    }
    // base64 encodes 3 bytes as 4 chars, so decoded size ≈ length * 0.75
    const estimatedBytes = Math.floor(match[2].length * 0.75);
    if (estimatedBytes > MAX_IMAGE_SIZE_BYTES) {
      throw new BadRequestError('Image must not exceed 2MB');
    }
    return;
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
}

export async function createCharacter(
  boardId: string,
  dto: CreateCharacterDto,
): Promise<{ characterId: string; boardId: string }> {
  validateImageUrl(dto.imageUrl);

  const count = await characterRepository.getCharacterCountForBoard(boardId);
  if (count >= MAX_CHARACTERS_PER_BOARD) {
    throw new BadRequestError(
      `A board cannot have more than ${MAX_CHARACTERS_PER_BOARD} characters`,
    );
  }

  if (dto.characterId) {
    return characterRepository.addCharacterToBoard(dto.characterId, boardId);
  }

  const characterId = await characterRepository.createCharacter(boardId, dto);
  return { characterId, boardId };
}

export async function updateCharacter(
  characterId: string,
  dto: UpdateCharacterDto,
): Promise<{ characterId: string }> {
  validateImageUrl(dto.imageUrl);

  const character = await characterRepository.getCharacter(characterId);
  if (!character) {
    throw new NotFoundError('Character not found');
  }

  const updatedCharacterId = await characterRepository.updateCharacter(characterId, dto);
  return { characterId: updatedCharacterId };
}

export async function deleteCharacter(
  characterId: string,
  boardId: string,
): Promise<{ characterId: string; boardId: string }> {
  const character = await characterRepository.getCharacter(characterId);
  if (!character) {
    throw new NotFoundError('Character not found');
  }

  if (character.boards.length === 1) {
    const deletedCharacterId = await characterRepository.deleteCharacter(characterId);
    return { characterId: deletedCharacterId, boardId };
  }

  return characterRepository.removeCharacterFromBoard(characterId, boardId);
}

export async function getCharacter(characterId: string): Promise<characterRepository.Character> {
  const character = await characterRepository.getCharacter(characterId);
  if (!character) {
    throw new NotFoundError('Character not found');
  }

  return character;
}
