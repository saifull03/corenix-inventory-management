'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Image as ImageIcon,
  Plus,
  Pencil,
  Trash2,
  Upload,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  X,
  CheckCircle,
  AlertTriangle,
  Loader2,
  ExternalLink,
  GripVertical,
  LayoutTemplate,
} from 'lucide-react';

interface Banner {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  image_url: string;
  link_url: string;
  button_text: string;
  cta2_text: string;
  cta2_link: string;
  badge_text: string;
  text_color: string;
  position: string;
  order_index: number;
  is_active: boolean | number;
}

const POSITIONS_CONFIG = [
  { value: 'hero', label: 'Hero Slider (Left Slide Carousel)', shortLabel: 'Hero Slider', isPicture: false, guide: 'Recommended size: ~1600 × 600px. Includes headline titles, badge text, and action buttons.' },
  { value: 'hero_collage', label: 'Hero Collage (Right 2 Cards)', shortLabel: 'Hero Collage', isPicture: true, guide: 'Recommended size: ~800 × 400px (2:1). Pure clickable picture banner.' },
  { value: 'before_laptops', label: '2 Banners (Before Gaming Laptops)', shortLabel: 'Before Laptops', isPicture: true, guide: 'Recommended size: ~800 × 380px. Pure picture banner side-by-side.' },
  { value: 'after_laptops', label: '2 Banners (After Gaming Laptops)', shortLabel: 'After Laptops', isPicture: true, guide: 'Recommended size: ~800 × 380px. Pure picture banner side-by-side.' },
  { value: 'after_accessories', label: '1 Wide Banner (After Accessories)', shortLabel: 'After Accessories', isPicture: true, guide: 'Recommended size: ~1400 × 350px. Pure clickable full-width picture banner.' },
  { value: 'popup', label: 'Promotion Popup', shortLabel: 'Popup Ad', isPicture: true, guide: 'Recommended size: ~900 × 600px. This image opens in a centered popup on the homepage.' },
  { value: 'marquee', label: 'Marquee Announcement', shortLabel: 'Marquee', isPicture: false, guide: 'Enter the announcement text in the title field. Active announcements scroll beneath the homepage banner.' },
  { value: 'sidebar', label: 'Sidebar Banner', shortLabel: 'Sidebar', isPicture: false, guide: 'Recommended size: ~400 × 600px.' },
  { value: 'footer', label: 'Footer Banner', shortLabel: 'Footer', isPicture: false, guide: 'Recommended size: ~1200 × 300px.' },
];

const isPictureBanner = (pos: string) =>
  ['hero_collage', 'before_laptops', 'after_laptops', 'after_accessories', 'popup'].includes(pos);

const POSITIONS = POSITIONS_CONFIG.map(p => p.value);

const EMPTY: Omit<Banner, 'id'> = {
  title: '',
  subtitle: '',
  description: '',
  image_url: '',
  link_url: '',
  button_text: '',
  cta2_text: '',
  cta2_link: '',
  badge_text: '',
  text_color: 'white',
  position: 'hero',
  order_index: 0,
  is_active: true,
};

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPos, setFilterPos] = useState('all');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [form, setForm] = useState<Omit<Banner, 'id'>>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = useCallback((type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const fetchBanners = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/banners?active=false`);
      const data = await res.json();
      if (data.success) setBanners(data.banners);
      else showToast('error', data.error || 'Failed to load banners');
    } catch {
      showToast('error', 'Network error loading banners');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const openCreate = () => {
    setEditingBanner(null);
    setForm({
      ...EMPTY,
      position: filterPos !== 'all' ? filterPos : 'hero',
    });
    setPreviewUrl('');
    setShowModal(true);
  };

  const openEdit = (b: Banner) => {
    setEditingBanner(b);
    setForm({
      title: b.title || '',
      subtitle: b.subtitle || '',
      description: b.description || '',
      image_url: b.image_url || '',
      link_url: b.link_url || '',
      button_text: b.button_text || '',
      cta2_text: b.cta2_text || '',
      cta2_link: b.cta2_link || '',
      badge_text: b.badge_text || '',
      text_color: b.text_color || 'white',
      position: b.position || 'hero',
      order_index: b.order_index ?? 0,
      is_active: Boolean(b.is_active),
    });
    setPreviewUrl(b.image_url || '');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setPreviewUrl('');
  };

  // File upload handler
  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setUploading(true);
    setUploadProgress(10);
    try {
      const fd = new FormData();
      fd.append('file', file);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(p => Math.min(p + 15, 85));
      }, 200);

      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      clearInterval(progressInterval);
      setUploadProgress(100);

      const data = await res.json();
      if (data.success) {
        setForm(f => ({ ...f, image_url: data.url }));
        setPreviewUrl(data.url);
        showToast('success', 'Image uploaded successfully!');
      } else {
        showToast('error', data.error || 'Upload failed');
      }
    } catch {
      showToast('error', 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 500);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) handleFileUpload(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isMarquee = form.position === 'marquee';
    if (!isMarquee && !form.image_url.trim()) {
      showToast('error', 'Banner image is required.');
      return;
    }
    const isPic = isPictureBanner(form.position);
    if (form.position === 'marquee' && !form.title.trim()) {
      showToast('error', 'Title is required.');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        id: editingBanner?.id,
        title: form.title.trim(),
        subtitle: form.subtitle,
        description: form.description,
        imageUrl: form.image_url.trim(),
        linkUrl: form.link_url.trim() || '/products',
        buttonText: form.button_text,
        cta2Text: form.cta2_text,
        cta2Link: form.cta2_link,
        badgeText: form.badge_text,
        textColor: form.text_color,
        position: form.position,
        orderIndex: Number(form.order_index) || 0,
        isActive: Boolean(form.is_active),
      };

      const method = editingBanner ? 'PATCH' : 'POST';
      const res = await fetch('/api/admin/banners', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        showToast('success', editingBanner ? 'Banner updated!' : 'Banner created!');
        closeModal();
        fetchBanners();
      } else {
        showToast('error', data.error || 'Operation failed');
      }
    } catch {
      showToast('error', 'Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (banner: Banner) => {
    try {
      const res = await fetch('/api/admin/banners', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: banner.id, isActive: !banner.is_active }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', `Banner ${banner.is_active ? 'deactivated' : 'activated'}`);
        fetchBanners();
      } else {
        showToast('error', data.error || 'Failed');
      }
    } catch {
      showToast('error', 'Network error');
    }
  };

  const moveOrder = async (banner: Banner, dir: 'up' | 'down') => {
    const newOrder = dir === 'up' ? banner.order_index - 1 : banner.order_index + 1;
    try {
      await fetch('/api/admin/banners', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: banner.id, orderIndex: newOrder }),
      });
      fetchBanners();
    } catch {}
  };

  const deleteBanner = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/banners?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('success', 'Banner deleted');
        setDeleteConfirm(null);
        fetchBanners();
      } else {
        showToast('error', data.error || 'Delete failed');
      }
    } catch {
      showToast('error', 'Network error');
    }
  };

  const filtered = filterPos === 'all' ? banners : banners.filter(b => b.position === filterPos);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950 p-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-[200] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl border text-sm font-semibold transition-all ${
            toast.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
              : 'bg-red-50 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* Delete Confirm Dialog */}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-sm mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">Delete Banner</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">This action cannot be undone.</p>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteBanner(deleteConfirm)}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-brand-400 mb-1">
              <LayoutTemplate className="w-4 h-4" />
              Content Management
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Banner & Slider Manager</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Upload images and manage hero sliders, sidebars, and promotional banners.
            </p>
          </div>

          <button
            onClick={openCreate}
            className="px-5 py-3 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-sky-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            Add New Banner
          </button>
        </div>

        {/* Position filter tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFilterPos('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filterPos === 'all'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                : 'bg-white dark:bg-navy-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-sky-500/50 hover:text-sky-600 dark:hover:text-brand-400'
            }`}
          >
            All Banners ({banners.length})
          </button>
          {POSITIONS_CONFIG.map(pos => (
            <button
              key={pos.value}
              onClick={() => setFilterPos(pos.value)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                filterPos === pos.value
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                  : 'bg-white dark:bg-navy-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-sky-500/50 hover:text-sky-600 dark:hover:text-brand-400'
              }`}
            >
              {pos.shortLabel}
              <span className="ml-1.5 opacity-60">({banners.filter(b => b.position === pos.value).length})</span>
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <ImageIcon className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="font-bold text-slate-700 dark:text-slate-300">No banners found</p>
            <p className="text-xs text-slate-400 mt-1">Click &quot;Add New Banner&quot; to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((banner, idx) => (
              <div
                key={banner.id}
                className={`relative rounded-2xl overflow-hidden border shadow-sm transition-all hover:shadow-md group ${
                  banner.is_active
                    ? 'border-slate-200 dark:border-slate-700'
                    : 'border-slate-200/60 dark:border-slate-800 opacity-60'
                } bg-white dark:bg-navy-900`}
              >
                {/* Image */}
                <div className="relative h-44 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  {banner.image_url ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={banner.image_url}
                      alt={banner.title}
                      width={800}
                      height={450}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                    </div>
                  )}

                  {/* Position badge */}
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full bg-black/50 text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm border border-white/20">
                      {banner.position}
                    </span>
                  </div>

                  {/* Status badge */}
                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm border ${
                        banner.is_active
                          ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30'
                          : 'bg-slate-500/20 text-slate-200 border-slate-500/30'
                      }`}
                    >
                      {banner.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1">{banner.title}</h3>
                  {banner.subtitle && (
                    <p className="text-xs text-sky-600 dark:text-brand-400 font-semibold mt-0.5 line-clamp-1">{banner.subtitle}</p>
                  )}
                  {banner.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{banner.description}</p>
                  )}

                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                    {/* Order controls */}
                    <div className="flex flex-col gap-0.5">
                      <button
                        onClick={() => moveOrder(banner, 'up')}
                        disabled={idx === 0}
                        className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 disabled:opacity-30 transition-colors"
                        title="Move up"
                      >
                        <ChevronUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => moveOrder(banner, 'down')}
                        disabled={idx === filtered.length - 1}
                        className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 disabled:opacity-30 transition-colors"
                        title="Move down"
                      >
                        <ChevronDown className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="text-[10px] text-slate-400 font-mono mr-auto">#{banner.order_index}</span>

                    {/* Actions */}
                    <a
                      href={banner.link_url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-sky-600 dark:hover:text-brand-400 transition-colors"
                      title="Open link"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <button
                      onClick={() => toggleActive(banner)}
                      className={`p-2 rounded-lg transition-colors ${
                        banner.is_active
                          ? 'hover:bg-slate-100 dark:hover:bg-slate-800 text-emerald-600 hover:text-slate-500'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-emerald-600'
                      }`}
                      title={banner.is_active ? 'Deactivate' : 'Activate'}
                    >
                      {banner.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={() => openEdit(banner)}
                      className="p-2 rounded-lg hover:bg-sky-50 dark:hover:bg-sky-950 text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                      title="Edit banner"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setDeleteConfirm(banner.id)}
                      className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      title="Delete banner"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-y-auto py-8 px-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-2xl mx-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {editingBanner ? 'Edit Banner' : 'Add New Banner'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {editingBanner ? 'Update the banner details below.' : 'Upload an image and fill the details to create a new banner.'}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Image Upload Zone */}
              {form.position !== 'marquee' && <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                  Banner Image *
                </label>

                {/* Drop Zone */}
                <div
                  className={`relative border-2 border-dashed rounded-2xl overflow-hidden transition-all cursor-pointer ${
                    uploading
                      ? 'border-sky-400 bg-sky-50 dark:bg-sky-950/30'
                      : 'border-slate-200 dark:border-slate-700 hover:border-sky-400 dark:hover:border-sky-500 hover:bg-sky-50/50 dark:hover:bg-sky-950/20'
                  }`}
                  onDragOver={e => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => !uploading && fileInputRef.current?.click()}
                  style={{ minHeight: '160px' }}
                >
                  {previewUrl ? (
                    <div className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={previewUrl}
                        alt="Preview"
                        width={800}
                        height={450}
                        className="w-full h-48 object-cover"
                        decoding="async"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-xs font-bold flex items-center gap-2">
                          <Upload className="w-4 h-4" />
                          Click or drag to replace image
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-slate-400 dark:text-slate-500">
                      {uploading ? (
                        <>
                          <Loader2 className="w-8 h-8 animate-spin text-sky-500 mb-3" />
                          <span className="text-sm font-semibold text-sky-600">Uploading... {uploadProgress}%</span>
                          <div className="w-36 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 mt-3 overflow-hidden">
                            <div
                              className="h-full bg-sky-500 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 mb-3 text-slate-300 dark:text-slate-600" />
                          <p className="text-sm font-semibold">Click to upload or drag & drop</p>
                          <p className="text-xs mt-1">JPEG, PNG, WebP, AVIF up to 8 MB</p>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => {
                    const f = e.target.files?.[0];
                    if (f) handleFileUpload(f);
                    e.target.value = '';
                  }}
                />

                {/* Or use URL */}
                <div className="mt-2">
                  <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1 font-medium">
                    Or enter image URL directly
                  </label>
                  <input
                    type="text"
                    value={form.image_url}
                    onChange={e => {
                      setForm(f => ({ ...f, image_url: e.target.value }));
                      setPreviewUrl(e.target.value);
                    }}
                    placeholder="https://example.com/image.jpg or /uploads/banners/..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-medium placeholder:text-slate-400 focus:outline-none focus:border-sky-500 dark:focus:border-sky-400 transition-colors"
                  />
                </div>
              </div>}

              {/* Position selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                  Banner Position *
                </label>
                <select
                  value={form.position}
                  onChange={e => setForm(f => ({ ...f, position: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm font-medium focus:outline-none focus:border-sky-500 dark:focus:border-sky-400 transition-colors"
                >
                  {POSITIONS_CONFIG.map(p => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              {isPictureBanner(form.position) ? (
                /* Simplified Form for Picture Banners (Clean Picture Link) */
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-700 dark:text-sky-300 text-xs leading-relaxed">
                    💡 <strong>Picture Banner Mode:</strong> This position is displayed as a clean, full-bleed picture banner with no text overlay or buttons.
                    <br />
                    <span className="font-semibold text-sky-800 dark:text-sky-200">
                      {POSITIONS_CONFIG.find(p => p.value === form.position)?.guide}
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                      Destination Link URL *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.link_url}
                      onChange={e => setForm(f => ({ ...f, link_url: e.target.value }))}
                      placeholder="/category/graphics-card or /products"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:border-sky-500 dark:focus:border-sky-400 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                      Reference Title / Alt Text (Optional)
                    </label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                      placeholder="e.g. GeForce RTX 50 Banner or Gaming Monitor Deal"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:border-sky-500 dark:focus:border-sky-400 transition-colors"
                    />
                  </div>
                </div>
              ) : (
                /* Full Form for Hero Slider and other text-based banners */
                <div className="space-y-5">
                  {/* Title & Subtitle */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                        Title (Optional)
                      </label>
                      <input
                        type="text"
                        value={form.title}
                        onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                        placeholder="Engineered for Maximum Performance"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:border-sky-500 dark:focus:border-sky-400 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                        Subtitle
                      </label>
                      <input
                        type="text"
                        value={form.subtitle}
                        onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))}
                        placeholder="NVIDIA RTX 50 Series"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:border-sky-500 dark:focus:border-sky-400 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                      Description
                    </label>
                    <textarea
                      value={form.description}
                      onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      rows={2}
                      placeholder="Short promotional description shown on the slider..."
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:border-sky-500 dark:focus:border-sky-400 transition-colors resize-none"
                    />
                  </div>

                  {/* Badge + Link */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                        Badge Text
                      </label>
                      <input
                        type="text"
                        value={form.badge_text}
                        onChange={e => setForm(f => ({ ...f, badge_text: e.target.value }))}
                        placeholder="RTX 50 Series Available Now"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:border-sky-500 dark:focus:border-sky-400 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                        Link URL *
                      </label>
                      <input
                        type="text"
                        required
                        value={form.link_url}
                        onChange={e => setForm(f => ({ ...f, link_url: e.target.value }))}
                        placeholder="/products or /category/gpu"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:border-sky-500 dark:focus:border-sky-400 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Secondary CTA */}
                  <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                        Secondary CTA Text
                      </label>
                      <input
                        type="text"
                        value={form.cta2_text}
                        onChange={e => setForm(f => ({ ...f, cta2_text: e.target.value }))}
                        placeholder="Browse All Hardware"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:border-sky-500 dark:focus:border-sky-400 transition-colors"
                      />
                    </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                        Secondary CTA Link
                      </label>
                      <input
                        type="text"
                        value={form.cta2_link}
                        onChange={e => setForm(f => ({ ...f, cta2_link: e.target.value }))}
                        placeholder="/products"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:border-sky-500 dark:focus:border-sky-400 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Order Index + Active toggle */}
              <div className="grid grid-cols-2 gap-4 items-end">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                    Order Index
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.order_index}
                    onChange={e => setForm(f => ({ ...f, order_index: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm font-medium focus:outline-none focus:border-sky-500 dark:focus:border-sky-400 transition-colors"
                  />
                </div>
                <div className="flex items-center gap-3 py-2.5">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(form.is_active)}
                      onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-4 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500" />
                  </label>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {form.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || uploading}
                  className="flex-1 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-sky-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      {editingBanner ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      {editingBanner ? 'Update Banner' : 'Create Banner'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
