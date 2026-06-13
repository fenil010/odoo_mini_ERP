import "server-only";

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { RoleKey } from "@/app/dashboard/role-data";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SessionPayload = {
  userId: number;
  role: string;   // DB role value e.g. "ADMIN", "SALES"
  roleKey: RoleKey; // URL key e.g. "admin", "sales"
  expiresAt: Date;
};

// ---------------------------------------------------------------------------
// Secret key
// ---------------------------------------------------------------------------

const rawSecret = process.env.SESSION_SECRET;

if (!rawSecret) {
  throw new Error("SESSION_SECRET environment variable is not set.");
}

const encodedKey = new TextEncoder().encode(rawSecret);

// ---------------------------------------------------------------------------
// Cookie name
// ---------------------------------------------------------------------------

export const SESSION_COOKIE = "mini_erp_session";

// ---------------------------------------------------------------------------
// Encrypt / Decrypt
// ---------------------------------------------------------------------------

export async function encrypt(payload: SessionPayload): Promise<string> {
  return new SignJWT({
    userId: payload.userId,
    role: payload.role,
    roleKey: payload.roleKey,
    expiresAt: payload.expiresAt.toISOString(),
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);
}

export async function decrypt(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, encodedKey, {
      algorithms: ["HS256"],
    });

    return {
      userId: payload.userId as number,
      role: payload.role as string,
      roleKey: payload.roleKey as RoleKey,
      expiresAt: new Date(payload.expiresAt as string),
    };
  } catch {
    // Token is invalid or expired
    return null;
  }
}

// ---------------------------------------------------------------------------
// Cookie helpers
// ---------------------------------------------------------------------------

export async function createSession(
  userId: number,
  role: string,
  roleKey: RoleKey
): Promise<void> {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const token = await encrypt({ userId, role, roleKey, expiresAt });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
