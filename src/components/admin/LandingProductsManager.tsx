'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Check, GripVertical, LayoutTemplate, Save, Search } from 'lucide-react';
import { LANDING_PRODUCT_POSITIONS } from '@/lib/landing-product-config';

interface Product {
  id: number;
  name: string;
  sku: string;
  primary_image?: string;
  brand_name?: string;
}

interface Placement {
  position: string;
  product_id: number;
  order_index: number;
}

export default function LandingProductsManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [position, setPosition] = useState('featured');
  const [selected, setSelected] = useState<number[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [productsRes, placementsRes] = await Promise.all([
        fetch('/api/products?limit=500'),
        fetch('/api/admin/landing-products'),
      ]);
      const productsData = await productsRes.json();
      const placementsData = await placementsRes.json();
      setProducts(productsData.products || []);
      setPlacements(placementsData.placements || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    setSelected(
      placements
        .filter((placement) => placement.position === position)
        .sort((a, b) => a.order_index - b.order_index)
        .map((placement) => placement.product_id)
    );
  }, [placements, position]);

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return products;
    return products.filter((product) =>
      `${product.name} ${product.sku} ${product.brand_name || ''}`.toLowerCase().includes(term)
    );
  }, [products, search]);

  const toggleProduct = (id: number) => {
    const limit = LANDING_PRODUCT_POSITIONS.find((item) => item.value === position)?.limit || 8;
    setSelected((current) =>
      current.includes(id)
        ? current.filter((productId) => productId !== id)
        : current.length < limit ? [...current, id] : current
    );
  };

  const save = async () => {
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/admin/landing-products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ position, productIds: selected }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setMessage('Saved. The landing page now uses this product order.');
      await load();
    } catch (error: any) {
      setMessage(error.message || 'Unable to save product placements.');
    } finally {
      setSaving(false);
    }
  };

  const activeConfig = LANDING_PRODUCT_POSITIONS.find((item) => item.value === position)!;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <header className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-brand-400">
          <LayoutTemplate className="w-4 h-4" />
          Landing page merchandising
        </div>
        <h1 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">Choose what customers see</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
          Select products and arrange their order for each landing-page section. Leave a section empty to keep its automatic product selection.
        </p>
      </header>

      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
        {LANDING_PRODUCT_POSITIONS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setPosition(item.value)}
            className={`px-3 py-2 text-xs font-bold border transition-colors focus-visible:ring-2 focus-visible:ring-sky-400 ${
              position === item.value
                ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900'
                : 'border-slate-300 text-slate-600 hover:border-slate-500 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-500'
            }`}
          >
            {item.label} ({item.limit})
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-slate-900 dark:text-white">{activeConfig.label}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{selected.length} of {activeConfig.limit} selected · selection order is display order</p>
        </div>
        <button
          type="button"
          onClick={save}
          disabled={saving || loading}
          className="inline-flex items-center gap-2 bg-sky-700 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-sky-600 active:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-sky-400"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Saving…' : 'Save placement'}
        </button>
      </div>

      {message && <p className="border-l-2 border-sky-600 px-3 py-2 text-sm text-slate-600 dark:text-slate-300">{message}</p>}

      <label className="relative block max-w-xl">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search product name, SKU, or brand"
          className="w-full border border-slate-300 bg-transparent py-2 pl-9 pr-3 text-sm outline-none transition-colors focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20 dark:border-slate-700"
        />
      </label>

      {loading ? (
        <p className="py-12 text-center text-sm text-slate-500">Loading products…</p>
      ) : (
        <div className="grid gap-x-6 border-t border-slate-200 dark:border-slate-800 md:grid-cols-2">
          {filteredProducts.map((product) => {
            const selectedIndex = selected.indexOf(product.id);
            return (
              <button
                key={product.id}
                type="button"
                onClick={() => toggleProduct(product.id)}
                className={`flex items-center gap-3 border-b border-slate-200 py-3 text-left transition-colors hover:bg-slate-100 active:bg-slate-200 dark:border-slate-800 dark:hover:bg-slate-900 dark:active:bg-slate-800 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-400 ${
                  selectedIndex >= 0 ? 'bg-slate-100 dark:bg-slate-900' : ''
                }`}
              >
                <span className="w-5 text-center text-xs font-bold text-slate-400">
                  {selectedIndex >= 0 ? selectedIndex + 1 : <GripVertical className="mx-auto h-4 w-4" />}
                </span>
                <span className="h-12 w-12 shrink-0 border border-slate-200 bg-white p-1 dark:border-slate-700">
                  {product.primary_image && <img src={product.primary_image} alt="" className="h-full w-full object-contain" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-slate-800 dark:text-slate-100">{product.name}</span>
                  <span className="block truncate text-xs text-slate-500">{product.brand_name || 'CORENIX'} · {product.sku}</span>
                </span>
                <span className={`flex h-5 w-5 shrink-0 items-center justify-center border ${selectedIndex >= 0 ? 'border-sky-700 bg-sky-700 text-white' : 'border-slate-300 dark:border-slate-600'}`}>
                  {selectedIndex >= 0 && <Check className="h-3.5 w-3.5" />}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
