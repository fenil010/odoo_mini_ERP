import type { RoleKey } from "@/app/dashboard/role-data";
import { sql } from "@/lib/db";
import { unstable_noStore as noStore } from "next/cache";

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
  imageUrl?: string | null;
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
  id: number;
  name: string;
  sku: string;
  sale_price: string | null;
  cost_price: string | null;
  procurement_type: string | null;
  on_hand_qty: number | null;
  reserved_qty: number | null;
  image_url: string | null;
  product_type: string | null;
  open_demand_qty: number;
  open_reserved_qty: number;
  shipping_charge: string | null;
  packing_charge: string | null;
  manufacturing_charge: string | null;
  other_charge: string | null;
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

type UserRow = {
  name: string;
  email: string;
  role: string;
  created_at: Date | string | null;
};

type CustomerRow = {
  name: string;
  email: string | null;
  phone: string | null;
  order_count: number;
};

type OrderItemRow = {
  reference: string | null;
  product_name: string | null;
  quantity: number | null;
  unit_price: string | null;
  status: string | null;
};

type BomRow = {
  product_name: string | null;
  component_name: string | null;
  quantity: string | null;
};

export async function getRoleBusinessData(
  role: RoleKey,
  section?: string,
): Promise<RoleBusinessData> {
  const needed = new Set<string>();
  const key = section ? `${role}/${section}` : role;

  if (section) {
    switch (key) {
      case "admin/users-roles":
      case "admin/permissions":
        needed.add("users");
        break;
      case "admin/system-settings":
        needed.add("products").add("users");
        break;
      case "admin/audit-logs":
        needed.add("auditLogs");
        break;
      case "admin/master-data":
        needed.add("products").add("customers").add("vendors");
        break;
      case "admin/all-modules":
        needed.add("salesOrders").add("purchaseOrders").add("manufacturingOrders")
              .add("stockLedger").add("products").add("users").add("auditLogs");
        break;
      case "sales/customers":
        needed.add("customers").add("salesOrders");
        break;
      case "sales/sales-orders":
        needed.add("salesOrders").add("customers");
        break;
      case "sales/order-items":
        needed.add("salesOrderItems").add("products");
        break;
      case "sales/shortages":
        needed.add("products").add("salesOrders");
        break;
      case "sales/delivery-status":
        needed.add("salesOrders").add("products");
        break;
      case "purchase/vendors":
        needed.add("vendors").add("purchaseOrders");
        break;
      case "purchase/purchase-orders":
        needed.add("purchaseOrders").add("vendors");
        break;
      case "purchase/purchase-items":
        needed.add("purchaseOrderItems").add("products");
        break;
      case "purchase/incoming-stock":
        needed.add("purchaseOrders").add("purchaseOrderItems");
        break;
      case "purchase/shortage-demand":
        needed.add("products").add("purchaseOrders");
        break;
      case "manufacturing/manufacturing-orders":
      case "manufacturing/completion-queue":
        needed.add("manufacturingOrders").add("workOrders");
        break;
      case "manufacturing/work-orders":
        needed.add("workOrders").add("manufacturingOrders");
        break;
      case "manufacturing/bom-planning":
        needed.add("bomItems").add("products");
        break;
      case "manufacturing/material-readiness":
        needed.add("products").add("manufacturingOrders");
        break;
      case "inventory/on-hand-stock":
        needed.add("products");
        break;
      case "inventory/reserved-stock":
        needed.add("products").add("salesOrders");
        break;
      case "inventory/stock-ledger":
        needed.add("stockLedger").add("products");
        break;
      case "inventory/receive-materials":
        needed.add("stockLedger").add("purchaseOrders").add("purchaseOrderItems").add("products");
        break;
      case "inventory/deliver-products":
        needed.add("stockLedger").add("salesOrders").add("products");
        break;
      case "owner/revenue-view":
        needed.add("salesOrders").add("customers");
        break;
      case "owner/product-master":
        needed.add("products").add("vendors");
        break;
      case "owner/stock-risk":
        needed.add("products").add("salesOrders");
        break;
      case "owner/production-load":
        needed.add("manufacturingOrders").add("workOrders");
        break;
      case "owner/delayed-orders":
        needed.add("salesOrders").add("manufacturingOrders").add("purchaseOrders").add("products");
        break;
    }
  } else {
    if (role === "admin") {
      needed.add("usersCount").add("products").add("auditLogs").add("vendors");
    } else if (role === "sales") {
      needed.add("customersCount").add("salesOrders").add("products");
    } else if (role === "purchase") {
      needed.add("vendors").add("purchaseOrders");
    } else if (role === "manufacturing") {
      needed.add("manufacturingOrders").add("workOrders").add("products");
    } else if (role === "inventory") {
      needed.add("products").add("stockLedger");
    } else {
      needed.add("salesOrders").add("purchaseOrders").add("products");
    }
  }

  const productsPromise = needed.has("products") ? getProducts() : Promise.resolve([]);
  const vendorsPromise = needed.has("vendors") ? getVendors() : Promise.resolve([]);
  const salesOrdersPromise = needed.has("salesOrders") ? getSalesOrders() : Promise.resolve([]);
  const purchaseOrdersPromise = needed.has("purchaseOrders") ? getPurchaseOrders() : Promise.resolve([]);
  const manufacturingOrdersPromise = needed.has("manufacturingOrders") ? getManufacturingOrders() : Promise.resolve([]);
  const workOrdersPromise = needed.has("workOrders") ? getWorkOrders() : Promise.resolve([]);
  const stockLedgerPromise = needed.has("stockLedger") ? getStockLedger() : Promise.resolve([]);
  const auditLogsPromise = needed.has("auditLogs") ? getAuditLogs() : Promise.resolve([]);
  const usersCountPromise = needed.has("usersCount") ? getCount("users") : Promise.resolve(0);
  const customersCountPromise = needed.has("customersCount") ? getCount("customers") : Promise.resolve(0);
  const usersPromise = needed.has("users") ? getUsers() : Promise.resolve([]);
  const customersPromise = needed.has("customers") ? getCustomers() : Promise.resolve([]);
  const salesOrderItemsPromise = needed.has("salesOrderItems") ? getSalesOrderItems() : Promise.resolve([]);
  const purchaseOrderItemsPromise = needed.has("purchaseOrderItems") ? getPurchaseOrderItems() : Promise.resolve([]);
  const bomItemsPromise = needed.has("bomItems") ? getBomItems() : Promise.resolve([]);

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
    users,
    customers,
    salesOrderItems,
    purchaseOrderItems,
    bomItems,
  ] = await Promise.all([
    productsPromise,
    vendorsPromise,
    salesOrdersPromise,
    purchaseOrdersPromise,
    manufacturingOrdersPromise,
    workOrdersPromise,
    stockLedgerPromise,
    auditLogsPromise,
    usersCountPromise,
    customersCountPromise,
    usersPromise,
    customersPromise,
    salesOrderItemsPromise,
    purchaseOrderItemsPromise,
    bomItemsPromise,
  ]);

  const lowStock = products.filter((product) => availableQty(product) <= 5).length;
  const salesTotal = salesOrders.reduce((sum, order) => sum + Number(order.total_amount ?? 0), 0);
  const purchaseTotal = purchaseOrders.reduce((sum, order) => sum + Number(order.total_amount ?? 0), 0);
  const reservedQty = products.reduce((sum, product) => sum + Number(product.reserved_qty ?? 0), 0);
  const stockItems = products.map((product) => {
    const available = availableQty(product);

    return {
      name: product.name,
      detail: `${product.sku} / ${product.procurement_type ?? "N/A"}`,
      quantity: `${available} available`,
      status: available <= 5 ? "Low stock" : "Healthy",
      imageUrl: product.image_url,
    };
  });

  if (section) {
    return getSectionBusinessData(role, section, {
      products,
      vendors,
      salesOrders,
      purchaseOrders,
      manufacturingOrders,
      workOrders,
      stockLedger,
      auditLogs,
      users,
      customers,
      salesOrderItems,
      purchaseOrderItems,
      bomItems,
      stockItems,
    });
  }

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

type SectionDataContext = {
  products: ProductRow[];
  vendors: VendorRow[];
  salesOrders: SalesOrderRow[];
  purchaseOrders: PurchaseOrderRow[];
  manufacturingOrders: ManufacturingOrderRow[];
  workOrders: WorkOrderRow[];
  stockLedger: LedgerRow[];
  auditLogs: AuditRow[];
  users: UserRow[];
  customers: CustomerRow[];
  salesOrderItems: OrderItemRow[];
  purchaseOrderItems: OrderItemRow[];
  bomItems: BomRow[];
  stockItems: StockItem[];
};

function getSectionBusinessData(
  role: RoleKey,
  section: string,
  data: SectionDataContext,
): RoleBusinessData {
  const lowStockProducts = data.products.filter((product) => availableQty(product) <= 5);
  const reservedProducts = data.products.filter((product) => Number(product.reserved_qty ?? 0) > 0);
  const readyManufacturing = data.manufacturingOrders.filter((order) => order.status === "READY");
  const pendingManufacturing = data.manufacturingOrders.filter((order) => order.status !== "DONE");
  const openSales = data.salesOrders.filter((order) => order.status !== "DONE");
  const openPurchases = data.purchaseOrders.filter((order) => order.status !== "RECEIVED");
  const key = `${role}/${section}`;

  switch (key) {
    case "admin/users-roles":
      return sectionData(
        "System users",
        "Accounts currently configured in the ERP.",
        data.users.map((user) => ({
          title: user.name,
          description: `${user.email} / Added ${formatDate(user.created_at)}`,
          status: user.role,
        })),
        "Role coverage",
        roleSummaryItems(data.users),
        [
          metric("Users", data.users.length, "Active ERP accounts"),
          metric("Roles", new Set(data.users.map((user) => user.role)).size, "Assigned access groups"),
          metric("Admins", data.users.filter((user) => user.role === "ADMIN").length, "Full-access users"),
        ],
        [],
      );
    case "admin/permissions":
      return sectionData(
        "Role permissions",
        "Responsibility and access scope for every ERP role.",
        [
          accessItem("ADMIN", "Full access to configuration, users, and all modules"),
          accessItem("SALES", "Customers, sales orders, shortages, and deliveries"),
          accessItem("PURCHASE", "Vendors, purchase orders, shortages, and receipts"),
          accessItem("MANUFACTURING", "Manufacturing orders, work orders, and BoMs"),
          accessItem("INVENTORY", "Stock, ledger movements, receipts, and deliveries"),
          accessItem("OWNER", "Executive reporting across all business modules"),
        ],
        "Assigned users",
        roleSummaryItems(data.users),
        [
          metric("Permission groups", 6, "Business roles"),
          metric("Assigned users", data.users.length, "Users with role access"),
          metric("Unassigned", data.users.filter((user) => !user.role).length, "Users requiring review"),
        ],
        [],
      );
    case "admin/system-settings":
      return sectionData(
        "Application settings",
        "Current organization-level ERP configuration.",
        [
          settingItem("Currency", "Indian Rupee (INR)", "Configured"),
          settingItem("Inventory policy", "On hand minus reserved stock", "Active"),
          settingItem("Procurement", "Buy, manufacture, and make-to-order", "Active"),
          settingItem("Audit trail", "Administrative changes are recorded", "Enabled"),
        ],
        "Environment",
        [
          settingItem("Database", "PostgreSQL", "Connected"),
          settingItem("Application", "Next.js ERP workspace", "Running"),
        ],
        [
          metric("Modules", 7, "Enabled business modules"),
          metric("Products", data.products.length, "Configured master records"),
          metric("Users", data.users.length, "Configured accounts"),
        ],
        [],
      );
    case "admin/audit-logs":
      return sectionData(
        "Audit history",
        "Latest tracked changes and responsible users.",
        data.auditLogs.map((log) => ({
          title: `${log.entity_type ?? "Entity"} / ${log.action ?? "Action"}`,
          description: log.user_name ? `Performed by ${log.user_name}` : "System-generated event",
          status: "Logged",
        })),
        "Audit coverage",
        entitySummaryItems(data.auditLogs),
        [
          metric("Events", data.auditLogs.length, "Recent audit records"),
          metric("Users involved", new Set(data.auditLogs.map((log) => log.user_name).filter(Boolean)).size, "Recorded actors"),
          metric("Entity types", new Set(data.auditLogs.map((log) => log.entity_type).filter(Boolean)).size, "Tracked record groups"),
        ],
        [],
      );
    case "admin/master-data":
      return sectionData(
        "Product master",
        "Products, pricing, and procurement rules used across the ERP.",
        data.products.map(productItem),
        "Business partners",
        [...data.customers.map(customerItem), ...data.vendors.map(vendorItem)],
        [
          metric("Products", data.products.length, "Product master records"),
          metric("Customers", data.customers.length, "Customer accounts"),
          metric("Vendors", data.vendors.length, "Supplier accounts"),
        ],
        data.stockItems,
      );
    case "admin/all-modules":
      return sectionData(
        "Enabled ERP modules",
        "Operational areas available to the business.",
        [
          moduleItem("Sales", data.salesOrders.length, "Customer demand and order fulfillment"),
          moduleItem("Purchase", data.purchaseOrders.length, "Vendor procurement and incoming stock"),
          moduleItem("Manufacturing", data.manufacturingOrders.length, "Production and shop-floor operations"),
          moduleItem("Inventory", data.stockLedger.length, "Stock position and movement history"),
          moduleItem("Master data", data.products.length, "Products and business partners"),
          moduleItem("Administration", data.users.length, "Users, roles, settings, and audit"),
        ],
        "Recent activity",
        data.auditLogs.map(auditItem),
        [
          metric("Modules", 6, "Enabled work areas"),
          metric("Operational records", data.salesOrders.length + data.purchaseOrders.length + data.manufacturingOrders.length, "Orders across workflows"),
          metric("Stock movements", data.stockLedger.length, "Ledger activity"),
        ],
        [],
      );
    case "sales/customers":
      return sectionData(
        "Customer accounts",
        "Contacts and sales-order activity by customer.",
        data.customers.map(customerItem),
        "Recent sales orders",
        data.salesOrders.map(salesOrderItem),
        [
          metric("Customers", data.customers.length, "Customer master records"),
          metric("With orders", data.customers.filter((customer) => customer.order_count > 0).length, "Customers with sales activity"),
          metric("Orders", data.salesOrders.length, "Sales orders recorded"),
        ],
        [],
      );
    case "sales/sales-orders":
      return sectionData(
        "Sales orders",
        "Customer demand, value, and current order status.",
        data.salesOrders.map(salesOrderItem),
        "Customers",
        data.customers.map(customerItem),
        [
          metric("Orders", data.salesOrders.length, "Total sales orders"),
          metric("Open orders", openSales.length, "Orders still in progress"),
          metric("Order value", formatMoney(sumOrderValue(data.salesOrders)), "Total recorded value"),
        ],
        [],
      );
    case "sales/order-items":
      return sectionData(
        "Sales order items",
        "Products, quantities, and prices requested by customers.",
        data.salesOrderItems.map(orderLineItem),
        "Product availability",
        data.products.map(productItem),
        [
          metric("Order lines", data.salesOrderItems.length, "Products requested"),
          metric("Units ordered", sumQuantity(data.salesOrderItems), "Total item quantity"),
          metric("Line value", formatMoney(sumLineValue(data.salesOrderItems)), "Extended sales value"),
        ],
        [],
      );
    case "sales/shortages":
      return sectionData(
        "Sales shortages",
        "Products with five or fewer units available for new demand.",
        lowStockProducts.map(stockProductItem),
        "Affected orders",
        openSales.map(salesOrderItem),
        [
          metric("Low-stock products", lowStockProducts.length, "Require fulfillment attention"),
          metric("Open orders", openSales.length, "Potentially affected demand"),
          metric("Units available", lowStockProducts.reduce((sum, product) => sum + availableQty(product), 0), "Across shortage products"),
        ],
        lowStockProducts.map(stockItem),
      );
    case "sales/delivery-status":
      return sectionData(
        "Delivery status",
        "Order progress from confirmation through customer fulfillment.",
        data.salesOrders.map(salesOrderItem),
        "Reserved stock",
        reservedProducts.map(stockProductItem),
        [
          metric("Orders to deliver", openSales.length, "Not yet completed"),
          metric("Reserved products", reservedProducts.length, "Stock committed to demand"),
          metric("Completed", data.salesOrders.filter((order) => order.status === "DONE").length, "Delivered orders"),
        ],
        [],
      );
    case "purchase/vendors":
      return sectionData(
        "Approved vendors",
        "Supplier contacts and linked product coverage.",
        data.vendors.map(vendorItem),
        "Recent purchase orders",
        data.purchaseOrders.map(purchaseOrderItem),
        [
          metric("Vendors", data.vendors.length, "Approved suppliers"),
          metric("Linked products", data.vendors.reduce((sum, vendor) => sum + vendor.product_count, 0), "Vendor-product links"),
          metric("Purchase orders", data.purchaseOrders.length, "Supplier orders"),
        ],
        [],
      );
    case "purchase/purchase-orders":
      return sectionData(
        "Purchase orders",
        "Supplier orders, values, and procurement status.",
        data.purchaseOrders.map(purchaseOrderItem),
        "Vendor coverage",
        data.vendors.map(vendorItem),
        [
          metric("Orders", data.purchaseOrders.length, "Total purchase orders"),
          metric("Open orders", openPurchases.length, "Awaiting completion"),
          metric("Order value", formatMoney(sumOrderValue(data.purchaseOrders)), "Total procurement value"),
        ],
        [],
      );
    case "purchase/purchase-items":
      return sectionData(
        "Purchase order items",
        "Materials, quantities, and costs ordered from suppliers.",
        data.purchaseOrderItems.map(orderLineItem),
        "Raw materials",
        data.products.filter(isRawMaterial).map(productItem),
        [
          metric("Order lines", data.purchaseOrderItems.length, "Materials ordered"),
          metric("Units ordered", sumQuantity(data.purchaseOrderItems), "Incoming quantity"),
          metric("Line cost", formatMoney(sumLineValue(data.purchaseOrderItems)), "Extended purchase cost"),
        ],
        [],
      );
    case "purchase/incoming-stock":
      return sectionData(
        "Incoming stock",
        "Open supplier orders expected to replenish inventory.",
        openPurchases.map(purchaseOrderItem),
        "Materials on order",
        data.purchaseOrderItems.map(orderLineItem),
        [
          metric("Open purchase orders", openPurchases.length, "Awaiting receipt"),
          metric("Incoming units", sumQuantity(data.purchaseOrderItems), "Ordered material quantity"),
          metric("Suppliers", new Set(data.purchaseOrders.map((order) => order.vendor_name).filter(Boolean)).size, "Vendors supplying orders"),
        ],
        [],
      );
    case "purchase/shortage-demand":
      return sectionData(
        "Shortage demand",
        "Low-stock products requiring procurement attention.",
        lowStockProducts.map(stockProductItem),
        "Open purchase orders",
        openPurchases.map(purchaseOrderItem),
        [
          metric("Shortage products", lowStockProducts.length, "At or below threshold"),
          metric("Open purchase orders", openPurchases.length, "Replenishment in progress"),
          metric("Raw materials at risk", lowStockProducts.filter(isRawMaterial).length, "Production components"),
        ],
        lowStockProducts.map(stockItem),
      );
    case "manufacturing/manufacturing-orders":
      return sectionData(
        "Manufacturing orders",
        "Production demand, quantities, and current execution status.",
        data.manufacturingOrders.map(manufacturingOrderItem),
        "Related work orders",
        data.workOrders.map(workOrderItem),
        [
          metric("Manufacturing orders", data.manufacturingOrders.length, "Production records"),
          metric("Ready", readyManufacturing.length, "Available to start"),
          metric("In progress", pendingManufacturing.length, "Not yet completed"),
        ],
        [],
      );
    case "manufacturing/work-orders":
      return sectionData(
        "Work orders",
        "Shop-floor operations, planned duration, and execution status.",
        data.workOrders.map(workOrderItem),
        "Manufacturing orders",
        data.manufacturingOrders.map(manufacturingOrderItem),
        [
          metric("Work orders", data.workOrders.length, "Production operations"),
          metric("Planned minutes", data.workOrders.reduce((sum, order) => sum + Number(order.duration_minutes ?? 0), 0), "Total operation duration"),
          metric("Waiting", data.workOrders.filter((order) => order.status !== "DONE").length, "Operations remaining"),
        ],
        [],
      );
    case "manufacturing/bom-planning":
      return sectionData(
        "Bill of materials",
        "Components and quantities required to manufacture products.",
        data.bomItems.map((item) => ({
          title: item.product_name ?? "Manufactured product",
          description: `${item.component_name ?? "Component"} / Qty ${item.quantity ?? 0}`,
          status: "BoM item",
        })),
        "Manufactured products",
        data.products.filter((product) => product.procurement_type === "MANUFACTURE").map(productItem),
        [
          metric("BoM lines", data.bomItems.length, "Component requirements"),
          metric("Manufactured products", new Set(data.bomItems.map((item) => item.product_name).filter(Boolean)).size, "Products with BoMs"),
          metric("Components", new Set(data.bomItems.map((item) => item.component_name).filter(Boolean)).size, "Unique materials"),
        ],
        [],
      );
    case "manufacturing/material-readiness":
      return sectionData(
        "Material readiness",
        "Component stock available for planned production.",
        data.products.filter(isRawMaterial).map(stockProductItem),
        "Ready manufacturing orders",
        readyManufacturing.map(manufacturingOrderItem),
        [
          metric("Raw materials", data.products.filter(isRawMaterial).length, "Tracked components"),
          metric("Material shortages", lowStockProducts.filter(isRawMaterial).length, "Components at risk"),
          metric("Ready orders", readyManufacturing.length, "Can begin production"),
        ],
        data.products.filter(isRawMaterial).map(stockItem),
      );
    case "manufacturing/completion-queue":
      return sectionData(
        "Completion queue",
        "Production and work orders still awaiting completion.",
        pendingManufacturing.map(manufacturingOrderItem),
        "Open operations",
        data.workOrders.filter((order) => order.status !== "DONE").map(workOrderItem),
        [
          metric("Orders pending", pendingManufacturing.length, "Manufacturing not complete"),
          metric("Operations open", data.workOrders.filter((order) => order.status !== "DONE").length, "Work remaining"),
          metric("Completed orders", data.manufacturingOrders.filter((order) => order.status === "DONE").length, "Finished production"),
        ],
        [],
      );
    case "inventory/on-hand-stock":
      return sectionData(
        "On hand stock",
        "Physical product quantities currently recorded in inventory.",
        data.products.map((product) => ({
          title: product.name,
          description: `${product.sku} / ${product.procurement_type ?? "N/A"}`,
          status: `${Number(product.on_hand_qty ?? 0)} on hand`,
        })),
        "Low-stock products",
        lowStockProducts.map(stockProductItem),
        [
          metric("Products", data.products.length, "Tracked inventory records"),
          metric("On hand units", data.products.reduce((sum, product) => sum + Number(product.on_hand_qty ?? 0), 0), "Physical quantity"),
          metric("Low stock", lowStockProducts.length, "At or below threshold"),
        ],
        data.products.map(stockItem),
      );
    case "inventory/reserved-stock":
      return sectionData(
        "Reserved stock",
        "Inventory quantities committed to sales or production demand.",
        reservedProducts.map((product) => ({
          title: product.name,
          description: `${product.sku} / ${availableQty(product)} still available`,
          status: `${Number(product.reserved_qty ?? 0)} reserved`,
        })),
        "Open sales demand",
        openSales.map(salesOrderItem),
        [
          metric("Reserved products", reservedProducts.length, "Products with commitments"),
          metric("Reserved units", reservedProducts.reduce((sum, product) => sum + Number(product.reserved_qty ?? 0), 0), "Total committed stock"),
          metric("Open sales orders", openSales.length, "Demand awaiting fulfillment"),
        ],
        reservedProducts.map(stockItem),
      );
    case "inventory/stock-ledger":
      return sectionData(
        "Stock ledger",
        "Receipts, deliveries, production issues, and adjustments.",
        data.stockLedger.map(ledgerItem),
        "Movement summary",
        movementSummaryItems(data.stockLedger),
        [
          metric("Movements", data.stockLedger.length, "Recent ledger entries"),
          metric("Movement types", new Set(data.stockLedger.map((row) => row.movement_type).filter(Boolean)).size, "Kinds of stock activity"),
          metric("Products moved", new Set(data.stockLedger.map((row) => row.product_name).filter(Boolean)).size, "Products affected"),
        ],
        data.stockItems,
      );
    case "inventory/receive-materials":
      return sectionData(
        "Receive materials",
        "Purchase receipts and incoming material movements.",
        data.stockLedger.filter(isReceipt).map(ledgerItem),
        "Open purchase orders",
        openPurchases.map(purchaseOrderItem),
        [
          metric("Receipt movements", data.stockLedger.filter(isReceipt).length, "Materials received"),
          metric("Open purchase orders", openPurchases.length, "Expected receipts"),
          metric("Incoming units", sumQuantity(data.purchaseOrderItems), "Quantity on purchase lines"),
        ],
        data.products.filter(isRawMaterial).map(stockItem),
      );
    case "inventory/deliver-products":
      return sectionData(
        "Deliver products",
        "Finished-product issues and customer delivery demand.",
        data.stockLedger.filter(isDelivery).map(ledgerItem),
        "Sales orders to fulfill",
        openSales.map(salesOrderItem),
        [
          metric("Delivery movements", data.stockLedger.filter(isDelivery).length, "Finished-product issues"),
          metric("Orders to fulfill", openSales.length, "Open customer orders"),
          metric("Finished products", data.products.filter((product) => !isRawMaterial(product)).length, "Deliverable product records"),
        ],
        data.products.filter((product) => !isRawMaterial(product)).map(stockItem),
      );
    case "owner/revenue-view":
      return sectionData(
        "Revenue performance",
        "Sales-order value and current commercial pipeline.",
        data.salesOrders.map(salesOrderItem),
        "Customers",
        data.customers.map(customerItem),
        [
          metric("Sales value", formatMoney(sumOrderValue(data.salesOrders)), "Recorded order revenue"),
          metric("Orders", data.salesOrders.length, "Sales transactions"),
          metric("Average order", formatMoney(averageOrderValue(data.salesOrders)), "Average sales-order value"),
        ],
        [],
      );
    case "owner/product-master":
      return sectionData(
        "Product portfolio",
        "Products, prices, procurement strategies, and inventory position.",
        data.products.map(productItem),
        "Vendor coverage",
        data.vendors.map(vendorItem),
        [
          metric("Products", data.products.length, "Portfolio records"),
          metric("Manufactured", data.products.filter((product) => product.procurement_type === "MANUFACTURE").length, "Made internally"),
          metric("Purchased", data.products.filter((product) => product.procurement_type === "BUY").length, "Bought from vendors"),
        ],
        data.products.map(stockItem),
      );
    case "owner/stock-risk":
      return sectionData(
        "Stock risk",
        "Products with limited available inventory and related demand.",
        lowStockProducts.map(stockProductItem),
        "Open customer demand",
        openSales.map(salesOrderItem),
        [
          metric("At-risk products", lowStockProducts.length, "At or below threshold"),
          metric("Reserved units", reservedProducts.reduce((sum, product) => sum + Number(product.reserved_qty ?? 0), 0), "Committed inventory"),
          metric("Open sales orders", openSales.length, "Demand requiring stock"),
        ],
        lowStockProducts.map(stockItem),
      );
    case "owner/production-load":
      return sectionData(
        "Production load",
        "Manufacturing demand and shop-floor operations.",
        data.manufacturingOrders.map(manufacturingOrderItem),
        "Work-order load",
        data.workOrders.map(workOrderItem),
        [
          metric("Manufacturing orders", data.manufacturingOrders.length, "Production demand"),
          metric("Open operations", data.workOrders.filter((order) => order.status !== "DONE").length, "Shop-floor workload"),
          metric("Planned minutes", data.workOrders.reduce((sum, order) => sum + Number(order.duration_minutes ?? 0), 0), "Scheduled operation time"),
        ],
        [],
      );
    case "owner/delayed-orders":
      return sectionData(
        "Orders requiring attention",
        "Open commercial, procurement, and production records.",
        [
          ...openSales.map(salesOrderItem),
          ...pendingManufacturing.map(manufacturingOrderItem),
          ...openPurchases.map(purchaseOrderItem),
        ],
        "Stock constraints",
        lowStockProducts.map(stockProductItem),
        [
          metric("Open sales", openSales.length, "Customer orders"),
          metric("Production pending", pendingManufacturing.length, "Manufacturing orders"),
          metric("Purchases open", openPurchases.length, "Supplier orders"),
        ],
        lowStockProducts.map(stockItem),
      );
    default:
      return sectionData(
        "Section records",
        "No specialized content is configured for this section yet.",
        [],
        "Related records",
        [],
        [metric("Records", 0, "No data available"), metric("Open", 0, "No open items"), metric("Attention", 0, "No alerts")],
        data.stockItems,
      );
  }
}

function sectionData(
  workTitle: string,
  workDescription: string,
  workItems: DashboardItem[],
  sideTitle: string,
  sideItems: DashboardItem[],
  metrics: DashboardMetric[],
  stockItems: StockItem[],
): RoleBusinessData {
  return {
    metrics,
    workTitle,
    workDescription,
    workItems: withEmptyState(workItems),
    sideTitle,
    sideItems: withEmptyState(sideItems),
    stockItems,
  };
}

function metric(label: string, value: string | number, detail: string): DashboardMetric {
  return { label, value: String(value), detail };
}

function withEmptyState(items: DashboardItem[]) {
  return items.length
    ? items
    : [{ title: "No records", description: "There are no records available for this section.", status: "Empty" }];
}

async function getProducts() {
  return (await sql`
    SELECT 
      p.id,
      p.name, 
      p.sku, 
      p.sale_price, 
      p.cost_price, 
      p.procurement_type, 
      i.on_hand_qty, 
      i.reserved_qty, 
      p.image_url, 
      p.product_type,
      p.shipping_charge,
      p.packing_charge,
      p.manufacturing_charge,
      p.other_charge,
      COALESCE((
        SELECT SUM(soi.quantity)
        FROM sales_order_items soi
        JOIN sales_orders so ON so.id = soi.sales_order_id
        WHERE soi.product_id = p.id
          AND so.status IN ('CONFIRMED', 'WAITING_INVENTORY', 'READY_TO_DELIVER')
      ), 0)::int AS open_demand_qty,
      COALESCE((
        SELECT SUM(sl.quantity)
        FROM stock_ledger sl
        JOIN sales_orders so ON so.id = sl.reference_id
        WHERE sl.product_id = p.id
          AND sl.reference_type = 'sales_orders'
          AND sl.movement_type = 'SALES_RESERVE'
          AND so.status IN ('CONFIRMED', 'WAITING_INVENTORY', 'READY_TO_DELIVER')
      ), 0)::int AS open_reserved_qty
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

async function getUsers() {
  return (await sql`
    SELECT name, email, role, created_at
    FROM users
    ORDER BY name
  `) as UserRow[];
}

async function getCustomers() {
  return (await sql`
    SELECT c.name, c.email, c.phone, COUNT(so.id)::int AS order_count
    FROM customers c
    LEFT JOIN sales_orders so ON so.customer_id = c.id
    GROUP BY c.id
    ORDER BY c.name
  `) as CustomerRow[];
}

async function getSalesOrderItems() {
  return (await sql`
    SELECT so.order_number AS reference, p.name AS product_name, soi.quantity, soi.price::text AS unit_price, so.status
    FROM sales_order_items soi
    JOIN sales_orders so ON so.id = soi.sales_order_id
    JOIN products p ON p.id = soi.product_id
    ORDER BY so.created_at DESC, soi.id
  `) as OrderItemRow[];
}

async function getPurchaseOrderItems() {
  return (await sql`
    SELECT po.po_number AS reference, p.name AS product_name, poi.quantity, poi.cost_price::text AS unit_price, po.status
    FROM purchase_order_items poi
    JOIN purchase_orders po ON po.id = poi.purchase_order_id
    JOIN products p ON p.id = poi.product_id
    ORDER BY po.created_at DESC, poi.id
  `) as OrderItemRow[];
}

async function getBomItems() {
  return (await sql`
    SELECT p_parent.name AS product_name, p_comp.name AS component_name, bi.quantity::text
    FROM bom_items bi
    JOIN boms b ON b.id = bi.bom_id
    JOIN products p_parent ON p_parent.id = b.product_id
    JOIN products p_comp ON p_comp.id = bi.component_product_id
    ORDER BY p_parent.name, p_comp.name
  `) as BomRow[];
}

function formatDate(date: Date | string | null): string {
  if (!date) return "N/A";
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function roleSummaryItems(users: UserRow[]): DashboardItem[] {
  const counts: Record<string, number> = {};
  for (const user of users) {
    const role = user.role || "UNASSIGNED";
    counts[role] = (counts[role] || 0) + 1;
  }
  return Object.entries(counts).map(([role, count]) => ({
    title: role,
    description: `${count} user(s) assigned`,
    status: "Active",
  }));
}

function accessItem(role: string, description: string): DashboardItem {
  return {
    title: role,
    description,
    status: "Role",
  };
}

function settingItem(title: string, description: string, status: string): DashboardItem {
  return {
    title,
    description,
    status,
  };
}

function moduleItem(title: string, count: number, description: string): DashboardItem {
  return {
    title,
    description,
    status: `${count} record(s)`,
  };
}

function auditItem(log: AuditRow): DashboardItem {
  return {
    title: `${log.entity_type ?? "Entity"} / ${log.action ?? "Action"}`,
    description: log.user_name ? `Performed by ${log.user_name}` : "System event",
    status: "Logged",
  };
}

function entitySummaryItems(logs: AuditRow[]): DashboardItem[] {
  const counts: Record<string, number> = {};
  for (const log of logs) {
    if (log.entity_type) {
      counts[log.entity_type] = (counts[log.entity_type] || 0) + 1;
    }
  }
  return Object.entries(counts).map(([entity, count]) => ({
    title: entity,
    description: `${count} action(s) logged`,
    status: "Audit",
  }));
}

function customerItem(customer: CustomerRow): DashboardItem {
  return {
    title: customer.name,
    description: customer.email ?? customer.phone ?? "No contact info",
    status: `${customer.order_count} order(s)`,
  };
}

function salesOrderItem(order: SalesOrderRow): DashboardItem {
  return {
    title: order.order_number ?? "Sales Order",
    description: `${order.customer_name ?? "Unknown customer"} / ${order.item_count} item(s)`,
    status: order.status ?? "DRAFT",
  };
}

function purchaseOrderItem(order: PurchaseOrderRow): DashboardItem {
  return {
    title: order.po_number ?? "Purchase Order",
    description: `${order.vendor_name ?? "Unknown vendor"} / ${order.item_count} item(s)`,
    status: order.status ?? "DRAFT",
  };
}

function manufacturingOrderItem(order: ManufacturingOrderRow): DashboardItem {
  return {
    title: order.mo_number ?? "Manufacturing Order",
    description: `${order.product_name ?? "Product"} / Qty ${order.quantity ?? 0}`,
    status: order.status ?? "WAITING",
  };
}

function workOrderItem(workOrder: WorkOrderRow): DashboardItem {
  return {
    title: workOrder.operation_name ?? "Operation",
    description: `${workOrder.mo_number ?? "MO"} / ${workOrder.duration_minutes ?? 0} min`,
    status: workOrder.status ?? "WAITING",
  };
}

function stockProductItem(product: ProductRow): DashboardItem {
  const needed = Math.max(0, Number(product.open_demand_qty ?? 0) - Number(product.open_reserved_qty ?? 0));
  return {
    title: product.name,
    description: `${product.sku ?? "No SKU"} • ${product.open_demand_qty ?? 0} ordered • ${needed} still needed`,
    status: `${availableQty(product)} available`,
  };
}

function stockItem(product: ProductRow): StockItem {
  const available = availableQty(product);
  return {
    name: product.name,
    detail: `${product.sku} / ${product.procurement_type ?? "N/A"}`,
    quantity: `${available} available`,
    status: available <= 5 ? "Low stock" : "Healthy",
    imageUrl: product.image_url,
  };
}

function orderLineItem(line: OrderItemRow): DashboardItem {
  return {
    title: line.product_name ?? "Item",
    description: `${line.reference ?? "Order"} / Qty ${line.quantity ?? 0} @ ${formatMoney(Number(line.unit_price ?? 0))}`,
    status: line.status ?? "DRAFT",
  };
}

function isRawMaterial(product: ProductRow): boolean {
  return product.product_type === "RAW_MATERIAL";
}

function isReceipt(ledger: LedgerRow): boolean {
  const type = ledger.movement_type?.toUpperCase() || "";
  const ref = ledger.reference_type?.toUpperCase() || "";
  return type === "IN" || type === "RECEIPT" || ref === "RECEIPT";
}

function isDelivery(ledger: LedgerRow): boolean {
  const type = ledger.movement_type?.toUpperCase() || "";
  const ref = ledger.reference_type?.toUpperCase() || "";
  return type === "OUT" || type === "DELIVERY" || ref === "DELIVERY";
}

function ledgerItem(ledger: LedgerRow): DashboardItem {
  return {
    title: ledger.product_name ?? "Stock Movement",
    description: `${ledger.reference_type ?? "Reference"} / ${ledger.notes ?? "No notes"}`,
    status: `${ledger.movement_type ?? "MOVE"} ${ledger.quantity ?? 0}`,
  };
}

function movementSummaryItems(ledger: LedgerRow[]): DashboardItem[] {
  const counts: Record<string, number> = {};
  for (const row of ledger) {
    const type = row.movement_type || "UNKNOWN";
    counts[type] = (counts[type] || 0) + 1;
  }
  return Object.entries(counts).map(([type, count]) => ({
    title: type,
    description: `${count} movement(s) logged`,
    status: "Ledger",
  }));
}

function sumQuantity(lines: OrderItemRow[]): number {
  return lines.reduce((sum, line) => sum + (line.quantity ?? 0), 0);
}

function sumLineValue(lines: OrderItemRow[]): number {
  return lines.reduce((sum, line) => sum + (line.quantity ?? 0) * Number(line.unit_price ?? 0), 0);
}

function sumOrderValue(orders: Array<{ total_amount: string | null }>): number {
  return orders.reduce((sum, order) => sum + Number(order.total_amount ?? 0), 0);
}

function averageOrderValue(orders: Array<{ total_amount: string | null }>): number {
  if (orders.length === 0) return 0;
  return sumOrderValue(orders) / orders.length;
}

export type NavbarApproval = {
  id: number;
  title: string;
  desc: string;
  time: string;
  action: string;
  type: "sales" | "purchase" | "manufacturing";
};

export type NavbarNotification = {
  id: string;
  title: string;
  desc: string;
  time: string;
  type: "warning" | "success" | "info";
};

export async function getNavbarData(role: RoleKey): Promise<{
  approvals: NavbarApproval[];
  notifications: NavbarNotification[];
}> {
  try {
    noStore();
    const isExecutive = role === "owner" || role === "admin";
    
    // Determine which approvals queries to run
    const salesPromise = (isExecutive || role === "sales")
      ? (sql`
          SELECT so.id, so.order_number, c.name AS customer_name,
            COALESCE(SUM(soi.quantity * soi.price), 0)::text AS total_amount,
            COUNT(soi.id)::int AS item_count,
            so.created_at
          FROM sales_orders so
          LEFT JOIN customers c ON c.id = so.customer_id
          LEFT JOIN sales_order_items soi ON soi.sales_order_id = so.id
          WHERE so.status = 'DRAFT'
          GROUP BY so.id, c.name, so.created_at
          ORDER BY so.created_at DESC
        ` as unknown as Array<{ id: number; order_number: string; customer_name: string | null; total_amount: string; item_count: number; created_at: Date }>)
      : Promise.resolve([]);

    const purchasePromise = (isExecutive || role === "purchase")
      ? (sql`
          SELECT po.id, po.po_number, v.name AS vendor_name,
            COALESCE(SUM(poi.quantity * poi.cost_price), 0)::text AS total_amount,
            COUNT(poi.id)::int AS item_count,
            po.created_at
          FROM purchase_orders po
          LEFT JOIN vendors v ON v.id = po.vendor_id
          LEFT JOIN purchase_order_items poi ON poi.purchase_order_id = po.id
          WHERE po.status = 'DRAFT'
          GROUP BY po.id, v.name, po.created_at
          ORDER BY po.created_at DESC
        ` as unknown as Array<{ id: number; po_number: string; vendor_name: string | null; total_amount: string; item_count: number; created_at: Date }>)
      : Promise.resolve([]);

    const manufacturingPromise = (isExecutive || role === "manufacturing")
      ? (sql`
          SELECT mo.id, mo.mo_number, p.name AS product_name, mo.quantity, mo.created_at
          FROM manufacturing_orders mo
          LEFT JOIN products p ON p.id = mo.product_id
          WHERE mo.status = 'READY'
          ORDER BY mo.created_at DESC
        ` as unknown as Array<{ id: number; mo_number: string; product_name: string; quantity: number; created_at: Date }>)
      : Promise.resolve([]);

    // Determine which notifications queries to run
    const lowStockPromise = (isExecutive || role === "inventory")
      ? (sql`
          SELECT p.id, p.name, p.sku, i.on_hand_qty, i.reserved_qty
          FROM products p
          JOIN inventory i ON i.product_id = p.id
          WHERE (i.on_hand_qty - i.reserved_qty) <= 5
          ORDER BY (i.on_hand_qty - i.reserved_qty) ASC
        ` as unknown as Array<{ id: number; name: string; sku: string; on_hand_qty: number; reserved_qty: number }>)
      : Promise.resolve([]);

    // Audit logs role filter
    let logsFilter = sql``;
    if (role === "sales") {
      logsFilter = sql`WHERE al.entity_type IN ('sales_orders', 'customers')`;
    } else if (role === "purchase") {
      logsFilter = sql`WHERE al.entity_type IN ('purchase_orders', 'vendors')`;
    } else if (role === "manufacturing") {
      logsFilter = sql`WHERE al.entity_type IN ('manufacturing_orders', 'boms')`;
    } else if (role === "inventory") {
      logsFilter = sql`WHERE al.entity_type IN ('stock_ledger', 'inventory')`;
    }

    const logsPromise = sql`
      SELECT 
        al.id, 
        al.entity_type, 
        al.action, 
        al.created_at, 
        u.name AS user_name,
        CASE 
          WHEN al.entity_type = 'sales_orders' THEN (SELECT order_number FROM sales_orders WHERE id = al.entity_id)
          WHEN al.entity_type = 'purchase_orders' THEN (SELECT po_number FROM purchase_orders WHERE id = al.entity_id)
          WHEN al.entity_type = 'manufacturing_orders' THEN (SELECT mo_number FROM manufacturing_orders WHERE id = al.entity_id)
          ELSE NULL
        END AS reference_number
      FROM audit_logs al
      LEFT JOIN users u ON u.id = al.user_id
      ${logsFilter}
      ORDER BY al.created_at DESC, al.id DESC
      LIMIT 10
    ` as unknown as Array<{ id: number; entity_type: string; action: string; created_at: Date; user_name: string | null; reference_number: string | null }>;

    const [draftSales, draftPurchases, readyMOs, lowStockProducts, recentLogs] = await Promise.all([
      salesPromise,
      purchasePromise,
      manufacturingPromise,
      lowStockPromise,
      logsPromise
    ]);

    const approvals: NavbarApproval[] = [];

    // Format Draft Sales Orders
    for (const so of draftSales) {
      approvals.push({
        id: so.id,
        title: `${so.order_number} Approval Required`,
        desc: `Confirm sales order for ${so.customer_name || "Unknown customer"} - Total value ${formatMoney(Number(so.total_amount))} (${so.item_count} items)`,
        time: so.created_at.toISOString(),
        action: "Confirm",
        type: "sales"
      });
    }

    // Format Draft Purchase Orders
    for (const po of draftPurchases) {
      approvals.push({
        id: po.id,
        title: `${po.po_number} Approval Required`,
        desc: `Approve purchase order for ${po.vendor_name || "Unknown vendor"} - Total value ${formatMoney(Number(po.total_amount))} (${po.item_count} items)`,
        time: po.created_at.toISOString(),
        action: "Approve",
        type: "purchase"
      });
    }

    // Format Ready MOs
    for (const mo of readyMOs) {
      approvals.push({
        id: mo.id,
        title: `${mo.mo_number} Material Release`,
        desc: `Release component stock and start manufacturing of ${mo.quantity}x ${mo.product_name}`,
        time: mo.created_at.toISOString(),
        action: "Release",
        type: "manufacturing"
      });
    }

    const notifications: NavbarNotification[] = [];

    // Format Low Stock Alerts
    for (const prod of lowStockProducts) {
      const avail = prod.on_hand_qty - prod.reserved_qty;
      notifications.push({
        id: `low-stock-${prod.id}`,
        title: "Low Stock Alert",
        desc: `Product ${prod.name} (${prod.sku}) is below safety limit: only ${avail} available`,
        time: new Date().toISOString(), // Current state alert
        type: "warning"
      });
    }

    // Format Recent Logs
    for (const log of recentLogs) {
      let title = `${log.entity_type} Action`;
      let desc = `${log.action} on ${log.entity_type} by ${log.user_name || "System"}`;
      let type: "info" | "success" | "warning" = "info";

      const ref = log.reference_number || `#${log.id}`;

      if (log.entity_type === "sales_orders") {
        if (log.action === "CONFIRM") {
          title = "Order Confirmed";
          desc = `Sales Order ${ref} confirmed by Sales Team`;
          type = "info";
        } else if (log.action === "DELIVER") {
          title = "Order Delivered";
          desc = `Sales Order ${ref} successfully delivered`;
          type = "success";
        } else if (log.action === "CANCEL") {
          title = "Order Cancelled";
          desc = `Sales Order ${ref} was cancelled`;
          type = "warning";
        }
      } else if (log.entity_type === "purchase_orders") {
        if (log.action === "CONFIRM") {
          title = "Purchase PO Confirmed";
          desc = `Purchase Order ${ref} sent to vendor`;
          type = "info";
        } else if (log.action === "RECEIVE") {
          title = "Material Received";
          desc = `Purchase Order ${ref} items received in warehouse`;
          type = "success";
        } else if (log.action === "CANCEL") {
          title = "Purchase PO Cancelled";
          desc = `Purchase Order ${ref} cancelled`;
          type = "warning";
        }
      } else if (log.entity_type === "manufacturing_orders") {
        if (log.action === "START") {
          title = "Production Started";
          desc = `Manufacturing Order ${ref} started production`;
          type = "info";
        } else if (log.action === "COMPLETE") {
          title = "Production Completed";
          desc = `Manufacturing Order ${ref} finished and stored`;
          type = "success";
        } else if (log.action === "CANCEL") {
          title = "Production Cancelled";
          desc = `Manufacturing Order ${ref} was cancelled`;
          type = "warning";
        }
      }

      notifications.push({
        id: `audit-${log.id}`,
        title,
        desc,
        time: log.created_at.toISOString(),
        type
      });
    }

    return { approvals, notifications };
  } catch (error) {
    console.error("Error fetching navbar dropdown data:", error);
    return { approvals: [], notifications: [] };
  }
}
