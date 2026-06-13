import { sql } from "@/lib/db";

export type AdminAnalytics = {
  ordersByStatus: { status: string; count: number }[];
  monthlyRevenue: { month: string; revenue: number }[];
  inventoryValue: { name: string; value: number }[];
  usersByRole: { role: string; count: number }[];
};

export type SalesAnalytics = {
  ordersThisMonth: { date: string; count: number }[];
  deliveredVsPending: { name: string; value: number }[];
  revenueTrend: { month: string; revenue: number }[];
};

export type PurchaseAnalytics = {
  purchaseOrdersByStatus: { status: string; count: number }[];
  vendorPerformance: { name: string; spend: number }[];
  monthlyProcurementCost: { month: string; cost: number }[];
};

export type ManufacturingAnalytics = {
  manufacturingOrdersByStatus: { status: string; count: number }[];
  productionOutput: { month: string; output: number }[];
  materialConsumption: { name: string; consumed: number }[];
};

export type InventoryAnalytics = {
  topInventoryProducts: { name: string; quantity: number }[];
  lowStockProducts: { name: string; available: number }[];
  stockMovementTrend: { date: string; movements: number }[];
};

export type OwnerAnalytics = {
  revenueTrend: { month: string; revenue: number }[];
  inventoryValueTrend: { month: string; value: number }[];
  orderFulfillmentRate: { name: string; value: number }[];
  procurementVsSales: { month: string; sales: number; purchases: number }[];
};

export async function getAdminAnalytics(): Promise<AdminAnalytics> {
  const [ordersByStatus, monthlyRevenue, inventoryValue, usersByRole] = await Promise.all([
    sql`
      SELECT status, COUNT(*)::int as count 
      FROM sales_orders 
      GROUP BY status
    `,
    sql`
      SELECT TO_CHAR(created_at, 'YYYY-MM') as month, SUM(soi.quantity * soi.price)::float as revenue
      FROM sales_orders so
      JOIN sales_order_items soi ON soi.sales_order_id = so.id
      WHERE so.status != 'CANCELLED'
      GROUP BY month
      ORDER BY month ASC
    `,
    sql`
      SELECT p.name, COALESCE(i.on_hand_qty * p.cost_price, 0)::float as value
      FROM products p
      JOIN inventory i ON i.product_id = p.id
      WHERE COALESCE(i.on_hand_qty, 0) > 0
      ORDER BY value DESC
      LIMIT 6
    `,
    sql`
      SELECT role, COUNT(*)::int as count 
      FROM users 
      GROUP BY role
    `
  ]);

  return {
    ordersByStatus: ordersByStatus.map(r => ({ status: r.status, count: r.count })),
    monthlyRevenue: monthlyRevenue.map(r => ({ month: r.month, revenue: r.revenue })),
    inventoryValue: inventoryValue.map(r => ({ name: r.name, value: r.value })),
    usersByRole: usersByRole.map(r => ({ role: r.role, count: r.count }))
  };
}

export async function getSalesAnalytics(): Promise<SalesAnalytics> {
  const [ordersThisMonth, deliveredVsPending, revenueTrend] = await Promise.all([
    sql`
      SELECT TO_CHAR(created_at, 'YYYY-MM-DD') as date, COUNT(*)::int as count
      FROM sales_orders
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY date
      ORDER BY date ASC
    `,
    sql`
      SELECT 
        CASE 
          WHEN status = 'DELIVERED' THEN 'Delivered' 
          WHEN status = 'DRAFT' THEN 'Draft'
          WHEN status = 'CANCELLED' THEN 'Cancelled'
          ELSE 'Pending' 
        END as name,
        COUNT(*)::int as value
      FROM sales_orders
      GROUP BY name
    `,
    sql`
      SELECT TO_CHAR(created_at, 'YYYY-MM') as month, SUM(soi.quantity * soi.price)::float as revenue
      FROM sales_orders so
      JOIN sales_order_items soi ON soi.sales_order_id = so.id
      WHERE so.status = 'DELIVERED'
      GROUP BY month
      ORDER BY month ASC
    `
  ]);

  return {
    ordersThisMonth: ordersThisMonth.map(r => ({ date: r.date, count: r.count })),
    deliveredVsPending: deliveredVsPending.map(r => ({ name: r.name, value: r.value })),
    revenueTrend: revenueTrend.map(r => ({ month: r.month, revenue: r.revenue }))
  };
}

export async function getPurchaseAnalytics(): Promise<PurchaseAnalytics> {
  const [purchaseOrdersByStatus, vendorPerformance, monthlyProcurementCost] = await Promise.all([
    sql`
      SELECT status, COUNT(*)::int as count 
      FROM purchase_orders 
      GROUP BY status
    `,
    sql`
      SELECT COALESCE(v.name, 'Deleted Vendor') as name, SUM(poi.quantity * poi.cost_price)::float as spend
      FROM purchase_orders po
      LEFT JOIN vendors v ON v.id = po.vendor_id
      JOIN purchase_order_items poi ON poi.purchase_order_id = po.id
      WHERE po.status != 'CANCELLED'
      GROUP BY COALESCE(v.name, 'Deleted Vendor')
      ORDER BY spend DESC
      LIMIT 6
    `,
    sql`
      SELECT TO_CHAR(po.created_at, 'YYYY-MM') as month, SUM(poi.quantity * poi.cost_price)::float as cost
      FROM purchase_orders po
      JOIN purchase_order_items poi ON poi.purchase_order_id = po.id
      WHERE po.status != 'CANCELLED'
      GROUP BY month
      ORDER BY month ASC
    `
  ]);

  return {
    purchaseOrdersByStatus: purchaseOrdersByStatus.map(r => ({ status: r.status, count: r.count })),
    vendorPerformance: vendorPerformance.map(r => ({ name: r.name, spend: r.spend })),
    monthlyProcurementCost: monthlyProcurementCost.map(r => ({ month: r.month, cost: r.cost }))
  };
}

export async function getManufacturingAnalytics(): Promise<ManufacturingAnalytics> {
  const [manufacturingOrdersByStatus, productionOutput, materialConsumption] = await Promise.all([
    sql`
      SELECT status, COUNT(*)::int as count 
      FROM manufacturing_orders 
      GROUP BY status
    `,
    sql`
      SELECT TO_CHAR(mo.created_at, 'YYYY-MM') as month, SUM(mo.quantity)::int as output
      FROM manufacturing_orders mo
      WHERE mo.status = 'COMPLETED'
      GROUP BY month
      ORDER BY month ASC
    `,
    sql`
      SELECT p.name, SUM(ABS(sl.quantity))::float as consumed
      FROM stock_ledger sl
      JOIN products p ON p.id = sl.product_id
      WHERE sl.movement_type = 'MO_CONSUME'
      GROUP BY p.name
      ORDER BY consumed DESC
      LIMIT 6
    `
  ]);

  return {
    manufacturingOrdersByStatus: manufacturingOrdersByStatus.map(r => ({ status: r.status, count: r.count })),
    productionOutput: productionOutput.map(r => ({ month: r.month, output: r.output })),
    materialConsumption: materialConsumption.map(r => ({ name: r.name, consumed: r.consumed }))
  };
}

export async function getInventoryAnalytics(): Promise<InventoryAnalytics> {
  const [topInventoryProducts, lowStockProducts, stockMovementTrend] = await Promise.all([
    sql`
      SELECT p.name, COALESCE(i.on_hand_qty, 0)::int as quantity
      FROM products p
      JOIN inventory i ON i.product_id = p.id
      WHERE COALESCE(i.on_hand_qty, 0) > 0
      ORDER BY quantity DESC
      LIMIT 6
    `,
    sql`
      SELECT p.name, (COALESCE(i.on_hand_qty, 0) - COALESCE(i.reserved_qty, 0))::int as available
      FROM products p
      JOIN inventory i ON i.product_id = p.id
      WHERE (COALESCE(i.on_hand_qty, 0) - COALESCE(i.reserved_qty, 0)) <= 5
      ORDER BY available ASC
      LIMIT 6
    `,
    sql`
      SELECT TO_CHAR(created_at, 'YYYY-MM-DD') as date, COUNT(*)::int as movements
      FROM stock_ledger
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY date
      ORDER BY date ASC
    `
  ]);

  return {
    topInventoryProducts: topInventoryProducts.map(r => ({ name: r.name, quantity: r.quantity })),
    lowStockProducts: lowStockProducts.map(r => ({ name: r.name, available: r.available })),
    stockMovementTrend: stockMovementTrend.map(r => ({ date: r.date, movements: r.movements }))
  };
}

export async function getOwnerAnalytics(): Promise<OwnerAnalytics> {
  const [revenueTrend, inventoryValueTrend, orderFulfillmentRate, procurementVsSales] = await Promise.all([
    sql`
      SELECT TO_CHAR(created_at, 'YYYY-MM') as month, SUM(soi.quantity * soi.price)::float as revenue
      FROM sales_orders so
      JOIN sales_order_items soi ON soi.sales_order_id = so.id
      WHERE so.status = 'DELIVERED'
      GROUP BY month
      ORDER BY month ASC
    `,
    sql`
      WITH monthly_changes AS (
        SELECT TO_CHAR(sl.created_at, 'YYYY-MM') as month,
          SUM(sl.quantity * p.cost_price)::float as change_val
        FROM stock_ledger sl
        JOIN products p ON p.id = sl.product_id
        GROUP BY month
      )
      SELECT month, SUM(change_val) OVER (ORDER BY month ASC) as value
      FROM monthly_changes
      ORDER BY month ASC
    `,
    sql`
      SELECT 
        CASE 
          WHEN status = 'DELIVERED' THEN 'Delivered' 
          WHEN status = 'CANCELLED' THEN 'Cancelled'
          WHEN status = 'DRAFT' THEN 'Draft'
          ELSE 'Pending' 
        END as name,
        COUNT(*)::int as value
      FROM sales_orders
      GROUP BY name
    `,
    sql`
      WITH sales AS (
        SELECT TO_CHAR(so.created_at, 'YYYY-MM') as month,
          SUM(soi.quantity * soi.price)::float as sales_val
        FROM sales_orders so
        JOIN sales_order_items soi ON soi.sales_order_id = so.id
        WHERE so.status != 'CANCELLED'
        GROUP BY month
      ),
      purchases AS (
        SELECT TO_CHAR(po.created_at, 'YYYY-MM') as month,
          SUM(poi.quantity * poi.cost_price)::float as purchase_val
        FROM purchase_orders po
        JOIN purchase_order_items poi ON poi.purchase_order_id = po.id
        WHERE po.status != 'CANCELLED'
        GROUP BY month
      )
      SELECT COALESCE(s.month, p.month) as month,
        COALESCE(s.sales_val, 0) as sales,
        COALESCE(p.purchase_val, 0) as purchases
      FROM sales s
      FULL OUTER JOIN purchases p ON s.month = p.month
      ORDER BY month ASC
    `
  ]);

  return {
    revenueTrend: revenueTrend.map(r => ({ month: r.month, revenue: r.revenue })),
    inventoryValueTrend: inventoryValueTrend.map(r => ({ month: r.month, value: r.value })),
    orderFulfillmentRate: orderFulfillmentRate.map(r => ({ name: r.name, value: r.value })),
    procurementVsSales: procurementVsSales.map(r => ({ month: r.month, sales: r.sales, purchases: r.purchases }))
  };
}
