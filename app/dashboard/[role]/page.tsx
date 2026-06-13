import {
  Activity,
  BarChart3,
  Boxes,
  ClipboardList,
  Factory,
  FileClock,
  Home,
  Layers3,
  LogOut,
  PackageCheck,
  PackagePlus,
  ReceiptText,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Truck,
  Users,
  Warehouse,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cn } from "@/lib/utils";
import { roleDashboards, roleOrder, type RoleKey, type SidebarIcon } from "../role-data";

type RolePageProps = {
  params: Promise<{
    role: string;
  }>;
};

const iconMap: Record<SidebarIcon, LucideIcon> = {
  activity: Activity,
  barChart: BarChart3,
  boxes: Boxes,
  clipboard: ClipboardList,
  factory: Factory,
  fileClock: FileClock,
  home: Home,
  layers: Layers3,
  packageCheck: PackageCheck,
  packagePlus: PackagePlus,
  receipt: ReceiptText,
  settings: Settings,
  shield: ShieldCheck,
  shoppingCart: ShoppingCart,
  truck: Truck,
  users: Users,
  warehouse: Warehouse,
  wrench: Wrench,
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
      <div className="mx-auto grid min-h-screen w-full max-w-[1500px] lg:grid-cols-[292px_1fr]">
        <aside className="flex flex-col border-b border-[#ded4c3] bg-[#f7f4ed] px-4 py-5 text-[#1d2520] sm:px-6 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto lg:border-b-0 lg:border-r">
          <div>
            <Link href="/" className="flex items-center gap-3" aria-label="Mini ERP home">
              <span className="flex size-10 items-center justify-center rounded-lg bg-[#1f806f] text-sm font-bold text-white">
                ERP
              </span>
              <span className="text-lg font-semibold">Mini ERP</span>
            </Link>
          </div>

          <div className="mt-7 rounded-lg border border-[#d9cfbd] bg-white/80 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase text-[#176b5d]">{dashboard.dbRole}</p>
            <h2 className="mt-2 text-xl font-semibold text-[#18231f]">{dashboard.sidebarTitle}</h2>
            <p className="mt-2 text-sm leading-6 text-[#53645c]">{dashboard.responsibility}</p>
          </div>

          <nav className="mt-6 flex-1 space-y-6">
            {dashboard.sidebarSections.map((section) => (
              <section key={section.title}>
                <p className="px-2 text-xs font-semibold uppercase text-[#68756e]">
                  {section.title}
                </p>
                <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                  {section.items.map((item, index) => {
                    const Icon = iconMap[item.icon];
                    const active = index === 0;

                    return (
                      <Link
                        key={item.label}
                        href={item.href}
                        className={cn(
                          "group flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition",
                          active
                            ? "border border-[#2c9f8a] bg-[#1f806f] text-white shadow-sm"
                            : "text-[#405049] hover:bg-white/85 hover:text-[#18231f]",
                        )}
                      >
                        <Icon className="size-4 shrink-0" />
                        <span className="min-w-0 flex-1 truncate">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </section>
            ))}
          </nav>

          <div className="mt-8 border-t border-[#ded4c3] pt-5">
            <Link
              href="/login"
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-[#cfc3ad] bg-white text-sm font-semibold text-[#24332d] shadow-sm transition hover:bg-[#fffaf0]"
            >
              <LogOut className="size-4" />
              Log out
            </Link>
          </div>
        </aside>

        <section className="relative overflow-hidden px-4 py-6 sm:px-8 lg:px-10">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-48 border-b border-[#e4dac8] bg-[linear-gradient(180deg,#eef7f3_0%,rgba(247,244,237,0)_100%)]" />

          <div className="relative">
            <header className="border-b border-[#ded4c3] pb-6">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                <div>
                  <span className="inline-flex rounded-lg border border-[#c9dbd5] bg-white/80 px-3 py-1 text-xs font-semibold uppercase text-[#176b5d]">
                    {dashboard.dbRole}
                  </span>
                  <h1 className="mt-4 text-4xl font-semibold leading-tight text-[#18231f]">
                    {dashboard.title} Dashboard
                  </h1>
                  <p className="mt-3 max-w-3xl text-base leading-7 text-[#53645c]">
                    {dashboard.focus}
                  </p>
                </div>

                <div className="rounded-lg border border-[#d9cfbd] bg-white/90 px-4 py-3 shadow-sm">
                  <p className="text-xs font-semibold uppercase text-[#68756e]">Access scope</p>
                  <p className="mt-1 max-w-md text-sm font-semibold text-[#25332d]">
                    {dashboard.modules.join(" / ")}
                  </p>
                </div>
              </div>
            </header>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {dashboard.metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-lg border border-[#d9cfbd] bg-white p-5 shadow-sm"
                >
                  <p className="text-sm font-medium text-[#68756e]">{metric.label}</p>
                  <p className="mt-3 text-3xl font-semibold text-[#202a25]">{metric.value}</p>
                  <p className="mt-2 text-sm text-[#53645c]">{metric.detail}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">
              <section className="rounded-lg border border-[#d9cfbd] bg-[#fbfaf6] p-5 shadow-sm">
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
                      className="rounded-lg border border-[#e3d8c5] bg-white p-4 transition hover:border-[#176b5d] hover:shadow-sm"
                    >
                      <h3 className="text-base font-semibold text-[#202a25]">{action.title}</h3>
                      <p className="mt-3 text-sm leading-6 text-[#53645c]">
                        {action.description}
                      </p>
                    </Link>
                  ))}
                </div>
              </section>

              <section className="rounded-lg border border-[#d9cfbd] bg-white p-5 shadow-sm">
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

            <section className="mt-6 overflow-hidden rounded-lg border border-[#d9cfbd] bg-white shadow-sm">
              <div className="grid grid-cols-[1.1fr_0.8fr_0.7fr] border-b border-[#e5dccb] bg-[#fbfaf6] px-4 py-3 text-xs font-semibold uppercase text-[#68756e]">
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
          </div>
        </section>
      </div>
    </main>
  );
}

function isRoleKey(role: string): role is RoleKey {
  return role in roleDashboards;
}
