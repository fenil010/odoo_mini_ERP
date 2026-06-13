//this file handes the fole basae data 

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
