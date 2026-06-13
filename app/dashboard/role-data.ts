export type RoleKey =
  | "admin"
  | "sales"
  | "purchase"
  | "manufacturing"
  | "inventory"
  | "owner";

export type SidebarIcon =
  | "activity"
  | "barChart"
  | "boxes"
  | "clipboard"
  | "factory"
  | "fileClock"
  | "home"
  | "layers"
  | "packageCheck"
  | "packagePlus"
  | "receipt"
  | "settings"
  | "shield"
  | "shoppingCart"
  | "truck"
  | "users"
  | "warehouse"
  | "wrench";

export type RoleDashboard = {
  key: RoleKey;
  dbRole: string;
  title: string;
  responsibility: string;
  focus: string;
  sidebarTitle: string;
  sidebarSections: Array<{
    title: string;
    items: Array<{
      label: string;
      href: string;
      icon: SidebarIcon;
    }>;
  }>;
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
    sidebarTitle: "System control",
    sidebarSections: [
      {
        title: "Admin",
        items: [
          { label: "Overview", href: "/dashboard/admin", icon: "home" },
          { label: "Users & roles", href: "/dashboard/admin", icon: "users" },
          { label: "Permissions", href: "/dashboard/admin", icon: "shield" },
          { label: "System settings", href: "/dashboard/admin", icon: "settings" },
        ],
      },
      {
        title: "Governance",
        items: [
          { label: "Audit logs", href: "/dashboard/admin", icon: "fileClock" },
          { label: "Master data", href: "/dashboard/admin", icon: "layers" },
          { label: "All modules", href: "/dashboard/admin", icon: "activity" },
        ],
      },
    ],
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
    sidebarTitle: "Sales desk",
    sidebarSections: [
      {
        title: "Sales",
        items: [
          { label: "Sales overview", href: "/dashboard/sales", icon: "home" },
          { label: "Customers", href: "/dashboard/sales", icon: "users" },
          { label: "Sales orders", href: "/dashboard/sales", icon: "shoppingCart" },
          { label: "Order items", href: "/dashboard/sales", icon: "clipboard" },
        ],
      },
      {
        title: "Fulfillment",
        items: [
          { label: "Shortages", href: "/dashboard/sales", icon: "boxes" },
          { label: "Delivery status", href: "/dashboard/sales", icon: "truck" },
        ],
      },
    ],
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
    sidebarTitle: "Procurement",
    sidebarSections: [
      {
        title: "Purchase",
        items: [
          { label: "Purchase overview", href: "/dashboard/purchase", icon: "home" },
          { label: "Vendors", href: "/dashboard/purchase", icon: "users" },
          { label: "Purchase orders", href: "/dashboard/purchase", icon: "receipt" },
          { label: "Purchase items", href: "/dashboard/purchase", icon: "clipboard" },
        ],
      },
      {
        title: "Receiving",
        items: [
          { label: "Incoming stock", href: "/dashboard/purchase", icon: "packagePlus" },
          { label: "Shortage demand", href: "/dashboard/purchase", icon: "boxes" },
        ],
      },
    ],
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
    sidebarTitle: "Production",
    sidebarSections: [
      {
        title: "Manufacturing",
        items: [
          { label: "Production board", href: "/dashboard/manufacturing", icon: "home" },
          { label: "Manufacturing orders", href: "/dashboard/manufacturing", icon: "factory" },
          { label: "Work orders", href: "/dashboard/manufacturing", icon: "wrench" },
          { label: "BoM planning", href: "/dashboard/manufacturing", icon: "layers" },
        ],
      },
      {
        title: "Execution",
        items: [
          { label: "Material readiness", href: "/dashboard/manufacturing", icon: "boxes" },
          { label: "Completion queue", href: "/dashboard/manufacturing", icon: "packageCheck" },
        ],
      },
    ],
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
    sidebarTitle: "Warehouse",
    sidebarSections: [
      {
        title: "Inventory",
        items: [
          { label: "Stock overview", href: "/dashboard/inventory", icon: "home" },
          { label: "On hand stock", href: "/dashboard/inventory", icon: "warehouse" },
          { label: "Reserved stock", href: "/dashboard/inventory", icon: "boxes" },
          { label: "Stock ledger", href: "/dashboard/inventory", icon: "fileClock" },
        ],
      },
      {
        title: "Movement",
        items: [
          { label: "Receive materials", href: "/dashboard/inventory", icon: "packagePlus" },
          { label: "Deliver products", href: "/dashboard/inventory", icon: "truck" },
        ],
      },
    ],
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
    sidebarTitle: "Executive view",
    sidebarSections: [
      {
        title: "Business",
        items: [
          { label: "Executive dashboard", href: "/dashboard/owner", icon: "home" },
          { label: "Revenue view", href: "/dashboard/owner", icon: "barChart" },
          { label: "Product master", href: "/dashboard/owner", icon: "layers" },
          { label: "Stock risk", href: "/dashboard/owner", icon: "boxes" },
        ],
      },
      {
        title: "Operations",
        items: [
          { label: "Production load", href: "/dashboard/owner", icon: "factory" },
          { label: "Delayed orders", href: "/dashboard/owner", icon: "fileClock" },
        ],
      },
    ],
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
