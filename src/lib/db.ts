import { PrismaClient } from '@prisma/client';

console.log("Checking for DATABASE_URL:", process.env.DATABASE_URL);

// This prevents multiple instances of Prisma Client in development
declare const global: {
  prisma?: PrismaClient
}

const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV === 'development') {
  global.prisma = prisma;
}

export default prisma;
