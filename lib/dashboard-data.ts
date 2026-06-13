import type { RoleKey } from "@/app/dashboard/role-data";
import { sql } from "@/lib/db";

export type DashboardMetric = {
  label: string;
  value: string;
  detail: string;
};

export type DashboardItem = {
  title: string;
  description: string;
  status: string;
};

export type StockItem = {
  name: string;
  detail: string;
  quantity: string;
  status: string;
};

export type RoleBusinessData = {
  metrics: DashboardMetric[];
  workTitle: string;
  workDescription: string;
  workItems: DashboardItem[];
  sideTitle: string;
  sideItems: DashboardItem[];
  stockItems: StockItem[];
};

type CountRow = {
  count: number;
};

type ProductRow = {
  name: string;
  sku: string;
  sale_price: string | null;
  cost_price: string | null;
  procurement_type: string | null;
  on_hand_qty: number | null;
  reserved_qty: number | null;
};

type VendorRow = {
  name: string;
  email: string | null;
  phone: string | null;
  product_count: number;
};

type SalesOrderRow = {
  order_number: string | null;
  customer_name: string | null;
  status: string | null;
  total_amount: string | null;
  item_count: number;
};

type PurchaseOrderRow = {
  po_number: string | null;
  vendor_name: string | null;
  status: string | null;
  total_amount: string | null;
  item_count: number;
};

type ManufacturingOrderRow = {
  mo_number: string | null;
  product_name: string | null;
  quantity: number | null;
  status: string | null;
  sales_order_number: string | null;
};

type WorkOrderRow = {
  mo_number: string | null;
  operation_name: string | null;
  duration_minutes: number | null;
  status: string | null;
};

type LedgerRow = {
  product_name: string | null;
  movement_type: string | null;
  quantity: string | null;
  reference_type: string | null;
  notes: string | null;
};

type AuditRow = {
  entity_type: string | null;
  action: string | null;
  user_name: string | null;
};

export async function getRoleBusinessData(role: RoleKey): Promise<RoleBusinessData> {
  const [
    products,
    vendors,
    salesOrders,
    purchaseOrders,
    manufacturingOrders,
    workOrders,
    stockLedger,
    auditLogs,
    usersCount,
    customersCount,
  ] = await Promise.all([
    getProducts(),
    getVendors(),
    getSalesOrders(),
    getPurchaseOrders(),
    getManufacturingOrders(),
    getWorkOrders(),
    getStockLedger(),
    getAuditLogs(),
    getCount("users"),
    getCount("customers"),
  ]);

  const lowStock = products.filter((product) => availableQty(product) <= 5).length;
  const salesTotal = salesOrders.reduce((sum, order) => sum + Number(order.total_amount ?? 0), 0);
  const purchaseTotal = purchaseOrders.reduce((sum, order) => sum + Number(order.total_amount ?? 0), 0);
  const reservedQty = products.reduce((sum, product) => sum + Number(product.reserved_qty ?? 0), 0);
  const stockItems = products.slice(0, 5).map((product) => {
    const available = availableQty(product);

    return {
      name: product.name,
      detail: `${product.sku} / ${product.procurement_type ?? "N/A"}`,
      quantity: `${available} available`,
      status: available <= 5 ? "Low stock" : "Healthy",
    };
  });

  if (role === "admin") {
    return {
      metrics: [
        { label: "Users", value: String(usersCount), detail: "Seeded role accounts" },
        { label: "Products", value: String(products.length), detail: "Finished goods and materials" },
        { label: "Audit logs", value: String(auditLogs.length), detail: "Latest tracked changes" },
      ],
      workTitle: "System activity",
      workDescription: "Administrative records loaded from PostgreSQL.",
      workItems: auditLogs.map((log) => ({
        title: `${log.entity_type ?? "Entity"} / ${log.action ?? "Action"}`,
        description: log.user_name ? `Updated by ${log.user_name}` : "System event",
        status: "Logged",
      })),
      sideTitle: "Master data",
      sideItems: [...vendors.slice(0, 2).map(vendorItem), ...products.slice(0, 2).map(productItem)],
      stockItems,
    };
  }

  if (role === "sales") {
    return {
      metrics: [
        { label: "Customers", value: String(customersCount), detail: "Active demo customers" },
        { label: "Sales orders", value: String(salesOrders.length), detail: formatMoney(salesTotal) },
        { label: "Low stock", value: String(lowStock), detail: "Products needing attention" },
      ],
      workTitle: "Sales orders",
      workDescription: "Customer demand and order status from PostgreSQL.",
      workItems: salesOrders.map((order) => ({
        title: order.order_number ?? "Sales order",
        description: `${order.customer_name ?? "Unknown customer"} / ${order.item_count} item lines`,
        status: order.status ?? "DRAFT",
      })),
      sideTitle: "Sellable products",
      sideItems: products.filter((product) => product.procurement_type === "MANUFACTURE").map(productItem),
      stockItems,
    };
  }

  if (role === "purchase") {
    return {
      metrics: [
        { label: "Vendors", value: String(vendors.length), detail: "Approved suppliers" },
        { label: "Purchase orders", value: String(purchaseOrders.length), detail: formatMoney(purchaseTotal) },
        { label: "Incoming lines", value: String(sumItems(purchaseOrders)), detail: "Material lines ordered" },
      ],
      workTitle: "Purchase orders",
      workDescription: "Vendor orders and procurement state from the database.",
      workItems: purchaseOrders.map((order) => ({
        title: order.po_number ?? "Purchase order",
        description: `${order.vendor_name ?? "Unknown vendor"} / ${order.item_count} item lines`,
        status: order.status ?? "DRAFT",
      })),
      sideTitle: "Vendor coverage",
      sideItems: vendors.map(vendorItem),
      stockItems,
    };
  }

  if (role === "manufacturing") {
    return {
      metrics: [
        { label: "Manufacturing orders", value: String(manufacturingOrders.length), detail: "Active production records" },
        { label: "Work orders", value: String(workOrders.length), detail: "Operations loaded" },
        { label: "Ready MOs", value: String(manufacturingOrders.filter((order) => order.status === "READY").length), detail: "Can start now" },
      ],
      workTitle: "Manufacturing orders",
      workDescription: "Production work generated from sales demand and BoMs.",
      workItems: manufacturingOrders.map((order) => ({
        title: order.mo_number ?? "Manufacturing order",
        description: `${order.product_name ?? "Product"} / Qty ${order.quantity ?? 0} / ${order.sales_order_number ?? "No SO"}`,
        status: order.status ?? "WAITING",
      })),
      sideTitle: "Work orders",
      sideItems: workOrders.map((workOrder) => ({
        title: workOrder.operation_name ?? "Operation",
        description: `${workOrder.mo_number ?? "MO"} / ${workOrder.duration_minutes ?? 0} min`,
        status: workOrder.status ?? "WAITING",
      })),
      stockItems,
    };
  }

  if (role === "inventory") {
    return {
      metrics: [
        { label: "Stock products", value: String(products.length), detail: "Tracked inventory rows" },
        { label: "Reserved qty", value: String(reservedQty), detail: "Committed stock" },
        { label: "Ledger moves", value: String(stockLedger.length), detail: "Latest stock movements" },
      ],
      workTitle: "Inventory ledger",
      workDescription: "Receipts, deliveries, production, and movement records.",
      workItems: stockLedger.map((ledger) => ({
        title: ledger.product_name ?? "Stock movement",
        description: `${ledger.reference_type ?? "Reference"} / ${ledger.notes ?? "No notes"}`,
        status: `${ledger.movement_type ?? "MOVE"} ${ledger.quantity ?? 0}`,
      })),
      sideTitle: "Stock position",
      sideItems: products.map(productItem),
      stockItems,
    };
  }

  return {
    metrics: [
      { label: "Open sales", value: formatMoney(salesTotal), detail: "Demo sales order value" },
      { label: "Purchase exposure", value: formatMoney(purchaseTotal), detail: "Demo procurement value" },
      { label: "Stock risk", value: String(lowStock), detail: "Products at or below 5 available" },
    ],
    workTitle: "Business pulse",
    workDescription: "Sales, purchase, manufacturing, and inventory data in one view.",
    workItems: [
      ...salesOrders.slice(0, 2).map((order) => ({
        title: order.order_number ?? "Sales order",
        description: `${order.customer_name ?? "Customer"} / ${formatMoney(Number(order.total_amount ?? 0))}`,
        status: order.status ?? "DRAFT",
      })),
      ...manufacturingOrders.slice(0, 2).map((order) => ({
        title: order.mo_number ?? "Manufacturing order",
        description: `${order.product_name ?? "Product"} / Qty ${order.quantity ?? 0}`,
        status: order.status ?? "WAITING",
      })),
    ],
    sideTitle: "Products",
    sideItems: products.map(productItem),
    stockItems,
  };
}

async function getProducts() {
  return (await sql`
    SELECT p.name, p.sku, p.sale_price, p.cost_price, p.procurement_type, i.on_hand_qty, i.reserved_qty
    FROM products p
    LEFT JOIN inventory i ON i.product_id = p.id
    ORDER BY p.procurement_type, p.name
  `) as ProductRow[];
}

async function getVendors() {
  return (await sql`
    SELECT v.name, v.email, v.phone, COUNT(pv.id)::int AS product_count
    FROM vendors v
    LEFT JOIN product_vendors pv ON pv.vendor_id = v.id
    GROUP BY v.id
    ORDER BY v.name
  `) as VendorRow[];
}

async function getSalesOrders() {
  return (await sql`
    SELECT so.order_number, c.name AS customer_name, so.status,
      COALESCE(SUM(soi.quantity * soi.price), 0)::text AS total_amount,
      COUNT(soi.id)::int AS item_count
    FROM sales_orders so
    LEFT JOIN customers c ON c.id = so.customer_id
    LEFT JOIN sales_order_items soi ON soi.sales_order_id = so.id
    GROUP BY so.id, c.name
    ORDER BY so.created_at DESC, so.order_number
  `) as SalesOrderRow[];
}

async function getPurchaseOrders() {
  return (await sql`
    SELECT po.po_number, v.name AS vendor_name, po.status,
      COALESCE(SUM(poi.quantity * poi.cost_price), 0)::text AS total_amount,
      COUNT(poi.id)::int AS item_count
    FROM purchase_orders po
    LEFT JOIN vendors v ON v.id = po.vendor_id
    LEFT JOIN purchase_order_items poi ON poi.purchase_order_id = po.id
    GROUP BY po.id, v.name
    ORDER BY po.created_at DESC, po.po_number
  `) as PurchaseOrderRow[];
}

async function getManufacturingOrders() {
  return (await sql`
    SELECT mo.mo_number, p.name AS product_name, mo.quantity, mo.status, so.order_number AS sales_order_number
    FROM manufacturing_orders mo
    LEFT JOIN products p ON p.id = mo.product_id
    LEFT JOIN sales_orders so ON so.id = mo.sales_order_id
    ORDER BY mo.created_at DESC, mo.mo_number
  `) as ManufacturingOrderRow[];
}

async function getWorkOrders() {
  return (await sql`
    SELECT mo.mo_number, wo.operation_name, wo.duration_minutes, wo.status
    FROM work_orders wo
    LEFT JOIN manufacturing_orders mo ON mo.id = wo.manufacturing_order_id
    ORDER BY wo.id DESC
  `) as WorkOrderRow[];
}

async function getStockLedger() {
  return (await sql`
    SELECT p.name AS product_name, sl.movement_type, sl.quantity::text, sl.reference_type, sl.notes
    FROM stock_ledger sl
    LEFT JOIN products p ON p.id = sl.product_id
    ORDER BY sl.created_at DESC, sl.id DESC
    LIMIT 8
  `) as LedgerRow[];
}

async function getAuditLogs() {
  return (await sql`
    SELECT al.entity_type, al.action, u.name AS user_name
    FROM audit_logs al
    LEFT JOIN users u ON u.id = al.user_id
    ORDER BY al.created_at DESC, al.id DESC
    LIMIT 8
  `) as AuditRow[];
}

async function getCount(table: "users" | "customers") {
  const rows = (await sql`SELECT COUNT(*)::int AS count FROM ${sql(table)}`) as CountRow[];

  return rows[0]?.count ?? 0;
}

function productItem(product: ProductRow): DashboardItem {
  return {
    title: product.name,
    description: `${product.sku} / ${formatMoney(Number(product.sale_price ?? product.cost_price ?? 0))}`,
    status: product.procurement_type ?? "N/A",
  };
}

function vendorItem(vendor: VendorRow): DashboardItem {
  return {
    title: vendor.name,
    description: vendor.email ?? vendor.phone ?? "Vendor contact missing",
    status: `${vendor.product_count} linked products`,
  };
}

function availableQty(product: ProductRow) {
  return Number(product.on_hand_qty ?? 0) - Number(product.reserved_qty ?? 0);
}

function sumItems(rows: Array<{ item_count: number }>) {
  return rows.reduce((sum, row) => sum + row.item_count, 0);
}

function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "inr",
    maximumFractionDigits: 0,
  }).format(amount);
}
