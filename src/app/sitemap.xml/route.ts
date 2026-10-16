import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://corenix.com.bd';

  const urls: string[] = [
    `<url><loc>${baseUrl}</loc><priority>1.0</priority><changefreq>daily</changefreq></url>`,
    `<url><loc>${baseUrl}/products</loc><priority>0.9</priority><changefreq>daily</changefreq></url>`,
    `<url><loc>${baseUrl}/pc-builder</loc><priority>0.9</priority><changefreq>weekly</changefreq></url>`,
    `<url><loc>${baseUrl}/ups-calculator</loc><priority>0.9</priority><changefreq>weekly</changefreq></url>`,
    `<url><loc>${baseUrl}/emi-calculator</loc><priority>0.9</priority><changefreq>weekly</changefreq></url>`,
    `<url><loc>${baseUrl}/rma</loc><priority>0.8</priority><changefreq>weekly</changefreq></url>`,
    `<url><loc>${baseUrl}/stores</loc><priority>0.7</priority><changefreq>monthly</changefreq></url>`,
  ];

  try {
    const products = await query<any[]>(`SELECT slug, updated_at FROM products WHERE status = 'published'`);
    const categories = await query<any[]>(`SELECT slug, updated_at FROM categories WHERE is_active = 1`);
    const brands = await query<any[]>(`SELECT slug, updated_at FROM brands WHERE is_active = 1`);
    const seoPages = await query<any[]>(`SELECT slug, created_at FROM seo_landing_pages WHERE is_published = 1`);

    for (const c of categories || []) {
      urls.push(`<url><loc>${baseUrl}/category/${c.slug}</loc><priority>0.85</priority><changefreq>daily</changefreq></url>`);
    }

    for (const b of brands || []) {
      urls.push(`<url><loc>${baseUrl}/brand/${b.slug}</loc><priority>0.8</priority><changefreq>weekly</changefreq></url>`);
    }

    for (const p of products || []) {
      urls.push(`<url><loc>${baseUrl}/product/${p.slug}</loc><priority>0.8</priority><changefreq>daily</changefreq></url>`);
    }

    for (const sp of seoPages || []) {
      urls.push(`<url><loc>${baseUrl}/${sp.slug}</loc><priority>0.85</priority><changefreq>weekly</changefreq></url>`);
    }
  } catch (err) {
    // Graceful fallback if database is not reachable during build
  }

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

  return new NextResponse(sitemapXml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
