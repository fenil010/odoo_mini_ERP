"use client";

import { useState, useTransition } from "react";
import { Plus, Search, Edit2, Trash2, Loader2, Image as ImageIcon } from "lucide-react";
import { createProductAction, updateProductAction, deleteProductAction } from "@/app/actions/products";
import StatusBadge from "@/app/components/ui/StatusBadge";
import Modal from "@/app/components/ui/Modal";
import ConfirmDialog from "@/app/components/ui/ConfirmDialog";
import EmptyState from "@/app/components/ui/EmptyState";
import { ProductImage } from "../../product-image";

type Product = {
  id: number;
  name: string;
  sku: string;
  sale_price: number;
  cost_price: number;
  procurement_type: "BUY" | "MANUFACTURE";
  procure_on_demand: boolean;
  image_url: string | null;
  product_type: "FINISHED_GOOD" | "RAW_MATERIAL";
  on_hand_qty: number;
  reserved_qty: number;
};

type ProductMasterClientProps = {
  initialProducts: Product[];
  readOnly?: boolean;
};

export default function ProductMasterClient({ initialProducts, readOnly = false }: ProductMasterClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [procurementFilter, setProcurementFilter] = useState("ALL");

  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Form error states
  const [formError, setFormError] = useState("");
  const [isPending, startTransition] = useTransition();

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === "ALL" || p.product_type === typeFilter;
    const matchesProcurement = procurementFilter === "ALL" || p.procurement_type === procurementFilter;

    return matchesSearch && matchesType && matchesProcurement;
  });

  async function handleAddProduct(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError("");
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await createProductAction(null, formData);
      if (res.error) {
        setFormError(res.error);
      } else {
        setIsAddOpen(false);
        // Refresh products (simple local update or page refresh)
        window.location.reload();
      }
    });
  }

  async function handleEditProduct(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedProduct) return;
    setFormError("");
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await updateProductAction(selectedProduct.id, null, formData);
      if (res.error) {
        setFormError(res.error);
      } else {
        setIsEditOpen(false);
        setSelectedProduct(null);
        window.location.reload();
      }
    });
  }

  async function handleDeleteConfirm() {
    if (!selectedProduct) return;
    startTransition(async () => {
      const res = await deleteProductAction(selectedProduct.id);
      if (res.error) {
        alert(res.error);
      } else {
        setIsDeleteOpen(false);
        setSelectedProduct(null);
        window.location.reload();
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Action panel */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search and Filter */}
        <div className="flex flex-1 flex-wrap gap-3">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#68756e]" />
            <input
              type="text"
              placeholder="Search by name or SKU..."
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

          <select
            value={procurementFilter}
            onChange={(e) => setProcurementFilter(e.target.value)}
            className="h-10 rounded-lg border border-[#cfc3ad] bg-white px-3 text-sm outline-none transition focus:border-[#176b5d]"
          >
            <option value="ALL">All Procurement</option>
            <option value="BUY">Buy</option>
            <option value="MANUFACTURE">Manufacture</option>
          </select>
        </div>

        {!readOnly && (
          <button
            type="button"
            onClick={() => {
              setFormError("");
              setIsAddOpen(true);
            }}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#176b5d] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#12574b]"
          >
            <Plus className="size-4" />
            Add Product
          </button>
        )}
      </div>

      {/* Table section */}
      {filteredProducts.length === 0 ? (
        <EmptyState
          title="No products found"
          description={searchTerm || typeFilter !== "ALL" || procurementFilter !== "ALL" ? "Try adjusting your search filters." : "Get started by adding your first product to the master database."}
          actionLabel={!readOnly && !searchTerm ? "Add Product" : undefined}
          onAction={!readOnly ? () => setIsAddOpen(true) : undefined}
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#d9cfbd] bg-white shadow-sm">
          <table className="w-full border-collapse text-left text-sm text-[#18231f]">
            <thead className="border-b border-[#e5dccb] bg-[#fbfaf6] text-xs font-semibold uppercase tracking-wider text-[#68756e]">
              <tr>
                <th className="px-6 py-4">Product / SKU</th>
                <th className="px-6 py-4">Classification</th>
                <th className="px-6 py-4">Procurement</th>
                <th className="px-6 py-4 text-right">Sale Price</th>
                <th className="px-6 py-4 text-right">Cost Price</th>
                <th className="px-6 py-4 text-right">On Hand</th>
                <th className="px-6 py-4 text-right">Reserved</th>
                {!readOnly && <th className="px-6 py-4 text-center">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#efe7d8]">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-white/60 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="size-11 shrink-0 rounded-lg border border-[#efe7d8] overflow-hidden bg-[#f7f4ed]">
                        <ProductImage src={p.image_url} alt={p.name} />
                      </div>
                      <div>
                        <div className="font-semibold text-[#202a25]">{p.name}</div>
                        <div className="text-xs text-[#68756e] font-mono mt-0.5">{p.sku}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={p.product_type} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1 items-start">
                      <StatusBadge status={p.procurement_type} />
                      {p.procure_on_demand && (
                        <span className="text-[10px] text-[#176b5d] font-semibold uppercase tracking-wider bg-[#eef7f3] px-1 rounded-sm mt-0.5">
                          On Demand
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-[#202a25]">
                    ₹{Number(p.sale_price).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-[#68756e]">
                    ₹{Number(p.cost_price).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-[#202a25]">
                    {p.on_hand_qty}
                  </td>
                  <td className="px-6 py-4 text-right text-[#53645c]">
                    {p.reserved_qty}
                  </td>
                  {!readOnly && (
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setFormError("");
                            setSelectedProduct(p);
                            setIsEditOpen(true);
                          }}
                          className="rounded-lg p-1.5 text-[#53645c] hover:bg-black/5 hover:text-[#176b5d] transition"
                        >
                          <Edit2 className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedProduct(p);
                            setIsDeleteOpen(true);
                          }}
                          className="rounded-lg p-1.5 text-[#53645c] hover:bg-red-50 hover:text-[#8b3d1e] transition"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Create New Product">
        <form onSubmit={handleAddProduct} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs font-bold uppercase text-[#405049]">Product Name</label>
              <input
                required
                name="name"
                type="text"
                placeholder="e.g. Leather Sofa"
                className="mt-1 h-10 w-full rounded-lg border border-[#cfc3ad] bg-white px-3 text-sm outline-none transition focus:border-[#176b5d]"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-[#405049]">SKU</label>
              <input
                required
                name="sku"
                type="text"
                placeholder="SOFA-LTHR-01"
                className="mt-1 h-10 w-full rounded-lg border border-[#cfc3ad] bg-white px-3 text-sm outline-none transition focus:border-[#176b5d]"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-[#405049]">Product Type</label>
              <select
                name="product_type"
                className="mt-1 h-10 w-full rounded-lg border border-[#cfc3ad] bg-white px-2 text-sm outline-none transition focus:border-[#176b5d]"
              >
                <option value="FINISHED_GOOD">Finished Good</option>
                <option value="RAW_MATERIAL">Raw Material</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-[#405049]">Sale Price (INR)</label>
              <input
                required
                name="sale_price"
                type="number"
                step="0.01"
                min="0"
                placeholder="499.99"
                className="mt-1 h-10 w-full rounded-lg border border-[#cfc3ad] bg-white px-3 text-sm outline-none transition focus:border-[#176b5d]"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-[#405049]">Cost Price (INR)</label>
              <input
                required
                name="cost_price"
                type="number"
                step="0.01"
                min="0"
                placeholder="150.00"
                className="mt-1 h-10 w-full rounded-lg border border-[#cfc3ad] bg-white px-3 text-sm outline-none transition focus:border-[#176b5d]"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-[#405049]">Procurement Strategy</label>
              <select
                name="procurement_type"
                className="mt-1 h-10 w-full rounded-lg border border-[#cfc3ad] bg-white px-2 text-sm outline-none transition focus:border-[#176b5d]"
              >
                <option value="BUY">Buy (Purchase Order)</option>
                <option value="MANUFACTURE">Manufacture (Manufacturing Order)</option>
              </select>
            </div>
            <div className="flex items-center gap-2 pt-5">
              <input
                type="checkbox"
                name="procure_on_demand"
                id="add_procure_on_demand"
                defaultChecked
                className="size-4 rounded border-[#cfc3ad] text-[#176b5d] focus:ring-[#176b5d]"
              />
              <label htmlFor="add_procure_on_demand" className="text-xs font-bold uppercase text-[#405049] cursor-pointer">
                Procure On Demand (MTO)
              </label>
            </div>
            <div className="col-span-2">
              <label className="text-xs font-bold uppercase text-[#405049]">Image URL</label>
              <input
                name="image_url"
                type="url"
                placeholder="https://images.unsplash.com/photo-..."
                className="mt-1 h-10 w-full rounded-lg border border-[#cfc3ad] bg-white px-3 text-sm outline-none transition focus:border-[#176b5d]"
              />
            </div>
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
              Save Product
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      {selectedProduct && (
        <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Product">
          <form onSubmit={handleEditProduct} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-xs font-bold uppercase text-[#405049]">Product Name</label>
                <input
                  required
                  name="name"
                  type="text"
                  defaultValue={selectedProduct.name}
                  className="mt-1 h-10 w-full rounded-lg border border-[#cfc3ad] bg-white px-3 text-sm outline-none transition focus:border-[#176b5d]"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-[#405049]">SKU</label>
                <input
                  required
                  name="sku"
                  type="text"
                  defaultValue={selectedProduct.sku}
                  className="mt-1 h-10 w-full rounded-lg border border-[#cfc3ad] bg-white px-3 text-sm outline-none transition focus:border-[#176b5d]"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-[#405049]">Product Type</label>
                <select
                  name="product_type"
                  defaultValue={selectedProduct.product_type}
                  className="mt-1 h-10 w-full rounded-lg border border-[#cfc3ad] bg-white px-2 text-sm outline-none transition focus:border-[#176b5d]"
                >
                  <option value="FINISHED_GOOD">Finished Good</option>
                  <option value="RAW_MATERIAL">Raw Material</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-[#405049]">Sale Price (INR)</label>
                <input
                  required
                  name="sale_price"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={selectedProduct.sale_price}
                  className="mt-1 h-10 w-full rounded-lg border border-[#cfc3ad] bg-white px-3 text-sm outline-none transition focus:border-[#176b5d]"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-[#405049]">Cost Price (INR)</label>
                <input
                  required
                  name="cost_price"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={selectedProduct.cost_price}
                  className="mt-1 h-10 w-full rounded-lg border border-[#cfc3ad] bg-white px-3 text-sm outline-none transition focus:border-[#176b5d]"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-[#405049]">Procurement Strategy</label>
                <select
                  name="procurement_type"
                  defaultValue={selectedProduct.procurement_type}
                  className="mt-1 h-10 w-full rounded-lg border border-[#cfc3ad] bg-white px-2 text-sm outline-none transition focus:border-[#176b5d]"
                >
                  <option value="BUY">Buy (Purchase Order)</option>
                  <option value="MANUFACTURE">Manufacture (Manufacturing Order)</option>
                </select>
              </div>
              <div className="flex items-center gap-2 pt-5">
                <input
                  type="checkbox"
                  name="procure_on_demand"
                  id="edit_procure_on_demand"
                  defaultChecked={selectedProduct.procure_on_demand}
                  className="size-4 rounded border-[#cfc3ad] text-[#176b5d] focus:ring-[#176b5d]"
                />
                <label htmlFor="edit_procure_on_demand" className="text-xs font-bold uppercase text-[#405049] cursor-pointer">
                  Procure On Demand (MTO)
                </label>
              </div>
              <div className="col-span-2">
                <label className="text-xs font-bold uppercase text-[#405049]">Image URL</label>
                <input
                  name="image_url"
                  type="url"
                  defaultValue={selectedProduct.image_url || ""}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="mt-1 h-10 w-full rounded-lg border border-[#cfc3ad] bg-white px-3 text-sm outline-none transition focus:border-[#176b5d]"
                />
              </div>
            </div>

            {formError && (
              <p className="rounded-lg border border-[#e4b7a3] bg-[#fff2eb] px-3 py-2 text-xs font-medium text-[#8b3d1e]">
                {formError}
              </p>
            )}

            <div className="flex justify-end gap-3 border-t border-[#e5dccb] pt-4">
              <button
                type="button"
                onClick={() => setIsEditOpen(false)}
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
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation */}
      {selectedProduct && (
        <ConfirmDialog
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          onConfirm={handleDeleteConfirm}
          title="Delete Product"
          message={`Are you sure you want to delete ${selectedProduct.name} (SKU: ${selectedProduct.sku})? This action cannot be undone and will delete all corresponding inventory records.`}
          confirmLabel="Delete"
          isDestructive
        />
      )}
    </div>
  );
}
