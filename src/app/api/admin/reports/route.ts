import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const branchId = searchParams.get('branchId') || 'all';
    const dateRange = searchParams.get('dateRange') || 'all';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const channel = searchParams.get('channel') || 'all';
    const search = (searchParams.get('search') || '').trim();

    // 1. Build date filter SQL
    let dateFilterSql = '';
    const dateParams: any[] = [];

    if (dateRange === 'today') {
      dateFilterSql = ' AND DATE(o.created_at) = CURDATE()';
    } else if (dateRange === 'yesterday') {
      dateFilterSql = ' AND DATE(o.created_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)';
    } else if (dateRange === 'last_7_days') {
      dateFilterSql = ' AND o.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
    } else if (dateRange === 'this_month') {
      dateFilterSql = ' AND YEAR(o.created_at) = YEAR(CURDATE()) AND MONTH(o.created_at) = MONTH(CURDATE())';
    } else if (dateRange === 'last_month') {
      dateFilterSql = ' AND o.created_at >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)';
    } else if (dateRange === 'custom' && startDate && endDate) {
      dateFilterSql = ' AND DATE(o.created_at) >= ? AND DATE(o.created_at) <= ?';
      dateParams.push(startDate, endDate);
    }

    // 2. Build Branch filter SQL
    let branchFilterSql = '';
    const branchParams: any[] = [];
    if (branchId !== 'all' && !isNaN(Number(branchId))) {
      branchFilterSql = ' AND o.branch_id = ?';
      branchParams.push(Number(branchId));
    }

    // 3. Build Channel filter SQL
    let channelFilterSql = '';
    const channelParams: any[] = [];
    if (channel === 'pos') {
      channelFilterSql = " AND o.order_type = 'pos'";
    } else if (channel === 'online') {
      channelFilterSql = " AND o.order_type = 'online'";
    }

    // 4. Build Search filter SQL
    let searchFilterSql = '';
    const searchParamsList: any[] = [];
    if (search) {
      const wildcard = `%${search}%`;
      searchFilterSql = ` AND (
        o.order_number LIKE ? OR
        oi.product_name LIKE ? OR
        oi.sku LIKE ? OR
        oi.serial_number LIKE ? OR
        u.name LIKE ? OR
        c.name LIKE ? OR
        c.phone LIKE ? OR
        b.name LIKE ?
      )`;
      searchParamsList.push(wildcard, wildcard, wildcard, wildcard, wildcard, wildcard, wildcard, wildcard);
    }

    // Combine parameters for items query
    const whereClause = `WHERE 1=1 ${dateFilterSql} ${branchFilterSql} ${channelFilterSql} ${searchFilterSql}`;
    const allParams = [...dateParams, ...branchParams, ...channelParams, ...searchParamsList];

    // Detailed Line Items Query (Who, Where, When, What, Buying Price, Selling Price, Profits)
    const itemsQuery = `
      SELECT 
        oi.id as item_id,
        oi.order_id,
        o.order_number,
        o.order_type,
        o.order_status,
        o.payment_status,
        o.payment_method,
        o.created_at as sale_date,
        b.id as branch_id,
        b.name as branch_name,
        b.code as branch_code,
        u.id as seller_id,
        COALESCE(u.name, CASE WHEN o.order_type = 'online' THEN 'Online Web Store' ELSE 'Showroom Staff' END) as seller_name,
        COALESCE(u.email, '') as seller_email,
        COALESCE(c.name, 'Walk-in Customer') as customer_name,
        COALESCE(c.phone, 'N/A') as customer_phone,
        c.email as customer_email,
        oi.product_id,
        oi.product_name,
        oi.sku,
        oi.serial_number,
        oi.barcode,
        oi.warranty_details,
        oi.quantity,
        CAST(oi.unit_cost AS DECIMAL(12,2)) as buying_price,
        CAST(oi.unit_price AS DECIMAL(12,2)) as selling_price,
        CAST(oi.total_cost AS DECIMAL(12,2)) as total_buying_price,
        CAST(oi.total_price AS DECIMAL(12,2)) as total_selling_price,
        CAST((oi.total_price - oi.total_cost) AS DECIMAL(12,2)) as gross_profit,
        CASE 
          WHEN oi.total_price > 0 THEN ROUND(((oi.total_price - oi.total_cost) / oi.total_price) * 100, 1)
          ELSE 0.0
        END as profit_margin_pct
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      LEFT JOIN branches b ON o.branch_id = b.id
      LEFT JOIN users u ON o.created_by = u.id
      LEFT JOIN customers c ON o.customer_id = c.id
      ${whereClause}
      ORDER BY o.created_at DESC, oi.id DESC
    `;

    const items = await query<any[]>(itemsQuery, allParams);

    // Summary Totals Calculation based on filtered scope
    let totalRevenue = 0;
    let totalCogs = 0;
    let totalGrossProfit = 0;
    let totalUnitsSold = 0;
    const uniqueOrders = new Set<number>();
    let posRevenue = 0;
    let onlineRevenue = 0;

    for (const it of items) {
      const rev = Number(it.total_selling_price || 0);
      const cost = Number(it.total_buying_price || 0);
      const profit = Number(it.gross_profit || 0);
      const qty = Number(it.quantity || 1);

      totalRevenue += rev;
      totalCogs += cost;
      totalGrossProfit += profit;
      totalUnitsSold += qty;
      uniqueOrders.add(it.order_id);

      if (it.order_type === 'pos') {
        posRevenue += rev;
      } else {
        onlineRevenue += rev;
      }
    }

    const grossMarginPct = totalRevenue > 0 ? Number(((totalGrossProfit / totalRevenue) * 100).toFixed(1)) : 0;

    // Expenses & RMA Costs
    let expensesSql = `SELECT COALESCE(SUM(amount), 0) as total_expenses FROM expenses WHERE 1=1`;
    const expParams: any[] = [];
    if (branchId !== 'all' && !isNaN(Number(branchId))) {
      expensesSql += ` AND branch_id = ?`;
      expParams.push(Number(branchId));
    }
    const expensesRes = await query<any[]>(expensesSql, expParams);
    const operatingExpenses = Number(expensesRes[0]?.total_expenses || 0);

    const rmaRes = await query<any[]>(`SELECT COALESCE(SUM(total_rma_cost), 0) as total_rma FROM rma_cases`);
    const rmaCosts = Number(rmaRes[0]?.total_rma || 0);

    const netProfit = totalGrossProfit - operatingExpenses - rmaCosts;
    const netMarginPct = totalRevenue > 0 ? Number(((netProfit / totalRevenue) * 100).toFixed(1)) : 0;

    // Showroom Branches Comparison
    const branchesSql = `
      SELECT 
        b.id,
        b.name,
        b.code,
        b.type,
        COUNT(DISTINCT o.id) as order_count,
        COALESCE(SUM(oi.quantity), 0) as units_sold,
        COALESCE(SUM(oi.total_price), 0) as revenue,
        COALESCE(SUM(oi.total_cost), 0) as cogs,
        COALESCE(SUM(oi.total_price - oi.total_cost), 0) as gross_profit
      FROM branches b
      LEFT JOIN orders o ON o.branch_id = b.id ${dateFilterSql}
      LEFT JOIN order_items oi ON oi.order_id = o.id
      WHERE b.type = 'shop'
      GROUP BY b.id, b.name, b.code, b.type
      ORDER BY revenue DESC
    `;
    const branchReport = await query<any[]>(branchesSql, dateParams);

    // Staff Performance Leaderboard (Who is Selling)
    const staffSql = `
      SELECT 
        COALESCE(u.id, 0) as staff_id,
        COALESCE(u.name, CASE WHEN o.order_type = 'online' THEN 'Online Web Store' ELSE 'Showroom Staff' END) as staff_name,
        COALESCE(u.email, 'web@corenix.com') as staff_email,
        COALESCE(b.name, 'All Branches') as branch_name,
        COUNT(DISTINCT o.id) as total_orders,
        COALESCE(SUM(oi.quantity), 0) as total_units_sold,
        COALESCE(SUM(oi.total_price), 0) as total_revenue,
        COALESCE(SUM(oi.total_cost), 0) as total_cogs,
        COALESCE(SUM(oi.total_price - oi.total_cost), 0) as gross_profit,
        CASE 
          WHEN SUM(oi.total_price) > 0 THEN ROUND((SUM(oi.total_price - oi.total_cost) / SUM(oi.total_price)) * 100, 1)
          ELSE 0.0
        END as margin_pct
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      LEFT JOIN branches b ON o.branch_id = b.id
      LEFT JOIN users u ON o.created_by = u.id
      WHERE 1=1 ${dateFilterSql} ${branchFilterSql} ${channelFilterSql}
      GROUP BY u.id, u.name, u.email, b.name, o.order_type
      ORDER BY total_revenue DESC
    `;
    const staffReport = await query<any[]>(staffSql, [...dateParams, ...branchParams, ...channelParams]);

    // Top Profit-Generating Products (What is Selling)
    const topProductsSql = `
      SELECT 
        oi.product_id,
        oi.product_name,
        oi.sku,
        SUM(oi.quantity) as units_sold,
        AVG(oi.unit_cost) as avg_buying_price,
        AVG(oi.unit_price) as avg_selling_price,
        SUM(oi.total_price) as total_revenue,
        SUM(oi.total_cost) as total_cogs,
        SUM(oi.total_price - oi.total_cost) as gross_profit,
        CASE 
          WHEN SUM(oi.total_price) > 0 THEN ROUND((SUM(oi.total_price - oi.total_cost) / SUM(oi.total_price)) * 100, 1)
          ELSE 0.0
        END as margin_pct
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE 1=1 ${dateFilterSql} ${branchFilterSql} ${channelFilterSql}
      GROUP BY oi.product_id, oi.product_name, oi.sku
      ORDER BY gross_profit DESC
      LIMIT 10
    `;
    const topProducts = await query<any[]>(topProductsSql, [...dateParams, ...branchParams, ...channelParams]);

    // Other House / Lend Sales
    const otherHouseSql = `
      SELECT 
        ohs.id,
        ohs.invoice_no,
        ohs.house_name,
        ohs.house_phone,
        ohs.product_name,
        ohs.serial_number,
        ohs.quantity,
        ohs.cost_price as buying_price,
        ohs.unit_price as selling_price,
        (ohs.cost_price * ohs.quantity) as total_buying_price,
        ohs.total_amount as total_selling_price,
        (ohs.total_amount - (ohs.cost_price * ohs.quantity)) as gross_profit,
        CASE 
          WHEN ohs.total_amount > 0 THEN ROUND(((ohs.total_amount - (ohs.cost_price * ohs.quantity)) / ohs.total_amount) * 100, 1)
          ELSE 0.0
        END as margin_pct,
        ohs.payment_status,
        ohs.paid_amount,
        ohs.due_amount,
        ohs.created_at,
        b.name as branch_name,
        b.code as branch_code
      FROM other_house_sales ohs
      LEFT JOIN branches b ON ohs.branch_id = b.id
      ORDER BY ohs.created_at DESC
    `;
    const otherHouseSales = await query<any[]>(otherHouseSql);

    // Fetch all active branches for filter dropdown
    const allBranches = await query<any[]>(`SELECT id, name, code, type FROM branches WHERE is_active = 1 ORDER BY id ASC`);

    return NextResponse.json({
      success: true,
      summary: {
        totalRevenue,
        totalCogs,
        grossProfit: totalGrossProfit,
        grossMarginPct,
        operatingExpenses,
        rmaCosts,
        netProfit,
        netMarginPct,
        totalOrders: uniqueOrders.size,
        totalUnitsSold,
        posRevenue,
        onlineRevenue,
      },
      branchReport,
      staffReport,
      topProducts,
      items,
      otherHouseSales,
      branches: allBranches,
    });
  } catch (error: any) {
    console.error('Fetch reports error:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Failed to generate reports' }, { status: 500 });
  }
}
