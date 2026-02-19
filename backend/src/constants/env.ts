import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

export const config = {
  port: 8080,
  databaseUrl: `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}?schema=public`,
  prismaSchemePath: process.env.PRISMA_SCHEME_PATH,
  prismaMigrationsPath: process.env.PRISMA_MIGRATIONS_PATH,
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  googleRedirectUri: process.env.GOOGLE_REDIRECT_URI,
  jwtSecret: process.env.JWT_SECRET,
  frontendUrl: process.env.FRONTEND_URL,
};
