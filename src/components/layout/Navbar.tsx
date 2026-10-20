'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  ShoppingCart,
  User,
  ShieldCheck,
  ChevronDown,
  Layers,
  Menu,
  X,
  Sparkles,
  ArrowRight,
  Calculator,
  BatteryCharging,
  CreditCard
} from 'lucide-react';
import ThemeToggle from '@/components/theme/ThemeToggle';
import CategoryNav from '@/components/layout/CategoryNav';
import { MEGA_CATEGORIES } from '@/lib/categories-data';
import { useCart } from '@/context/CartContext';

export default function Navbar() {
  const router = useRouter();
  const { cartCount } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const toolsRef = useRef<HTMLDivElement>(null);
  const [suggestions, setSuggestions] = useState<Array<{
    text: string;
    type: string;
    slug: string;
    image?: string;
    price?: number;
    discount_price?: number;
    sku?: string;
  }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedMobileCat, setExpandedMobileCat] = useState<string | null>(null);
  const [session, setSession] = useState<{ authenticated: boolean; userType: 'staff' | 'customer' | null; user: any | null }>({
    authenticated: false,
    userType: null,
    user: null,
  });
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) setSession(data);
      })
      .catch(() => {});
  }, []);

  // Autocomplete debounced search
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.suggestions || []);
          setShowSuggestions(true);
        }
      } catch (err) {
        // Fallback
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside to close autocomplete and tools dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
      if (toolsRef.current && !toolsRef.current.contains(event.target as Node)) {
        setIsToolsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setShowSuggestions(false);
    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-navy-950/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      {/* Main navigation row */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center group flex-shrink-0">
          <img
            src="/images/logo.png"
            alt="CORENIX Logo"
            className="h-9 sm:h-10 w-auto object-contain dark:hidden group-hover:scale-105 transition-transform"
          />
          <img
            src="/images/logo-dark.png"
            alt="CORENIX Logo"
            className="h-9 sm:h-10 w-auto object-contain hidden dark:block group-hover:scale-105 transition-transform"
          />
        </Link>

        {/* Global Search Bar with Live Suggestions */}
        <div className="flex-1 max-w-2xl relative" ref={searchRef}>
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
              placeholder="Search RTX 5060, Core i7, DDR5 RAM, Gaming Laptops, SKU..."
              className="w-full bg-slate-100/90 dark:bg-navy-900/90 border border-slate-200 dark:border-slate-700/80 focus:border-sky-500 dark:focus:border-brand-500 focus:bg-white dark:focus:bg-navy-900 focus:ring-2 focus:ring-sky-500/20 dark:focus:ring-brand-500/20 rounded-xl px-4 py-2.5 pl-11 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 transition-all outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
            <button
              type="submit"
              className="absolute right-2 top-2 px-3.5 py-1 bg-sky-600 hover:bg-sky-500 dark:bg-brand-500 dark:hover:bg-brand-400 text-white dark:text-navy-950 text-xs font-bold rounded-lg shadow-sm transition-all"
            >
              Search
            </button>
          </form>

          {/* Autocomplete Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fadeIn">
              <div className="p-2.5 px-3.5 border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between bg-slate-50/70 dark:bg-navy-950/50">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-sky-500 dark:text-brand-400" />
                  <span>Instant Suggestions</span>
                </span>
                <span className="text-sky-600 dark:text-brand-400 font-semibold text-[10px]">Press Enter for full search</span>
              </div>
              <ul className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                {suggestions.map((item, idx) => (
                  <li key={idx}>
                    <Link
                      href={item.slug}
                      onClick={() => setShowSuggestions(false)}
                      className="px-3.5 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/80 flex items-center justify-between transition-colors group gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {item.type === 'product' && (
                          <div className="w-11 h-11 rounded-lg bg-white dark:bg-navy-950 border border-slate-200/90 dark:border-slate-800 p-1 flex-shrink-0 flex items-center justify-center overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={item.image || 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=150&q=80'}
                              alt={item.text}
                              className="w-full h-full object-contain"
                            />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                              item.type === 'product' ? 'bg-sky-50 text-sky-700 border border-sky-200 dark:bg-cyan-950 dark:text-brand-300 dark:border-brand-800' :
                              item.type === 'category' ? 'bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800' :
                              'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800'
                            }`}>
                              {item.type}
                            </span>
                            {item.sku && (
                              <span className="text-[10px] text-slate-400 font-mono">
                                SKU: {item.sku}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-800 dark:text-slate-200 group-hover:text-sky-600 dark:group-hover:text-brand-300 font-medium truncate mt-1">
                            {item.text}
                          </div>
                        </div>
                      </div>

                      {item.type === 'product' && (item.discount_price || item.price) ? (
                        <div className="text-right flex-shrink-0">
                          <div className="text-xs font-bold text-sky-600 dark:text-brand-400">
                            ৳{(item.discount_price || item.price)?.toLocaleString()}
                          </div>
                          {item.discount_price && item.price && item.discount_price < item.price && (
                            <div className="text-[10px] text-slate-400 line-through">
                              ৳{item.price.toLocaleString()}
                            </div>
                          )}
                        </div>
                      ) : null}

                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-600 dark:group-hover:text-brand-400 group-hover:translate-x-1 transition-all shrink-0" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Action Buttons: PC Builder, Account, Cart */}
        <div className="flex items-center gap-3">
          {/* PC Builder Callout Button */}
          <Link
            href="/pc-builder"
            className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 dark:bg-brand-500/10 dark:text-brand-300 dark:border-brand-500/30 dark:hover:border-brand-500 font-semibold text-xs tracking-wide transition-all shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-sky-600 dark:text-brand-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span>PC Builder</span>
          </Link>

          {/* Calculators Dropdown */}
          <div className="relative hidden md:block" ref={toolsRef}>
            <button
              onClick={() => setIsToolsOpen(!isToolsOpen)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 text-xs font-semibold transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
            >
              <Calculator className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>Calculators</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isToolsOpen ? 'rotate-180' : ''}`} />
            </button>

            {isToolsOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-2 z-50 animate-fadeIn">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Engineering & Finance Tools
                </div>

                <Link
                  href="/ups-calculator"
                  onClick={() => setIsToolsOpen(false)}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
                >
                  <div className="w-9 h-9 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center flex-shrink-0">
                    <BatteryCharging className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-brand-400">
                      UPS & Power Station
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                      Compute load watts & backup runtime
                    </div>
                  </div>
                </Link>

                <Link
                  href="/emi-calculator"
                  onClick={() => setIsToolsOpen(false)}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
                >
                  <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400">
                      Credit Card & Bank EMI
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                      0% installment & schedule planner
                    </div>
                  </div>
                </Link>
              </div>
            )}
          </div>

          {/* Theme Toggle (Dark / Light) */}
          <ThemeToggle />

          {/* Account */}
          <Link
            href="/account"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
          >
            {session.userType === 'staff' ? (
              <>
                <ShieldCheck className="w-4 h-4 text-sky-600 dark:text-cyan-400" />
                <span className="hidden lg:inline-block font-bold text-sky-600 dark:text-cyan-400">
                  {session.user?.name?.split(' ')[0] || 'Staff'}
                </span>
              </>
            ) : session.userType === 'customer' ? (
              <>
                <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">
                  {session.user?.name?.charAt(0) || 'C'}
                </div>
                <span className="hidden lg:inline-block">
                  {session.user?.name?.split(' ')[0] || 'Account'}
                </span>
              </>
            ) : (
              <>
                <User className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <span className="hidden lg:inline-block">Sign In</span>
              </>
            )}
          </Link>

          {/* Cart Drawer Trigger */}
          <Link
            href="/cart"
            className="relative flex items-center justify-center p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-100 transition-colors"
          >
            <ShoppingCart className="w-5 h-5 text-sky-600 dark:text-brand-400" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-sky-600 dark:bg-brand-500 text-white dark:text-navy-950 font-bold text-[11px] w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Categories Mega Navigation Bar */}
      <CategoryNav />

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-navy-950 border-t border-slate-200 dark:border-slate-800 px-4 py-4 space-y-3 transition-colors shadow-xl max-h-[85vh] overflow-y-auto">
          <Link
            href="/pc-builder"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center justify-between p-3 rounded-xl bg-sky-50 dark:bg-brand-500/10 border border-sky-200 dark:border-brand-500/30 text-sky-700 dark:text-brand-300 font-bold text-sm"
          >
            <span>Interactive PC Builder</span>
            <Sparkles className="w-4 h-4 text-sky-600 dark:text-brand-400" />
          </Link>

          <Link
            href="/ups-calculator"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center justify-between p-3 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-300 font-bold text-sm"
          >
            <span>UPS & Power Station Calculator</span>
            <BatteryCharging className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          </Link>

          <Link
            href="/emi-calculator"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center justify-between p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 font-bold text-sm"
          >
            <span>Credit Card 0% EMI Calculator</span>
            <CreditCard className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </Link>

          <Link
            href="/offers"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center justify-between p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 font-bold text-sm"
          >
            <span>Hot Deals & Special Offers</span>
            <span className="text-xs px-2 py-0.5 rounded bg-amber-200 dark:bg-amber-900 font-black">SAVE</span>
          </Link>

          {/* Categories Accordion */}
          <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
              Browse Categories
            </div>
            {MEGA_CATEGORIES.map((cat) => {
              const isExpanded = expandedMobileCat === cat.slug;
              const subItems = cat.columns ? cat.columns.flat() : cat.items || [];
              return (
                <div key={cat.slug} className="border border-slate-100 dark:border-slate-800/80 rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-50 dark:bg-navy-900">
                    <Link
                      href={`/category/${cat.slug}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-sm font-semibold text-slate-800 dark:text-slate-200 hover:text-red-600 dark:hover:text-red-400"
                    >
                      {cat.name}
                    </Link>
                    {subItems.length > 0 && (
                      <button
                        onClick={() => setExpandedMobileCat(isExpanded ? null : cat.slug)}
                        className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>
                    )}
                  </div>
                  {isExpanded && subItems.length > 0 && (
                    <div className="px-3.5 py-2 bg-white dark:bg-navy-950 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                      {subItems.map((sub) => (
                        <div key={sub.slug} className="py-1">
                          <Link
                            href={`/category/${sub.slug}`}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="block text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400"
                          >
                            {sub.name}
                          </Link>
                          {sub.children && sub.children.length > 0 && (
                            <div className="pl-3 mt-1 space-y-1 border-l-2 border-slate-100 dark:border-slate-800">
                              {sub.children.map((child) => (
                                <Link
                                  key={child.slug}
                                  href={`/category/${child.slug}`}
                                  onClick={() => setIsMobileMenuOpen(false)}
                                  className="block text-[11px] text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400"
                                >
                                  {child.name}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <Link href="/stores" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-sky-600 dark:hover:text-brand-400">Showrooms</Link>
            <Link href="/rma" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-sky-600 dark:hover:text-brand-400">RMA Hub</Link>
            <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)} className="text-sky-600 dark:text-brand-400 font-semibold">Admin</Link>
            <ThemeToggle />
          </div>
        </div>
      )}
    </header>
  );
}
