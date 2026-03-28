import { Request, Response, NextFunction } from 'express';
import { z, ZodType } from 'zod';

type RequestPart = 'body' | 'params' | 'query';

export function validate(schema: ZodType, part: RequestPart = 'body') {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[part]);
    if (!result.success) {
      res.status(400).json({
        error: 'Validation failed',
        issues: z.treeifyError(result.error),
      });
      return;
    }
    req[part] = result.data;
    next();
  };
}
