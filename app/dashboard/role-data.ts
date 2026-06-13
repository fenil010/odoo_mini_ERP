export type RoleKey =
  | "admin"
  | "sales"
  | "purchase"
  | "manufacturing"
  | "inventory"
  | "owner";

export type RoleDashboard = {
  key: RoleKey;
  dbRole: string;
  title: string;
  responsibility: string;
  focus: string;
  metrics: Array<{
    label: string;
    value: string;
    detail: string;
  }>;
  actions: Array<{
    title: string;
    description: string;
    href: string;
  }>;
  queue: Array<{
    item: string;
    status: string;
    owner: string;
  }>;
  modules: string[];
};

export const roleDashboards: Record<RoleKey, RoleDashboard> = {
  admin: {
    key: "admin",
    dbRole: "ADMIN",
    title: "Admin",
    responsibility: "Full system access, manage everything",
    focus: "Control users, permissions, masters, audit logs, and every ERP workflow.",
    metrics: [
      { label: "Active users", value: "6", detail: "All role accounts seeded" },
      { label: "Open modules", value: "8", detail: "System-wide access" },
      { label: "Audit events", value: "128", detail: "Last 7 days" },
    ],
    actions: [
      {
        title: "Manage users",
        description: "Create users, assign roles, and review access.",
        href: "/dashboard/admin",
      },
      {
        title: "Review audit logs",
        description: "Track critical changes across sales, purchase, and stock.",
        href: "/dashboard/admin",
      },
      {
        title: "Configure masters",
        description: "Maintain products, vendors, customers, and BoMs.",
        href: "/dashboard/admin",
      },
    ],
    queue: [
      { item: "New inventory manager access", status: "Pending approval", owner: "Admin" },
      { item: "Vendor master import", status: "Ready to validate", owner: "Admin" },
      { item: "Role permission review", status: "Due today", owner: "Admin" },
    ],
    modules: ["Users", "Products", "Sales", "Purchase", "Manufacturing", "Inventory", "Audit"],
  },
  sales: {
    key: "sales",
    dbRole: "SALES",
    title: "Sales User",
    responsibility: "Create and manage Sales Orders",
    focus: "Capture demand, confirm orders, and track delivery status.",
    metrics: [
      { label: "Draft orders", value: "12", detail: "Need confirmation" },
      { label: "Confirmed", value: "24", detail: "In fulfillment" },
      { label: "Shortages", value: "5", detail: "Procurement required" },
    ],
    actions: [
      {
        title: "Create sales order",
        description: "Add customer demand and trigger stock checks.",
        href: "/dashboard/sales",
      },
      {
        title: "Confirm order",
        description: "Move orders from draft into fulfillment.",
        href: "/dashboard/sales",
      },
      {
        title: "Track delivery",
        description: "Monitor order status through delivery completion.",
        href: "/dashboard/sales",
      },
    ],
    queue: [
      { item: "SO-1024 Dining Table", status: "Shortage detected", owner: "Sales" },
      { item: "SO-1025 Office Chair", status: "Ready to confirm", owner: "Sales" },
      { item: "Customer follow-up", status: "Waiting response", owner: "Sales" },
    ],
    modules: ["Customers", "Sales Orders", "Order Items", "Delivery Status"],
  },
  purchase: {
    key: "purchase",
    dbRole: "PURCHASE",
    title: "Purchase User",
    responsibility: "Create and manage Purchase Orders",
    focus: "Handle vendor procurement and keep shortage items moving.",
    metrics: [
      { label: "Draft POs", value: "7", detail: "Need vendor confirmation" },
      { label: "Incoming", value: "31", detail: "Materials expected" },
      { label: "Vendors", value: "14", detail: "Active suppliers" },
    ],
    actions: [
      {
        title: "Create purchase order",
        description: "Raise procurement for required materials.",
        href: "/dashboard/purchase",
      },
      {
        title: "Confirm supplier",
        description: "Lock pricing, quantities, and expected receipt.",
        href: "/dashboard/purchase",
      },
      {
        title: "Review shortages",
        description: "Prioritize components blocking manufacturing.",
        href: "/dashboard/purchase",
      },
    ],
    queue: [
      { item: "PO-001 Wooden Legs", status: "Vendor quote received", owner: "Purchase" },
      { item: "PO-002 Screws", status: "Awaiting confirmation", owner: "Purchase" },
      { item: "Material shortage list", status: "Needs review", owner: "Purchase" },
    ],
    modules: ["Vendors", "Purchase Orders", "Purchase Items", "Receipts"],
  },
  manufacturing: {
    key: "manufacturing",
    dbRole: "MANUFACTURING",
    title: "Manufacturing User",
    responsibility: "Manage Manufacturing Orders and Work Orders",
    focus: "Plan production, execute work orders, and complete manufacturing orders.",
    metrics: [
      { label: "Waiting material", value: "4", detail: "Blocked by components" },
      { label: "Ready MOs", value: "9", detail: "Can start production" },
      { label: "In progress", value: "6", detail: "Active work orders" },
    ],
    actions: [
      {
        title: "Start production",
        description: "Begin ready manufacturing orders.",
        href: "/dashboard/manufacturing",
      },
      {
        title: "Update work order",
        description: "Track operation status and duration.",
        href: "/dashboard/manufacturing",
      },
      {
        title: "Complete MO",
        description: "Consume materials and produce finished goods.",
        href: "/dashboard/manufacturing",
      },
    ],
    queue: [
      { item: "MO-001 Dining Table", status: "Waiting materials", owner: "Manufacturing" },
      { item: "WO-004 Assembly", status: "In progress", owner: "Manufacturing" },
      { item: "BoM verification", status: "Ready", owner: "Manufacturing" },
    ],
    modules: ["Manufacturing Orders", "Work Orders", "BoMs", "Component Usage"],
  },
  inventory: {
    key: "inventory",
    dbRole: "INVENTORY",
    title: "Inventory Manager",
    responsibility: "Track stock, receive materials, deliver products",
    focus: "Keep inventory accurate across receipts, reservations, production, and delivery.",
    metrics: [
      { label: "Receipts due", value: "8", detail: "Purchase orders incoming" },
      { label: "Reserved stock", value: "143", detail: "Units committed" },
      { label: "Ledger moves", value: "52", detail: "Today" },
    ],
    actions: [
      {
        title: "Receive materials",
        description: "Increase stock and record receipt movement.",
        href: "/dashboard/inventory",
      },
      {
        title: "Deliver products",
        description: "Decrease finished goods stock for delivered orders.",
        href: "/dashboard/inventory",
      },
      {
        title: "Review stock ledger",
        description: "Audit inventory movements by product and reference.",
        href: "/dashboard/inventory",
      },
    ],
    queue: [
      { item: "Receipt for PO-001", status: "Expected today", owner: "Inventory" },
      { item: "Delivery for SO-1024", status: "Waiting finished goods", owner: "Inventory" },
      { item: "Stock variance check", status: "Needs count", owner: "Inventory" },
    ],
    modules: ["Inventory", "Stock Ledger", "Receipts", "Deliveries"],
  },
  owner: {
    key: "owner",
    dbRole: "OWNER",
    title: "Business Owner",
    responsibility: "Monitor business, create/manage products, view dashboard",
    focus: "See business health, product performance, and workflow bottlenecks.",
    metrics: [
      { label: "Open revenue", value: "$84k", detail: "Confirmed sales" },
      { label: "Production load", value: "68%", detail: "Capacity in use" },
      { label: "Stock risk", value: "11", detail: "Products below target" },
    ],
    actions: [
      {
        title: "View dashboard",
        description: "Track sales, production, purchase, and stock health.",
        href: "/dashboard/owner",
      },
      {
        title: "Manage products",
        description: "Create products and review pricing configuration.",
        href: "/dashboard/owner",
      },
      {
        title: "Review bottlenecks",
        description: "Find delays across demand, procurement, and delivery.",
        href: "/dashboard/owner",
      },
    ],
    queue: [
      { item: "Monthly operations view", status: "Updated", owner: "Owner" },
      { item: "Dining Table margin", status: "Needs review", owner: "Owner" },
      { item: "Delayed purchase orders", status: "3 active", owner: "Owner" },
    ],
    modules: ["Dashboard", "Products", "Sales Overview", "Inventory Health"],
  },
};

export const roleOrder: RoleKey[] = [
  "admin",
  "sales",
  "purchase",
  "manufacturing",
  "inventory",
  "owner",
];
