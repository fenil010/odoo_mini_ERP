import {
  ArrowRight,
  BarChart3,
  Boxes,
  ChevronDown,
  ClipboardList,
  Factory,
  FileSearch,
  PackageSearch,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Truck,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { Fragment, type ReactNode } from "react";

const highlights = ["Real-time Visibility", "End-to-End Automation", "Inventory-Centric"];

const modules = [
  {
    title: "Sales Management",
    description: "Create sales orders, manage customers, and track every order from start to delivery.",
    icon: ShoppingCart,
    preview: "sales",
  },
  {
    title: "Inventory Control",
    description: "Track stock, on-hand quantities, reserved items, and availability in real time.",
    icon: Boxes,
    preview: "inventory",
  },
  {
    title: "Purchase Management",
    description: "Manage vendors, create purchase orders, and track receipts efficiently.",
    icon: Truck,
    preview: "purchase",
  },
  {
    title: "Manufacturing",
    description: "Plan, execute, and track production from raw materials to finished products.",
    icon: Factory,
    preview: "manufacturing",
  },
  {
    title: "Bill of Materials",
    description: "Create BoMs, manage components, and versions to streamline production.",
    icon: ClipboardList,
    preview: "bom",
  },
  {
    title: "Vendor Management",
    description: "Track vendor performance, lead time, quality, and purchase history.",
    icon: UsersRound,
    preview: "vendors",
  },
  {
    title: "Analytics & Reports",
    description: "Powerful insights and reports to help you make smarter business decisions.",
    icon: BarChart3,
    preview: "analytics",
  },
  {
    title: "Audit Logs",
    description: "Complete activity tracking with detailed audit trails for transparency.",
    icon: FileSearch,
    preview: "audit",
  },
  {
    title: "User & Role Management",
    description: "Manage users, roles, and permissions with role-based access control.",
    icon: ShieldCheck,
    preview: "roles",
  },
] as const;

type PreviewType = (typeof modules)[number]["preview"];

const workflowSteps = [
  { title: "Sales Order", value: "SO-1024", icon: ShoppingCart },
  { title: "Stock Check", value: "15 short", icon: PackageSearch },
  { title: "Manufacturing", value: "MO ready", icon: Factory },
  { title: "Purchase", value: "PO created", icon: Truck },
] as const;

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f7f4ed] text-[#1d2520]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[linear-gradient(100deg,rgba(255,225,166,0.92)_0%,rgba(255,250,240,0.58)_23%,rgba(251,250,246,0)_44%,rgba(255,250,240,0.62)_72%,rgba(255,225,166,0.9)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-72 bg-[linear-gradient(180deg,rgba(247,244,237,0)_0%,rgba(255,250,240,0.86)_54%,rgba(255,225,166,0.5)_100%)]" />

      <header className="relative z-20 mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-5 sm:px-8">
        <Link href="/" className="group flex items-center gap-3" aria-label="Mini ERP home">
          <span className="flex size-10 items-center justify-center rounded-lg bg-[#176b5d] text-sm font-bold text-white shadow-sm shadow-[#176b5d]/20 transition group-hover:scale-105">
            ERP
          </span>
          <span>
            <span className="block text-base font-bold leading-5 text-[#18231f] sm:text-lg">
              Mini ERP
            </span>
            <span className="hidden text-xs font-medium text-[#53645c] sm:block">
              From Demand to Delivery
            </span>
          </span>
        </Link>

        <nav
          aria-label="Primary navigation"
          className="hidden items-center gap-8 text-sm font-semibold text-[#405049] md:flex"
        >
          <a className="transition hover:text-[#176b5d]" href="#features">
            Features
          </a>
          <a className="transition hover:text-[#176b5d]" href="#modules">
            Modules
          </a>
          <a className="transition hover:text-[#176b5d]" href="#workflow">
            Workflow
          </a>
          <span className="inline-flex items-center gap-1 cursor-pointer transition hover:text-[#176b5d]">
            Pages <ChevronDown className="size-3.5" aria-hidden="true" />
          </span>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-[#33443d] transition hover:bg-white/70 sm:inline-flex"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-white px-4 text-sm font-bold text-[#18231f] shadow-lg shadow-[#8a7d681f] ring-1 ring-[#e3d8c5] transition hover:-translate-y-0.5 hover:bg-[#fffaf0] hover:shadow-xl"
          >
            Get Started <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </header>

      <main className="relative z-10">
        <section className="mx-auto w-full max-w-7xl px-4 pb-14 pt-10 sm:px-8 sm:pb-20 sm:pt-16">
          <div className="relative min-h-[560px] overflow-hidden rounded-[1.5rem] border border-white/60 bg-[#fbfaf6]/68 px-4 py-12 shadow-2xl shadow-[#8a7d6814] backdrop-blur-sm sm:rounded-[2rem] sm:px-8 lg:px-16">
            {/* Left Card Wrapper */}
            <div className="absolute left-6 top-1/2 -translate-y-1/2 hidden lg:block">
              <MetricCard
                eyebrow="Total Orders"
                value="1,250+"
                label="This Month"
                delta="+18.6%"
                chart="line"
              />
            </div>

            {/* Right Cards Stack Wrapper */}
            <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-6">
              <MetricCard
                eyebrow="Manufacturing Orders"
                value="320+"
                label="In Progress"
                delta="+24.1%"
                chart="bars"
              />
              <MetricCard
                eyebrow="Inventory Value"
                value="$2.45M"
                label="Current Value"
                delta="+15.8%"
                chart="mini"
              />
            </div>

            <div className="mx-auto flex w-full max-w-[700px] flex-col items-center text-center">
              <div className="animate-landing-rise inline-flex items-center gap-2 rounded-lg border border-[#e3d8c5] bg-white/80 px-3 py-1.5 text-xs font-bold text-[#53645c] shadow-sm">
                <span className="text-[#9a4f16]">New</span>
                <Sparkles className="size-3.5 text-[#176b5d]" aria-hidden="true" />
                Complete ERP for Manufacturing
              </div>

              <h1 className="animate-landing-rise mt-8 w-full break-words text-4xl font-bold leading-[1.08] text-[#0f1512] [animation-delay:80ms] sm:text-5xl lg:text-[56px] xl:text-[60px]">
                Demand to Delivery, Unified.
              </h1>

              <p className="animate-landing-rise mt-6 w-full max-w-3xl text-base leading-8 text-[#53645c] [animation-delay:160ms] sm:text-lg">
                Manage sales, inventory, manufacturing, procurement, delivery, and audit trails
                from a single connected system built for modern manufacturing businesses.
              </p>

              <div
                id="features"
                className="animate-landing-rise mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 [animation-delay:240ms]"
              >
                {highlights.map((item) => (
                  <span key={item} className="inline-flex items-center gap-2 text-sm font-semibold text-[#53645c]">
                    <span className="size-2 rounded-full bg-[#ffe1a6] shadow-[0_0_0_4px_rgba(255,225,166,0.38)]" />
                    {item}
                  </span>
                ))}
              </div>

              <div className="animate-landing-rise mt-10 flex w-full max-w-md flex-col justify-center gap-3 sm:w-auto sm:max-w-none sm:flex-row [animation-delay:320ms]">
                <Link
                  href="/signup"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#176b5d] px-6 text-base font-bold text-white shadow-xl shadow-[#176b5d]/18 transition hover:-translate-y-0.5 hover:bg-[#12574b]"
                >
                  Start Free Demo <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
                <a
                  href="#workflow"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-[#d6cbb8] bg-white px-6 text-base font-bold text-[#24332d] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#fffaf0]"
                >
                  Explore Workflow <ArrowRight className="size-4" aria-hidden="true" />
                </a>
              </div>

              <div className="animate-landing-rise mt-12 text-center [animation-delay:400ms]">
                <p className="text-sm font-bold text-[#53645c]">Trusted by Manufacturing Businesses</p>
                <p className="mt-2 text-sm font-medium text-[#53645c]">
                  Join 4,000+ companies already growing with Mini ERP
                </p>
              </div>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3 lg:hidden">
              <CompactMetric label="Orders" value="1,250+" delta="+18.6%" />
              <CompactMetric label="Manufacturing" value="320+" delta="+24.1%" />
              <CompactMetric label="Inventory" value="$2.45M" delta="+15.8%" />
            </div>
          </div>
        </section>

        <section id="modules" className="mx-auto w-full max-w-7xl px-4 pb-20 sm:px-8 lg:pb-28">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#176b5d]">
              Core Modules
            </p>
            <h2 className="mt-3 text-3xl font-bold leading-tight text-[#111713] sm:text-5xl">
              Everything Your Manufacturing Business Needs
            </h2>
            <p className="mt-5 text-base leading-8 text-[#53645c]">
              Powerful modules to streamline every department and automate your operations.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {modules.map((module, index) => {
              const Icon = module.icon;

              return (
                <article
                  key={module.title}
                  className="animate-landing-rise group rounded-lg border border-[#e3d8c5] bg-[#fbfaf6]/90 p-6 shadow-sm shadow-[#8a7d6814] transition duration-300 hover:-translate-y-1 hover:border-[#c9dbd5] hover:bg-white hover:shadow-xl hover:shadow-[#8a7d681f]"
                  style={{ animationDelay: `${Math.min(index * 45, 360)}ms` }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-[#18231f]">{module.title}</h3>
                      <p className="mt-3 min-h-20 text-sm leading-6 text-[#405049]">
                        {module.description}
                      </p>
                    </div>
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#eef7f3] text-[#176b5d] ring-1 ring-[#c9dbd5] transition group-hover:bg-[#176b5d] group-hover:text-white">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                  </div>

                  <div className="mt-6 overflow-hidden rounded-lg border border-[#efe7d8] bg-white shadow-inner shadow-[#8a7d6810]">
                    <ModulePreview type={module.preview} />
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section id="workflow" className="mx-auto w-full max-w-7xl px-4 pb-20 sm:px-8">
          <div className="grid gap-5 rounded-[1.5rem] border border-[#d6cbb8] bg-[#1d2520] p-5 text-white shadow-2xl shadow-[#1d2520]/20 md:grid-cols-[0.82fr_1.18fr] md:p-8">
            <div className="flex flex-col justify-between gap-8">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#ffe1a6]">
                  Connected Flow
                </p>
                <h2 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">
                  Sales signals automatically shape production and procurement.
                </h2>
              </div>
              <Link
                href="/login"
                className="inline-flex h-12 w-fit items-center justify-center gap-2 rounded-lg bg-white px-5 text-sm font-bold text-[#18231f] transition hover:-translate-y-0.5 hover:bg-[#fffaf0]"
              >
                Open Workspace <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-4">
              {workflowSteps.map(({ title, value, icon: Icon }, index) => (
                <div
                  key={title}
                  className="rounded-lg border border-white/10 bg-white/8 p-4 ring-1 ring-white/5 backdrop-blur"
                >
                  <span className="mb-8 flex size-10 items-center justify-center rounded-lg bg-[#176b5d] text-white">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#b8c5bd]">
                    Step {index + 1}
                  </p>
                  <h3 className="mt-2 text-sm font-bold text-white">{title}</h3>
                  <p className="mt-1 text-lg font-bold text-[#ffe1a6]">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function MetricCard({
  className,
  eyebrow,
  value,
  label,
  delta,
  chart,
}: {
  className?: string;
  eyebrow: string;
  value: string;
  label: string;
  delta: string;
  chart: "line" | "bars" | "mini";
}) {
  return (
    <div className={`animate-float-card w-56 rounded-lg border border-[#e3d8c5] bg-white/86 p-5 shadow-xl shadow-[#8a7d681c] backdrop-blur ${className || ""}`}>
      <p className="text-sm font-bold text-[#33443d]">{eyebrow}</p>
      <p className="mt-2 text-3xl font-bold tracking-tight text-[#111713]">{value}</p>
      <p className="mt-1 text-xs font-bold text-[#9a4f16]">{label}</p>
      <div className="mt-5 h-14">{renderMetricChart(chart)}</div>
      <p className="mt-4 text-xs font-semibold text-[#53645c]">
        <span className="font-bold text-[#176b5d]">{delta}</span> vs last month
      </p>
    </div>
  );
}

function CompactMetric({
  label,
  value,
  delta,
}: {
  label: string;
  value: string;
  delta: string;
}) {
  return (
    <div className="rounded-lg border border-[#e3d8c5] bg-white/80 p-4 text-left shadow-sm">
      <p className="text-xs font-bold text-[#53645c]">{label}</p>
      <p className="mt-1 text-2xl font-bold text-[#111713]">{value}</p>
      <p className="mt-2 text-xs font-bold text-[#176b5d]">{delta}</p>
    </div>
  );
}

function renderMetricChart(chart: "line" | "bars" | "mini") {
  if (chart === "bars") {
    return (
      <div className="flex h-full items-end gap-1.5">
        {[34, 48, 42, 58, 72, 66, 82, 74].map((height, index) => (
          <span
            key={`${height}-${index}`}
            className="flex-1 rounded-t bg-[#c9dbd5]"
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
    );
  }

  if (chart === "mini") {
    return (
      <div className="grid h-full grid-cols-3 gap-2">
        {["Raw", "WIP", "Done"].map((item, index) => (
          <div key={item} className="rounded-lg bg-[#f7f4ed] p-2">
            <span className="block h-2 rounded-full bg-[#176b5d]" style={{ width: `${54 + index * 14}%` }} />
            <p className="mt-3 text-[10px] font-bold text-[#53645c]">{item}</p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <svg className="h-full w-full overflow-visible" viewBox="0 0 180 60" role="img" aria-label="Orders trend">
      <path
        d="M4 45 C22 28, 34 40, 48 24 S78 34, 92 18 S120 46, 136 22 S160 20, 176 10"
        fill="none"
        stroke="#9a4f16"
        strokeLinecap="round"
        strokeWidth="3"
      />
      <path
        d="M4 45 C22 28, 34 40, 48 24 S78 34, 92 18 S120 46, 136 22 S160 20, 176 10 L176 58 L4 58 Z"
        fill="rgba(255,225,166,0.45)"
      />
      <circle cx="176" cy="10" r="4" fill="#9a4f16" />
    </svg>
  );
}

function ModulePreview({ type }: { type: PreviewType }) {
  const previews: Record<PreviewType, ReactNode> = {
    sales: <SalesPreview />,
    inventory: <InventoryPreview />,
    purchase: <PurchasePreview />,
    manufacturing: <ManufacturingPreview />,
    bom: <BomPreview />,
    vendors: <VendorsPreview />,
    analytics: <AnalyticsPreview />,
    audit: <AuditPreview />,
    roles: <RolesPreview />,
  };

  return <div className="h-36 bg-[#fbfaf6] p-4">{previews[type]}</div>;
}

function PreviewShell({ children }: { children: ReactNode }) {
  return (
    <div className="h-full rounded-lg border border-[#f3ebdd] bg-white p-3">
      <div className="mb-3 flex items-center justify-between">
        <span className="h-2 w-20 rounded-full bg-[#c9dbd5]" />
        <span className="h-5 w-12 rounded-md bg-[#ffe1a6]" />
      </div>
      {children}
    </div>
  );
}

function SalesPreview() {
  return (
    <PreviewShell>
      <div className="grid grid-cols-4 gap-2 text-[9px] font-bold text-[#53645c]">
        {["SO-1024", "SO-1025", "SO-1026", "SO-1027"].map((item, index) => (
          <div key={item} className="rounded-md bg-[#f7f4ed] p-2">
            <span className="mb-4 block h-1.5 rounded-full bg-[#176b5d]" style={{ width: `${44 + index * 11}%` }} />
            {item}
          </div>
        ))}
      </div>
    </PreviewShell>
  );
}

function InventoryPreview() {
  return (
    <PreviewShell>
      <div className="space-y-2">
        {["Dining Table", "Chair Frame", "Leg Set", "Table Top"].map((item, index) => (
          <div key={item} className="grid grid-cols-[1fr_36px_42px] items-center gap-2 text-[9px] font-semibold text-[#53645c]">
            <span>{item}</span>
            <span className="h-1.5 rounded-full bg-[#c9dbd5]" />
            <span className="text-right font-bold text-[#176b5d]">{120 - index * 19}</span>
          </div>
        ))}
      </div>
    </PreviewShell>
  );
}

function PurchasePreview() {
  return (
    <PreviewShell>
      <div className="space-y-2">
        {["PO-2041", "PO-2042", "PO-2043"].map((item, index) => (
          <div key={item} className="flex items-center justify-between rounded-md bg-[#f7f4ed] px-2 py-1.5 text-[9px] font-bold text-[#53645c]">
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-[#ffe1a6]" />
              {item}
            </span>
            <span className="text-[#176b5d]">{index === 0 ? "Ready" : "Open"}</span>
          </div>
        ))}
      </div>
    </PreviewShell>
  );
}

function ManufacturingPreview() {
  return (
    <PreviewShell>
      <div className="relative h-20">
        {[12, 30, 48, 66].map((left, index) => (
          <div
            key={left}
            className="absolute h-3 rounded-full bg-[#176b5d]"
            style={{
              left: `${left}%`,
              top: `${index * 17}px`,
              width: `${48 - index * 4}%`,
              opacity: 0.95 - index * 0.12,
            }}
          />
        ))}
        <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-[#d6cbb8]" />
      </div>
    </PreviewShell>
  );
}

function BomPreview() {
  return (
    <PreviewShell>
      <div className="grid grid-cols-[1fr_44px_44px] gap-2 text-[9px] font-semibold text-[#53645c]">
        {["Table top", "Legs", "Hardware", "Finish"].map((item, index) => (
          <Fragment key={item}>
            <span>{item}</span>
            <span className="text-right">{index + 1}</span>
            <span className="text-right font-bold text-[#176b5d]">{(index + 2) * 6}</span>
          </Fragment>
        ))}
      </div>
    </PreviewShell>
  );
}

function VendorsPreview() {
  return (
    <PreviewShell>
      <div className="space-y-2">
        {["Oak Works", "Steel Source", "Prime Logistics"].map((item, index) => (
          <div key={item} className="grid grid-cols-[1fr_42px] items-center gap-3 text-[9px] font-bold text-[#53645c]">
            <span className="inline-flex items-center gap-2">
              <span className="size-5 rounded-full bg-[#eef7f3]" />
              {item}
            </span>
            <span className="text-right text-[#176b5d]">{98 - index * 5}%</span>
          </div>
        ))}
      </div>
    </PreviewShell>
  );
}

function AnalyticsPreview() {
  return (
    <PreviewShell>
      <div className="grid h-20 grid-cols-[1fr_72px] items-end gap-4">
        <div className="flex h-full items-end gap-2">
          {[32, 54, 45, 76, 62].map((height, index) => (
            <span
              key={`${height}-${index}`}
              className="flex-1 rounded-t bg-[#ffe1a6]"
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
        <div className="relative aspect-square rounded-full border-[12px] border-[#c9dbd5]">
          <div className="absolute inset-[-12px] rounded-full border-[12px] border-transparent border-t-[#176b5d] border-r-[#176b5d]" />
        </div>
      </div>
    </PreviewShell>
  );
}

function AuditPreview() {
  return (
    <PreviewShell>
      <div className="space-y-2">
        {["Order updated", "Stock reserved", "Role changed", "PO approved"].map((item) => (
          <div key={item} className="grid grid-cols-[10px_1fr_34px] items-center gap-2 text-[9px] font-semibold text-[#53645c]">
            <span className="size-2 rounded-full bg-[#176b5d]" />
            <span>{item}</span>
            <span className="h-1.5 rounded-full bg-[#d6cbb8]" />
          </div>
        ))}
      </div>
    </PreviewShell>
  );
}

function RolesPreview() {
  return (
    <PreviewShell>
      <div className="space-y-2">
        {["Owner", "Admin", "Sales", "Inventory"].map((item, index) => (
          <div key={item} className="grid grid-cols-[22px_1fr_46px] items-center gap-2 text-[9px] font-bold text-[#53645c]">
            <span className="size-5 rounded-full bg-[#eef7f3]" />
            <span>{item}</span>
            <span className="rounded bg-[#f7f4ed] px-1.5 py-0.5 text-center text-[#176b5d]">
              {index === 0 ? "Full" : "Team"}
            </span>
          </div>
        ))}
      </div>
    </PreviewShell>
  );
}
