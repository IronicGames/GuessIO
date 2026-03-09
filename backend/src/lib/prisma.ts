import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { config } from '../utils/constants/env';

const adapter = new PrismaPg({
  connectionString: config.databaseUrl,
});
const prisma = new PrismaClient({
  adapter,
  log: ['error', 'warn'],
});

export default prisma;
