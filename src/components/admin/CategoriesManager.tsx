'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  ExternalLink,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
  Layers,
  FolderTree,
  Loader2,
  Star,
} from 'lucide-react';

export interface CategoryItem {
  id: number;
  parent_id: number | null;
  name: string;
  slug: string;
  image?: string | null;
  link_url?: string | null;
  h1?: string | null;
  short_desc?: string | null;
  long_desc?: string | null;
  meta_title?: string | null;
  meta_desc?: string | null;
  focus_keyword?: string | null;
  is_active: number | boolean;
  is_featured: number | boolean;
  order_index?: number;
  parent_name?: string | null;
  product_count: number;
}

interface Props {
  initialCategories: CategoryItem[];
}

export default function CategoriesManager({ initialCategories }: Props) {
  const [categories, setCategories] = useState<CategoryItem[]>(initialCategories);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterParent, setFilterParent] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<CategoryItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Delete Modal
  const [catToDelete, setCatToDelete] = useState<CategoryItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formLinkUrl, setFormLinkUrl] = useState('');
  const [formParentId, setFormParentId] = useState<string>('');
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Auto-slugify as name changes
  const handleNameChange = (val: string) => {
    setFormName(val);
    if (!editingCat) {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setFormSlug(generatedSlug);
    }
  };

  const openAddModal = () => {
    setEditingCat(null);
    setFormName('');
    setFormSlug('');
    setFormImage('');
    setFormLinkUrl('');
    setFormParentId('');
    setFormIsFeatured(false);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const openEditModal = (c: CategoryItem) => {
    setEditingCat(c);
    setFormName(c.name);
    setFormSlug(c.slug);
    setFormImage(c.image || '');
    setFormLinkUrl(c.link_url || `/category/${c.slug}`);
    setFormParentId(c.parent_id ? String(c.parent_id) : '');
    setFormIsFeatured(Boolean(c.is_featured));
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCat(null);
    setErrorMsg(null);
  };

  const handleImageUpload = async (file: File) => {
    setIsUploadingImage(true);
    setErrorMsg(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'categories');
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || 'Failed to upload category image.');
      }
      setFormImage(data.url);
    } catch (error: any) {
      setErrorMsg(error.message || 'Failed to upload category image.');
    } finally {
      setIsUploadingImage(false);
    }
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
      setErrorMsg('Category Name is required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const payload = {
      name: formName.trim(),
      slug: formSlug.trim(),
      image: formImage.trim(),
      link_url: formLinkUrl.trim() || `/category/${formSlug.trim()}`,
      parent_id: formParentId ? parseInt(formParentId) : null,
      is_featured: formIsFeatured,
    };

    try {
      if (editingCat) {
        const res = await fetch('/api/categories', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, id: editingCat.id }),
        });
        const data = await res.json();
        if (!res.ok) {
          setErrorMsg(data.error || 'Failed to update category.');
          setIsSubmitting(false);
          return;
        }

        setCategories((prev) =>
          prev.map((c) => (c.id === editingCat.id ? { ...c, ...data.category } : c))
        );
        showToast(`Category "${payload.name}" updated successfully!`);
      } else {
        const res = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) {
          setErrorMsg(data.error || 'Failed to create category.');
          setIsSubmitting(false);
          return;
        }

        setCategories((prev) => [data.category, ...prev]);
        showToast(`Category "${payload.name}" created successfully!`);
      }

      closeModal();
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!catToDelete) return;
    setIsDeleting(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/categories?id=${catToDelete.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to delete category.');
        setIsDeleting(false);
        return;
      }

      setCategories((prev) => prev.filter((c) => c.id !== catToDelete.id));
      showToast(`Category "${catToDelete.name}" deleted.`);
      setCatToDelete(null);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete category.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Top level categories for parent dropdown
  const rootCategories = categories.filter((c) => !c.parent_id);

  // Filtered categories
  const filteredCategories = categories.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.parent_name && c.parent_name.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (filterParent === 'root_only') return !c.parent_id;
    if (filterParent === 'sub_only') return Boolean(c.parent_id);
    if (filterParent !== 'all') return String(c.parent_id) === filterParent;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-white dark:text-navy-950 font-bold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-5 h-5" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Top Banner Row */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-brand-400">
            Hierarchy & Navigation
          </span>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Category Management ({categories.length})
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
            Dynamic category tree, multi-tier mega navigation, SEO metadata, and category-based attribute templates.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 dark:bg-brand-500 dark:hover:bg-brand-400 text-white dark:text-navy-950 font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between flex-wrap gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search category by name, parent, or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 dark:focus:border-brand-500"
          />
        </div>

        {/* Parent Filter Dropdown */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-semibold hidden sm:inline">Filter:</span>
          <select
            value={filterParent}
            onChange={(e) => setFilterParent(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
          >
            <option value="all">All Categories ({categories.length})</option>
            <option value="root_only">Top-Level Root Only ({rootCategories.length})</option>
            <option value="sub_only">Subcategories Only ({categories.length - rootCategories.length})</option>
            <optgroup label="Under Specific Parent">
              {rootCategories.map((r) => (
                <option key={r.id} value={String(r.id)}>
                  Under {r.name}
                </option>
              ))}
            </optgroup>
          </select>
        </div>
      </div>

      {/* Categories Table */}
      <div className="p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Category Name</th>
                <th className="py-3 px-4">Parent Level</th>
                <th className="py-3 px-4">URL Slug</th>
                <th className="py-3 px-4 text-center">Products</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredCategories.length > 0 ? (
                filteredCategories.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group">
                    {/* Category Name (HIGH CONTRAST: text-slate-900 in light mode, text-white in dark mode) */}
                    <td className="py-3.5 px-4 font-bold">
                      {c.parent_id ? (
                        <div className="flex items-center gap-2 pl-3">
                          <span className="text-slate-400 font-mono text-sm leading-none">↳</span>
                          <span className="text-slate-900 dark:text-white text-sm font-semibold group-hover:text-sky-600 dark:group-hover:text-brand-300 transition-colors">
                              {c.is_featured ? <Star className="inline w-3.5 h-3.5 mr-1 text-amber-400 fill-current" /> : null}
                              {c.name}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-sky-500 dark:bg-brand-400 flex-shrink-0" />
                          <span className="text-slate-900 dark:text-white text-sm font-black group-hover:text-sky-600 dark:group-hover:text-brand-300 transition-colors">
                              {c.is_featured ? <Star className="inline w-3.5 h-3.5 mr-1 text-amber-400 fill-current" /> : null}
                              {c.name}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Parent Level */}
                    <td className="py-3.5 px-4">
                      {c.parent_name ? (
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[11px] border border-slate-200 dark:border-slate-700/60">
                          {c.parent_name}
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-cyan-950 text-sky-700 dark:text-brand-300 font-bold text-[11px] border border-sky-200 dark:border-brand-800/60">
                          Top Level Root
                        </span>
                      )}
                    </td>

                    {/* URL Slug */}
                    <td className="py-3.5 px-4 font-mono text-sky-600 dark:text-cyan-400 text-[11.5px]">
                      /category/{c.slug}
                    </td>

                    {/* Product Count */}
                    <td className="py-3.5 px-4 text-center font-bold text-slate-800 dark:text-slate-200">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {c.product_count}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold">
                        Active
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(c)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                          title="Edit Category"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <Link
                          href={`/category/${c.slug}`}
                          target="_blank"
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-sky-600 dark:text-cyan-400 hover:text-sky-700 transition-colors"
                          title="View public category page"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => {
                            setErrorMsg(null);
                            setCatToDelete(c);
                          }}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 dark:bg-slate-800 dark:hover:bg-rose-950 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 transition-colors cursor-pointer"
                          title="Delete Category"
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
                    No categories found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================================== */}
      {/* ADD / EDIT CATEGORY MODAL                                */}
      {/* ======================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-700/80 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-brand-500/20 border border-sky-200 dark:border-brand-500/40 flex items-center justify-center text-sky-600 dark:text-brand-400">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {editingCat ? `Edit Category: ${editingCat.name}` : 'Add New Category'}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Configure the category name, featured image, and category link.
                  </p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Category Name */}
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Graphics Card, Gaming PC"
                    value={formName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 dark:focus:border-brand-500"
                  />
                </div>

                {/* Parent Category */}
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Parent Level
                  </label>
                  <select
                    value={formParentId}
                    onChange={(e) => setFormParentId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="">None (Top-Level Root Category)</option>
                    <optgroup label="Assign Under Parent Category">
                      {categories
                        .filter((c) => !editingCat || c.id !== editingCat.id)
                        .map((c) => (
                          <option key={c.id} value={String(c.id)}>
                            {c.parent_id ? `↳ ${c.name}` : `★ ${c.name}`}
                          </option>
                        ))}
                    </optgroup>
                  </select>
                </div>

                {/* Slug */}
                <div className="sm:col-span-2">
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. graphics-card"
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-sky-500 dark:focus:border-brand-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Public URL: /category/{formSlug || '...'}
                  </span>
                </div>

                {/* Featured category image and link */}
                <div className="sm:col-span-2">
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Featured Category Image URL
                  </label>
                  <input
                    type="text"
                    placeholder="/uploads/categories/category.png or https://..."
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 dark:focus:border-brand-500"
                  />
                  <label className="mt-2 inline-flex cursor-pointer items-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-600 hover:border-sky-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {isUploadingImage ? 'Uploading...' : 'Upload image'}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif,image/avif,image/svg+xml"
                      className="hidden"
                      disabled={isUploadingImage}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void handleImageUpload(file);
                        e.target.value = '';
                      }}
                    />
                  </label>
                  <span className="mt-1 block text-[10px] text-slate-500 dark:text-slate-400">
                    Recommended size: 300 × 300 px square image. Maximum file size: 8 MB.
                  </span>
                  {formImage && (
                    <div className="mt-3 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-800/60">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={formImage} alt="" className="h-14 w-14 rounded-lg object-contain bg-white" />
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        This image is used only for this category&apos;s featured tile.
                      </span>
                    </div>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Featured Category Link
                  </label>
                  <input
                    type="text"
                    placeholder={`/category/${formSlug || 'category-slug'} or https://example.com`}
                    value={formLinkUrl}
                    onChange={(e) => setFormLinkUrl(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 dark:focus:border-brand-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Clicking this featured category image or name opens this link. Leave blank to use the category page.
                  </span>
                </div>
              </div>

              <label className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-slate-700 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-slate-300">
              <input
                type="checkbox"
                checked={formIsFeatured}
                onChange={(e) => setFormIsFeatured(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-amber-500"
              />
              <span>
                <span className="block font-bold">Show in Featured Categories</span>
                <span className="mt-0.5 block text-[10px] text-slate-500 dark:text-slate-400">
                  This category appears in the homepage category grid.
                </span>
              </span>
              </label>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 dark:bg-brand-500 dark:hover:bg-brand-400 text-white dark:text-navy-950 font-bold flex items-center gap-1.5 shadow disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingCat ? 'Save Changes' : 'Create Category'}</span>
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
      {catToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-600 dark:text-rose-400 flex-shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Delete Category: {catToDelete.name}?
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Are you sure you want to remove this category?
                </p>
              </div>
            </div>

            {catToDelete.product_count > 0 && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs">
                Warning: This category currently has <strong>{catToDelete.product_count}</strong> product(s). You must move or remove them before deleting.
              </div>
            )}

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs">
                {errorMsg}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setCatToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? 'Deleting...' : 'Delete Category'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
