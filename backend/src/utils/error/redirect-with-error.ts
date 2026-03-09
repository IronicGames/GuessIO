import { Response } from 'express';
import { config } from '../constants/env.js';

export function redirectToFrontendWithError(
  res: Response,
  errorCode: string,
  fallbackPath: string = '/'
) {
  const url = `${config.frontendUrl}${fallbackPath}?error=${encodeURIComponent(errorCode)}`;
  res.redirect(url);
}
