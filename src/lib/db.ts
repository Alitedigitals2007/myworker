"use strict";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export default prisma;

if (process.env.NODE_ENV === "development") {
  const globalWithPrisma = globalThis as typeof globalThis & {
    prisma?: PrismaClient;
  };
  globalWithPrisma.prisma = globalWithPrisma.prisma ?? prisma;
}