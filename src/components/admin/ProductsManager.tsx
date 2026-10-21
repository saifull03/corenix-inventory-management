'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Package,
  Plus,
  Search,
  ExternalLink,
  Copy,
  Edit3,
  Trash2,
  X,
  SlidersHorizontal,
  CheckCircle2,
  Barcode,
  Hash,
  Tag,
  Layers,
  Sparkles,
  ChevronDown,
  Check,
  Flame,
  Star,
  Loader2,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';

export interface ProductItem {
  id: number;
  name: string;
  slug: string;
  sku: string;
  barcode?: string | null;
  model?: string | null;
  mpn?: string | null;
  brand_id: number;
  category_id: number;
  brand_name: string;
  category_name: string;
  primary_image?: string | null;
  overview?: string | null;
  key_features_json?: string | null;
  specification_count?: number | string | null;
  meta_title?: string | null;
  meta_desc?: string | null;
  focus_keyword?: string | null;
  purchase_cost: number;
  selling_price: number;
  discount_price?: number | null;
  total_stock?: number | null;
  stock_status?: string | null;
  seo_score?: number | null;
  is_featured?: number | boolean;
  is_hot?: number | boolean;
  is_new?: number | boolean;
  is_sale?: number | boolean;
  is_pc_builder?: number | boolean;
  created_at?: string;
}

interface Props {
  initialProducts: ProductItem[];
}

type SearchFieldFilter = 'all' | 'name' | 'model' | 'sku' | 'barcode';
type HighlightFilter = 'all' | 'trending' | 'hot_deals' | 'pc_builder' | 'missing_details';

function getMissingDetails(product: ProductItem): string[] {
  const missing: string[] = [];
  if (!product.primary_image?.trim()) missing.push('Product image');
  if (!product.overview?.trim()) missing.push('Overview');

  let hasKeyFeature = false;
  try {
    const features = JSON.parse(product.key_features_json || '[]');
    hasKeyFeature = Array.isArray(features)
      ? features.some(feature => String(feature).trim())
      : Boolean(String(features || '').trim());
  } catch {
    hasKeyFeature = Boolean(product.key_features_json?.trim());
  }
  if (!hasKeyFeature) missing.push('Key features');
  if (Number(product.specification_count || 0) < 1) missing.push('Specifications');
  if (!product.meta_title?.trim()) missing.push('SEO title');
  if (!product.meta_desc?.trim()) missing.push('SEO description');
  if (!product.focus_keyword?.trim()) missing.push('SEO focus keyword');
  return missing;
}

export default function ProductsManager({ initialProducts }: Props) {
  const [products, setProducts] = useState<ProductItem[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchField, setSearchField] = useState<SearchFieldFilter>('all');
  const [highlightFilter, setHighlightFilter] = useState<HighlightFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [brandFilter, setBrandFilter] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<string>('all');
  const [copiedSku, setCopiedSku] = useState<string | null>(null);
  const [updatingFlag, setUpdatingFlag] = useState<{ id: number; field: 'is_featured' | 'is_hot' } | null>(null);
  const [updatingStockStatusId, setUpdatingStockStatusId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Extract unique categories & brands for dropdown filters
  const categoriesList = useMemo(() => {
    const set = new Set<string>();
    initialProducts.forEach(p => {
      if (p.category_name) set.add(p.category_name);
    });
    return Array.from(set).sort();
  }, [initialProducts]);

  const brandsList = useMemo(() => {
    const set = new Set<string>();
    initialProducts.forEach(p => {
      if (p.brand_name) set.add(p.brand_name);
    });
    return Array.from(set).sort();
  }, [initialProducts]);

  // Counts for highlights
  const trendingCount = useMemo(() => products.filter(p => Boolean(p.is_featured)).length, [products]);
  const hotDealsCount = useMemo(() => products.filter(p => Boolean(p.is_hot)).length, [products]);
  const pcBuilderCount = useMemo(() => products.filter(p => Boolean(p.is_pc_builder)).length, [products]);
  const missingDetailsCount = useMemo(() => products.filter(p => getMissingDetails(p).length > 0).length, [products]);

  // Copy SKU helper
  const handleCopySku = (sku: string) => {
    navigator.clipboard.writeText(sku);
    setCopiedSku(sku);
    setTimeout(() => setCopiedSku(null), 2000);
  };

  // Toggle Featured/Trending or Hot Deal directly
  const handleToggleFlag = async (productId: number, field: 'is_featured' | 'is_hot', currentValue: boolean | number | undefined) => {
    const targetProduct = products.find(p => p.id === productId);
    if (!targetProduct) return;

    const newValue = !Boolean(currentValue);
    setUpdatingFlag({ id: productId, field });

    // Optimistic UI update
    setProducts(prev =>
      prev.map(p => {
        if (p.id === productId) {
          return { ...p, [field]: newValue };
        }
        return p;
      })
    );

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: newValue }),
      });

      if (!res.ok) {
        throw new Error('Failed to update promotion status');
      }

      const label = field === 'is_featured' ? 'Trending Status' : 'Hot Deal Status';
      setToastMessage(`"${targetProduct.name.slice(0, 24)}..." ${label} is now ${newValue ? 'ACTIVE ⭐' : 'OFF'}`);
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err: any) {
      // Rollback
      setProducts(prev =>
        prev.map(p => {
          if (p.id === productId) {
            return { ...p, [field]: currentValue };
          }
          return p;
        })
      );
      alert('Error updating status: ' + err.message);
    } finally {
      setUpdatingFlag(null);
    }
  };

  // Change product stock status directly
  const handleUpdateStockStatus = async (productId: number, newStockStatus: string) => {
    const targetProduct = products.find(p => p.id === productId);
    if (!targetProduct) return;
    const oldStatus = targetProduct.stock_status || 'In Stock';

    setUpdatingStockStatusId(productId);
    // Optimistic UI update
    setProducts(prev =>
      prev.map(p => {
        if (p.id === productId) {
          return { ...p, stock_status: newStockStatus };
        }
        return p;
      })
    );

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock_status: newStockStatus }),
      });

      if (!res.ok) {
        throw new Error('Failed to update product stock status');
      }

      setToastMessage(`"${targetProduct.name.slice(0, 22)}..." status changed to "${newStockStatus}" ✅`);
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err: any) {
      // Rollback
      setProducts(prev =>
        prev.map(p => {
          if (p.id === productId) {
            return { ...p, stock_status: oldStatus };
          }
          return p;
        })
      );
      alert('Error updating stock status: ' + err.message);
    } finally {
      setUpdatingStockStatusId(null);
    }
  };

  // Filter products by search query across Name, Model, SKU, Barcode, & Highlights
  const filteredProducts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return products.filter(p => {
      // Highlight filter
      if (highlightFilter === 'trending' && !p.is_featured) return false;
      if (highlightFilter === 'hot_deals' && !p.is_hot) return false;
      if (highlightFilter === 'pc_builder' && !p.is_pc_builder) return false;
      if (highlightFilter === 'missing_details' && getMissingDetails(p).length === 0) return false;

      // Category filter
      if (categoryFilter !== 'all' && p.category_name !== categoryFilter) {
        return false;
      }

      // Brand filter
      if (brandFilter !== 'all' && p.brand_name !== brandFilter) {
        return false;
      }

      // Stock status filter
      if (stockFilter !== 'all') {
        const currentStockStatus = p.stock_status || ((p.total_stock || 0) > 0 ? 'In Stock' : 'Out Of Stock');
        if (stockFilter === 'in_stock' && currentStockStatus !== 'In Stock') return false;
        if (stockFilter === 'out_of_stock' && currentStockStatus !== 'Out Of Stock') return false;
        if (stockFilter !== 'in_stock' && stockFilter !== 'out_of_stock' && currentStockStatus !== stockFilter) return false;
      }

      // Search matching
      if (!q) return true;

      const name = (p.name || '').toLowerCase();
      const model = (p.model || '').toLowerCase();
      const sku = (p.sku || '').toLowerCase();
      const barcode = (p.barcode || '').toLowerCase();
      const brand = (p.brand_name || '').toLowerCase();
      const category = (p.category_name || '').toLowerCase();

      switch (searchField) {
        case 'name':
          return name.includes(q);
        case 'model':
          return model.includes(q);
        case 'sku':
          return sku.includes(q);
        case 'barcode':
          return barcode.includes(q);
        case 'all':
        default:
          return (
            name.includes(q) ||
            model.includes(q) ||
            sku.includes(q) ||
            barcode.includes(q) ||
            brand.includes(q) ||
            category.includes(q)
          );
      }
    });
  }, [products, searchQuery, searchField, highlightFilter, categoryFilter, brandFilter, stockFilter]);

  // Helper to highlight matching text
  const highlightMatch = (text: string | null | undefined, query: string) => {
    if (!text) return text || '';
    if (!query.trim()) return text;

    const q = query.toLowerCase().trim();
    const idx = text.toLowerCase().indexOf(q);
    if (idx === -1) return text;

    return (
      <>
        {text.slice(0, idx)}
        <mark className="bg-amber-400/40 text-amber-950 dark:text-amber-200 px-0.5 rounded font-bold">
          {text.slice(idx, idx + q.length)}
        </mark>
        {text.slice(idx + q.length)}
      </>
    );
  };

  const isFiltered = Boolean(
    searchQuery ||
    searchField !== 'all' ||
    highlightFilter !== 'all' ||
    categoryFilter !== 'all' ||
    brandFilter !== 'all' ||
    stockFilter !== 'all'
  );

  const resetFilters = () => {
    setSearchQuery('');
    setSearchField('all');
    setHighlightFilter('all');
    setCategoryFilter('all');
    setBrandFilter('all');
    setStockFilter('all');
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 text-white dark:bg-brand-500 dark:text-navy-950 font-bold text-xs shadow-2xl border border-white/10 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-950" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Hardware &amp; Homepage Promotion Management
          </span>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Products Catalogue ({products.length})
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage pricing, inventory, specifications, and 1-click homepage <strong>Trending Hardware</strong> and <strong>Hot Deals</strong>.
          </p>
        </div>

        <Link
          href="/admin/products/create"
          className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-navy-950 font-bold text-xs flex items-center gap-2 shadow transition-all hover:shadow-lg hover:shadow-brand-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Product (18-Step)</span>
        </Link>
      </div>

      {/* Quick Showcase Promotion Pills (Trending & Hot Deals Highlights) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        <button
          type="button"
          onClick={() => setHighlightFilter('all')}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            highlightFilter === 'all'
              ? 'bg-slate-900 text-white dark:bg-slate-800 dark:text-white border-slate-700 shadow-md ring-2 ring-brand-500/50'
              : 'bg-white dark:bg-navy-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider opacity-75">All Hardware</span>
            <Package className="w-4 h-4 opacity-75" />
          </div>
          <div className="text-xl font-black mt-1">{products.length} Products</div>
          <div className="text-[10px] opacity-70 mt-0.5">Complete inventory catalogue</div>
        </button>

        <button
          type="button"
          onClick={() => setHighlightFilter(highlightFilter === 'trending' ? 'all' : 'trending')}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            highlightFilter === 'trending'
              ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-md ring-2 ring-amber-400'
              : 'bg-white dark:bg-navy-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-amber-400/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              Trending Hardware
            </span>
            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-black bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
              Homepage
            </span>
          </div>
          <div className="text-xl font-black mt-1 text-slate-900 dark:text-white">
            {trendingCount} <span className="text-xs font-medium opacity-80">Featured</span>
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
            Ranked at top of homepage trending grid
          </div>
        </button>

        <button
          type="button"
          onClick={() => setHighlightFilter(highlightFilter === 'hot_deals' ? 'all' : 'hot_deals')}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            highlightFilter === 'hot_deals'
              ? 'bg-rose-500 text-white border-rose-600 shadow-md ring-2 ring-rose-400'
              : 'bg-white dark:bg-navy-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-rose-400/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
              Hot Deals
            </span>
            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-black bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300">
              Badge &amp; Discounts
            </span>
          </div>
          <div className="text-xl font-black mt-1 text-slate-900 dark:text-white">
            {hotDealsCount} <span className="text-xs font-medium opacity-80">Promoted</span>
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
            Hot deal badge &amp; special pricing priority
          </div>
        </button>

        <button
          type="button"
          onClick={() => setHighlightFilter(highlightFilter === 'pc_builder' ? 'all' : 'pc_builder')}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            highlightFilter === 'pc_builder'
              ? 'bg-cyan-600 text-white border-cyan-700 shadow-md ring-2 ring-cyan-400'
              : 'bg-white dark:bg-navy-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-cyan-400/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
              PC Builder Pool
            </span>
            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-black bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300">
              Compatibility
            </span>
          </div>
          <div className="text-xl font-black mt-1 text-slate-900 dark:text-white">
            {pcBuilderCount} <span className="text-xs font-medium opacity-80">Components</span>
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
            Interactive PC configurator selection pool
          </div>
        </button>

        <button
          type="button"
          onClick={() => setHighlightFilter(highlightFilter === 'missing_details' ? 'all' : 'missing_details')}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            highlightFilter === 'missing_details'
              ? 'bg-orange-500 text-white border-orange-600 shadow-md ring-2 ring-orange-400'
              : 'bg-white dark:bg-navy-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-orange-400/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-700 dark:text-orange-400 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              Missing Details
            </span>
            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-black bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-300">
              Needs review
            </span>
          </div>
          <div className={`text-xl font-black mt-1 ${highlightFilter === 'missing_details' ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
            {missingDetailsCount} <span className="text-xs font-medium opacity-80">Products</span>
          </div>
          <div className={`text-[10px] mt-0.5 ${highlightFilter === 'missing_details' ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}`}>
            Images, descriptions, specs, and SEO
          </div>
        </button>
      </div>

      {/* ── SEARCH & FILTER CONTROLS ── */}
      <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
          {/* Main Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={
                searchField === 'name'
                  ? 'Search by product name...'
                  : searchField === 'model'
                  ? 'Search by model number (e.g. RTX 5070, B650)...'
                  : searchField === 'sku'
                  ? 'Search by SKU code (e.g. GPU-MSI-5070)...'
                  : searchField === 'barcode'
                  ? 'Scan or enter Barcode / EAN number...'
                  : 'Search by Product Name, Model, SKU, or Barcode / EAN...'
              }
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-9 py-2.5 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-brand-500 transition-colors text-xs font-medium"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Search Target Mode Pills */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 self-start lg:self-auto overflow-x-auto shadow-2xs">
            <button
              type="button"
              onClick={() => setSearchField('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                searchField === 'all'
                  ? 'bg-brand-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800'
              }`}
            >
              All Fields
            </button>
            <button
              type="button"
              onClick={() => setSearchField('name')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                searchField === 'name'
                  ? 'bg-brand-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800'
              }`}
            >
              Name
            </button>
            <button
              type="button"
              onClick={() => setSearchField('model')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                searchField === 'model'
                  ? 'bg-brand-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800'
              }`}
            >
              Model
            </button>
            <button
              type="button"
              onClick={() => setSearchField('sku')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                searchField === 'sku'
                  ? 'bg-brand-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800'
              }`}
            >
              SKU
            </button>
            <button
              type="button"
              onClick={() => setSearchField('barcode')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                searchField === 'barcode'
                  ? 'bg-brand-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800'
              }`}
            >
              <Barcode className="w-3.5 h-3.5" />
              <span>Barcode</span>
            </button>
          </div>
        </div>

        {/* Secondary Filter Dropdowns */}
        <div className="flex items-center justify-between flex-wrap gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-slate-700 dark:text-slate-300 text-xs font-medium focus:outline-none focus:border-brand-500 cursor-pointer"
            >
              <option value="all">All Categories ({categoriesList.length})</option>
              {categoriesList.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Brand Filter */}
            <select
              value={brandFilter}
              onChange={e => setBrandFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-slate-700 dark:text-slate-300 text-xs font-medium focus:outline-none focus:border-brand-500 cursor-pointer"
            >
              <option value="all">All Brands ({brandsList.length})</option>
              {brandsList.map(b => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>

            {/* Stock Status Filter */}
            <select
              value={stockFilter}
              onChange={e => setStockFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-slate-700 dark:text-slate-300 text-xs font-medium focus:outline-none focus:border-brand-500 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="In Stock">In Stock</option>
              <option value="Out Of Stock">Out Of Stock</option>
              <option value="Pre-Order">Pre-Order</option>
              <option value="Up Coming">Up Coming</option>
              <option value="2-3 Days">2-3 Days</option>
              <option value="Call for Price">Call for Price</option>
            </select>

            {isFiltered && (
              <button
                type="button"
                onClick={resetFilters}
                className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-brand-300 text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          {/* Results Counter */}
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Showing <strong className="text-slate-900 dark:text-white">{filteredProducts.length}</strong> of{' '}
            <strong className="text-slate-700 dark:text-slate-200">{products.length}</strong> products
          </div>
        </div>
      </div>

      {/* ── PRODUCTS TABLE ── */}
      <div className="p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <Package className="w-12 h-12 mx-auto text-slate-400 dark:text-slate-600" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No products match your search or filter</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              No results found for &ldquo;{searchQuery || highlightFilter}&rdquo;. Try adjusting search filters or category.
            </p>
            {isFiltered && (
              <button
                type="button"
                onClick={resetFilters}
                className="px-4 py-2 rounded-xl bg-brand-500 text-navy-950 font-bold text-xs hover:bg-brand-400 transition-colors"
              >
                Clear Search &amp; Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider bg-slate-50/50 dark:bg-navy-950/40">
                  <th className="py-3 px-3">Product Name &amp; SKU</th>
                  {highlightFilter === 'missing_details' && <th className="py-3 px-3">Missing Details</th>}
                  <th className="py-3 px-3 text-center">Status / Availability</th>
                  <th className="py-3 px-3">Homepage Showcase &amp; Promos</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Brand</th>
                  <th className="py-3 px-3 text-right">Cost Price</th>
                  <th className="py-3 px-3 text-right">Selling Price</th>
                  <th className="py-3 px-3 text-center">Total Stock</th>
                  <th className="py-3 px-3 text-center">SEO Score</th>
                  <th className="py-3 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredProducts.map((p, idx) => {
                  const margin =
                    p.selling_price > 0
                      ? (((p.selling_price - p.purchase_cost) / p.selling_price) * 100).toFixed(1)
                      : 0;

                  const isTrending = Boolean(p.is_featured);
                  const isHot = Boolean(p.is_hot);
                  const isTrendingUpdating = updatingFlag?.id === p.id && updatingFlag.field === 'is_featured';
                  const isHotUpdating = updatingFlag?.id === p.id && updatingFlag.field === 'is_hot';
                  const missingDetails = getMissingDetails(p);

                  return (
                    <tr key={`admin-prod-${p.id}-${idx}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      {/* Name, Image & SKU */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={
                              p.primary_image ||
                              'https://images.unsplash.com/photo-158720237277-e229f172b9d7?auto=format&fit=crop&w=100&q=80'
                            }
                            alt={p.name}
                            className="w-10 h-10 object-contain bg-slate-50 dark:bg-navy-950 rounded-lg p-1 border border-slate-200 dark:border-slate-800 flex-shrink-0"
                          />
                          <div className="min-w-0 max-w-xs">
                            <Link
                              href={`/admin/products/${p.id}/edit`}
                              className="font-bold text-slate-900 dark:text-white block truncate hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                              title={`Edit ${p.name}`}
                            >
                              {highlightMatch(p.name, searchQuery)}
                            </Link>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1">
                                <span className="text-slate-400 dark:text-slate-500">SKU:</span>
                                <strong>{highlightMatch(p.sku, searchQuery)}</strong>
                              </span>
                              {p.is_pc_builder ? (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-cyan-100 text-cyan-800 border border-cyan-200 dark:bg-cyan-950 dark:text-cyan-300 dark:border-cyan-800">
                                  PC Builder
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </td>

                      {highlightFilter === 'missing_details' && (
                        <td className="py-3 px-3 min-w-56">
                          <div className="flex flex-wrap gap-1">
                            {missingDetails.map(detail => (
                              <span key={detail} className="px-2 py-1 rounded-md bg-orange-50 text-orange-800 border border-orange-200 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-900 text-[10px] font-semibold">
                                {detail}
                              </span>
                            ))}
                          </div>
                          <Link
                            href={`/admin/products/${p.id}/edit`}
                            className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-2.5 py-1.5 text-[11px] font-bold text-white transition-colors hover:bg-brand-700 dark:bg-brand-500 dark:text-navy-950 dark:hover:bg-brand-400"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                            Complete details
                          </Link>
                        </td>
                      )}

                      {/* Stock Status / Product Availability (Interactive Real-Time Quick Selector) */}
                      <td className="py-3 px-3 text-center">
                        <div className="relative inline-block">
                          <select
                            value={p.stock_status || 'In Stock'}
                            onChange={e => handleUpdateStockStatus(p.id, e.target.value)}
                            disabled={updatingStockStatusId === p.id}
                            title="Change stock status live"
                            className={`text-[11px] font-bold px-2.5 py-1.5 rounded-lg border appearance-none pr-7 cursor-pointer focus:outline-none transition-all shadow-2xs ${
                              p.stock_status === 'Out Of Stock'
                                ? 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-800'
                                : p.stock_status === 'Pre-Order'
                                ? 'bg-purple-50 text-purple-700 border-purple-300 dark:bg-purple-950/70 dark:text-purple-300 dark:border-purple-800'
                                : p.stock_status === 'Up Coming'
                                ? 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800'
                                : p.stock_status === '2-3 Days'
                                ? 'bg-sky-50 text-sky-700 border-sky-300 dark:bg-sky-950/70 dark:text-sky-300 dark:border-sky-800'
                                : p.stock_status === 'Call for Price'
                                ? 'bg-indigo-50 text-indigo-700 border-indigo-300 dark:bg-indigo-950/70 dark:text-indigo-300 dark:border-indigo-800'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800'
                            }`}
                          >
                            <option value="In Stock" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">In Stock</option>
                            <option value="Out Of Stock" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Out Of Stock</option>
                            <option value="Pre-Order" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Pre-Order</option>
                            <option value="Up Coming" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Up Coming</option>
                            <option value="2-3 Days" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">2-3 Days</option>
                            <option value="Call for Price" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Call for Price</option>
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                            {updatingStockStatusId === p.id ? (
                              <Loader2 className="w-3 h-3 animate-spin text-slate-500" />
                            ) : (
                              <ChevronDown className="w-3 h-3 text-slate-500" />
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Homepage Showcase & Promo Toggles */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {/* Trending Toggle Button */}
                          <button
                            type="button"
                            onClick={() => handleToggleFlag(p.id, 'is_featured', p.is_featured)}
                            disabled={isTrendingUpdating}
                            title={isTrending ? 'Click to remove from Homepage Trending section' : 'Click to feature in Homepage Trending section'}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all flex items-center gap-1.5 ${
                              isTrending
                                ? 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-700/80 shadow-2xs'
                                : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300 dark:bg-slate-800/60 dark:text-slate-400 dark:border-slate-700 dark:hover:bg-amber-950/40 dark:hover:text-amber-300'
                            }`}
                          >
                            {isTrendingUpdating ? (
                              <Loader2 className="w-3 h-3 animate-spin text-amber-500" />
                            ) : (
                              <Star className={`w-3 h-3 ${isTrending ? 'fill-amber-500 text-amber-500' : 'text-slate-400 dark:text-slate-500'}`} />
                            )}
                            <span>{isTrending ? 'Trending' : 'Add Trending'}</span>
                          </button>

                          {/* Hot Deal Toggle Button */}
                          <button
                            type="button"
                            onClick={() => handleToggleFlag(p.id, 'is_hot', p.is_hot)}
                            disabled={isHotUpdating}
                            title={isHot ? 'Click to remove Hot Deal badge' : 'Click to add Hot Deal badge & promotion'}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all flex items-center gap-1.5 ${
                              isHot
                                ? 'bg-rose-100 text-rose-900 border-rose-300 hover:bg-rose-200 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-700/80 shadow-2xs'
                                : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 dark:bg-slate-800/60 dark:text-slate-400 dark:border-slate-700 dark:hover:bg-rose-950/40 dark:hover:text-rose-300'
                            }`}
                          >
                            {isHotUpdating ? (
                              <Loader2 className="w-3 h-3 animate-spin text-rose-500" />
                            ) : (
                              <Flame className={`w-3 h-3 ${isHot ? 'fill-rose-500 text-rose-500' : 'text-slate-400 dark:text-slate-500'}`} />
                            )}
                            <span>{isHot ? 'Hot Deal' : 'Add Hot Deal'}</span>
                          </button>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3 text-slate-700 dark:text-slate-300 font-medium">
                        {highlightMatch(p.category_name, searchQuery)}
                      </td>

                      {/* Brand */}
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-brand-300 dark:border-transparent font-semibold text-[11px]">
                          {highlightMatch(p.brand_name, searchQuery)}
                        </span>
                      </td>

                      {/* Cost */}
                      <td className="py-3 px-3 text-right font-mono text-slate-500 dark:text-slate-400">
                        ৳{Number(p.purchase_cost).toLocaleString()}
                      </td>

                      {/* Selling Price & Margin */}
                      <td className="py-3 px-3 text-right">
                        <span className="font-black text-slate-900 dark:text-white block">
                          ৳{Number(p.discount_price || p.selling_price).toLocaleString()}
                        </span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">
                          Margin: +{margin}%
                        </span>
                      </td>

                      {/* Total Stock */}
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            (p.total_stock || 0) > 0
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                              : 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950 dark:text-rose-300'
                          }`}
                        >
                          {p.total_stock || 0} Units
                        </span>
                      </td>

                      {/* SEO Score */}
                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 rounded bg-cyan-50 text-cyan-700 border border-cyan-200 dark:bg-cyan-950 dark:text-brand-300 dark:border-brand-800 text-[10px] font-black">
                          {p.seo_score || 90}/100
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Edit Product */}
                          <Link
                            href={`/admin/products/${p.id}/edit`}
                            className="p-1.5 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 dark:bg-brand-950/60 dark:hover:bg-brand-900/60 dark:text-brand-300 transition-colors border border-brand-200/80 dark:border-brand-800/80"
                            title="Edit Product (Pricing, Stock, Specs & SEO)"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </Link>

                          {/* View Storefront */}
                          <Link
                            href={`/product/${p.slug}`}
                            target="_blank"
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:hover:text-white transition-colors"
                            title="View public storefront page"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>

                          {/* Copy SKU */}
                          <button
                            type="button"
                            onClick={() => handleCopySku(p.sku)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:hover:text-white transition-colors"
                            title={copiedSku === p.sku ? 'SKU Copied!' : 'Copy SKU code'}
                          >
                            {copiedSku === p.sku ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
