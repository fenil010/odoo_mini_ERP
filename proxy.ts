/**
 * proxy.ts — Next.js 16 route guard (renamed from middleware.ts)
 *
 * This proxy performs OPTIMISTIC checks using the cookie only (no DB calls)
 * to avoid performance issues on prefetched routes.
 *
 * A second, definitive server-side check happens inside:
 *   - app/dashboard/layout.tsx  (authentication check for all /dashboard/*)
 *   - each role page            (role check via requireRole())
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt, SESSION_COOKIE } from "@/lib/auth/session";
import type { RoleKey } from "@/app/dashboard/role-data";

// Dashboard URL prefix → expected role key
const ROUTE_ROLE_MAP: Array<{ prefix: string; roleKey: RoleKey }> = [
  { prefix: "/dashboard/admin", roleKey: "admin" },
  { prefix: "/dashboard/sales", roleKey: "sales" },
  { prefix: "/dashboard/purchase", roleKey: "purchase" },
  { prefix: "/dashboard/manufacturing", roleKey: "manufacturing" },
  { prefix: "/dashboard/inventory", roleKey: "inventory" },
  { prefix: "/dashboard/owner", roleKey: "owner" },
];

const ROLE_DASHBOARD: Record<RoleKey, string> = {
  admin: "/dashboard/admin",
  sales: "/dashboard/sales",
  purchase: "/dashboard/purchase",
  manufacturing: "/dashboard/manufacturing",
  inventory: "/dashboard/inventory",
  owner: "/dashboard/owner",
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── 1. Only guard /dashboard/* ──────────────────────────────────────────
  if (!pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  // ── 2. Decrypt session from cookie (optimistic — no DB call) ────────────
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = await decrypt(token);

  // ── 3. Unauthenticated → redirect to /login ─────────────────────────────
  if (!session) {
    const loginUrl = new URL("/login", request.nextUrl);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── 4. Check role against the requested route ────────────────────────────
  const routeEntry = ROUTE_ROLE_MAP.find((entry) =>
    pathname.startsWith(entry.prefix)
  );

  if (routeEntry && session.roleKey !== routeEntry.roleKey) {
    // User is authenticated but accessing a dashboard they don't own
    const ownDashboard = new URL(
      ROLE_DASHBOARD[session.roleKey],
      request.nextUrl
    );
    return NextResponse.redirect(ownDashboard);
  }

  // ── 5. Authorised — pass through ────────────────────────────────────────
  return NextResponse.next();
}

// Run proxy ONLY on /dashboard/* routes
export const config = {
  matcher: ["/dashboard/:path*"],
};
