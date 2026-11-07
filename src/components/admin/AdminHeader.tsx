'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Building2, Bell, Receipt, User, ShieldCheck, LogOut, ExternalLink, Menu } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';
import { useAdminSidebar } from './AdminSidebarContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/radix';

export default function AdminHeader() {
  const router = useRouter();
  const { toggleSidebar, isCollapsed } = useAdminSidebar();
  const [activeBranch, setActiveBranch] = useState('all');
  const [staffUser, setStaffUser] = useState<{
    name?: string;
    email?: string;
    role_name?: string;
    role_slug?: string;
    avatar?: string;
  } | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.userType === 'staff') {
          setStaffUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/account';
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <header className="h-16 bg-white/95 dark:bg-navy-900/90 backdrop-blur border-b border-slate-200 dark:border-slate-800 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30 transition-colors">
      {/* Left: 3-Bar Hamburger Menu Toggle & Branch Context */}
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        {/* 3-Bar Menu Toggle: Always visible on mobile; on desktop, hidden when sidebar is open, visible when sidebar is collapsed */}
        <button
          onClick={toggleSidebar}
          className={`p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all items-center justify-center border border-slate-200 dark:border-slate-700 shadow-2xs hover:scale-105 active:scale-95 shrink-0 ${
            isCollapsed ? 'flex' : 'flex lg:hidden'
          }`}
          title={isCollapsed ? 'Open Sidebar' : 'Toggle Navigation Menu'}
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5 text-slate-800 dark:text-white" />
        </button>

        {/* Mobile Header Brand Display (when sidebar is closed) */}
        <div className="flex lg:hidden items-center min-w-0">
          <span className="text-xl font-black tracking-tight text-slate-950 dark:text-white">
            CORENIX
          </span>
        </div>

        {/* Branch Context Selector (Desktop & Tablet) */}
        <div className="hidden md:flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700/80 text-xs">
          <Building2 className="w-4 h-4 text-sky-600 dark:text-cyan-400 shrink-0" />
          <span className="text-slate-500 dark:text-slate-400 font-semibold hidden lg:inline">Active Location:</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 text-slate-900 dark:text-white font-bold outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                aria-label="Select active location"
              >
                {[
                  ['all', 'All Locations (Head Office)'],
                  ['shop1', 'Shop 1 (Uttara)'],
                  ['shop2', 'Shop 2 (Dhanmondi)'],
                  ['wh', 'Main Warehouse'],
                  ['rma', 'RMA Service Hub'],
                ].find(([value]) => value === activeBranch)?.[1]}
                <span aria-hidden="true">⌄</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {[
                ['all', 'All Locations (Head Office)'],
                ['shop1', 'Shop 1 (Uttara)'],
                ['shop2', 'Shop 2 (Dhanmondi)'],
                ['wh', 'Main Warehouse'],
                ['rma', 'RMA Service Hub'],
              ].map(([value, label]) => (
                <DropdownMenuItem
                  key={value}
                  onSelect={() => setActiveBranch(value)}
                  className={activeBranch === value ? 'bg-slate-100 font-bold dark:bg-slate-800' : ''}
                >
                  {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* View Storefront Link */}
        <Link
          href="/"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors border border-slate-200 dark:border-slate-700/80"
          title="Open Public Storefront"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span className="hidden md:inline">View Store</span>
        </Link>

        {/* Quick POS Button */}
        <Link
          href="/admin/pos"
          className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-navy-950 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
          title="Point of Sale (POS)"
        >
          <Receipt className="w-4 h-4" />
          <span className="hidden sm:inline">Launch POS</span>
          <span className="sm:hidden text-[11px]">POS</span>
        </Link>

        {/* Notifications Dropdown (New Orders & Safe Stock 10 Alerts) */}
        <NotificationDropdown activeBranch={activeBranch} />

        {/* User status & Logout */}
        <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-slate-200 dark:border-slate-800 text-xs">
          <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-cyan-950 border border-sky-200 dark:border-cyan-800 flex items-center justify-center font-bold text-sky-700 dark:text-cyan-300 shrink-0">
            {staffUser?.name?.charAt(0) || 'A'}
          </div>
          <div className="hidden xl:block text-left">
            <span className="text-slate-900 dark:text-white font-bold block leading-tight truncate max-w-[120px]">
              {staffUser?.name || 'Admin User'}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-mono">
              <ShieldCheck className="w-3 h-3 text-sky-600 dark:text-cyan-400" />
              {staffUser?.role_name || 'Admin'}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/60 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
