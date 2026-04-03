import { z, type ZodType } from 'zod';

// ============================================================================
// COMMON/REUSABLE SCHEMAS
// ============================================================================

export const idSchema = z.uuid('Invalid ID format');

export const stringFieldSchema = (fieldName: string, options?: { min?: number; max?: number }) => {
  let schema = z.string(fieldName).trim().min(1, `${fieldName} cannot be empty`);
  if (options?.min) {
    schema = schema.min(options.min, `${fieldName} must be at least ${options.min} characters`);
  }
  if (options?.max) {
    schema = schema.max(options.max, `${fieldName} must not exceed ${options.max} characters`);
  }
  return schema as ZodType;
};

export const urlSchema = z.url('Invalid URL format').optional().or(z.literal(''));

export const tagsSchema = z
  .array(
    z
      .string()
      .trim()
      .min(1)
      .max(50, 'Tags must not exceed 50 characters'),
  )
  .max(30, 'A character cannot have more than 30 tags')
  .optional()
  .default([]);

// ============================================================================
// ROUTE PARAMETER SCHEMAS
// ============================================================================

export const boardIdParamSchema = z.object({
  boardId: idSchema,
});

export const characterIdParamSchema = z.object({
  boardId: idSchema,
  characterId: idSchema,
});

export const characterIdOnlyParamSchema = z.object({
  characterId: idSchema,
});

// ============================================================================
// BOARD VALIDATION SCHEMAS
// ============================================================================

export const createBoardSchema = z.object({
  name: stringFieldSchema('Board name is required', { min: 1, max: 100 }),
  description: z.string().max(500, 'Description must not exceed 500 characters').optional(),
  isPublic: z.boolean().optional().default(false),
  imageUrl: urlSchema,
});

export const updateBoardSchema = createBoardSchema;

// ============================================================================
// CHARACTER VALIDATION SCHEMAS
// ============================================================================

export const createCharacterSchema = z
  .object({
    characterId: idSchema.optional(),
    name: stringFieldSchema('Character name is required', { min: 1, max: 100 }).optional(),
    imageUrl: urlSchema,
    tags: tagsSchema,
  })
  .refine((data) => data.characterId || data.name, {
    message: 'Character name is required',
    path: ['name'],
  });

export const updateCharacterSchema = z.object({
  name: stringFieldSchema('Character name is required', { min: 1, max: 100 }),
  imageUrl: urlSchema,
  tags: tagsSchema,
});

// ============================================================================
// AUTH VALIDATION SCHEMAS
// ============================================================================

export const googleCallbackQuerySchema = z.object({
  code: z.string().min(1, 'Authorization code is required').optional(),
  error: z.string().optional(),
});

export const guestLoginSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(20, 'Name must not exceed 20 characters')
    .optional(),
});

export const nameUpdateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(20, 'Name must not exceed 20 characters'),
});
