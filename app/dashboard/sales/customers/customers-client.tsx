"use client";

import { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Search, Edit2, Trash2, Loader2 } from "lucide-react";
import { createCustomerAction, updateCustomerAction, deleteCustomerAction } from "@/app/actions/customers";
import Modal from "@/app/components/ui/Modal";
import ConfirmDialog from "@/app/components/ui/ConfirmDialog";
import EmptyState from "@/app/components/ui/EmptyState";

type Customer = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
};

type CustomersClientProps = {
  initialCustomers: Customer[];
};

export default function CustomersClient({ initialCustomers }: CustomersClientProps) {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams ? (searchParams.get("search") || "") : "");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const [formError, setFormError] = useState("");
  const [isPending, startTransition] = useTransition();

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.phone && c.phone.includes(searchTerm))
  );

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError("");
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await createCustomerAction(null, formData);
      if (res.error) setFormError(res.error);
      else {
        setIsAddOpen(false);
        window.location.reload();
      }
    });
  }

  async function handleEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedCustomer) return;
    setFormError("");
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await updateCustomerAction(selectedCustomer.id, null, formData);
      if (res.error) setFormError(res.error);
      else {
        setIsEditOpen(false);
        setSelectedCustomer(null);
        window.location.reload();
      }
    });
  }

  async function handleDeleteConfirm() {
    if (!selectedCustomer) return;
    startTransition(async () => {
      const res = await deleteCustomerAction(selectedCustomer.id);
      if (res.error) alert(res.error);
      else {
        setIsDeleteOpen(false);
        setSelectedCustomer(null);
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
            placeholder="Search customers by name, email, or phone..."
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
          Add Customer
        </button>
      </div>

      {filteredCustomers.length === 0 ? (
        <EmptyState
          title="No customers found"
          description="Create a customer account to process sales orders."
          actionLabel="Add Customer"
          onAction={() => setIsAddOpen(true)}
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#d9cfbd] bg-white shadow-sm">
          <table className="w-full border-collapse text-left text-sm text-[#18231f]">
            <thead className="border-b border-[#e5dccb] bg-[#fbfaf6] text-xs font-semibold uppercase tracking-wider text-[#68756e]">
              <tr>
                <th className="px-6 py-4">Customer Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#efe7d8]">
              {filteredCustomers.map((c) => (
                <tr key={c.id} className="hover:bg-white/60 transition-colors">
                  <td className="px-6 py-4 font-semibold text-[#202a25]">{c.name}</td>
                  <td className="px-6 py-4 text-[#53645c]">{c.email || "N/A"}</td>
                  <td className="px-6 py-4 text-[#53645c]">{c.phone || "N/A"}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setFormError("");
                          setSelectedCustomer(c);
                          setIsEditOpen(true);
                        }}
                        className="rounded-lg p-1.5 text-[#53645c] hover:bg-black/5 hover:text-[#176b5d] transition"
                      >
                        <Edit2 className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCustomer(c);
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
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add Customer">
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase text-[#405049]">Customer Name</label>
            <input
              required
              name="name"
              type="text"
              placeholder="e.g. John Doe"
              className="mt-1 h-10 w-full rounded-lg border border-[#cfc3ad] bg-white px-3 text-sm outline-none transition focus:border-[#176b5d]"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-[#405049]">Email</label>
            <input
              name="email"
              type="email"
              placeholder="john@company.com"
              className="mt-1 h-10 w-full rounded-lg border border-[#cfc3ad] bg-white px-3 text-sm outline-none transition focus:border-[#176b5d]"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-[#405049]">Phone</label>
            <input
              name="phone"
              type="tel"
              placeholder="+1 (555) 019-2834"
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
              Save Customer
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      {selectedCustomer && (
        <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Customer">
          <form onSubmit={handleEdit} className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase text-[#405049]">Customer Name</label>
              <input
                required
                name="name"
                type="text"
                defaultValue={selectedCustomer.name}
                className="mt-1 h-10 w-full rounded-lg border border-[#cfc3ad] bg-white px-3 text-sm outline-none transition focus:border-[#176b5d]"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-[#405049]">Email</label>
              <input
                name="email"
                type="email"
                defaultValue={selectedCustomer.email || ""}
                className="mt-1 h-10 w-full rounded-lg border border-[#cfc3ad] bg-white px-3 text-sm outline-none transition focus:border-[#176b5d]"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-[#405049]">Phone</label>
              <input
                name="phone"
                type="tel"
                defaultValue={selectedCustomer.phone || ""}
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
      {selectedCustomer && (
        <ConfirmDialog
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          onConfirm={handleDeleteConfirm}
          title="Delete Customer"
          message={`Are you sure you want to delete customer ${selectedCustomer.name}?`}
          confirmLabel="Delete"
          isDestructive
        />
      )}
    </div>
  );
}
