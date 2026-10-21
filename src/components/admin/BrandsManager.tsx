'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  ExternalLink,
  Globe,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Tag,
  Loader2,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';

export interface BrandItem {
  id: number;
  name: string;
  slug: string;
  logo?: string | null;
  banner?: string | null;
  description?: string | null;
  short_desc?: string | null;
  country?: string | null;
  website?: string | null;
  is_featured: number | boolean;
  is_active: number | boolean;
  meta_title?: string | null;
  meta_desc?: string | null;
  product_count: number;
}

interface Props {
  initialBrands: BrandItem[];
}

export default function BrandsManager({ initialBrands }: Props) {
  const [brands, setBrands] = useState<BrandItem[]>(initialBrands);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'featured' | 'has_products'>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<BrandItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Delete Confirm Modal
  const [brandToDelete, setBrandToDelete] = useState<BrandItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formCountry, setFormCountry] = useState('Global');
  const [formWebsite, setFormWebsite] = useState('');
  const [formLogo, setFormLogo] = useState('');
  const [formShortDesc, setFormShortDesc] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [formMetaTitle, setFormMetaTitle] = useState('');
  const [formMetaDesc, setFormMetaDesc] = useState('');
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const logoFileRef = useRef<HTMLInputElement>(null);

  // Upload logo directly
  const handleLogoUpload = async (file: File) => {
    setIsUploadingLogo(true);
    setErrorMsg(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'brands');

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: fd,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload logo');
      }

      setFormLogo(data.url);
      showToast('Brand logo uploaded successfully!');
    } catch (err: any) {
      setErrorMsg('Logo upload failed: ' + err.message);
    } finally {
      setIsUploadingLogo(false);
    }
  };

  // Handle Name Input -> Auto-slugify if user hasn't explicitly customized slug
  const handleNameChange = (val: string) => {
    setFormName(val);
    if (!editingBrand) {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setFormSlug(generatedSlug);
    }
  };

  const openAddModal = () => {
    setEditingBrand(null);
    setFormName('');
    setFormSlug('');
    setFormCountry('Global');
    setFormWebsite('');
    setFormLogo('');
    setFormShortDesc('');
    setFormDescription('');
    setFormIsFeatured(false);
    setFormMetaTitle('');
    setFormMetaDesc('');
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const openEditModal = (b: BrandItem) => {
    setEditingBrand(b);
    setFormName(b.name);
    setFormSlug(b.slug);
    setFormCountry(b.country || 'Global');
    setFormWebsite(b.website || '');
    setFormLogo(b.logo || '');
    setFormShortDesc(b.short_desc || '');
    setFormDescription(b.description || '');
    setFormIsFeatured(Boolean(b.is_featured));
    setFormMetaTitle(b.meta_title || '');
    setFormMetaDesc(b.meta_desc || '');
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBrand(null);
    setErrorMsg(null);
  };

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => {
      setSuccessToast(null);
    }, 4000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setErrorMsg('Brand Name is required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const payload = {
      name: formName.trim(),
      slug: formSlug.trim(),
      country: formCountry.trim() || 'Global',
      website: formWebsite.trim() || null,
      logo: formLogo.trim() || null,
      short_desc: formShortDesc.trim() || '',
      description: formDescription.trim() || '',
      is_featured: formIsFeatured,
      meta_title: formMetaTitle.trim() || `${formName.trim()} in Bangladesh | Official CORENIX Store`,
      meta_desc: formMetaDesc.trim() || `Authentic ${formName.trim()} products available at CORENIX Bangladesh with official manufacturer warranty.`,
    };

    try {
      if (editingBrand) {
        // PUT request
        const res = await fetch('/api/brands', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, id: editingBrand.id }),
        });
        const data = await res.json();
        if (!res.ok) {
          setErrorMsg(data.error || 'Failed to update brand.');
          setIsSubmitting(false);
          return;
        }

        // Update local state
        setBrands((prev) =>
          prev.map((b) => (b.id === editingBrand.id ? { ...b, ...data.brand } : b))
        );
        showToast(`Brand "${payload.name}" updated successfully!`);
      } else {
        // POST request
        const res = await fetch('/api/brands', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) {
          setErrorMsg(data.error || 'Failed to create brand.');
          setIsSubmitting(false);
          return;
        }

        // Add to local state at top
        setBrands((prev) => [data.brand, ...prev]);
        showToast(`Brand "${payload.name}" added successfully!`);
      }

      closeModal();
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!brandToDelete) return;
    setIsDeleting(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/brands?id=${brandToDelete.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to delete brand.');
        setIsDeleting(false);
        return;
      }

      setBrands((prev) => prev.filter((b) => b.id !== brandToDelete.id));
      showToast(`Brand "${brandToDelete.name}" deleted.`);
      setBrandToDelete(null);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete brand.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered brands
  const filteredBrands = brands.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.country && b.country.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (filterType === 'featured') return Boolean(b.is_featured);
    if (filterType === 'has_products') return b.product_count > 0;
    return true;
  });

  return (
    <div className="space-y-5 text-slate-800 dark:text-slate-100">
      {/* Toast Alert */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-navy-950 font-bold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-5 h-5 text-navy-950" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Top Banner Row */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
            Brand Partners & Vendors
          </span>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Brand Management ({brands.length})
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Manage partner logos, warranty origins, dedicated brand landing pages, and SEO metadata.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-xl bg-brand-400 hover:bg-brand-500 text-white dark:text-navy-950 font-bold text-xs flex items-center gap-2 shadow-md shadow-brand-400/20 hover:shadow-brand-500/25 transition-all cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Brand</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-3 shadow-sm">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search brand by name, country or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 text-xs flex-wrap">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${
              filterType === 'all'
                ? 'bg-brand-100 text-brand-700 dark:bg-brand-400 dark:text-navy-950 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All ({brands.length})
          </button>
          <button
            onClick={() => setFilterType('featured')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${
              filterType === 'featured'
                ? 'bg-brand-100 text-brand-700 dark:bg-brand-400 dark:text-navy-950 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Featured ({brands.filter((b) => b.is_featured).length})
          </button>
          <button
            onClick={() => setFilterType('has_products')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${
              filterType === 'has_products'
                ? 'bg-brand-100 text-brand-700 dark:bg-brand-400 dark:text-navy-950 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Has Products ({brands.filter((b) => b.product_count > 0).length})
          </button>
        </div>
      </div>

      {/* Brands Table */}
      <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-3 sm:px-4">Brand</th>
                <th className="py-3 px-3 sm:px-4">Origin Country</th>
                <th className="py-3 px-3 sm:px-4">Official Page</th>
                <th className="py-3 px-3 sm:px-4 text-center">Products</th>
                <th className="py-3 px-3 sm:px-4 text-center">Partner Status</th>
                <th className="py-3 px-3 sm:px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
              {filteredBrands.length > 0 ? (
                filteredBrands.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group">
                    <td className="py-3.5 px-3 sm:px-4 font-bold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-brand-500 dark:text-brand-400 text-xs flex-shrink-0 border border-slate-200 dark:border-slate-700/60 overflow-hidden p-1">
                          {b.logo ? (
                            <img src={b.logo} alt={b.name} className="w-full h-full object-contain" />
                          ) : (
                            b.name.slice(0, 2).toUpperCase()
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-300 transition-colors">
                            {b.name}
                          </div>
                          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                            /brand/{b.slug}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 sm:px-4 text-slate-600 dark:text-slate-300">
                      <span className="inline-flex items-center gap-1">
                        <Globe className="w-3.5 h-3.5 text-slate-500" />
                        <span>{b.country || 'Global'}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-3 sm:px-4">
                      {b.website ? (
                        <a
                          href={b.website}
                          target="_blank"
                          rel="noreferrer"
                          className="text-cyan-400 hover:underline flex items-center gap-1 truncate max-w-[180px]"
                        >
                          <span className="truncate">{b.website.replace(/^https?:\/\//, '')}</span>
                          <ExternalLink className="w-3 h-3 flex-shrink-0" />
                        </a>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 sm:px-4 text-center font-bold text-slate-700 dark:text-slate-200">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {b.product_count}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 sm:px-4 text-center">
                      {b.is_featured ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 text-brand-300 border border-brand-800 text-[10px] font-bold inline-flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-brand-400" />
                          <span>Featured</span>
                        </span>
                      ) : (
                        <span className="text-slate-500 dark:text-slate-500 text-[10px]">Standard</span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 sm:px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(b)}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                          title="Edit Brand details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <Link
                          href={`/brand/${b.slug}`}
                          target="_blank"
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300 transition-colors"
                          title="View customer-facing storefront brand page"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => {
                            setErrorMsg(null);
                            setBrandToDelete(b);
                          }}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                          title="Delete Brand"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No brands found matching your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================================== */}
      {/* ADD / EDIT BRAND MODAL                                   */}
      {/* ======================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-700/80 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-400">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {editingBrand ? `Edit Brand: ${editingBrand.name}` : 'Add New Brand Partner'}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {editingBrand
                      ? 'Update partner details, origin, and landing page settings.'
                      : 'Create a new manufacturer brand to link with products and hardware.'}
                  </p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800/80 text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Brand Name */}
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Brand Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Thermalright, Razer, Corsair"
                    value={formName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. thermalright"
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white placeholder-slate-400 font-mono focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Public URL: /brand/{formSlug || '...'}
                  </span>
                </div>

                {/* Origin Country */}
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Country of Origin
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Taiwan, USA, Germany, Japan"
                    value={formCountry}
                    onChange={(e) => setFormCountry(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>

                {/* Official Website */}
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Official Website URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://www.brand.com"
                    value={formWebsite}
                    onChange={(e) => setFormWebsite(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
              </div>

              {/* Brand Logo Upload & Preview */}
              <div className="space-y-2 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-brand-400" />
                    <span>Brand Logo (SVG, PNG, WebP, JPG)</span>
                  </label>
                  {formLogo && (
                    <button
                      type="button"
                      onClick={() => setFormLogo('')}
                      className="text-[11px] text-rose-400 hover:text-rose-300 font-bold"
                    >
                      Remove Logo
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                  {/* Live Logo Preview Box (Styled exactly like storefront ecosystem card) */}
                  <div className="sm:col-span-4 h-20 rounded-xl bg-white dark:bg-navy-950 border border-slate-200 dark:border-slate-700 flex items-center justify-center p-3 shadow-inner relative overflow-hidden group">
                    {formLogo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={formLogo}
                        alt="Logo preview"
                        className="max-h-12 max-w-full object-contain"
                      />
                    ) : (
                      <div className="text-center text-slate-500 text-[11px] font-medium flex flex-col items-center gap-1">
                        <ImageIcon className="w-5 h-5 opacity-40" />
                        <span>No Logo Uploaded</span>
                      </div>
                    )}
                  </div>

                  {/* Upload Actions */}
                  <div className="sm:col-span-8 space-y-2">
                    <input
                      ref={logoFileRef}
                      type="file"
                      accept="image/png, image/jpeg, image/webp, image/svg+xml"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleLogoUpload(file);
                          e.target.value = '';
                        }
                      }}
                    />

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => !isUploadingLogo && logoFileRef.current?.click()}
                        disabled={isUploadingLogo}
                        className="px-3.5 py-2 rounded-xl bg-brand-400 hover:bg-brand-500 text-white dark:text-navy-950 font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-brand-400/20 transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {isUploadingLogo ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Upload className="w-3.5 h-3.5" />
                        )}
                        <span>{isUploadingLogo ? 'Uploading...' : 'Upload Logo File'}</span>
                      </button>

                      <span className="text-[11px] text-slate-400">or paste image URL below</span>
                    </div>

                    <input
                      type="text"
                      placeholder="e.g. /uploads/brands/brand.svg or https://..."
                      value={formLogo}
                      onChange={(e) => setFormLogo(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-brand-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Tagline / Short Desc */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Tagline / Short Summary
                </label>
                <input
                  type="text"
                  placeholder="e.g. Low Temperature High Performance Cooling"
                  value={formShortDesc}
                  onChange={(e) => setFormShortDesc(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Brand Description / About
                </label>
                <textarea
                  rows={2}
                  placeholder="About the brand, its engineering heritage, and warranty policy..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              {/* Featured Partner Toggle */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                    <span>Featured Partner</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Pin brand to the storefront homepage, brand carousel, and top filters.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formIsFeatured}
                  onChange={(e) => setFormIsFeatured(e.target.checked)}
                  className="w-4 h-4 rounded text-brand-500 focus:ring-brand-500 border-slate-700 cursor-pointer"
                />
              </div>

              {/* SEO Meta Fields */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-400 block">
                  SEO Metadata (Auto-generated if left blank)
                </span>
                <div>
                  <label className="block text-slate-400 text-[11px] mb-1">Meta Title</label>
                  <input
                    type="text"
                    placeholder={`${formName || 'Brand'} Price in Bangladesh | Official CORENIX`}
                    value={formMetaTitle}
                    onChange={(e) => setFormMetaTitle(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-slate-900 dark:text-white placeholder-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[11px] mb-1">Meta Description</label>
                  <textarea
                    rows={2}
                    placeholder={`Buy genuine ${formName || 'Brand'} products in Bangladesh with official manufacturer warranty.`}
                    value={formMetaDesc}
                    onChange={(e) => setFormMetaDesc(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-slate-900 dark:text-white placeholder-slate-400"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-brand-400 hover:bg-brand-500 text-white dark:text-navy-950 font-bold flex items-center gap-1.5 shadow-sm shadow-brand-400/20 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingBrand ? 'Save Changes' : 'Create Brand'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* DELETE CONFIRMATION MODAL                                */}
      {/* ======================================================== */}
      {brandToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-950 border border-rose-800 flex items-center justify-center text-rose-400 flex-shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Delete Brand: {brandToDelete.name}?
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Are you sure you want to remove this brand? This action cannot be undone.
                </p>
              </div>
            </div>

            {brandToDelete.product_count > 0 && (
              <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-800 text-amber-300 text-xs">
                Warning: This brand currently has <strong>{brandToDelete.product_count}</strong> product(s) linked to it. You must reassign or remove those products before deleting this brand.
              </div>
            )}

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-950 border border-rose-800 text-rose-300 text-xs">
                {errorMsg}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setBrandToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? 'Deleting...' : 'Delete Brand'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
