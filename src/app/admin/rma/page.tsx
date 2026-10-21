import React from 'react';
import Link from 'next/link';
import { query } from '@/lib/db';
import { Wrench, ShieldCheck, DollarSign, Clock, CheckCircle2, User, Building2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminRmaPage() {
  const rmaCases = await query<any[]>(
    `SELECT r.*, p.name as product_name, p.sku as product_sku,
            t.name as technician_name, sv.name as vendor_name
     FROM rma_cases r
     JOIN products p ON r.product_id = p.id
     LEFT JOIN technicians t ON r.technician_id = t.id
     LEFT JOIN service_vendors sv ON r.vendor_id = sv.id
     ORDER BY r.id DESC`
  );

  const technicians = await query<any[]>(`SELECT * FROM technicians WHERE is_active = 1`);

  const totalRmaCost = rmaCases.reduce((sum, c) => sum + Number(c.total_rma_cost || 0), 0);
  const activeCases = rmaCases.filter(c => c.status !== 'closed' && c.status !== 'delivered').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
            Warranty & Service Engineering
          </span>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            RMA & Service Hub Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Component diagnostics, status pipeline, technician assignment, and complete RMA cost tracking.
          </p>
        </div>

        <button
          className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-navy-950 font-bold text-xs flex items-center gap-1.5 shadow"
        >
          <Wrench className="w-4 h-4" />
          <span>New RMA Case</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-navy-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold block">Total RMA Cases</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white">{rmaCases.length} Cases</span>
          <span className="text-xs text-slate-400 mt-1 block">Lifetime volume</span>
        </div>

        <div className="p-4 rounded-2xl bg-navy-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold block">Active in Hub</span>
          <span className="text-2xl font-black text-amber-400">{activeCases} Active</span>
          <span className="text-xs text-amber-400/80 mt-1 block">Under inspection & repair</span>
        </div>

        <div className="p-4 rounded-2xl bg-navy-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold block">Total RMA Cost</span>
          <span className="text-2xl font-black text-rose-400">৳{totalRmaCost.toLocaleString()}</span>
          <span className="text-xs text-slate-400 mt-1 block">Parts + Labor + Transport</span>
        </div>

        <div className="p-4 rounded-2xl bg-navy-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold block">Certified Techs</span>
          <span className="text-2xl font-black text-brand-400">{technicians.length} In-House</span>
          <span className="text-xs text-slate-400 mt-1 block">Agargaon Service Hub</span>
        </div>
      </div>

      {/* RMA Table */}
      <div className="p-6 rounded-2xl bg-navy-900 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Live Service Tickets</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600 dark:border-slate-800 dark:text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">RMA # & Date</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Component & Serial</th>
                <th className="py-3 px-4">Technician</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">RMA Cost Breakdown</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {rmaCases.map((r) => (
                <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-brand-400 block">{r.rma_number}</span>
                    <span className="text-[10px] text-slate-500">{new Date(r.created_at).toLocaleDateString()}</span>
                  </td>

                  <td className="py-3 px-4">
                    <span className="text-slate-900 dark:text-white font-bold block">{r.customer_name}</span>
                    <span className="text-[10px] text-slate-400">{r.customer_phone}</span>
                  </td>

                  <td className="py-3 px-4 max-w-xs">
                    <span className="text-slate-900 dark:text-white font-medium block truncate" title={r.product_name}>
                      {r.product_name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">SN: {r.serial_number}</span>
                  </td>

                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                    {r.technician_name || 'Unassigned'}
                  </td>

                  <td className="py-3 px-4 text-center">
                    <span className="px-2.5 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-brand-500/40 font-bold text-[10px] uppercase">
                      {r.status}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <span className="font-mono font-black text-rose-400 block">
                      ৳{Number(r.total_rma_cost || 0).toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Parts: ৳{r.parts_cost || 0} • Labor: ৳{r.labor_cost || 0}
                    </span>
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
