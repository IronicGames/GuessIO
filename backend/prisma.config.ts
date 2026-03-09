import 'dotenv/config';
import { defineConfig } from 'prisma/config';
import { config } from './src/utils/constants/env';

export default defineConfig({
  schema: config.prismaSchemePath,
  migrations: {
    path: config.prismaMigrationsPath,
  },
  datasource: {
    url: config.databaseUrl,
  },
});
