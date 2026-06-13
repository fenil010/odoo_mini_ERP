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
import { getRoleBusinessData, getNavbarData } from "@/lib/dashboard-data";
import { getRoleDashboardFromDB, getRolePageFromDB } from "@/lib/role-queries";
import { cn } from "@/lib/utils";
import { type RoleKey, type SidebarIcon } from "./role-data";
import { logout } from "@/app/actions/auth";
import DashboardCharts from "./components/DashboardCharts";
import DashboardHeader from "./components/DashboardHeader";
import {
  getAdminAnalytics,
  getSalesAnalytics,
  getPurchaseAnalytics,
  getManufacturingAnalytics,
  getInventoryAnalytics,
  getOwnerAnalytics
} from "@/lib/analytics-data";
import StatusBadge from "@/app/components/ui/StatusBadge";
import DynamicSectionClient from "./components/DynamicSectionClient";


type RoleWorkspaceProps = {
  role: RoleKey;
  section?: string;
  children?: React.ReactNode;
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

export async function RoleWorkspace({ role, section, children }: RoleWorkspaceProps) {
  await connection();

  const dashboard = await getRoleDashboardFromDB(role);

  if (!dashboard || !dashboard.sidebarSections || dashboard.sidebarSections.length === 0) {
    return (
      <main className="min-h-screen bg-[#f7f4ed] flex items-center justify-center text-[#1d2520] p-6">
        <div className="max-w-md w-full rounded-lg border border-[#d9cfbd] bg-white p-8 shadow-sm text-center">
          <Activity className="size-12 mx-auto text-[#176b5d] mb-4" />
          <h1 className="text-2xl font-semibold text-[#18231f]">Workspace Data Unavailable</h1>
          <p className="mt-3 text-sm text-[#53645c]">
            The layout configuration for role "{role}" could not be loaded or is incomplete.
          </p>
          <div className="mt-6">
            <form action={logout}>
              <button
                type="submit"
                className="inline-flex h-11 px-6 items-center justify-center gap-2 rounded-lg border border-[#cfc3ad] bg-white text-sm font-semibold text-[#24332d] shadow-sm transition hover:bg-[#fffaf0]"
              >
                <LogOut className="size-4" />
                Log out
              </button>
            </form>
          </div>
        </div>
      </main>
    );
  }

  const currentPage = (await getRolePageFromDB(role, section)) ?? (await getRolePageFromDB(role));
  const businessData = await getRoleBusinessData(role, section);
  const navbarData = await getNavbarData(role);
  
  const firstSection = dashboard.sidebarSections[0];
  const firstItem = firstSection?.items?.[0];
  const SummaryIcon = firstItem ? (iconMap[firstItem.icon] || Home) : Home;
  const isOverview = !section;

  // Fetch real analytics data if in overview mode
  let analyticsData = null;
  if (isOverview) {
    if (role === "admin") analyticsData = await getAdminAnalytics();
    else if (role === "sales") analyticsData = await getSalesAnalytics();
    else if (role === "purchase") analyticsData = await getPurchaseAnalytics();
    else if (role === "manufacturing") analyticsData = await getManufacturingAnalytics();
    else if (role === "inventory") analyticsData = await getInventoryAnalytics();
    else if (role === "owner") analyticsData = await getOwnerAnalytics();
  }

  return (
    <main className="min-h-screen bg-[#f7f4ed] text-[#1d2520]">
      <div className="mx-auto grid min-h-screen w-full max-w-375 lg:grid-cols-[292px_1fr]">
        <aside className="scrollbar-hidden flex flex-col border-b border-[#ded4c3] bg-[#f7f4ed] px-4 py-5 text-[#1d2520] sm:px-6 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto lg:border-b-0 lg:border-r">
          <div>
            <Link href="/" className="flex items-center gap-3" aria-label="Mini ERP home">
              <span className="flex size-10 items-center justify-center rounded-lg bg-[#1f806f] text-sm font-bold text-white">
                ERP
              </span>
              <span className="text-lg font-semibold">Mini ERP</span>
            </Link>
          </div>

          <nav className="mt-8 flex-1 space-y-6">
            {dashboard.sidebarSections.map((section) => (
              <section key={section.title}>
                <p className="px-2 text-xs font-semibold uppercase text-[#68756e]">
                  {section.title}
                </p>
                <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                  {(section.items || []).map((item) => {
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
            <form action={logout}>
              <button
                type="submit"
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-[#cfc3ad] bg-white text-sm font-semibold text-[#24332d] shadow-sm transition hover:bg-[#fffaf0]"
              >
                <LogOut className="size-4" />
                Log out
              </button>
            </form>
          </div>

        </aside>

        <div className="flex flex-col min-h-screen">
          {/* Fetch live navbar dropdown data */}
          {(() => {
            // Note: We resolve the promise here so we can keep the workspace clean
            return null;
          })()}
          <DashboardHeader 
            role={role} 
            roleTitle={dashboard.sidebarTitle} 
            initialApprovals={navbarData.approvals}
            initialNotifications={navbarData.notifications}
          />

          <section className="relative flex-1 overflow-hidden px-4 py-6 sm:px-8 lg:px-10">
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

            {children ? (
              <div className="mt-6">
                {children}
              </div>
            ) : isOverview ? (
              <DashboardCharts role={role} data={analyticsData} />
            ) : (
              <div className="mt-6">
                <DynamicSectionClient role={role} section={section!} businessData={businessData} />
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  </main>
  );
}
