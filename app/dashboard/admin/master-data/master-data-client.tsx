"use client";

import { useState, useTransition } from "react";
import { Plus, Search, Edit2, Trash2, Loader2, Users as UsersIcon, Landmark, Layers } from "lucide-react";
import ProductMasterClient from "../../owner/product-master/product-master-client";
import { createCustomerAction, updateCustomerAction, deleteCustomerAction } from "@/app/actions/customers";
import { createVendorAction, updateVendorAction, deleteVendorAction } from "@/app/actions/vendors";
import Modal from "@/app/components/ui/Modal";
import ConfirmDialog from "@/app/components/ui/ConfirmDialog";
import EmptyState from "@/app/components/ui/EmptyState";

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

type Customer = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
};

type Vendor = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
};

type MasterDataClientProps = {
  products: Product[];
  customers: Customer[];
  vendors: Vendor[];
};

export default function MasterDataClient({ products, customers, vendors }: MasterDataClientProps) {
  const [activeTab, setActiveTab] = useState<"products" | "customers" | "vendors">("products");

  // Search states
  const [customerSearch, setCustomerSearch] = useState("");
  const [vendorSearch, setVendorSearch] = useState("");

  // Customer Modals
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [isEditCustomerOpen, setIsEditCustomerOpen] = useState(false);
  const [isDeleteCustomerOpen, setIsDeleteCustomerOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Vendor Modals
  const [isAddVendorOpen, setIsAddVendorOpen] = useState(false);
  const [isEditVendorOpen, setIsEditVendorOpen] = useState(false);
  const [isDeleteVendorOpen, setIsDeleteVendorOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  const [formError, setFormError] = useState("");
  const [isPending, startTransition] = useTransition();

  // Filters
  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      (c.email && c.email.toLowerCase().includes(customerSearch.toLowerCase())) ||
      (c.phone && c.phone.includes(customerSearch))
  );

  const filteredVendors = vendors.filter(
    (v) =>
      v.name.toLowerCase().includes(vendorSearch.toLowerCase()) ||
      (v.email && v.email.toLowerCase().includes(vendorSearch.toLowerCase())) ||
      (v.phone && v.phone.includes(vendorSearch))
  );

  // Customer Actions
  async function handleAddCustomer(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError("");
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await createCustomerAction(null, formData);
      if (res.error) setFormError(res.error);
      else {
        setIsAddCustomerOpen(false);
        window.location.reload();
      }
    });
  }

  async function handleEditCustomer(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedCustomer) return;
    setFormError("");
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await updateCustomerAction(selectedCustomer.id, null, formData);
      if (res.error) setFormError(res.error);
      else {
        setIsEditCustomerOpen(false);
        setSelectedCustomer(null);
        window.location.reload();
      }
    });
  }

  async function handleDeleteCustomerConfirm() {
    if (!selectedCustomer) return;
    startTransition(async () => {
      const res = await deleteCustomerAction(selectedCustomer.id);
      if (res.error) alert(res.error);
      else {
        setIsDeleteCustomerOpen(false);
        setSelectedCustomer(null);
        window.location.reload();
      }
    });
  }

  // Vendor Actions
  async function handleAddVendor(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError("");
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await createVendorAction(null, formData);
      if (res.error) setFormError(res.error);
      else {
        setIsAddVendorOpen(false);
        window.location.reload();
      }
    });
  }

  async function handleEditVendor(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedVendor) return;
    setFormError("");
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await updateVendorAction(selectedVendor.id, null, formData);
      if (res.error) setFormError(res.error);
      else {
        setIsEditVendorOpen(false);
        setSelectedVendor(null);
        window.location.reload();
      }
    });
  }

  async function handleDeleteVendorConfirm() {
    if (!selectedVendor) return;
    startTransition(async () => {
      const res = await deleteVendorAction(selectedVendor.id);
      if (res.error) alert(res.error);
      else {
        setIsDeleteVendorOpen(false);
        setSelectedVendor(null);
        window.location.reload();
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex border-b border-[#ded4c3]">
        <button
          type="button"
          onClick={() => setActiveTab("products")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition ${
            activeTab === "products"
              ? "border-[#176b5d] text-[#176b5d]"
              : "border-transparent text-[#53645c] hover:text-[#18231f]"
          }`}
        >
          <Layers className="size-4" />
          Products
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("customers")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition ${
            activeTab === "customers"
              ? "border-[#176b5d] text-[#176b5d]"
              : "border-transparent text-[#53645c] hover:text-[#18231f]"
          }`}
        >
          <UsersIcon className="size-4" />
          Customers
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("vendors")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition ${
            activeTab === "vendors"
              ? "border-[#176b5d] text-[#176b5d]"
              : "border-transparent text-[#53645c] hover:text-[#18231f]"
          }`}
        >
          <Landmark className="size-4" />
          Vendors
        </button>
      </div>

      {/* Products Tab */}
      {activeTab === "products" && (
        <ProductMasterClient initialProducts={products} />
      )}

      {/* Customers Tab */}
      {activeTab === "customers" && (
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#68756e]" />
              <input
                type="text"
                placeholder="Search customers..."
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                className="h-10 w-full rounded-lg border border-[#cfc3ad] bg-white pl-10 pr-4 text-sm outline-none transition focus:border-[#176b5d] focus:ring-2 focus:ring-[#176b5d]/20"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setFormError("");
                setIsAddCustomerOpen(true);
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
              onAction={() => setIsAddCustomerOpen(true)}
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
                              setIsEditCustomerOpen(true);
                            }}
                            className="rounded-lg p-1.5 text-[#53645c] hover:bg-black/5 hover:text-[#176b5d] transition"
                          >
                            <Edit2 className="size-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCustomer(c);
                              setIsDeleteCustomerOpen(true);
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
        </div>
      )}

      {/* Vendors Tab */}
      {activeTab === "vendors" && (
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#68756e]" />
              <input
                type="text"
                placeholder="Search vendors..."
                value={vendorSearch}
                onChange={(e) => setVendorSearch(e.target.value)}
                className="h-10 w-full rounded-lg border border-[#cfc3ad] bg-white pl-10 pr-4 text-sm outline-none transition focus:border-[#176b5d] focus:ring-2 focus:ring-[#176b5d]/20"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setFormError("");
                setIsAddVendorOpen(true);
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
              onAction={() => setIsAddVendorOpen(true)}
            />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-[#d9cfbd] bg-white shadow-sm">
              <table className="w-full border-collapse text-left text-sm text-[#18231f]">
                <thead className="border-b border-[#e5dccb] bg-[#fbfaf6] text-xs font-semibold uppercase tracking-wider text-[#68756e]">
                  <tr>
                    <th className="px-6 py-4">Vendor Name</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Phone</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#efe7d8]">
                  {filteredVendors.map((v) => (
                    <tr key={v.id} className="hover:bg-white/60 transition-colors">
                      <td className="px-6 py-4 font-semibold text-[#202a25]">{v.name}</td>
                      <td className="px-6 py-4 text-[#53645c]">{v.email || "N/A"}</td>
                      <td className="px-6 py-4 text-[#53645c]">{v.phone || "N/A"}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setFormError("");
                              setSelectedVendor(v);
                              setIsEditVendorOpen(true);
                            }}
                            className="rounded-lg p-1.5 text-[#53645c] hover:bg-black/5 hover:text-[#176b5d] transition"
                          >
                            <Edit2 className="size-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedVendor(v);
                              setIsDeleteVendorOpen(true);
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
        </div>
      )}

      {/* Customer Modals */}
      <Modal isOpen={isAddCustomerOpen} onClose={() => setIsAddCustomerOpen(false)} title="Add Customer">
        <form onSubmit={handleAddCustomer} className="space-y-4">
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
              onClick={() => setIsAddCustomerOpen(false)}
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

      {selectedCustomer && (
        <Modal isOpen={isEditCustomerOpen} onClose={() => setIsEditCustomerOpen(false)} title="Edit Customer">
          <form onSubmit={handleEditCustomer} className="space-y-4">
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
                onClick={() => setIsEditCustomerOpen(false)}
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

      {selectedCustomer && (
        <ConfirmDialog
          isOpen={isDeleteCustomerOpen}
          onClose={() => setIsDeleteCustomerOpen(false)}
          onConfirm={handleDeleteCustomerConfirm}
          title="Delete Customer"
          message={`Are you sure you want to delete customer ${selectedCustomer.name}?`}
          confirmLabel="Delete"
          isDestructive
        />
      )}

      {/* Vendor Modals */}
      <Modal isOpen={isAddVendorOpen} onClose={() => setIsAddVendorOpen(false)} title="Add Vendor">
        <form onSubmit={handleAddVendor} className="space-y-4">
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
          {formError && (
            <p className="rounded-lg border border-[#e4b7a3] bg-[#fff2eb] px-3 py-2 text-xs font-medium text-[#8b3d1e]">
              {formError}
            </p>
          )}
          <div className="flex justify-end gap-3 border-t border-[#e5dccb] pt-4">
            <button
              type="button"
              onClick={() => setIsAddVendorOpen(false)}
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

      {selectedVendor && (
        <Modal isOpen={isEditVendorOpen} onClose={() => setIsEditVendorOpen(false)} title="Edit Vendor">
          <form onSubmit={handleEditVendor} className="space-y-4">
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
            {formError && (
              <p className="rounded-lg border border-[#e4b7a3] bg-[#fff2eb] px-3 py-2 text-xs font-medium text-[#8b3d1e]">
                {formError}
              </p>
            )}
            <div className="flex justify-end gap-3 border-t border-[#e5dccb] pt-4">
              <button
                type="button"
                onClick={() => setIsEditVendorOpen(false)}
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

      {selectedVendor && (
        <ConfirmDialog
          isOpen={isDeleteVendorOpen}
          onClose={() => setIsDeleteVendorOpen(false)}
          onConfirm={handleDeleteVendorConfirm}
          title="Delete Vendor"
          message={`Are you sure you want to delete vendor ${selectedVendor.name}?`}
          confirmLabel="Delete"
          isDestructive
        />
      )}
    </div>
  );
}
