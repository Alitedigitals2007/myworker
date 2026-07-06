"use strict";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export default prisma;

// Hot reloading support
if (process.env.NODE_ENV === 'development') {
  globalThis.prisma = globalThis.prisma || prisma;
} else {
  globalThis.prisma = prisma;
}