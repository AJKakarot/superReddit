import { PrismaClient } from '@prisma/client';

/**
 * Global Prisma client instance
 * In development, this will be a new instance on each hot reload
 * In production, this will be reused across requests
 */
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma = globalThis.__prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
} 