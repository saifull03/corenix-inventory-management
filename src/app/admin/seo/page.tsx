import React from 'react';
import Link from 'next/link';
import { query } from '@/lib/db';
import { Search, Plus, ExternalLink, Globe, Sparkles, TrendingUp, AlertCircle, FileText } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminSeoPage() {
  const seoLandingPages = await query<any[]>(
    `SELECT * FROM seo_landing_pages ORDER BY id DESC`
  );

  const searchAnalytics = await query<any[]>(
    `SELECT * FROM search_analytics ORDER BY hits_count DESC LIMIT 10`
  );

  const zeroResultSearches = await query<any[]>(
    `SELECT * FROM search_analytics WHERE zero_results = 1 ORDER BY hits_count DESC LIMIT 5`
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
            Search Engine Domination
          </span>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            SEO Management & Landing Page Builder
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Build high-ranking programmatic landing pages, optimize meta tags, and monitor search demand analytics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/sitemap.xml"
            target="_blank"
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 flex items-center gap-1.5"
          >
            <Globe className="w-4 h-4 text-brand-400" />
            <span>View /sitemap.xml</span>
          </Link>
          <Link
            href="/robots.txt"
            target="_blank"
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4 text-brand-400" />
            <span>View /robots.txt</span>
          </Link>
        </div>
      </div>

      {/* SEO Landing Pages List (Requirement 21) */}
      <div className="p-6 rounded-2xl bg-navy-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-400" />
            <span>High-Value SEO Commercial Landing Pages</span>
          </h2>
          <span className="text-xs text-slate-400">{seoLandingPages.length} Active Pages</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600 dark:border-slate-800 dark:text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Landing Page Slug</th>
                <th className="py-3 px-4">H1 Heading</th>
                <th className="py-3 px-4">Target Focus Keyword</th>
                <th className="py-3 px-4">Meta Title Preview</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {seoLandingPages.map((sp) => (
                <tr key={sp.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-sky-700 dark:text-cyan-400">
                    /{sp.slug}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-900 dark:text-white max-w-xs truncate" title={sp.h1}>
                    {sp.h1}
                  </td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-mono text-[11px]">
                      {sp.focus_keyword || sp.slug}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400 max-w-xs truncate" title={sp.meta_title}>
                    {sp.meta_title}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold text-[10px]">
                      Indexed
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Link
                      href={`/${sp.slug}`}
                      target="_blank"
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white inline-block"
                      title="View public SEO page"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Two Column: Search Demand Analytics & Zero-Results Intelligence (Requirement 49) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Searches */}
        <div className="p-6 rounded-2xl bg-navy-900 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-brand-400" />
            <span>Top Organic Search Queries</span>
          </h3>

          <div className="space-y-2 text-xs">
            {searchAnalytics.map((sa) => (
              <div
                key={sa.id}
                className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between"
              >
                <span className="font-mono text-slate-900 dark:text-white font-medium">&ldquo;{sa.query}&rdquo;</span>
                <span className="text-slate-400 font-semibold">{sa.hits_count} searches</span>
              </div>
            ))}
          </div>
        </div>

        {/* Zero Results Searches */}
        <div className="p-6 rounded-2xl bg-navy-900 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <span>Zero-Result Searches (Procurement Insights)</span>
          </h3>
          <p className="text-xs text-slate-400">
            Hardware customers searched for that is currently not in the catalogue. Great candidates for new procurement orders.
          </p>

          <div className="space-y-2 text-xs">
            {zeroResultSearches.length > 0 ? (
              zeroResultSearches.map((zr) => (
                <div
                  key={zr.id}
                  className="p-2.5 rounded-xl bg-amber-950/20 border border-amber-500/30 flex items-center justify-between"
                >
                  <span className="font-mono text-amber-300 font-bold">&ldquo;{zr.query}&rdquo;</span>
                  <span className="text-xs text-amber-400/80">{zr.hits_count} missed queries</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 py-4 text-center">No zero-result searches recorded yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
