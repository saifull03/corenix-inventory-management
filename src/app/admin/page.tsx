import React from 'react';
import Link from 'next/link';
import { query } from '@/lib/db';
import { getCurrentUser, isSuperAdmin } from '@/lib/auth';
import {
  DollarSign,
  ShoppingCart,
  Truck,
  TrendingUp,
  Warehouse,
  AlertTriangle,
  Wrench,
  Users,
  Building2,
  ArrowUpRight,
  Package,
  Layers,
  Flame,
  Star,
  Shield,
  Activity,
  Clock,
  ArrowRight,
  Receipt,
  LayoutTemplate,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const currentUser = await getCurrentUser();
  const isSuper = isSuperAdmin(currentUser);
  const managerBranchId = !isSuper && currentUser?.branch_id ? currentUser.branch_id : null;

  // 1. Fetch total sales & revenue (filtered by branch if store manager)
  const salesSql = managerBranchId
    ? `SELECT
         COUNT(*) as total_orders,
         COALESCE(SUM(total_amount), 0) as total_revenue,
         COALESCE(SUM(gross_profit), 0) as total_profit
       FROM orders WHERE branch_id = ?`
    : `SELECT
         COUNT(*) as total_orders,
         COALESCE(SUM(total_amount), 0) as total_revenue,
         COALESCE(SUM(gross_profit), 0) as total_profit
       FROM orders`;
  const salesParams = managerBranchId ? [managerBranchId] : [];
  const salesStats = await query<any[]>(salesSql, salesParams);

  // 1b. Fetch Today's sales & orders for active branch
  const todaySalesSql = managerBranchId
    ? `SELECT
         COUNT(*) as today_orders,
         COALESCE(SUM(total_amount), 0) as today_revenue,
         COALESCE(SUM(gross_profit), 0) as today_profit
       FROM orders WHERE DATE(created_at) = CURDATE() AND branch_id = ?`
    : `SELECT
         COUNT(*) as today_orders,
         COALESCE(SUM(total_amount), 0) as today_revenue,
         COALESCE(SUM(gross_profit), 0) as today_profit
       FROM orders WHERE DATE(created_at) = CURDATE()`;
  const todayStats = await query<any[]>(todaySalesSql, salesParams);

  // 2. Fetch inventory valuation
  const inventorySql = managerBranchId
    ? `SELECT
         COUNT(DISTINCT inv.product_id) as total_products,
         COALESCE(SUM(inv.quantity * p.purchase_cost), 0) as total_inventory_value,
         COALESCE(SUM(CASE WHEN inv.quantity <= inv.min_stock_level THEN 1 ELSE 0 END), 0) as low_stock_count
       FROM inventory inv
       JOIN products p ON inv.product_id = p.id
       WHERE inv.branch_id = ?`
    : `SELECT
         COUNT(DISTINCT product_id) as total_products,
         COALESCE(SUM(inv.quantity * p.purchase_cost), 0) as total_inventory_value,
         COALESCE(SUM(CASE WHEN inv.quantity <= inv.min_stock_level THEN 1 ELSE 0 END), 0) as low_stock_count
       FROM inventory inv
       JOIN products p ON inv.product_id = p.id`;
  const inventoryStats = await query<any[]>(inventorySql, salesParams);

  // 3. Fetch RMA cases stats & total RMA cost
  const rmaStats = await query<any[]>(
    `SELECT
       COUNT(*) as total_cases,
       COALESCE(SUM(CASE WHEN status != 'closed' AND status != 'delivered' THEN 1 ELSE 0 END), 0) as pending_rma,
       COALESCE(SUM(total_rma_cost), 0) as total_rma_cost
     FROM rma_cases`
  );

  // 4. Fetch branch-wise breakdown
  const branchBreakdown = await query<any[]>(
    `SELECT
       b.name, b.code, b.type,
       COALESCE(SUM(inv.quantity), 0) as stock_units,
       COALESCE((SELECT SUM(o.total_amount) FROM orders o WHERE o.branch_id = b.id), 0) as total_sales
     FROM branches b
     LEFT JOIN inventory inv ON b.id = inv.branch_id
     GROUP BY b.id, b.name, b.code, b.type`
  );

  // 5. Recent orders
  const recentOrdersSql = managerBranchId
    ? `SELECT o.id, o.order_number, o.total_amount, o.order_status, o.payment_status,
              o.payment_method, o.created_at, b.name as branch_name, c.name as customer_name
       FROM orders o
       JOIN branches b ON o.branch_id = b.id
       LEFT JOIN customers c ON o.customer_id = c.id
       WHERE o.branch_id = ?
       ORDER BY o.created_at DESC
       LIMIT 5`
    : `SELECT o.id, o.order_number, o.total_amount, o.order_status, o.payment_status,
              o.payment_method, o.created_at, b.name as branch_name, c.name as customer_name
       FROM orders o
       JOIN branches b ON o.branch_id = b.id
       LEFT JOIN customers c ON o.customer_id = c.id
       ORDER BY o.created_at DESC
       LIMIT 5`;
  const recentOrders = await query<any[]>(recentOrdersSql, salesParams);

  // 6. Promotional stats (Trending & Hot Deals)
  const promoStats = await query<any[]>(
    `SELECT
       COALESCE(SUM(CASE WHEN is_featured = 1 THEN 1 ELSE 0 END), 0) as trending_count,
       COALESCE(SUM(CASE WHEN is_hot = 1 THEN 1 ELSE 0 END), 0) as hot_deals_count
     FROM products WHERE status = 'published'`
  );

  // 7. Recent Admin & Staff Audit Logs (Only for Super Admin)
  const recentAuditLogs = isSuper
    ? await query<any[]>(
        `SELECT id, user_id, user_name, role_name, module, action, record_id, new_data_json, created_at
         FROM audit_logs
         ORDER BY id DESC
         LIMIT 6`
      )
    : [];

  const stats = {
    revenue: Number(salesStats[0]?.total_revenue || 0),
    profit: Number(salesStats[0]?.total_profit || 0),
    orders: Number(salesStats[0]?.total_orders || 0),
    todaySales: Number(todayStats[0]?.today_revenue || 0),
    todayOrders: Number(todayStats[0]?.today_orders || 0),
    todayProfit: Number(todayStats[0]?.today_profit || 0),
    inventoryValue: Number(inventoryStats[0]?.total_inventory_value || 0),
    lowStock: Number(inventoryStats[0]?.low_stock_count || 0),
    pendingRma: Number(rmaStats[0]?.pending_rma || 0),
    rmaCost: Number(rmaStats[0]?.total_rma_cost || 0),
    trendingCount: Number(promoStats[0]?.trending_count || 0),
    hotDealsCount: Number(promoStats[0]?.hot_deals_count || 0),
    branchName: managerBranchId === 2 ? 'Shop 1 (Uttara Flagship)' : managerBranchId === 3 ? 'Shop 2 (Dhanmondi Branch)' : 'All Enterprise Locations',
  };


  const getActionBadgeColor = (action: string) => {
    const a = (action || '').toLowerCase();
    if (a.includes('delete') || a.includes('archive') || a.includes('remove')) {
      return 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800';
    }
    if (a.includes('create') || a.includes('add') || a.includes('insert')) {
      return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800';
    }
    if (a.includes('toggle') || a.includes('status')) {
      return 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800';
    }
    return 'bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-950/80 dark:text-sky-300 dark:border-sky-800';
  };

  return (
    <div className="space-y-8">
      {/* Title & Live Status */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-brand-400 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5" />
            <span>{stats.branchName} • Command Center</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Executive Analytics Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products/create"
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 dark:bg-brand-500 dark:hover:bg-brand-400 text-white dark:text-navy-950 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Package className="w-4 h-4" />
            <span>Add Product</span>
          </Link>
          <Link
            href="/admin/pos"
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs border border-emerald-500 flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all"
          >
            <Receipt className="w-4 h-4" />
            <span>Launch POS Terminal</span>
          </Link>
          <Link
            href="/admin/landing-products"
            className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 hover:border-sky-500 hover:text-sky-700 dark:hover:text-brand-300 transition-colors"
          >
            <LayoutTemplate className="w-4 h-4" />
            <span>Landing Products</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid (Requirement 39 & Store Manager Sales Workflow) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales & Today's Sales */}
        <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Sales</span>
            <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">৳{stats.revenue.toLocaleString()}</div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
            <TrendingUp className="w-3.5 h-3.5" /> Today: <strong>৳{stats.todaySales.toLocaleString()}</strong> ({stats.todayOrders} Orders)
          </div>
        </div>

        {/* Gross Profit & Today's Profit */}
        <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Gross Profit (COGS)</span>
            <TrendingUp className="w-4 h-4 text-sky-600 dark:text-brand-400" />
          </div>
          <div className="text-2xl font-black text-sky-600 dark:text-brand-400">৳{stats.profit.toLocaleString()}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Today&apos;s Profit: <strong className="text-slate-800 dark:text-slate-200">৳{stats.todayProfit.toLocaleString()}</strong>
          </div>
        </div>


        {/* Total Inventory Value */}
        <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Inventory Asset Value</span>
            <Warehouse className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400">৳{stats.inventoryValue.toLocaleString()}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Across 4 Locations (WH, Shop 1, 2, RMA)
          </div>
        </div>

        {/* Pending RMA & Low Stock */}
        <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Service & Alerts</span>
            <AlertTriangle className="w-4 h-4 text-amber-500 dark:text-amber-400" />
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{stats.pendingRma} Active RMA</span>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-bold">{stats.lowStock} Low Stock</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Total RMA Cost: ৳{stats.rmaCost.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Storefront Promotion Showcase Control Widget (Trending & Hot Deals) */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-navy-950 to-slate-900 border border-slate-800 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
              Homepage Promotion Control
            </span>
          </div>
          <h2 className="text-lg font-black text-white">
            Manage Trending Products &amp; Hot Deals
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Control which hardware items feature at the top of your public storefront with 1-click toggles and promotional badges directly from the Products Catalogue.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-2.5">
            <div className="flex items-center gap-2 px-2">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <div>
                <div className="text-sm font-black text-white">{stats.trendingCount} Active</div>
                <div className="text-[10px] text-slate-400">Trending Items</div>
              </div>
            </div>

            <div className="h-8 w-px bg-white/10" />

            <div className="flex items-center gap-2 px-2">
              <Flame className="w-4 h-4 text-rose-400 fill-rose-400" />
              <div>
                <div className="text-sm font-black text-white">{stats.hotDealsCount} Active</div>
                <div className="text-[10px] text-slate-400">Hot Deals</div>
              </div>
            </div>
          </div>

          <Link
            href="/admin/products"
            className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-navy-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-brand-500/20 transition-all hover:scale-102"
          >
            <span>Control Highlights</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Super Admin Audit Trail & Staff Change Activity Stream (Strictly Super Admin Only) */}
      {isSuper && (
        <div className="p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 space-y-4 shadow-xs">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-sky-600 dark:text-brand-400" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Live Admin &amp; Staff Change Activity Trail
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Live ledger of <strong>Who</strong> changed <strong>What</strong>, in which module, and when.
              </p>
            </div>

            <Link
              href="/admin/activity-log"
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-brand-300 font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <span>Full Audit Log &amp; Diff Inspector</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentAuditLogs.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500 dark:text-slate-400">
              No system activity logs recorded yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {recentAuditLogs.map((log) => {
                let parsedSummary = '';
                try {
                  const parsed = typeof log.new_data_json === 'string' ? JSON.parse(log.new_data_json) : log.new_data_json;
                  if (parsed && typeof parsed === 'object') {
                    const keys = Object.keys(parsed);
                    parsedSummary = keys.slice(0, 2).map((k) => `${k}: ${String(parsed[k])}`).join(', ');
                  } else if (log.new_data_json) {
                    parsedSummary = String(log.new_data_json);
                  }
                } catch {
                  parsedSummary = String(log.new_data_json || '');
                }

                return (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 space-y-2 hover:border-sky-300 dark:hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-6 h-6 rounded-lg bg-sky-600 dark:bg-brand-500 text-white dark:text-navy-950 font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                          {(log.user_name || 'A').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-slate-900 dark:text-white text-xs truncate block">
                            {log.user_name || 'System Admin'}
                          </span>
                          <span className="text-[10px] text-sky-600 dark:text-brand-400 font-semibold block">
                            {log.role_name || 'Super Admin'}
                          </span>
                        </div>
                      </div>

                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border flex-shrink-0 ${getActionBadgeColor(log.action)}`}>
                        {log.action}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/60 dark:border-slate-800/60">
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium">
                        <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-bold uppercase text-[9px] text-slate-700 dark:text-slate-300">
                          {log.module}
                        </span>
                        {log.record_id && (
                          <span className="font-mono text-[10px] text-slate-400">
                            #{log.record_id}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>

                    {parsedSummary && (
                      <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate bg-white dark:bg-slate-900 p-1.5 rounded border border-slate-200/50 dark:border-slate-800/50">
                        {parsedSummary}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Two Column: Multi-Branch Comparison & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Multi-Branch Performance (Requirements 26, 37) */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-sky-600 dark:text-brand-400" />
              <span>Multi-Location Performance</span>
            </h2>
            <Link href="/admin/branches" className="text-xs text-sky-600 dark:text-brand-400 hover:underline font-semibold">
              Manage Locations
            </Link>
          </div>

          <div className="space-y-3">
            {branchBreakdown.map((b) => (
              <div
                key={b.code}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{b.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400 font-mono font-medium">
                      {b.code}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                    Stock Holding: <strong className="text-slate-800 dark:text-slate-200">{b.stock_units} Units</strong>
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 block">
                    ৳{Number(b.total_sales).toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-semibold">Sales Volume</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Operations Links */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 space-y-4 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-sky-600 dark:text-brand-400" />
            <span>Fast Management Shortcuts</span>
          </h2>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <Link
              href="/admin/products/create"
              className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 block space-y-1 transition-colors group"
            >
              <span className="font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-brand-400 block transition-colors">
                18-Step Product Creator
              </span>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">Add GPU, CPU, specs & multi-branch stock.</p>
            </Link>

            <Link
              href="/admin/inventory"
              className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 block space-y-1 transition-colors group"
            >
              <span className="font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-brand-400 block transition-colors">
                Stock Transfers
              </span>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">Warehouse to Shop 1 or Shop 2 transfers.</p>
            </Link>

            <Link
              href="/admin/purchases"
              className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 block space-y-1 transition-colors group"
            >
              <span className="font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-brand-400 block transition-colors">
                Procurement POs
              </span>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">Order from Global Brand, Smart Tech, etc.</p>
            </Link>

            {isSuper ? (
              <Link
                href="/admin/activity-log"
                className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 block space-y-1 transition-colors group"
              >
                <span className="font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-brand-400 block transition-colors">
                  Audit Trail &amp; Logs
                </span>
                <p className="text-slate-500 dark:text-slate-400 text-[11px]">Inspect all admin changes &amp; diffs.</p>
              </Link>
            ) : (
              <Link
                href="/admin/orders"
                className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 block space-y-1 transition-colors group"
              >
                <span className="font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-brand-400 block transition-colors">
                  Customer Orders
                </span>
                <p className="text-slate-500 dark:text-slate-400 text-[11px]">Track invoice statuses &amp; delivery.</p>
              </Link>
            )}
          </div>
        </div>
      </div>


      {/* Recent Orders Table */}
      <div className="p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-sky-600 dark:text-brand-400" />
            <span>Recent Orders & Transactions</span>
          </h2>
          <Link href="/admin/orders" className="text-xs text-sky-600 dark:text-brand-400 hover:underline font-semibold">
            View All Orders
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {recentOrders.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-sky-600 dark:text-brand-400">{o.order_number}</td>
                  <td className="py-3 px-4 text-slate-900 dark:text-white font-medium">{o.customer_name || 'Walk-in / Online'}</td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{o.branch_name}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase font-semibold text-[10px]">
                      {o.payment_method}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800 font-bold text-[10px] uppercase">
                      {o.order_status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-black text-slate-900 dark:text-white">
                    ৳{Number(o.total_amount).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
