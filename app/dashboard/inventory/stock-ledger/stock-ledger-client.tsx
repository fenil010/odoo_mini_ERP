"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import StatusBadge from "@/app/components/ui/StatusBadge";
import EmptyState from "@/app/components/ui/EmptyState";

type LedgerEntry = {
  id: number;
  product_name: string;
  sku: string;
  movement_type: string;
  quantity: number;
  reference_type: string;
  reference_id: number;
  notes: string | null;
  created_at: string;
};

type StockLedgerClientProps = {
  initialLedger: LedgerEntry[];
};

export default function StockLedgerClient({ initialLedger }: StockLedgerClientProps) {
  const [ledger] = useState<LedgerEntry[]>(initialLedger);
  const [searchTerm, setSearchTerm] = useState("");
  const [movementFilter, setMovementFilter] = useState("ALL");

  const filteredLedger = ledger.filter((entry) => {
    const matchesSearch =
      entry.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (entry.notes && entry.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesMovement = movementFilter === "ALL" || entry.movement_type === movementFilter;

    return matchesSearch && matchesMovement;
  });

  return (
    <div className="space-y-6">
      {/* Search panel */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap gap-3">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#68756e]" />
            <input
              type="text"
              placeholder="Search by product, SKU, notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 w-full rounded-lg border border-[#cfc3ad] bg-white pl-10 pr-4 text-sm outline-none transition focus:border-[#176b5d] focus:ring-2 focus:ring-[#176b5d]/20"
            />
          </div>

          <select
            value={movementFilter}
            onChange={(e) => setMovementFilter(e.target.value)}
            className="h-10 rounded-lg border border-[#cfc3ad] bg-white px-3 text-sm outline-none transition focus:border-[#176b5d]"
          >
            <option value="ALL">All Movements</option>
            <option value="PURCHASE_RECEIPT">Purchase Receipts</option>
            <option value="SALES_RESERVE">Sales Reservations</option>
            <option value="SALES_DELIVERY">Sales Deliveries</option>
            <option value="MO_RESERVE">Manufacturing Reserves</option>
            <option value="MO_CONSUME">Manufacturing Consumptions</option>
            <option value="MO_PRODUCE">Manufacturing Productions</option>
            <option value="ADJUSTMENT">Adjustments</option>
          </select>
        </div>
      </div>

      {/* Table list */}
      {filteredLedger.length === 0 ? (
        <EmptyState
          title="No stock movements recorded"
          description={searchTerm || movementFilter !== "ALL" ? "Try adjusting your search filters." : "All stock movements will be logged here in chronological order."}
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#d9cfbd] bg-white shadow-sm">
          <table className="w-full border-collapse text-left text-sm text-[#18231f]">
            <thead className="border-b border-[#e5dccb] bg-[#fbfaf6] text-xs font-semibold uppercase tracking-wider text-[#68756e]">
              <tr>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Product Name</th>
                <th className="px-6 py-4 font-mono">SKU</th>
                <th className="px-6 py-4">Movement Type</th>
                <th className="px-6 py-4 text-right">Quantity Change</th>
                <th className="px-6 py-4">Document Reference</th>
                <th className="px-6 py-4">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#efe7d8]">
              {filteredLedger.map((entry) => {
                const isPositive = Number(entry.quantity) > 0;
                const qtyClass =
                  entry.movement_type === "SALES_RESERVE" || entry.movement_type === "MO_RESERVE"
                    ? "text-amber-600"
                    : isPositive
                    ? "text-emerald-600 font-bold"
                    : "text-red-600 font-bold";

                return (
                  <tr key={entry.id} className="hover:bg-white/60 transition-colors">
                    <td className="px-6 py-4 text-xs text-[#53645c]">
                      {new Date(entry.created_at).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-6 py-4 font-semibold text-[#202a25]">{entry.product_name}</td>
                    <td className="px-6 py-4 font-mono text-xs text-[#53645c]">{entry.sku}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={entry.movement_type} />
                    </td>
                    <td className={`px-6 py-4 text-right ${qtyClass}`}>
                      {isPositive ? `+${entry.quantity}` : entry.quantity}
                    </td>
                    <td className="px-6 py-4 text-xs text-[#53645c]">
                      <span className="font-semibold uppercase tracking-wider">{entry.reference_type}</span>
                      <span className="font-mono ml-1">#{entry.reference_id}</span>
                    </td>
                    <td className="px-6 py-4 text-xs text-[#68756e] max-w-xs truncate">
                      {entry.notes || "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
