import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { decrypt, SESSION_COOKIE, type SessionPayload } from "./session";
import type { RoleKey } from "@/app/dashboard/role-data";

// ---------------------------------------------------------------------------
// Role → dashboard URL mapping
// ---------------------------------------------------------------------------

export const ROLE_DASHBOARD: Record<RoleKey, string> = {
  admin: "/dashboard/admin",
  sales: "/dashboard/sales",
  purchase: "/dashboard/purchase",
  manufacturing: "/dashboard/manufacturing",
  inventory: "/dashboard/inventory",
  owner: "/dashboard/owner",
};

// DB role string → RoleKey mapping (used when verifying cookies)
const DB_ROLE_TO_KEY: Record<string, RoleKey> = {
  ADMIN: "admin",
  SALES: "sales",
  PURCHASE: "purchase",
  MANUFACTURING: "manufacturing",
  INVENTORY: "inventory",
  OWNER: "owner",
};

export { DB_ROLE_TO_KEY };

// ---------------------------------------------------------------------------
// getCurrentUser — reads and decrypts the session cookie
// Returns null if missing, invalid, or expired
// ---------------------------------------------------------------------------

export async function getCurrentUser(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  return decrypt(token);
}

// ---------------------------------------------------------------------------
// requireAuth — redirect to /login if not authenticated
// Returns the session payload when authenticated
// ---------------------------------------------------------------------------

export async function requireAuth(): Promise<SessionPayload> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

// ---------------------------------------------------------------------------
// requireRole — check the user has the expected role
// • Unauthenticated → redirect to /login
// • Wrong role     → redirect to the user's own dashboard
// Returns the session payload when the role matches
// ---------------------------------------------------------------------------

export async function requireRole(allowedRoleKey: RoleKey): Promise<SessionPayload> {
  const user = await requireAuth();

  // ADMIN has superuser access — bypass all role-specific guards
  if (user.roleKey === "admin") {
    return user;
  }

  if (user.roleKey !== allowedRoleKey) {
    // Redirect the user to their own dashboard instead of showing 403
    redirect(ROLE_DASHBOARD[user.roleKey]);
  }

  return user;
}
