import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { config } from '../constants/env';

const adapter = new PrismaPg({
  connectionString: config.databaseUrl,
});
const prisma = new PrismaClient({
  adapter,
  log: ['query', 'error', 'warn'],
});

export default prisma;
