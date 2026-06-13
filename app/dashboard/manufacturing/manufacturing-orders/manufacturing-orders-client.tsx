"use client";

import { useState, useTransition } from "react";
import { Plus, Search, Eye, Play, CheckSquare, Loader2, AlertCircle } from "lucide-react";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
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
        setIsDetailOpen(false);
        window.location.reload();
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Top panel */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#176b5d] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#12574b]"
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
        <div className="overflow-x-auto rounded-xl border border-[#d9cfbd] bg-white shadow-sm">
          <table className="w-full border-collapse text-left text-sm text-[#18231f]">
            <thead className="border-b border-[#e5dccb] bg-[#fbfaf6] text-xs font-semibold uppercase tracking-wider text-[#68756e]">
              <tr>
                <th className="px-6 py-4">MO Number</th>
                <th className="px-6 py-4">Product Name</th>
                <th className="px-6 py-4 text-right">Quantity</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Sales Order Ref</th>
                <th className="px-6 py-4">Date Planned</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#efe7d8]">
              {filteredOrders.map((o) => (
                <tr key={o.id} className="hover:bg-white/60 transition-colors">
                  <td className="px-6 py-4 font-mono font-semibold text-[#176b5d]">{o.mo_number}</td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-[#202a25]">{o.product_name}</span>
                    <span className="block text-xs font-mono text-[#68756e] mt-0.5">{o.sku}</span>
                  </td>
                  <td className="px-6 py-4 text-right text-[#202a25] font-semibold">{o.quantity}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-[#53645c]">
                    {o.sales_order_number || "Manual demand"}
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
              ))}
            </tbody>
          </table>
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
              className="inline-flex items-center gap-2 rounded-lg bg-[#176b5d] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#12574b] disabled:opacity-60"
            >
              {isPending && <Loader2 className="size-4 animate-spin" />}
              Create Order
            </button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      {selectedOrder && (
        <Modal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} title={`MO details: ${selectedOrder.mo_number}`}>
          <div className="space-y-6">
            <div className="flex justify-between items-start border-b border-[#e5dccb] pb-4">
              <div>
                <p className="text-xs font-semibold uppercase text-[#68756e]">Finished Product</p>
                <p className="text-base font-bold text-[#202a25] mt-0.5">{selectedOrder.product_name}</p>
                <p className="text-xs font-mono text-[#68756e]">{selectedOrder.sku}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold uppercase text-[#68756e]">Status / Qty</p>
                <div className="mt-0.5 flex flex-col gap-1 items-end">
                  <StatusBadge status={selectedOrder.status} />
                  <span className="text-xs text-[#53645c] mt-0.5">Quantity: {selectedOrder.quantity}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-[#53645c]">Sales Order Link:</span>
              <span className="font-semibold text-[#202a25]">
                {selectedOrder.sales_order_number || "Manual creation (No Sales Order link)"}
              </span>
            </div>

            {selectedOrder.status === "WAITING_MATERIALS" && (
              <div className="flex items-start gap-2.5 rounded-lg border border-[#e4b7a3] bg-[#fff2eb] p-3 text-xs text-[#8b3d1e] leading-5">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <div>
                  This order is blocked because raw materials/components are short in the warehouse. 
                  Purchase orders have been generated automatically. Once materials are received, 
                  this order will transition to READY.
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 border-t border-[#e5dccb] pt-4">
              {(selectedOrder.status === "WAITING_MATERIALS" || selectedOrder.status === "READY" || selectedOrder.status === "IN_PROGRESS") && (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleAction("CANCEL", selectedOrder.id)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700"
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
                onClick={() => setIsDetailOpen(false)}
                className="rounded-lg border border-[#cfc3ad] bg-white px-4 py-2 text-sm font-semibold text-[#24332d] shadow-sm transition hover:bg-[#fffaf0]"
              >
                Close
              </button>

              {selectedOrder.status === "READY" && (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleAction("START", selectedOrder.id)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#176b5d] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#12574b]"
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
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
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
        </Modal>
      )}
    </div>
  );
}
