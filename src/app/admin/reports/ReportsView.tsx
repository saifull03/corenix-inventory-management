'use client';

import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  Download,
  Printer,
  Calendar,
  Building2,
  User,
  ShoppingBag,
  Search,
  RefreshCw,
  Filter,
  CheckCircle2,
  ArrowUpRight,
  Package,
  Layers,
  Sparkles,
  CreditCard,
  Phone,
  FileSpreadsheet,
  Store,
  ChevronDown,
  X,
  SlidersHorizontal,
  BadgePercent,
  Receipt,
  Clock
} from 'lucide-react';

interface ReportItem {
  item_id: number;
  order_id: number;
  order_number: string;
  order_type: 'pos' | 'online';
  order_status: string;
  payment_status: string;
  payment_method: string;
  sale_date: string;
  branch_id: number;
  branch_name: string;
  branch_code: string;
  seller_id: number | null;
  seller_name: string;
  seller_email: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  product_id: number;
  product_name: string;
  sku: string;
  serial_number: string | null;
  barcode: string | null;
  warranty_details: string | null;
  quantity: number;
  buying_price: string | number;
  selling_price: string | number;
  total_buying_price: string | number;
  total_selling_price: string | number;
  gross_profit: string | number;
  profit_margin_pct: string | number;
}

interface BranchReportItem {
  id: number;
  name: string;
  code: string;
  type: string;
  order_count: number;
  units_sold: number;
  revenue: number;
  cogs: number;
  gross_profit: number;
}

interface StaffReportItem {
  staff_id: number;
  staff_name: string;
  staff_email: string;
  branch_name: string;
  total_orders: number;
  total_units_sold: number;
  total_revenue: number;
  total_cogs: number;
  total_profit: number;
  margin_pct: number;
}

interface TopProductItem {
  product_id: number;
  product_name: string;
  sku: string;
  units_sold: number;
  avg_buying_price: number;
  avg_selling_price: number;
  total_revenue: number;
  total_cogs: number;
  total_profit: number;
  margin_pct: number;
}

interface OtherHouseItem {
  id: number;
  invoice_no: string;
  house_name: string;
  house_phone: string;
  product_name: string;
  serial_number: string;
  quantity: number;
  buying_price: number;
  selling_price: number;
  total_buying_price: number;
  total_selling_price: number;
  gross_profit: number;
  margin_pct: number;
  payment_status: string;
  paid_amount: number;
  due_amount: number;
  created_at: string;
  branch_name: string;
  branch_code: string;
}

interface SummaryData {
  totalRevenue: number;
  totalCogs: number;
  grossProfit: number;
  grossMarginPct: number;
  operatingExpenses: number;
  rmaCosts: number;
  netProfit: number;
  netMarginPct: number;
  totalOrders: number;
  totalUnitsSold: number;
  posRevenue: number;
  onlineRevenue: number;
}

interface BranchOption {
  id: number;
  name: string;
  code: string;
  type: string;
}

export default function ReportsView() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters State
  const [branchFilter, setBranchFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [channelFilter, setChannelFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Active Tab
  const [activeTab, setActiveTab] = useState<'items' | 'branches' | 'staff' | 'products' | 'other_house'>('items');

  // Selected Item Modal
  const [selectedItem, setSelectedItem] = useState<ReportItem | null>(null);

  // Data from API
  const [summary, setSummary] = useState<SummaryData>({
    totalRevenue: 0,
    totalCogs: 0,
    grossProfit: 0,
    grossMarginPct: 0,
    operatingExpenses: 0,
    rmaCosts: 0,
    netProfit: 0,
    netMarginPct: 0,
    totalOrders: 0,
    totalUnitsSold: 0,
    posRevenue: 0,
    onlineRevenue: 0,
  });
  const [items, setItems] = useState<ReportItem[]>([]);
  const [branchReport, setBranchReport] = useState<BranchReportItem[]>([]);
  const [staffReport, setStaffReport] = useState<StaffReportItem[]>([]);
  const [topProducts, setTopProducts] = useState<TopProductItem[]>([]);
  const [otherHouseSales, setOtherHouseSales] = useState<OtherHouseItem[]>([]);
  const [branches, setBranches] = useState<BranchOption[]>([]);

  // Fetch report data
  const fetchReportData = async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) setRefreshing(true);
      else setLoading(true);

      const params = new URLSearchParams();
      if (branchFilter !== 'all') params.append('branchId', branchFilter);
      if (dateRange !== 'all') params.append('dateRange', dateRange);
      if (dateRange === 'custom' && startDate && endDate) {
        params.append('startDate', startDate);
        params.append('endDate', endDate);
      }
      if (channelFilter !== 'all') params.append('channel', channelFilter);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const res = await fetch(`/api/admin/reports?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setSummary(data.summary);
        setItems(data.items || []);
        setBranchReport(data.branchReport || []);
        setStaffReport(data.staffReport || []);
        setTopProducts(data.topProducts || []);
        setOtherHouseSales(data.otherHouseSales || []);
        if (data.branches) setBranches(data.branches);
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [branchFilter, dateRange, startDate, endDate, channelFilter]);

  // Handle Search submit / debounce
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReportData();
  };

  // Format dates
  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  // Export CSV functionality
  const handleExportCSV = () => {
    if (items.length === 0) {
      alert('No sales items to export for the selected filter criteria.');
      return;
    }

    const headers = [
      'Invoice / Order No',
      'Date & Time',
      'Channel',
      'Branch / Location',
      'Branch Code',
      'Sales Representative (Who Sold)',
      'Customer Name (Who Bought)',
      'Customer Phone',
      'Product Name (What Was Sold)',
      'SKU',
      'Serial Number',
      'Quantity',
      'Unit Buying Price / Cost (BDT)',
      'Unit Selling Price (BDT)',
      'Total Buying Cost / COGS (BDT)',
      'Total Revenue / Inflow (BDT)',
      'Gross Profit (BDT)',
      'Profit Margin (%)',
      'Payment Status',
      'Payment Method',
    ];

    const rows = items.map((it) => [
      `"${it.order_number || ''}"`,
      `"${formatDate(it.sale_date)}"`,
      `"${it.order_type === 'pos' ? 'POS Showroom' : 'Online Store'}"`,
      `"${it.branch_name || ''}"`,
      `"${it.branch_code || ''}"`,
      `"${it.seller_name || ''}"`,
      `"${it.customer_name || 'Walk-in Customer'}"`,
      `"${it.customer_phone || ''}"`,
      `"${(it.product_name || '').replace(/"/g, '""')}"`,
      `"${it.sku || ''}"`,
      `"${it.serial_number || 'N/A'}"`,
      it.quantity,
      Number(it.buying_price || 0).toFixed(2),
      Number(it.selling_price || 0).toFixed(2),
      Number(it.total_buying_price || 0).toFixed(2),
      Number(it.total_selling_price || 0).toFixed(2),
      Number(it.gross_profit || 0).toFixed(2),
      `${it.profit_margin_pct}%`,
      `"${it.payment_status || 'paid'}"`,
      `"${it.payment_method || 'cash_pos'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CORENIX_Detailed_Profit_Analysis_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print Report Handler
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 print:space-y-4 print:text-black">
      {/* Header Bar */}
      <div className="flex items-center justify-between flex-wrap gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-sky-600 dark:text-brand-400 bg-sky-50 dark:bg-brand-500/10 px-2.5 py-0.5 rounded-full border border-sky-200 dark:border-brand-500/20">
              Financial Intelligence & Sales Audit
            </span>
            {refreshing && (
              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-600 dark:text-brand-400" />
                Updating...
              </span>
            )}
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            Business Reports & Net Profit Analysis
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Complete transaction ledger showing <strong className="text-slate-900 dark:text-slate-200">who sold</strong>, <strong className="text-slate-900 dark:text-slate-200">where</strong>, <strong className="text-slate-900 dark:text-slate-200">when</strong>, <strong className="text-slate-900 dark:text-slate-200">what product</strong>, alongside real-time <strong className="text-emerald-600 dark:text-emerald-400">buying vs selling prices</strong> and net profit margins.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fetchReportData(true)}
            disabled={refreshing}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 transition-colors shadow-sm"
            title="Refresh Live Data"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-sky-600 dark:text-brand-400' : ''}`} />
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 hover:border-sky-500/50 transition-all shadow-sm group"
          >
            <Download className="w-4 h-4 text-sky-600 dark:text-brand-400 group-hover:scale-110 transition-transform" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-xs font-bold text-white flex items-center gap-1.5 shadow-lg shadow-sky-600/20 transition-all hover:scale-[1.02]"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Print-Only Executive Header */}
      <div className="hidden print:block border-b border-gray-300 pb-4 mb-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">CORENIX ENTERPRISE ERP</h1>
            <p className="text-sm font-semibold text-gray-600">Business Net Profit & Itemized Sales Audit Report</p>
          </div>
          <div className="text-right text-xs text-gray-500">
            <p>Generated: {new Date().toLocaleString('en-GB')}</p>
            <p>Scope: {branchFilter === 'all' ? 'All Locations (Head Office)' : `Branch #${branchFilter}`}</p>
          </div>
        </div>
      </div>

      {/* Financial KPI Waterfall Engine Cards */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-navy-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 shadow-md dark:shadow-2xl space-y-5 print:border-gray-300 print:bg-white print:p-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 print:text-gray-900">
            <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Net Profit Accounting Engine (Revenue − COGS − Operating & RMA)</span>
          </h2>

          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 print:text-gray-600">
            <span className="flex items-center gap-1">
              <Receipt className="w-3.5 h-3.5 text-sky-600 dark:text-brand-400" />
              <strong className="text-slate-800 dark:text-slate-200 print:text-gray-900">{summary.totalOrders}</strong> Total Invoices
            </span>
            <span className="w-1 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
            <span className="flex items-center gap-1">
              <Package className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <strong className="text-slate-800 dark:text-slate-200 print:text-gray-900">{summary.totalUnitsSold}</strong> Items Sold
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 text-xs">
          {/* 1. Total Revenue */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors print:bg-gray-50 print:border-gray-200">
            <span className="text-slate-500 dark:text-slate-400 font-semibold block flex items-center justify-between print:text-gray-600">
              Total Revenue
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-500/20">
                Gross Inflow
              </span>
            </span>
            <span className="text-2xl font-black text-slate-900 dark:text-white mt-1.5 block tracking-tight print:text-gray-900 font-mono">
              ৳{Number(summary.totalRevenue || 0).toLocaleString()}
            </span>
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-2 pt-2 border-t border-slate-200 dark:border-slate-800/80 print:border-gray-200 font-mono">
              <span>POS: ৳{Number(summary.posRevenue || 0).toLocaleString()}</span>
              <span>Web: ৳{Number(summary.onlineRevenue || 0).toLocaleString()}</span>
            </div>
          </div>

          {/* 2. COGS Direct Costs */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors print:bg-gray-50 print:border-gray-200">
            <span className="text-slate-500 dark:text-slate-400 font-semibold block flex items-center justify-between print:text-gray-600">
              COGS (Buying Price)
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 font-bold border border-rose-200 dark:border-rose-500/20">
                Direct Cost
              </span>
            </span>
            <span className="text-2xl font-black text-slate-700 dark:text-slate-300 mt-1.5 block tracking-tight print:text-gray-800 font-mono">
              -৳{Number(summary.totalCogs || 0).toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-500 block mt-2 pt-2 border-t border-slate-200 dark:border-slate-800/80 print:border-gray-200">
              Hardware Procurement Cost
            </span>
          </div>

          {/* 3. Gross Margin */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-cyan-200 dark:border-cyan-900/40 hover:border-cyan-400 dark:hover:border-cyan-700/60 transition-colors print:bg-gray-50 print:border-gray-200">
            <span className="text-slate-500 dark:text-slate-400 font-semibold block flex items-center justify-between print:text-gray-600">
              Gross Margin
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 font-bold border border-cyan-200 dark:border-cyan-500/20">
                Profit Inflow
              </span>
            </span>
            <span className="text-2xl font-black text-cyan-700 dark:text-cyan-400 mt-1.5 block tracking-tight print:text-cyan-700 font-mono">
              ৳{Number(summary.grossProfit || 0).toLocaleString()}
            </span>
            <span className="text-[11px] text-cyan-700 dark:text-cyan-400 font-bold block mt-2 pt-2 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between print:border-gray-200">
              <span>Gross Margin %</span>
              <span>{summary.grossMarginPct}%</span>
            </span>
          </div>

          {/* 4. Operating & RMA Costs */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors print:bg-gray-50 print:border-gray-200">
            <span className="text-slate-500 dark:text-slate-400 font-semibold block flex items-center justify-between print:text-gray-600">
              Operating & RMA
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold border border-amber-200 dark:border-amber-500/20">
                Overheads
              </span>
            </span>
            <span className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1.5 block tracking-tight print:text-rose-600 font-mono">
              -৳{(Number(summary.operatingExpenses || 0) + Number(summary.rmaCosts || 0)).toLocaleString()}
            </span>
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-500 mt-2 pt-2 border-t border-slate-200 dark:border-slate-800/80 print:border-gray-200 font-mono">
              <span>Exp: ৳{Number(summary.operatingExpenses || 0).toLocaleString()}</span>
              <span>RMA: ৳{Number(summary.rmaCosts || 0).toLocaleString()}</span>
            </div>
          </div>

          {/* 5. Final Net Profit */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 via-emerald-100/50 to-white dark:from-emerald-950/70 dark:via-slate-900 dark:to-navy-950 border border-emerald-300 dark:border-emerald-500/50 shadow-md dark:shadow-lg dark:shadow-emerald-950/40 relative overflow-hidden print:bg-emerald-50 print:border-emerald-300">
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
            <span className="text-emerald-800 dark:text-emerald-300 font-bold block flex items-center justify-between print:text-emerald-900">
              Final Net Profit
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-200/60 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-500/30">
                Bottom Line
              </span>
            </span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1.5 block tracking-tight print:text-emerald-700 font-mono">
              ৳{Number(summary.netProfit || 0).toLocaleString()}
            </span>
            <span className="text-[11px] text-emerald-800 dark:text-emerald-300 font-bold block mt-2 pt-2 border-t border-emerald-200 dark:border-emerald-900/60 flex items-center justify-between print:border-emerald-200">
              <span>Net Margin %</span>
              <span>{summary.netMarginPct}%</span>
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Controls & Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3.5 print:hidden">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-300 flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-sky-600 dark:text-brand-400" />
            Filter & Search Parameters
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Showing <strong className="text-sky-600 dark:text-brand-400">{items.length}</strong> sale items matching criteria
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {/* 1. Branch Selector */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
              <Building2 className="w-3 h-3 text-slate-400" />
              Showroom / Branch
            </label>
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 font-medium"
            >
              <option value="all">🏢 All Locations (Head Office)</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.code})
                </option>
              ))}
            </select>
          </div>

          {/* 2. Date Range Presets */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              Time Period
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 font-medium"
            >
              <option value="all">All Recorded History</option>
              <option value="today">Today (Live)</option>
              <option value="yesterday">Yesterday</option>
              <option value="last_7_days">Last 7 Days</option>
              <option value="this_month">This Month</option>
              <option value="last_month">Last 30 Days</option>
              <option value="custom">Custom Date Range...</option>
            </select>
          </div>

          {/* 3. Sales Channel */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
              <Store className="w-3 h-3 text-slate-400" />
              Sales Channel
            </label>
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 font-medium"
            >
              <option value="all">All Channels (POS & Web)</option>
              <option value="pos">Showroom POS In-Store</option>
              <option value="online">Online E-Commerce Web</option>
            </select>
          </div>

          {/* 4. Live Search Box */}
          <div className="lg:col-span-2">
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
              <Search className="w-3 h-3 text-slate-400" />
              Search Transactions
            </label>
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search product, SKU, serial number, invoice #, customer phone..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-8 pr-16 py-2 text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:outline-none focus:border-sky-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
              <button
                type="submit"
                className="absolute right-1.5 top-1 px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-[10px] font-bold text-sky-700 dark:text-brand-400 border border-slate-300 dark:border-slate-700"
              >
                Search
              </button>
            </form>
          </div>
        </div>

        {/* Custom Date Pickers if 'custom' selected */}
        {dateRange === 'custom' && (
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 flex items-center gap-3 text-xs">
            <span className="text-slate-600 dark:text-slate-400 font-medium">Select Range:</span>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1 text-slate-900 dark:text-white text-xs"
              />
              <span className="text-slate-400">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1 text-slate-900 dark:text-white text-xs"
              />
              <button
                onClick={() => fetchReportData()}
                className="px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg text-xs"
              >
                Apply Dates
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto print:hidden">
        <button
          onClick={() => setActiveTab('items')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'items'
              ? 'bg-sky-50 dark:bg-brand-500/20 text-sky-700 dark:text-brand-400 border border-sky-200 dark:border-brand-500/40 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Itemized Sales & Profit Audit Ledger</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full bg-sky-100 dark:bg-brand-500/30 text-[10px] text-sky-800 dark:text-brand-300 font-mono">
            {items.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('branches')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'branches'
              ? 'bg-sky-50 dark:bg-brand-500/20 text-sky-700 dark:text-brand-400 border border-sky-200 dark:border-brand-500/40 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Showroom Branches Report</span>
        </button>

        <button
          onClick={() => setActiveTab('staff')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'staff'
              ? 'bg-sky-50 dark:bg-brand-500/20 text-sky-700 dark:text-brand-400 border border-sky-200 dark:border-brand-500/40 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Sales Staff Performance (Who Sold)</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'products'
              ? 'bg-sky-50 dark:bg-brand-500/20 text-sky-700 dark:text-brand-400 border border-sky-200 dark:border-brand-500/40 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Product Profitability Rankings</span>
        </button>

        <button
          onClick={() => setActiveTab('other_house')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'other_house'
              ? 'bg-sky-50 dark:bg-brand-500/20 text-sky-700 dark:text-brand-400 border border-sky-200 dark:border-brand-500/40 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Other House & Lend Sales</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-800 text-[10px] text-slate-700 dark:text-slate-300 font-mono">
            {otherHouseSales.length}
          </span>
        </button>
      </div>

      {/* TAB CONTENT 1: Itemized Sales & Profit Audit Ledger */}
      {(activeTab === 'items' || typeof window === 'undefined') && (
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm dark:shadow-xl print:bg-white print:border-gray-200 print:p-0">
          <div className="flex items-center justify-between flex-wrap gap-2 print:hidden">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Receipt className="w-4 h-4 text-sky-600 dark:text-brand-400" />
                <span>Granular Transaction Ledger with Buying & Selling Prices</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Exact breakdown of every sold unit: Seller (Who), Branch (Where), Timestamp (When), Product details (What), Unit Cost (Buying Price), Unit Price (Selling Price), and Gross Profit Margin.
              </p>
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400">
              Total Filtered Volume: <strong className="text-emerald-600 dark:text-emerald-400 font-bold font-mono">৳{Number(summary.totalRevenue || 0).toLocaleString()}</strong>
            </div>
          </div>

          {loading ? (
            <div className="py-16 text-center text-slate-500 dark:text-slate-400 flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-sky-600 dark:text-brand-400" />
              <span className="text-xs font-medium">Generating comprehensive financial report...</span>
            </div>
          ) : items.length === 0 ? (
            <div className="py-16 text-center text-slate-500 dark:text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              <Search className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-800 dark:text-slate-300">No transactions found</p>
              <p className="text-xs text-slate-500 mt-1">Try broadening your date filter, branch selection, or search query.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px] print:bg-gray-100 print:text-gray-700">
                    <th className="py-3.5 px-4">When (Date & Time)</th>
                    <th className="py-3.5 px-4">Invoice / Type</th>
                    <th className="py-3.5 px-4">Where (Branch)</th>
                    <th className="py-3.5 px-4">Who (Seller & Customer)</th>
                    <th className="py-3.5 px-4">What (Product & Serial)</th>
                    <th className="py-3.5 px-4 text-right">Buying Price</th>
                    <th className="py-3.5 px-4 text-right">Selling Price</th>
                    <th className="py-3.5 px-4 text-center">Qty</th>
                    <th className="py-3.5 px-4 text-right">Total Cost</th>
                    <th className="py-3.5 px-4 text-right">Total Inflow</th>
                    <th className="py-3.5 px-4 text-right">Gross Profit</th>
                    <th className="py-3.5 px-4 text-right">Margin %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 print:divide-gray-200 bg-white dark:bg-transparent">
                  {items.map((it) => {
                    const profitNum = Number(it.gross_profit || 0);
                    const isProfit = profitNum >= 0;
                    return (
                      <tr
                        key={it.item_id}
                        onClick={() => setSelectedItem(it)}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group print:hover:bg-transparent"
                      >
                        {/* 1. When */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="font-semibold text-slate-900 dark:text-slate-200 block print:text-gray-900">
                            {formatDate(it.sale_date)}
                          </span>
                          <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5 font-mono">
                            <Clock className="w-2.5 h-2.5" />
                            {new Date(it.sale_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </td>

                        {/* 2. Invoice & Channel */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="font-mono font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-brand-400 transition-colors block print:text-gray-900">
                            {it.order_number}
                          </span>
                          <span
                            className={`inline-block text-[10px] font-bold px-1.5 py-0.2 rounded mt-0.5 ${
                              it.order_type === 'pos'
                                ? 'bg-purple-50 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30'
                                : 'bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30'
                            }`}
                          >
                            {it.order_type === 'pos' ? 'POS Store' : 'Online'}
                          </span>
                        </td>

                        {/* 3. Where (Branch) */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="font-bold text-slate-800 dark:text-slate-200 block print:text-gray-900">
                            {it.branch_name || 'Showroom'}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-200 dark:border-transparent">
                            {it.branch_code}
                          </span>
                        </td>

                        {/* 4. Who (Seller & Customer) */}
                        <td className="py-3.5 px-4 min-w-[160px]">
                          <div className="flex items-center gap-1.5">
                            <span className="w-6 h-6 rounded-full bg-sky-100 dark:bg-brand-500/20 text-sky-700 dark:text-brand-400 font-bold flex items-center justify-center text-[10px] shrink-0 border border-sky-200 dark:border-transparent">
                              {(it.seller_name || 'S').charAt(0).toUpperCase()}
                            </span>
                            <div>
                              <span className="font-semibold text-slate-900 dark:text-slate-200 block text-xs truncate max-w-[140px] print:text-gray-900">
                                {it.seller_name || 'Showroom Rep'}
                              </span>
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 truncate max-w-[140px]">
                                <User className="w-2.5 h-2.5 text-slate-400" />
                                {it.customer_name || 'Walk-in'}
                                {it.customer_phone && it.customer_phone !== 'N/A' && (
                                  <span className="text-slate-400 font-mono">({it.customer_phone})</span>
                                )}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* 5. What (Product, SKU, Serial) */}
                        <td className="py-3.5 px-4 min-w-[220px]">
                          <span className="font-bold text-slate-900 dark:text-white block text-xs line-clamp-1 group-hover:text-sky-600 dark:group-hover:text-cyan-300 transition-colors print:text-gray-900">
                            {it.product_name}
                          </span>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                              SKU: {it.sku}
                            </span>
                            {it.serial_number && (
                              <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-500/30 px-1.5 py-0.2 rounded font-bold">
                                SN: {it.serial_number}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* 6. Buying Price (Unit Cost) */}
                        <td className="py-3.5 px-4 text-right font-mono font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap print:text-gray-700">
                          ৳{Number(it.buying_price || 0).toLocaleString()}
                        </td>

                        {/* 7. Selling Price (Unit Price) */}
                        <td className="py-3.5 px-4 text-right font-mono font-black text-slate-900 dark:text-white whitespace-nowrap print:text-gray-900">
                          ৳{Number(it.selling_price || 0).toLocaleString()}
                        </td>

                        {/* 8. Quantity */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap font-black text-slate-800 dark:text-slate-300 font-mono">
                          {it.quantity}
                        </td>

                        {/* 9. Total Cost */}
                        <td className="py-3.5 px-4 text-right font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap print:text-gray-700">
                          ৳{Number(it.total_buying_price || 0).toLocaleString()}
                        </td>

                        {/* 10. Total Revenue (Inflow) */}
                        <td className="py-3.5 px-4 text-right font-mono font-black text-slate-900 dark:text-white whitespace-nowrap print:text-gray-900">
                          ৳{Number(it.total_selling_price || 0).toLocaleString()}
                        </td>

                        {/* 11. Gross Profit */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap font-mono font-black">
                          <span className={isProfit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                            {isProfit ? '+' : ''}৳{Number(it.gross_profit || 0).toLocaleString()}
                          </span>
                        </td>

                        {/* 12. Margin % */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black ${
                              isProfit
                                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
                                : 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20'
                            }`}
                          >
                            {isProfit ? '+' : ''}{it.profit_margin_pct}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 dark:bg-slate-950 font-black text-xs border-t-2 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white print:bg-gray-100 print:text-gray-900">
                    <td colSpan={7} className="py-3.5 px-4 uppercase tracking-wider text-slate-600 dark:text-slate-400">
                      Total Filtered Ledger Inflow ({items.length} records)
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono">{summary.totalUnitsSold}</td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-600 dark:text-slate-400">
                      ৳{Number(summary.totalCogs || 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-900 dark:text-white">
                      ৳{Number(summary.totalRevenue || 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-emerald-600 dark:text-emerald-400">
                      +৳{Number(summary.grossProfit || 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right text-sky-700 dark:text-brand-400">
                      +{summary.grossMarginPct}%
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 2: Showroom Branches Report */}
      {activeTab === 'branches' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm dark:shadow-xl">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-sky-600 dark:text-brand-400" />
                <span>Showroom Branches Sales & Margin Analysis</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Physical branch sales volume, direct procurement costs, and branch gross margin contributions.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/80 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Showroom Branch</th>
                  <th className="py-3.5 px-4">Branch Code</th>
                  <th className="py-3.5 px-4 text-center">Orders Handled</th>
                  <th className="py-3.5 px-4 text-center">Units Sold</th>
                  <th className="py-3.5 px-4 text-right">Gross Revenue</th>
                  <th className="py-3.5 px-4 text-right">Cost of Sales (COGS)</th>
                  <th className="py-3.5 px-4 text-right">Gross Profit</th>
                  <th className="py-3.5 px-4 text-right">Margin %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 bg-white dark:bg-transparent">
                {branchReport.map((b) => {
                  const rev = Number(b.revenue || 0);
                  const cogs = Number(b.cogs || 0);
                  const gp = Number(b.gross_profit || 0);
                  const margin = rev > 0 ? ((gp / rev) * 100).toFixed(1) : '0.0';

                  return (
                    <tr key={b.code} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Store className="w-4 h-4 text-sky-600 dark:text-brand-400" />
                        {b.name}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500 dark:text-slate-400">{b.code}</td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-700 dark:text-slate-300 font-mono">{b.order_count || 0}</td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-700 dark:text-slate-300 font-mono">{b.units_sold || 0}</td>
                      <td className="py-3.5 px-4 text-right font-black text-slate-900 dark:text-white font-mono">
                        ৳{rev.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-600 dark:text-slate-400 font-mono">
                        ৳{cogs.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-emerald-600 dark:text-emerald-400 font-mono">
                        +৳{gp.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-sky-700 dark:text-brand-400">
                        <span className="px-2 py-0.5 rounded-full bg-sky-50 dark:bg-brand-500/10 border border-sky-200 dark:border-brand-500/20">
                          +{margin}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: Sales Staff Performance (Who is Selling) */}
      {activeTab === 'staff' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm dark:shadow-xl">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <User className="w-4 h-4 text-sky-600 dark:text-brand-400" />
              <span>Sales Staff & Representative Performance Matrix (Who Sold)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Track revenue generated, hardware units closed, and net gross profit contribution per staff member.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/80 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Sales Representative</th>
                  <th className="py-3.5 px-4">Assigned Branch</th>
                  <th className="py-3.5 px-4 text-center">Orders Closed</th>
                  <th className="py-3.5 px-4 text-center">Units Sold</th>
                  <th className="py-3.5 px-4 text-right">Revenue Generated</th>
                  <th className="py-3.5 px-4 text-right">Hardware COGS</th>
                  <th className="py-3.5 px-4 text-right">Gross Profit Closed</th>
                  <th className="py-3.5 px-4 text-right">Margin %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 bg-white dark:bg-transparent">
                {staffReport.map((s, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-sky-100 dark:bg-brand-500/20 text-sky-700 dark:text-brand-400 flex items-center justify-center font-bold text-xs border border-sky-200 dark:border-transparent">
                        {s.staff_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span>{s.staff_name}</span>
                        <span className="block text-[10px] text-slate-400 font-normal">{s.staff_email}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">{s.branch_name}</td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-700 dark:text-slate-300 font-mono">{s.total_orders}</td>
                    <td className="py-3.5 px-4 text-center font-bold text-cyan-600 dark:text-cyan-400 font-mono">{s.total_units_sold}</td>
                    <td className="py-3.5 px-4 text-right font-black text-slate-900 dark:text-white font-mono">
                      ৳{Number(s.total_revenue || 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-600 dark:text-slate-400 font-mono">
                      ৳{Number(s.total_cogs || 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-emerald-600 dark:text-emerald-400 font-mono">
                      +৳{Number(s.total_profit || 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-500/20">
                        +{s.margin_pct}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: Product Profitability Rankings */}
      {activeTab === 'products' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm dark:shadow-xl">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Package className="w-4 h-4 text-sky-600 dark:text-brand-400" />
              <span>Top Profit-Generating Products Leaderboard (What Was Sold)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Rankings of items delivering the highest absolute gross profit to your business.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/80 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4"># Rank</th>
                  <th className="py-3.5 px-4">Product Name & SKU</th>
                  <th className="py-3.5 px-4 text-center">Units Sold</th>
                  <th className="py-3.5 px-4 text-right">Avg Buying Price</th>
                  <th className="py-3.5 px-4 text-right">Avg Selling Price</th>
                  <th className="py-3.5 px-4 text-right">Total Revenue</th>
                  <th className="py-3.5 px-4 text-right">Total Cost</th>
                  <th className="py-3.5 px-4 text-right">Gross Profit Generated</th>
                  <th className="py-3.5 px-4 text-right">Margin %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 bg-white dark:bg-transparent">
                {topProducts.map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-sky-600 dark:text-brand-400">
                      #{idx + 1}
                    </td>
                    <td className="py-3.5 px-4 min-w-[240px]">
                      <span className="font-bold text-slate-900 dark:text-white block">{p.product_name}</span>
                      <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">SKU: {p.sku}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-black text-cyan-600 dark:text-cyan-400 font-mono">{p.units_sold}</td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-600 dark:text-slate-400">
                      ৳{Number(p.avg_buying_price || 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                      ৳{Number(p.avg_selling_price || 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-black text-slate-900 dark:text-white">
                      ৳{Number(p.total_revenue || 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-600 dark:text-slate-400">
                      ৳{Number(p.total_cogs || 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-black text-emerald-600 dark:text-emerald-400">
                      +৳{Number(p.total_profit || 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-500/20">
                        +{p.margin_pct}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT 5: Other House & Lend Sales */}
      {activeTab === 'other_house' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm dark:shadow-xl">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Store className="w-4 h-4 text-sky-600 dark:text-brand-400" />
              <span>Other House & Inter-Store Sales Ledger (অন্য হাউস ক্রয়-বিক্রয় ও লাভ)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Sales made to partner houses/dealers with procurement cost price, selling price, and instant profit margin.
            </p>
          </div>

          {otherHouseSales.length === 0 ? (
            <div className="py-12 text-center text-slate-500 dark:text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-300">No other house sales recorded yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-4">Invoice #</th>
                    <th className="py-3.5 px-4">Partner House</th>
                    <th className="py-3.5 px-4">Product & Serial</th>
                    <th className="py-3.5 px-4 text-right">Cost Price (Buying)</th>
                    <th className="py-3.5 px-4 text-right">Selling Price</th>
                    <th className="py-3.5 px-4 text-center">Qty</th>
                    <th className="py-3.5 px-4 text-right">Total Inflow</th>
                    <th className="py-3.5 px-4 text-right">Gross Profit</th>
                    <th className="py-3.5 px-4 text-right">Margin %</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 bg-white dark:bg-transparent">
                  {otherHouseSales.map((oh) => (
                    <tr key={oh.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-sky-600 dark:text-brand-400">{oh.invoice_no}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        <span>{oh.house_name}</span>
                        {oh.house_phone && <span className="block text-[10px] text-slate-500 font-mono">{oh.house_phone}</span>}
                      </td>
                      <td className="py-3.5 px-4 min-w-[200px]">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 block">{oh.product_name}</span>
                        <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-500/30 px-1.5 py-0.2 rounded font-bold">
                          SN: {oh.serial_number}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-600 dark:text-slate-400">
                        ৳{Number(oh.buying_price || 0).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                        ৳{Number(oh.selling_price || 0).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-800 dark:text-slate-300 font-mono">{oh.quantity}</td>
                      <td className="py-3.5 px-4 text-right font-mono font-black text-slate-900 dark:text-white">
                        ৳{Number(oh.total_selling_price || 0).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-black text-emerald-600 dark:text-emerald-400">
                        +৳{Number(oh.gross_profit || 0).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-500/20">
                          +{oh.margin_pct}%
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            oh.payment_status === 'paid'
                              ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30'
                              : 'bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30'
                          }`}
                        >
                          {oh.payment_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Item Detail Quick-View Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-700 rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 dark:text-brand-400">
                  Sale Transaction Details
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{selectedItem.order_number}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30 font-normal">
                    {selectedItem.order_type === 'pos' ? 'POS Showroom Sale' : 'Online Order'}
                  </span>
                </h3>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 font-semibold block">When Sold (Timestamp)</span>
                <span className="font-bold text-slate-900 dark:text-white mt-1 block">{formatDate(selectedItem.sale_date)}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 font-semibold block">Where Sold (Branch)</span>
                <span className="font-bold text-slate-900 dark:text-white mt-1 block">
                  {selectedItem.branch_name} ({selectedItem.branch_code})
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 font-semibold block">Who Sold (Sales Rep / Cashier)</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">{selectedItem.seller_name}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 font-semibold block">Who Bought (Customer)</span>
                <span className="font-bold text-sky-700 dark:text-cyan-400 mt-1 block">
                  {selectedItem.customer_name} ({selectedItem.customer_phone})
                </span>
              </div>
            </div>

            {/* Product & Pricing Detail */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
              <div>
                <span className="text-slate-500 font-semibold block">What Was Sold (Product)</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm mt-0.5 block">{selectedItem.product_name}</span>
                <div className="flex items-center gap-3 mt-1 font-mono text-slate-500 dark:text-slate-400 text-[11px]">
                  <span>SKU: {selectedItem.sku}</span>
                  {selectedItem.serial_number && (
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/30">
                      SN: {selectedItem.serial_number}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 dark:border-slate-800 font-mono">
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 text-[10px] block">Buying Price (Cost)</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300 block text-sm mt-0.5">
                    ৳{Number(selectedItem.buying_price || 0).toLocaleString()}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 text-[10px] block">Selling Price (Unit)</span>
                  <span className="font-black text-slate-900 dark:text-white block text-sm mt-0.5">
                    ৳{Number(selectedItem.selling_price || 0).toLocaleString()}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30">
                  <span className="text-emerald-700 dark:text-emerald-400 text-[10px] block">Gross Profit Margin</span>
                  <span className="font-black text-emerald-600 dark:text-emerald-400 block text-sm mt-0.5">
                    +৳{Number(selectedItem.gross_profit || 0).toLocaleString()} ({selectedItem.profit_margin_pct}%)
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
