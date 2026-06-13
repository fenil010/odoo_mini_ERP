import Link from "next/link";
import LoginForm from "./login-form";

export default function LoginPage() {
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
            href="/signup"
            className="rounded-lg bg-[#176b5d] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#12574b]"
          >
            Sign up
          </Link>
        </header>

        <section className="grid flex-1 gap-10 py-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <div className="max-w-xl">
            <p className="mb-5 inline-flex rounded-lg border border-[#d8cdb8] bg-white/70 px-3 py-1 text-sm font-medium text-[#176b5d]">
              Welcome back
            </p>
            <h1 className="text-4xl font-semibold leading-[1.05] text-[#18231f] sm:text-5xl">
              Log in to manage your ERP workspace.
            </h1>
            <p className="mt-5 text-lg leading-8 text-[#53645c]">
              Access sales orders, manufacturing status, purchase planning, and
              inventory movement from one place.
            </p>
          </div>

          <div className="w-full rounded-lg border border-[#d9cfbd] bg-[#fbfaf6] p-6 shadow-xl shadow-[#8a7d681f] sm:p-8">
            <LoginForm />

            <p className="mt-6 text-center text-sm text-[#53645c]">
              New to Mini ERP?{" "}
              <Link href="/signup" className="font-semibold text-[#176b5d]">
                Create an account
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
