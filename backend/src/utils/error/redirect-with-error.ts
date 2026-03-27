import { type Response } from 'express';
import { config } from '@utils/constants/env';

export function redirectToFrontendWithError(
  res: Response,
  errorCode: string,
  fallbackPath: string = '/',
) {
  const url = `${config.frontendUrl}${fallbackPath}?error=${encodeURIComponent(errorCode)}`;
  res.redirect(url);
}
