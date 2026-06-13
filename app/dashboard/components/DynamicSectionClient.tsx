"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  TrendingUp,
  ShoppingCart,
  Package,
  Users,
  Factory,
  Warehouse,
  IndianRupee,
  FileText,
  Play,
  ArrowUpRight,
  TrendingDown,
  Layers,
  Percent,
  Truck,
  ArrowRight,
  Shield,
  Settings,
  HelpCircle,
  ExternalLink,
  Zap,
  Activity
} from "lucide-react";
import StatusBadge from "@/app/components/ui/StatusBadge";
import Link from "next/link";

// Warm forest and sand palette
const COLORS = ["#1f806f", "#3b82f6", "#f59e0b", "#10b981", "#6366f1", "#ef4444", "#8b5cf6", "#ec4899"];

type DashboardMetric = {
  label: string;
  value: string;
  detail: string;
};

type DashboardItem = {
  title: string;
  description: string;
  status: string;
};

type StockItem = {
  name: string;
  detail: string;
  quantity: string;
  status: string;
  imageUrl?: string | null;
};

type RoleBusinessData = {
  metrics: DashboardMetric[];
  workTitle: string;
  workDescription: string;
  workItems: DashboardItem[];
  sideTitle: string;
  sideItems: DashboardItem[];
  stockItems: StockItem[];
};

type DynamicSectionClientProps = {
  role: string;
  section: string;
  businessData: RoleBusinessData;
};

export default function DynamicSectionClient({ role, section, businessData }: DynamicSectionClientProps) {
  const key = `${role}/${section}`;

  // Helper: Render KPI Card
  const renderKPI = (title: string, value: string | number, desc: string, icon: React.ReactNode) => (
    <div className="group rounded-2xl border border-[#ded4c3] bg-white p-5 shadow-xs flex items-center justify-between hover:shadow-md transition-all duration-300">
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[#68756e]">{title}</p>
        <p className="mt-2 text-2xl font-bold text-[#18231f] tracking-tight truncate group-hover:text-[#1f806f] transition-colors">{value}</p>
        <p className="mt-1 text-[10px] text-[#53645c] truncate">{desc}</p>
      </div>
      <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#eef7f3] border border-[#c9dbd5] text-[#1f806f] group-hover:bg-[#1f806f] group-hover:text-white transition-all duration-300">
        {icon}
      </span>
    </div>
  );

  // Helper: Render Standard Recharts Tooltip
  const renderTooltip = (props: any) => {
    const { active, payload } = props;
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#18231f] text-white p-3 rounded-xl shadow-xl text-xs font-semibold border border-white/10">
          <p className="font-bold border-b border-white/20 pb-1 mb-1.5 capitalize">{payload[0].payload.name || payload[0].payload.title || payload[0].payload.month}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="flex items-center gap-2 mt-1">
              <span>{entry.name}:</span>
              <span className="font-mono">
                {typeof entry.value === "number" && entry.name.toLowerCase().includes("value") ? `₹${entry.value.toLocaleString()}` : entry.value}
              </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Helper: Render Action Queue banner
  const renderAttentionBox = (title: string, reason: string, actionText: string, link: string) => (
    <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 backdrop-blur-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div className="flex items-start gap-3.5">
        <div className="rounded-xl bg-amber-100 p-2 text-amber-800 border border-amber-200 mt-0.5">
          <AlertTriangle className="size-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-[#18231f] uppercase tracking-wider">{title}</h4>
          <p className="text-xs text-[#53645c] mt-1 leading-relaxed">{reason}</p>
        </div>
      </div>
      <Link href={link} className="shrink-0 inline-flex items-center justify-center rounded-lg bg-[#1f806f] hover:bg-[#176b5d] px-4 py-2 text-xs font-bold text-white shadow-xs transition">
        {actionText}
      </Link>
    </div>
  );

  // Helper: Render custom workflow progress pipeline
  const renderPipeline = (steps: Array<{ label: string; done: boolean; color: string }>) => (
    <div className="rounded-2xl border border-[#ded4c3] bg-white p-5 shadow-xs">
      <h3 className="text-xs font-bold text-[#18231f] uppercase tracking-wider mb-5 flex items-center gap-1.5">
        <Activity className="size-4 text-[#1f806f]" /> Execution Progression Funnel
      </h3>
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 text-xs font-bold uppercase">
        {steps.map((step, idx) => (
          <React.Fragment key={idx}>
            <div className="flex-1 flex items-center gap-3 p-3.5 rounded-xl border border-[#ded4c3] bg-[#fbfaf6]">
              <div className={`flex size-6 items-center justify-center rounded-full text-[10px] text-white ${step.done ? step.color : 'bg-gray-200'}`}>
                {step.done ? "✓" : idx + 1}
              </div>
              <span className={step.done ? "text-[#18231f]" : "text-gray-400"}>{step.label}</span>
            </div>
            {idx < steps.length - 1 && (
              <ArrowRight className="hidden md:block size-4 text-[#ded4c3] shrink-0" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  // 1. SALES PAGES
  if (role === "sales") {
    if (section === "shortages") {
      const shortageChartData = businessData.stockItems
        .filter(item => item.status === "Low stock")
        .map(item => ({
          name: item.name.slice(0, 12),
          value: Number(item.quantity.replace(/[^0-9]/g, ""))
        }));

      return (
        <div className="space-y-6">
          {renderAttentionBox(
            "Replenishment Required",
            "Critical stock levels detected on components required for pending Sales Orders.",
            "Run Procurement Engine",
            "/dashboard/purchase/shortage-demand"
          )}

          <div className="grid gap-4 sm:grid-cols-3">
            {renderKPI("Shortage Items", businessData.workItems.length, "At or below safety limits", <AlertTriangle className="size-5 text-red-600" />)}
            {renderKPI("Affected Orders", "3 Sales Orders", "Blocked due to inventory deficit", <ShoppingCart className="size-5" />)}
            {renderKPI("Action Status", "Replenishment Drafted", "Procurement requests staged", <Layers className="size-5" />)}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-[#ded4c3] bg-white p-5 shadow-xs">
              <h3 className="text-xs font-bold text-[#18231f] uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <TrendingDown className="size-4 text-red-500" /> Stock Shortage Depth
              </h3>
              <div className="h-64 w-full">
                {shortageChartData.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-xs text-[#53645c]">All materials at safety levels</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={shortageChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#efe7d8" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#53645c" }} />
                      <YAxis tick={{ fontSize: 10, fill: "#53645c" }} />
                      <Tooltip content={renderTooltip} />
                      <Bar dataKey="value" name="Qty Deficit" fill="#ef4444" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-[#ded4c3] bg-white p-5 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-[#18231f] uppercase tracking-wider mb-4">Fulfillment Action Strategy</h3>
                <div className="space-y-3.5 text-xs">
                  <div className="p-3 bg-[#fbfaf6] border border-[#ded4c3] rounded-xl">
                    <p className="font-bold text-[#18231f]">1. Auto-Fulfillment Trigger</p>
                    <p className="text-[#53645c] mt-0.5">Procurement automatically scans products catalog on MTO (Make-To-Order) flags.</p>
                  </div>
                  <div className="p-3 bg-[#fbfaf6] border border-[#ded4c3] rounded-xl">
                    <p className="font-bold text-[#18231f]">2. Purchase Lead Time</p>
                    <p className="text-[#53645c] mt-0.5">Average delivery lead time from Lumber Mills is 3-5 business days.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#ded4c3] bg-white overflow-hidden shadow-xs">
            <div className="px-5 py-4 border-b border-[#f3ebdd] bg-[#fbfaf6]">
              <h3 className="text-xs font-bold text-[#18231f] uppercase tracking-wider">Shortage Item Ledgers</h3>
            </div>
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#fbfaf6] text-[#68756e] font-bold border-b border-[#ded4c3] uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Product SKU</th>
                  <th className="px-6 py-3.5">Stock Position</th>
                  <th className="px-6 py-3.5 text-center">Procurement Strategy</th>
                  <th className="px-6 py-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#efe7d8]">
                {businessData.workItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[#fbfaf6]/50">
                    <td className="px-6 py-3.5 font-bold text-[#202a25]">{item.title}</td>
                    <td className="px-6 py-3.5 text-[#53645c]">{item.description}</td>
                    <td className="px-6 py-3.5 text-center font-mono font-bold text-[#1f806f]">{item.status}</td>
                    <td className="px-6 py-3.5 text-center">
                      <span className="inline-flex rounded px-2 py-0.5 text-[9px] font-bold bg-red-50 text-red-700 border border-red-200">Needs Replenishment</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    if (section === "order-items") {
      return (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {renderKPI("Order Lines", businessData.metrics[0].value, "Unique lines ordered", <FileText className="size-5" />)}
            {renderKPI("Total Quantity Ordered", businessData.metrics[1].value, "Total units in transit", <Package className="size-5" />)}
            {renderKPI("Gross Pipeline Value", businessData.metrics[2].value, "Fulfillment queue pricing", <IndianRupee className="size-5" />)}
          </div>

          <div className="rounded-2xl border border-[#ded4c3] bg-white overflow-hidden shadow-xs">
            <div className="px-5 py-4 border-b border-[#f3ebdd] bg-[#fbfaf6]">
              <h3 className="text-xs font-bold text-[#18231f] uppercase tracking-wider">Customer Order Lines Analysis</h3>
            </div>
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#fbfaf6] text-[#68756e] font-bold border-b border-[#ded4c3] uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Reference SO</th>
                  <th className="px-6 py-3.5">Product SKU</th>
                  <th className="px-6 py-3.5 text-right">Qty</th>
                  <th className="px-6 py-3.5 text-right">Price</th>
                  <th className="px-6 py-3.5 text-center">Order Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#efe7d8]">
                {businessData.workItems.map((item, idx) => {
                  const [sku, qty, price] = item.description.split(" / ");
                  return (
                    <tr key={idx} className="hover:bg-[#fbfaf6]/50">
                      <td className="px-6 py-3.5 font-bold text-[#176b5d] font-mono">{item.title}</td>
                      <td className="px-6 py-3.5 font-bold text-[#202a25]">{sku}</td>
                      <td className="px-6 py-3.5 text-right font-semibold text-[#53645c]">{qty}</td>
                      <td className="px-6 py-3.5 text-right font-bold text-[#202a25]">{price}</td>
                      <td className="px-6 py-3.5 text-center">
                        <StatusBadge status={item.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    if (section === "delivery-status") {
      return (
        <div className="space-y-6">
          {renderPipeline([
            { label: "Sales Confirmed", done: true, color: "bg-teal-700" },
            { label: "Components Reserved", done: true, color: "bg-teal-700" },
            { label: "Dispatch Staged", done: true, color: "bg-teal-700" },
            { label: "Out for Delivery", done: false, color: "bg-teal-700" }
          ])}

          <div className="grid gap-4 sm:grid-cols-3">
            {renderKPI("Delivery Backlog", businessData.metrics[0].value, "Awaiting fulfillment", <Truck className="size-5" />)}
            {renderKPI("Committed Reservations", businessData.metrics[1].value, "Materials locked to orders", <Layers className="size-5" />)}
            {renderKPI("Dispatched Orders", businessData.metrics[2].value, "Deliveries completed", <CheckCircle2 className="size-5 text-emerald-600" />)}
          </div>

          <div className="rounded-2xl border border-[#ded4c3] bg-white overflow-hidden shadow-xs">
            <div className="px-5 py-4 border-b border-[#f3ebdd] bg-[#fbfaf6]">
              <h3 className="text-xs font-bold text-[#18231f] uppercase tracking-wider">Delivery Queue Logs</h3>
            </div>
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#fbfaf6] text-[#68756e] font-bold border-b border-[#ded4c3] uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Fulfillment Reference</th>
                  <th className="px-6 py-3.5">Customer & Items</th>
                  <th className="px-6 py-3.5 text-center">Delivery Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#efe7d8]">
                {businessData.workItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[#fbfaf6]/50">
                    <td className="px-6 py-3.5 font-bold font-mono text-[#1f806f]">{item.title}</td>
                    <td className="px-6 py-3.5 font-semibold text-[#202a25]">{item.description}</td>
                    <td className="px-6 py-3.5 text-center">
                      <StatusBadge status={item.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }
  }

  // 2. PURCHASE PAGES
  if (role === "purchase") {
    if (section === "purchase-items") {
      return (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {renderKPI("Material Lines", businessData.metrics[0].value, "Items purchased", <Package className="size-5" />)}
            {renderKPI("Procured Quantity", businessData.metrics[1].value, "Total components ordered", <Warehouse className="size-5" />)}
            {renderKPI("Extended Cost", businessData.metrics[2].value, "Purchase cost exposure", <IndianRupee className="size-5" />)}
          </div>

          <div className="rounded-2xl border border-[#ded4c3] bg-white overflow-hidden shadow-xs">
            <div className="px-5 py-4 border-b border-[#f3ebdd] bg-[#fbfaf6]">
              <h3 className="text-xs font-bold text-[#18231f] uppercase tracking-wider">Supplier Line Receipts</h3>
            </div>
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#fbfaf6] text-[#68756e] font-bold border-b border-[#ded4c3] uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">PO Number</th>
                  <th className="px-6 py-3.5">Material Component</th>
                  <th className="px-6 py-3.5 text-right">Quantity</th>
                  <th className="px-6 py-3.5 text-right">Cost Price</th>
                  <th className="px-6 py-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#efe7d8]">
                {businessData.workItems.map((item, idx) => {
                  const [material, qty, price] = item.description.split(" / ");
                  return (
                    <tr key={idx} className="hover:bg-[#fbfaf6]/50">
                      <td className="px-6 py-3.5 font-bold font-mono text-[#1f806f]">{item.title}</td>
                      <td className="px-6 py-3.5 font-bold text-[#202a25]">{material}</td>
                      <td className="px-6 py-3.5 text-right font-semibold text-[#53645c]">{qty}</td>
                      <td className="px-6 py-3.5 text-right font-bold text-[#202a25]">{price}</td>
                      <td className="px-6 py-3.5 text-center">
                        <StatusBadge status={item.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    if (section === "incoming-stock") {
      return (
        <div className="space-y-6">
          {renderAttentionBox(
            "Shipment Schedule Check",
            "Supplier deliveries expected at warehouse docks. Verify gate check counts on receipt.",
            "Receive Dock Log",
            "/dashboard/inventory/receive-materials"
          )}

          <div className="grid gap-4 sm:grid-cols-3">
            {renderKPI("Active POs", businessData.metrics[0].value, "Open purchase orders", <FileText className="size-5" />)}
            {renderKPI("Incoming Units", businessData.metrics[1].value, "Units expected in dock", <Truck className="size-5" />)}
            {renderKPI("Pending Suppliers", businessData.metrics[2].value, "Active supply partners", <Users className="size-5" />)}
          </div>

          <div className="rounded-2xl border border-[#ded4c3] bg-white overflow-hidden shadow-xs">
            <div className="px-5 py-4 border-b border-[#f3ebdd] bg-[#fbfaf6]">
              <h3 className="text-xs font-bold text-[#18231f] uppercase tracking-wider">Expected Materials Queue</h3>
            </div>
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#fbfaf6] text-[#68756e] font-bold border-b border-[#ded4c3] uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">PO ID</th>
                  <th className="px-6 py-3.5">Vendor Supplier</th>
                  <th className="px-6 py-3.5 text-center">Shipment State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#efe7d8]">
                {businessData.workItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[#fbfaf6]/50">
                    <td className="px-6 py-3.5 font-bold font-mono text-[#1f806f]">{item.title}</td>
                    <td className="px-6 py-3.5 font-semibold text-[#202a25]">{item.description}</td>
                    <td className="px-6 py-3.5 text-center">
                      <StatusBadge status={item.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    if (section === "shortage-demand") {
      return (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {renderKPI("Material Shortages", businessData.metrics[0].value, "Components below threshold", <AlertTriangle className="size-5 text-red-600" />)}
            {renderKPI("Restock Orders", businessData.metrics[1].value, "Replenishments dispatched", <Layers className="size-5" />)}
            {renderKPI("At-Risk Materials", businessData.metrics[2].value, "Components at risk", <Package className="size-5" />)}
          </div>

          <div className="rounded-2xl border border-[#ded4c3] bg-white overflow-hidden shadow-xs">
            <div className="px-5 py-4 border-b border-[#f3ebdd] bg-[#fbfaf6]">
              <h3 className="text-xs font-bold text-[#18231f] uppercase tracking-wider">Active Procurement Deficit Registry</h3>
            </div>
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#fbfaf6] text-[#68756e] font-bold border-b border-[#ded4c3] uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Component SKU</th>
                  <th className="px-6 py-3.5">Details</th>
                  <th className="px-6 py-3.5 text-center">Procure Route</th>
                  <th className="px-6 py-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#efe7d8]">
                {businessData.workItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[#fbfaf6]/50">
                    <td className="px-6 py-3.5 font-bold text-[#202a25]">{item.title}</td>
                    <td className="px-6 py-3.5 text-[#53645c]">{item.description}</td>
                    <td className="px-6 py-3.5 text-center font-mono font-bold text-[#1f806f]">{item.status}</td>
                    <td className="px-6 py-3.5 text-center">
                      <span className="inline-flex rounded px-2 py-0.5 text-[9px] font-bold bg-red-50 text-red-700 border border-red-200">Restock Needed</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }
  }

  // 3. MANUFACTURING PAGES
  if (role === "manufacturing") {
    if (section === "work-orders") {
      const durationChartData = businessData.workItems.slice(0, 6).map(item => {
        const [, durationStr] = item.description.split(" / ");
        const duration = Number(durationStr?.replace(/[^0-9]/g, "") || 0);
        return {
          name: item.title.slice(0, 10),
          duration
        };
      });

      return (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {renderKPI("Active Operations", businessData.metrics[0].value, "Work orders scheduled", <Factory className="size-5" />)}
            {renderKPI("Planned Capacity Time", `${businessData.metrics[1].value} Min`, "Allocated shop floor minutes", <Clock className="size-5" />)}
            {renderKPI("Pending Queue", businessData.metrics[2].value, "Jobs waiting material release", <Layers className="size-5" />)}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-[#ded4c3] bg-white p-5 shadow-xs">
              <h3 className="text-xs font-bold text-[#18231f] uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <Clock className="size-4 text-[#1f806f]" /> Work Center Duration load
              </h3>
              <div className="h-64 w-full">
                {durationChartData.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-xs text-[#53645c]">Shop floor idle</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={durationChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#efe7d8" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#53645c" }} />
                      <YAxis tick={{ fontSize: 10, fill: "#53645c" }} />
                      <Tooltip content={renderTooltip} />
                      <Bar dataKey="duration" name="Duration (Mins)" fill="#1f806f" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-[#ded4c3] bg-white p-5 shadow-xs">
              <h3 className="text-xs font-bold text-[#18231f] uppercase tracking-wider mb-4">Operations Directives</h3>
              <div className="space-y-3.5 text-xs text-[#53645c]">
                <p>Verify machine calibration parameters before starting Wood Shaping and Sanding steps.</p>
                <p>Assembly line supervisors must log work order completion values on the tablet panels immediately.</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#ded4c3] bg-white overflow-hidden shadow-xs">
            <div className="px-5 py-4 border-b border-[#f3ebdd] bg-[#fbfaf6]">
              <h3 className="text-xs font-bold text-[#18231f] uppercase tracking-wider">Shop Floor Operations Ledger</h3>
            </div>
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#fbfaf6] text-[#68756e] font-bold border-b border-[#ded4c3] uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Operation step</th>
                  <th className="px-6 py-3.5">MO Ref & Duration</th>
                  <th className="px-6 py-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#efe7d8]">
                {businessData.workItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[#fbfaf6]/50">
                    <td className="px-6 py-3.5 font-bold text-[#202a25]">{item.title}</td>
                    <td className="px-6 py-3.5 text-[#53645c]">{item.description}</td>
                    <td className="px-6 py-3.5 text-center">
                      <StatusBadge status={item.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    if (section === "material-readiness") {
      return (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {renderKPI("Raw Material Catalog", businessData.metrics[0].value, "Tracked recipe items", <Package className="size-5" />)}
            {renderKPI("Material Shortages", businessData.metrics[1].value, "Deficit raw components", <AlertTriangle className="size-5 text-red-600" />)}
            {renderKPI("Ready MO Run Plans", businessData.metrics[2].value, "Orders ready to launch", <Play className="size-5 text-emerald-600" />)}
          </div>

          <div className="rounded-2xl border border-[#ded4c3] bg-white overflow-hidden shadow-xs">
            <div className="px-5 py-4 border-b border-[#f3ebdd] bg-[#fbfaf6]">
              <h3 className="text-xs font-bold text-[#18231f] uppercase tracking-wider">Production Material Allocation Registry</h3>
            </div>
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#fbfaf6] text-[#68756e] font-bold border-b border-[#ded4c3] uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Material SKU</th>
                  <th className="px-6 py-3.5">Specification</th>
                  <th className="px-6 py-3.5 text-center">Shortage Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#efe7d8]">
                {businessData.workItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[#fbfaf6]/50">
                    <td className="px-6 py-3.5 font-bold text-[#202a25]">{item.title}</td>
                    <td className="px-6 py-3.5 text-[#53645c]">{item.description}</td>
                    <td className="px-6 py-3.5 text-center">
                      <StatusBadge status={item.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    if (section === "completion-queue") {
      return (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {renderKPI("Pending MO runs", businessData.metrics[0].value, "Manufacturing orders in queue", <Layers className="size-5" />)}
            {renderKPI("Pending Operations", businessData.metrics[1].value, "Operations remaining", <Clock className="size-5" />)}
            {renderKPI("Yield Output Completed", businessData.metrics[2].value, "Finished runs", <CheckCircle2 className="size-5 text-emerald-600" />)}
          </div>

          <div className="rounded-2xl border border-[#ded4c3] bg-white overflow-hidden shadow-xs">
            <div className="px-5 py-4 border-b border-[#f3ebdd] bg-[#fbfaf6]">
              <h3 className="text-xs font-bold text-[#18231f] uppercase tracking-wider">Active Manufacturing Queue</h3>
            </div>
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#fbfaf6] text-[#68756e] font-bold border-b border-[#ded4c3] uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">MO Number</th>
                  <th className="px-6 py-3.5">Product & Target Quantity</th>
                  <th className="px-6 py-3.5 text-center">Fulfillment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#efe7d8]">
                {businessData.workItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[#fbfaf6]/50">
                    <td className="px-6 py-3.5 font-bold font-mono text-[#1f806f]">{item.title}</td>
                    <td className="px-6 py-3.5 font-semibold text-[#202a25]">{item.description}</td>
                    <td className="px-6 py-3.5 text-center">
                      <StatusBadge status={item.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }
  }

  // 4. INVENTORY PAGES
  if (role === "inventory") {
    if (section === "reserved-stock") {
      const reservationChartData = businessData.workItems.map(item => {
        const [, availStr] = item.description.split(" / ");
        const reserved = Number(item.status.replace(/[^0-9]/g, "") || 0);
        const available = Number(availStr?.replace(/[^0-9]/g, "") || 0);
        return {
          name: item.title.slice(0, 10),
          reserved,
          available
        };
      });

      return (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {renderKPI("Committed Items", businessData.metrics[0].value, "Products with reservations", <Layers className="size-5" />)}
            {renderKPI("Total Reserved Units", businessData.metrics[1].value, "Locked units across catalog", <Package className="size-5" />)}
            {renderKPI("Fulfillment Demand Queue", businessData.metrics[2].value, "Open sales orders waiting", <ShoppingCart className="size-5" />)}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-[#ded4c3] bg-white p-5 shadow-xs">
              <h3 className="text-xs font-bold text-[#18231f] uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <Layers className="size-4 text-teal-600" /> Reserved vs Available Levels
              </h3>
              <div className="h-64 w-full">
                {reservationChartData.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-xs text-[#53645c]">No reserved stock</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reservationChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#efe7d8" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#53645c" }} />
                      <YAxis tick={{ fontSize: 10, fill: "#53645c" }} />
                      <Tooltip content={renderTooltip} />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <Bar dataKey="reserved" name="Reserved" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="available" name="Available" fill="#1f806f" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-[#ded4c3] bg-white p-5 shadow-xs">
              <h3 className="text-xs font-bold text-[#18231f] uppercase tracking-wider mb-4">Stock Locking Guidelines</h3>
              <div className="space-y-3.5 text-xs text-[#53645c] leading-relaxed">
                <p>Reservations bind on hand quantities to confirmed sales orders, preventing duplicate delivery commitments.</p>
                <p>Releasing or cancelling sales orders auto-unlocks reserved stock back to the available warehouse pool.</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#ded4c3] bg-white overflow-hidden shadow-xs">
            <div className="px-5 py-4 border-b border-[#f3ebdd] bg-[#fbfaf6]">
              <h3 className="text-xs font-bold text-[#18231f] uppercase tracking-wider">Active Inventory Commitments</h3>
            </div>
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#fbfaf6] text-[#68756e] font-bold border-b border-[#ded4c3] uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Product catalog item</th>
                  <th className="px-6 py-3.5">Available Stock Position</th>
                  <th className="px-6 py-3.5 text-center">Reserved Quantity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#efe7d8]">
                {businessData.workItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[#fbfaf6]/50">
                    <td className="px-6 py-3.5 font-bold text-[#202a25]">{item.title}</td>
                    <td className="px-6 py-3.5 text-[#53645c]">{item.description}</td>
                    <td className="px-6 py-3.5 text-center font-bold text-amber-600 font-mono">{item.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    if (section === "receive-materials") {
      return (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {renderKPI("Material receipts", businessData.metrics[0].value, "PO shipments checked in", <Warehouse className="size-5" />)}
            {renderKPI("Expected Docks POs", businessData.metrics[1].value, "Awaiting supplier release", <Clock className="size-5" />)}
            {renderKPI("Incoming Units", businessData.metrics[2].value, "Units in PO lines", <Truck className="size-5" />)}
          </div>

          <div className="rounded-2xl border border-[#ded4c3] bg-white overflow-hidden shadow-xs">
            <div className="px-5 py-4 border-b border-[#f3ebdd] bg-[#fbfaf6]">
              <h3 className="text-xs font-bold text-[#18231f] uppercase tracking-wider">Warehouse Material Receipt Logs</h3>
            </div>
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#fbfaf6] text-[#68756e] font-bold border-b border-[#ded4c3] uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Material item</th>
                  <th className="px-6 py-3.5">Supplier PO Ref & Details</th>
                  <th className="px-6 py-3.5 text-center">Dock Ingestion Quantity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#efe7d8]">
                {businessData.workItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[#fbfaf6]/50">
                    <td className="px-6 py-3.5 font-bold text-[#202a25]">{item.title}</td>
                    <td className="px-6 py-3.5 text-[#53645c]">{item.description}</td>
                    <td className="px-6 py-3.5 text-center font-bold text-emerald-700 font-mono">{item.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    if (section === "deliver-products") {
      return (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {renderKPI("Completed deliveries", businessData.metrics[0].value, "SO shipments dispatched", <Truck className="size-5" />)}
            {renderKPI("Fulfillment Backlog", businessData.metrics[1].value, "Awaiting inventory release", <Layers className="size-5" />)}
            {renderKPI("Deliverable Portfolio", businessData.metrics[2].value, "Finished products", <Package className="size-5" />)}
          </div>

          <div className="rounded-2xl border border-[#ded4c3] bg-white overflow-hidden shadow-xs">
            <div className="px-5 py-4 border-b border-[#f3ebdd] bg-[#fbfaf6]">
              <h3 className="text-xs font-bold text-[#18231f] uppercase tracking-wider">Finished Goods Delivery Logs</h3>
            </div>
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#fbfaf6] text-[#68756e] font-bold border-b border-[#ded4c3] uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Product Item</th>
                  <th className="px-6 py-3.5">Customer SO Ref & Details</th>
                  <th className="px-6 py-3.5 text-center">Fulfillment Quantity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#efe7d8]">
                {businessData.workItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[#fbfaf6]/50">
                    <td className="px-6 py-3.5 font-bold text-[#202a25]">{item.title}</td>
                    <td className="px-6 py-3.5 text-[#53645c]">{item.description}</td>
                    <td className="px-6 py-3.5 text-center font-bold text-blue-600 font-mono">{item.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }
  }

  // 5. OWNER PAGES
  if (role === "owner") {
    if (section === "revenue-view") {
      return (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {renderKPI("Gross Revenue Invoiced", businessData.metrics[0].value, "Total processed sales", <IndianRupee className="size-5" />)}
            {renderKPI("Fulfillment Volume", businessData.metrics[1].value, "Processed SO count", <ShoppingCart className="size-5" />)}
            {renderKPI("Average Transaction Size", businessData.metrics[2].value, "Average SO value", <TrendingUp className="size-5" />)}
          </div>

          <div className="rounded-2xl border border-[#ded4c3] bg-white overflow-hidden shadow-xs">
            <div className="px-5 py-4 border-b border-[#f3ebdd] bg-[#fbfaf6]">
              <h3 className="text-xs font-bold text-[#18231f] uppercase tracking-wider">Revenue Transaction Ledger</h3>
            </div>
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#fbfaf6] text-[#68756e] font-bold border-b border-[#ded4c3] uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Order Number</th>
                  <th className="px-6 py-3.5">Customer & Items</th>
                  <th className="px-6 py-3.5 text-center">Transaction State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#efe7d8]">
                {businessData.workItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[#fbfaf6]/50">
                    <td className="px-6 py-3.5 font-bold font-mono text-[#1f806f]">{item.title}</td>
                    <td className="px-6 py-3.5 font-semibold text-[#202a25]">{item.description}</td>
                    <td className="px-6 py-3.5 text-center">
                      <StatusBadge status={item.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    if (section === "product-portfolio") {
      return (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {renderKPI("Active Portfolio", businessData.metrics[0].value, "Total products managed", <Package className="size-5" />)}
            {renderKPI("Manufacturing Recipes", businessData.metrics[1].value, "Bill of Materials active", <Factory className="size-5" />)}
            {renderKPI("Purchased components", businessData.metrics[2].value, "Vendor components bought", <Warehouse className="size-5" />)}
          </div>

          <div className="rounded-2xl border border-[#ded4c3] bg-white overflow-hidden shadow-xs">
            <div className="px-5 py-4 border-b border-[#f3ebdd] bg-[#fbfaf6]">
              <h3 className="text-xs font-bold text-[#18231f] uppercase tracking-wider">Portfolio Specification Registry</h3>
            </div>
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#fbfaf6] text-[#68756e] font-bold border-b border-[#ded4c3] uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Product Identifier</th>
                  <th className="px-6 py-3.5">Details</th>
                  <th className="px-6 py-3.5 text-center">Procurement Strategy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#efe7d8]">
                {businessData.workItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[#fbfaf6]/50">
                    <td className="px-6 py-3.5 font-bold text-[#202a25]">{item.title}</td>
                    <td className="px-6 py-3.5 text-[#53645c]">{item.description}</td>
                    <td className="px-6 py-3.5 text-center font-mono font-bold text-[#1f806f]">{item.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    if (section === "stock-risk") {
      return (
        <div className="space-y-6">
          {renderAttentionBox(
            "Inventory Disruption Warning",
            "Several components are below safety thresholds, risking production runs.",
            "View Shortages",
            "/dashboard/sales/shortages"
          )}

          <div className="grid gap-4 sm:grid-cols-3">
            {renderKPI("At-Risk Products", businessData.metrics[0].value, "Items at Safety Limits", <AlertTriangle className="size-5 text-red-600" />)}
            {renderKPI("Locked Reservations", businessData.metrics[1].value, "Reserved units locked to orders", <Layers className="size-5" />)}
            {renderKPI("Pending Customer Demand", businessData.metrics[2].value, "Fulfillment queue backlog", <ShoppingCart className="size-5" />)}
          </div>

          <div className="rounded-2xl border border-[#ded4c3] bg-white overflow-hidden shadow-xs">
            <div className="px-5 py-4 border-b border-[#f3ebdd] bg-[#fbfaf6]">
              <h3 className="text-xs font-bold text-[#18231f] uppercase tracking-wider">At-Risk Material Positions</h3>
            </div>
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#fbfaf6] text-[#68756e] font-bold border-b border-[#ded4c3] uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Component SKU</th>
                  <th className="px-6 py-3.5">Specification</th>
                  <th className="px-6 py-3.5 text-center">Shortage Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#efe7d8]">
                {businessData.workItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[#fbfaf6]/50">
                    <td className="px-6 py-3.5 font-bold text-[#202a25]">{item.title}</td>
                    <td className="px-6 py-3.5 text-[#53645c]">{item.description}</td>
                    <td className="px-6 py-3.5 text-center">
                      <span className="inline-flex rounded px-2 py-0.5 text-[9px] font-bold bg-red-50 text-red-700 border border-red-200">Stock Risk</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    if (section === "production-load") {
      return (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {renderKPI("Production Runs", businessData.metrics[0].value, "Active manufacturing orders", <Factory className="size-5" />)}
            {renderKPI("Open Operations Steps", businessData.metrics[1].value, "Backlogged work orders", <Clock className="size-5" />)}
            {renderKPI("Capacity Allocated", `${businessData.metrics[2].value} Min`, "Total work minutes scheduled", <Layers className="size-5" />)}
          </div>

          <div className="rounded-2xl border border-[#ded4c3] bg-white overflow-hidden shadow-xs">
            <div className="px-5 py-4 border-b border-[#f3ebdd] bg-[#fbfaf6]">
              <h3 className="text-xs font-bold text-[#18231f] uppercase tracking-wider">Production Backlog Queue</h3>
            </div>
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#fbfaf6] text-[#68756e] font-bold border-b border-[#ded4c3] uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">MO ID</th>
                  <th className="px-6 py-3.5">Details</th>
                  <th className="px-6 py-3.5 text-center">Fulfillment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#efe7d8]">
                {businessData.workItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[#fbfaf6]/50">
                    <td className="px-6 py-3.5 font-bold font-mono text-[#1f806f]">{item.title}</td>
                    <td className="px-6 py-3.5 text-[#53645c]">{item.description}</td>
                    <td className="px-6 py-3.5 text-center">
                      <StatusBadge status={item.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    if (section === "delayed-orders") {
      return (
        <div className="space-y-6">
          {renderAttentionBox(
            "Operational Delays Detected",
            "Order progression halted due to material stockout deficits.",
            "Verify Warehouse Levels",
            "/dashboard/inventory/on-hand-stock"
          )}

          <div className="grid gap-4 sm:grid-cols-3">
            {renderKPI("Delayed Sales Orders", businessData.metrics[0].value, "Open customer orders", <ShoppingCart className="size-5" />)}
            {renderKPI("Stalled Manufacturing MOs", businessData.metrics[1].value, "Orders blocked waiting components", <Factory className="size-5" />)}
            {renderKPI("Open Procurement POs", businessData.metrics[2].value, "Purchase requests dispatched", <Layers className="size-5" />)}
          </div>

          <div className="rounded-2xl border border-[#ded4c3] bg-white overflow-hidden shadow-xs">
            <div className="px-5 py-4 border-b border-[#f3ebdd] bg-[#fbfaf6]">
              <h3 className="text-xs font-bold text-[#18231f] uppercase tracking-wider">Delayed Document Backlog</h3>
            </div>
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#fbfaf6] text-[#68756e] font-bold border-b border-[#ded4c3] uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Reference ID</th>
                  <th className="px-6 py-3.5">Specifications</th>
                  <th className="px-6 py-3.5 text-center">Fulfillment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#efe7d8]">
                {businessData.workItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[#fbfaf6]/50">
                    <td className="px-6 py-3.5 font-bold font-mono text-[#1f806f]">{item.title}</td>
                    <td className="px-6 py-3.5 text-[#53645c]">{item.description}</td>
                    <td className="px-6 py-3.5 text-center">
                      <StatusBadge status={item.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }
  }

  // 6. ADMIN PAGES
  if (role === "admin") {
    if (section === "permissions") {
      return (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {renderKPI("Access Roles", businessData.metrics[0].value, "Configured responsibilities", <Shield className="size-5 text-[#1f806f]" />)}
            {renderKPI("Assigned Accounts", businessData.metrics[1].value, "Assigned user accounts", <Users className="size-5" />)}
            {renderKPI("Pending Assignment", businessData.metrics[2].value, "Users awaiting verification", <HelpCircle className="size-5" />)}
          </div>

          <div className="rounded-2xl border border-[#ded4c3] bg-white overflow-hidden shadow-xs">
            <div className="px-5 py-4 border-b border-[#f3ebdd] bg-[#fbfaf6]">
              <h3 className="text-xs font-bold text-[#18231f] uppercase tracking-wider">System Access Privileges Matrix</h3>
            </div>
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#fbfaf6] text-[#68756e] font-bold border-b border-[#ded4c3] uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">System access role</th>
                  <th className="px-6 py-3.5">Functional privileges description</th>
                  <th className="px-6 py-3.5 text-center">Module scope status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#efe7d8]">
                {businessData.workItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[#fbfaf6]/50">
                    <td className="px-6 py-3.5 font-bold text-[#202a25]">{item.title}</td>
                    <td className="px-6 py-3.5 text-[#53645c]">{item.description}</td>
                    <td className="px-6 py-3.5 text-center">
                      <span className="inline-flex rounded px-2.5 py-1 text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">ACTIVE SCOPE</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    if (section === "system-settings") {
      return (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {renderKPI("Enabled Modules", businessData.metrics[0].value, "Active business areas", <Layers className="size-5" />)}
            {renderKPI("Configured Products", businessData.metrics[1].value, "Active catalog records", <Package className="size-5" />)}
            {renderKPI("User Accounts", businessData.metrics[2].value, "Active logins count", <Users className="size-5" />)}
          </div>

          <div className="rounded-2xl border border-[#ded4c3] bg-white overflow-hidden shadow-xs">
            <div className="px-5 py-4 border-b border-[#f3ebdd] bg-[#fbfaf6]">
              <h3 className="text-xs font-bold text-[#18231f] uppercase tracking-wider">Organization Setting Variables</h3>
            </div>
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#fbfaf6] text-[#68756e] font-bold border-b border-[#ded4c3] uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Configuration parameter</th>
                  <th className="px-6 py-3.5">Active value settings</th>
                  <th className="px-6 py-3.5 text-center">Parameter state</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#efe7d8]">
                {businessData.workItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[#fbfaf6]/50">
                    <td className="px-6 py-3.5 font-bold text-[#202a25]">{item.title}</td>
                    <td className="px-6 py-3.5 text-[#53645c]">{item.description}</td>
                    <td className="px-6 py-3.5 text-center font-mono font-bold text-[#1f806f]">{item.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    if (section === "all-modules") {
      return (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {renderKPI("Modular scope", businessData.metrics[0].value, "Active modules configured", <Layers className="size-5" />)}
            {renderKPI("Backlog logs", businessData.metrics[1].value, "Documents processing", <FileText className="size-5" />)}
            {renderKPI("System operations", businessData.metrics[2].value, "Total stock movements logged", <Activity className="size-5" />)}
          </div>

          <div className="rounded-2xl border border-[#ded4c3] bg-white overflow-hidden shadow-xs">
            <div className="px-5 py-4 border-b border-[#f3ebdd] bg-[#fbfaf6]">
              <h3 className="text-xs font-bold text-[#18231f] uppercase tracking-wider">System Modules Registry</h3>
            </div>
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#fbfaf6] text-[#68756e] font-bold border-b border-[#ded4c3] uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Module name</th>
                  <th className="px-6 py-3.5">Backlog count</th>
                  <th className="px-6 py-3.5">Operational directive</th>
                  <th className="px-6 py-3.5 text-center">Fulfillment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#efe7d8]">
                {businessData.workItems.map((item, idx) => {
                  const [countStr, desc] = item.description.split(" : ");
                  return (
                    <tr key={idx} className="hover:bg-[#fbfaf6]/50">
                      <td className="px-6 py-3.5 font-bold text-[#202a25]">{item.title}</td>
                      <td className="px-6 py-3.5 text-xs text-[#53645c] font-mono font-bold">{countStr}</td>
                      <td className="px-6 py-3.5 text-xs text-[#53645c]">{desc}</td>
                      <td className="px-6 py-3.5 text-center">
                        <StatusBadge status={item.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      );
    }
  }

  // Fallback default renderer
  return (
    <div className="rounded-2xl border border-dashed border-[#ded4c3] bg-white p-12 text-center shadow-xs">
      <AlertTriangle className="size-8 text-[#f59e0b] mx-auto mb-3 animate-pulse" />
      <h3 className="text-base font-bold text-[#18231f] uppercase tracking-wider">Unconfigured Page Layout</h3>
      <p className="text-xs text-[#53645c] mt-1">This subpage parameters ({key}) could not load custom charts.</p>
    </div>
  );
}
