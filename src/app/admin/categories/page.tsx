import React from 'react';
import Link from 'next/link';
import { query } from '@/lib/db';
import { Layers, Plus, ExternalLink, Edit3, Trash2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminCategoriesPage() {
  const categories = await query<any[]>(
    `SELECT c.*, p.name as parent_name,
            (SELECT COUNT(*) FROM products WHERE category_id = c.id) as product_count
     FROM categories c
     LEFT JOIN categories p ON c.parent_id = p.id
     ORDER BY c.order_index ASC, c.name ASC`
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
            Hierarchy & Navigation
          </span>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Category Management ({categories.length})
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Dynamic category tree, SEO metadata, and category-based attribute templates.
          </p>
        </div>

        <button
          className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-navy-950 font-bold text-xs flex items-center gap-1.5 shadow"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      <div className="p-6 rounded-2xl bg-navy-900 border border-slate-200 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600 dark:border-slate-800 dark:text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Category Name</th>
                <th className="py-3 px-4">Parent Level</th>
                <th className="py-3 px-4">URL Slug</th>
                <th className="py-3 px-4 text-center">Products</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
              {categories.map((c) => (
                <tr key={c.id} className="hover:bg-slate-100 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                    {c.parent_id ? `↳ ${c.name}` : c.name}
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    {c.parent_name || 'Top Level'}
                  </td>
                  <td className="py-3 px-4 font-mono text-sky-700 dark:text-cyan-400">
                    /category/{c.slug}
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-slate-700 dark:text-slate-200">
                    {c.product_count}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800 text-[10px] font-bold">
                      Active
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Link
                      href={`/category/${c.slug}`}
                      target="_blank"
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:hover:text-white inline-block"
                      title="View public category page"
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
    </div>
  );
}
