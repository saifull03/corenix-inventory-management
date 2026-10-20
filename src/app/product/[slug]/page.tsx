import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/products/ProductCard';
import ProductDetailActions from '@/components/products/ProductDetailActions';
import { query, queryOne } from '@/lib/db';
import { Product, ProductSpecification, ProductInventory } from '@/lib/types';
import {
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Star,
  ShoppingCart,
  Zap,
  ArrowRight,
  Package,
  Layers,
  Sparkles,
  HelpCircle,
  Truck,
  CreditCard
} from 'lucide-react';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await queryOne<any>(
    `SELECT p.name, p.slug, b.name as brand_name,
            ps.meta_title, ps.meta_desc, ps.canonical_url, ps.og_title, ps.og_desc
     FROM products p
     JOIN brands b ON p.brand_id = b.id
     LEFT JOIN product_seo ps ON p.id = ps.product_id
     WHERE p.slug = ?`,
    [slug]
  );

  if (!product) {
    return { title: 'Product Not Found | CORENIX' };
  }

  const title = product.meta_title || `${product.name} Price in Bangladesh | CORENIX`;
  const description = product.meta_desc || `Buy ${product.name} from ${product.brand_name} at CORENIX. Official warranty and multi-branch stock.`;

  return {
    title,
    description,
    openGraph: {
      title: product.og_title || title,
      description: product.og_desc || description,
      url: `https://corenix.com.bd/product/${product.slug}`,
      siteName: 'CORENIX',
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;

  // 1. Fetch main product
  const product = await queryOne<Product>(
    `SELECT p.*,
            b.name as brand_name, b.slug as brand_slug,
            c.name as category_name, c.slug as category_slug,
            pd.overview, pd.key_features_json, pd.what_in_box, pd.warranty_info, pd.faq_json,
            pi.image_url as primary_image
     FROM products p
     JOIN brands b ON p.brand_id = b.id
     JOIN categories c ON p.category_id = c.id
     LEFT JOIN product_descriptions pd ON p.id = pd.product_id
     LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
     WHERE p.slug = ?`,
    [slug]
  );

  // 1b. All product images (for gallery thumbnails)
  const allImages = product ? await query<Array<{ image_url: string; alt_text?: string; is_primary: boolean }>>(
    `SELECT image_url, alt_text, is_primary FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, id ASC`,
    [product.id]
  ) : [];

  if (!product) {
    notFound();
  }

  // 2. Fetch specifications dynamically
  const specs = await query<ProductSpecification[]>(
    `SELECT ps.id, ps.attribute_id, ps.attribute_value, ps.custom_label,
            a.name as attribute_name, a.code as attribute_code,
            ag.name as group_name
     FROM product_specifications ps
     JOIN attributes a ON ps.attribute_id = a.id
     LEFT JOIN attribute_groups ag ON a.group_id = ag.id
     WHERE ps.product_id = ?
     ORDER BY ag.order_index ASC, ps.order_index ASC`,
    [product.id]
  );

  // 3. Fetch location-based inventory (Main Warehouse, Shop 1, Shop 2, RMA Center)
  const inventory = await query<ProductInventory[]>(
    `SELECT inv.branch_id, b.name as branch_name, b.code as branch_code,
            inv.quantity, inv.reserved_qty, inv.rma_qty
     FROM inventory inv
     JOIN branches b ON inv.branch_id = b.id
     WHERE inv.product_id = ?
     ORDER BY b.type = 'shop' DESC, b.name ASC`,
    [product.id]
  );

  // 4. Fetch related products in the same category
  const rawRelated = await query<Product[]>(
    `SELECT p.*,
            b.name as brand_name, b.slug as brand_slug,
            c.name as category_name, c.slug as category_slug,
            (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image,
            (SELECT SUM(quantity - reserved_qty) FROM inventory WHERE product_id = p.id) as total_stock
     FROM products p
     JOIN brands b ON p.brand_id = b.id
     JOIN categories c ON p.category_id = c.id
     WHERE p.category_id = ? AND p.id != ? AND p.status = 'published'
     LIMIT 4`,
    [product.category_id, product.id]
  );

  const relatedMap = new Map<number, Product>();
  rawRelated.forEach((item) => {
    if (item && item.id && !relatedMap.has(item.id)) {
      relatedMap.set(item.id, item);
    }
  });
  const related = Array.from(relatedMap.values());

  const currentPrice = product.discount_price || product.selling_price;
  const regularPrice = product.selling_price;
  const discountAmount = product.discount_price ? regularPrice - product.discount_price : 0;
  const discountPercent = product.discount_price && regularPrice > 0
    ? Math.round(((regularPrice - product.discount_price) / regularPrice) * 100)
    : 0;
  const keyFeatures: string[] = typeof (product as any).key_features_json === 'string'
    ? JSON.parse((product as any).key_features_json || '[]')
    : (product as any).key_features_json || [];

  const totalAvailableStock = inventory.reduce((acc, curr) => acc + Math.max(0, curr.quantity - curr.reserved_qty), 0);

  // Structured Data (JSON-LD)
  const jsonLd = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    image: [product.primary_image || 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7'],
    description: (product as any).overview || product.name,
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: product.brand_name,
    },
    offers: {
      '@type': 'Offer',
      url: `https://corenix.com.bd/product/${product.slug}`,
      priceCurrency: 'BDT',
      price: currentPrice,
      availability: totalAvailableStock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F3F5F8] dark:bg-navy-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-6 w-full">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-5 flex-wrap">
          <Link href="/" className="hover:text-[#2340D0] dark:hover:text-[#4F6BEA] transition-colors">Home</Link>
          <span className="text-slate-300 dark:text-slate-700">/</span>
          <Link href="/products" className="hover:text-[#2340D0] dark:hover:text-[#4F6BEA] transition-colors">Products</Link>
          <span className="text-slate-300 dark:text-slate-700">/</span>
          <Link href={`/category/${product.category_slug}`} className="hover:text-[#2340D0] dark:hover:text-[#4F6BEA] transition-colors">
            {product.category_name}
          </Link>
          <span className="text-slate-300 dark:text-slate-700">/</span>
          <span className="text-slate-700 dark:text-slate-300 font-medium truncate max-w-xs">{product.name}</span>
        </nav>

        {/* ─── MAIN PRODUCT PANEL ─── */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">

            {/* Left — Interactive Gallery (client) */}
            <div className="border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 p-5">
              <ProductDetailActions product={product} allImages={allImages} />
            </div>

            {/* Right — Product Info */}
            <div className="p-6 flex flex-col gap-5">

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white leading-snug tracking-tight">
                {product.name}
              </h1>

              {/* Price + Variant Chip Row */}
              <div className="flex items-center gap-3 flex-wrap">
                {product.stock_status === 'Call for Price' ? (
                  <span className="text-2xl font-bold text-[#2340D0] dark:text-[#4F6BEA]">Call for Price</span>
                ) : (
                  <>
                    <span className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight font-mono">
                      ৳{currentPrice.toLocaleString()}
                    </span>
                    <span className="text-sm text-slate-500 dark:text-slate-400">(Cash Price)</span>
                    {product.discount_price && product.discount_price < product.selling_price && (
                      <span className="text-base text-slate-400 dark:text-slate-500 line-through font-mono">
                        ৳{regularPrice.toLocaleString()}
                      </span>
                    )}
                  </>
                )}
                {(product.model || product.sku) && (
                  <span className="ml-auto px-3 py-1 rounded-lg border border-[#B8400A] text-[#B8400A] dark:text-[#FF8A47] dark:border-[#FF8A47]/50 text-xs font-semibold">
                    {product.model || product.sku}
                  </span>
                )}
              </div>

              {/* Quick-action buttons row: Compare, Brand Store, EMI */}
              <div className="flex items-center gap-2 flex-wrap">
                <Link
                  href={`/brand/${product.brand_slug}`}
                  className="flex items-center gap-1.5 px-3 h-8 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-xs font-medium hover:border-[#2340D0] hover:text-[#2340D0] dark:hover:border-[#4F6BEA] dark:hover:text-[#4F6BEA] transition-colors"
                >
                  <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                  <span>{product.brand_name} Store</span>
                </Link>
                <Link
                  href={`/emi-calculator?amount=${Math.round(currentPrice)}&title=${encodeURIComponent(product.name)}`}
                  className="flex items-center gap-1.5 px-3 h-8 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-xs font-medium hover:border-purple-400 hover:text-purple-600 dark:hover:border-purple-500 dark:hover:text-purple-400 transition-colors"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>View EMI Options</span>
                </Link>
              </div>

              {/* Key Features List */}
              {keyFeatures.length > 0 && (
                <div className="p-4 bg-[#F3F5F8] dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                  <ul className="space-y-1.5 text-sm text-slate-700 dark:text-slate-300">
                    {keyFeatures.slice(0, 5).map((kf, i) => (
                      <li key={i} className="flex items-start gap-2 leading-snug">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 mt-1.5 flex-shrink-0" />
                        <span>{kf}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Variant Selectors (Storage, Color, etc.) */}
              {specs.length > 0 && (
                <div className="space-y-3">
                  {Array.from(new Set(specs.map(s => s.custom_label || s.attribute_name))).slice(0, 2).map((attrName) => {
                    const attrValues = specs.filter(s => (s.custom_label || s.attribute_name) === attrName);
                    return (
                      <div key={attrName} className="flex items-center gap-3 flex-wrap">
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 w-20 flex-shrink-0">{attrName} :</span>
                        <div className="flex gap-2 flex-wrap">
                          {attrValues.map((v, vi) => (
                            <span
                              key={vi}
                              className={`px-3 py-1 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
                                vi === 0
                                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white'
                                  : 'bg-white dark:bg-navy-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:border-slate-500'
                              }`}
                            >
                              {v.attribute_value}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Meta Info Grid: Condition, SKU, Booking, Points */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                {[
                  {
                    icon: <ShieldCheck className="w-4 h-4 text-sky-500" />,
                    label: 'CONDITION',
                    value: product.stock_status === 'Out Of Stock' ? 'Unavailable'
                      : product.stock_status === 'Pre-Order' ? 'Pre-order'
                      : 'Available',
                    color: product.stock_status === 'Out Of Stock' ? 'text-rose-500' : product.stock_status === 'Pre-Order' ? 'text-purple-500' : 'text-emerald-600 dark:text-emerald-400',
                  },
                  {
                    icon: <Package className="w-4 h-4 text-slate-400" />,
                    label: 'SKU',
                    value: product.sku,
                    color: 'text-slate-700 dark:text-slate-300',
                  },
                  {
                    icon: <CreditCard className="w-4 h-4 text-amber-500" />,
                    label: 'BOOKING',
                    value: currentPrice > 0 ? Math.round(currentPrice * 0.1).toLocaleString() : '—',
                    color: 'text-slate-700 dark:text-slate-300',
                  },
                  {
                    icon: <Star className="w-4 h-4 text-amber-400 fill-amber-400" />,
                    label: 'POINTS',
                    value: Math.round(currentPrice / 400).toString(),
                    color: 'text-amber-600 dark:text-amber-400',
                  },
                ].map((meta) => (
                  <div
                    key={meta.label}
                    className="flex flex-col items-center gap-1 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-[#F3F5F8] dark:bg-slate-800/40 text-center"
                  >
                    {meta.icon}
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{meta.label}</span>
                    <span className={`font-semibold truncate max-w-full ${meta.color}`}>{meta.value}</span>
                  </div>
                ))}
              </div>

              {/* Rating Row */}
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-0.5 text-amber-400">
                  {[1,2,3,4,5].map((s) => (
                    <Star key={s} className={`w-3.5 h-3.5 ${Number(product.rating_avg || 4.5) >= s ? 'fill-current text-amber-400' : 'text-slate-300 dark:text-slate-600'}`} />
                  ))}
                </div>
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {Number(product.rating_avg || 4.5).toFixed(1)}
                </span>
                <span>({product.rating_count || 0} reviews)</span>
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <span className={`font-medium ${totalAvailableStock > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                  {totalAvailableStock > 0 ? `${totalAvailableStock} in stock` : product.stock_status || 'Check availability'}
                </span>
              </div>

            </div>{/* /right */}
          </div>
        </div>

        {/* ─── LOWER SECTION: Tabs & Related ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-16">
          {/* Left + Center rich content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Overview */}
            {(product as any).overview && (
              <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                  <Layers className="w-5 h-5 text-[#2340D0] dark:text-[#4F6BEA]" />
                  Product Overview
                </h2>
                <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {(product as any).overview}
                </div>
              </div>
            )}

            {/* Specifications Table */}
            {specs.length > 0 && (
              <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                  <Layers className="w-5 h-5 text-[#2340D0] dark:text-[#4F6BEA]" />
                  Technical Specifications
                </h2>
                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                  <table className="w-full text-left text-sm border-collapse">
                    <tbody>
                      {specs.map((s, idx) => (
                        <tr key={idx} className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-[#F3F5F8] dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-4 font-semibold text-slate-500 dark:text-slate-400 w-2/5 bg-[#F3F5F8]/70 dark:bg-slate-900/40 text-xs uppercase tracking-wide">
                            {s.custom_label || s.attribute_name}
                          </td>
                          <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200 text-sm">
                            {s.attribute_value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Box Contents & Warranty */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
                  <Package className="w-4 h-4 text-[#2340D0] dark:text-[#4F6BEA]" />
                  What&apos;s in the Box
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {(product as any).what_in_box || 'Standard retail package with official accessories and documents.'}
                </p>
              </div>
              <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
                  <ShieldCheck className="w-4 h-4 text-[#2340D0] dark:text-[#4F6BEA]" />
                  Warranty &amp; Service
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {product.warranty_period}. Serviced at CORENIX RMA Hub or authorized distributor centers.
                </p>
              </div>
            </div>

            {/* Branch Inventory */}
            {inventory.length > 0 && (
              <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#2340D0] dark:text-[#4F6BEA]" />
                    Live Branch Availability
                  </h3>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    totalAvailableStock > 0
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                      : 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300'
                  }`}>
                    {totalAvailableStock > 0 ? `${totalAvailableStock} units available` : 'Out of Stock'}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {inventory.map((inv) => {
                    const avail = Math.max(0, inv.quantity - inv.reserved_qty);
                    return (
                      <div key={inv.branch_id} className="p-3 rounded-xl bg-[#F3F5F8] dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-center">
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block truncate">{inv.branch_name || inv.branch_code}</span>
                        <span className={`text-sm font-bold mt-1 block ${avail > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-600'}`}>
                          {avail > 0 ? `${avail} in Stock` : 'Out of Stock'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Related Products</h3>
                <Link href={`/category/${product.category_slug}`} className="text-xs text-[#2340D0] dark:text-[#4F6BEA] hover:underline font-semibold">View All</Link>
              </div>
              <div className="space-y-3">
                {related.map((rp, idx) => (
                  <Link
                    key={`${rp.id}-${idx}`}
                    href={`/product/${rp.slug}`}
                    className="flex gap-3 p-2.5 rounded-xl hover:bg-[#F3F5F8] dark:hover:bg-slate-800 transition-colors group"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={rp.primary_image || 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=200&q=80'}
                      alt={rp.name}
                      className="w-14 h-14 object-contain bg-white dark:bg-slate-900 rounded-lg p-1 border border-slate-200 dark:border-slate-700 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-[#2340D0] dark:group-hover:text-[#4F6BEA] line-clamp-2 leading-snug">{rp.name}</h4>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">৳{(rp.discount_price || rp.selling_price).toLocaleString()}</span>
                        {rp.discount_price && (
                          <span className="text-[11px] text-slate-400 line-through font-mono">৳{rp.selling_price.toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* RMA Card */}
            <div className="bg-gradient-to-br from-[#EEF1FD] to-[#DCE3FB] dark:from-slate-900 dark:to-navy-900 border border-[#B9C6F6] dark:border-[#2340D0]/30 rounded-2xl p-5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#2340D0] dark:text-[#4F6BEA]">After-Sales Support</span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">Need RMA Service?</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-1">
                Live tracking at our dedicated RMA Hub with guaranteed component replacement.
              </p>
              <Link
                href="/rma"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2340D0] dark:text-[#4F6BEA] hover:underline mt-3"
              >
                <span>Track or Claim RMA</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Related Products Card Grid */}
        {related.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">More from {product.category_name}</h2>
              <Link href={`/category/${product.category_slug}`} className="text-xs text-[#2340D0] dark:text-[#4F6BEA] hover:underline font-semibold flex items-center gap-1">
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {related.map((rp, rpIdx) => (
                <ProductCard key={`${rp.id}-${rpIdx}`} product={rp} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
