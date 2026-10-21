'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Package,
  Layers,
  Tag,
  DollarSign,
  Warehouse,
  Image,
  Sliders,
  CheckCircle,
  FileText,
  Search,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Eye,
  ShieldCheck,
  Upload,
  Plus,
  Trash2,
  Star,
  Loader2,
  X,
  Link2,
  ChevronRight,
  LayoutGrid
} from 'lucide-react';
import { MEGA_CATEGORIES } from '@/lib/categories-data';


const TABS = [
  { id: 1, name: '1. Basic Info' },
  { id: 2, name: '2. Category' },
  { id: 3, name: '3. Brand' },
  { id: 4, name: '4. Pricing' },
  { id: 5, name: '5. Inventory' },
  { id: 6, name: '6. Images' },
  { id: 7, name: '7. Specifications' },
  { id: 8, name: '8. Features' },
  { id: 9, name: '9. Description' },
  { id: 10, name: '10. SEO & Preview' },
  { id: 11, name: '11. PC Builder' },
  { id: 12, name: '12. Publish' },
];

import {
  getCategorySpecTemplate,
  SpecTemplate,
  SpecSection,
  SpecField,
  MOTHERBOARD_SPEC_TEMPLATE,
  PROCESSOR_SPEC_TEMPLATE,
  GPU_SPEC_TEMPLATE,
  RAM_SPEC_TEMPLATE,
  SSD_SPEC_TEMPLATE,
  PSU_SPEC_TEMPLATE,
  CASING_SPEC_TEMPLATE,
  COOLER_SPEC_TEMPLATE,
  MONITOR_SPEC_TEMPLATE,
  LAPTOP_SPEC_TEMPLATE,
} from '@/lib/official-spec-templates';


export default function CreateProductPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Categories & Brands for dropdowns
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);

  // Form State - Clean blank state with placeholder guidance
  const [formData, setFormData] = useState({
    // 1. Basic Info
    name: '',
    slug: '',
    sku: '',
    barcode: '',
    model: '',
    mpn: '',
    category_id: 0,
    brand_id: 0,
    warranty_period: '',
    status: 'published',
    stock_status: 'In Stock',
    is_featured: false,
    is_hot: false,
    is_new: false,
    // 4. Pricing
    purchase_cost: '' as string | number,
    selling_price: '' as string | number,
    discount_price: '' as string | number,
    // 5. Inventory per branch
    wh_stock: '' as string | number,
    shop1_stock: '' as string | number,
    shop2_stock: '' as string | number,
    rma_stock: '' as string | number,
    // 6. Image
    primary_image: '',
    // 7. Specifications
    spec_vram: '',
    spec_bus: '',
    spec_clock: '',
    spec_power: '',
    // 8. Key Features
    feature1: '',
    feature2: '',
    feature3: '',
    // 9. Description
    overview: '',
    // 10. SEO
    meta_title: '',
    meta_desc: '',
    focus_keyword: '',
    // 11. PC Builder
    is_pc_builder: false,
    pc_builder_component: 'cpu',
  });

  // Image management state
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  const [uploadingPrimary, setUploadingPrimary] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const primaryFileRef = useRef<HTMLInputElement>(null);
  const galleryFileRef = useRef<HTMLInputElement>(null);

  // Upload a file and return its public URL
  const uploadFile = async (file: File): Promise<string | null> => {
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      const data = await res.json();
      return data.success ? data.url : null;
    } catch {
      return null;
    }
  };

  // Upload primary image
  const handlePrimaryUpload = async (file: File) => {
    setUploadingPrimary(true);
    const url = await uploadFile(file);
    if (url) handleChange('primary_image', url);
    setUploadingPrimary(false);
  };

  // Upload one or more gallery images
  const handleGalleryUpload = async (files: FileList) => {
    setUploadingGallery(true);
    const urls: string[] = [];
    for (const file of Array.from(files)) {
      const url = await uploadFile(file);
      if (url) urls.push(url);
    }
    setAdditionalImages(prev => [...prev, ...urls]);
    setUploadingGallery(false);
  };

  // Add URL to gallery manually
  const addUrlToGallery = () => {
    const trimmed = urlInput.trim();
    if (trimmed && !additionalImages.includes(trimmed)) {
      setAdditionalImages(prev => [...prev, trimmed]);
    }
    setUrlInput('');
  };

  // Promote a gallery image to primary
  const promoteToPrimary = (url: string) => {
    const oldPrimary = formData.primary_image;
    handleChange('primary_image', url);
    setAdditionalImages(prev => [
      ...(oldPrimary ? [oldPrimary] : []),
      ...prev.filter(u => u !== url),
    ]);
  };

  // Remove gallery image
  const removeGalleryImage = (url: string) => {
    setAdditionalImages(prev => prev.filter(u => u !== url));
  };

  // Dynamic spec values: key->value
  const [specs, setSpecs] = useState<Record<string, string>>({});
  const [specSearch, setSpecSearch] = useState('');
  const [customSpecs, setCustomSpecs] = useState<Array<{ id: string; label: string; value: string }>>([]);
  const [categorySearch, setCategorySearch] = useState('');
  const [selectedParentSlug, setSelectedParentSlug] = useState<string | null>(null);

  const handleSpecChange = (key: string, value: string) => {
    setSpecs(prev => ({ ...prev, [key]: value }));
  };

  const addCustomSpecRow = () => {
    setCustomSpecs(prev => [
      ...prev,
      { id: 'cs_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6), label: '', value: '' },
    ]);
  };

  const updateCustomSpec = (id: string, field: 'label' | 'value', val: string) => {
    setCustomSpecs(prev => prev.map(cs => (cs.id === id ? { ...cs, [field]: val } : cs)));
  };

  const removeCustomSpec = (id: string) => {
    setCustomSpecs(prev => prev.filter(cs => cs.id !== id));
  };

  // Load Categories & Brands
  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(d => { if (d.categories) setCategories(d.categories); }).catch(() => {});
    fetch('/api/brands').then(r => r.json()).then(d => { if (d.brands) setBrands(d.brands); }).catch(() => {});
  }, []);

  // Reset specs when category changes
  useEffect(() => {
    setSpecs({});
    setCustomSpecs([]);
    setSpecSearch('');
  }, [formData.category_id]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'name' && typeof value === 'string') {
        const autoSlug = value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        updated.slug = autoSlug;
      }
      return updated;
    });
  };

  const pCost = Number(formData.purchase_cost) || 0;
  const pSell = Number(formData.discount_price || formData.selling_price) || 0;
  const pRegular = Number(formData.selling_price) || 0;
  const calculatedProfit = pSell > 0 ? pSell - pCost : 0;
  const calculatedMargin = pRegular > 0 ? ((calculatedProfit / pRegular) * 100).toFixed(1) : '0.0';

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Build dynamic specs array from official template fields & custom rows
      const dynamicSpecsList = [
        ...Object.entries(specs)
          .filter(([_, val]) => val && val.trim())
          .map(([k, val]) => ({
            key: k,
            custom_label: k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
            attribute_value: val.trim(),
          })),
        ...customSpecs
          .filter(cs => cs.label && cs.label.trim() && cs.value && cs.value.trim())
          .map(cs => ({
            key: cs.label.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
            custom_label: cs.label.trim(),
            attribute_value: cs.value.trim(),
          })),
      ];

      // Fallback if no specs entered
      const finalSpecs = dynamicSpecsList.length > 0
        ? dynamicSpecsList
        : [
            { attribute_id: 7, attribute_value: formData.spec_vram },
            { attribute_id: 9, attribute_value: formData.spec_bus },
            { attribute_id: 5, attribute_value: formData.spec_clock },
          ];

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          slug: formData.slug,
          sku: formData.sku,
          model: formData.model,
          barcode: formData.barcode,
          mpn: formData.mpn,
          brand_id: formData.brand_id,
          category_id: formData.category_id,
          warranty_period: formData.warranty_period,
          status: formData.status || 'published',
          stock_status: formData.stock_status || 'In Stock',
          purchase_cost: Number(formData.purchase_cost),
          selling_price: Number(formData.selling_price),
          discount_price: Number(formData.discount_price),
          is_featured: formData.is_featured,
          is_hot: formData.is_hot,
          is_new: formData.is_new,
          is_pc_builder: formData.is_pc_builder,
          pc_builder_component: formData.pc_builder_component,
          primary_image: formData.primary_image,
          images: additionalImages,
          overview: formData.overview,
          key_features: [formData.feature1, formData.feature2, formData.feature3],
          specs: finalSpecs,
          inventory: [
            { branch_id: 1, quantity: Number(formData.wh_stock) }, // WH
            { branch_id: 2, quantity: Number(formData.shop1_stock) }, // Shop 1
            { branch_id: 3, quantity: Number(formData.shop2_stock) }, // Shop 2
            { branch_id: 4, quantity: Number(formData.rma_stock) }, // RMA Hub
          ],
          meta_title: formData.meta_title,
          meta_desc: formData.meta_desc,
          focus_keyword: formData.focus_keyword,
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert('Product published successfully with full official specifications! Live on storefront.');
        router.push('/admin/products');
      } else {
        alert(data.error || 'Failed to publish product.');
      }
    } catch (err: any) {
      alert('Error creating product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="product-manager space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
            Enterprise Product Workflow
          </span>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            18-Step Product Manager
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Dynamic attributes, category templates, multi-branch stock, and SEO generation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab(prev => Math.max(1, prev - 1))}
            disabled={activeTab === 1}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 disabled:opacity-40"
          >
            Previous Tab
          </button>
          <button
            onClick={() => setActiveTab(prev => Math.min(TABS.length, prev + 1))}
            disabled={activeTab === TABS.length}
            className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-navy-950 font-bold text-xs"
          >
            Next Tab
          </button>
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-800 text-xs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-2 rounded-xl whitespace-nowrap font-bold transition-colors ${
              activeTab === tab.id
                ? 'bg-brand-500 text-navy-950 shadow'
                : 'bg-navy-900 text-slate-400 hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* Main Tab Panels Container */}
      <div className="p-6 sm:p-8 rounded-3xl bg-navy-900 border border-slate-800 space-y-6">
        {/* TAB 1: BASIC INFORMATION */}
        {activeTab === 1 && (
          <div className="space-y-4 text-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-800 pb-3">
              1. Basic Product Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-slate-400 mb-1 font-semibold">Product Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="e.g. Gigabyte X870 AORUS ELITE WIFI7"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-brand-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Product URL Slug *</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => handleChange('slug', e.target.value)}
                  placeholder="e.g. gigabyte-x870-aorus-elite-wifi7"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-cyan-300 font-mono text-xs focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">SKU (Stock Keeping Unit) *</label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => handleChange('sku', e.target.value)}
                  placeholder="e.g. GPU-MSI-5070-TRIO"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-brand-500 placeholder:text-slate-600"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Barcode / EAN</label>
                <input
                  type="text"
                  value={formData.barcode}
                  onChange={(e) => handleChange('barcode', e.target.value)}
                  placeholder="e.g. 4719072991021"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Model Number</label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => handleChange('model', e.target.value)}
                  placeholder="e.g. RTX 5070 GAMING TRIO"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Manufacturer Part Number (MPN)</label>
                <input
                  type="text"
                  value={formData.mpn}
                  onChange={(e) => handleChange('mpn', e.target.value)}
                  placeholder="e.g. 90MB1F00-M0EAY0"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Official Warranty</label>
                <input
                  type="text"
                  value={formData.warranty_period}
                  onChange={(e) => handleChange('warranty_period', e.target.value)}
                  placeholder="e.g. 3 Years Official Replacement Warranty"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Product Status / Stock Availability *</label>
                <select
                  value={formData.stock_status}
                  onChange={(e) => handleChange('stock_status', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-brand-300 font-bold text-xs focus:outline-none focus:border-brand-500"
                >
                  <option value="In Stock">In Stock</option>
                  <option value="Out Of Stock">Out Of Stock</option>
                  <option value="Pre-Order">Pre-Order</option>
                  <option value="Up Coming">Up Coming</option>
                  <option value="2-3 Days">2-3 Days</option>
                  <option value="Call for Price">Call for Price</option>
                </select>
              </div>

              <div className="sm:col-span-2 flex items-center gap-6 pt-2 flex-wrap">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => handleChange('is_featured', e.target.checked)}
                    className="rounded text-brand-500"
                  />
                  <span>⭐ Featured / Trending Hardware</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.is_hot}
                    onChange={(e) => handleChange('is_hot', e.target.checked)}
                    className="rounded text-rose-500"
                  />
                  <span>🔥 Hot Deal Badge</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.is_new}
                    onChange={(e) => handleChange('is_new', e.target.checked)}
                    className="rounded text-brand-500"
                  />
                  <span>✨ New Arrival Badge</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CATEGORY — 2-step picker */}
        {activeTab === 2 && (() => {
          const selectedParent = MEGA_CATEGORIES.find(c => c.slug === selectedParentSlug);
          const subItems = selectedParent
            ? selectedParent.columns
              ? selectedParent.columns.flat()
              : selectedParent.items || []
            : [];

          // Try to match selected category_id by slug against db categories
          const matchedCat = categories.find((c: any) => {
            if (!selectedParentSlug) return false;
            const sub = subItems.find((s: any) =>
              c.slug === s.slug || c.name.toLowerCase() === s.name.toLowerCase()
            );
            return sub && c.id === formData.category_id;
          });

          const filteredSubs = categorySearch.trim()
            ? subItems.filter((s: any) =>
                s.name.toLowerCase().includes(categorySearch.toLowerCase())
              )
            : subItems;

          return (
            <div className="space-y-5 text-xs">
              {/* Header */}
              <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                {selectedParentSlug && (
                  <button
                    type="button"
                    onClick={() => { setSelectedParentSlug(null); setCategorySearch(''); }}
                    className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                )}
                <div className="flex-1">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    2. Hardware Category
                    {selectedParent && (
                      <span className="text-slate-400 font-normal text-sm ml-2">
                        / <span className="text-brand-400">{selectedParent.name}</span>
                      </span>
                    )}
                  </h3>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    {!selectedParentSlug
                      ? 'Step 1 — Choose a product group'
                      : 'Step 2 — Choose a specific category'
                    }
                  </p>
                </div>
                {/* Search (only in step 2) */}
                {selectedParentSlug && (
                  <div className="relative w-48">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500 pointer-events-none" />
                    <input
                      type="text"
                      value={categorySearch}
                      onChange={e => setCategorySearch(e.target.value)}
                      placeholder="Filter..."
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-7 pr-7 py-1.5 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-brand-500 transition-colors"
                    />
                    {categorySearch && (
                      <button type="button" onClick={() => setCategorySearch('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* STEP 1 — Parent category cards */}
              {!selectedParentSlug && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {MEGA_CATEGORIES.map(parent => {
                    const subCount = parent.columns
                      ? parent.columns.flat().length
                      : (parent.items || []).length;
                    return (
                      <button
                        key={parent.slug}
                        type="button"
                        onClick={() => { setSelectedParentSlug(parent.slug); setCategorySearch(''); }}
                        className="p-4 rounded-2xl border border-slate-700 bg-slate-800/60 text-slate-300 hover:border-brand-500 hover:bg-brand-500/10 hover:text-brand-300 text-left transition-all group"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <LayoutGrid className="w-4 h-4 text-slate-500 group-hover:text-brand-400 transition-colors" />
                          <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-brand-400 transition-colors" />
                        </div>
                        <div className="font-bold text-xs">{parent.name}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{subCount} subcategories</div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* STEP 2 — Subcategory cards */}
              {selectedParentSlug && (
                <>
                  {filteredSubs.length === 0 ? (
                    <div className="text-center py-10 text-slate-500">
                      <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p className="font-semibold">No subcategories match &ldquo;{categorySearch}&rdquo;</p>
                      <button type="button" onClick={() => setCategorySearch('')}
                        className="mt-2 text-brand-400 hover:underline text-[11px]">Clear filter</button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {filteredSubs.map((sub: any) => {
                        // Match to db category by slug or name
                        const dbCat = categories.find((c: any) =>
                          c.slug === sub.slug || c.name?.toLowerCase() === sub.name?.toLowerCase()
                        ) as any;
                        const catId = dbCat?.id ?? null;
                        const isSelected = catId !== null && formData.category_id === catId;
                        const childCount = sub.children?.length ?? 0;

                        return (
                          <button
                            key={sub.slug}
                            type="button"
                            onClick={() => { if (catId !== null) handleChange('category_id', catId); }}
                            className={`p-4 rounded-2xl border text-left transition-all ${
                              isSelected
                                ? 'border-brand-500 bg-brand-500/10 text-brand-300'
                                : 'border-slate-700 bg-slate-800/60 text-slate-300 hover:border-slate-500 hover:bg-slate-800'
                            } ${catId === null ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <div className="font-bold text-xs mb-0.5">
                              {categorySearch.trim() ? (() => {
                                const q = categorySearch.toLowerCase();
                                const name = sub.name;
                                const idx = name.toLowerCase().indexOf(q);
                                if (idx === -1) return name;
                                return (<>
                                  {name.slice(0, idx)}
                                  <mark className="bg-brand-500/30 text-brand-200 rounded px-0.5">{name.slice(idx, idx + q.length)}</mark>
                                  {name.slice(idx + q.length)}
                                </>);
                              })() : sub.name}
                            </div>
                            {childCount > 0 && (
                              <div className="text-[10px] text-slate-500 mt-0.5">{childCount} child categories</div>
                            )}
                            {catId === null && (
                              <div className="text-[10px] text-amber-500 mt-0.5">Not in DB</div>
                            )}
                            {isSelected && (
                              <div className="text-[10px] text-brand-400 font-semibold flex items-center gap-1 mt-1">
                                <CheckCircle className="w-3 h-3" /> Selected
                              </div>
                            )}
                            {(() => {
                              const specTmpl = getCategorySpecTemplate(catId, sub.slug, sub.name);
                              const fieldCount = specTmpl ? specTmpl.sections.flatMap(s => s.fields).length : 0;
                              return fieldCount > 0 ? (
                                <div className="text-[10px] text-brand-400/80 mt-0.5">
                                  {fieldCount} official spec fields
                                </div>
                              ) : null;
                            })()}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </>
              )}

              {/* Confirmation bar */}
              {formData.category_id > 0 && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-brand-500/10 border border-brand-500/30 text-xs text-brand-300">
                  <CheckCircle className="w-4 h-4 text-brand-400 flex-shrink-0" />
                  <span>
                    {(() => {
                      const dbCat = categories.find((c: any) => c.id === formData.category_id) as any;
                      const tmpl = getCategorySpecTemplate(formData.category_id, dbCat?.slug, dbCat?.name);
                      const fieldCount = tmpl ? tmpl.sections.flatMap(s => s.fields).length : 0;
                      return (<>
                        Category: <strong>{dbCat?.name || formData.category_id}</strong>
                        {selectedParent && <> (in <strong>{selectedParent.name}</strong>)</>}
                        {fieldCount > 0 && (
                          <> &mdash; <strong>{fieldCount} official spec fields ({tmpl?.sections.length} sections)</strong> will load in Tab 7</>)}
                      </>);
                    })()}
                  </span>
                </div>
              )}
            </div>
          );
        })()}

        {/* TAB 3: BRAND */}
        {activeTab === 3 && (
          <div className="space-y-5 text-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-800 pb-3">
              3. Brand Partner Selection
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {(brands.length > 0 ? brands : [
                { id: 1, name: 'MSI', country: 'Taiwan' },
                { id: 2, name: 'ASUS', country: 'Taiwan' },
                { id: 3, name: 'Gigabyte', country: 'Taiwan' },
                { id: 4, name: 'Intel', country: 'USA' },
                { id: 5, name: 'AMD', country: 'USA' },
                { id: 6, name: 'Corsair', country: 'USA' },
                { id: 7, name: 'Samsung', country: 'South Korea' },
                { id: 8, name: 'WD', country: 'USA' },
                { id: 9, name: 'Kingston', country: 'USA' },
                { id: 10, name: 'G.Skill', country: 'Taiwan' },
              ]).map((b: any) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => handleChange('brand_id', b.id)}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    formData.brand_id === b.id
                      ? 'border-brand-500 bg-brand-500/10 text-brand-300'
                      : 'border-slate-700 bg-slate-800/60 text-slate-300 hover:border-slate-500 hover:bg-slate-800'
                  }`}
                >
                  <div className="font-bold text-xs">{b.name}</div>
                  {b.country && <div className="text-[10px] text-slate-500 mt-0.5">{b.country}</div>}
                  {formData.brand_id === b.id && (
                    <div className="text-[10px] text-brand-400 font-semibold flex items-center gap-1 mt-1">
                      <CheckCircle className="w-3 h-3" /> Selected
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/admin/brands"
                target="_blank"
                className="text-[11px] text-brand-400 hover:underline font-semibold flex items-center gap-1"
              >
                + Manage Brands in Admin
              </Link>
            </div>
          </div>
        )}

        {/* TAB 4: PRICING & COST MARGIN */}
        {activeTab === 4 && (
          <div className="space-y-4 text-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-800 pb-3">
              4. Product Pricing & Profit Accounting (Requirement 13)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Procurement / Purchase Cost (৳) *</label>
                <input
                  type="number"
                  value={formData.purchase_cost}
                  onChange={(e) => handleChange('purchase_cost', e.target.value)}
                  placeholder="e.g. 65000"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-brand-500 text-xs"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">Never exposed to public storefront</span>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Selling / Regular Price (৳) *</label>
                <input
                  type="number"
                  value={formData.selling_price}
                  onChange={(e) => handleChange('selling_price', e.target.value)}
                  placeholder="e.g. 78000"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-brand-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Special Discount Price (৳)</label>
                <input
                  type="number"
                  value={formData.discount_price}
                  onChange={(e) => handleChange('discount_price', e.target.value)}
                  placeholder="e.g. 74900 (Optional)"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-brand-500 text-xs"
                />
              </div>
            </div>

            {/* Live Profit Calculation Card */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 block font-semibold">Real-Time Profit per Unit Sold:</span>
                <span className="text-xl font-black text-emerald-400">৳{calculatedProfit.toLocaleString()}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block font-semibold">Gross Profit Margin:</span>
                <span className="text-xl font-black text-brand-400">+{calculatedMargin}%</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: MULTI-LOCATION INVENTORY */}
        {activeTab === 5 && (
          <div className="space-y-4 text-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-800 pb-3">
              5. Multi-Branch Location Stock (Requirement 14)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <label className="block text-slate-400 mb-1 font-semibold">Main Central Warehouse (Tejgaon)</label>
                <input
                  type="number"
                  value={formData.wh_stock}
                  onChange={(e) => handleChange('wh_stock', e.target.value)}
                  placeholder="e.g. 20"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-brand-500 text-xs"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <label className="block text-slate-400 mb-1 font-semibold">Shop 1 (Uttara Flagship)</label>
                <input
                  type="number"
                  value={formData.shop1_stock}
                  onChange={(e) => handleChange('shop1_stock', e.target.value)}
                  placeholder="e.g. 8"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-brand-500 text-xs"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <label className="block text-slate-400 mb-1 font-semibold">Shop 2 (Dhanmondi Branch)</label>
                <input
                  type="number"
                  value={formData.shop2_stock}
                  onChange={(e) => handleChange('shop2_stock', e.target.value)}
                  placeholder="e.g. 5"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-brand-500 text-xs"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <label className="block text-slate-400 mb-1 font-semibold">RMA Hub Testing Stock</label>
                <input
                  type="number"
                  value={formData.rma_stock}
                  onChange={(e) => handleChange('rma_stock', e.target.value)}
                  placeholder="e.g. 0"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-brand-500 text-xs"
                />
              </div>
            </div>
          </div>
        )}


        {/* TAB 6: IMAGES */}
        {activeTab === 6 && (
          <div className="space-y-6 text-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-800 pb-3 flex items-center gap-2">
              <Image className="w-4 h-4 text-sky-400" />
              6. Product Images &amp; Visual Assets
            </h3>

            {/* ── PRIMARY IMAGE ── */}
            <div className="rounded-2xl border border-slate-700 bg-slate-800/50 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-700 flex items-center gap-2">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span className="font-bold text-slate-200 text-xs uppercase tracking-wider">Primary Image</span>
                <span className="text-slate-500 text-[10px]">(shown on product cards &amp; listing)</span>
              </div>

              <div className="p-4 flex flex-col sm:flex-row gap-4">
                {/* Drop zone / preview */}
                <div
                  className="relative flex-shrink-0 w-40 h-40 rounded-xl border-2 border-dashed border-slate-600 hover:border-sky-500 bg-slate-900 flex items-center justify-center cursor-pointer overflow-hidden group transition-all"
                  onClick={() => !uploadingPrimary && primaryFileRef.current?.click()}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => {
                    e.preventDefault();
                    const f = e.dataTransfer.files[0];
                    if (f?.type.startsWith('image/')) handlePrimaryUpload(f);
                  }}
                >
                  {formData.primary_image ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={formData.primary_image} alt="Primary" className="w-full h-full object-contain" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                        {uploadingPrimary ? (
                          <Loader2 className="w-6 h-6 animate-spin text-white" />
                        ) : (
                          <>
                            <Upload className="w-5 h-5 text-white" />
                            <span className="text-white text-[10px] font-bold">Replace</span>
                          </>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-500">
                      {uploadingPrimary ? (
                        <Loader2 className="w-8 h-8 animate-spin text-sky-400" />
                      ) : (
                        <>
                          <Upload className="w-8 h-8" />
                          <span className="text-[10px] font-semibold text-center">Click or<br />drag & drop</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
                <input ref={primaryFileRef} type="file" accept="image/*" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handlePrimaryUpload(f); e.target.value = ''; }}
                />

                {/* URL input */}
                <div className="flex-1 flex flex-col justify-between gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1.5 font-semibold">Image URL</label>
                    <input
                      type="text"
                      value={formData.primary_image}
                      onChange={e => handleChange('primary_image', e.target.value)}
                      placeholder="https://... or /uploads/products/..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-sky-500 transition-colors text-xs"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => primaryFileRef.current?.click()}
                    disabled={uploadingPrimary}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-colors disabled:opacity-50 w-fit"
                  >
                    {uploadingPrimary ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    Upload from Computer
                  </button>
                </div>
              </div>
            </div>

            {/* ── GALLERY IMAGES ── */}
            <div className="rounded-2xl border border-slate-700 bg-slate-800/50 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Image className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-bold text-slate-200 text-xs uppercase tracking-wider">Gallery Images</span>
                  <span className="text-slate-500 text-[10px]">({additionalImages.length} added)</span>
                </div>
                <button
                  type="button"
                  onClick={() => galleryFileRef.current?.click()}
                  disabled={uploadingGallery}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-[11px] transition-colors disabled:opacity-50"
                >
                  {uploadingGallery ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                  Add Images
                </button>
              </div>
              <input ref={galleryFileRef} type="file" accept="image/*" multiple className="hidden"
                onChange={e => { if (e.target.files) handleGalleryUpload(e.target.files); e.target.value = ''; }}
              />

              <div className="p-4 space-y-4">
                {/* URL quick-add */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                    <input
                      type="text"
                      value={urlInput}
                      onChange={e => setUrlInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addUrlToGallery())}
                      placeholder="Paste image URL and press Enter or Add"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-3.5 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-sky-500 transition-colors text-xs"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addUrlToGallery}
                    className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-sky-600 text-white font-bold text-[11px] transition-colors"
                  >
                    Add
                  </button>
                </div>

                {/* Drag-and-drop zone for gallery */}
                <div
                  className="border-2 border-dashed border-slate-700 hover:border-sky-500/60 rounded-xl p-6 text-center cursor-pointer transition-colors"
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => { e.preventDefault(); if (e.dataTransfer.files) handleGalleryUpload(e.dataTransfer.files); }}
                  onClick={() => galleryFileRef.current?.click()}
                >
                  {uploadingGallery ? (
                    <div className="flex flex-col items-center gap-2 text-sky-400">
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span className="text-xs font-semibold">Uploading...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-500">
                      <Upload className="w-6 h-6" />
                      <span className="text-xs font-semibold">Drop multiple images here or click to browse</span>
                      <span className="text-[10px] text-slate-600">JPEG, PNG, WebP up to 8 MB each</span>
                    </div>
                  )}
                </div>

                {/* Gallery grid */}
                {additionalImages.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 mt-2">
                    {additionalImages.map((url, idx) => (
                      <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-700 bg-slate-900 aspect-square">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt={`Gallery ${idx + 1}`} className="w-full h-full object-contain" />

                        {/* Hover overlay with actions */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => promoteToPrimary(url)}
                            title="Set as Primary"
                            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-[10px] font-bold transition-colors"
                          >
                            <Star className="w-2.5 h-2.5 fill-black" />
                            Primary
                          </button>
                          <button
                            type="button"
                            onClick={() => removeGalleryImage(url)}
                            title="Remove"
                            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold transition-colors"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                            Remove
                          </button>
                        </div>

                        {/* Index badge */}
                        <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-black/70 text-white text-[9px] font-bold flex items-center justify-center">
                          {idx + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {additionalImages.length === 0 && (
                  <p className="text-center text-slate-600 text-[11px] py-2">No gallery images added yet.</p>
                )}
              </div>
            </div>

            {/* Summary */}
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800/60 border border-slate-700 text-xs text-slate-400">
              <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>
                <strong className="text-slate-200">{1 + additionalImages.length}</strong> image{1 + additionalImages.length !== 1 ? 's' : ''} total —
                <strong className="text-amber-400 ml-1">1 primary</strong> + <strong className="text-sky-400">{additionalImages.length} gallery</strong>.
                Hover any gallery image to set it as primary or remove it.
              </span>
            </div>
          </div>
        )}

        {/* TAB 7: DYNAMIC OFFICIAL SPECIFICATIONS */}
        {activeTab === 7 && (() => {
          const catId = formData.category_id;
          const dbCat = categories.find((c: any) => c.id === catId) as any;
          const template = getCategorySpecTemplate(catId, dbCat?.slug, dbCat?.name);
          const catName = dbCat?.name || template?.categoryName || 'Hardware Component';

          // Flatten fields for count & search
          const allTemplateFields: SpecField[] = template
            ? template.sections.flatMap(sec => sec.fields)
            : [];
          const filledTemplateCount = allTemplateFields.filter(f => specs[f.key]?.trim()).length;
          const filledCustomCount = customSpecs.filter(cs => cs.label?.trim() && cs.value?.trim()).length;
          const totalFilledCount = filledTemplateCount + filledCustomCount;
          const totalTemplateCount = allTemplateFields.length;

          const loadPresetHandler = () => {
            if (template?.preset) {
              setSpecs(prev => ({ ...prev, ...template.preset }));
            }
          };

          const clearAllSpecsHandler = () => {
            if (confirm('Clear all specification values?')) {
              setSpecs({});
              setCustomSpecs([]);
            }
          };

          return (
            <div className="space-y-6 text-xs">
              {/* Header & Action Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-brand-400" />
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      7. Technical Specifications &mdash; <span className="text-brand-400">{catName}</span>
                    </h3>
                  </div>
                  <p className="text-slate-400 text-[11px] mt-1">
                    Official manufacturer specification standard (Gigabyte, MSI, ASUS, AMD, Intel).
                  </p>
                </div>

                <div className="flex items-center flex-wrap gap-2">
                  {template?.preset && (
                    <button
                      type="button"
                      onClick={loadPresetHandler}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-[11px] flex items-center gap-1.5 shadow-sm transition-all"
                      title="Autofill standard official specs preset"
                    >
                      <Sparkles className="w-3.5 h-3.5 fill-black" />
                      <span>⚡ Load Official Preset</span>
                    </button>
                  )}

                  {totalFilledCount > 0 && (
                    <button
                      type="button"
                      onClick={clearAllSpecsHandler}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 font-semibold text-[11px] transition-colors"
                    >
                      Clear
                    </button>
                  )}

                  {/* Completion badge */}
                  <span className={`px-2.5 py-1 rounded-full font-bold text-[11px] border ${
                    totalFilledCount > 0
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    {totalFilledCount} {totalTemplateCount > 0 ? `/ ${totalTemplateCount}` : ''} Filled
                  </span>
                </div>
              </div>

              {/* Spec Quick Search / Filter Bar */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                <input
                  type="text"
                  value={specSearch}
                  onChange={e => setSpecSearch(e.target.value)}
                  placeholder={`Search any specification field (e.g. socket, memory, usb, pcie, vrm, displayport)...`}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-8 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-500 transition-colors text-xs"
                />
                {specSearch && (
                  <button
                    type="button"
                    onClick={() => setSpecSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {!template ? (
                <div className="text-center py-12 rounded-2xl border border-dashed border-slate-700 bg-slate-900/50">
                  <div className="text-3xl mb-2">⚙️</div>
                  <p className="font-bold text-slate-300">Custom Category Specifications</p>
                  <p className="text-slate-500 text-[11px] mt-1 max-w-md mx-auto">
                    Select a hardware category in Tab 2 or add custom key-value specification attributes below.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {template.sections.map((section, sIdx) => {
                    const q = specSearch.toLowerCase().trim();
                    const filteredFields = q
                      ? section.fields.filter(
                          f =>
                            f.label.toLowerCase().includes(q) ||
                            f.key.toLowerCase().includes(q) ||
                            (f.placeholder && f.placeholder.toLowerCase().includes(q)) ||
                            section.title.toLowerCase().includes(q)
                        )
                      : section.fields;

                    if (q && filteredFields.length === 0) return null;

                    const sectionFilledCount = section.fields.filter(f => specs[f.key]?.trim()).length;

                    return (
                      <div
                        key={sIdx}
                        className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xs"
                      >
                        {/* Section Header */}
                        <div className="px-5 py-3.5 bg-slate-800/50 border-b border-slate-800 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-brand-400"></div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                              {section.title}
                            </h4>
                          </div>
                          <span className="text-[10px] text-slate-400 font-semibold px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700">
                            {sectionFilledCount} / {section.fields.length} filled
                          </span>
                        </div>

                        {/* Section Input Fields */}
                        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                          {filteredFields.map(field => {
                            const val = specs[field.key] || '';
                            const isFilled = Boolean(val.trim());

                            return (
                              <div
                                key={field.key}
                                className={`space-y-1.5 p-3 rounded-xl transition-colors ${
                                  isFilled ? 'bg-slate-800/40 border border-brand-500/20' : 'bg-transparent'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <label className="text-slate-300 font-semibold flex items-center gap-1 text-[11px]">
                                    <span>{field.label}</span>
                                    {field.required && <span className="text-rose-400">*</span>}
                                  </label>
                                  {isFilled && (
                                    <CheckCircle className="w-3 h-3 text-emerald-400" />
                                  )}
                                </div>

                                <textarea
                                  rows={field.placeholder && field.placeholder.length > 50 ? 2 : 1}
                                  value={val}
                                  onChange={e => handleSpecChange(field.key, e.target.value)}
                                  placeholder={field.placeholder || `Enter ${field.label}...`}
                                  className="w-full bg-slate-950/70 border border-slate-700 focus:border-brand-500 rounded-xl px-3 py-2 text-white placeholder:text-slate-600 focus:outline-none transition-colors text-xs resize-y"
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ── CUSTOM SPECIFICATION ATTRIBUTES ── */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-2">
                      <Plus className="w-3.5 h-3.5 text-brand-400" />
                      <span>Custom Specification Attributes</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Add any extra manufacturer-specific specifications not covered in the template.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addCustomSpecRow}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-brand-300 hover:text-white font-bold text-[11px] flex items-center gap-1.5 border border-slate-700 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Custom Field</span>
                  </button>
                </div>

                {customSpecs.length > 0 && (
                  <div className="space-y-2.5 pt-2">
                    {customSpecs.map(cs => (
                      <div key={cs.id} className="flex items-center gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                        <input
                          type="text"
                          value={cs.label}
                          onChange={e => updateCustomSpec(cs.id, 'label', e.target.value)}
                          placeholder="Attribute Label (e.g. RGB Sync Software)"
                          className="w-1/3 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-500 text-xs"
                        />
                        <input
                          type="text"
                          value={cs.value}
                          onChange={e => updateCustomSpec(cs.id, 'value', e.target.value)}
                          placeholder="Attribute Value (e.g. GIGABYTE RGB Fusion 2.0)"
                          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-500 text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => removeCustomSpec(cs.id)}
                          className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-400 hover:text-red-200 transition-colors"
                          title="Remove custom field"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ── LIVE FILLED SPECIFICATIONS PREVIEW ── */}
              {totalFilledCount > 0 && (
                <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-brand-400" />
                      <span>Live Storefront Specifications Preview ({totalFilledCount} specs)</span>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <tbody className="divide-y divide-slate-800/60">
                        {allTemplateFields
                          .filter(f => specs[f.key]?.trim())
                          .map(f => (
                            <tr key={f.key} className="hover:bg-slate-800/30">
                              <td className="py-2.5 px-3 font-semibold text-slate-400 w-1/3 bg-slate-950/40">
                                {f.label}
                                <span className="text-[10px] text-slate-600 block">{f.section}</span>
                              </td>
                              <td className="py-2.5 px-3 font-medium text-slate-100 whitespace-pre-line">
                                {specs[f.key]}
                              </td>
                            </tr>
                          ))}
                        {customSpecs
                          .filter(cs => cs.label?.trim() && cs.value?.trim())
                          .map(cs => (
                            <tr key={cs.id} className="hover:bg-slate-800/30">
                              <td className="py-2.5 px-3 font-semibold text-brand-400 w-1/3 bg-slate-950/40">
                                {cs.label}
                                <span className="text-[10px] text-slate-600 block">Custom</span>
                              </td>
                              <td className="py-2.5 px-3 font-medium text-slate-100 whitespace-pre-line">
                                {cs.value}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* TAB 8: FEATURES */}
        {activeTab === 8 && (
          <div className="space-y-4 text-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-800 pb-3">
              8. Key Feature Highlights (Bullet Points)
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Highlight Feature 1</label>
                <input
                  type="text"
                  value={formData.feature1}
                  onChange={(e) => handleChange('feature1', e.target.value)}
                  placeholder="e.g. Next-Gen Blackwell Architecture with DLSS 4 Support"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Highlight Feature 2</label>
                <input
                  type="text"
                  value={formData.feature2}
                  onChange={(e) => handleChange('feature2', e.target.value)}
                  placeholder="e.g. TRI FROZR 3 Thermal Design with TORX Fan 5.0"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Highlight Feature 3</label>
                <input
                  type="text"
                  value={formData.feature3}
                  onChange={(e) => handleChange('feature3', e.target.value)}
                  placeholder="e.g. Solid Nickel-Plated Copper Baseplate and Precision Heatpipes"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-500 text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 9: DESCRIPTION */}
        {activeTab === 9 && (
          <div className="space-y-4 text-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-800 pb-3">
              9. Structured Dynamic Product Overview (Requirement 9)
            </h3>

            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Detailed Product Overview</label>
              <textarea
                rows={5}
                value={formData.overview}
                onChange={(e) => handleChange('overview', e.target.value)}
                placeholder="Write detailed product overview, technical highlights, performance benchmarks, and key advantages for your customers..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-500 text-xs"
              />
            </div>
          </div>
        )}

        {/* TAB 10: SEO & GOOGLE PREVIEW */}
        {activeTab === 10 && (
          <div className="space-y-5 text-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-800 pb-3">
              10. Product SEO & Google Search Snippet Preview (Requirement 15)
            </h3>

            {/* Google Search Result Preview Card */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">
                Google SERP Snippet Preview
              </span>
              <div className="text-cyan-400 text-sm font-semibold truncate hover:underline cursor-pointer">
                {formData.meta_title || formData.name || 'Product Title Price in BD | CORENIX'}
              </div>
              <div className="text-[11px] text-emerald-400 truncate">
                https://corenix.com.bd/product/{formData.slug || 'product-url-slug'}
              </div>
              <p className="text-slate-400 text-xs line-clamp-2">
                {formData.meta_desc || 'Buy official hardware in Bangladesh with manufacturer warranty from CORENIX. Check specifications, reviews, and multi-branch live stock.'}
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Custom Meta Title</label>
                <input
                  type="text"
                  value={formData.meta_title}
                  onChange={(e) => handleChange('meta_title', e.target.value)}
                  placeholder="e.g. MSI GeForce RTX 5070 Gaming Trio 12GB Price in BD | CORENIX"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Custom Meta Description</label>
                <textarea
                  rows={2}
                  value={formData.meta_desc}
                  onChange={(e) => handleChange('meta_desc', e.target.value)}
                  placeholder="e.g. Buy MSI RTX 5070 Gaming Trio 12GB Graphics Card in Bangladesh with 3 years warranty from CORENIX. Check benchmarks, specs and live branch stock."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Focus Keyword</label>
                <input
                  type="text"
                  value={formData.focus_keyword}
                  onChange={(e) => handleChange('focus_keyword', e.target.value)}
                  placeholder="e.g. msi rtx 5070 gaming trio"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-500 text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 11: PC BUILDER */}
        {activeTab === 11 && (
          <div className="space-y-4 text-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-800 pb-3">
              11. PC Builder Engine Integration (Requirement 23)
            </h3>

            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={formData.is_pc_builder}
                  onChange={(e) => handleChange('is_pc_builder', e.target.checked)}
                  className="rounded text-brand-500"
                />
                <span className="font-bold text-slate-900 dark:text-white">Enable this product in PC Builder</span>
              </label>

              {formData.is_pc_builder && (
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Component Slot</label>
                  <select
                    value={formData.pc_builder_component}
                    onChange={(e) => handleChange('pc_builder_component', e.target.value)}
                    className="w-full max-w-xs bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white"
                  >
                    <option value="cpu">Processor (CPU)</option>
                    <option value="motherboard">Motherboard</option>
                    <option value="gpu">Graphics Card (GPU)</option>
                    <option value="ram">RAM</option>
                    <option value="storage">Storage (SSD)</option>
                    <option value="psu">Power Supply</option>
                    <option value="case">PC Case</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 12: PUBLISH */}
        {activeTab === 12 && (
          <div className="space-y-6 text-center py-6">
            <div className="w-16 h-16 rounded-full bg-cyan-950 border border-brand-500/40 text-brand-400 mx-auto flex items-center justify-center">
              <Sparkles className="w-8 h-8" />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Ready to Publish Hardware?</h2>
              <p className="text-xs text-slate-400">
                The product will immediately be indexed in search, published to the category & brand pages, and added to the sitemap.
              </p>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-8 py-3.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-navy-950 font-black text-sm shadow-xl shadow-cyan-500/20 transition-all hover:scale-105 disabled:opacity-50"
            >
              {isSubmitting ? 'Publishing Hardware...' : 'Publish Product to Live Catalogue'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
