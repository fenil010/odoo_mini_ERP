"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
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
  AlertTriangle 
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
      <div className="flex flex-col items-center justify-center p-12 rounded-xl border border-dashed border-[#d9cfbd] bg-white text-center">
        <AlertTriangle className="size-10 text-amber-500 mb-3" />
        <h3 className="text-lg font-semibold text-[#18231f]">No Analytics Data Available</h3>
        <p className="mt-1 text-sm text-[#53645c]">Run some operations to populate analytics charts.</p>
      </div>
    );
  }

  // Common styles
  const chartCardStyle = "rounded-xl border border-[#d9cfbd] bg-white p-6 shadow-sm flex flex-col justify-between";
  const labelStyle = "text-sm font-semibold text-[#53645c] mb-1 uppercase tracking-wider";
  const titleStyle = "text-xl font-bold text-[#18231f] mb-4";

  const renderTooltip = (props: any) => {
    const { active, payload } = props;
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#18231f] text-white p-3 rounded-lg shadow-lg text-xs font-medium border border-white/10">
          <p className="font-bold border-b border-white/20 pb-1 mb-1">{payload[0].payload.name || payload[0].payload.month || payload[0].payload.date || payload[0].payload.status || payload[0].payload.role}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {typeof entry.value === "number" && (entry.name.toLowerCase().includes("revenue") || entry.name.toLowerCase().includes("cost") || entry.name.toLowerCase().includes("spend") || entry.name.toLowerCase().includes("value")) ? `₹${entry.value.toLocaleString()}` : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderKPI = (title: string, value: string | number, desc: string, icon: React.ReactNode) => (
    <div className="rounded-xl border border-[#d9cfbd] bg-white p-5 shadow-sm flex items-center justify-between">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#68756e]">{title}</p>
        <p className="mt-2 text-3xl font-bold text-[#18231f] tracking-tight truncate">{value}</p>
        <p className="mt-1 text-xs text-[#53645c] truncate">{desc}</p>
      </div>
      <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#eef7f3] border border-[#c9dbd5] text-[#1f806f]">
        {icon}
      </span>
    </div>
  );

  if (role === "admin") {
    const { ordersByStatus, monthlyRevenue, inventoryValue, usersByRole } = data;

    // Calculate Admin KPIs
    const totalRevenue = monthlyRevenue.reduce((sum: number, r: any) => sum + r.revenue, 0);
    const totalUsers = usersByRole.reduce((sum: number, r: any) => sum + r.count, 0);
    const totalStockVal = inventoryValue.reduce((sum: number, r: any) => sum + r.value, 0);

    return (
      <div className="space-y-6 mt-6">
        {/* KPIs */}
        <div className="grid gap-4 sm:grid-cols-3">
          {renderKPI("Total Users", totalUsers, "Configured accounts", <Users className="size-6" />)}
          {renderKPI("Revenue Generated", `₹${totalRevenue.toLocaleString()}`, "Delivered & confirmed orders", <IndianRupee className="size-6" />)}
          {renderKPI("Inventory Valuation", `₹${totalStockVal.toLocaleString()}`, "Top products warehouse value", <Package className="size-6" />)}
        </div>

        {/* Charts Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Orders By Status */}
          <div className={chartCardStyle}>
            <div>
              <p className={labelStyle}>Operations Overview</p>
              <h2 className={titleStyle}>Orders By Status</h2>
            </div>
            <div className="h-64 w-full">
              {ordersByStatus.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-[#53645c]">No sales orders placed yet</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ordersByStatus}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5dccb" />
                    <XAxis dataKey="status" tick={{ fill: '#53645c', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#53645c', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={renderTooltip} cursor={{ fill: '#fbfaf6' }} />
                    <Bar dataKey="count" name="Orders Count" fill="#1f806f" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Monthly Revenue */}
          <div className={chartCardStyle}>
            <div>
              <p className={labelStyle}>Sales Over Time</p>
              <h2 className={titleStyle}>Monthly Revenue</h2>
            </div>
            <div className="h-64 w-full">
              {monthlyRevenue.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-[#53645c]">No transactions recorded yet</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5dccb" />
                    <XAxis dataKey="month" tick={{ fill: '#53645c', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#53645c', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={renderTooltip} />
                    <Line type="monotone" dataKey="revenue" name="Revenue (₹)" stroke="#3b82f6" strokeWidth={3} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Inventory Value */}
          <div className={chartCardStyle}>
            <div>
              <p className={labelStyle}>Stock Assets</p>
              <h2 className={titleStyle}>Inventory Valuation (Top Products)</h2>
            </div>
            <div className="h-64 w-full">
              {inventoryValue.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-[#53645c]">Inventory is currently empty</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={inventoryValue} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5dccb" />
                    <XAxis type="number" tick={{ fill: '#53645c', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis dataKey="name" type="category" width={80} tick={{ fill: '#53645c', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip content={renderTooltip} cursor={{ fill: '#fbfaf6' }} />
                    <Bar dataKey="value" name="Valuation (₹)" fill="#6366f1" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Users By Role */}
          <div className={chartCardStyle}>
            <div>
              <p className={labelStyle}>Users Coverage</p>
              <h2 className={titleStyle}>Users By Role</h2>
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
                      paddingAngle={4}
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
    );
  }

  if (role === "sales") {
    const { ordersThisMonth, deliveredVsPending, revenueTrend } = data;

    // Calculate Sales KPIs
    const salesTotal = revenueTrend.reduce((sum: number, r: any) => sum + r.revenue, 0);
    const orderCount = ordersThisMonth.reduce((sum: number, r: any) => sum + r.count, 0);

    return (
      <div className="space-y-6 mt-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {renderKPI("Total Orders Placed (30d)", orderCount, "Total checkout count", <ShoppingCart className="size-6" />)}
          {renderKPI("Gross Delivered Revenue", `₹${salesTotal.toLocaleString()}`, "Delivered customer orders value", <IndianRupee className="size-6" />)}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Orders This Month */}
          <div className={chartCardStyle}>
            <div>
              <p className={labelStyle}>Sales Velocity</p>
              <h2 className={titleStyle}>Orders This Month</h2>
            </div>
            <div className="h-64 w-full">
              {ordersThisMonth.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-[#53645c]">No sales recorded this month</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={ordersThisMonth}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5dccb" />
                    <XAxis dataKey="date" tick={{ fill: '#53645c', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#53645c', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={renderTooltip} />
                    <Line type="monotone" dataKey="count" name="Sales Count" stroke="#1f806f" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Delivered vs Pending */}
          <div className={chartCardStyle}>
            <div>
              <p className={labelStyle}>Fulfillment Pipeline</p>
              <h2 className={titleStyle}>Delivered vs Pending Orders</h2>
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
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${percent !== undefined ? (percent * 100).toFixed(0) : 0}%`}
                    >
                      {deliveredVsPending.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={renderTooltip} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Revenue Trend */}
          <div className={chartCardStyle + " md:col-span-2"}>
            <div>
              <p className={labelStyle}>Commercial Trend</p>
              <h2 className={titleStyle}>Revenue Trend</h2>
            </div>
            <div className="h-64 w-full">
              {revenueTrend.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-[#53645c]">No delivered revenue data</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueTrend}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5dccb" />
                    <XAxis dataKey="month" tick={{ fill: '#53645c', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#53645c', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={renderTooltip} />
                    <Line type="monotone" dataKey="revenue" name="Revenue (₹)" stroke="#3b82f6" strokeWidth={3} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (role === "purchase") {
    const { purchaseOrdersByStatus, vendorPerformance, monthlyProcurementCost } = data;

    // Calculate Purchase KPIs
    const totalProcurement = monthlyProcurementCost.reduce((sum: number, r: any) => sum + r.cost, 0);
    const topVendor = vendorPerformance[0]?.name || "N/A";

    return (
      <div className="space-y-6 mt-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {renderKPI("Total Spend", `₹${totalProcurement.toLocaleString()}`, "Procurement value across active POs", <IndianRupee className="size-6" />)}
          {renderKPI("Top Vendor Partner", topVendor, "Vendor with highest order allocation", <Users className="size-6" />)}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* PO By Status */}
          <div className={chartCardStyle}>
            <div>
              <p className={labelStyle}>Procurement Lifecycle</p>
              <h2 className={titleStyle}>Purchase Orders By Status</h2>
            </div>
            <div className="h-64 w-full">
              {purchaseOrdersByStatus.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-[#53645c]">No purchase orders created</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={purchaseOrdersByStatus}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5dccb" />
                    <XAxis dataKey="status" tick={{ fill: '#53645c', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#53645c', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={renderTooltip} cursor={{ fill: '#fbfaf6' }} />
                    <Bar dataKey="count" name="PO Count" fill="#1f806f" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Vendor Performance */}
          <div className={chartCardStyle}>
            <div>
              <p className={labelStyle}>Supplier Spend</p>
              <h2 className={titleStyle}>Vendor Allocation</h2>
            </div>
            <div className="h-64 w-full">
              {vendorPerformance.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-[#53645c]">No supplier spend records</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={vendorPerformance} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5dccb" />
                    <XAxis type="number" tick={{ fill: '#53645c', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis dataKey="name" type="category" width={80} tick={{ fill: '#53645c', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip content={renderTooltip} cursor={{ fill: '#fbfaf6' }} />
                    <Bar dataKey="spend" name="Spend (₹)" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Monthly Procurement Cost */}
          <div className={chartCardStyle + " md:col-span-2"}>
            <div>
              <p className={labelStyle}>Material Cost Trend</p>
              <h2 className={titleStyle}>Monthly Procurement Cost</h2>
            </div>
            <div className="h-64 w-full">
              {monthlyProcurementCost.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-[#53645c]">No procurement cost transactions</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyProcurementCost}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5dccb" />
                    <XAxis dataKey="month" tick={{ fill: '#53645c', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#53645c', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={renderTooltip} />
                    <Line type="monotone" dataKey="cost" name="Cost (₹)" stroke="#3b82f6" strokeWidth={3} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (role === "manufacturing") {
    const { manufacturingOrdersByStatus, productionOutput, materialConsumption } = data;

    // Calculate Manufacturing KPIs
    const completedMOs = manufacturingOrdersByStatus.find((m: any) => m.status === "COMPLETED")?.count || 0;
    const totalOutput = productionOutput.reduce((sum: number, r: any) => sum + r.output, 0);

    return (
      <div className="space-y-6 mt-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {renderKPI("Completed MOs", completedMOs, "Active manufacturing completions", <Factory className="size-6" />)}
          {renderKPI("Produced Finished Goods", totalOutput, "Total items produced by MOs", <Package className="size-6" />)}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* MO By Status */}
          <div className={chartCardStyle}>
            <div>
              <p className={labelStyle}>Shop Floor Status</p>
              <h2 className={titleStyle}>MOs By Status</h2>
            </div>
            <div className="h-64 w-full">
              {manufacturingOrdersByStatus.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-[#53645c]">No manufacturing orders scheduled</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={manufacturingOrdersByStatus}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
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

          {/* Material Consumption */}
          <div className={chartCardStyle}>
            <div>
              <p className={labelStyle}>Material Waste & Usage</p>
              <h2 className={titleStyle}>Material Consumption</h2>
            </div>
            <div className="h-64 w-full">
              {materialConsumption.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-[#53645c]">No materials consumed yet</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={materialConsumption}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5dccb" />
                    <XAxis dataKey="name" tick={{ fill: '#53645c', fontSize: 9 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#53645c', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={renderTooltip} cursor={{ fill: '#fbfaf6' }} />
                    <Bar dataKey="consumed" name="Quantity Consumed" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Production Output */}
          <div className={chartCardStyle + " md:col-span-2"}>
            <div>
              <p className={labelStyle}>Shop Floor Yield</p>
              <h2 className={titleStyle}>Production Output</h2>
            </div>
            <div className="h-64 w-full">
              {productionOutput.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-[#53645c]">No finished goods produced yet</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={productionOutput}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5dccb" />
                    <XAxis dataKey="month" tick={{ fill: '#53645c', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#53645c', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={renderTooltip} />
                    <Line type="monotone" dataKey="output" name="Quantity Produced" stroke="#10b981" strokeWidth={3} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (role === "inventory") {
    const { topInventoryProducts, lowStockProducts, stockMovementTrend } = data;

    // Calculate Inventory KPIs
    const totalOnHand = topInventoryProducts.reduce((sum: number, r: any) => sum + r.quantity, 0);
    const lowStockCount = lowStockProducts.length;

    return (
      <div className="space-y-6 mt-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {renderKPI("Total Items On Hand", totalOnHand, "Sum of units in warehouse stock", <Warehouse className="size-6" />)}
          {renderKPI("Low Stock Alerts", lowStockCount, "Products at or below 5 available", <AlertTriangle className="size-6" />)}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Top Inventory Products */}
          <div className={chartCardStyle}>
            <div>
              <p className={labelStyle}>Stock Positions</p>
              <h2 className={titleStyle}>Top Inventory Products</h2>
            </div>
            <div className="h-64 w-full">
              {topInventoryProducts.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-[#53645c]">Warehouse inventory is empty</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topInventoryProducts}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5dccb" />
                    <XAxis dataKey="name" tick={{ fill: '#53645c', fontSize: 9 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#53645c', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={renderTooltip} cursor={{ fill: '#fbfaf6' }} />
                    <Bar dataKey="quantity" name="On Hand Qty" fill="#1f806f" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Low Stock Products */}
          <div className={chartCardStyle}>
            <div>
              <p className={labelStyle}>Replenishment Risk</p>
              <h2 className={titleStyle}>Low Stock Products</h2>
            </div>
            <div className="h-64 w-full">
              {lowStockProducts.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-emerald-700 font-semibold">All products have healthy stock!</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={lowStockProducts} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5dccb" />
                    <XAxis type="number" tick={{ fill: '#53645c', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis dataKey="name" type="category" width={80} tick={{ fill: '#53645c', fontSize: 9 }} axisLine={false} tickLine={false} />
                    <Tooltip content={renderTooltip} cursor={{ fill: '#fbfaf6' }} />
                    <Bar dataKey="available" name="Available Qty" fill="#ef4444" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Stock Movement Trend */}
          <div className={chartCardStyle + " md:col-span-2"}>
            <div>
              <p className={labelStyle}>Warehouse Activity</p>
              <h2 className={titleStyle}>Stock Movement Trend (30d)</h2>
            </div>
            <div className="h-64 w-full">
              {stockMovementTrend.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-[#53645c]">No inventory movements tracked in last 30d</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stockMovementTrend}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5dccb" />
                    <XAxis dataKey="date" tick={{ fill: '#53645c', fontSize: 9 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#53645c', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={renderTooltip} />
                    <Line type="monotone" dataKey="movements" name="Movement Log Count" stroke="#3b82f6" strokeWidth={3} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (role === "owner") {
    const { revenueTrend, inventoryValueTrend, orderFulfillmentRate, procurementVsSales } = data;

    // Calculate Owner KPIs
    const totalSales = revenueTrend.reduce((sum: number, r: any) => sum + r.revenue, 0);
    const currentInvValue = inventoryValueTrend[inventoryValueTrend.length - 1]?.value || 0;
    const deliveredCount = orderFulfillmentRate.find((o: any) => o.name === "Delivered")?.value || 0;
    const totalOrderCount = orderFulfillmentRate.reduce((sum: number, o: any) => sum + o.value, 0);
    const rate = totalOrderCount > 0 ? ((deliveredCount / totalOrderCount) * 100).toFixed(0) : "0";

    return (
      <div className="space-y-6 mt-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {renderKPI("Consolidated Revenue", `₹${totalSales.toLocaleString()}`, "Delivered customer invoices total", <IndianRupee className="size-6" />)}
          {renderKPI("Warehouse Valuation", `₹${currentInvValue.toLocaleString()}`, "Total asset value stored", <Warehouse className="size-6" />)}
          {renderKPI("Fulfillment Rate", `${rate}%`, `${deliveredCount} of ${totalOrderCount} orders delivered`, <FileText className="size-6" />)}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Revenue Trend */}
          <div className={chartCardStyle}>
            <div>
              <p className={labelStyle}>Sales Yield</p>
              <h2 className={titleStyle}>Revenue Trend</h2>
            </div>
            <div className="h-64 w-full">
              {revenueTrend.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-[#53645c]">No completed sales recorded</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueTrend}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5dccb" />
                    <XAxis dataKey="month" tick={{ fill: '#53645c', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#53645c', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={renderTooltip} />
                    <Line type="monotone" dataKey="revenue" name="Sales Revenue (₹)" stroke="#1f806f" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Inventory Value Trend */}
          <div className={chartCardStyle}>
            <div>
              <p className={labelStyle}>Capital Assets</p>
              <h2 className={titleStyle}>Inventory Valuation Trend</h2>
            </div>
            <div className="h-64 w-full">
              {inventoryValueTrend.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-[#53645c]">No historical stock changes</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={inventoryValueTrend}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5dccb" />
                    <XAxis dataKey="month" tick={{ fill: '#53645c', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#53645c', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={renderTooltip} />
                    <Line type="monotone" dataKey="value" name="Inventory Value (₹)" stroke="#3b82f6" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Fulfillment Rate Pie */}
          <div className={chartCardStyle}>
            <div>
              <p className={labelStyle}>Operational Target</p>
              <h2 className={titleStyle}>Order Fulfillment Rate</h2>
            </div>
            <div className="h-64 w-full flex items-center justify-center">
              {orderFulfillmentRate.length === 0 ? (
                <div className="text-sm text-[#53645c]">No orders placed</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={orderFulfillmentRate}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {orderFulfillmentRate.map((entry: any, index: number) => (
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

          {/* Procurement vs Sales */}
          <div className={chartCardStyle}>
            <div>
              <p className={labelStyle}>Finance Snapshot</p>
              <h2 className={titleStyle}>Procurement vs Sales</h2>
            </div>
            <div className="h-64 w-full">
              {procurementVsSales.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-[#53645c]">No billing records</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={procurementVsSales}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5dccb" />
                    <XAxis dataKey="month" tick={{ fill: '#53645c', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#53645c', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={renderTooltip} cursor={{ fill: '#fbfaf6' }} />
                    <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px', color: '#53645c' }} />
                    <Bar dataKey="sales" name="Sales (₹)" fill="#1f806f" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="purchases" name="Purchases (₹)" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
