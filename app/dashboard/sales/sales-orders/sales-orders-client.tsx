"use client";

import { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  Plus, 
  Search, 
  Eye, 
  ShoppingBag, 
  Trash2, 
  Loader2, 
  CheckCircle, 
  Truck, 
  XCircle,
  X,
  User,
  Activity,
  FileText,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Layers,
  ArrowRight,
  Clock,
  ExternalLink
} from "lucide-react";
import { createSalesOrderAction, confirmSalesOrderAction, deliverSalesOrderAction, cancelSalesOrderAction } from "@/app/actions/sales";
import StatusBadge from "@/app/components/ui/StatusBadge";
import Modal from "@/app/components/ui/Modal";
import EmptyState from "@/app/components/ui/EmptyState";

type RelatedMO = {
  id: number;
  mo_number: string;
  quantity: number;
  status: string;
  product_name: string;
  parent_manufacturing_order_id: number | null;
  child_pos: { po_number: string; status: string; product_name: string }[];
};

type RelatedPO = {
  po_number: string;
  status: string;
};

type SalesOrderItem = {
  product_id: number;
  product_name: string;
  sku: string;
  quantity: number;
  price: number;
  available_qty: number;
  reserved_for_order: number;
};

type SalesOrder = {
  id: number;
  order_number: string;
  customer_name: string;
  customer_id: number;
  status: string;
  created_at: string;
  item_count: number;
  total_amount: number;
  items: SalesOrderItem[];
  related_mos: RelatedMO[];
  related_pos: RelatedPO[];
  can_deliver: boolean;
};

type Customer = {
  id: number;
  name: string;
};

type Product = {
  id: number;
  name: string;
  sku: string;
  sale_price: number;
};

type SalesOrdersClientProps = {
  initialOrders: SalesOrder[];
  customers: Customer[];
  products: Product[];
};

export default function SalesOrdersClient({ initialOrders, customers, products }: SalesOrdersClientProps) {
  const [orders, setOrders] = useState<SalesOrder[]>(initialOrders);
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams ? (searchParams.get("search") || "") : "");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // Drawer / Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"ITEMS" | "JOURNEY" | "LINKS">("ITEMS");
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null);

  // Form states
  const [selectedCustomerId, setSelectedCustomerId] = useState<number>(customers[0]?.id || 0);
  const [orderItems, setOrderItems] = useState<{ product_id: number; quantity: number; price: number }[]>([
    { product_id: products[0]?.id || 0, quantity: 1, price: products[0]?.sale_price || 0 },
  ]);

  const [formError, setFormError] = useState("");
  const [isPending, startTransition] = useTransition();

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "ALL" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate Pipeline Status Counts
  const counts = {
    DRAFT: orders.filter((o) => o.status === "DRAFT").length,
    CONFIRMED: orders.filter((o) => o.status === "CONFIRMED").length,
    WAITING: orders.filter((o) => o.status === "WAITING_INVENTORY").length,
    READY: orders.filter((o) => o.status === "READY_TO_DELIVER" || (o.status === "CONFIRMED" && o.can_deliver)).length,
    DELIVERED: orders.filter((o) => o.status === "DELIVERED").length,
  };

  const totalSalesVal = orders.reduce((sum, o) => sum + Number(o.total_amount), 0);
  const draftSalesVal = orders.filter((o) => o.status === "DRAFT").reduce((sum, o) => sum + Number(o.total_amount), 0);
  const deliveredSalesVal = orders.filter((o) => o.status === "DELIVERED").reduce((sum, o) => sum + Number(o.total_amount), 0);

  const totalOrderAmount = orderItems.reduce((sum, item) => sum + item.quantity * item.price, 0);

  function handleProductChange(index: number, productId: number) {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const newItems = [...orderItems];
    newItems[index] = {
      product_id: productId,
      quantity: newItems[index].quantity,
      price: Number(product.sale_price),
    };
    setOrderItems(newItems);
  }

  function handleQuantityChange(index: number, quantity: number) {
    const newItems = [...orderItems];
    newItems[index].quantity = quantity;
    setOrderItems(newItems);
  }

  function handlePriceChange(index: number, price: number) {
    const newItems = [...orderItems];
    newItems[index].price = price;
    setOrderItems(newItems);
  }

  function addOrderItem() {
    setOrderItems([...orderItems, { product_id: products[0]?.id || 0, quantity: 1, price: products[0]?.sale_price || 0 }]);
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
      const res = await createSalesOrderAction(selectedCustomerId, orderItems);
      if (res.error) setFormError(res.error);
      else {
        setIsAddOpen(false);
        // Reset form
        setSelectedCustomerId(customers[0]?.id || 0);
        setOrderItems([{ product_id: products[0]?.id || 0, quantity: 1, price: products[0]?.sale_price || 0 }]);
        window.location.reload();
      }
    });
  }

  function handleAction(action: "CONFIRM" | "DELIVER" | "CANCEL", orderId: number) {
    startTransition(async () => {
      let res;
      if (action === "CONFIRM") res = await confirmSalesOrderAction(orderId);
      else if (action === "DELIVER") res = await deliverSalesOrderAction(orderId);
      else if (action === "CANCEL") res = await cancelSalesOrderAction(orderId);

      if (res?.error) alert(res.error);
      else {
        setIsDrawerOpen(false);
        window.location.reload();
      }
    });
  }

  function handleBulkAction(action: "CONFIRM" | "DELIVER") {
    startTransition(async () => {
      const selectedArray = Array.from(selectedIds);
      let successCount = 0;
      let errors: string[] = [];

      for (const id of selectedArray) {
        const order = orders.find((o) => o.id === id);
        if (!order) continue;

        if (action === "CONFIRM" && order.status === "DRAFT") {
          const res = await confirmSalesOrderAction(id);
          if (res?.error) {
            errors.push(`${order.order_number}: ${res.error}`);
          } else {
            successCount++;
          }
        } else if (
          action === "DELIVER" &&
          (order.status === "CONFIRMED" || order.status === "WAITING_INVENTORY" || order.status === "READY_TO_DELIVER") &&
          order.can_deliver
        ) {
          const res = await deliverSalesOrderAction(id);
          if (res?.error) {
            errors.push(`${order.order_number}: ${res.error}`);
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
    (o) =>
      o.status === "DRAFT" ||
      ((o.status === "CONFIRMED" || o.status === "WAITING_INVENTORY" || o.status === "READY_TO_DELIVER") && o.can_deliver)
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

  const openDrawer = (order: SalesOrder) => {
    setSelectedOrder(order);
    setActiveTab("ITEMS");
    setIsDrawerOpen(true);
  };

  return (
    <div className="space-y-6">
      
      {/* Revenue KPI Section */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#ded4c3] bg-white p-5 shadow-xs flex items-center justify-between hover:shadow-md transition-all duration-300">
          <div>
            <span className="text-[10px] font-bold text-[#68756e] uppercase tracking-wider">Total Sales Invoiced</span>
            <h3 className="text-2xl font-bold text-[#18231f] mt-1">₹{totalSalesVal.toLocaleString()}</h3>
            <p className="text-[10px] text-[#53645c] mt-1">All processed sales pipelines</p>
          </div>
          <div className="flex size-12 items-center justify-center rounded-xl border border-teal-200 bg-teal-50 text-teal-700">
            <TrendingUp className="size-5" />
          </div>
        </div>
        <div className="rounded-2xl border border-[#ded4c3] bg-white p-5 shadow-xs flex items-center justify-between hover:shadow-md transition-all duration-300">
          <div>
            <span className="text-[10px] font-bold text-[#68756e] uppercase tracking-wider">Realized Revenue</span>
            <h3 className="text-2xl font-bold text-emerald-700 mt-1">₹{deliveredSalesVal.toLocaleString()}</h3>
            <p className="text-[10px] text-[#53645c] mt-1">Delivered and completed orders</p>
          </div>
          <div className="flex size-12 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700">
            <DollarSign className="size-5" />
          </div>
        </div>
        <div className="rounded-2xl border border-[#ded4c3] bg-white p-5 shadow-xs flex items-center justify-between hover:shadow-md transition-all duration-300">
          <div>
            <span className="text-[10px] font-bold text-[#68756e] uppercase tracking-wider">Draft Forecast Pipeline</span>
            <h3 className="text-2xl font-bold text-amber-600 mt-1">₹{draftSalesVal.toLocaleString()}</h3>
            <p className="text-[10px] text-[#53645c] mt-1">Orders awaiting validation</p>
          </div>
          <div className="flex size-12 items-center justify-center rounded-xl border border-amber-200 bg-amber-50 text-amber-700">
            <ShoppingBag className="size-5" />
          </div>
        </div>
      </div>

      {/* Sales Pipeline Journey Tracker */}
      <div className="rounded-2xl border border-[#ded4c3] bg-white p-5 shadow-xs">
        <h3 className="text-xs font-bold text-[#18231f] uppercase tracking-wider mb-4 flex items-center gap-1.5">
          <Layers className="size-4 text-[#1f806f]" /> Revenue Pipeline Funnel
        </h3>
        <div className="grid grid-cols-5 divide-x divide-[#ded4c3] text-center text-xs">
          <div className="px-2">
            <span className="text-[10px] font-bold text-[#68756e] uppercase">Draft</span>
            <p className="mt-1 text-lg font-bold text-[#18231f]">{counts.DRAFT}</p>
          </div>
          <div className="px-2">
            <span className="text-[10px] font-bold text-[#68756e] uppercase">Confirmed</span>
            <p className="mt-1 text-lg font-bold text-blue-600">{counts.CONFIRMED}</p>
          </div>
          <div className="px-2">
            <span className="text-[10px] font-bold text-[#68756e] uppercase">Awaiting Stock</span>
            <p className="mt-1 text-lg font-bold text-amber-600">{counts.WAITING}</p>
          </div>
          <div className="px-2">
            <span className="text-[10px] font-bold text-[#68756e] uppercase">Ready to Ship</span>
            <p className="mt-1 text-lg font-bold text-emerald-600">{counts.READY}</p>
          </div>
          <div className="px-2">
            <span className="text-[10px] font-bold text-[#68756e] uppercase">Delivered</span>
            <p className="mt-1 text-lg font-bold text-[#1f806f]">{counts.DELIVERED}</p>
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
              placeholder="Search by order # or customer..."
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
            <option value="WAITING_INVENTORY">Waiting Inventory</option>
            <option value="READY_TO_DELIVER">Ready To Deliver</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
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
          Create Sales Order
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
            {filteredOrders.some(
              (o) =>
                selectedIds.has(o.id) &&
                (o.status === "CONFIRMED" || o.status === "WAITING_INVENTORY" || o.status === "READY_TO_DELIVER") &&
                o.can_deliver
            ) && (
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleBulkAction("DELIVER")}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                {isPending ? <Loader2 className="size-3 animate-spin" /> : <Truck className="size-3" />}
                Bulk Deliver
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
          title="No sales orders found"
          description={searchTerm || statusFilter !== "ALL" ? "Try adjusting your filters." : "Create customer sales orders and confirm them to check inventory reservations."}
          actionLabel={!searchTerm ? "Create Sales Order" : undefined}
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
                <th className="px-6 py-4">Order Number</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Date Placed</th>
                <th className="px-6 py-4">Fulfillment Status</th>
                <th className="px-6 py-4 text-right">Items</th>
                <th className="px-6 py-4 text-right">Total Amount</th>
                <th className="px-6 py-4 text-center">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f3ebdd]">
              {filteredOrders.map((o) => {
                const isCheckable = o.status === "DRAFT" || ((o.status === "CONFIRMED" || o.status === "WAITING_INVENTORY" || o.status === "READY_TO_DELIVER") && o.can_deliver);
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
                    <td className="px-6 py-4 font-mono font-bold text-[#1f806f]">{o.order_number}</td>
                    <td className="px-6 py-4 font-bold text-[#202a25]">{o.customer_name}</td>
                    <td className="px-6 py-4 text-[#53645c]">
                      {new Date(o.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge 
                        status={
                          (o.status === "CONFIRMED" || o.status === "WAITING_INVENTORY" || o.status === "READY_TO_DELIVER")
                            ? (o.can_deliver ? "READY_TO_DELIVER" : "WAITING_INVENTORY")
                            : o.status
                        } 
                      />
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

      {/* Slide-over Detail Drawer (Stripe style) */}
      {isDrawerOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs">
          <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
            <div className="w-screen max-w-2xl bg-white shadow-2xl border-l border-[#ded4c3] flex flex-col justify-between animate-in slide-in-from-right duration-300">
              
              {/* Header */}
              <div className="border-b border-[#f3ebdd] px-6 py-5 bg-[#fbfaf6]">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-[#68756e] uppercase tracking-wider">
                      Sales Order Details
                    </span>
                    <h2 className="text-2xl font-bold text-[#18231f] mt-1 flex items-center gap-2">
                      {selectedOrder.order_number}
                      <StatusBadge 
                        status={
                          (selectedOrder.status === "CONFIRMED" || selectedOrder.status === "WAITING_INVENTORY" || selectedOrder.status === "READY_TO_DELIVER")
                            ? (selectedOrder.can_deliver ? "READY_TO_DELIVER" : "WAITING_INVENTORY")
                            : selectedOrder.status
                        } 
                      />
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
                  <span className={selectedOrder.status !== "CANCELLED" ? "text-[#1f806f]" : "text-gray-400"}>1. Draft</span>
                  <ArrowRight className="size-3 text-[#ded4c3]" />
                  <span className={["CONFIRMED", "WAITING_INVENTORY", "READY_TO_DELIVER", "DELIVERED"].includes(selectedOrder.status) ? "text-[#1f806f]" : "text-gray-400"}>2. Confirmed</span>
                  <ArrowRight className="size-3 text-[#ded4c3]" />
                  <span className={["READY_TO_DELIVER", "DELIVERED"].includes(selectedOrder.status) || (selectedOrder.status === "CONFIRMED" && selectedOrder.can_deliver) ? "text-[#1f806f]" : "text-gray-400"}>3. Ready</span>
                  <ArrowRight className="size-3 text-[#ded4c3]" />
                  <span className={selectedOrder.status === "DELIVERED" ? "text-[#1f806f]" : "text-gray-400"}>4. Delivered</span>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="flex border-b border-[#f3ebdd] px-6 text-xs font-bold text-[#68756e] bg-white">
                <button
                  onClick={() => setActiveTab("ITEMS")}
                  className={`border-b-2 py-3.5 px-4 -mb-px transition ${activeTab === "ITEMS" ? "border-[#1f806f] text-[#1f806f]" : "border-transparent hover:text-[#18231f]"}`}
                >
                  Items & Allocations
                </button>
                <button
                  onClick={() => setActiveTab("JOURNEY")}
                  className={`border-b-2 py-3.5 px-4 -mb-px transition ${activeTab === "JOURNEY" ? "border-[#1f806f] text-[#1f806f]" : "border-transparent hover:text-[#18231f]"}`}
                >
                  Order Journey
                </button>
                <button
                  onClick={() => setActiveTab("LINKS")}
                  className={`border-b-2 py-3.5 px-4 -mb-px transition ${activeTab === "LINKS" ? "border-[#1f806f] text-[#1f806f]" : "border-transparent hover:text-[#18231f]"}`}
                >
                  Related Documents
                </button>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {activeTab === "ITEMS" && (
                  <div className="space-y-6">
                    {/* Customer Information Card */}
                    <div className="rounded-xl border border-[#ded4c3] p-4 bg-white flex gap-4 items-center">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-teal-50 text-teal-700 border border-teal-200">
                        <User className="size-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-[#68756e] uppercase">Customer Account</p>
                        <p className="font-bold text-[#202a25] text-sm mt-0.5">{selectedOrder.customer_name}</p>
                      </div>
                    </div>

                    {/* Items Table */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-[#18231f] uppercase tracking-wider">Item Allocation Matrix</h4>
                      <div className="rounded-xl border border-[#ded4c3] overflow-hidden bg-white">
                        <table className="w-full text-left text-xs text-[#18231f]">
                          <thead className="bg-[#fbfaf6] text-[#68756e] font-bold border-b border-[#ded4c3] uppercase">
                            <tr>
                              <th className="px-4 py-3">Product Name</th>
                              <th className="px-4 py-3 text-right">Required</th>
                              <th className="px-4 py-3 text-right">Reserved</th>
                              <th className="px-4 py-3 text-right">Shortage</th>
                              <th className="px-4 py-3 text-right">Unit Price</th>
                              <th className="px-4 py-3 text-right">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#f3ebdd]">
                            {selectedOrder.items.map((item, idx) => {
                              const shortage = Math.max(0, item.quantity - Number(item.reserved_for_order || 0));
                              return (
                                <tr key={idx} className="hover:bg-[#fbfaf6]/50">
                                  <td className="px-4 py-3">
                                    <p className="font-bold text-[#202a25]">{item.product_name}</p>
                                    <p className="text-[10px] text-[#68756e] font-mono mt-0.5">{item.sku}</p>
                                  </td>
                                  <td className="px-4 py-3 text-right font-bold text-[#53645c]">{item.quantity}</td>
                                  <td className="px-4 py-3 text-right font-bold text-emerald-700">{item.reserved_for_order || 0}</td>
                                  <td className="px-4 py-3 text-right font-bold text-red-600">
                                    {shortage > 0 ? shortage : "-"}
                                  </td>
                                  <td className="px-4 py-3 text-right text-[#53645c]">₹{Number(item.price).toFixed(2)}</td>
                                  <td className="px-4 py-3 text-right font-bold text-[#202a25]">
                                    ₹{(item.quantity * item.price).toFixed(2)}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "JOURNEY" && (
                  <div className="space-y-6">
                    <h4 className="text-xs font-bold text-[#18231f] uppercase tracking-wider">Audit Trail & Timeline</h4>
                    <div className="relative pl-4 border-l border-[#ded4c3] space-y-4 text-xs">
                      <div className="relative">
                        <span className="absolute -left-[20.5px] top-1 flex size-2.5 items-center justify-center rounded-full bg-[#1f806f]" />
                        <span className="text-[10px] font-bold text-[#68756e]">Date: {new Date(selectedOrder.created_at).toLocaleDateString()}</span>
                        <p className="font-bold text-[#202a25] mt-0.5">Order Document Created</p>
                        <p className="text-[#53645c] mt-0.5">SO initialized in DRAFT state by Sales Agent.</p>
                      </div>
                      
                      {selectedOrder.status !== "DRAFT" && (
                        <div className="relative">
                          <span className="absolute -left-[20.5px] top-1 flex size-2.5 items-center justify-center rounded-full bg-blue-600" />
                          <span className="text-[10px] font-bold text-[#68756e]">Processing</span>
                          <p className="font-bold text-[#202a25] mt-0.5">Order Confirmed</p>
                          <p className="text-[#53645c] mt-0.5">Stock reservations calculated automatically.</p>
                        </div>
                      )}

                      {selectedOrder.status === "DELIVERED" && (
                        <div className="relative">
                          <span className="absolute -left-[20.5px] top-1 flex size-2.5 items-center justify-center rounded-full bg-emerald-600" />
                          <span className="text-[10px] font-bold text-[#68756e]">Completed</span>
                          <p className="font-bold text-[#202a25] mt-0.5">Shipment Dispatched</p>
                          <p className="text-[#53645c] mt-0.5">Inventory ledger updated. Customer invoiced.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "LINKS" && (
                  <div className="space-y-6">
                    <h4 className="text-xs font-bold text-[#18231f] uppercase tracking-wider">Procurement Traceability Tree</h4>
                    {selectedOrder.related_mos.length === 0 && selectedOrder.related_pos.length === 0 ? (
                      <div className="text-center py-6 border border-dashed border-[#ded4c3] rounded-xl text-xs text-[#53645c]">
                        No linked Manufacturing or Purchase orders found. Order was satisfied using ready stock.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {/* Root-level MOs (no parent) */}
                        {(() => {
                          const moMap = new Map<number, RelatedMO>();
                          (selectedOrder.related_mos || []).forEach((mo) => moMap.set(mo.id, mo));

                          const rootMOs = (selectedOrder.related_mos || []).filter(
                            (mo) => !mo.parent_manufacturing_order_id
                          );
                          const childMOs = (selectedOrder.related_mos || []).filter(
                            (mo) => !!mo.parent_manufacturing_order_id
                          );

                          // Group children by parent_id
                          const childrenByParent = new Map<number, RelatedMO[]>();
                          childMOs.forEach((mo) => {
                            const pid = mo.parent_manufacturing_order_id!;
                            if (!childrenByParent.has(pid)) childrenByParent.set(pid, []);
                            childrenByParent.get(pid)!.push(mo);
                          });

                          const renderMO = (mo: RelatedMO, depth: number) => (
                            <div key={mo.id} style={{ marginLeft: depth * 20 }} className="space-y-1.5">
                              {/* MO row */}
                              <Link
                                href={`/dashboard/manufacturing/manufacturing-orders?search=${mo.mo_number}`}
                                className="group flex items-center justify-between border border-[#ded4c3] hover:border-[#1f806f] rounded-xl p-3 bg-[#fbfaf6] hover:bg-white transition-all"
                              >
                                <div className="flex items-start gap-2">
                                  {depth > 0 && (
                                    <span className="mt-0.5 text-[#ded4c3] select-none">└</span>
                                  )}
                                  <div>
                                    <p className="font-mono text-xs font-bold text-[#1f806f] group-hover:underline flex items-center gap-1">
                                      {mo.mo_number}
                                      <ExternalLink className="size-3" />
                                    </p>
                                    <p className="text-[10px] text-[#53645c] mt-0.5">
                                      Produce <span className="font-semibold">{mo.quantity}x</span> {mo.product_name}
                                    </p>
                                  </div>
                                </div>
                                <StatusBadge status={mo.status} />
                              </Link>

                              {/* Child POs under this MO */}
                              {(mo.child_pos || []).map((po, pi) => (
                                <div key={pi} style={{ marginLeft: 20 }}>
                                  <Link
                                    href={`/dashboard/purchase/purchase-orders?search=${po.po_number}`}
                                    className="group flex items-center justify-between border border-amber-200 hover:border-amber-400 rounded-xl p-2.5 bg-amber-50/60 hover:bg-white transition-all"
                                  >
                                    <div className="flex items-start gap-2">
                                      <span className="mt-0.5 text-amber-300 select-none">└</span>
                                      <div>
                                        <p className="font-mono text-xs font-bold text-amber-700 group-hover:underline flex items-center gap-1">
                                          {po.po_number}
                                          <ExternalLink className="size-3" />
                                        </p>
                                        <p className="text-[10px] text-[#53645c] mt-0.5">Buy {po.product_name}</p>
                                      </div>
                                    </div>
                                    <StatusBadge status={po.status} />
                                  </Link>
                                </div>
                              ))}

                              {/* Render child MOs recursively */}
                              {(childrenByParent.get(mo.id) || []).map((child) =>
                                renderMO(child, depth + 1)
                              )}
                            </div>
                          );

                          return (
                            <div className="space-y-2">
                              {rootMOs.length > 0 && (
                                <span className="text-[10px] font-bold text-[#68756e] uppercase">Manufacturing Jobs</span>
                              )}
                              {rootMOs.map((mo) => renderMO(mo, 0))}
                            </div>
                          );
                        })()}

                        {/* Direct POs (no MO parent) */}
                        {selectedOrder.related_pos.length > 0 && (
                          <div className="space-y-2">
                            <span className="text-[10px] font-bold text-[#68756e] uppercase">Direct Supplier Procurement</span>
                            {selectedOrder.related_pos.map((po, i) => (
                              <Link key={i} href={`/dashboard/purchase/purchase-orders?search=${po.po_number}`} className="group flex items-center justify-between border border-[#ded4c3] hover:border-[#1f806f] rounded-xl p-3 bg-[#fbfaf6] hover:bg-white transition-all">
                                <div>
                                  <p className="font-mono text-xs font-bold text-[#1f806f] group-hover:underline flex items-center gap-1">
                                    {po.po_number}
                                    <ExternalLink className="size-3" />
                                  </p>
                                </div>
                                <StatusBadge status={po.status} />
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

              </div>

              {/* Drawer Footer Actions */}
              <div className="border-t border-[#f3ebdd] p-5 bg-[#fbfaf6] flex items-center justify-between">
                <div className="text-left">
                  <span className="text-[10px] font-bold text-[#68756e] uppercase">Order Value</span>
                  <p className="text-xl font-bold text-[#18231f]">₹{Number(selectedOrder.total_amount).toFixed(2)}</p>
                </div>
                <div className="flex gap-2">
                  {selectedOrder.status === "DRAFT" && (
                    <>
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleAction("CANCEL", selectedOrder.id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-700 hover:bg-red-100 transition"
                      >
                        <XCircle className="size-4" />
                        Cancel Order
                      </button>
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleAction("CONFIRM", selectedOrder.id)}
                        className="inline-flex items-center gap-1 rounded-lg bg-[#1f806f] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#176b5d]"
                      >
                        {isPending ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <CheckCircle className="size-4" />
                        )}
                        Confirm Order
                      </button>
                    </>
                  )}

                  {(selectedOrder.status === "CONFIRMED" || selectedOrder.status === "WAITING_INVENTORY" || selectedOrder.status === "READY_TO_DELIVER") && (
                    <>
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleAction("CANCEL", selectedOrder.id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-700 hover:bg-red-100 transition"
                      >
                        <XCircle className="size-4" />
                        Cancel Order
                      </button>
                      <button
                        type="button"
                        disabled={isPending || !selectedOrder.can_deliver}
                        onClick={() => handleAction("DELIVER", selectedOrder.id)}
                        title={!selectedOrder.can_deliver ? "Manufacturing/procurement must complete first" : ""}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold shadow-sm transition ${
                          selectedOrder.can_deliver
                            ? "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed opacity-75"
                        }`}
                      >
                        {isPending ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Truck className="size-4" />
                        )}
                        Deliver Order
                      </button>
                    </>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Creation Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Create Sales Order">
        <form onSubmit={handleCreateOrder} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase text-[#405049]">Select Customer</label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(Number(e.target.value))}
              className="mt-1 h-10 w-full rounded-lg border border-[#cfc3ad] bg-white px-3 text-sm outline-none transition focus:border-[#176b5d]"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
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

            {orderItems.map((item, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <div className="flex-1">
                  <select
                    value={item.product_id}
                    onChange={(e) => handleProductChange(idx, Number(e.target.value))}
                    className="h-10 w-full rounded-lg border border-[#cfc3ad] bg-white px-2 text-sm outline-none transition focus:border-[#176b5d]"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (₹{Number(p.sale_price).toFixed(2)})
                      </option>
                    ))}
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
                    value={item.price}
                    onChange={(e) => handlePriceChange(idx, Number(e.target.value))}
                    placeholder="Price"
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
            ))}
          </div>

          <div className="flex justify-between items-center border-t border-[#e5dccb] pt-4 font-bold text-[#18231f]">
            <span>Total Value:</span>
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
