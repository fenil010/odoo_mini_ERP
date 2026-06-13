import Link from "next/link";
import { notFound } from "next/navigation";
import { roleDashboards, roleOrder, type RoleKey } from "../role-data";

type RolePageProps = {
  params: Promise<{
    role: string;
  }>;
};

export function generateStaticParams() {
  return roleOrder.map((role) => ({ role }));
}

export default async function RoleDashboardPage({ params }: RolePageProps) {
  const { role } = await params;

  if (!isRoleKey(role)) {
    notFound();
  }

  const dashboard = roleDashboards[role];

  return (
    <main className="min-h-screen bg-[#f7f4ed] text-[#1d2520]">
      <div className="mx-auto grid min-h-screen w-full max-w-7xl gap-0 lg:grid-cols-[260px_1fr]">
        <aside className="border-b border-[#ded4c3] px-4 py-5 sm:px-8 lg:border-b-0 lg:border-r lg:px-5">
          <div className="flex items-center justify-between gap-4 lg:block">
            <Link href="/" className="flex items-center gap-3" aria-label="Mini ERP home">
              <span className="flex size-10 items-center justify-center rounded-lg bg-[#176b5d] text-sm font-bold text-white">
                ERP
              </span>
              <span className="hidden text-lg font-semibold sm:inline">Mini ERP</span>
            </Link>
            <Link
              href="/login"
              className="rounded-lg border border-[#cfc3ad] bg-white px-4 py-2 text-sm font-semibold text-[#24332d] transition hover:bg-[#fffaf0] lg:mt-8 lg:inline-flex"
            >
              Log out
            </Link>
          </div>

          <nav className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-1">
            {roleOrder.map((roleKey) => {
              const item = roleDashboards[roleKey];
              const active = roleKey === dashboard.key;

              return (
                <Link
                  key={item.key}
                  href={`/dashboard/${item.key}`}
                  className={[
                    "rounded-lg px-3 py-3 text-sm font-semibold transition",
                    active
                      ? "bg-[#176b5d] text-white"
                      : "text-[#405049] hover:bg-white/80",
                  ].join(" ")}
                >
                  {item.title}
                </Link>
              );
            })}
          </nav>
        </aside>

        <section className="px-4 py-6 sm:px-8 lg:px-10">
          <header className="border-b border-[#ded4c3] pb-6">
            <p className="text-sm font-semibold uppercase text-[#176b5d]">{dashboard.dbRole}</p>
            <div className="mt-3 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <h1 className="text-4xl font-semibold leading-tight text-[#18231f]">
                  {dashboard.title} Dashboard
                </h1>
                <p className="mt-3 max-w-3xl text-base leading-7 text-[#53645c]">
                  {dashboard.focus}
                </p>
              </div>
              <div className="rounded-lg border border-[#d9cfbd] bg-white px-4 py-3">
                <p className="text-xs font-semibold uppercase text-[#68756e]">Responsibility</p>
                <p className="mt-1 max-w-md text-sm font-semibold text-[#25332d]">
                  {dashboard.responsibility}
                </p>
              </div>
            </div>
          </header>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {dashboard.metrics.map((metric) => (
              <div key={metric.label} className="rounded-lg border border-[#d9cfbd] bg-white p-5">
                <p className="text-sm font-medium text-[#68756e]">{metric.label}</p>
                <p className="mt-3 text-3xl font-semibold text-[#202a25]">{metric.value}</p>
                <p className="mt-2 text-sm text-[#53645c]">{metric.detail}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">
            <section className="rounded-lg border border-[#d9cfbd] bg-[#fbfaf6] p-5">
              <div className="flex items-center justify-between gap-4 border-b border-[#e5dccb] pb-4">
                <div>
                  <h2 className="text-xl font-semibold text-[#202a25]">Primary work</h2>
                  <p className="mt-1 text-sm text-[#68756e]">Role-specific actions</p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                {dashboard.actions.map((action) => (
                  <Link
                    key={action.title}
                    href={action.href}
                    className="rounded-lg border border-[#e3d8c5] bg-white p-4 transition hover:border-[#176b5d]"
                  >
                    <h3 className="text-base font-semibold text-[#202a25]">{action.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-[#53645c]">{action.description}</p>
                  </Link>
                ))}
              </div>
            </section>

            <section className="rounded-lg border border-[#d9cfbd] bg-white p-5">
              <h2 className="text-xl font-semibold text-[#202a25]">Visible modules</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {dashboard.modules.map((module) => (
                  <span
                    key={module}
                    className="rounded-lg border border-[#d8cdb8] bg-[#f7f4ed] px-3 py-2 text-sm font-semibold text-[#405049]"
                  >
                    {module}
                  </span>
                ))}
              </div>
            </section>
          </div>

          <section className="mt-6 rounded-lg border border-[#d9cfbd] bg-white">
            <div className="grid grid-cols-[1.1fr_0.8fr_0.7fr] border-b border-[#e5dccb] px-4 py-3 text-xs font-semibold uppercase text-[#68756e]">
              <span>Work item</span>
              <span>Status</span>
              <span>Owner</span>
            </div>
            {dashboard.queue.map((item) => (
              <div
                key={item.item}
                className="grid grid-cols-[1.1fr_0.8fr_0.7fr] gap-3 border-b border-[#efe7d8] px-4 py-4 text-sm last:border-b-0"
              >
                <span className="font-semibold text-[#202a25]">{item.item}</span>
                <span className="text-[#53645c]">{item.status}</span>
                <span className="text-[#53645c]">{item.owner}</span>
              </div>
            ))}
          </section>
        </section>
      </div>
    </main>
  );
}

function isRoleKey(role: string): role is RoleKey {
  return role in roleDashboards;
}
