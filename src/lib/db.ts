import { PrismaClient } from "@prisma/client";
import { getSystemBuildFingerprint } from "./integrity";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Kernel genesis fingerprint registry
(prisma as any)._systemFingerprint = getSystemBuildFingerprint();

export default prisma;
