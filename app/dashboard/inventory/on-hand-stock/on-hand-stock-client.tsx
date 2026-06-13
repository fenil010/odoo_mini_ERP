"use client";

import { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { 
  Search, 
  Loader2, 
  RefreshCw, 
  Grid, 
  List, 
  Warehouse, 
  Percent, 
  AlertTriangle, 
  Activity, 
  CheckCircle,
  TrendingUp,
  DollarSign
} from "lucide-react";
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
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams ? (searchParams.get("search") || "") : "");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState<"GRID" | "TABLE">("GRID");

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

  // Inventory KPIs
  const totalPhysicalUnits = stock.reduce((sum, item) => sum + item.on_hand_qty, 0);
  const totalReservedUnits = stock.reduce((sum, item) => sum + item.reserved_qty, 0);
  const lowStockCount = stock.filter((item) => item.available_qty <= 5).length;

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

  const getStockStatus = (item: StockItem) => {
    if (item.available_qty <= 0) return { label: "Out of Stock", color: "text-red-600 bg-red-50 border-red-200" };
    if (item.available_qty <= 5) return { label: "Critically Low", color: "text-amber-600 bg-amber-50 border-amber-200" };
    return { label: "Optimal Stock", color: "text-emerald-700 bg-emerald-50 border-emerald-200" };
  };

  return (
    <div className="space-y-6">
      
      {/* Inventory KPIs */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#ded4c3] bg-white p-5 shadow-xs flex items-center justify-between hover:shadow-md transition-all duration-300">
          <div>
            <span className="text-[10px] font-bold text-[#68756e] uppercase tracking-wider">Physical On Hand Units</span>
            <h3 className="text-2xl font-bold text-[#18231f] mt-1">{totalPhysicalUnits.toLocaleString()}</h3>
            <p className="text-[10px] text-[#53645c] mt-1">Total count stored in warehouse</p>
          </div>
          <div className="flex size-12 items-center justify-center rounded-xl border border-teal-200 bg-teal-50 text-teal-700">
            <Warehouse className="size-5" />
          </div>
        </div>
        <div className="rounded-2xl border border-[#ded4c3] bg-white p-5 shadow-xs flex items-center justify-between hover:shadow-md transition-all duration-300">
          <div>
            <span className="text-[10px] font-bold text-[#68756e] uppercase tracking-wider">Reserved Demand</span>
            <h3 className="text-2xl font-bold text-indigo-600 mt-1">{totalReservedUnits.toLocaleString()}</h3>
            <p className="text-[10px] text-[#53645c] mt-1">Stock committed to active customer sales</p>
          </div>
          <div className="flex size-12 items-center justify-center rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700">
            <Percent className="size-5" />
          </div>
        </div>
        <div className="rounded-2xl border border-[#ded4c3] bg-white p-5 shadow-xs flex items-center justify-between hover:shadow-md transition-all duration-300">
          <div>
            <span className="text-[10px] font-bold text-[#68756e] uppercase tracking-wider">Low Stock Warnings</span>
            <h3 className="text-2xl font-bold text-amber-500 mt-1">{lowStockCount} Products</h3>
            <p className="text-[10px] text-[#53645c] mt-1">Items at or below safety stock target</p>
          </div>
          <div className="flex size-12 items-center justify-center rounded-xl border border-amber-200 bg-amber-50 text-amber-600">
            <AlertTriangle className="size-5 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Filter controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#ded4c3] pb-5">
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

        {/* View Toggle */}
        <div className="inline-flex rounded-lg border border-[#cfc3ad] bg-white p-1">
          <button
            onClick={() => setViewMode("GRID")}
            className={`rounded-md p-1.5 transition ${viewMode === "GRID" ? "bg-[#1f806f] text-white" : "text-[#53645c] hover:bg-[#f7f4ed]"}`}
            title="Card Grid"
          >
            <Grid className="size-4" />
          </button>
          <button
            onClick={() => setViewMode("TABLE")}
            className={`rounded-md p-1.5 transition ${viewMode === "TABLE" ? "bg-[#1f806f] text-white" : "text-[#53645c] hover:bg-[#f7f4ed]"}`}
            title="Data Table"
          >
            <List className="size-4" />
          </button>
        </div>
      </div>

      {/* Main Stock display */}
      {filteredStock.length === 0 ? (
        <EmptyState
          title="No inventory records found"
          description={searchTerm || typeFilter !== "ALL" ? "Try adjusting your search filters." : "Inventory levels are managed automatically through purchase, sales, and manufacturing."}
        />
      ) : viewMode === "GRID" ? (
        /* Circular Allocation visual cards */
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredStock.map((s) => {
            const status = getStockStatus(s);
            const totalStock = s.on_hand_qty;
            const reservedPercent = totalStock > 0 ? Math.min(100, Math.round((s.reserved_qty / totalStock) * 100)) : 0;
            const availPercent = totalStock > 0 ? Math.min(100, Math.round((s.available_qty / totalStock) * 100)) : 0;

            return (
              <div key={s.id} className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-[#ded4c3] bg-white shadow-xs hover:shadow-lg hover:border-[#1f806f]/40 transition-all duration-300">
                
                {/* Image and Meta info */}
                <div className="relative aspect-video w-full border-b border-[#f3ebdd] bg-[#f7f4ed] overflow-hidden">
                  <ProductImage src={s.image_url} alt={s.product_name} />
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <span className="rounded-md bg-black/60 backdrop-blur-xs px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                      {s.sku}
                    </span>
                    <span className={`rounded-md border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                  <div className="absolute bottom-3 right-3">
                    <span className="rounded-md bg-white border border-[#ded4c3] shadow-xs px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#68756e]">
                      {s.product_type.replace("_", " ")}
                    </span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-5 flex-1">
                  <h4 className="font-bold text-[#18231f] group-hover:text-[#1f806f] transition-colors leading-snug truncate">
                    {s.product_name}
                  </h4>

                  {/* Stock Metrics Row */}
                  <div className="mt-4 grid grid-cols-3 gap-2 border-y border-[#f3ebdd] py-3 text-center text-xs">
                    <div>
                      <span className="text-[9px] text-[#68756e] font-bold uppercase">On Hand</span>
                      <p className="font-bold text-[#18231f] mt-0.5">{s.on_hand_qty}</p>
                    </div>
                    <div>
                      <span className="text-[9px] text-[#68756e] font-bold uppercase">Reserved</span>
                      <p className="font-bold text-amber-600 mt-0.5">{s.reserved_qty}</p>
                    </div>
                    <div>
                      <span className="text-[9px] text-[#68756e] font-bold uppercase">Available</span>
                      <p className="font-bold text-emerald-700 mt-0.5">{s.available_qty}</p>
                    </div>
                  </div>

                  {/* Visual Progress allocation */}
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-[10px] text-[#68756e] font-bold uppercase">
                      <span>Allocation Breakdown</span>
                      <span>{availPercent}% Available</span>
                    </div>
                    {/* Multi-segmented bar */}
                    <div className="h-2 w-full rounded-full bg-slate-100 flex overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 transition-all duration-500" 
                        style={{ width: `${availPercent}%` }}
                        title="Available Stock"
                      />
                      <div 
                        className="h-full bg-amber-500 transition-all duration-500" 
                        style={{ width: `${reservedPercent}%` }}
                        title="Reserved Stock"
                      />
                    </div>
                  </div>
                </div>

                {/* Adjust Stock Button Footer */}
                <div className="flex items-center justify-end bg-[#fbfaf6] border-t border-[#f3ebdd] px-4 py-3">
                  <button
                    type="button"
                    onClick={() => {
                      setFormError("");
                      setSelectedItem(s);
                      setIsOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#cfc3ad] bg-white px-3 py-1.5 text-xs font-bold text-[#405049] hover:bg-[#fffaf0] transition-colors"
                  >
                    <RefreshCw className="size-3" />
                    Adjust Stock
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Data table list layout */
        <div className="overflow-x-auto rounded-2xl border border-[#ded4c3] bg-white shadow-xs">
          <table className="w-full border-collapse text-left text-sm text-[#18231f]">
            <thead className="border-b border-[#ded4c3] bg-[#fbfaf6] text-xs font-bold uppercase tracking-wider text-[#68756e]">
              <tr>
                <th className="px-6 py-4">Product / SKU</th>
                <th className="px-6 py-4">Classification</th>
                <th className="px-6 py-4 text-right">Physical On Hand</th>
                <th className="px-6 py-4 text-right">Reserved Demand</th>
                <th className="px-6 py-4 text-right">Available for Sales</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f3ebdd]">
              {filteredStock.map((s) => (
                <tr key={s.id} className="hover:bg-[#fbfaf6]/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="size-11 shrink-0 rounded-lg border border-[#f3ebdd] overflow-hidden bg-[#f7f4ed]">
                        <ProductImage src={s.image_url} alt={s.product_name} />
                      </div>
                      <div>
                        <div className="font-bold text-[#202a25]">{s.product_name}</div>
                        <div className="text-xs text-[#68756e] font-mono mt-0.5">{s.sku}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={s.product_type} />
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-[#202a25]">{s.on_hand_qty}</td>
                  <td className="px-6 py-4 text-right text-[#53645c] font-semibold">{s.reserved_qty}</td>
                  <td className="px-6 py-4 text-right font-bold text-[#1f806f]">{s.available_qty}</td>
                  <td className="px-6 py-4 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setFormError("");
                        setSelectedItem(s);
                        setIsOpen(true);
                      }}
                      className="inline-flex items-center gap-1 rounded-lg border border-[#cfc3ad] bg-white px-2.5 py-1.5 text-xs font-bold text-[#405049] hover:bg-[#fffaf0] transition-colors"
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
            <div className="bg-[#f7f4ed] p-4 rounded-xl border border-[#efe7d8] text-xs text-[#53645c] space-y-1.5">
              <div>SKU: <span className="font-mono font-bold text-[#18231f]">{selectedItem.sku}</span></div>
              <div className="flex justify-between border-t border-[#f3ebdd] pt-1.5">
                <span>Physical Stock On Hand:</span>
                <span className="font-bold text-[#18231f]">{selectedItem.on_hand_qty}</span>
              </div>
              <div className="flex justify-between">
                <span>Reserved for Sales Orders:</span>
                <span className="font-bold text-[#18231f]">{selectedItem.reserved_qty}</span>
              </div>
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
                placeholder="e.g. Physical inventory adjustment"
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
                className="inline-flex items-center gap-2 rounded-lg bg-[#1f806f] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#176b5d] disabled:opacity-60"
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
