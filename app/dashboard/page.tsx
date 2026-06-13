import Link from "next/link";
import { requireAuth } from "@/lib/auth/auth";
import { ROLE_DASHBOARD } from "@/lib/auth/auth";
import { logout } from "@/app/actions/auth";

export default async function DashboardIndexPage() {
  const user = await requireAuth();

  // Redirect directly to the user's own dashboard
  // (this page shows all roles which is only useful when unauthenticated —
  // now that we have auth, redirect to the correct role dashboard)
  const ownDashboard = ROLE_DASHBOARD[user.roleKey];

  return (
    <main className="min-h-screen bg-[#f7f4ed] px-4 py-8 text-[#1d2520] sm:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <header className="flex items-center justify-between border-b border-[#ded4c3] pb-5">
          <Link href="/" className="flex items-center gap-3" aria-label="Mini ERP home">
            <span className="flex size-10 items-center justify-center rounded-lg bg-[#176b5d] text-sm font-bold text-white">
              ERP
            </span>
            <span className="hidden text-lg font-semibold sm:inline">Mini ERP</span>
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-lg border border-[#cfc3ad] bg-white px-4 py-2 text-sm font-semibold text-[#24332d] transition hover:bg-[#fffaf0]"
            >
              Log out
            </button>
          </form>
        </header>

        <section className="py-10">
          <p className="text-sm font-semibold uppercase text-[#176b5d]">Your workspace</p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight text-[#18231f]">
            Welcome back.
          </h1>
          <p className="mt-4 text-[#53645c]">
            You are signed in as <strong>{user.role}</strong>.
          </p>
          <div className="mt-8">
            <Link
              href={ownDashboard}
              className="inline-flex h-12 items-center justify-center rounded-lg bg-[#176b5d] px-6 text-base font-semibold text-white shadow-sm transition hover:bg-[#12574b]"
            >
              Go to my dashboard →
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

