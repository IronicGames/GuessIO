import { type Request, type Response, type NextFunction } from 'express';
import { type ZodType } from 'zod';

type RequestPart = 'body' | 'params' | 'query';

export function validate(schema: ZodType, part: RequestPart = 'body') {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[part]);
    if (!result.success) {
      const formattedErrors = result.error.issues.map((issue) => ({
        path: issue.path.length > 0 ? issue.path.join('.') : 'root',
        message: issue.message,
        code: issue.code,
      }));

      // Use the first issue's message as the top-level error so getErrorMessage()
      // on the frontend returns something actionable instead of "Validation failed".
      const errorMessage = result.error.issues[0]?.message ?? 'Validation failed';

      res.status(400).json({
        error: errorMessage,
        issues: formattedErrors,
      });
      return;
    }
    req[part] = result.data;
    next();
  };
}
