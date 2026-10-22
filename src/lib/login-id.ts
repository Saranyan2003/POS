import crypto from "crypto";
import { prisma } from "./db";

/**
 * Generates a collision-resistant 5-digit alphanumeric code (e.g. 48291, 73184)
 */
function generateRandomCode(length: number = 5): string {
  // Use digits and uppercase characters excluding ambiguous chars (0, O, 1, I)
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  let result = "";
  const randomBytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    result += chars[randomBytes[i] % chars.length];
  }
  return result;
}

/**
 * Generates a globally unique Login ID for a Business Owner (Format: T2G-XXXXX)
 */
export async function generateOwnerLoginId(): Promise<string> {
  let attempts = 0;
  const maxAttempts = 15;

  while (attempts < maxAttempts) {
    const code = generateRandomCode(5);
    const loginId = `T2G-${code}`;

    const existingUser = await prisma.user.findUnique({
      where: { loginId },
      select: { id: true },
    });

    if (!existingUser) {
      return loginId;
    }
    attempts++;
  }

  // Fallback if collision
  return `T2G-${Date.now().toString().slice(-6)}`;
}

/**
 * Generates a globally unique Login ID for an Employee/Staff (Format: EMP-XXXXX)
 */
export async function generateEmployeeLoginId(): Promise<string> {
  let attempts = 0;
  const maxAttempts = 15;

  while (attempts < maxAttempts) {
    const code = generateRandomCode(5);
    const loginId = `EMP-${code}`;

    const existingUser = await prisma.user.findUnique({
      where: { loginId },
      select: { id: true },
    });

    if (!existingUser) {
      return loginId;
    }
    attempts++;
  }

  return `EMP-${Date.now().toString().slice(-6)}`;
}

/**
 * Generates a high-entropy temporary password (e.g. 8-10 chars with letters and numbers)
 */
export function generateTemporaryPassword(length: number = 8): string {
  const chars = "23456789abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ@#$!";
  let password = "";
  const randomBytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    password += chars[randomBytes[i] % chars.length];
  }
  return password;
}
