import rateLimit from 'express-rate-limit';

export const importRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  keyGenerator: (req) => req.user.id,
});
