"use client";

import { useState, useTransition } from "react";
import { Plus, Search, Edit2, Trash2, Loader2 } from "lucide-react";
import { createVendorAction, updateVendorAction, deleteVendorAction } from "@/app/actions/vendors";
import Modal from "@/app/components/ui/Modal";
import ConfirmDialog from "@/app/components/ui/ConfirmDialog";
import EmptyState from "@/app/components/ui/EmptyState";

type Vendor = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  products_sold?: string[];
  product_ids?: number[];
};

type Product = {
  id: number;
  name: string;
  sku: string;
};

type VendorsClientProps = {
  initialVendors: Vendor[];
  products: Product[];
};

export default function VendorsClient({ initialVendors, products = [] }: VendorsClientProps) {
  const [vendors, setVendors] = useState<Vendor[]>(initialVendors);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  const [formError, setFormError] = useState("");
  const [isPending, startTransition] = useTransition();

  const filteredVendors = vendors.filter(
    (v) =>
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.email && v.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (v.phone && v.phone.includes(searchTerm))
  );

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError("");
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await createVendorAction(null, formData);
      if (res.error) setFormError(res.error);
      else {
        setIsAddOpen(false);
        window.location.reload();
      }
    });
  }

  async function handleEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedVendor) return;
    setFormError("");
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await updateVendorAction(selectedVendor.id, null, formData);
      if (res.error) setFormError(res.error);
      else {
        setIsEditOpen(false);
        setSelectedVendor(null);
        window.location.reload();
      }
    });
  }

  async function handleDeleteConfirm() {
    if (!selectedVendor) return;
    startTransition(async () => {
      const res = await deleteVendorAction(selectedVendor.id);
      if (res.error) alert(res.error);
      else {
        setIsDeleteOpen(false);
        setSelectedVendor(null);
        window.location.reload();
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#68756e]" />
          <input
            type="text"
            placeholder="Search suppliers by name, email..."
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
          Add Vendor
        </button>
      </div>

      {filteredVendors.length === 0 ? (
        <EmptyState
          title="No vendors found"
          description="Register a vendor to manage raw material purchases."
          actionLabel="Add Vendor"
          onAction={() => setIsAddOpen(true)}
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#d9cfbd] bg-white shadow-sm">
          <table className="w-full border-collapse text-left text-sm text-[#18231f]">
            <thead className="border-b border-[#e5dccb] bg-[#fbfaf6] text-xs font-semibold uppercase tracking-wider text-[#68756e]">
              <tr>
                <th className="px-6 py-4">Vendor Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Products Sold</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#efe7d8]">
              {filteredVendors.map((v, index) => (
                <tr key={`${v.id}-${index}`} className="hover:bg-white/60 transition-colors">
                  <td className="px-6 py-4 font-semibold text-[#202a25]">{v.name}</td>
                  <td className="px-6 py-4 text-[#53645c]">{v.email || "N/A"}</td>
                  <td className="px-6 py-4 text-[#53645c]">{v.phone || "N/A"}</td>
                  <td className="px-6 py-4 text-[#53645c]">
                    {v.products_sold && v.products_sold.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {v.products_sold.map((prodName: string, pIdx: number) => (
                          <span key={`${prodName}-${pIdx}`} className="inline-block rounded-md bg-[#eef7f3] border border-[#c9dbd5] px-2 py-0.5 text-xs font-semibold text-[#176b5d]">
                            {prodName}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">None</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setFormError("");
                          setSelectedVendor(v);
                          setIsEditOpen(true);
                        }}
                        className="rounded-lg p-1.5 text-[#53645c] hover:bg-black/5 hover:text-[#176b5d] transition"
                      >
                        <Edit2 className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedVendor(v);
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

      {/* Add Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add Vendor">
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase text-[#405049]">Vendor Name</label>
            <input
              required
              name="name"
              type="text"
              placeholder="e.g. Acme Supplier Co."
              className="mt-1 h-10 w-full rounded-lg border border-[#cfc3ad] bg-white px-3 text-sm outline-none transition focus:border-[#176b5d]"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-[#405049]">Email</label>
            <input
              name="email"
              type="email"
              placeholder="sales@acme.com"
              className="mt-1 h-10 w-full rounded-lg border border-[#cfc3ad] bg-white px-3 text-sm outline-none transition focus:border-[#176b5d]"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-[#405049]">Phone</label>
            <input
              name="phone"
              type="tel"
              placeholder="+1 (555) 987-6543"
              className="mt-1 h-10 w-full rounded-lg border border-[#cfc3ad] bg-white px-3 text-sm outline-none transition focus:border-[#176b5d]"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-[#405049]">Products Selling</label>
            <input
              name="products_selling"
              type="text"
              placeholder="e.g. Wooden Leg, Chair"
              className="mt-1 h-10 w-full rounded-lg border border-[#cfc3ad] bg-white px-3 text-sm outline-none transition focus:border-[#176b5d]"
            />
            <p className="mt-1 text-[11px] text-[#68756e]">Enter product names, separated by commas.</p>
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
              Save Vendor
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      {selectedVendor && (
        <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Vendor">
          <form onSubmit={handleEdit} className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase text-[#405049]">Vendor Name</label>
              <input
                required
                name="name"
                type="text"
                defaultValue={selectedVendor.name}
                className="mt-1 h-10 w-full rounded-lg border border-[#cfc3ad] bg-white px-3 text-sm outline-none transition focus:border-[#176b5d]"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-[#405049]">Email</label>
              <input
                name="email"
                type="email"
                defaultValue={selectedVendor.email || ""}
                className="mt-1 h-10 w-full rounded-lg border border-[#cfc3ad] bg-white px-3 text-sm outline-none transition focus:border-[#176b5d]"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-[#405049]">Phone</label>
              <input
                name="phone"
                type="tel"
                defaultValue={selectedVendor.phone || ""}
                className="mt-1 h-10 w-full rounded-lg border border-[#cfc3ad] bg-white px-3 text-sm outline-none transition focus:border-[#176b5d]"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-[#405049]">Products Selling</label>
              <input
                name="products_selling"
                type="text"
                defaultValue={selectedVendor.products_sold ? selectedVendor.products_sold.join(", ") : ""}
                placeholder="e.g. Wooden Leg, Chair"
                className="mt-1 h-10 w-full rounded-lg border border-[#cfc3ad] bg-white px-3 text-sm outline-none transition focus:border-[#176b5d]"
              />
              <p className="mt-1 text-[11px] text-[#68756e]">Enter product names, separated by commas.</p>
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
      {selectedVendor && (
        <ConfirmDialog
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          onConfirm={handleDeleteConfirm}
          title="Delete Vendor"
          message={`Are you sure you want to delete vendor ${selectedVendor.name}?`}
          confirmLabel="Delete"
          isDestructive
        />
      )}
    </div>
  );
}
