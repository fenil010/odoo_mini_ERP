import Link from "next/link";
import { getAllRolesFromDB } from "@/lib/role-queries";

export default async function DashboardIndexPage() {
  const roles = await getAllRolesFromDB();

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
          <Link
            href="/login"
            className="rounded-lg border border-[#cfc3ad] bg-white px-4 py-2 text-sm font-semibold text-[#24332d] transition hover:bg-[#fffaf0]"
          >
            Log out
          </Link>
        </header>

        <section className="py-10">
          <p className="text-sm font-semibold uppercase text-[#176b5d]">Role dashboards</p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight text-[#18231f]">
            Select a workspace.
          </h1>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {roles.map((role) => {
              return (
                <Link
                  key={role.key}
                  href={`/dashboard/${role.key}`}
                  className="rounded-lg border border-[#d9cfbd] bg-white p-5 shadow-sm transition hover:border-[#176b5d]"
                >
                  <p className="text-xs font-semibold uppercase text-[#176b5d]">{role.dbRole}</p>
                  <h2 className="mt-3 text-xl font-semibold text-[#202a25]">{role.title}</h2>
                  <p className="mt-3 text-sm leading-6 text-[#53645c]">{role.responsibility}</p>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
