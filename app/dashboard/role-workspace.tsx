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
import { ProductImage } from "./product-image";
import Link from "next/link";
import { connection } from "next/server";
import { getRoleBusinessData } from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";
import { getRolePage, roleDashboards, type RoleKey, type SidebarIcon } from "./role-data";

type RoleWorkspaceProps = {
  role: RoleKey;
  section?: string;
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

export async function RoleWorkspace({ role, section }: RoleWorkspaceProps) {
  await connection();

  const dashboard = roleDashboards[role];
  const currentPage = getRolePage(role, section) ?? getRolePage(role);
  const businessData = await getRoleBusinessData(role, section);
  const SummaryIcon = iconMap[dashboard.sidebarSections[0].items[0].icon];
  const isOverview = !section;

  return (
    <main className="min-h-screen bg-[#f7f4ed] text-[#1d2520]">
      <div className="mx-auto grid min-h-screen w-full max-w-[1500px] lg:grid-cols-[292px_1fr]">
        <aside className="scrollbar-hidden flex flex-col border-b border-[#ded4c3] bg-[#f7f4ed] px-4 py-5 text-[#1d2520] sm:px-6 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto lg:border-b-0 lg:border-r">
          <div>
            <Link href="/" className="flex items-center gap-3" aria-label="Mini ERP home">
              <span className="flex size-10 items-center justify-center rounded-lg bg-[#1f806f] text-sm font-bold text-white">
                ERP
              </span>
              <span className="text-lg font-semibold">Mini ERP</span>
            </Link>
          </div>

          <div className="mt-7 border-b border-[#ded4c3] pb-5">
            <div className="flex items-start gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-[#c9dbd5] bg-[#eef7f3] text-[#176b5d]">
                <SummaryIcon className="size-5" />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[#176b5d]">
                  {dashboard.dbRole}
                </p>
                <h2 className="mt-1 text-lg font-semibold leading-6 text-[#18231f]">
                  {dashboard.sidebarTitle}
                </h2>
              </div>
            </div>
            <p className="mt-3 text-sm leading-5 text-[#53645c]">{dashboard.responsibility}</p>
          </div>

          <nav className="mt-6 flex-1 space-y-6">
            {dashboard.sidebarSections.map((section) => (
              <section key={section.title}>
                <p className="px-2 text-xs font-semibold uppercase text-[#68756e]">
                  {section.title}
                </p>
                <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                  {section.items.map((item) => {
                    const Icon = iconMap[item.icon];
                    const active = item.href === currentPage?.href;

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
                    {isOverview ? `${dashboard.title} Dashboard` : currentPage?.label}
                  </h1>
                  <p className="mt-3 max-w-3xl text-base leading-7 text-[#53645c]">
                    {isOverview ? dashboard.focus : currentPage?.description}
                  </p>
                </div>
              </div>
            </header>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {businessData.metrics.map((metric) => (
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
                    <h2 className="text-xl font-semibold text-[#202a25]">
                      {isOverview ? businessData.workTitle : currentPage?.label}
                    </h2>
                    <p className="mt-1 text-sm text-[#68756e]">
                      {isOverview ? businessData.workDescription : currentPage?.description}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  {businessData.workItems.slice(0, 6).map((item) => (
                    <article
                      key={`${item.title}-${item.description}`}
                      className="rounded-lg border border-[#e3d8c5] bg-white p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-base font-semibold text-[#202a25]">{item.title}</h3>
                        <span className="rounded-lg bg-[#eef7f3] px-2 py-1 text-xs font-semibold text-[#176b5d]">
                          {item.status}
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-[#53645c]">{item.description}</p>
                    </article>
                  ))}
                </div>
              </section>

              <section className="rounded-lg border border-[#d9cfbd] bg-white p-5 shadow-sm">
                <h2 className="text-xl font-semibold text-[#202a25]">{businessData.sideTitle}</h2>
                <div className="mt-4 grid gap-3">
                  {businessData.sideItems.slice(0, 5).map((item) => (
                    <article
                      key={`${item.title}-${item.status}`}
                      className="rounded-lg border border-[#e3d8c5] bg-[#fbfaf6] p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-sm font-semibold text-[#202a25]">{item.title}</h3>
                          <p className="mt-1 text-xs leading-5 text-[#53645c]">{item.description}</p>
                        </div>
                        <span className="shrink-0 rounded-lg bg-white px-2 py-1 text-xs font-semibold text-[#405049]">
                          {item.status}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </div>

            {businessData.stockItems.length > 0 && (
              <section className="mt-6 overflow-hidden rounded-lg border border-[#d9cfbd] bg-white shadow-sm">
                <div className="grid grid-cols-[80px_1fr_0.7fr_0.6fr] border-b border-[#e5dccb] bg-[#fbfaf6] px-4 py-3 text-xs font-semibold uppercase text-[#68756e]">
                  <span>Image</span>
                  <span>Product / SKU</span>
                  <span>Available</span>
                  <span>Status</span>
                </div>
                {businessData.stockItems.map((item) => (
                  <div
                    key={item.name}
                    className="grid grid-cols-[80px_1fr_0.7fr_0.6fr] gap-3 border-b border-[#efe7d8] px-4 py-4 text-sm last:border-b-0 items-center"
                  >
                    <ProductImage src={item.imageUrl} alt={item.name} />
                    <span>
                      <span className="block font-semibold text-[#202a25]">{item.name}</span>
                      <span className="mt-1 block text-xs text-[#68756e]">{item.detail}</span>
                    </span>
                    <span className="text-[#53645c]">{item.quantity}</span>
                    <span className="font-semibold text-[#176b5d]">{item.status}</span>
                  </div>
                ))}
              </section>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
