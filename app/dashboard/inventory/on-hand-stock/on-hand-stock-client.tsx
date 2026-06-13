"use client";

import { useState, useTransition } from "react";
import { Search, Loader2, RefreshCw } from "lucide-react";
import { adjustInventoryAction } from "@/app/actions/inventory";
import StatusBadge from "@/app/components/ui/StatusBadge";
import Modal from "@/app/components/ui/Modal";
import EmptyState from "@/app/components/ui/EmptyState";
import { ProductImage } from "../../product-image";

type StockItem = {
  id: number;
  product_id: number;
  product_name: string;
  sku: string;
  image_url: string | null;
  product_type: string;
  on_hand_qty: number;
  reserved_qty: number;
  available_qty: number;
};

type OnHandStockClientProps = {
  initialStock: StockItem[];
};

export default function OnHandStockClient({ initialStock }: OnHandStockClientProps) {
  const [stock, setStock] = useState<StockItem[]>(initialStock);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");

  // Adjustment Modal
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);

  // Form states
  const [adjustType, setAdjustType] = useState<"ADD" | "REMOVE">("ADD");
  const [adjustQty, setAdjustQty] = useState<number>(1);
  const [reason, setReason] = useState("");

  const [formError, setFormError] = useState("");
  const [isPending, startTransition] = useTransition();

  const filteredStock = stock.filter((s) => {
    const matchesSearch =
      s.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.sku.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === "ALL" || s.product_type === typeFilter;

    return matchesSearch && matchesType;
  });

  async function handleAdjustSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedItem) return;
    setFormError("");

    if (adjustQty < 1) {
      setFormError("Adjustment quantity must be at least 1.");
      return;
    }
    if (!reason.trim()) {
      setFormError("Reason is required.");
      return;
    }

    const delta = adjustType === "ADD" ? adjustQty : -adjustQty;

    startTransition(async () => {
      const res = await adjustInventoryAction(selectedItem.product_id, delta, reason);
      if (res.error) setFormError(res.error);
      else {
        setIsOpen(false);
        setAdjustQty(1);
        setReason("");
        window.location.reload();
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Top filter panel */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap gap-3">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#68756e]" />
            <input
              type="text"
              placeholder="Search by product or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 w-full rounded-lg border border-[#cfc3ad] bg-white pl-10 pr-4 text-sm outline-none transition focus:border-[#176b5d] focus:ring-2 focus:ring-[#176b5d]/20"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-10 rounded-lg border border-[#cfc3ad] bg-white px-3 text-sm outline-none transition focus:border-[#176b5d]"
          >
            <option value="ALL">All Types</option>
            <option value="FINISHED_GOOD">Finished Goods</option>
            <option value="RAW_MATERIAL">Raw Materials</option>
          </select>
        </div>
      </div>

      {/* Table list */}
      {filteredStock.length === 0 ? (
        <EmptyState
          title="No inventory records found"
          description={searchTerm || typeFilter !== "ALL" ? "Try adjusting your search filters." : "Inventory levels are managed automatically through purchase, sales, and manufacturing."}
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#d9cfbd] bg-white shadow-sm">
          <table className="w-full border-collapse text-left text-sm text-[#18231f]">
            <thead className="border-b border-[#e5dccb] bg-[#fbfaf6] text-xs font-semibold uppercase tracking-wider text-[#68756e]">
              <tr>
                <th className="px-6 py-4">Product / SKU</th>
                <th className="px-6 py-4">Classification</th>
                <th className="px-6 py-4 text-right">Physical On Hand</th>
                <th className="px-6 py-4 text-right">Reserved Demand</th>
                <th className="px-6 py-4 text-right">Available for Sales</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#efe7d8]">
              {filteredStock.map((s) => (
                <tr key={s.id} className="hover:bg-white/60 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="size-11 shrink-0 rounded-lg border border-[#efe7d8] overflow-hidden bg-[#f7f4ed]">
                        <ProductImage src={s.image_url} alt={s.product_name} />
                      </div>
                      <div>
                        <div className="font-semibold text-[#202a25]">{s.product_name}</div>
                        <div className="text-xs text-[#68756e] font-mono mt-0.5">{s.sku}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={s.product_type} />
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-[#202a25]">{s.on_hand_qty}</td>
                  <td className="px-6 py-4 text-right text-[#53645c] font-medium">{s.reserved_qty}</td>
                  <td className="px-6 py-4 text-right font-bold text-[#176b5d]">{s.available_qty}</td>
                  <td className="px-6 py-4 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setFormError("");
                        setSelectedItem(s);
                        setIsOpen(true);
                      }}
                      className="inline-flex items-center gap-1 rounded-lg border border-[#cfc3ad] bg-white px-2.5 py-1 text-xs font-semibold text-[#24332d] shadow-xs transition hover:bg-[#fffaf0]"
                    >
                      <RefreshCw className="size-3.5" />
                      Adjust Stock
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {selectedItem && (
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={`Stock adjustment: ${selectedItem.product_name}`}>
          <form onSubmit={handleAdjustSubmit} className="space-y-4">
            <div className="bg-[#f7f4ed] p-3 rounded-lg border border-[#efe7d8] text-xs text-[#53645c] space-y-1">
              <div>SKU: <span className="font-mono font-bold text-[#18231f]">{selectedItem.sku}</span></div>
              <div>Current physical stock: <span className="font-bold text-[#18231f]">{selectedItem.on_hand_qty}</span></div>
              <div>Current reserved stock: <span className="font-bold text-[#18231f]">{selectedItem.reserved_qty}</span></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase text-[#405049]">Adjustment Action</label>
                <select
                  value={adjustType}
                  onChange={(e) => setAdjustType(e.target.value as "ADD" | "REMOVE")}
                  className="mt-1 h-10 w-full rounded-lg border border-[#cfc3ad] bg-white px-2 text-sm outline-none transition focus:border-[#176b5d]"
                >
                  <option value="ADD">Add Stock (+)</option>
                  <option value="REMOVE">Remove Stock (-)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-[#405049]">Quantity</label>
                <input
                  required
                  type="number"
                  min="1"
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(Number(e.target.value))}
                  placeholder="e.g. 10"
                  className="mt-1 h-10 w-full rounded-lg border border-[#cfc3ad] bg-white px-3 text-sm outline-none transition focus:border-[#176b5d]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-[#405049]">Reason / Notes</label>
              <input
                required
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Periodic physical count correction"
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
                onClick={() => setIsOpen(false)}
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
                Submit Adjustment
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
