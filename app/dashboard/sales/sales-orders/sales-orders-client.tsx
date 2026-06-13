"use client";

import { useState, useTransition } from "react";
import { Plus, Search, Eye, ShoppingBag, Trash2, Loader2, CheckCircle, Truck, XCircle } from "lucide-react";
import { createSalesOrderAction, confirmSalesOrderAction, deliverSalesOrderAction, cancelSalesOrderAction } from "@/app/actions/sales";
import StatusBadge from "@/app/components/ui/StatusBadge";
import Modal from "@/app/components/ui/Modal";
import ConfirmDialog from "@/app/components/ui/ConfirmDialog";
import EmptyState from "@/app/components/ui/EmptyState";

type RelatedMO = {
  mo_number: string;
  quantity: number;
  status: string;
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
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());


  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);

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
        setIsDetailOpen(false);
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


  return (
    <div className="space-y-6">
      {/* Top panel */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#176b5d] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#12574b]"
        >
          <Plus className="size-4" />
          Create Sales Order
        </button>
      </div>

      {/* Bulk actions bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between rounded-lg border border-[#c9dbd5] bg-[#eef7f3] px-4 py-3 text-sm text-[#176b5d]">
          <div className="font-semibold">{selectedIds.size} order(s) selected</div>
          <div className="flex gap-3">
            {filteredOrders.some((o) => selectedIds.has(o.id) && o.status === "DRAFT") && (
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleBulkAction("CONFIRM")}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#176b5d] px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#12574b]"
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
        <div className="overflow-x-auto rounded-xl border border-[#d9cfbd] bg-white shadow-sm">
          <table className="w-full border-collapse text-left text-sm text-[#18231f]">
            <thead className="border-b border-[#e5dccb] bg-[#fbfaf6] text-xs font-semibold uppercase tracking-wider text-[#68756e]">
              <tr>
                <th className="px-6 py-4 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={
                      checkableOrders.length > 0 &&
                      selectedIds.size === checkableOrders.length
                    }
                    onChange={handleToggleSelectAll}
                    className="rounded border-[#cfc3ad] text-[#176b5d] focus:ring-[#176b5d]"
                  />
                </th>
                <th className="px-6 py-4">Order Number</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Items</th>
                <th className="px-6 py-4 text-right">Total Amount</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#efe7d8]">
              {filteredOrders.map((o) => {
                const isCheckable = o.status === "DRAFT" || ((o.status === "CONFIRMED" || o.status === "WAITING_INVENTORY" || o.status === "READY_TO_DELIVER") && o.can_deliver);
                return (
                  <tr key={o.id} className="hover:bg-white/60 transition-colors">
                    <td className="px-6 py-4 text-center">
                      {isCheckable ? (
                        <input
                          type="checkbox"
                          checked={selectedIds.has(o.id)}
                          onChange={() => handleToggleSelect(o.id)}
                          className="rounded border-[#cfc3ad] text-[#176b5d] focus:ring-[#176b5d]"
                        />
                      ) : null}
                    </td>
                    <td className="px-6 py-4 font-mono font-semibold text-[#176b5d]">{o.order_number}</td>
                    <td className="px-6 py-4 font-semibold text-[#202a25]">{o.customer_name}</td>
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
                    <td className="px-6 py-4 text-right text-[#53645c] font-medium">{o.item_count}</td>
                    <td className="px-6 py-4 text-right font-semibold text-[#202a25]">
                      ₹{Number(o.total_amount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedOrder(o);
                            setIsDetailOpen(true);
                          }}
                          className="inline-flex items-center gap-1 rounded-lg border border-[#cfc3ad] bg-white px-2.5 py-1 text-xs font-semibold text-[#24332d] shadow-xs transition hover:bg-[#fffaf0]"
                        >
                          <Eye className="size-3.5" />
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Order Creation Modal */}
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
                className="text-xs font-bold text-[#176b5d] hover:underline"
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
            <span className="text-xl text-[#176b5d]">₹{totalOrderAmount.toFixed(2)}</span>
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
              className="inline-flex items-center gap-2 rounded-lg bg-[#176b5d] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#12574b] disabled:opacity-60"
            >
              {isPending && <Loader2 className="size-4 animate-spin" />}
              Create Order
            </button>
          </div>
        </form>
      </Modal>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <Modal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} title={`Sales Order: ${selectedOrder.order_number}`}>
          <div className="space-y-6">
            <div className="flex justify-between items-start border-b border-[#e5dccb] pb-4">
              <div>
                <p className="text-xs font-semibold uppercase text-[#68756e]">Customer</p>
                <p className="text-base font-bold text-[#202a25] mt-0.5">{selectedOrder.customer_name}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold uppercase text-[#68756e]">Status</p>
                <div className="mt-0.5">
                  <StatusBadge 
                    status={
                      (selectedOrder.status === "CONFIRMED" || selectedOrder.status === "WAITING_INVENTORY" || selectedOrder.status === "READY_TO_DELIVER")
                        ? (selectedOrder.can_deliver ? "READY_TO_DELIVER" : "WAITING_INVENTORY")
                        : selectedOrder.status
                    } 
                  />
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold uppercase text-[#405049] mb-3">Order Items Stock Allocation Details</p>
              <div className="rounded-lg border border-[#efe7d8] overflow-hidden bg-white">
                <table className="w-full text-left text-xs text-[#18231f]">
                  <thead className="bg-[#fbfaf6] text-[#68756e] font-semibold border-b border-[#efe7d8] uppercase">
                    <tr>
                      <th className="px-4 py-2">Product</th>
                      <th className="px-4 py-2 text-right">Required</th>
                      <th className="px-4 py-2 text-right">Available</th>
                      <th className="px-4 py-2 text-right">Reserved</th>
                      <th className="px-4 py-2 text-right">Shortage</th>
                      <th className="px-4 py-2 text-right">Price</th>
                      <th className="px-4 py-2 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#efe7d8]">
                    {selectedOrder.items.map((item, idx) => {
                      const shortage = Math.max(0, item.quantity - Number(item.reserved_for_order || 0));
                      return (
                        <tr key={idx}>
                          <td className="px-4 py-2">
                            <p className="font-semibold text-[#202a25]">{item.product_name}</p>
                            <p className="text-[10px] text-[#68756e] font-mono">{item.sku}</p>
                          </td>
                          <td className="px-4 py-2 text-right text-[#53645c] font-medium">{item.quantity}</td>
                          <td className="px-4 py-2 text-right text-[#53645c]">{item.available_qty}</td>
                          <td className="px-4 py-2 text-right text-emerald-700 font-semibold">{item.reserved_for_order || 0}</td>
                          <td className="px-4 py-2 text-right font-semibold text-red-600">
                            {shortage > 0 ? shortage : "-"}
                          </td>
                          <td className="px-4 py-2 text-right text-[#53645c]">₹{Number(item.price).toFixed(2)}</td>
                          <td className="px-4 py-2 text-right font-semibold text-[#202a25]">
                            ₹{(item.quantity * item.price).toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Related Procurement & Manufacturing */}
            {(selectedOrder.related_mos.length > 0 || selectedOrder.related_pos.length > 0) && (
              <div className="grid gap-4 md:grid-cols-2 border-t border-[#e5dccb] pt-4">
                {selectedOrder.related_mos.length > 0 && (
                  <div>
                    <p className="text-xs font-bold uppercase text-[#405049] mb-2">Related Manufacturing Orders</p>
                    <div className="space-y-2">
                      {selectedOrder.related_mos.map((mo, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg border border-[#efe7d8] bg-[#fbfaf6]">
                          <div>
                            <p className="font-mono text-xs font-bold text-[#176b5d]">{mo.mo_number}</p>
                            <p className="text-[10px] text-[#68756e]">Qty to Produce: {mo.quantity}</p>
                          </div>
                          <StatusBadge status={mo.status} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {selectedOrder.related_pos.length > 0 && (
                  <div>
                    <p className="text-xs font-bold uppercase text-[#405049] mb-2">Related Purchase Orders</p>
                    <div className="space-y-2">
                      {selectedOrder.related_pos.map((po, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg border border-[#efe7d8] bg-[#fbfaf6]">
                          <div>
                            <p className="font-mono text-xs font-bold text-[#176b5d]">{po.po_number}</p>
                          </div>
                          <StatusBadge status={po.status} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-between items-center border-t border-[#e5dccb] pt-4">
              <span className="text-sm font-bold text-[#18231f]">Total Amount:</span>
              <span className="text-xl font-bold text-[#176b5d]">₹{Number(selectedOrder.total_amount).toFixed(2)}</span>
            </div>

            {/* Status transitions */}
            <div className="flex justify-end gap-3 border-t border-[#e5dccb] pt-4">
              <button
                type="button"
                onClick={() => setIsDetailOpen(false)}
                className="rounded-lg border border-[#cfc3ad] bg-white px-4 py-2 text-sm font-semibold text-[#24332d] shadow-sm transition hover:bg-[#fffaf0]"
              >
                Close
              </button>

              {selectedOrder.status === "DRAFT" && (
                <>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleAction("CANCEL", selectedOrder.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-[#8b3d1e] hover:bg-red-100 transition"
                  >
                    <XCircle className="size-4" />
                    Cancel Order
                  </button>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleAction("CONFIRM", selectedOrder.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#176b5d] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#12574b]"
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
                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-[#8b3d1e] hover:bg-red-100 transition"
                  >
                    <XCircle className="size-4" />
                    Cancel Order
                  </button>
                  <button
                    type="button"
                    disabled={isPending || !selectedOrder.can_deliver}
                    onClick={() => handleAction("DELIVER", selectedOrder.id)}
                    title={!selectedOrder.can_deliver ? "Manufacturing / procurement must be completed before delivery" : ""}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold shadow-sm transition ${
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
        </Modal>
      )}
    </div>
  );
}
