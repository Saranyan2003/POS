import bcrypt from "bcryptjs";
import crypto from "crypto";
import { cookies } from "next/headers";
import { prisma } from "./db";
import { UserSessionContext } from "./permissions";

const SESSION_COOKIE_NAME = "pos_session_token";
const SESSION_DURATION_DAYS = 7;

/**
 * Hashes a plaintext password using bcrypt with 12 salt rounds
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

/**
 * Compares a plaintext password with a hashed password
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Creates a new secure session token and stores it in the database and HTTP-only cookie
 */
export async function createSession(
  userId: string,
  businessId?: string,
  branchId?: string,
  reqIp?: string,
  userAgent?: string
): Promise<string> {
  const sessionToken = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000);

  await prisma.session.create({
    data: {
      sessionToken,
      userId,
      activeBusinessId: businessId,
      activeBranchId: branchId,
      ipAddress: reqIp,
      userAgent: userAgent,
      expiresAt,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  return sessionToken;
}

/**
 * Retrieves and validates the current active session
 */
export async function getSession(): Promise<UserSessionContext | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!token) return null;

    const session = await prisma.session.findUnique({
      where: { sessionToken: token },
      include: {
        user: {
          include: {
            userBusinesses: {
              include: {
                business: true,
              },
            },
            userBranches: {
              include: {
                branch: true,
              },
            },
          },
        },
      },
    });

    if (!session || session.expiresAt < new Date()) {
      if (session) {
        await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
      }
      return null;
    }

    const user = session.user;
    if (!user.isActive) return null;

    // Determine active business context
    let activeBusinessId = session.activeBusinessId;
    let activeBranchId = session.activeBranchId;
    let businessRole = undefined;
    let businessName = undefined;
    let businessType = undefined;

    if (user.userBusinesses.length > 0) {
      const activeUB = activeBusinessId
        ? user.userBusinesses.find((ub) => ub.businessId === activeBusinessId)
        : user.userBusinesses[0];

      if (activeUB) {
        activeBusinessId = activeUB.businessId;
        businessRole = activeUB.role as any;
        businessName = activeUB.business.name;
        businessType = activeUB.business.businessType;

        // Determine active branch
        if (!activeBranchId) {
          const userBranch = user.userBranches.find((ub) => ub.branch.businessId === activeBusinessId);
          if (userBranch) {
            activeBranchId = userBranch.branchId;
          } else {
            // Find default branch for business
            const defaultBranch = await prisma.branch.findFirst({
              where: { businessId: activeBusinessId, isDefault: true },
            });
            activeBranchId = defaultBranch?.id || null;
          }
        }
      }
    }

    return {
      userId: user.id,
      loginId: user.loginId,
      name: user.name,
      platformRole: user.platformRole as any,
      businessId: activeBusinessId || undefined,
      branchId: activeBranchId || undefined,
      businessRole,
      businessName,
      businessType,
      isTemporaryPassword: user.isTemporaryPassword,
    };
  } catch (error) {
    console.error("Error retrieving session:", error);
    return null;
  }
}

/**
 * Destroys the current session
 */
export async function destroySession(): Promise<void> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (token) {
      await prisma.session.deleteMany({ where: { sessionToken: token } }).catch(() => {});
      cookieStore.delete(SESSION_COOKIE_NAME);
    }
  } catch (error) {
    console.error("Error destroying session:", error);
  }
}

/**
 * Updates active branch context for the session
 */
export async function setActiveBranch(branchId: string): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return false;

    await prisma.session.update({
      where: { sessionToken: token },
      data: { activeBranchId: branchId },
    });
    return true;
  } catch {
    return false;
  }
}
