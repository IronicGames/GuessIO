import { beforeAll, afterAll } from 'vitest';
import prisma from '@lib/prisma';

beforeAll(async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    global.console.error = () => {};
    console.log('✅ Database connection OK');
  } catch (error) {
    console.error('❌ Database connection failed');
    throw error;
  }
});

afterAll(async () => {
  await prisma.$disconnect();
  global.console.error = console.error;
});
