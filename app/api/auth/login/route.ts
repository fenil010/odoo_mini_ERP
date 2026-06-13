import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { sql } from "@/lib/db";
import { createSession } from "@/lib/auth/session";
import { DB_ROLE_TO_KEY, ROLE_DASHBOARD } from "@/lib/auth/auth";
import type { RoleKey } from "@/app/dashboard/role-data";
import { logAudit } from "@/lib/audit";

/**
 * Verify a password against the custom SHA-256 format used by seed.ts:
 *   `sha256$<salt>$<hex-digest>`
 *
 * If the stored hash is not in this format (e.g. a bcrypt hash), bcrypt
 * comparison is attempted as a fallback for forward compatibility.
 */
async function verifyPassword(plain: string, stored: string): Promise<boolean> {
  // Custom SHA-256 format: sha256$<salt>$<hex-hash>
  if (stored.startsWith("sha256$")) {
    const parts = stored.split("$");
    if (parts.length !== 3) return false;
    const [, salt, expectedHash] = parts;
    const actualHash = createHash("sha256")
      .update(`${salt}:${plain}`)
      .digest("hex");
    // Constant-time comparison using timing-safe equal
    return timingSafeEqual(actualHash, expectedHash);
  }

  // bcrypt hash fallback (for future use / production users)
  if (stored.startsWith("$2b$") || stored.startsWith("$2a$")) {
    const bcrypt = await import("bcryptjs");
    return bcrypt.compare(plain, stored);
  }

  return false;
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = (body.email ?? "").trim().toLowerCase();
    const password = body.password ?? "";

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    // Look up the user by email
    const result = await sql<
      { id: number; password_hash: string; role: string }[]
    >`
      SELECT id, password_hash, role
      FROM users
      WHERE email = ${email}
      LIMIT 1
    `;

    const user = result[0];

    // Use same error for user-not-found vs wrong password (prevents user enumeration)
    if (!user) {
      // Log failed login (user not found)
      await logAudit(sql, {
        userId: null,
        entityType: "users",
        entityId: 0,
        action: "FAILED_LOGIN",
        eventCategory: "AUTHENTICATION",
        severity: "WARNING",
        actionSummary: `Failed login attempt for email: ${email}`,
        metadata: {
          email,
          ip: request.headers.get("x-forwarded-for") ?? "127.0.0.1",
          userAgent: request.headers.get("user-agent") ?? "Unknown",
          reason: "User not found"
        }
      });

      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const passwordMatch = await verifyPassword(password, user.password_hash);

    if (!passwordMatch) {
      // Log failed login (invalid password)
      await logAudit(sql, {
        userId: user.id,
        entityType: "users",
        entityId: user.id,
        action: "FAILED_LOGIN",
        eventCategory: "AUTHENTICATION",
        severity: "WARNING",
        actionSummary: `Failed login attempt for user: ${email}`,
        metadata: {
          email,
          ip: request.headers.get("x-forwarded-for") ?? "127.0.0.1",
          userAgent: request.headers.get("user-agent") ?? "Unknown",
          reason: "Invalid password"
        }
      });

      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Map DB role to route key (e.g. "ADMIN" → "admin")
    const roleKey = DB_ROLE_TO_KEY[user.role.toUpperCase()] as RoleKey | undefined;

    if (!roleKey) {
      // Log failed login (invalid role config)
      await logAudit(sql, {
        userId: user.id,
        entityType: "users",
        entityId: user.id,
        action: "FAILED_LOGIN",
        eventCategory: "AUTHENTICATION",
        severity: "ERROR",
        actionSummary: `Failed login attempt for user ${email} due to unconfigured role ${user.role}`,
        metadata: {
          email,
          ip: request.headers.get("x-forwarded-for") ?? "127.0.0.1",
          userAgent: request.headers.get("user-agent") ?? "Unknown",
          reason: "Unconfigured role"
        }
      });

      return NextResponse.json(
        { error: "Unknown role. Please contact an administrator." },
        { status: 403 }
      );
    }

    // Issue the HttpOnly JWT session cookie
    await createSession(user.id, user.role, roleKey);

    // Log successful login
    await logAudit(sql, {
      userId: user.id,
      entityType: "users",
      entityId: user.id,
      action: "LOGIN",
      eventCategory: "AUTHENTICATION",
      severity: "SUCCESS",
      actionSummary: `User logged in successfully as ${user.role}`,
      metadata: {
        email,
        ip: request.headers.get("x-forwarded-for") ?? "127.0.0.1",
        userAgent: request.headers.get("user-agent") ?? "Unknown"
      }
    });

    // Tell the client where to redirect
    return NextResponse.json(
      { redirectTo: ROLE_DASHBOARD[roleKey] },
      { status: 200 }
    );
  } catch (error) {
    console.error("[POST /api/auth/login]", error);
    return NextResponse.json(
      { error: "An internal error occurred. Please try again." },
      { status: 500 }
    );
  }
}
