'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, Clock3, Mail, MessageSquareWarning, Phone, RefreshCw, Search, X } from 'lucide-react';

type Complaint = {
  id: number;
  customer_name: string;
  email: string | null;
  phone: string;
  category: string;
  subject: string;
  message: string;
  status: 'new' | 'in_review' | 'resolved' | 'closed';
  admin_note: string | null;
  created_at: string;
};

const statuses = [
  { value: 'new', label: 'New' },
  { value: 'in_review', label: 'In review' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
] as const;

const statusStyle: Record<string, string> = {
  new: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
  in_review: 'bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-cyan-300',
  resolved: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
  closed: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
};

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [selected, setSelected] = useState<Complaint | null>(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  async function loadComplaints() {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/complaints');
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Could not load complaints.');
      setComplaints(data.complaints || []);
    } catch (err: any) {
      setError(err.message || 'Could not load complaints.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadComplaints(); }, []);
  useEffect(() => { setNote(selected?.admin_note || ''); }, [selected?.id]);

  const counts = useMemo(() => ({
    all: complaints.length,
    new: complaints.filter((item) => item.status === 'new').length,
    in_review: complaints.filter((item) => item.status === 'in_review').length,
    resolved: complaints.filter((item) => item.status === 'resolved').length,
  }), [complaints]);

  const visible = complaints.filter((item) => {
    const matchesStatus = filter === 'all' || item.status === filter;
    const term = search.toLowerCase().trim();
    const matchesSearch = !term || [item.customer_name, item.phone, item.email, item.subject, item.category, String(item.id)]
      .some((value) => String(value || '').toLowerCase().includes(term));
    return matchesStatus && matchesSearch;
  });

  async function saveComplaint() {
    if (!selected) return;
    setSaving(true);
    setError('');
    try {
      const response = await fetch('/api/admin/complaints', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selected.id, status: selected.status, adminNote: note }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Could not update complaint.');
      const updated = { ...selected, admin_note: note };
      setComplaints((current) => current.map((item) => item.id === selected.id ? updated : item));
      setSelected(updated);
    } catch (err: any) {
      setError(err.message || 'Could not update complaint.');
    } finally {
      setSaving(false);
    }
  }

  function setStatus(status: Complaint['status']) {
    if (!selected) return;
    const updated = { ...selected, status };
    setSelected(updated);
    setComplaints((current) => current.map((item) => item.id === selected.id ? updated : item));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-cyan-400">Customer Care</span>
          <h1 className="mt-1 flex items-center gap-2 text-2xl font-black text-slate-900 dark:text-white"><MessageSquareWarning className="h-6 w-6 text-sky-600 dark:text-cyan-400" />Complaints</h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Review customer concerns and record follow-up notes.</p>
        </div>
        <button onClick={loadComplaints} className="inline-flex items-center gap-2 self-start rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-800">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />Refresh
        </button>
      </div>

      {error && <div role="alert" className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300"><AlertCircle className="h-4 w-4" />{error}</div>}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ['All complaints', counts.all, MessageSquareWarning],
          ['New', counts.new, AlertCircle],
          ['In review', counts.in_review, Clock3],
          ['Resolved', counts.resolved, CheckCircle2],
        ].map(([label, count, Icon]: any) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-navy-900">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400"><span>{label}</span><Icon className="h-4 w-4 text-sky-600 dark:text-cyan-400" /></div>
            <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{count}</div>
          </div>
        ))}
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-navy-900">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-1 overflow-x-auto">
            {[['all', 'All'], ...statuses.map(({ value, label }) => [value, label] as [string, string])].map(([value, label]) => (
              <button key={value} onClick={() => setFilter(value)} className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-bold ${filter === value ? 'bg-sky-600 text-white dark:bg-brand-500 dark:text-navy-950' : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'}`}>{label}</button>
            ))}
          </div>
          <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 dark:border-slate-700"><Search className="h-4 w-4 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search complaints" className="w-full bg-transparent py-2 text-xs outline-none sm:w-52" /></label>
        </div>

        {loading ? <div className="p-12 text-center text-sm text-slate-500">Loading complaints…</div> : visible.length === 0 ? (
          <div className="p-12 text-center"><MessageSquareWarning className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600" /><p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-300">No complaints found</p><p className="mt-1 text-xs text-slate-500">New customer submissions will appear here.</p></div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {visible.map((item) => (
              <button key={item.id} onClick={() => setSelected(item)} className="flex w-full flex-col items-start gap-3 p-4 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/50 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2"><span className="text-xs font-bold text-sky-700 dark:text-cyan-300">#{item.id}</span><span className="truncate text-sm font-bold text-slate-900 dark:text-white">{item.subject}</span><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${statusStyle[item.status]}`}>{statuses.find((status) => status.value === item.status)?.label}</span></div>
                  <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">{item.customer_name} · {item.phone} · {item.category}</p>
                </div>
                <time className="shrink-0 text-[11px] text-slate-400">{new Date(item.created_at).toLocaleString()}</time>
              </button>
            ))}
          </div>
        )}
      </section>

      {selected && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="complaint-dialog-title" className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-navy-900">
            <div className="flex items-start justify-between border-b border-slate-200 p-5 dark:border-slate-800 sm:p-6">
              <div><p className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-cyan-400">Complaint #{selected.id}</p><h2 id="complaint-dialog-title" className="mt-1 text-xl font-black text-slate-900 dark:text-white">{selected.subject}</h2></div>
              <button onClick={() => setSelected(null)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Close"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-5 p-5 sm:p-6">
              <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-600 dark:text-slate-300">
                <span className="font-bold text-slate-900 dark:text-white">{selected.customer_name}</span>
                <a href={`tel:${selected.phone}`} className="inline-flex items-center gap-1.5 hover:text-sky-600"><Phone className="h-3.5 w-3.5" />{selected.phone}</a>
                {selected.email && <a href={`mailto:${selected.email}`} className="inline-flex items-center gap-1.5 hover:text-sky-600"><Mail className="h-3.5 w-3.5" />{selected.email}</a>}
                <span>{selected.category}</span><span>{new Date(selected.created_at).toLocaleString()}</span>
              </div>
              <div className="whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-700 dark:bg-slate-800/60 dark:text-slate-200">{selected.message}</div>
              <label className="block space-y-2 text-xs font-bold text-slate-700 dark:text-slate-300">Status<select value={selected.status} onChange={(event) => setStatus(event.target.value as Complaint['status'])} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900">{statuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}</select></label>
              <label className="block space-y-2 text-xs font-bold text-slate-700 dark:text-slate-300">Internal follow-up note<textarea rows={3} maxLength={10000} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Add an internal note for the team…" className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal dark:border-slate-700 dark:bg-slate-900" /></label>
              <div className="flex justify-end"><button onClick={saveComplaint} disabled={saving} className="rounded-xl bg-sky-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-sky-500 disabled:opacity-60 dark:bg-brand-500 dark:text-navy-950">{saving ? 'Saving…' : 'Save updates'}</button></div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
