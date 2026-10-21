'use client';

import React, { useState } from 'react';
import { RefreshCw, CheckCircle2, ArrowRightLeft, Database, ShieldCheck, Clock, AlertTriangle } from 'lucide-react';

export default function AdminErpPage() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState('2026-09-30 11:30 AM');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success'>('idle');

  const handleTriggerSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setSyncStatus('success');
      setLastSyncTime(new Date().toLocaleTimeString());
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
            Enterprise Connectors
          </span>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            ERP & External System Synchronization
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Bi-directional sync between CORENIX MySQL (primary source of truth) and enterprise ERP accounting layers.
          </p>
        </div>

        <button
          onClick={handleTriggerSync}
          disabled={isSyncing}
          className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-navy-950 font-bold text-xs flex items-center gap-2 shadow disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Syncing with ERP...' : 'Trigger Instant Manual Sync'}</span>
        </button>
      </div>

      {syncStatus === 'success' && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>ERP Sync cycle completed successfully! 14 catalogue updates & 2 orders pushed to ERP ledger.</span>
        </div>
      )}

      {/* Sync Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-navy-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Sync State</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-xl font-black text-emerald-400 block">Connected & Healthy</span>
          <span className="text-xs text-slate-400">Last Synced: {lastSyncTime}</span>
        </div>

        <div className="p-5 rounded-2xl bg-navy-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Inbound Pipeline</span>
            <ArrowRightLeft className="w-4 h-4 text-brand-400" />
          </div>
          <span className="text-xl font-black text-slate-900 dark:text-white block">ERP ➔ CORENIX</span>
          <span className="text-xs text-slate-400">Supplier costs, new barcodes & stock</span>
        </div>

        <div className="p-5 rounded-2xl bg-navy-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Outbound Pipeline</span>
            <Database className="w-4 h-4 text-purple-400" />
          </div>
          <span className="text-xl font-black text-slate-900 dark:text-white block">CORENIX ➔ ERP</span>
          <span className="text-xs text-slate-400">Confirmed orders, customer ledger & VAT</span>
        </div>
      </div>

      {/* Recent Sync Logs */}
      <div className="p-6 rounded-2xl bg-navy-900 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Automated ERP Sync Log Trail</h3>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600 dark:border-slate-800 dark:text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Direction</th>
                <th className="py-3 px-4">Module</th>
                <th className="py-3 px-4 text-center">Items Synced</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Summary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              <tr className="hover:bg-slate-800/40">
                <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">2026-09-30 11:30:12</td>
                <td className="py-3 px-4 font-semibold text-brand-400">Inbound (ERP ➔ Web)</td>
                <td className="py-3 px-4 text-slate-900 dark:text-white">Prices & Stock</td>
                <td className="py-3 px-4 text-center font-bold">12 Items</td>
                <td className="py-3 px-4 text-center">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold text-[10px]">
                    Success
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-400">Updated RTX 5060 price to ৳46,900</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">2026-09-30 10:15:00</td>
                <td className="py-3 px-4 font-semibold text-purple-400">Outbound (Web ➔ ERP)</td>
                <td className="py-3 px-4 text-slate-900 dark:text-white">Orders & Invoices</td>
                <td className="py-3 px-4 text-center font-bold">1 Order</td>
                <td className="py-3 px-4 text-center">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold text-[10px]">
                    Success
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-400">Exported Order CRX-2026-1001 for General Ledger</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
