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
  TrendingUp, 
  ShoppingCart, 
  Package, 
  Users, 
  Factory, 
  Warehouse, 
  IndianRupee, 
  FileText, 
  AlertTriangle,
  Clock,
  CheckCircle2,
  Play,
  ArrowUpRight,
  TrendingDown,
  Sparkles,
  Zap,
  Activity,
  Layers,
  Percent
} from "lucide-react";

// Harmonious SaaS colors
const COLORS = ["#1f806f", "#3b82f6", "#6366f1", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#ec4899"];

type DashboardChartsProps = {
  role: string;
  data: any;
};

export default function DashboardCharts({ role, data }: DashboardChartsProps) {
  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center p-12 rounded-2xl border border-dashed border-[#ded4c3] bg-white text-center shadow-xs">
        <AlertTriangle className="size-10 text-amber-500 mb-3 animate-pulse" />
        <h3 className="text-lg font-semibold text-[#18231f]">No Analytics Data Available</h3>
        <p className="mt-1 text-sm text-[#53645c]">Run some operations to populate analytics charts.</p>
      </div>
    );
  }

  // Common styles
  const chartCardStyle = "rounded-2xl border border-[#ded4c3] bg-white p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-all duration-300";
  const labelStyle = "text-[10px] font-bold text-[#68756e] uppercase tracking-wider mb-1";
  const titleStyle = "text-lg font-bold text-[#18231f] mb-4 flex items-center gap-1.5";

  const renderTooltip = (props: any) => {
    const { active, payload } = props;
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#18231f] text-white p-3.5 rounded-xl shadow-xl text-xs font-semibold border border-white/10">
          <p className="font-bold border-b border-white/20 pb-1 mb-1.5 capitalize">{payload[0].payload.name || payload[0].payload.month || payload[0].payload.date || payload[0].payload.status || payload[0].payload.role}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="flex items-center gap-2 mt-1">
              <span>{entry.name}:</span>
              <span className="font-mono">
                {typeof entry.value === "number" && 
                 (entry.name.toLowerCase().includes("revenue") || 
                  entry.name.toLowerCase().includes("cost") || 
                  entry.name.toLowerCase().includes("spend") || 
                  entry.name.toLowerCase().includes("sales") ||
                  entry.name.toLowerCase().includes("purchases") ||
                  entry.name.toLowerCase().includes("value")) 
                  ? `₹${entry.value.toLocaleString()}` 
                  : entry.value}
              </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderKPI = (title: string, value: string | number, desc: string, icon: React.ReactNode, trend?: { value: string; up: boolean }) => (
    <div className="group rounded-2xl border border-[#ded4c3] bg-white p-5 shadow-xs flex items-center justify-between hover:shadow-md hover:border-[#1f806f]/40 transition-all duration-300">
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[#68756e]">{title}</p>
        <p className="mt-2 text-2xl font-bold text-[#18231f] tracking-tight truncate group-hover:text-[#1f806f] transition-colors">{value}</p>
        <div className="mt-1.5 flex items-center gap-1.5">
          {trend && (
            <span className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-bold ${trend.up ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
              {trend.up ? <ArrowUpRight className="size-3" /> : <TrendingDown className="size-3" />}
              {trend.value}
            </span>
          )}
          <p className="text-[10px] text-[#53645c] truncate">{desc}</p>
        </div>
      </div>
      <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#eef7f3] border border-[#c9dbd5] text-[#1f806f] group-hover:bg-[#1f806f] group-hover:text-white transition-all duration-300">
        {icon}
      </span>
    </div>
  );

  // Common Right Aside Components
  const renderAlertsSection = (alerts: Array<{ title: string; desc: string; type: "error" | "warning" | "success" }>) => (
    <div className="rounded-2xl border border-[#ded4c3] bg-white p-5 shadow-xs">
      <h3 className="text-sm font-bold text-[#18231f] uppercase tracking-wider border-b border-[#f3ebdd] pb-3 mb-3 flex items-center gap-1.5">
        <AlertTriangle className="size-4 text-amber-500" />
        System Alerts
      </h3>
      <div className="space-y-3">
        {alerts.map((alert, i) => (
          <div key={i} className="flex gap-2.5 items-start text-xs border-b border-[#fbfaf6] pb-3 last:border-b-0 last:pb-0">
            <span className={`mt-0.5 rounded-full p-0.5 shrink-0 ${alert.type === "error" ? "bg-red-50 text-red-600" : alert.type === "warning" ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"}`}>
              {alert.type === "error" ? <AlertTriangle className="size-3.5" /> : alert.type === "warning" ? <AlertTriangle className="size-3.5" /> : <CheckCircle2 className="size-3.5" />}
            </span>
            <div>
              <p className="font-bold text-[#202a25]">{alert.title}</p>
              <p className="text-[#53645c] mt-0.5 leading-relaxed">{alert.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTimelineSection = (timeline: Array<{ time: string; title: string; desc: string }>) => (
    <div className="rounded-2xl border border-[#ded4c3] bg-white p-5 shadow-xs">
      <h3 className="text-sm font-bold text-[#18231f] uppercase tracking-wider border-b border-[#f3ebdd] pb-3 mb-3 flex items-center gap-1.5">
        <Clock className="size-4 text-[#1f806f]" />
        Activity Timeline
      </h3>
      <div className="relative pl-4 border-l border-[#ded4c3] space-y-4">
        {timeline.map((item, i) => (
          <div key={i} className="relative text-xs">
            <span className="absolute -left-[20.5px] top-1 flex size-2.5 items-center justify-center rounded-full bg-[#1f806f] ring-4 ring-white" />
            <span className="text-[10px] font-bold text-[#68756e]">{item.time}</span>
            <p className="font-bold text-[#202a25] mt-0.5">{item.title}</p>
            <p className="text-[#53645c] mt-0.5 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );

  if (role === "admin") {
    const { ordersByStatus, monthlyRevenue, inventoryValue, usersByRole } = data;
    const totalRevenue = monthlyRevenue.reduce((sum: number, r: any) => sum + r.revenue, 0);
    const totalUsers = usersByRole.reduce((sum: number, r: any) => sum + r.count, 0);
    const totalStockVal = inventoryValue.reduce((sum: number, r: any) => sum + r.value, 0);

    const adminAlerts = [
      { title: "Unassigned Permissions", desc: "2 guest users need access permissions mapped.", type: "warning" as const },
      { title: "Backup Succeeded", desc: "Database automated snapshot completed at 02:00 AM.", type: "success" as const },
    ];

    const adminTimeline = [
      { time: "10:30 AM", title: "User Added", desc: "New manufacturing team accounts configured by Admin." },
      { time: "09:15 AM", title: "Configuration Updated", desc: "Switched procurement rules to FIFO mode." },
    ];

    return (
      <div className="grid gap-6 xl:grid-cols-[1fr_320px] mt-6">
        <div className="space-y-6">
          {/* Executive KPIs */}
          <div className="grid gap-4 sm:grid-cols-3">
            {renderKPI("Total Users", totalUsers, "Configured accounts", <Users className="size-5" />, { value: "+12%", up: true })}
            {renderKPI("Revenue Generated", `₹${totalRevenue.toLocaleString()}`, "Delivered invoices total", <IndianRupee className="size-5" />, { value: "+8.4%", up: true })}
            {renderKPI("Inventory Assets", `₹${totalStockVal.toLocaleString()}`, "Valuation of top products", <Package className="size-5" />, { value: "-1.5%", up: false })}
          </div>

          {/* Charts */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className={chartCardStyle}>
              <div>
                <p className={labelStyle}>Operations Overview</p>
                <h2 className={titleStyle}><ShoppingCart className="size-4 text-[#1f806f]" /> Orders By Status</h2>
              </div>
              <div className="h-64 w-full">
                {ordersByStatus.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-[#53645c]">No orders placed yet</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ordersByStatus}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#efe7d8" />
                      <XAxis dataKey="status" tick={{ fill: '#53645c', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#53645c', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip content={renderTooltip} cursor={{ fill: '#fbfaf6' }} />
                      <Bar dataKey="count" name="Orders Count" fill="#1f806f" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className={chartCardStyle}>
              <div>
                <p className={labelStyle}>Sales Velocity</p>
                <h2 className={titleStyle}><TrendingUp className="size-4 text-blue-500" /> Monthly Revenue Trend</h2>
              </div>
              <div className="h-64 w-full">
                {monthlyRevenue.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-[#53645c]">No transactions recorded yet</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyRevenue}>
                      <defs>
                        <linearGradient id="adminRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#efe7d8" />
                      <XAxis dataKey="month" tick={{ fill: '#53645c', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#53645c', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip content={renderTooltip} />
                      <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#adminRevenueGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className={chartCardStyle}>
              <div>
                <p className={labelStyle}>Inventory Valuation</p>
                <h2 className={titleStyle}><Warehouse className="size-4 text-indigo-500" /> Value (Top Products)</h2>
              </div>
              <div className="h-64 w-full">
                {inventoryValue.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-[#53645c]">Inventory is empty</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={inventoryValue} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#efe7d8" />
                      <XAxis type="number" tick={{ fill: '#53645c', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis dataKey="name" type="category" width={80} tick={{ fill: '#53645c', fontSize: 9 }} axisLine={false} tickLine={false} />
                      <Tooltip content={renderTooltip} cursor={{ fill: '#fbfaf6' }} />
                      <Bar dataKey="value" name="Valuation" fill="#6366f1" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className={chartCardStyle}>
              <div>
                <p className={labelStyle}>User Access Management</p>
                <h2 className={titleStyle}><Users className="size-4 text-amber-500" /> Users By Role</h2>
              </div>
              <div className="h-64 w-full flex items-center justify-center">
                {usersByRole.length === 0 ? (
                  <div className="text-sm text-[#53645c]">No roles configured</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={usersByRole}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="count"
                        nameKey="role"
                      >
                        {usersByRole.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={renderTooltip} />
                      <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '11px', color: '#53645c' }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right aside */}
        <aside className="space-y-6">
          {renderAlertsSection(adminAlerts)}
          {renderTimelineSection(adminTimeline)}
        </aside>
      </div>
    );
  }

  if (role === "sales") {
    const { ordersThisMonth, deliveredVsPending, revenueTrend } = data;
    const salesTotal = revenueTrend.reduce((sum: number, r: any) => sum + r.revenue, 0);
    const orderCount = ordersThisMonth.reduce((sum: number, r: any) => sum + r.count, 0);

    const salesAlerts = [
      { title: "Delivery Blocked", desc: "Sales Order SO003 lacks stock reservation of Raw Wood.", type: "error" as const },
      { title: "High Demand Notice", desc: "Finished Table has increased sales velocity by 40% this week.", type: "success" as const },
    ];

    const salesTimeline = [
      { time: "04:00 PM", title: "Order Delivered", desc: "SO001 dispatched to customer ABC Enterprises." },
      { time: "02:10 PM", title: "New Order Drafted", desc: "SO005 created for customer Furniture Depot." },
    ];

    return (
      <div className="grid gap-6 xl:grid-cols-[1fr_320px] mt-6">
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {renderKPI("Total Orders (30d)", orderCount, "Order count velocity", <ShoppingCart className="size-5" />, { value: "+18%", up: true })}
            {renderKPI("Delivered Sales Value", `₹${salesTotal.toLocaleString()}`, "Consolidated delivered invoicing", <IndianRupee className="size-5" />, { value: "+15.2%", up: true })}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className={chartCardStyle}>
              <div>
                <p className={labelStyle}>Sales Velocity</p>
                <h2 className={titleStyle}><TrendingUp className="size-4 text-[#1f806f]" /> Daily Orders placed</h2>
              </div>
              <div className="h-64 w-full">
                {ordersThisMonth.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-[#53645c]">No sales recorded this month</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={ordersThisMonth}>
                      <defs>
                        <linearGradient id="salesOrdersGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#1f806f" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#1f806f" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#efe7d8" />
                      <XAxis dataKey="date" tick={{ fill: '#53645c', fontSize: 9 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#53645c', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip content={renderTooltip} />
                      <Area type="monotone" dataKey="count" name="Sales Volume" stroke="#1f806f" strokeWidth={3} fillOpacity={1} fill="url(#salesOrdersGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className={chartCardStyle}>
              <div>
                <p className={labelStyle}>Fulfillment Pipeline</p>
                <h2 className={titleStyle}><Package className="size-4 text-[#3b82f6]" /> Delivered vs Pending Orders</h2>
              </div>
              <div className="h-64 w-full">
                {deliveredVsPending.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-[#53645c]">No orders found</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={deliveredVsPending}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        nameKey="name"
                      >
                        {deliveredVsPending.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={renderTooltip} />
                      <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '11px', color: '#53645c' }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className={chartCardStyle + " md:col-span-2"}>
              <div>
                <p className={labelStyle}>Invoicing Trend</p>
                <h2 className={titleStyle}><IndianRupee className="size-4 text-[#10b981]" /> Revenue Growth</h2>
              </div>
              <div className="h-64 w-full">
                {revenueTrend.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-[#53645c]">No delivered revenue data</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueTrend}>
                      <defs>
                        <linearGradient id="salesRevGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#efe7d8" />
                      <XAxis dataKey="month" tick={{ fill: '#53645c', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#53645c', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip content={renderTooltip} />
                      <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#salesRevGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right aside */}
        <aside className="space-y-6">
          {renderAlertsSection(salesAlerts)}
          {renderTimelineSection(salesTimeline)}
        </aside>
      </div>
    );
  }

  if (role === "purchase") {
    const { purchaseOrdersByStatus, vendorPerformance, monthlyProcurementCost } = data;
    const totalProcurement = monthlyProcurementCost.reduce((sum: number, r: any) => sum + r.cost, 0);
    const topVendor = vendorPerformance[0]?.name || "N/A";

    const purchaseAlerts = [
      { title: "Supplier Delay Warning", desc: "Vendor Timber Woods has a 3-day projected delay on Wood Plank delivery.", type: "error" as const },
      { title: "Price Increase Alert", desc: "Steel Rods cost index has risen by 5% in external markets.", type: "warning" as const },
    ];

    const purchaseTimeline = [
      { time: "11:45 AM", title: "PO Confirmed", desc: "PO002 confirmed by vendor Timber Woods." },
      { time: "08:30 AM", title: "Fulfillment Created", desc: "Procurement engine auto-drafted PO003 for Wood Nails." },
    ];

    return (
      <div className="grid gap-6 xl:grid-cols-[1fr_320px] mt-6">
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {renderKPI("Total Spend Value", `₹${totalProcurement.toLocaleString()}`, "Supplier procurement liability", <IndianRupee className="size-5" />, { value: "+10.2%", up: true })}
            {renderKPI("Primary Vendor", topVendor, "Highest allocated spend partner", <Users className="size-5" />)}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className={chartCardStyle}>
              <div>
                <p className={labelStyle}>Supply Pipeline</p>
                <h2 className={titleStyle}><FileText className="size-4 text-[#1f806f]" /> Procurement Orders by Status</h2>
              </div>
              <div className="h-64 w-full">
                {purchaseOrdersByStatus.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-[#53645c]">No purchase orders created</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={purchaseOrdersByStatus}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#efe7d8" />
                      <XAxis dataKey="status" tick={{ fill: '#53645c', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#53645c', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip content={renderTooltip} cursor={{ fill: '#fbfaf6' }} />
                      <Bar dataKey="count" name="PO Count" fill="#1f806f" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className={chartCardStyle}>
              <div>
                <p className={labelStyle}>Supplier Allocation</p>
                <h2 className={titleStyle}><Users className="size-4 text-amber-500" /> Vendor Spend Distribution</h2>
              </div>
              <div className="h-64 w-full">
                {vendorPerformance.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-[#53645c]">No supplier spend records</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={vendorPerformance} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#efe7d8" />
                      <XAxis type="number" tick={{ fill: '#53645c', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis dataKey="name" type="category" width={80} tick={{ fill: '#53645c', fontSize: 9 }} axisLine={false} tickLine={false} />
                      <Tooltip content={renderTooltip} cursor={{ fill: '#fbfaf6' }} />
                      <Bar dataKey="spend" name="Spend" fill="#f59e0b" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className={chartCardStyle + " md:col-span-2"}>
              <div>
                <p className={labelStyle}>Expense Analysis</p>
                <h2 className={titleStyle}><IndianRupee className="size-4 text-red-500" /> Monthly Spend Trend</h2>
              </div>
              <div className="h-64 w-full">
                {monthlyProcurementCost.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-[#53645c]">No procurement cost transactions</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyProcurementCost}>
                      <defs>
                        <linearGradient id="procureGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#efe7d8" />
                      <XAxis dataKey="month" tick={{ fill: '#53645c', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#53645c', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip content={renderTooltip} />
                      <Area type="monotone" dataKey="cost" name="Spend" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#procureGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right aside */}
        <aside className="space-y-6">
          {renderAlertsSection(purchaseAlerts)}
          {renderTimelineSection(purchaseTimeline)}
        </aside>
      </div>
    );
  }

  if (role === "manufacturing") {
    const { manufacturingOrdersByStatus, productionOutput, materialConsumption } = data;
    const completedMOs = manufacturingOrdersByStatus.find((m: any) => m.status === "COMPLETED")?.count || 0;
    const totalOutput = productionOutput.reduce((sum: number, r: any) => sum + r.output, 0);

    const mfgAlerts = [
      { title: "Material Lock Alert", desc: "MO002 blocked: Waiting for Raw Steel Sheet release.", type: "error" as const },
      { title: "Ready for Launch", desc: "MO003 has all components allocated and is READY to manufacture.", type: "success" as const },
    ];

    const mfgTimeline = [
      { time: "03:15 PM", title: "MO Started", desc: "MO001 transitioned to IN_PROGRESS. Assembly line 1." },
      { time: "11:00 AM", title: "BoM Validated", desc: "Custom Dining Table Bill of Materials structure verified." },
    ];

    return (
      <div className="grid gap-6 xl:grid-cols-[1fr_320px] mt-6">
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {renderKPI("Completed MOs", completedMOs, "Successfully completed runs", <Factory className="size-5" />, { value: "+25%", up: true })}
            {renderKPI("Finished Goods Produced", totalOutput, "Total output units", <Package className="size-5" />, { value: "+12.5%", up: true })}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className={chartCardStyle}>
              <div>
                <p className={labelStyle}>Shop Floor Status</p>
                <h2 className={titleStyle}><Layers className="size-4 text-[#1f806f]" /> Orders By Status</h2>
              </div>
              <div className="h-64 w-full">
                {manufacturingOrdersByStatus.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-[#53645c]">No MOs scheduled</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={manufacturingOrdersByStatus}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="count"
                        nameKey="status"
                      >
                        {manufacturingOrdersByStatus.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={renderTooltip} />
                      <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '11px', color: '#53645c' }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className={chartCardStyle}>
              <div>
                <p className={labelStyle}>Material Waste & Usage</p>
                <h2 className={titleStyle}><Activity className="size-4 text-indigo-500" /> Material Consumption</h2>
              </div>
              <div className="h-64 w-full">
                {materialConsumption.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-[#53645c]">No materials consumed yet</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={materialConsumption}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#efe7d8" />
                      <XAxis dataKey="name" tick={{ fill: '#53645c', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#53645c', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip content={renderTooltip} cursor={{ fill: '#fbfaf6' }} />
                      <Bar dataKey="consumed" name="Quantity Consumed" fill="#6366f1" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className={chartCardStyle + " md:col-span-2"}>
              <div>
                <p className={labelStyle}>Shop Floor Yield</p>
                <h2 className={titleStyle}><TrendingUp className="size-4 text-emerald-500" /> Monthly Production Output</h2>
              </div>
              <div className="h-64 w-full">
                {productionOutput.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-[#53645c]">No finished goods produced yet</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={productionOutput}>
                      <defs>
                        <linearGradient id="mfgOutputGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#efe7d8" />
                      <XAxis dataKey="month" tick={{ fill: '#53645c', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#53645c', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip content={renderTooltip} />
                      <Area type="monotone" dataKey="output" name="Quantity Produced" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#mfgOutputGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right aside */}
        <aside className="space-y-6">
          {renderAlertsSection(mfgAlerts)}
          {renderTimelineSection(mfgTimeline)}
        </aside>
      </div>
    );
  }

  if (role === "inventory") {
    const { topInventoryProducts, lowStockProducts, stockMovementTrend } = data;
    const totalOnHand = topInventoryProducts.reduce((sum: number, r: any) => sum + r.quantity, 0);
    const lowStockCount = lowStockProducts.length;

    const invAlerts = [
      { title: "Low Stock Warning", desc: "Product Steel Rods is below safety stock limit (3 units left).", type: "error" as const },
      { title: "Receipt Expected", desc: "Purchase Order PO002 incoming shipment expected by 05:00 PM.", type: "warning" as const },
    ];

    const invTimeline = [
      { time: "01:00 PM", title: "Delivery Dispatched", desc: "SO001 items released for courier pick-up." },
      { time: "09:45 AM", title: "Materials Received", desc: "100 units of Raw Wood checked-in from PO001." },
    ];

    return (
      <div className="grid gap-6 xl:grid-cols-[1fr_320px] mt-6">
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {renderKPI("Total Items On Hand", totalOnHand, "Total stock items", <Warehouse className="size-5" />, { value: "+8%", up: true })}
            {renderKPI("Low Stock Warnings", lowStockCount, "Products at/below threshold", <AlertTriangle className="size-5" />, { value: "Warning", up: false })}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className={chartCardStyle}>
              <div>
                <p className={labelStyle}>Stock Positions</p>
                <h2 className={titleStyle}><Package className="size-4 text-[#1f806f]" /> Top Inventory Products</h2>
              </div>
              <div className="h-64 w-full">
                {topInventoryProducts.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-[#53645c]">Warehouse inventory is empty</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topInventoryProducts}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#efe7d8" />
                      <XAxis dataKey="name" tick={{ fill: '#53645c', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#53645c', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip content={renderTooltip} cursor={{ fill: '#fbfaf6' }} />
                      <Bar dataKey="quantity" name="On Hand Qty" fill="#1f806f" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className={chartCardStyle}>
              <div>
                <p className={labelStyle}>Replenishment Risk</p>
                <h2 className={titleStyle}><AlertTriangle className="size-4 text-red-500" /> Low Stock Products</h2>
              </div>
              <div className="h-64 w-full">
                {lowStockProducts.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-emerald-700 font-semibold">All products have healthy stock!</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={lowStockProducts} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#efe7d8" />
                      <XAxis type="number" tick={{ fill: '#53645c', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis dataKey="name" type="category" width={80} tick={{ fill: '#53645c', fontSize: 9 }} axisLine={false} tickLine={false} />
                      <Tooltip content={renderTooltip} cursor={{ fill: '#fbfaf6' }} />
                      <Bar dataKey="available" name="Available Qty" fill="#ef4444" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className={chartCardStyle + " md:col-span-2"}>
              <div>
                <p className={labelStyle}>Warehouse Activity</p>
                <h2 className={titleStyle}><Activity className="size-4 text-[#3b82f6]" /> Stock Movement Trend (30d)</h2>
              </div>
              <div className="h-64 w-full">
                {stockMovementTrend.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-[#53645c]">No movements logged recently</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stockMovementTrend}>
                      <defs>
                        <linearGradient id="invMoveGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#efe7d8" />
                      <XAxis dataKey="date" tick={{ fill: '#53645c', fontSize: 9 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#53645c', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip content={renderTooltip} />
                      <Area type="monotone" dataKey="movements" name="Movements Log" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#invMoveGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right aside */}
        <aside className="space-y-6">
          {renderAlertsSection(invAlerts)}
          {renderTimelineSection(invTimeline)}
        </aside>
      </div>
    );
  }

  if (role === "owner") {
    const { revenueTrend, inventoryValueTrend, orderFulfillmentRate, procurementVsSales } = data;
    const totalSales = revenueTrend.reduce((sum: number, r: any) => sum + r.revenue, 0);
    const currentInvValue = inventoryValueTrend[inventoryValueTrend.length - 1]?.value || 0;
    const deliveredCount = orderFulfillmentRate.find((o: any) => o.name === "Delivered")?.value || 0;
    const totalOrderCount = orderFulfillmentRate.reduce((sum: number, o: any) => sum + o.value, 0);
    const rate = totalOrderCount > 0 ? ((deliveredCount / totalOrderCount) * 100).toFixed(0) : "0";

    const ownerAlerts = [
      { title: "Profit Margin Optimal", desc: "Consolidated profit margin expanded by 2.3% this quarter.", type: "success" as const },
      { title: "Procurement Cap Warning", desc: "Spend on Raw Material suppliers is 15% above forecast.", type: "warning" as const },
    ];

    const ownerTimeline = [
      { time: "05:00 PM", title: "Quarterly Audit Lock", desc: "Board reports successfully updated." },
      { time: "12:00 PM", title: "Operations Check", desc: "Total shop floor output exceeded goals by 500 units." },
    ];

    // Executive Insights & Business Health Score
    const operationalRisks = [
      { area: "Supply Chain", risk: "Raw Material shortage", status: "Medium" },
      { area: "Logistics", risk: "Courier delays in Delivery status", status: "Low" },
    ];

    return (
      <div className="grid gap-6 xl:grid-cols-[1fr_320px] mt-6">
        <div className="space-y-6">
          {/* Executive Overview KPIs */}
          <div className="grid gap-4 sm:grid-cols-3">
            {renderKPI("Consolidated Revenue", `₹${totalSales.toLocaleString()}`, "Delivered customer orders value", <IndianRupee className="size-5" />, { value: "+14.6%", up: true })}
            {renderKPI("Warehouse Asset Value", `₹${currentInvValue.toLocaleString()}`, "Valuation of current stock", <Warehouse className="size-5" />, { value: "+4.1%", up: true })}
            {renderKPI("Order Fulfillment Rate", `${rate}%`, "Completed deliveries ratio", <Percent className="size-5" />, { value: `${deliveredCount}/${totalOrderCount}`, up: Number(rate) > 80 })}
          </div>

          {/* Business Health Score & Risks Section */}
          <div className="grid gap-6 md:grid-cols-3">
            {/* Health Score Widget */}
            <div className="rounded-2xl border border-[#ded4c3] bg-gradient-to-br from-teal-950 to-[#1f806f] p-5 text-white shadow-xs flex flex-col justify-between hover:shadow-md transition-all duration-300">
              <div>
                <span className="rounded bg-teal-800/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                  Overall Health
                </span>
                <h3 className="mt-4 text-3xl font-bold">92 / 100</h3>
                <p className="text-xs text-teal-100/80 mt-1 leading-relaxed">
                  The operations are running optimally. Low stock warnings are mitigated by automatic replenishment rules.
                </p>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-teal-800/50 pt-3 text-xs text-teal-200">
                <span>Grade: Excellent</span>
                <span className="flex items-center gap-1 font-bold text-emerald-400">
                  <Sparkles className="size-3.5 fill-emerald-400" /> Auto-Optimized
                </span>
              </div>
            </div>

            {/* AI Executive Insights */}
            <div className="md:col-span-2 rounded-2xl border border-[#ded4c3] bg-white p-5 shadow-xs hover:shadow-md transition-all duration-300">
              <span className="inline-flex items-center gap-1 rounded bg-[#eef7f3] border border-[#c9dbd5] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#1f806f]">
                <Zap className="size-3 fill-[#1f806f] text-[#1f806f]" /> Executive AI Insights
              </span>
              <div className="mt-3 space-y-2.5 text-xs text-[#53645c]">
                <p className="leading-relaxed">
                  💡 <strong>Procurement Efficiency:</strong> Partnering with <strong>Timber Woods</strong> has yielded 12% lower material acquisition costs, but their average receipt time has increased by 1.2 days.
                </p>
                <p className="leading-relaxed">
                  ⚡ <strong>Fulfillment Acceleration:</strong> Manufacturing orders in the completed queue have increased by 20%. Consider launching deliveries for orders currently in <strong>Ready to Deliver</strong> status.
                </p>
              </div>
            </div>
          </div>

          {/* Charts grid */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className={chartCardStyle}>
              <div>
                <p className={labelStyle}>Consolidated Revenue</p>
                <h2 className={titleStyle}><TrendingUp className="size-4 text-[#1f806f]" /> Revenue Performance</h2>
              </div>
              <div className="h-64 w-full">
                {revenueTrend.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-[#53645c]">No completed sales recorded</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueTrend}>
                      <defs>
                        <linearGradient id="ownerRevGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#1f806f" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#1f806f" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#efe7d8" />
                      <XAxis dataKey="month" tick={{ fill: '#53645c', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#53645c', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip content={renderTooltip} />
                      <Area type="monotone" dataKey="revenue" name="Sales Revenue" stroke="#1f806f" strokeWidth={3} fillOpacity={1} fill="url(#ownerRevGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className={chartCardStyle}>
              <div>
                <p className={labelStyle}>Finance Balance</p>
                <h2 className={titleStyle}><Activity className="size-4 text-emerald-500" /> Sales vs Procurement Spend</h2>
              </div>
              <div className="h-64 w-full">
                {procurementVsSales.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-[#53645c]">No billing records</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={procurementVsSales}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#efe7d8" />
                      <XAxis dataKey="month" tick={{ fill: '#53645c', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#53645c', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip content={renderTooltip} cursor={{ fill: '#fbfaf6' }} />
                      <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px', color: '#53645c' }} />
                      <Bar dataKey="sales" name="Sales Revenue" fill="#1f806f" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="purchases" name="Purchases Spend" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right aside */}
        <aside className="space-y-6">
          {renderAlertsSection(ownerAlerts)}
          {renderTimelineSection(ownerTimeline)}
        </aside>
      </div>
    );
  }

  return null;
}
