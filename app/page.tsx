import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f7f4ed] text-[#1d2520]">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-5 sm:px-8">
        <Link href="/" className="flex items-center gap-3" aria-label="Mini ERP home">
          <span className="flex size-10 items-center justify-center rounded-lg bg-[#176b5d] text-sm font-bold text-white">
            ERP
          </span>
          <span className="hidden text-lg font-semibold sm:inline">Mini ERP</span>
        </Link>

        <nav className="flex items-center gap-2 text-sm font-medium sm:gap-3">
          <Link
            href="/login"
            className="rounded-lg px-3 py-2 text-[#33443d] transition hover:bg-white/70 sm:px-4"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-[#176b5d] px-3 py-2 text-white shadow-sm transition hover:bg-[#12574b] sm:px-4"
          >
            Sign up
          </Link>
        </nav>
      </header>

      <main>
        <section className="mx-auto grid w-full max-w-7xl gap-12 px-6 pb-16 pt-10 sm:px-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:pb-24 lg:pt-16">
          <div className="max-w-3xl">
            <p className="mb-5 inline-flex rounded-lg border border-[#d8cdb8] bg-white/70 px-3 py-1 text-sm font-medium text-[#176b5d]">
              From demand to delivery
            </p>
            <h1 className="text-4xl font-semibold leading-[1.05] text-[#18231f] sm:text-6xl lg:text-7xl">
              Mini ERP for manufacturing teams.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#53645c]">
              Connect sales, inventory, purchase, manufacturing, procurement,
              and audit logs in one PostgreSQL-backed operating system.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex h-12 items-center justify-center rounded-lg bg-[#176b5d] px-6 text-base font-semibold text-white shadow-sm transition hover:bg-[#12574b]"
              >
                Start now
              </Link>
              <Link
                href="/login"
                className="inline-flex h-12 items-center justify-center rounded-lg border border-[#cfc3ad] bg-white px-6 text-base font-semibold text-[#24332d] transition hover:bg-[#fffaf0]"
              >
                Log in
              </Link>
            </div>
          </div>

          <div className="relative min-h-[420px]">
            <div className="mb-5 flex items-center justify-between border-b border-[#d6cbb8] pb-4">
              <div>
                <p className="text-sm font-semibold text-[#176b5d]">Live flow</p>
                <p className="text-2xl font-semibold text-[#202a25]">SO-1024</p>
              </div>
              <span className="rounded-lg bg-[#ffe1a6] px-3 py-1 text-sm font-semibold text-[#765318]">
                Confirmed
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ["Ordered", "20 dining tables", "#176b5d"],
                ["Available", "5 in stock", "#2f6f9f"],
                ["Shortage", "15 units", "#9a4f16"],
                ["Manufacture", "MO-001 created", "#5f5aa2"],
              ].map(([label, value, color]) => (
                <div key={label} className="rounded-lg border border-[#e3d8c5] bg-white p-4">
                  <div className="mb-4 h-2 w-16 rounded-full" style={{ backgroundColor: color }} />
                  <p className="text-sm font-medium text-[#6a766f]">{label}</p>
                  <p className="mt-1 text-xl font-semibold text-[#202a25]">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-lg border border-[#d6cbb8] bg-[#eef7f3] p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-[#53645c]">Procurement check</p>
                  <p className="mt-1 text-lg font-semibold text-[#1e302a]">
                    Components calculated from BoM
                  </p>
                </div>
                <span className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-[#176b5d]">
                  PO ready
                </span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
                <div className="rounded-lg bg-white px-2 py-3">
                  <p className="font-semibold text-[#202a25]">60</p>
                  <p className="text-[#68756e]">Legs</p>
                </div>
                <div className="rounded-lg bg-white px-2 py-3">
                  <p className="font-semibold text-[#202a25]">15</p>
                  <p className="text-[#68756e]">Tops</p>
                </div>
                <div className="rounded-lg bg-white px-2 py-3">
                  <p className="font-semibold text-[#202a25]">180</p>
                  <p className="text-[#68756e]">Screws</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#ded4c3] bg-[#1d2520] px-6 py-8 text-white sm:px-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[#dce6df]">Mini ERP</p>
          <p className="text-sm text-[#b8c5bd]">
            Products, inventory, sales, purchase, manufacturing, and audit logs.
          </p>
        </div>
      </footer>
    </div>
  );
}
