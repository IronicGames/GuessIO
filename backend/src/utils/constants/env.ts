import dotenv from 'dotenv';

dotenv.config({ path: '../.env', quiet: true });

export const config = {
  // app_version: process.env.APP_VERSION ?? '1.0.0-dev',
  export_version: 1,
  deployment: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT),
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:3000',
  backendUrl: process.env.BACKEND_URL ?? 'http://localhost:8080',
  databaseUrl: `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}?schema=public`,
  prismaSchemePath: 'prisma/schema.prisma',
  prismaMigrationsPath: 'prisma/migrations',
  googleClientId: `${process.env.GOOGLE_CLIENT_ID}`,
  googleClientSecret: `${process.env.GOOGLE_CLIENT_SECRET}`,
  googleRedirectUri: `${process.env.GOOGLE_REDIRECT_URI}`,
  jwtSecret: `${process.env.JWT_SECRET}`,
};
