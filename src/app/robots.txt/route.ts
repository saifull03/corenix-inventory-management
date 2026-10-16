import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://corenix.com.bd';

  const content = `User-agent: *
Allow: /
Allow: /products
Allow: /product/
Allow: /category/
Allow: /brand/
Allow: /pc-builder
Allow: /ups-calculator
Allow: /emi-calculator
Allow: /search
Allow: /stores
Allow: /about

Disallow: /admin
Disallow: /admin/*
Disallow: /shop/*
Disallow: /account
Disallow: /account/*
Disallow: /cart
Disallow: /checkout
Disallow: /api/*

Sitemap: ${baseUrl}/sitemap.xml
`;

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
