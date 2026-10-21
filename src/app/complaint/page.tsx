'use client';

import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { AlertCircle, CheckCircle2, MessageSquareWarning, Send } from 'lucide-react';

export default function ComplaintPage() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', category: 'General', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; text: string } | null>(null);

  function update(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setResult(null);
    try {
      const response = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Unable to submit your complaint.');
      setResult({ success: true, text: `Complaint #${data.complaintId} submitted. Our team will review it shortly.` });
      setForm({ name: '', phone: '', email: '', category: 'General', subject: '', message: '' });
    } catch (error: any) {
      setResult({ success: false, text: error.message || 'Unable to submit your complaint. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  }

  const fieldClass = 'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 dark:bg-navy-950 dark:text-slate-100">
      <Navbar />
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-12">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-navy-900 sm:p-10">
          <div className="mb-8 flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
              <MessageSquareWarning className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-cyan-400">Customer Support</p>
              <h1 className="mt-1 text-3xl font-black text-slate-900 dark:text-white">Submit a Complaint</h1>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Tell us what happened. A member of our team will review your concern.</p>
            </div>
          </div>

          {result && (
            <div role="status" className={`mb-6 flex items-start gap-3 rounded-xl border p-4 text-sm ${result.success ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300' : 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300'}`}>
              {result.success ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" /> : <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />}
              <span>{result.text}</span>
            </div>
          )}

          <form onSubmit={submit} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="space-y-2 text-sm font-semibold">Your name<input required maxLength={150} value={form.name} onChange={(e) => update('name', e.target.value)} className={fieldClass} autoComplete="name" /></label>
              <label className="space-y-2 text-sm font-semibold">Phone number<input required maxLength={40} value={form.phone} onChange={(e) => update('phone', e.target.value)} className={fieldClass} autoComplete="tel" /></label>
              <label className="space-y-2 text-sm font-semibold">Email address <span className="font-normal text-slate-400">(optional)</span><input type="email" maxLength={190} value={form.email} onChange={(e) => update('email', e.target.value)} className={fieldClass} autoComplete="email" /></label>
              <label className="space-y-2 text-sm font-semibold">Complaint category<select value={form.category} onChange={(e) => update('category', e.target.value)} className={fieldClass}><option>General</option><option>Product or warranty</option><option>Order or delivery</option><option>Payment or refund</option><option>Staff or service</option><option>Other</option></select></label>
            </div>
            <label className="block space-y-2 text-sm font-semibold">Subject<input required maxLength={200} value={form.subject} onChange={(e) => update('subject', e.target.value)} className={fieldClass} /></label>
            <label className="block space-y-2 text-sm font-semibold">Complaint details<textarea required maxLength={10000} rows={6} value={form.message} onChange={(e) => update('message', e.target.value)} className={`${fieldClass} resize-y`} /></label>
            <button disabled={submitting} type="submit" className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-sky-500 disabled:cursor-wait disabled:opacity-60 dark:bg-brand-500 dark:text-navy-950">
              <Send className="h-4 w-4" />{submitting ? 'Submitting…' : 'Submit complaint'}
            </button>
          </form>
        </section>
      </main>
      <Footer />
    </div>
  );
}
