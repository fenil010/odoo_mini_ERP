"use client";

import { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { 
  Plus, 
  Search, 
  Eye, 
  Trash2, 
  Loader2, 
  CheckCircle, 
  PackageOpen, 
  X,
  Truck,
  TrendingUp,
  DollarSign,
  User,
  Activity,
  Layers,
  ArrowRight,
  Clock,
  AlertTriangle,
  Users
} from "lucide-react";
import { createPurchaseOrderAction, confirmPurchaseOrderAction, receivePurchaseOrderAction, cancelPurchaseOrderAction } from "@/app/actions/purchase";
import StatusBadge from "@/app/components/ui/StatusBadge";
import Modal from "@/app/components/ui/Modal";
import EmptyState from "@/app/components/ui/EmptyState";

type PurchaseOrderItem = {
  product_id: number;
  product_name: string;
  sku: string;
  quantity: number;
  cost_price: number;
};

type PurchaseOrder = {
  id: number;
  po_number: string;
  vendor_name: string;
  vendor_id: number;
  status: string;
  created_at: string;
  item_count: number;
  total_amount: number;
  items: PurchaseOrderItem[];
};

type Vendor = {
  id: number;
  name: string;
};

type Product = {
  id: number;
  name: string;
  sku: string;
  cost_price: number;
  vendor_ids: number[];
};

type PurchaseOrdersClientProps = {
  initialOrders: PurchaseOrder[];
  vendors: Vendor[];
  products: Product[];
};

export default function PurchaseOrdersClient({ initialOrders, vendors, products }: PurchaseOrdersClientProps) {
  const [orders, setOrders] = useState<PurchaseOrder[]>(initialOrders);
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams ? (searchParams.get("search") || "") : "");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // Modals & Drawer
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"ITEMS" | "JOURNEY">("ITEMS");
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);

  // Form states
  const [selectedVendorId, setSelectedVendorId] = useState<number>(vendors[0]?.id || 0);
  const [orderItems, setOrderItems] = useState<{ product_id: number; quantity: number; cost_price: number }[]>(() => {
    const firstVendorId = vendors[0]?.id || 0;
    const initialVendorProducts = products.filter(p => p.vendor_ids?.includes(firstVendorId));
    return [
      {
        product_id: initialVendorProducts[0]?.id || 0,
        quantity: 1,
        cost_price: initialVendorProducts[0]?.cost_price || 0
      }
    ];
  });

  const [formError, setFormError] = useState("");
  const [isPending, startTransition] = useTransition();

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.po_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.vendor_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "ALL" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // KPI Calculations
  const totalProcurementVal = orders.reduce((sum, o) => sum + Number(o.total_amount), 0);
  const receivedVal = orders.filter((o) => o.status === "RECEIVED").reduce((sum, o) => sum + Number(o.total_amount), 0);
  const pendingCount = orders.filter((o) => o.status === "CONFIRMED").length;

  const counts = {
    DRAFT: orders.filter((o) => o.status === "DRAFT").length,
    CONFIRMED: orders.filter((o) => o.status === "CONFIRMED").length,
    RECEIVED: orders.filter((o) => o.status === "RECEIVED").length,
  };

  const totalOrderAmount = orderItems.reduce((sum, item) => sum + item.quantity * item.cost_price, 0);

  function handleProductChange(index: number, productId: number) {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const newItems = [...orderItems];
    newItems[index] = {
      product_id: productId,
      quantity: newItems[index].quantity,
      cost_price: Number(product.cost_price),
    };
    setOrderItems(newItems);
  }

  function handleQuantityChange(index: number, quantity: number) {
    const newItems = [...orderItems];
    newItems[index].quantity = quantity;
    setOrderItems(newItems);
  }

  function handleCostChange(index: number, costPrice: number) {
    const newItems = [...orderItems];
    newItems[index].cost_price = costPrice;
    setOrderItems(newItems);
  }

  function addOrderItem() {
    const vendorProds = products.filter((p) => p.vendor_ids?.includes(selectedVendorId));
    if (vendorProds.length > 0) {
      setOrderItems([...orderItems, { product_id: vendorProds[0].id, quantity: 1, cost_price: Number(vendorProds[0].cost_price) }]);
    }
  }

  function removeOrderItem(index: number) {
    if (orderItems.length === 1) return;
    setOrderItems(orderItems.filter((_, i) => i !== index));
  }

  async function handleCreateOrder(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");

    if (orderItems.some((item) => item.product_id === 0)) {
      setFormError("All items must have a selected product.");
      return;
    }

    startTransition(async () => {
      const res = await createPurchaseOrderAction(selectedVendorId, orderItems);
      if (res.error) setFormError(res.error);
      else {
        setIsAddOpen(false);
        const resetVendorId = vendors[0]?.id || 0;
        setSelectedVendorId(resetVendorId);
        const resetVendorProducts = products.filter((p) => p.vendor_ids?.includes(resetVendorId));
        setOrderItems([
          {
            product_id: resetVendorProducts[0]?.id || 0,
            quantity: 1,
            cost_price: resetVendorProducts[0]?.cost_price || 0
          }
        ]);
        window.location.reload();
      }
    });
  }

  function handleAction(action: "CONFIRM" | "RECEIVE" | "CANCEL", orderId: number) {
    startTransition(async () => {
      let res;
      if (action === "CONFIRM") res = await confirmPurchaseOrderAction(orderId);
      else if (action === "RECEIVE") res = await receivePurchaseOrderAction(orderId);
      else if (action === "CANCEL") res = await cancelPurchaseOrderAction(orderId);

      if (res?.error) alert(res.error);
      else {
        setIsDrawerOpen(false);
        window.location.reload();
      }
    });
  }

  function handleBulkAction(action: "CONFIRM" | "RECEIVE") {
    startTransition(async () => {
      const selectedArray = Array.from(selectedIds);
      let successCount = 0;
      let errors: string[] = [];

      for (const id of selectedArray) {
        const order = orders.find((o) => o.id === id);
        if (!order) continue;

        if (action === "CONFIRM" && order.status === "DRAFT") {
          const res = await confirmPurchaseOrderAction(id);
          if (res?.error) {
            errors.push(`${order.po_number}: ${res.error}`);
          } else {
            successCount++;
          }
        } else if (action === "RECEIVE" && order.status === "CONFIRMED") {
          const res = await receivePurchaseOrderAction(id);
          if (res?.error) {
            errors.push(`${order.po_number}: ${res.error}`);
          } else {
            successCount++;
          }
        }
      }

      if (errors.length > 0) {
        alert(`Completed with issues:\n\n${errors.join("\n")}`);
      }

      setSelectedIds(new Set());
      window.location.reload();
    });
  }

  const checkableOrders = filteredOrders.filter(
    (o) => o.status === "DRAFT" || o.status === "CONFIRMED"
  );

  const handleToggleSelectAll = () => {
    if (selectedIds.size === checkableOrders.length && checkableOrders.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(checkableOrders.map((o) => o.id)));
    }
  };

  const handleToggleSelect = (id: number) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const openDrawer = (order: PurchaseOrder) => {
    setSelectedOrder(order);
    setActiveTab("ITEMS");
    setIsDrawerOpen(true);
  };

  return (
    <div className="space-y-6">
      
      {/* Procurement KPIs */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#ded4c3] bg-white p-5 shadow-xs flex items-center justify-between hover:shadow-md transition-all duration-300">
          <div>
            <span className="text-[10px] font-bold text-[#68756e] uppercase tracking-wider">Total Committed Cost</span>
            <h3 className="text-2xl font-bold text-[#18231f] mt-1">₹{totalProcurementVal.toLocaleString()}</h3>
            <p className="text-[10px] text-[#53645c] mt-1">Total spend liabilities</p>
          </div>
          <div className="flex size-12 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-700">
            <TrendingUp className="size-5" />
          </div>
        </div>
        <div className="rounded-2xl border border-[#ded4c3] bg-white p-5 shadow-xs flex items-center justify-between hover:shadow-md transition-all duration-300">
          <div>
            <span className="text-[10px] font-bold text-[#68756e] uppercase tracking-wider">Acquired Assets Value</span>
            <h3 className="text-2xl font-bold text-emerald-700 mt-1">₹{receivedVal.toLocaleString()}</h3>
            <p className="text-[10px] text-[#53645c] mt-1">Stock received and warehouse checked</p>
          </div>
          <div className="flex size-12 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700">
            <DollarSign className="size-5" />
          </div>
        </div>
        <div className="rounded-2xl border border-[#ded4c3] bg-white p-5 shadow-xs flex items-center justify-between hover:shadow-md transition-all duration-300">
          <div>
            <span className="text-[10px] font-bold text-[#68756e] uppercase tracking-wider">Pending Arrivals</span>
            <h3 className="text-2xl font-bold text-indigo-600 mt-1">{pendingCount} POs</h3>
            <p className="text-[10px] text-[#53645c] mt-1">Active supplier shipments in route</p>
          </div>
          <div className="flex size-12 items-center justify-center rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700">
            <Truck className="size-5" />
          </div>
        </div>
      </div>

      {/* Procurement Pipeline */}
      <div className="rounded-2xl border border-[#ded4c3] bg-white p-5 shadow-xs">
        <h3 className="text-xs font-bold text-[#18231f] uppercase tracking-wider mb-4 flex items-center gap-1.5">
          <Layers className="size-4 text-[#1f806f]" /> Supply Chain Pipeline
        </h3>
        <div className="grid grid-cols-3 divide-x divide-[#ded4c3] text-center text-xs">
          <div className="px-2">
            <span className="text-[10px] font-bold text-[#68756e] uppercase">Draft Request</span>
            <p className="mt-1 text-lg font-bold text-[#18231f]">{counts.DRAFT}</p>
          </div>
          <div className="px-2">
            <span className="text-[10px] font-bold text-[#68756e] uppercase">Confirmed (Transit)</span>
            <p className="mt-1 text-lg font-bold text-blue-600">{counts.CONFIRMED}</p>
          </div>
          <div className="px-2">
            <span className="text-[10px] font-bold text-[#68756e] uppercase">Received (Stocked)</span>
            <p className="mt-1 text-lg font-bold text-emerald-600">{counts.RECEIVED}</p>
          </div>
        </div>
      </div>

      {/* Action panel controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#ded4c3] pb-5">
        <div className="flex flex-1 flex-wrap gap-3">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#68756e]" />
            <input
              type="text"
              placeholder="Search PO # or vendor..."
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
            <option value="DRAFT">Draft</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="RECEIVED">Received</option>
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
          Create Purchase Order
        </button>
      </div>

      {/* Bulk actions bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between rounded-lg border border-[#c9dbd5] bg-[#eef7f3] px-4 py-3 text-sm text-[#176b5d]">
          <div className="font-bold">{selectedIds.size} order(s) selected</div>
          <div className="flex gap-3">
            {filteredOrders.some((o) => selectedIds.has(o.id) && o.status === "DRAFT") && (
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleBulkAction("CONFIRM")}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#1f806f] px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#176b5d]"
              >
                {isPending ? <Loader2 className="size-3 animate-spin" /> : <CheckCircle className="size-3" />}
                Bulk Confirm
              </button>
            )}
            {filteredOrders.some((o) => selectedIds.has(o.id) && o.status === "CONFIRMED") && (
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleBulkAction("RECEIVE")}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                {isPending ? <Loader2 className="size-3 animate-spin" /> : <PackageOpen className="size-3" />}
                Bulk Receive
              </button>
            )}
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="rounded-lg border border-[#cfc3ad] bg-white px-3 py-1.5 text-xs font-semibold text-[#24332d] shadow-sm transition hover:bg-[#fffaf0]"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Table list */}
      {filteredOrders.length === 0 ? (
        <EmptyState
          title="No purchase orders found"
          description={searchTerm || statusFilter !== "ALL" ? "Try adjusting your filters." : "Create purchase orders to procure materials from vendors."}
          actionLabel={!searchTerm ? "Create Purchase Order" : undefined}
          onAction={() => setIsAddOpen(true)}
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[#ded4c3] bg-white shadow-xs">
          <table className="w-full border-collapse text-left text-sm text-[#18231f]">
            <thead className="border-b border-[#ded4c3] bg-[#fbfaf6] text-xs font-bold uppercase tracking-wider text-[#68756e]">
              <tr>
                <th className="px-6 py-4 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={
                      checkableOrders.length > 0 &&
                      selectedIds.size === checkableOrders.length
                    }
                    onChange={handleToggleSelectAll}
                    className="rounded border-[#cfc3ad] text-[#176b5d] focus:ring-[#1f806f]"
                  />
                </th>
                <th className="px-6 py-4">PO Number</th>
                <th className="px-6 py-4">Vendor</th>
                <th className="px-6 py-4">Date Placed</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Items</th>
                <th className="px-6 py-4 text-right">Total Cost</th>
                <th className="px-6 py-4 text-center">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f3ebdd]">
              {filteredOrders.map((o) => {
                const isCheckable = o.status === "DRAFT" || o.status === "CONFIRMED";
                return (
                  <tr key={o.id} className="hover:bg-[#fbfaf6]/50 transition-colors">
                    <td className="px-6 py-4 text-center">
                      {isCheckable ? (
                        <input
                          type="checkbox"
                          checked={selectedIds.has(o.id)}
                          onChange={() => handleToggleSelect(o.id)}
                          className="rounded border-[#cfc3ad] text-[#176b5d] focus:ring-[#1f806f]"
                        />
                      ) : null}
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-[#1f806f]">{o.po_number}</td>
                    <td className="px-6 py-4 font-bold text-[#202a25]">{o.vendor_name}</td>
                    <td className="px-6 py-4 text-[#53645c]">
                      {new Date(o.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="px-6 py-4 text-right text-[#53645c] font-semibold">{o.item_count}</td>
                    <td className="px-6 py-4 text-right font-bold text-[#202a25]">
                      ₹{Number(o.total_amount).toFixed(2)}
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
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Stripe Style Slide-over Drawer */}
      {isDrawerOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs">
          <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
            <div className="w-screen max-w-2xl bg-white shadow-2xl border-l border-[#ded4c3] flex flex-col justify-between animate-in slide-in-from-right duration-300">
              
              {/* Header */}
              <div className="border-b border-[#f3ebdd] px-6 py-5 bg-[#fbfaf6]">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-[#68756e] uppercase tracking-wider">
                      Purchase Order Details
                    </span>
                    <h2 className="text-2xl font-bold text-[#18231f] mt-1 flex items-center gap-2">
                      {selectedOrder.po_number}
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

                {/* Progress bar journey */}
                <div className="mt-6 flex items-center justify-between text-[10px] font-bold text-[#68756e] uppercase">
                  <span className={selectedOrder.status !== "CANCELLED" ? "text-[#1f806f]" : "text-gray-400"}>1. Request Draft</span>
                  <ArrowRight className="size-3 text-[#ded4c3]" />
                  <span className={["CONFIRMED", "RECEIVED"].includes(selectedOrder.status) ? "text-[#1f806f]" : "text-gray-400"}>2. Confirmed (Transit)</span>
                  <ArrowRight className="size-3 text-[#ded4c3]" />
                  <span className={selectedOrder.status === "RECEIVED" ? "text-[#1f806f]" : "text-gray-400"}>3. Received & Stocked</span>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="flex border-b border-[#f3ebdd] px-6 text-xs font-bold text-[#68756e] bg-white">
                <button
                  onClick={() => setActiveTab("ITEMS")}
                  className={`border-b-2 py-3.5 px-4 -mb-px transition ${activeTab === "ITEMS" ? "border-[#1f806f] text-[#1f806f]" : "border-transparent hover:text-[#18231f]"}`}
                >
                  Items & Pricing
                </button>
                <button
                  onClick={() => setActiveTab("JOURNEY")}
                  className={`border-b-2 py-3.5 px-4 -mb-px transition ${activeTab === "JOURNEY" ? "border-[#1f806f] text-[#1f806f]" : "border-transparent hover:text-[#18231f]"}`}
                >
                  Procurement Timeline
                </button>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {activeTab === "ITEMS" && (
                  <div className="space-y-6">
                    {/* Supplier Information Card */}
                    <div className="rounded-xl border border-[#ded4c3] p-4 bg-white flex gap-4 items-center">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <Users className="size-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-[#68756e] uppercase">Supplier Partner</p>
                        <p className="font-bold text-[#202a25] text-sm mt-0.5">{selectedOrder.vendor_name}</p>
                      </div>
                    </div>

                    {/* PO Items Table */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-[#18231f] uppercase tracking-wider">Purchase Lines</h4>
                      <div className="rounded-xl border border-[#ded4c3] overflow-hidden bg-white">
                        <table className="w-full text-left text-xs text-[#18231f]">
                          <thead className="bg-[#fbfaf6] text-[#68756e] font-bold border-b border-[#ded4c3] uppercase">
                            <tr>
                              <th className="px-4 py-3">Product Name</th>
                              <th className="px-4 py-3 text-right">Quantity Ordered</th>
                              <th className="px-4 py-3 text-right">Cost Price</th>
                              <th className="px-4 py-3 text-right">Subtotal Cost</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#f3ebdd]">
                            {selectedOrder.items.map((item, idx) => (
                              <tr key={idx} className="hover:bg-[#fbfaf6]/50">
                                  <td className="px-4 py-3">
                                    <p className="font-bold text-[#202a25]">{item.product_name}</p>
                                    <p className="text-[10px] text-[#68756e] font-mono mt-0.5">{item.sku}</p>
                                  </td>
                                  <td className="px-4 py-3 text-right font-bold text-[#53645c]">{item.quantity}</td>
                                  <td className="px-4 py-3 text-right text-[#53645c]">₹{Number(item.cost_price).toFixed(2)}</td>
                                  <td className="px-4 py-3 text-right font-bold text-[#202a25]">
                                    ₹{(item.quantity * item.cost_price).toFixed(2)}
                                  </td>
                                </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "JOURNEY" && (
                  <div className="space-y-6">
                    <h4 className="text-xs font-bold text-[#18231f] uppercase tracking-wider">Purchase Status Journey</h4>
                    <div className="relative pl-4 border-l border-[#ded4c3] space-y-4 text-xs">
                      <div className="relative">
                        <span className="absolute -left-[20.5px] top-1 flex size-2.5 items-center justify-center rounded-full bg-[#1f806f]" />
                        <span className="text-[10px] font-bold text-[#68756e]">Date: {new Date(selectedOrder.created_at).toLocaleDateString()}</span>
                        <p className="font-bold text-[#202a25] mt-0.5">PO Document Initialized</p>
                        <p className="text-[#53645c] mt-0.5">Procurement draft request generated in DRAFT state.</p>
                      </div>
                      
                      {selectedOrder.status !== "DRAFT" && (
                        <div className="relative">
                          <span className="absolute -left-[20.5px] top-1 flex size-2.5 items-center justify-center rounded-full bg-blue-600" />
                          <span className="text-[10px] font-bold text-[#68756e]">Processing</span>
                          <p className="font-bold text-[#202a25] mt-0.5">Supplier Dispatch Confirmed</p>
                          <p className="text-[#53645c] mt-0.5">Procurement details approved. Awaiting material receipt check-in.</p>
                        </div>
                      )}

                      {selectedOrder.status === "RECEIVED" && (
                        <div className="relative">
                          <span className="absolute -left-[20.5px] top-1 flex size-2.5 items-center justify-center rounded-full bg-emerald-600" />
                          <span className="text-[10px] font-bold text-[#68756e]">Completed</span>
                          <p className="font-bold text-[#202a25] mt-0.5">Materials Stocked In Warehouse</p>
                          <p className="text-[#53645c] mt-0.5">Inventory levels incremented in PostgreSQL ledger.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>

              {/* Drawer Footer Actions */}
              <div className="border-t border-[#f3ebdd] p-5 bg-[#fbfaf6] flex items-center justify-between">
                <div className="text-left">
                  <span className="text-[10px] font-bold text-[#68756e] uppercase">Total Cost</span>
                  <p className="text-xl font-bold text-[#18231f]">₹{Number(selectedOrder.total_amount).toFixed(2)}</p>
                </div>
                <div className="flex gap-2">
                  {(selectedOrder.status === "DRAFT" || selectedOrder.status === "CONFIRMED") && (
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleAction("CANCEL", selectedOrder.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-700 hover:bg-red-100 transition"
                    >
                      <Trash2 className="size-4" />
                      Cancel Order
                    </button>
                  )}

                  {selectedOrder.status === "DRAFT" && (
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleAction("CONFIRM", selectedOrder.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#1f806f] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#176b5d]"
                    >
                      {isPending ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <CheckCircle className="size-4" />
                      )}
                      Confirm Order
                    </button>
                  )}

                  {selectedOrder.status === "CONFIRMED" && (
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleAction("RECEIVE", selectedOrder.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700"
                    >
                      {isPending ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <PackageOpen className="size-4" />
                      )}
                      Receive Materials
                    </button>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* PO Creation Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Create Purchase Order">
        <form onSubmit={handleCreateOrder} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase text-[#405049]">Select Vendor</label>
            <select
              value={selectedVendorId}
              onChange={(e) => {
                const vendorId = Number(e.target.value);
                setSelectedVendorId(vendorId);
                const vendorProds = products.filter((p) => p.vendor_ids?.includes(vendorId));
                if (vendorProds.length > 0) {
                  setOrderItems([{ product_id: vendorProds[0].id, quantity: 1, cost_price: Number(vendorProds[0].cost_price) }]);
                } else {
                  setOrderItems([{ product_id: 0, quantity: 1, cost_price: 0 }]);
                }
              }}
              className="mt-1 h-10 w-full rounded-lg border border-[#cfc3ad] bg-white px-3 text-sm outline-none transition focus:border-[#176b5d]"
            >
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-[#e5dccb] pb-2">
              <span className="text-xs font-bold uppercase text-[#405049]">Order Items</span>
              <button
                type="button"
                onClick={addOrderItem}
                className="text-xs font-bold text-[#1f806f] hover:underline"
              >
                + Add Item
              </button>
            </div>

            {orderItems.map((item, idx) => {
              const vendorProds = products.filter((p) => p.vendor_ids?.includes(selectedVendorId));
              return (
                <div key={idx} className="flex gap-2 items-center">
                  <div className="flex-1">
                    <select
                      value={item.product_id}
                      onChange={(e) => handleProductChange(idx, Number(e.target.value))}
                      className="h-10 w-full rounded-lg border border-[#cfc3ad] bg-white px-2 text-sm outline-none transition focus:border-[#176b5d]"
                    >
                      {vendorProds.length === 0 ? (
                        <option value={0}>No products sold by this vendor</option>
                      ) : (
                        vendorProds.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} (Cost: ₹{Number(p.cost_price).toFixed(2)})
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                  <div className="w-20">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(idx, Number(e.target.value))}
                      placeholder="Qty"
                      className="h-10 w-full rounded-lg border border-[#cfc3ad] bg-white px-3 text-sm text-center outline-none transition focus:border-[#176b5d]"
                    />
                  </div>
                  <div className="w-24">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.cost_price}
                      onChange={(e) => handleCostChange(idx, Number(e.target.value))}
                      placeholder="Cost"
                      className="h-10 w-full rounded-lg border border-[#cfc3ad] bg-white px-3 text-sm text-right outline-none transition focus:border-[#176b5d]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeOrderItem(idx)}
                    className="rounded-lg p-1.5 text-[#53645c] hover:bg-red-50 hover:text-[#8b3d1e]"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center border-t border-[#e5dccb] pt-4 font-bold text-[#18231f]">
            <span>Total Cost:</span>
            <span className="text-xl text-[#1f806f]">₹{totalOrderAmount.toFixed(2)}</span>
          </div>

          {formError && (
            <p className="rounded-lg border border-[#e4b7a3] bg-[#fff2eb] px-3 py-2 text-xs font-medium text-[#8b3d1e]">
              {formError}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
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
