import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/products/ProductCard';
import { query, queryOne } from '@/lib/db';
import { Brand, Product, Category } from '@/lib/types';
import { Globe, ArrowRight, ShieldCheck, ArrowUpDown } from 'lucide-react';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const brand = await queryOne<Brand>(
    `SELECT name, slug, description, short_desc, meta_title, meta_desc, canonical_url, og_title, og_desc
     FROM brands WHERE slug = ?`,
    [slug]
  );

  if (!brand) {
    return { title: 'Brand Not Found | CORENIX' };
  }

  const title = brand.meta_title || `${brand.name} Price in Bangladesh | Official CORENIX`;
  const description = brand.meta_desc || `Buy genuine ${brand.name} products in Bangladesh at CORENIX. Official warranty and multi-branch availability.`;

  return {
    title,
    description,
    openGraph: {
      title: brand.og_title || title,
      description: brand.og_desc || description,
      url: `https://corenix.com.bd/brand/${brand.slug}`,
    },
  };
}

export default async function BrandPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sParams = await searchParams;

  // 1. Fetch Brand
  const brand = await queryOne<Brand>(
    `SELECT * FROM brands WHERE slug = ? AND is_active = 1`,
    [slug]
  );

  if (!brand) {
    notFound();
  }

  // 2. Sorting
  const sortBy = sParams.sort || 'featured';
  let orderBy = 'p.is_featured DESC, p.created_at DESC';
  if (sortBy === 'price_asc') orderBy = 'p.selling_price ASC';
  if (sortBy === 'price_desc') orderBy = 'p.selling_price DESC';
  if (sortBy === 'newest') orderBy = 'p.created_at DESC';

  // 3. Fetch Brand Products (Deduplicated with subquery image)
  const products = await query<Product[]>(
    `SELECT p.*,
            b.name as brand_name, b.slug as brand_slug,
            c.name as category_name, c.slug as category_slug,
            (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.is_primary DESC, pi.id ASC LIMIT 1) as primary_image,
            (SELECT SUM(quantity - reserved_qty) FROM inventory WHERE product_id = p.id) as total_stock
     FROM products p
     JOIN brands b ON p.brand_id = b.id
     JOIN categories c ON p.category_id = c.id
     WHERE b.id = ? AND p.status = 'published'
     GROUP BY p.id
     ORDER BY ${orderBy}`,
    [brand.id]
  );

  // 4. Fetch categories containing this brand's products
  const categories = await query<Category[]>(
    `SELECT DISTINCT c.id, c.name, c.slug
     FROM products p
     JOIN categories c ON p.category_id = c.id
     WHERE p.brand_id = ? AND p.status = 'published'`,
    [brand.id]
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 dark:bg-navy-950 dark:text-slate-100 font-sans transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        {/* Brand Banner & Header */}
        <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-gradient-to-r dark:from-navy-900 dark:via-slate-900 dark:to-navy-900 border border-slate-200/80 dark:border-slate-800 mb-10 relative overflow-hidden shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="max-w-3xl space-y-4">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200 dark:bg-brand-500/20 dark:text-brand-300 dark:border-brand-500/30 text-xs font-bold">
                Official Brand Partner
              </span>
              {brand.country && (
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Origin: {brand.country}
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {brand.name} in Bangladesh
            </h1>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {brand.description || `Explore authentic ${brand.name} computing products with official manufacturer warranties, verified serials, and multi-branch support across CORENIX showrooms.`}
            </p>

            <div className="flex items-center gap-4 pt-2 text-xs flex-wrap">
              {brand.website && (
                <a
                  href={brand.website}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-sky-600 dark:text-brand-400 hover:underline font-semibold"
                >
                  <Globe className="w-4 h-4" />
                  <span>Official Global Website</span>
                </a>
              )}
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                <ShieldCheck className="w-4 h-4" /> Official Brand Warranty
              </span>
            </div>
          </div>

          {brand.logo && (
            <div className="p-4 sm:p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex items-center justify-center sm:self-center min-w-[150px] max-w-[200px] h-24 sm:h-28">
              <img
                src={brand.logo}
                alt={`${brand.name} logo`}
                width={160}
                height={80}
                className="max-h-12 sm:max-h-16 max-w-[140px] object-contain"
                loading="lazy"
                decoding="async"
              />
            </div>
          )}
        </div>

        {/* Categories Bar for this Brand */}
        {categories.length > 0 && (
          <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2 text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-semibold mr-2">Categories:</span>
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/category/${c.slug}?brand=${brand.slug}`}
                className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 dark:bg-navy-900 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 whitespace-nowrap transition-colors shadow-2xs font-medium"
              >
                {c.name}
              </Link>
            ))}
          </div>
        )}

        {/* Toolbar */}
        <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between mb-8 text-xs shadow-xs flex-wrap gap-4">
          <span className="text-slate-500 dark:text-slate-400">
            Showing <strong className="text-slate-900 dark:text-white font-bold">{products.length}</strong> official {brand.name} products
          </span>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
              <ArrowUpDown className="w-3.5 h-3.5" /> Sort:
            </span>
            <Link
              href={`/brand/${brand.slug}?sort=featured`}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                sortBy === 'featured'
                  ? 'bg-sky-600 text-white dark:bg-brand-500 dark:text-navy-950 shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              Featured
            </Link>
            <Link
              href={`/brand/${brand.slug}?sort=price_asc`}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                sortBy === 'price_asc'
                  ? 'bg-sky-600 text-white dark:bg-brand-500 dark:text-navy-950 shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              Price: Low to High
            </Link>
            <Link
              href={`/brand/${brand.slug}?sort=price_desc`}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                sortBy === 'price_desc'
                  ? 'bg-sky-600 text-white dark:bg-brand-500 dark:text-navy-950 shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              Price: High to Low
            </Link>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((p, idx) => (
            <ProductCard key={`brand-prod-${p.id}-${idx}`} product={p} />
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
