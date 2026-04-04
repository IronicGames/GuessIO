import { BadRequestError } from '@backend/errors/app-error';

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
    const match = imageUrl.match(/^data:(image\/(?:jpeg|png|gif|webp));base64,(.+)$/);
    if (!match) {
      throw new BadRequestError('Image must be a valid JPEG, PNG, GIF, or WebP');
    }
    // base64 encodes 3 bytes as 4 chars, so decoded size ≈ length * 0.75
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
