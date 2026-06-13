"use client";

import { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { 
  Plus, 
  Search, 
  Eye, 
  Play, 
  CheckSquare, 
  Loader2, 
  AlertCircle,
  X,
  TrendingUp,
  Factory,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
  ClipboardList,
  Wrench,
  FileText,
  AlertTriangle
} from "lucide-react";
import { createManufacturingOrderAction, startManufacturingOrderAction, completeManufacturingOrderAction, cancelManufacturingOrderAction } from "@/app/actions/manufacturing";
import StatusBadge from "@/app/components/ui/StatusBadge";
import Modal from "@/app/components/ui/Modal";
import EmptyState from "@/app/components/ui/EmptyState";

type MO = {
  id: number;
  mo_number: string;
  product_name: string;
  product_id: number;
  sku: string;
  quantity: number;
  status: string;
  sales_order_number: string | null;
  created_at: string;
};

type Product = {
  id: number;
  name: string;
  sku: string;
};
type MOrdersClientProps = {
  initialOrders: MO[];
  products: Product[];
};

export default function ManufacturingOrdersClient({ initialOrders, products }: MOrdersClientProps) {
  const [orders, setOrders] = useState<MO[]>(initialOrders);
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams ? (searchParams.get("search") || "") : "");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"DETAILS" | "BOM" | "OPERATIONS">("DETAILS");
  const [selectedOrder, setSelectedOrder] = useState<MO | null>(null);

  // Form states
  const [selectedProductId, setSelectedProductId] = useState<number>(products[0]?.id || 0);
  const [qty, setQty] = useState<number>(1);

  const [formError, setFormError] = useState("");
  const [isPending, startTransition] = useTransition();

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.mo_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.sales_order_number && o.sales_order_number.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === "ALL" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // KPIs
  const scheduledCount = orders.length;
  const completedCount = orders.filter((o) => o.status === "COMPLETED").length;
  const readyCount = orders.filter((o) => o.status === "READY").length;

  const counts = {
    WAITING: orders.filter((o) => o.status === "WAITING_MATERIALS").length,
    READY: orders.filter((o) => o.status === "READY").length,
    IN_PROGRESS: orders.filter((o) => o.status === "IN_PROGRESS").length,
    COMPLETED: orders.filter((o) => o.status === "COMPLETED").length,
  };

  // Mock components for BoM breakdown & mock operations in the drawer
  const mockBoms: Record<string, Array<{ name: string; qtyRequired: number; qtyAvailable: number }>> = {
    "Table": [
      { name: "Raw Wood Plank", qtyRequired: 4, qtyAvailable: 25 },
      { name: "Wood Screws", qtyRequired: 16, qtyAvailable: 120 },
      { name: "Wood Varnish", qtyRequired: 1, qtyAvailable: 5 },
    ],
    "Chair": [
      { name: "Raw Wood Plank", qtyRequired: 2, qtyAvailable: 25 },
      { name: "Wood Screws", qtyRequired: 8, qtyAvailable: 120 },
      { name: "Cushion Padding", qtyRequired: 1, qtyAvailable: 0 }, // Shortage case!
    ],
  };

  const getBom = (productName: string, multiplier: number) => {
    const key = productName.includes("Chair") ? "Chair" : "Table";
    return (mockBoms[key] || mockBoms["Table"]).map(item => ({
      ...item,
      qtyRequired: item.qtyRequired * multiplier
    }));
  };

  const mockOperations = [
    { seq: 10, name: "Wood Cutting & Sizing", duration: "15 min", workCenter: "Cutting Station A" },
    { seq: 20, name: "Polishing & Sanding", duration: "30 min", workCenter: "Finishing Room" },
    { seq: 30, name: "Hardware Assembly", duration: "20 min", workCenter: "Assembly Line 2" },
  ];

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");

    if (qty < 1) {
      setFormError("Quantity must be at least 1.");
      return;
    }

    startTransition(async () => {
      const res = await createManufacturingOrderAction(selectedProductId, qty);
      if (res.error) setFormError(res.error);
      else {
        setIsAddOpen(false);
        setQty(1);
        window.location.reload();
      }
    });
  }

  function handleAction(action: "START" | "COMPLETE" | "CANCEL", orderId: number) {
    startTransition(async () => {
      let res;
      if (action === "START") res = await startManufacturingOrderAction(orderId);
      else if (action === "COMPLETE") res = await completeManufacturingOrderAction(orderId);
      else if (action === "CANCEL") res = await cancelManufacturingOrderAction(orderId);

      if (res?.error) alert(res.error);
      else {
        setIsDrawerOpen(false);
        window.location.reload();
      }
    });
  }

  const openDrawer = (order: MO) => {
    setSelectedOrder(order);
    setActiveTab("DETAILS");
    setIsDrawerOpen(true);
  };

  return (
    <div className="space-y-6">
      
      {/* Factory Control Room KPIs */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#ded4c3] bg-white p-5 shadow-xs flex items-center justify-between hover:shadow-md transition-all duration-300">
          <div>
            <span className="text-[10px] font-bold text-[#68756e] uppercase tracking-wider">Scheduled Production</span>
            <h3 className="text-2xl font-bold text-[#18231f] mt-1">{scheduledCount} Orders</h3>
            <p className="text-[10px] text-[#53645c] mt-1">Total manufacturing queue</p>
          </div>
          <div className="flex size-12 items-center justify-center rounded-xl border border-purple-200 bg-purple-50 text-purple-700">
            <ClipboardList className="size-5" />
          </div>
        </div>
        <div className="rounded-2xl border border-[#ded4c3] bg-white p-5 shadow-xs flex items-center justify-between hover:shadow-md transition-all duration-300">
          <div>
            <span className="text-[10px] font-bold text-[#68756e] uppercase tracking-wider">Completed Output</span>
            <h3 className="text-2xl font-bold text-emerald-700 mt-1">{completedCount} Completed</h3>
            <p className="text-[10px] text-[#53645c] mt-1">Finished goods stocked in inventory</p>
          </div>
          <div className="flex size-12 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700">
            <CheckCircle2 className="size-5" />
          </div>
        </div>
        <div className="rounded-2xl border border-[#ded4c3] bg-white p-5 shadow-xs flex items-center justify-between hover:shadow-md transition-all duration-300">
          <div>
            <span className="text-[10px] font-bold text-[#68756e] uppercase tracking-wider">Ready to Execute</span>
            <h3 className="text-2xl font-bold text-indigo-600 mt-1">{readyCount} MOs</h3>
            <p className="text-[10px] text-[#53645c] mt-1">All component items resolved</p>
          </div>
          <div className="flex size-12 items-center justify-center rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700">
            <Play className="size-5" />
          </div>
        </div>
      </div>

      {/* Production Pipeline visual */}
      <div className="rounded-2xl border border-[#ded4c3] bg-white p-5 shadow-xs">
        <h3 className="text-xs font-bold text-[#18231f] uppercase tracking-wider mb-4 flex items-center gap-1.5">
          <Factory className="size-4 text-[#1f806f]" /> Shop Floor Workload
        </h3>
        <div className="grid grid-cols-4 divide-x divide-[#ded4c3] text-center text-xs">
          <div className="px-2">
            <span className="text-[10px] font-bold text-[#68756e] uppercase">Awaiting Components</span>
            <p className="mt-1 text-lg font-bold text-amber-600">{counts.WAITING}</p>
          </div>
          <div className="px-2">
            <span className="text-[10px] font-bold text-[#68756e] uppercase">Ready to Start</span>
            <p className="mt-1 text-lg font-bold text-indigo-600">{counts.READY}</p>
          </div>
          <div className="px-2">
            <span className="text-[10px] font-bold text-[#68756e] uppercase">In Progress</span>
            <p className="mt-1 text-lg font-bold text-blue-600">{counts.IN_PROGRESS}</p>
          </div>
          <div className="px-2">
            <span className="text-[10px] font-bold text-[#68756e] uppercase">Completed Runs</span>
            <p className="mt-1 text-lg font-bold text-emerald-700">{counts.COMPLETED}</p>
          </div>
        </div>
      </div>

      {/* Top panel controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#ded4c3] pb-5">
        <div className="flex flex-1 flex-wrap gap-3">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#68756e]" />
            <input
              type="text"
              placeholder="Search MO #, product, or SO #..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 w-full rounded-lg border border-[#cfc3ad] bg-white pl-10 pr-4 text-sm outline-none transition focus:border-[#176b5d] focus:ring-2 focus:ring-[#176b5d]/20"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-lg border border-[#cfc3ad] bg-white px-3 text-sm outline-none transition focus:border-[#176b5d]"
          >
            <option value="ALL">All Statuses</option>
            <option value="WAITING_MATERIALS">Waiting Materials</option>
            <option value="READY">Ready</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        <button
          type="button"
          onClick={() => {
            setFormError("");
            setIsAddOpen(true);
          }}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#1f806f] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#176b5d]"
        >
          <Plus className="size-4" />
          Create MO
        </button>
      </div>

      {/* Table list */}
      {filteredOrders.length === 0 ? (
        <EmptyState
          title="No manufacturing orders found"
          description={searchTerm || statusFilter !== "ALL" ? "Try adjusting your filters." : "Plan manufacturing orders and execute production steps."}
          actionLabel={!searchTerm ? "Create MO" : undefined}
          onAction={() => setIsAddOpen(true)}
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[#ded4c3] bg-white shadow-xs">
          <table className="w-full border-collapse text-left text-sm text-[#18231f]">
            <thead className="border-b border-[#ded4c3] bg-[#fbfaf6] text-xs font-bold uppercase tracking-wider text-[#68756e]">
              <tr>
                <th className="px-6 py-4">MO Number</th>
                <th className="px-6 py-4">Finished Product</th>
                <th className="px-6 py-4 text-right">Target Qty</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Demand Link</th>
                <th className="px-6 py-4">Date Planned</th>
                <th className="px-6 py-4 text-center">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f3ebdd]">
              {filteredOrders.map((o) => (
                <tr key={o.id} className="hover:bg-[#fbfaf6]/50 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-[#1f806f]">{o.mo_number}</td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-[#202a25]">{o.product_name}</span>
                    <span className="block text-xs font-mono text-[#68756e] mt-0.5">{o.sku}</span>
                  </td>
                  <td className="px-6 py-4 text-right text-[#202a25] font-bold">{o.quantity}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-[#53645c]">
                    {o.sales_order_number || "Manual Demand"}
                  </td>
                  <td className="px-6 py-4 text-[#53645c]">
                    {new Date(o.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      type="button"
                      onClick={() => openDrawer(o)}
                      className="inline-flex items-center gap-1 rounded-lg border border-[#cfc3ad] bg-white px-2.5 py-1.5 text-xs font-bold text-[#405049] hover:bg-[#fffaf0] transition-colors"
                    >
                      <Eye className="size-3.5" />
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Stripe-style slideover Drawer */}
      {isDrawerOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs">
          <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
            <div className="w-screen max-w-2xl bg-white shadow-2xl border-l border-[#ded4c3] flex flex-col justify-between animate-in slide-in-from-right duration-300">
              
              {/* Header */}
              <div className="border-b border-[#f3ebdd] px-6 py-5 bg-[#fbfaf6]">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-[#68756e] uppercase tracking-wider">
                      Factory Production Order
                    </span>
                    <h2 className="text-2xl font-bold text-[#18231f] mt-1 flex items-center gap-2">
                      {selectedOrder.mo_number}
                      <StatusBadge status={selectedOrder.status} />
                    </h2>
                  </div>
                  <button
                    onClick={() => setIsDrawerOpen(false)}
                    className="rounded-lg border border-[#cfc3ad] bg-white p-1.5 text-[#53645c] hover:bg-[#fffaf0] transition"
                  >
                    <X className="size-4" />
                  </button>
                </div>

                {/* Progress funnel bar */}
                <div className="mt-6 flex items-center justify-between text-[10px] font-bold text-[#68756e] uppercase">
                  <span className={selectedOrder.status !== "CANCELLED" ? "text-amber-600" : "text-gray-400"}>1. Component Lock</span>
                  <ArrowRight className="size-3 text-[#ded4c3]" />
                  <span className={["READY", "IN_PROGRESS", "COMPLETED"].includes(selectedOrder.status) ? "text-[#1f806f]" : "text-gray-400"}>2. Ready</span>
                  <ArrowRight className="size-3 text-[#ded4c3]" />
                  <span className={["IN_PROGRESS", "COMPLETED"].includes(selectedOrder.status) ? "text-blue-600 animate-pulse" : "text-gray-400"}>3. Shop Floor Run</span>
                  <ArrowRight className="size-3 text-[#ded4c3]" />
                  <span className={selectedOrder.status === "COMPLETED" ? "text-emerald-700" : "text-gray-400"}>4. Finished Good Stocked</span>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="flex border-b border-[#f3ebdd] px-6 text-xs font-bold text-[#68756e] bg-white">
                <button
                  onClick={() => setActiveTab("DETAILS")}
                  className={`border-b-2 py-3.5 px-4 -mb-px transition ${activeTab === "DETAILS" ? "border-[#1f806f] text-[#1f806f]" : "border-transparent hover:text-[#18231f]"}`}
                >
                  General Run Parameters
                </button>
                <button
                  onClick={() => setActiveTab("BOM")}
                  className={`border-b-2 py-3.5 px-4 -mb-px transition ${activeTab === "BOM" ? "border-[#1f806f] text-[#1f806f]" : "border-transparent hover:text-[#18231f]"}`}
                >
                  Bill of Materials (BoM)
                </button>
                <button
                  onClick={() => setActiveTab("OPERATIONS")}
                  className={`border-b-2 py-3.5 px-4 -mb-px transition ${activeTab === "OPERATIONS" ? "border-[#1f806f] text-[#1f806f]" : "border-transparent hover:text-[#18231f]"}`}
                >
                  Work Center Operations
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {activeTab === "DETAILS" && (
                  <div className="space-y-6">
                    {/* General Product Info Card */}
                    <div className="rounded-xl border border-[#ded4c3] p-4 bg-white flex gap-4 items-center">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-purple-50 text-purple-700 border border-purple-200">
                        <Wrench className="size-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-[#68756e] uppercase">Target Finished Good</p>
                        <p className="font-bold text-[#202a25] text-sm mt-0.5">{selectedOrder.product_name}</p>
                        <p className="text-[10px] text-[#53645c] font-mono mt-0.5">{selectedOrder.sku}</p>
                      </div>
                    </div>

                    <div className="rounded-xl border border-[#ded4c3] p-4 space-y-3.5 text-xs text-[#53645c] bg-white">
                      <div className="flex justify-between">
                        <span>Planned Run Quantity:</span>
                        <strong className="text-[#18231f]">{selectedOrder.quantity} Units</strong>
                      </div>
                      <div className="flex justify-between border-t border-[#f3ebdd] pt-3">
                        <span>Demand Request Source:</span>
                        <span className="font-mono text-[#18231f] font-semibold">{selectedOrder.sales_order_number || "Manual Floor Request"}</span>
                      </div>
                      <div className="flex justify-between border-t border-[#f3ebdd] pt-3">
                        <span>Creation Timestamp:</span>
                        <span className="text-[#18231f] font-semibold">{new Date(selectedOrder.created_at).toLocaleString()}</span>
                      </div>
                    </div>

                    {selectedOrder.status === "WAITING_MATERIALS" && (
                      <div className="flex items-start gap-2.5 rounded-lg border border-[#e4b7a3] bg-[#fff2eb] p-3.5 text-xs text-[#8b3d1e] leading-5">
                        <AlertTriangle className="size-4 shrink-0 mt-0.5 animate-bounce" />
                        <div>
                          <strong>Stock Shortage Lock:</strong> Components are short in the warehouse. 
                          The procurement planning engine has scheduled automatic purchase requests. 
                          Once materials arrive, this order will advance to <strong>READY</strong>.
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "BOM" && (
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-[#18231f] uppercase tracking-wider">Required Bill of Materials Component Check</h4>
                    <div className="rounded-xl border border-[#ded4c3] overflow-hidden bg-white">
                      <table className="w-full text-left text-xs text-[#18231f]">
                        <thead className="bg-[#fbfaf6] text-[#68756e] font-bold border-b border-[#ded4c3] uppercase">
                          <tr>
                            <th className="px-4 py-3">Component Material</th>
                            <th className="px-4 py-3 text-right">Required</th>
                            <th className="px-4 py-3 text-right">Warehouse Available</th>
                            <th className="px-4 py-3 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#f3ebdd]">
                          {getBom(selectedOrder.product_name, selectedOrder.quantity).map((component, idx) => {
                            const isShortage = component.qtyAvailable < component.qtyRequired;
                            return (
                              <tr key={idx} className="hover:bg-[#fbfaf6]/50">
                                <td className="px-4 py-3 font-bold text-[#202a25]">{component.name}</td>
                                <td className="px-4 py-3 text-right font-semibold text-[#53645c]">{component.qtyRequired}</td>
                                <td className={`px-4 py-3 text-right font-bold ${isShortage ? 'text-red-600' : 'text-emerald-700'}`}>
                                  {component.qtyAvailable}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <span className={`inline-block rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${isShortage ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                                    {isShortage ? "Shortage" : "Allocated"}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeTab === "OPERATIONS" && (
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-[#18231f] uppercase tracking-wider">Manufacturing Work Plan</h4>
                    <div className="space-y-3">
                      {mockOperations.map((op, i) => (
                        <div key={i} className="flex items-center justify-between border border-[#ded4c3] rounded-xl p-3.5 bg-[#fbfaf6]">
                          <div>
                            <p className="text-xs font-bold text-[#202a25]">Seq {op.seq}: {op.name}</p>
                            <p className="text-[10px] text-[#68756e] mt-0.5">Work Center: {op.workCenter} / Time: {op.duration}</p>
                          </div>
                          <span className={`rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${selectedOrder.status === "COMPLETED" ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-50 text-gray-600 border border-gray-200'}`}>
                            {selectedOrder.status === "COMPLETED" ? "Executed" : "Scheduled"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Drawer Actions */}
              <div className="border-t border-[#f3ebdd] p-5 bg-[#fbfaf6] flex items-center justify-end gap-3">
                {(selectedOrder.status === "WAITING_MATERIALS" || selectedOrder.status === "READY" || selectedOrder.status === "IN_PROGRESS") && (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleAction("CANCEL", selectedOrder.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-red-700"
                  >
                    {isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <AlertCircle className="size-4" />
                    )}
                    Cancel Order
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="rounded-lg border border-[#cfc3ad] bg-white px-4 py-2 text-xs font-bold text-[#405049] shadow-sm transition hover:bg-[#fffaf0]"
                >
                  Close Drawer
                </button>

                {selectedOrder.status === "READY" && (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleAction("START", selectedOrder.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#1f806f] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#176b5d]"
                  >
                    {isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Play className="size-4" />
                    )}
                    Start Production
                  </button>
                )}

                {selectedOrder.status === "IN_PROGRESS" && (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleAction("COMPLETE", selectedOrder.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700"
                  >
                    {isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <CheckSquare className="size-4" />
                    )}
                    Complete Production
                  </button>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Creation Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Create Manufacturing Order">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase text-[#405049]">Select Finished Product</label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(Number(e.target.value))}
              className="mt-1 h-10 w-full rounded-lg border border-[#cfc3ad] bg-white px-3 text-sm outline-none transition focus:border-[#176b5d]"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-[#405049]">Planned Quantity</label>
            <input
              required
              type="number"
              min="1"
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
              placeholder="e.g. 10"
              className="mt-1 h-10 w-full rounded-lg border border-[#cfc3ad] bg-white px-3 text-sm outline-none transition focus:border-[#176b5d]"
            />
          </div>

          {formError && (
            <p className="rounded-lg border border-[#e4b7a3] bg-[#fff2eb] px-3 py-2 text-xs font-medium text-[#8b3d1e]">
              {formError}
            </p>
          )}

          <div className="flex justify-end gap-3 border-t border-[#e5dccb] pt-4">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="rounded-lg border border-[#cfc3ad] bg-white px-4 py-2 text-sm font-semibold text-[#24332d] shadow-sm transition hover:bg-[#fffaf0]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-[#1f806f] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#176b5d] disabled:opacity-60"
            >
              {isPending && <Loader2 className="size-4 animate-spin" />}
              Create Order
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
