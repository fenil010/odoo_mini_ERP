import Link from "next/link";

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-[#f7f4ed] px-4 py-8 text-[#1d2520] sm:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl flex-col">
        <header className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3" aria-label="Mini ERP home">
            <span className="flex size-10 items-center justify-center rounded-lg bg-[#176b5d] text-sm font-bold text-white">
              ERP
            </span>
            <span className="hidden text-lg font-semibold sm:inline">Mini ERP</span>
          </Link>
          <Link
            href="/login"
            className="rounded-lg px-4 py-2 text-sm font-semibold text-[#33443d] transition hover:bg-white/70"
          >
            Log in
          </Link>
        </header>

        <section className="grid flex-1 gap-10 py-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <div className="max-w-xl">
            <p className="mb-5 inline-flex rounded-lg border border-[#d8cdb8] bg-white/70 px-3 py-1 text-sm font-medium text-[#176b5d]">
              Create workspace access
            </p>
            <h1 className="text-4xl font-semibold leading-[1.05] text-[#18231f] sm:text-5xl">
              Sign up for Mini ERP.
            </h1>
            <p className="mt-5 text-lg leading-8 text-[#53645c]">
              Add the first business user and prepare role-based access for
              sales, purchase, manufacturing, inventory, and ownership teams.
            </p>
          </div>

          <div className="w-full rounded-lg border border-[#d9cfbd] bg-[#fbfaf6] p-6 shadow-xl shadow-[#8a7d681f] sm:p-8">
            <form className="grid gap-5">
              <div>
                <label htmlFor="name" className="text-sm font-semibold text-[#2b3933]">
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  className="mt-2 h-12 w-full rounded-lg border border-[#cfc3ad] bg-white px-4 text-base outline-none transition focus:border-[#176b5d] focus:ring-2 focus:ring-[#176b5d]/20"
                  placeholder="Full name"
                />
              </div>

              <div>
                <label htmlFor="email" className="text-sm font-semibold text-[#2b3933]">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="mt-2 h-12 w-full rounded-lg border border-[#cfc3ad] bg-white px-4 text-base outline-none transition focus:border-[#176b5d] focus:ring-2 focus:ring-[#176b5d]/20"
                  placeholder="you@company.com"
                />
              </div>

              <div>
                <label htmlFor="role" className="text-sm font-semibold text-[#2b3933]">
                  Role
                </label>
                <select
                  id="role"
                  name="role"
                  className="mt-2 h-12 w-full rounded-lg border border-[#cfc3ad] bg-white px-4 text-base outline-none transition focus:border-[#176b5d] focus:ring-2 focus:ring-[#176b5d]/20"
                  defaultValue="ADMIN"
                >
                  <option value="ADMIN">Admin</option>
                  <option value="SALES">Sales User</option>
                  <option value="PURCHASE">Purchase User</option>
                  <option value="MANUFACTURING">Manufacturing User</option>
                  <option value="INVENTORY">Inventory Manager</option>
                  <option value="OWNER">Business Owner</option>
                </select>
              </div>

              <div>
                <label htmlFor="password" className="text-sm font-semibold text-[#2b3933]">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="mt-2 h-12 w-full rounded-lg border border-[#cfc3ad] bg-white px-4 text-base outline-none transition focus:border-[#176b5d] focus:ring-2 focus:ring-[#176b5d]/20"
                  placeholder="Create a password"
                />
              </div>

              <button
                type="button"
                className="mt-2 h-12 rounded-lg bg-[#176b5d] px-5 text-base font-semibold text-white shadow-sm transition hover:bg-[#12574b]"
              >
                Sign up
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-[#53645c]">
              Already have access?{" "}
              <Link href="/login" className="font-semibold text-[#176b5d]">
                Log in
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
