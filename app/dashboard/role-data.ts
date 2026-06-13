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
      description: string;
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
          { label: "Overview", href: "/dashboard/admin", description: "System health and administrative activity.", icon: "home" },
          { label: "Users & roles", href: "/dashboard/admin/users-roles", description: "Manage ERP users and their assigned roles.", icon: "users" },
          { label: "Permissions", href: "/dashboard/admin/permissions", description: "Review access rules for each business role.", icon: "shield" },
          { label: "System settings", href: "/dashboard/admin/system-settings", description: "Configure organization and application defaults.", icon: "settings" },
        ],
      },
      {
        title: "Governance",
        items: [
          { label: "Audit logs", href: "/dashboard/admin/audit-logs", description: "Inspect recorded changes across the ERP.", icon: "fileClock" },
          { label: "Master data", href: "/dashboard/admin/master-data", description: "Maintain shared products, vendors, and customers.", icon: "layers" },
          { label: "All modules", href: "/dashboard/admin/all-modules", description: "Review every enabled ERP module.", icon: "activity" },
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
          { label: "Sales overview", href: "/dashboard/sales", description: "Sales demand, order value, and stock alerts.", icon: "home" },
          { label: "Customers", href: "/dashboard/sales/customers", description: "View and maintain customer accounts.", icon: "users" },
          { label: "Sales orders", href: "/dashboard/sales/sales-orders", description: "Create and track customer sales orders.", icon: "shoppingCart" },
          { label: "Order items", href: "/dashboard/sales/order-items", description: "Review products and quantities on open orders.", icon: "clipboard" },
        ],
      },
      {
        title: "Fulfillment",
        items: [
          { label: "Shortages", href: "/dashboard/sales/shortages", description: "Identify stock shortages affecting sales.", icon: "boxes" },
          { label: "Delivery status", href: "/dashboard/sales/delivery-status", description: "Track fulfillment and customer deliveries.", icon: "truck" },
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
          { label: "Purchase overview", href: "/dashboard/purchase", description: "Procurement totals, suppliers, and incoming stock.", icon: "home" },
          { label: "Vendors", href: "/dashboard/purchase/vendors", description: "Manage approved suppliers and contacts.", icon: "users" },
          { label: "Purchase orders", href: "/dashboard/purchase/purchase-orders", description: "Create and monitor supplier purchase orders.", icon: "receipt" },
          { label: "Purchase items", href: "/dashboard/purchase/purchase-items", description: "Review materials ordered from vendors.", icon: "clipboard" },
        ],
      },
      {
        title: "Receiving",
        items: [
          { label: "Incoming stock", href: "/dashboard/purchase/incoming-stock", description: "Track materials expected from suppliers.", icon: "packagePlus" },
          { label: "Shortage demand", href: "/dashboard/purchase/shortage-demand", description: "Review shortages requiring procurement.", icon: "boxes" },
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
          { label: "Production board", href: "/dashboard/manufacturing", description: "Production status and active manufacturing work.", icon: "home" },
          { label: "Manufacturing orders", href: "/dashboard/manufacturing/manufacturing-orders", description: "Plan and control manufacturing orders.", icon: "factory" },
          { label: "Work orders", href: "/dashboard/manufacturing/work-orders", description: "Manage shop-floor operations and progress.", icon: "wrench" },
          { label: "BoM planning", href: "/dashboard/manufacturing/bom-planning", description: "Review bills of materials and components.", icon: "layers" },
        ],
      },
      {
        title: "Execution",
        items: [
          { label: "Material readiness", href: "/dashboard/manufacturing/material-readiness", description: "Check component availability before production.", icon: "boxes" },
          { label: "Completion queue", href: "/dashboard/manufacturing/completion-queue", description: "Review production waiting to be completed.", icon: "packageCheck" },
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
          { label: "Stock overview", href: "/dashboard/inventory", description: "Current stock position and warehouse activity.", icon: "home" },
          { label: "On hand stock", href: "/dashboard/inventory/on-hand-stock", description: "View physical quantities available by product.", icon: "warehouse" },
          { label: "Reserved stock", href: "/dashboard/inventory/reserved-stock", description: "Review stock committed to open demand.", icon: "boxes" },
          { label: "Stock ledger", href: "/dashboard/inventory/stock-ledger", description: "Inspect receipts, issues, and adjustments.", icon: "fileClock" },
        ],
      },
      {
        title: "Movement",
        items: [
          { label: "Receive materials", href: "/dashboard/inventory/receive-materials", description: "Record materials received into inventory.", icon: "packagePlus" },
          { label: "Deliver products", href: "/dashboard/inventory/deliver-products", description: "Prepare and record finished-product deliveries.", icon: "truck" },
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
          { label: "Executive dashboard", href: "/dashboard/owner", description: "Combined commercial and operational performance.", icon: "home" },
          { label: "Revenue view", href: "/dashboard/owner/revenue-view", description: "Review current sales value and revenue signals.", icon: "barChart" },
          { label: "Product master", href: "/dashboard/owner/product-master", description: "Review products, prices, and procurement methods.", icon: "layers" },
          { label: "Stock risk", href: "/dashboard/owner/stock-risk", description: "Monitor low-stock and fulfillment exposure.", icon: "boxes" },
        ],
      },
      {
        title: "Operations",
        items: [
          { label: "Production load", href: "/dashboard/owner/production-load", description: "See manufacturing workload and readiness.", icon: "factory" },
          { label: "Delayed orders", href: "/dashboard/owner/delayed-orders", description: "Review orders at risk of missing targets.", icon: "fileClock" },
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

export function getRolePage(role: RoleKey, section?: string) {
  const dashboard = roleDashboards[role];
  const items = dashboard.sidebarSections.flatMap((sidebarSection) => sidebarSection.items);

  if (!section) {
    return items[0];
  }

  return items.find((item) => item.href === `/dashboard/${role}/${section}`);
}

export function getRoleSections(role: RoleKey) {
  return roleDashboards[role].sidebarSections
    .flatMap((section) => section.items)
    .slice(1)
    .map((item) => item.href.split("/").at(-1))
    .filter((section): section is string => Boolean(section));
}
