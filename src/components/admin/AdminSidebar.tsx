'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Layers,
  Tag,
  Sliders,
  Warehouse,
  ArrowRightLeft,
  Building2,
  ShoppingCart,
  Receipt,
  Truck,
  Store,
  Wrench,
  DollarSign,
  BarChart3,
  Search,
  Users,
  CheckSquare,
  RefreshCw,
  FileText,
  ExternalLink,
  LayoutTemplate,
  X,
  PanelLeftClose,
} from 'lucide-react';
import { useAdminSidebar } from './AdminSidebarContext';

interface MenuItemDef {
  label: string;
  href: string;
  icon: any;
  indent?: boolean;
  superAdminOnly?: boolean;
  purchaseAccess?: boolean; // Accounts Manager, Admin, HR, Store/Shop Manager
  purchaseManageOnly?: boolean; // Accounts Manager, Admin, HR, Super Admin, Purchase Manager
  financeAccess?: boolean; // Accounts Manager, Admin, HR, Super Admin
  hrOrAdminOnly?: boolean; // Super Admin, Admin, HR Manager
}

const rawMenuItems: MenuItemDef[] = [
  { label: 'Executive Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Products Catalogue', href: '/admin/products', icon: Package },
  { label: 'Add New Product', href: '/admin/products/create', icon: Package, indent: true },
  { label: 'Categories', href: '/admin/categories', icon: Layers },
  { label: 'Brands', href: '/admin/brands', icon: Tag },
  { label: 'Dynamic Attributes', href: '/admin/attributes', icon: Sliders },
  { label: 'Multi-Branch Inventory', href: '/admin/inventory', icon: Warehouse },
  { label: 'Stock Transfer', href: '/admin/inventory/transfer', icon: ArrowRightLeft, indent: true },
  { label: 'Branches & Locations', href: '/admin/branches', icon: Building2 },
  { label: 'Customer Orders', href: '/admin/orders', icon: ShoppingCart },
  { label: 'Point of Sale (POS)', href: '/admin/pos', icon: Receipt },
  { label: 'Purchases & Procurement', href: '/admin/purchases', icon: Truck, purchaseAccess: true },
  { label: 'Other House & Lend', href: '/admin/purchases/other-house', icon: Store, indent: true, purchaseAccess: true },
  { label: 'Suppliers Management', href: '/admin/suppliers', icon: Building2, purchaseManageOnly: true },
  { label: 'RMA & Service Center', href: '/admin/rma', icon: Wrench },
  { label: 'Expenses & Finance', href: '/admin/expenses', icon: DollarSign, financeAccess: true },
  { label: 'Reports & Profit Analysis', href: '/admin/reports', icon: BarChart3, financeAccess: true },
  { label: 'SEO & Landing Pages', href: '/admin/seo', icon: Search },
  { label: 'Banners & Slider', href: '/admin/banners', icon: LayoutTemplate },
  { label: 'Users & Staff RBAC', href: '/admin/users', icon: Users, hrOrAdminOnly: true },
  { label: 'Operator Approvals', href: '/admin/approvals', icon: CheckSquare },
  { label: 'ERP Integration Sync', href: '/admin/erp', icon: RefreshCw },
  { label: 'Enterprise Audit Trail', href: '/admin/activity-log', icon: FileText, superAdminOnly: true },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { isCollapsed, isMobileOpen, setIsMobileOpen, toggleSidebar } = useAdminSidebar();
  const [currentUser, setCurrentUser] = useState<{
    name?: string;
    role_name?: string;
    role_slug?: string;
    role_id?: number;
  } | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.userType === 'staff' && data.user) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  const roleSlug = (currentUser?.role_slug || '').toLowerCase().replace(/_/g, '-');
  const roleName = (currentUser?.role_name || '').toLowerCase();

  const isSuperAdmin = Boolean(
    currentUser &&
      (roleSlug === 'super-admin' ||
        roleSlug === 'superadmin' ||
        roleName.includes('super admin') ||
        currentUser.role_id === 1)
  );

  const canManagePurchasesRole = Boolean(
    isSuperAdmin ||
      roleSlug === 'admin' ||
      roleSlug === 'accounts-manager' ||
      roleSlug === 'account-manager' ||
      roleSlug === 'hr' ||
      roleSlug === 'hr-manager' ||
      roleSlug === 'purchase-manager' ||
      roleName.includes('account') ||
      roleName.includes('admin') ||
      roleName.includes('hr') ||
      roleName.includes('purchase manager')
  );

  const isStoreManager = Boolean(
    roleSlug === 'shop-manager' ||
      roleSlug === 'store-manager' ||
      roleName.includes('shop manager') ||
      roleName.includes('store manager')
  );

  const canAccessPurchases = Boolean(canManagePurchasesRole || isStoreManager);

  const isHrOrAdmin = Boolean(
    isSuperAdmin ||
      roleSlug === 'admin' ||
      roleSlug === 'hr' ||
      roleSlug === 'hr-manager' ||
      roleName.includes('admin') ||
      roleName.includes('hr')
  );

  const menuItems = rawMenuItems.filter((item) => {
    if (item.superAdminOnly && !isSuperAdmin) return false;
    if (item.purchaseManageOnly && !canManagePurchasesRole) return false;
    if (item.purchaseAccess && !canAccessPurchases) return false;
    if (item.financeAccess && !canManagePurchasesRole) return false;
    if (item.hrOrAdminOnly && !isHrOrAdmin) return false;
    return true;
  });

  const handleLinkClick = () => {
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        className={`
          fixed lg:sticky top-0 z-50 lg:z-30 h-screen bg-white dark:bg-navy-900 border-r border-slate-200 dark:border-slate-800
          flex flex-col justify-between overflow-y-auto transition-all duration-300 ease-in-out
          ${/* Mobile Drawer Styling */ ''}
          ${isMobileOpen ? 'translate-x-0 w-72 max-w-[85vw] shadow-2xl' : '-translate-x-full lg:translate-x-0'}
          ${/* Desktop Collapsible Width */ ''}
          ${isCollapsed ? 'lg:w-0 lg:overflow-hidden lg:border-r-0 lg:opacity-0 lg:pointer-events-none' : 'lg:w-64 lg:opacity-100'}
        `}
      >
        <div>
          {/* Brand Header & Toggle Controls */}
          <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 bg-slate-50/50 dark:bg-navy-950/40">
            <Link href="/admin" onClick={handleLinkClick} className="flex items-center gap-2 min-w-0 group">
              <img
                src="/images/logo.png"
                alt="CORENIX"
                className="h-8 w-auto object-contain dark:hidden group-hover:scale-105 transition-transform"
              />
              <img
                src="/images/logo-dark.png"
                alt="CORENIX"
                className="h-8 w-auto object-contain hidden dark:block group-hover:scale-105 transition-transform"
              />
              <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-sky-100 text-sky-700 dark:bg-sky-950/80 dark:text-cyan-300 border border-sky-200 dark:border-sky-800 tracking-wider">
                Hub
              </span>
            </Link>

            <div className="flex items-center gap-1 shrink-0">
              <Link
                href="/"
                target="_blank"
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                title="View Storefront"
              >
                <ExternalLink className="w-4 h-4" />
              </Link>

              {/* Close / Collapse Button */}
              <button
                onClick={toggleSidebar}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                title="Hide / Collapse Menu"
              >
                <span className="hidden lg:inline" title="Collapse Sidebar"><PanelLeftClose className="w-4 h-4" /></span>
                <span className="lg:hidden" title="Close Menu"><X className="w-4 h-4" /></span>
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 text-xs font-semibold">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleLinkClick}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors ${
                    item.indent ? 'pl-7 text-[11px]' : ''
                  } ${
                    isActive
                      ? 'bg-sky-600 text-white font-bold shadow-md shadow-sky-600/20 dark:bg-brand-500 dark:text-navy-950 dark:shadow-cyan-500/10'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/70 dark:hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white dark:text-navy-950' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Role Badge and System Status */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-navy-950/60 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-cyan-950 border border-sky-200 dark:border-brand-500/30 flex items-center justify-center font-bold text-sky-700 dark:text-brand-400 shrink-0">
              {(currentUser?.role_name || 'SA').slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-slate-900 dark:text-white font-bold block truncate">
                {currentUser?.role_name || 'Super Administrator'}
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-mono font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                Active Access
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

