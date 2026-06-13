"use client";

import { useState, useTransition } from "react";
import { Plus, Search, Eye, Trash2, Loader2, Wrench } from "lucide-react";
import { createBomAction, deleteBomAction } from "@/app/actions/bom";
import Modal from "@/app/components/ui/Modal";
import ConfirmDialog from "@/app/components/ui/ConfirmDialog";
import EmptyState from "@/app/components/ui/EmptyState";

type BomComponent = {
  component_product_id: number;
  component_name: string;
  sku: string;
  quantity: number;
};

type Bom = {
  id: number;
  product_id: number;
  product_name: string;
  sku: string;
  item_count: number;
  components: BomComponent[];
};

type Product = {
  id: number;
  name: string;
  sku: string;
};

type BomPlanningClientProps = {
  initialBoms: Bom[];
  products: Product[];
  rawMaterials: Product[];
};

export default function BomPlanningClient({ initialBoms, products, rawMaterials }: BomPlanningClientProps) {
  const [boms, setBoms] = useState<Bom[]>(initialBoms);
  const [searchTerm, setSearchTerm] = useState("");

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedBom, setSelectedBom] = useState<Bom | null>(null);

  // Form states
  const [selectedProductId, setSelectedProductId] = useState<number>(products[0]?.id || 0);
  const [bomItems, setBomItems] = useState<{ component_product_id: number; quantity: number }[]>([
    { component_product_id: rawMaterials[0]?.id || 0, quantity: 1 },
  ]);

  const [formError, setFormError] = useState("");
  const [isPending, startTransition] = useTransition();

  const filteredBoms = boms.filter((b) =>
    b.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  function addBomItem() {
    setBomItems([...bomItems, { component_product_id: rawMaterials[0]?.id || 0, quantity: 1 }]);
  }

  function removeBomItem(index: number) {
    if (bomItems.length === 1) return;
    setBomItems(bomItems.filter((_, i) => i !== index));
  }

  function handleComponentChange(index: number, componentProductId: number) {
    const newItems = [...bomItems];
    newItems[index].component_product_id = componentProductId;
    setBomItems(newItems);
  }

  function handleQuantityChange(index: number, quantity: number) {
    const newItems = [...bomItems];
    newItems[index].quantity = quantity;
    setBomItems(newItems);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");

    if (bomItems.some((item) => item.component_product_id === 0)) {
      setFormError("All items must have a selected component.");
      return;
    }

    startTransition(async () => {
      const res = await createBomAction(selectedProductId, bomItems);
      if (res.error) setFormError(res.error);
      else {
        setIsAddOpen(false);
        // Reset form
        setSelectedProductId(products[0]?.id || 0);
        setBomItems([{ component_product_id: rawMaterials[0]?.id || 0, quantity: 1 }]);
        window.location.reload();
      }
    });
  }

  async function handleDeleteConfirm() {
    if (!selectedBom) return;
    startTransition(async () => {
      const res = await deleteBomAction(selectedBom.id);
      if (res.error) alert(res.error);
      else {
        setIsDeleteOpen(false);
        setSelectedBom(null);
        window.location.reload();
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Top panel */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#68756e]" />
          <input
            type="text"
            placeholder="Search finished products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-10 w-full rounded-lg border border-[#cfc3ad] bg-white pl-10 pr-4 text-sm outline-none transition focus:border-[#176b5d] focus:ring-2 focus:ring-[#176b5d]/20"
          />
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
          Configure BoM
        </button>
      </div>

      {/* Table list */}
      {filteredBoms.length === 0 ? (
        <EmptyState
          title="No bills of materials found"
          description="Configure bills of materials (BoMs) for finished goods to automate raw material consumption."
          actionLabel="Configure BoM"
          onAction={() => setIsAddOpen(true)}
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#d9cfbd] bg-white shadow-sm">
          <table className="w-full border-collapse text-left text-sm text-[#18231f]">
            <thead className="border-b border-[#e5dccb] bg-[#fbfaf6] text-xs font-semibold uppercase tracking-wider text-[#68756e]">
              <tr>
                <th className="px-6 py-4">Finished Product</th>
                <th className="px-6 py-4 font-mono">SKU</th>
                <th className="px-6 py-4 text-right">Components Count</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#efe7d8]">
              {filteredBoms.map((b) => (
                <tr key={b.id} className="hover:bg-white/60 transition-colors">
                  <td className="px-6 py-4 font-semibold text-[#202a25]">{b.product_name}</td>
                  <td className="px-6 py-4 font-mono text-xs text-[#53645c]">{b.sku}</td>
                  <td className="px-6 py-4 text-right text-[#202a25] font-semibold">{b.item_count}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedBom(b);
                          setIsDetailOpen(true);
                        }}
                        className="inline-flex items-center gap-1 rounded-lg border border-[#cfc3ad] bg-white px-2.5 py-1 text-xs font-semibold text-[#24332d] shadow-xs transition hover:bg-[#fffaf0]"
                      >
                        <Eye className="size-3.5" />
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedBom(b);
                          setIsDeleteOpen(true);
                        }}
                        className="rounded-lg p-1.5 text-[#53645c] hover:bg-red-50 hover:text-[#8b3d1e] transition"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Configure Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Configure Bill of Materials">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase text-[#405049]">Finished Good Product</label>
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

          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-[#e5dccb] pb-2">
              <span className="text-xs font-bold uppercase text-[#405049]">Required Components</span>
              <button
                type="button"
                onClick={addBomItem}
                className="text-xs font-bold text-[#176b5d] hover:underline"
              >
                + Add Component
              </button>
            </div>

            {bomItems.map((item, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <div className="flex-1">
                  <select
                    value={item.component_product_id}
                    onChange={(e) => handleComponentChange(idx, Number(e.target.value))}
                    className="h-10 w-full rounded-lg border border-[#cfc3ad] bg-white px-2 text-sm outline-none transition focus:border-[#176b5d]"
                  >
                    {rawMaterials.map((rm) => (
                      <option key={rm.id} value={rm.id}>
                        {rm.name} ({rm.sku})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-28">
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(idx, Number(e.target.value))}
                    placeholder="Qty"
                    className="h-10 w-full rounded-lg border border-[#cfc3ad] bg-white px-3 text-sm text-center outline-none transition focus:border-[#176b5d]"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeBomItem(idx)}
                  className="rounded-lg p-1.5 text-[#53645c] hover:bg-red-50 hover:text-[#8b3d1e]"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
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
              Save BoM
            </button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      {selectedBom && (
        <Modal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} title={`BoM: ${selectedBom.product_name}`}>
          <div className="space-y-4">
            <div className="border-b border-[#efe7d8] pb-3">
              <span className="text-xs font-semibold uppercase text-[#68756e]">Product SKU</span>
              <span className="block font-mono font-bold text-[#18231f] mt-0.5">{selectedBom.sku}</span>
            </div>

            <div>
              <span className="text-xs font-bold uppercase text-[#405049] block mb-2">Components Recipe</span>
              <div className="rounded-lg border border-[#efe7d8] overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#fbfaf6] text-[#68756e] font-semibold border-b border-[#efe7d8]">
                    <tr>
                      <th className="px-4 py-2">Component Name</th>
                      <th className="px-4 py-2 font-mono">SKU</th>
                      <th className="px-4 py-2 text-right">Quantity Required</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#efe7d8]">
                    {selectedBom.components.map((item, idx) => (
                      <tr key={idx} className="bg-white">
                        <td className="px-4 py-2 text-[#202a25] font-semibold">{item.component_name}</td>
                        <td className="px-4 py-2 font-mono text-[#53645c]">{item.sku}</td>
                        <td className="px-4 py-2 text-right font-bold text-[#176b5d]">{item.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-[#e5dccb]">
              <button
                type="button"
                onClick={() => setIsDetailOpen(false)}
                className="rounded-lg border border-[#cfc3ad] bg-white px-4 py-2 text-sm font-semibold text-[#24332d] shadow-sm transition hover:bg-[#fffaf0]"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Modal */}
      {selectedBom && (
        <ConfirmDialog
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          onConfirm={handleDeleteConfirm}
          title="Delete Bill of Materials"
          message={`Are you sure you want to delete the BoM configuration for ${selectedBom.product_name}?`}
          confirmLabel="Delete"
          isDestructive
        />
      )}
    </div>
  );
}
