"use client";

import { useState, useTransition } from "react";
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Loader2, 
  Grid, 
  List, 
  Package, 
  AlertTriangle,
  Factory,
  ShoppingCart,
  Percent,
  CheckCircle,
  TrendingUp,
  DollarSign
} from "lucide-react";
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
  shipping_charge?: string | number;
  packing_charge?: string | number;
  manufacturing_charge?: string | number;
  other_charge?: string | number;
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
  const [viewMode, setViewMode] = useState<"GRID" | "TABLE">("GRID");

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

  // Calculations for Top KPIs
  const totalCount = products.length;
  const lowStockCount = products.filter((p) => (p.on_hand_qty - p.reserved_qty) <= 5).length;
  const mfgCount = products.filter((p) => p.procurement_type === "MANUFACTURE").length;
  const purchasedCount = products.filter((p) => p.procurement_type === "BUY").length;

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

  // Calculate product health score (95% if stock is healthy, 20% if stock is critical/shortage)
  const getProductHealth = (p: Product) => {
    const net = p.on_hand_qty - p.reserved_qty;
    if (net <= 0) return { score: 10, label: "Critical Shortage", color: "text-red-600 bg-red-50 border-red-200" };
    if (net <= 5) return { score: 45, label: "Low Stock Risk", color: "text-amber-600 bg-amber-50 border-amber-200" };
    return { score: 98, label: "Healthy Stock", color: "text-emerald-700 bg-emerald-50 border-emerald-200" };
  };

  // Calculate net profit safely (returns 0 if selling price is 0 to avoid negative profits for raw materials/unpriced goods)
  const getNetProfit = (p: Product) => {
    const salePrice = Number(p.sale_price ?? 0);
    if (salePrice <= 0) return 0;
    const totalCost = Number(p.cost_price ?? 0) + 
                      Number(p.shipping_charge ?? 0) + 
                      Number(p.packing_charge ?? 0) + 
                      Number(p.manufacturing_charge ?? 0) + 
                      Number(p.other_charge ?? 0);
    return salePrice - totalCost;
  };

  const renderKPICard = (title: string, value: number, desc: string, icon: React.ReactNode, bgColor: string) => (
    <div className="rounded-2xl border border-[#ded4c3] bg-white p-5 shadow-xs flex items-center justify-between hover:shadow-md transition-all duration-300">
      <div>
        <span className="text-[10px] font-bold text-[#68756e] uppercase tracking-wider">{title}</span>
        <h3 className="text-3xl font-bold text-[#18231f] mt-1">{value}</h3>
        <p className="text-[10px] text-[#53645c] mt-1">{desc}</p>
      </div>
      <div className={`flex size-12 items-center justify-center rounded-xl border ${bgColor}`}>
        {icon}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      
      {/* Top Section KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {renderKPICard("Total Catalog Items", totalCount, "All tracked items", <Package className="size-5 text-blue-600" />, "bg-blue-50 border-blue-200")}
        {renderKPICard("Low Stock alerts", lowStockCount, "Available stock <= 5", <AlertTriangle className="size-5 text-amber-500 animate-pulse" />, "bg-amber-50 border-amber-200")}
        {renderKPICard("Manufactured Items", mfgCount, "Produced in house", <Factory className="size-5 text-purple-600" />, "bg-purple-50 border-purple-200")}
        {renderKPICard("Purchased Materials", purchasedCount, "Acquired from suppliers", <ShoppingCart className="size-5 text-emerald-600" />, "bg-emerald-50 border-emerald-200")}
      </div>

      {/* Filter and View Control Bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-[#ded4c3] pb-5">
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

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="inline-flex rounded-lg border border-[#cfc3ad] bg-white p-1">
            <button
              onClick={() => setViewMode("GRID")}
              className={`rounded-md p-1.5 transition ${viewMode === "GRID" ? "bg-[#1f806f] text-white" : "text-[#53645c] hover:bg-[#f7f4ed]"}`}
              title="Grid Catalog"
            >
              <Grid className="size-4" />
            </button>
            <button
              onClick={() => setViewMode("TABLE")}
              className={`rounded-md p-1.5 transition ${viewMode === "TABLE" ? "bg-[#1f806f] text-white" : "text-[#53645c] hover:bg-[#f7f4ed]"}`}
              title="Table List"
            >
              <List className="size-4" />
            </button>
          </div>

          {!readOnly && (
            <button
              type="button"
              onClick={() => {
                setFormError("");
                setIsAddOpen(true);
              }}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#1f806f] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#176b5d]"
            >
              <Plus className="size-4" />
              Add Product
            </button>
          )}
        </div>
      </div>

      {/* Main product view section */}
      {filteredProducts.length === 0 ? (
        <EmptyState
          title="No products found"
          description={searchTerm || typeFilter !== "ALL" || procurementFilter !== "ALL" ? "Try adjusting your search filters." : "Get started by adding your first product to the master database."}
          actionLabel={!readOnly && !searchTerm ? "Add Product" : undefined}
          onAction={!readOnly ? () => setIsAddOpen(true) : undefined}
        />
      ) : viewMode === "GRID" ? (
        /* Visual Catalog Card Grid */
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((p) => {
            const health = getProductHealth(p);
            const netAvailable = p.on_hand_qty - p.reserved_qty;
            const maxPercent = p.on_hand_qty > 0 ? Math.min(100, Math.round((netAvailable / p.on_hand_qty) * 100)) : 0;
            
            return (
              <div key={p.id} className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-[#ded4c3] bg-white shadow-xs hover:shadow-lg hover:border-[#1f806f]/40 transition-all duration-300">
                {/* Top Half Product Image & Type info */}
                <div className="relative aspect-video w-full border-b border-[#f3ebdd] bg-[#f7f4ed] overflow-hidden">
                  <ProductImage src={p.image_url} alt={p.name} />
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <span className="rounded-md bg-black/60 backdrop-blur-xs px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                      {p.sku}
                    </span>
                    <span className={`rounded-md border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${health.color}`}>
                      {health.label}
                    </span>
                  </div>
                  <div className="absolute bottom-3 right-3">
                    <span className={`rounded-md border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-white shadow-sm border-[#ded4c3] ${p.product_type === "FINISHED_GOOD" ? "text-purple-700" : "text-amber-700"}`}>
                      {p.product_type.replace("_", " ")}
                    </span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="flex-1 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-[#18231f] group-hover:text-[#1f806f] transition-colors leading-snug line-clamp-1">
                      {p.name}
                    </h4>
                    <span className="rounded bg-teal-50 border border-teal-200 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-teal-700">
                      {p.procurement_type}
                    </span>
                  </div>

                  {/* Financials */}
                  <div className="mt-4 border-y border-[#f3ebdd] py-3 text-xs space-y-2">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-[10px] text-[#68756e] font-semibold">Base Cost</span>
                        <p className="font-semibold text-[#53645c] mt-0.5">₹{Number(p.cost_price).toFixed(2)}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#68756e] font-semibold">Other Charges</span>
                        <p className="font-semibold text-[#53645c] mt-0.5" title={`Shipping: ₹${Number(p.shipping_charge ?? 0).toFixed(2)}\nPacking: ₹${Number(p.packing_charge ?? 0).toFixed(2)}\nManufacturing: ₹${Number(p.manufacturing_charge ?? 0).toFixed(2)}\nOther: ₹${Number(p.other_charge ?? 0).toFixed(2)}`}>
                          ₹{(Number(p.shipping_charge ?? 0) + Number(p.packing_charge ?? 0) + Number(p.manufacturing_charge ?? 0) + Number(p.other_charge ?? 0)).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#f7f4ed]">
                      <div>
                        <span className="text-[10px] text-[#68756e] font-bold">Total Cost</span>
                        <p className="font-bold text-[#202a25] mt-0.5">
                          ₹{(Number(p.cost_price) + Number(p.shipping_charge ?? 0) + Number(p.packing_charge ?? 0) + Number(p.manufacturing_charge ?? 0) + Number(p.other_charge ?? 0)).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#68756e] font-bold">Selling Price</span>
                        <p className="font-bold text-[#1f806f] mt-0.5">₹{Number(p.sale_price).toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#f7f4ed] flex justify-between items-center">
                      <span className="text-[10px] text-[#68756e] font-bold">Net Profit</span>
                      <span className={`font-bold px-1.5 py-0.5 rounded-md text-xs ${
                        getNetProfit(p) >= 0 
                          ? "bg-emerald-50 text-emerald-700" 
                          : "bg-red-50 text-red-700"
                      }`}>
                        ₹{getNetProfit(p).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Inventory Gauge */}
                  <div className="mt-4 space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-[#68756e]">Available Stock</span>
                      <span className={netAvailable <= 5 ? "text-amber-600 font-bold" : "text-[#18231f]"}>
                        {netAvailable} / {p.on_hand_qty} units
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-[#68756e] font-semibold pt-1">
                      <span>Reserved: {p.reserved_qty}</span>
                    </div>
                  </div>
                </div>

                {/* Footer action bar */}
                {!readOnly && (
                  <div className="flex items-center justify-end gap-2 bg-[#fbfaf6] border-t border-[#f3ebdd] px-4 py-3">
                    <button
                      type="button"
                      onClick={() => {
                        setFormError("");
                        setSelectedProduct(p);
                        setIsEditOpen(true);
                      }}
                      className="inline-flex items-center gap-1 rounded-lg border border-[#cfc3ad] bg-white px-2.5 py-1.5 text-xs font-bold text-[#405049] hover:bg-[#fffaf0] transition"
                    >
                      <Edit2 className="size-3" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedProduct(p);
                        setIsDeleteOpen(true);
                      }}
                      className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100 transition"
                    >
                      <Trash2 className="size-3" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Redesigned Tabular List view */
        <div className="overflow-x-auto rounded-2xl border border-[#ded4c3] bg-white shadow-xs">
          <table className="w-full border-collapse text-left text-sm text-[#18231f]">
            <thead className="border-b border-[#ded4c3] bg-[#fbfaf6] text-xs font-bold uppercase tracking-wider text-[#68756e]">
              <tr>
                <th className="px-6 py-4">Product / SKU</th>
                <th className="px-6 py-4">Classification</th>
                <th className="px-6 py-4">Procurement</th>
                <th className="px-6 py-4 text-right">Base Cost</th>
                <th className="px-6 py-4 text-right">Add. Charges</th>
                <th className="px-6 py-4 text-right">Total Cost</th>
                <th className="px-6 py-4 text-right">Selling Price</th>
                <th className="px-6 py-4 text-right">Net Profit</th>
                <th className="px-6 py-4 text-right">Stock (Res)</th>
                {!readOnly && <th className="px-6 py-4 text-center">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f3ebdd]">
              {filteredProducts.map((p) => {
                const health = getProductHealth(p);
                return (
                  <tr key={p.id} className="hover:bg-[#fbfaf6]/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-11 shrink-0 rounded-lg border border-[#f3ebdd] overflow-hidden bg-[#f7f4ed]">
                          <ProductImage src={p.image_url} alt={p.name} />
                        </div>
                        <div>
                          <div className="font-bold text-[#202a25]">{p.name}</div>
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
                          <span className="text-[9px] text-[#176b5d] font-bold uppercase tracking-wider bg-[#eef7f3] px-1 rounded-sm mt-0.5">
                            On Demand
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-[#68756e]">
                      ₹{Number(p.cost_price).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right text-[#68756e] font-medium" title={`Shipping: ₹${Number(p.shipping_charge ?? 0).toFixed(2)}\nPacking: ₹${Number(p.packing_charge ?? 0).toFixed(2)}\nManufacturing: ₹${Number(p.manufacturing_charge ?? 0).toFixed(2)}\nOther: ₹${Number(p.other_charge ?? 0).toFixed(2)}`}>
                      ₹{(Number(p.shipping_charge ?? 0) + Number(p.packing_charge ?? 0) + Number(p.manufacturing_charge ?? 0) + Number(p.other_charge ?? 0)).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-[#202a25]">
                      ₹{(Number(p.cost_price) + Number(p.shipping_charge ?? 0) + Number(p.packing_charge ?? 0) + Number(p.manufacturing_charge ?? 0) + Number(p.other_charge ?? 0)).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-[#1f806f]">
                      ₹{Number(p.sale_price).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`font-bold px-1.5 py-0.5 rounded-md text-xs ${
                        getNetProfit(p) >= 0 
                          ? "bg-emerald-50 text-emerald-700" 
                          : "bg-red-50 text-red-700"
                      }`}>
                        ₹{getNetProfit(p).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-[#202a25]">
                      {p.on_hand_qty} <span className="text-xs text-[#68756e] font-normal">({p.reserved_qty})</span>
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
                );
              })}
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
              <label className="text-xs font-bold uppercase text-[#405049]">Shipping Charge (INR)</label>
              <input
                name="shipping_charge"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                className="mt-1 h-10 w-full rounded-lg border border-[#cfc3ad] bg-white px-3 text-sm outline-none transition focus:border-[#176b5d]"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-[#405049]">Packing Charge (INR)</label>
              <input
                name="packing_charge"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                className="mt-1 h-10 w-full rounded-lg border border-[#cfc3ad] bg-white px-3 text-sm outline-none transition focus:border-[#176b5d]"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-[#405049]">Manufacturing Charge (INR)</label>
              <input
                name="manufacturing_charge"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                className="mt-1 h-10 w-full rounded-lg border border-[#cfc3ad] bg-white px-3 text-sm outline-none transition focus:border-[#176b5d]"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-[#405049]">Other Charges (INR)</label>
              <input
                name="other_charge"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
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
              className="inline-flex items-center gap-2 rounded-lg bg-[#1f806f] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#176b5d] disabled:opacity-60"
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
                <label className="text-xs font-bold uppercase text-[#405049]">Shipping Charge (INR)</label>
                <input
                  name="shipping_charge"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={selectedProduct.shipping_charge ?? 0}
                  className="mt-1 h-10 w-full rounded-lg border border-[#cfc3ad] bg-white px-3 text-sm outline-none transition focus:border-[#176b5d]"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-[#405049]">Packing Charge (INR)</label>
                <input
                  name="packing_charge"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={selectedProduct.packing_charge ?? 0}
                  className="mt-1 h-10 w-full rounded-lg border border-[#cfc3ad] bg-white px-3 text-sm outline-none transition focus:border-[#176b5d]"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-[#405049]">Manufacturing Charge (INR)</label>
                <input
                  name="manufacturing_charge"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={selectedProduct.manufacturing_charge ?? 0}
                  className="mt-1 h-10 w-full rounded-lg border border-[#cfc3ad] bg-white px-3 text-sm outline-none transition focus:border-[#176b5d]"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-[#405049]">Other Charges (INR)</label>
                <input
                  name="other_charge"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={selectedProduct.other_charge ?? 0}
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
                className="inline-flex items-center gap-2 rounded-lg bg-[#1f806f] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#176b5d] disabled:opacity-60"
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
