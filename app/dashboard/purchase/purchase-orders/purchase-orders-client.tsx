"use client";

import { useState, useTransition } from "react";
import { Plus, Search, Eye, Landmark, Trash2, Loader2, CheckCircle, PackageOpen } from "lucide-react";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());


  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
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
        // Reset form
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
        setIsDetailOpen(false);
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


  return (
    <div className="space-y-6">
      {/* Top panel */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#176b5d] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#12574b]"
        >
          <Plus className="size-4" />
          Create Purchase Order
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
                <th className="px-6 py-4">PO Number</th>
                <th className="px-6 py-4">Vendor</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Items</th>
                <th className="px-6 py-4 text-right">Total Cost</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#efe7d8]">
              {filteredOrders.map((o) => {
                const isCheckable = o.status === "DRAFT" || o.status === "CONFIRMED";
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
                    <td className="px-6 py-4 font-mono font-semibold text-[#176b5d]">{o.po_number}</td>
                    <td className="px-6 py-4 font-semibold text-[#202a25]">{o.vendor_name}</td>
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
                    <td className="px-6 py-4 text-right text-[#53645c] font-medium">{o.item_count}</td>
                    <td className="px-6 py-4 text-right font-semibold text-[#202a25]">
                      ₹{Number(o.total_amount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-center">
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
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
                className="text-xs font-bold text-[#176b5d] hover:underline"
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

      {/* PO Detail Modal */}
      {selectedOrder && (
        <Modal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} title={`Purchase Order: ${selectedOrder.po_number}`}>
          <div className="space-y-6">
            <div className="flex justify-between items-start border-b border-[#e5dccb] pb-4">
              <div>
                <p className="text-xs font-semibold uppercase text-[#68756e]">Vendor / Supplier</p>
                <p className="text-base font-bold text-[#202a25] mt-0.5">{selectedOrder.vendor_name}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold uppercase text-[#68756e]">Status</p>
                <div className="mt-0.5">
                  <StatusBadge status={selectedOrder.status} />
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold uppercase text-[#405049] mb-3">Order Items</p>
              <div className="rounded-lg border border-[#efe7d8] overflow-hidden bg-white">
                <table className="w-full text-left text-xs text-[#18231f]">
                  <thead className="bg-[#fbfaf6] text-[#68756e] font-semibold border-b border-[#efe7d8] uppercase">
                    <tr>
                      <th className="px-4 py-2">Product Name</th>
                      <th className="px-4 py-2 text-right">Quantity</th>
                      <th className="px-4 py-2 text-right">Cost Price</th>
                      <th className="px-4 py-2 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#efe7d8]">
                    {selectedOrder.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-2">
                          <p className="font-semibold text-[#202a25]">{item.product_name}</p>
                          <p className="text-[10px] text-[#68756e] font-mono">{item.sku}</p>
                        </td>
                        <td className="px-4 py-2 text-right text-[#53645c] font-medium">{item.quantity}</td>
                        <td className="px-4 py-2 text-right text-[#53645c]">₹{Number(item.cost_price).toFixed(2)}</td>
                        <td className="px-4 py-2 text-right font-semibold text-[#202a25]">
                          ₹{(item.quantity * item.cost_price).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-between items-center border-t border-[#e5dccb] pt-4">
              <span className="text-sm font-bold text-[#18231f]">Total Cost:</span>
              <span className="text-xl font-bold text-[#176b5d]">₹{Number(selectedOrder.total_amount).toFixed(2)}</span>
            </div>

            <div className="flex justify-end gap-3 border-t border-[#e5dccb] pt-4">
              {(selectedOrder.status === "DRAFT" || selectedOrder.status === "CONFIRMED") && (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleAction("CANCEL", selectedOrder.id)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700"
                >
                  {isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Trash2 className="size-4" />
                  )}
                  Cancel Order
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsDetailOpen(false)}
                className="rounded-lg border border-[#cfc3ad] bg-white px-4 py-2 text-sm font-semibold text-[#24332d] shadow-sm transition hover:bg-[#fffaf0]"
              >
                Close
              </button>

              {selectedOrder.status === "DRAFT" && (
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
              )}

              {selectedOrder.status === "CONFIRMED" && (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleAction("RECEIVE", selectedOrder.id)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
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
        </Modal>
      )}
    </div>
  );
}
