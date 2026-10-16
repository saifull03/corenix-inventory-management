import React from 'react';
import Link from 'next/link';
import { Cpu, ShieldCheck, MapPin, Phone, Mail, Clock, CreditCard, Award, Truck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-50 dark:bg-navy-950 border-t border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-sm mt-20 transition-colors">
      {/* Value Proposition Highlights */}
      <div className="border-b border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-navy-900/50">
        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 border border-sky-200 dark:bg-cyan-950 dark:border-brand-500/30 dark:text-brand-400 flex items-center justify-center flex-shrink-0 shadow-2xs">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-slate-900 dark:text-white font-bold text-sm">100% Genuine Tech</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Official distributor warranty directly from brands.</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-950 dark:border-blue-500/30 dark:text-blue-400 flex items-center justify-center flex-shrink-0 shadow-2xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-slate-900 dark:text-white font-bold text-sm">Dedicated RMA Center</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Live service tracking and component repair hub.</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950 dark:border-emerald-500/30 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 shadow-2xs">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-slate-900 dark:text-white font-bold text-sm">Rapid Delivery & Pickup</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Pick up from Shop 1, Shop 2 or ship across BD.</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 border border-purple-200 dark:bg-purple-950 dark:border-purple-500/30 dark:text-purple-400 flex items-center justify-center flex-shrink-0 shadow-2xs">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-slate-900 dark:text-white font-bold text-sm">EMI & Digital Payments</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">0% EMI on major credit cards, bKash & Nagad.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand & Overview */}
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-600 to-cyan-400 flex items-center justify-center shadow-sm">
              <Cpu className="w-5 h-5 text-white font-bold" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">CORENIX</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            CORENIX is Bangladesh&apos;s state-of-the-art enterprise computing and enthusiast hardware destination. Complete database-driven retail, inventory, POS, and custom PC engineering.
          </p>
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <Phone className="w-3.5 h-3.5 text-sky-600 dark:text-brand-400" />
              <span>+880 9600-267364</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <Mail className="w-3.5 h-3.5 text-sky-600 dark:text-brand-400" />
              <span>support@corenix.com.bd</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <Clock className="w-3.5 h-3.5 text-sky-600 dark:text-brand-400" />
              <span>Saturday - Thursday: 10:00 AM - 9:00 PM</span>
            </div>
          </div>
        </div>

        {/* Physical Showrooms & Hubs */}
        <div className="space-y-3">
          <h4 className="text-slate-900 dark:text-white font-bold text-xs uppercase tracking-wider text-sky-700 dark:text-brand-400">
            Showrooms & Locations
          </h4>
          <ul className="space-y-3 text-xs">
            <li className="space-y-0.5">
              <strong className="text-slate-800 dark:text-slate-200 flex items-center gap-1 font-semibold">
                <MapPin className="w-3.5 h-3.5 text-sky-600 dark:text-brand-400" /> Shop 1: Uttara Flagship
              </strong>
              <p className="text-slate-500 dark:text-slate-400 pl-4">Sector 3, Uttara Model Town, Dhaka-1230</p>
            </li>
            <li className="space-y-0.5">
              <strong className="text-slate-800 dark:text-slate-200 flex items-center gap-1 font-semibold">
                <MapPin className="w-3.5 h-3.5 text-sky-600 dark:text-brand-400" /> Shop 2: Dhanmondi Branch
              </strong>
              <p className="text-slate-500 dark:text-slate-400 pl-4">Road 27, Dhanmondi, Dhaka-1209</p>
            </li>
            <li className="space-y-0.5">
              <strong className="text-slate-800 dark:text-slate-200 flex items-center gap-1 font-semibold">
                <MapPin className="w-3.5 h-3.5 text-sky-600 dark:text-brand-400" /> Central Distribution
              </strong>
              <p className="text-slate-500 dark:text-slate-400 pl-4">Tejgaon Industrial Area, Dhaka-1208</p>
            </li>
            <li className="space-y-0.5">
              <strong className="text-slate-800 dark:text-slate-200 flex items-center gap-1 font-semibold">
                <MapPin className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" /> RMA & Service Hub
              </strong>
              <p className="text-slate-500 dark:text-slate-400 pl-4">Level 4, IT Plaza, Agargaon, Dhaka</p>
            </li>
          </ul>
        </div>

        {/* Quick Links */}
        <div className="space-y-3">
          <h4 className="text-slate-900 dark:text-white font-bold text-xs uppercase tracking-wider text-sky-700 dark:text-brand-400">
            Help & Enterprise
          </h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/about" className="hover:text-sky-600 dark:hover:text-white transition-colors">About CORENIX</Link></li>
            <li><Link href="/pc-builder" className="hover:text-sky-600 dark:hover:text-white transition-colors">PC Compatibility Builder</Link></li>
            <li><Link href="/ups-calculator" className="hover:text-sky-600 dark:hover:text-white transition-colors font-semibold text-sky-600 dark:text-cyan-400">UPS & Power Station Calculator</Link></li>
            <li><Link href="/emi-calculator" className="hover:text-sky-600 dark:hover:text-white transition-colors font-semibold text-purple-600 dark:text-purple-400">Credit Card EMI Calculator</Link></li>
            <li><Link href="/rma" className="hover:text-sky-600 dark:hover:text-white transition-colors">RMA Case Tracking</Link></li>
            <li><Link href="/warranty-policy" className="hover:text-sky-600 dark:hover:text-white transition-colors">Warranty & Service Policy</Link></li>
            <li><Link href="/stores" className="hover:text-sky-600 dark:hover:text-white transition-colors">Branch Showroom Locator</Link></li>
            <li><Link href="/complaint" className="hover:text-sky-600 dark:hover:text-white transition-colors">Executive Complaint Cell</Link></li>
            <li><Link href="/admin" className="hover:text-sky-600 dark:hover:text-brand-400 font-semibold transition-colors">Admin & Staff Portal</Link></li>
          </ul>
        </div>

        {/* Newsletter & SEO Landing Links */}
        <div className="space-y-3">
          <h4 className="text-slate-900 dark:text-white font-bold text-xs uppercase tracking-wider text-sky-700 dark:text-brand-400">
            Hot Hardware Hubs
          </h4>
          <div className="flex flex-wrap gap-1.5 text-xs">
            <Link href="/category/graphics-card" className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 transition-colors shadow-2xs font-medium">
              RTX 5060
            </Link>
            <Link href="/category/laptops" className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 transition-colors shadow-2xs font-medium">
              Gaming Laptop
            </Link>
            <Link href="/category/storage" className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 transition-colors shadow-2xs font-medium">
              1TB NVMe SSD
            </Link>
            <Link href="/category/processor" className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 transition-colors shadow-2xs font-medium">
              Core i7 14th Gen
            </Link>
            <Link href="/brand/msi" className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 transition-colors shadow-2xs font-medium">
              MSI Official
            </Link>
            <Link href="/brand/asus" className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 transition-colors shadow-2xs font-medium">
              ASUS ROG
            </Link>
          </div>
          <div className="pt-2 text-xs">
            <p className="text-slate-500 dark:text-slate-400 mb-2">Subscribe for early GPU stock drop notifications:</p>
            <div className="flex items-center gap-1.5">
              <input
                type="email"
                placeholder="Enter your email"
                className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 flex-1 shadow-2xs"
              />
              <button className="bg-sky-600 hover:bg-sky-500 dark:bg-brand-500 dark:hover:bg-brand-600 text-white dark:text-navy-950 font-bold px-3.5 py-2 rounded-xl text-xs transition-colors shadow-xs">
                Join
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Copyright & Payment Badges */}
      <div className="border-t border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-navy-900 px-4 py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} CORENIX Technologies Ltd. All Rights Reserved. Enterprise Architecture.</p>
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-semibold text-[11px] flex-wrap">
            <span>Supported Payments:</span>
            <span className="px-2 py-0.5 rounded-md bg-pink-50 text-pink-700 border border-pink-200 dark:bg-pink-950 dark:text-pink-300 dark:border-pink-800">bKash</span>
            <span className="px-2 py-0.5 rounded-md bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800">Nagad</span>
            <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800">Visa / Master</span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800">Cash on Delivery</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
