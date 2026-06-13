import { requireAuth } from "@/lib/auth/auth";

/**
 * Dashboard layout — server-side auth guard.
 *
 * Every /dashboard/* route renders through this layout.
 * requireAuth() decrypts the JWT cookie on the server and redirects
 * to /login before any child component renders if the user is not
 * authenticated. This is the second line of defence after proxy.ts.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Throws redirect('/login') if the session is missing or invalid.
  await requireAuth();

  return <>{children}</>;
}
