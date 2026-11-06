import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/products/ProductCard';
import { query, queryOne } from '@/lib/db';
import { SeoLandingPage, Product } from '@/lib/types';
import { HelpCircle, ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  // Check SEO landing pages
  const seoPage = await queryOne<SeoLandingPage>(
    `SELECT meta_title, meta_desc, canonical_url, og_title, og_desc
     FROM seo_landing_pages WHERE slug = ? AND is_published = 1`,
    [slug]
  );

  if (seoPage) {
    return {
      title: seoPage.meta_title,
      description: seoPage.meta_desc,
      openGraph: {
        title: seoPage.og_title || seoPage.meta_title,
        description: seoPage.og_desc || seoPage.meta_desc,
        url: seoPage.canonical_url || `https://corenix.com.bd/${slug}`,
      },
    };
  }

  // Check CMS pages
  const cmsPage = await queryOne<any>(
    `SELECT title, meta_title, meta_desc FROM cms_pages WHERE slug = ? AND is_published = 1`,
    [slug]
  );

  if (cmsPage) {
    return {
      title: cmsPage.meta_title || `${cmsPage.title} | CORENIX`,
      description: cmsPage.meta_desc || `Information regarding ${cmsPage.title} at CORENIX Bangladesh.`,
    };
  }

  return { title: 'Page Not Found | CORENIX' };
}

export default async function DynamicSlugPage({ params }: Props) {
  const { slug } = await params;

  // 1. Try SEO Landing Page
  const seoPage = await queryOne<any>(
    `SELECT * FROM seo_landing_pages WHERE slug = ? AND is_published = 1`,
    [slug]
  );

  if (seoPage) {
    // Fetch products matching the keyword or category
    const cleanWord = `%${seoPage.focus_keyword || slug}%`;
    const products = await query<Product[]>(
      `SELECT p.*,
              b.name as brand_name, b.slug as brand_slug,
              c.name as category_name, c.slug as category_slug,
              pi.image_url as primary_image,
              (SELECT SUM(quantity - reserved_qty) FROM inventory WHERE product_id = p.id) as total_stock
       FROM products p
       JOIN brands b ON p.brand_id = b.id
       JOIN categories c ON p.category_id = c.id
       LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
       WHERE p.status = 'published' AND (p.name LIKE ? OR p.slug LIKE ? OR b.name LIKE ? OR c.name LIKE ?)
       ORDER BY p.is_featured DESC
       LIMIT 12`,
      [cleanWord, cleanWord, cleanWord, cleanWord]
    );

    return (
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 dark:bg-navy-950 dark:text-slate-100 font-sans transition-colors duration-200">
        <Navbar />

        <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full space-y-10">
          {/* SEO Landing Hero */}
          <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-gradient-to-r dark:from-navy-900 dark:via-slate-900 dark:to-navy-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="max-w-3xl space-y-4">
              <span className="px-3 py-1 rounded-full bg-sky-50 dark:bg-brand-500/20 text-sky-700 dark:text-brand-300 text-xs font-bold border border-sky-200 dark:border-brand-500/30">
                Hardware Guide & Live Stock
              </span>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                {seoPage.h1}
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {seoPage.intro_text}
              </p>
            </div>
          </div>

          {/* Product Listing */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Available In-Stock Models
              </h2>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Found {products.length} models with official warranty
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>

          {/* Long SEO Content */}
          <div className="p-8 rounded-3xl bg-white dark:bg-navy-900/60 border border-slate-200/80 dark:border-slate-800 space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed shadow-xs">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Why Buy {seoPage.h1} from CORENIX?
            </h3>
            <p>
              At CORENIX, we maintain zero grey-market policy. Every component is backed by verifiable manufacturer serial numbers and supported by our dual-branch showrooms in Uttara and Dhanmondi. Enjoy rapid dispatch across Bangladesh and expert custom rig consultation.
            </p>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // 2. Try CMS Static Page (About, Contact, Complaint, Warranty Policy, etc.)
  const cmsPage = await queryOne<any>(
    `SELECT * FROM cms_pages WHERE slug = ? AND is_published = 1`,
    [slug]
  );

  if (cmsPage) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 dark:bg-navy-950 dark:text-slate-100 font-sans transition-colors duration-200">
        <Navbar />

        <main className="flex-1 max-w-4xl mx-auto px-4 py-12 w-full">
          <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 space-y-6 shadow-xs">
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
              {cmsPage.title}
            </h1>
            <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-4 whitespace-pre-line border-t border-slate-100 dark:border-slate-800 pt-6">
              {cmsPage.content}
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  notFound();
}
