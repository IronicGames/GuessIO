import dotenv from 'dotenv';

dotenv.config({ path: '../.env', quiet: true });

export const config = {
  port: 8080,
  databaseUrl: `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}?schema=public`,
  prismaSchemePath: 'prisma/schema.prisma',
  prismaMigrationsPath: 'prisma/migrations',
};
