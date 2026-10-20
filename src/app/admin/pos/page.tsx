'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import {
  Receipt,
  Search,
  ShoppingCart,
  Trash2,
  Printer,
  CreditCard,
  Building2,
  CheckCircle2,
  User,
  Plus,
  Minus,
  Store,
  Tag,
  Cpu,
  Monitor,
  HardDrive,
  Layers,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  X,
  History,
  QrCode,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  FileText,
  DollarSign,
  ArrowRight,
  Eye,
  Check,
  Zap,
} from 'lucide-react';

interface SerialItem {
  id: number | string;
  serial_number: string;
  barcode?: string;
  status: string;
}

interface ProductItem {
  id: number | string;
  original_oh_id?: number;
  name: string;
  sku: string;
  model?: string;
  barcode?: string;
  selling_price: number;
  discount_price?: number | null;
  purchase_cost: number;
  stock_quantity: number;
  available_serials: SerialItem[];
  is_serialized: boolean;
  is_other_house: boolean;
  house_name?: string;
  primary_image: string;
  warranty_period?: string;
  is_pc_builder?: boolean;
  pc_builder_component?: string | null;
}

interface CartItem {
  id: string; // unique cart line ID
  productId: number | string;
  originalOhId?: number;
  name: string;
  sku: string;
  model?: string;
  barcode?: string;
  serialNumber?: string;
  unitPrice: number;
  unitCost: number;
  qty: number;
  maxStock: number;
  isSerialized: boolean;
  isOtherHouse: boolean;
  house_name?: string;
  warranty: string;
  isCustomPcComponent?: boolean;
  componentType?: string;
}

interface BranchOption {
  id: number;
  name: string;
  code: string;
  type: string;
}

export default function PosPage() {
  // Staff & Branch Context
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [branches, setBranches] = useState<BranchOption[]>([
    { id: 2, name: 'Shop 1 (Uttara Flagship)', code: 'SHOP-1', type: 'shop' },
    { id: 3, name: 'Shop 2 (Dhanmondi Branch)', code: 'SHOP-2', type: 'shop' },
    { id: 1, name: 'Central Main Warehouse', code: 'WH-MAIN', type: 'warehouse' },
  ]);
  const [selectedBranchId, setSelectedBranchId] = useState<number>(2);

  // Products & Search
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  // Cart & Customer
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [customerPhone, setCustomerPhone] = useState('01700000000');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash_pos' | 'card' | 'bkash' | 'nagad' | 'bank_transfer'>('cash_pos');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [notes, setNotes] = useState('');

  // Modals & Active View States
  const [activeTab, setActiveTab] = useState<'pos' | 'history'>('pos');
  const [isSerialModalOpen, setIsSerialModalOpen] = useState(false);
  const [pendingSerializedProduct, setPendingSerializedProduct] = useState<ProductItem | null>(null);
  const [serialSearchQuery, setSerialSearchQuery] = useState('');
  const [isPcBuilderModalOpen, setIsPcBuilderModalOpen] = useState(false);
  const [pcBuilderSelections, setPcBuilderSelections] = useState<Record<string, ProductItem | null>>({
    cpu: null,
    motherboard: null,
    gpu: null,
    ram: null,
    storage: null,
    power_supply: null,
    casing: null,
    cooler: null,
    monitor: null,
  });
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSubmittingSale, setIsSubmittingSale] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [completedOrder, setCompletedOrder] = useState<any | null>(null);

  // Customer Autocomplete & Address States
  const [customerSuggestions, setCustomerSuggestions] = useState<any[]>([]);
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const [isSearchingCustomers, setIsSearchingCustomers] = useState(false);
  const [selectedCustomerObj, setSelectedCustomerObj] = useState<any | null>(null);
  const [showFullCustomerDetails, setShowFullCustomerDetails] = useState(false);

  // Sales History States
  const [historyOrders, setHistoryOrders] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historySearch, setHistorySearch] = useState('');
  const [historyDateFilter, setHistoryDateFilter] = useState<'all' | 'today' | '7days' | '30days'>('all');

  const searchInputRef = useRef<HTMLInputElement>(null);

  // 1. Fetch Staff Session & Set Branch Default
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
          if (data.user.branch_id) {
            setSelectedBranchId(data.user.branch_id);
          } else if (data.user.role_slug === 'shop-manager') {
            setSelectedBranchId(2);
          }
        }
      })
      .catch(() => {});
  }, []);

  const isSuperAdminUser = Boolean(
    currentUser &&
      ((currentUser.role_slug || '').toLowerCase().replace(/_/g, '-') === 'super-admin' ||
        (currentUser.role_name || '').toLowerCase().includes('super admin') ||
        currentUser.role_id === 1)
  );

  // 2. Fetch Products for Active Branch
  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const res = await fetch(`/api/admin/pos/products?branchId=${selectedBranchId}&q=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error('Fetch POS products error:', err);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedBranchId, search]);

  // Dynamic Document Title for PDF Save (Name & Phone formatted)
  useEffect(() => {
    if (completedOrder) {
      const rawName = completedOrder.customer?.name || 'Customer';
      const rawPhone = completedOrder.customer?.phone || '';
      const cleanName = rawName.trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '');
      const cleanPhone = rawPhone.trim().replace(/[^0-9+]/g, '');
      const invoiceNum = completedOrder.orderNumber || 'Invoice';
      document.title = `${cleanName}_${cleanPhone}_${invoiceNum}`;
    } else {
      document.title = 'CORENIX POS Terminal - Store Manager';
    }
  }, [completedOrder]);

  const handlePrintReceipt = () => {
    if (completedOrder) {
      const rawName = completedOrder.customer?.name || 'Customer';
      const rawPhone = completedOrder.customer?.phone || '';
      const cleanName = rawName.trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '');
      const cleanPhone = rawPhone.trim().replace(/[^0-9+]/g, '');
      const invoiceNum = completedOrder.orderNumber || 'Invoice';
      document.title = `${cleanName}_${cleanPhone}_${invoiceNum}`;
    }
    window.print();
  };

  // 3. Barcode Scanner Fast-Detection (Enter Key)
  const handleSearchKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && search.trim()) {
      e.preventDefault();
      const code = search.trim();

      // Check if scanned code matches an exact serial or barcode
      try {
        const res = await fetch(`/api/admin/pos/serials?branchId=${selectedBranchId}&scanCode=${encodeURIComponent(code)}`);
        const data = await res.json();
        if (data.success && data.found && data.item) {
          // Direct match! Add immediately
          const match = data.item;
          if (data.type === 'regular') {
            const product = products.find((p) => p.id === match.product_id);
            if (product) {
              addSerializedItemToCart(product, match.serial_number, match.barcode);
              setSearch('');
              return;
            }
          } else if (data.type === 'other_house') {
            const ohProd = products.find((p) => p.id === `oh-${match.id}`);
            if (ohProd) {
              addSerializedItemToCart(ohProd, match.serial_number, match.serial_number);
              setSearch('');
              return;
            }
          }
        }
      } catch (err) {
        console.error('Direct scan error:', err);
      }

      // If only one product in search results, select it
      if (filteredProducts.length === 1) {
        handleProductClick(filteredProducts[0]);
        setSearch('');
      }
    }
  };

  // 3b. Customer Autocomplete & Search Handler
  const searchSavedCustomers = async (keyword: string) => {
    if (!keyword || keyword.trim().length < 2) {
      setCustomerSuggestions([]);
      setIsCustomerDropdownOpen(false);
      return;
    }
    try {
      setIsSearchingCustomers(true);
      const res = await fetch(`/api/admin/pos/customers?q=${encodeURIComponent(keyword.trim())}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.customers)) {
        setCustomerSuggestions(data.customers);
        setIsCustomerDropdownOpen(data.customers.length > 0);
      }
    } catch (err) {
      console.error('Customer search error:', err);
    } finally {
      setIsSearchingCustomers(false);
    }
  };

  const handleSelectCustomer = (cust: any) => {
    setCustomerName(cust.name || '');
    setCustomerPhone(cust.phone || '');
    setCustomerEmail(cust.email || '');
    setCustomerAddress(cust.address || '');
    setSelectedCustomerObj(cust);
    setIsCustomerDropdownOpen(false);
  };

  const handleResetCustomer = () => {
    setCustomerName('Walk-in Customer');
    setCustomerPhone('01700000000');
    setCustomerEmail('');
    setCustomerAddress('');
    setSelectedCustomerObj(null);
    setIsCustomerDropdownOpen(false);
  };

  // 4. Product Selection Handler
  const handleProductClick = (product: ProductItem) => {
    if (product.stock_quantity <= 0) {
      alert(`"${product.name}" is currently out of stock at this branch.`);
      return;
    }

    if (product.is_serialized && product.available_serials && product.available_serials.length > 0) {
      setPendingSerializedProduct(product);
      setIsSerialModalOpen(true);
    } else {
      // Non-serialized item: add or increment qty
      addNonSerializedItemToCart(product);
    }
  };

  // Add Non-Serialized Item
  const addNonSerializedItemToCart = (product: ProductItem) => {
    const cartLineId = `p-${product.id}`;
    const existing = cart.find((item) => item.id === cartLineId);

    if (existing) {
      if (existing.qty + 1 > product.stock_quantity) {
        alert(`Cannot add more than available branch stock (${product.stock_quantity} units).`);
        return;
      }
      setCart(cart.map((item) => (item.id === cartLineId ? { ...item, qty: item.qty + 1 } : item)));
    } else {
      setCart([
        ...cart,
        {
          id: cartLineId,
          productId: product.id,
          name: product.name,
          sku: product.sku,
          model: product.model,
          barcode: product.barcode,
          unitPrice: product.discount_price || product.selling_price,
          unitCost: product.purchase_cost,
          qty: 1,
          maxStock: product.stock_quantity,
          isSerialized: false,
          isOtherHouse: false,
          warranty: product.warranty_period || '1 Year Official Warranty',
        },
      ]);
    }
  };

  // Add Serialized Item with selected Serial Number
  const addSerializedItemToCart = (product: ProductItem, serialNumber: string, barcode?: string) => {
    // Check if this serial is already in the cart
    const serialUpper = serialNumber.trim().toUpperCase();
    const alreadyInCart = cart.some((c) => c.serialNumber && c.serialNumber.trim().toUpperCase() === serialUpper);

    if (alreadyInCart) {
      alert(`Serial Number "${serialNumber}" is already in your current sale ticket!`);
      return;
    }

    const isOtherHouse = Boolean(product.is_other_house);
    const cartLineId = `sn-${product.id}-${serialUpper}`;

    setCart([
      ...cart,
      {
        id: cartLineId,
        productId: product.id,
        originalOhId: product.original_oh_id,
        name: product.name,
        sku: product.sku,
        model: product.model,
        barcode: barcode || product.barcode || serialNumber,
        serialNumber: serialNumber,
        unitPrice: product.discount_price || product.selling_price,
        unitCost: product.purchase_cost,
        qty: 1,
        maxStock: 1,
        isSerialized: true,
        isOtherHouse,
        house_name: product.house_name,
        warranty: product.warranty_period || '1 Year Official Warranty',
      },
    ]);

    setIsSerialModalOpen(false);
    setPendingSerializedProduct(null);
  };

  // Cart Qty Adjustments
  const handleUpdateQty = (cartLineId: string, delta: number) => {
    setCart(
      cart
        .map((item) => {
          if (item.id === cartLineId) {
            if (item.isSerialized) {
              // Serialized items must stay qty = 1
              return item;
            }
            const newQty = item.qty + delta;
            if (newQty > item.maxStock) {
              alert(`Maximum available branch stock is ${item.maxStock} units.`);
              return item;
            }
            if (newQty <= 0) {
              return null;
            }
            return { ...item, qty: newQty };
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveFromCart = (cartLineId: string) => {
    setCart(cart.filter((item) => item.id !== cartLineId));
  };

  // Totals
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.unitPrice * item.qty, 0);
  }, [cart]);

  const grandTotal = useMemo(() => {
    return Math.max(0, subtotal - (Number(discountAmount) || 0));
  }, [subtotal, discountAmount]);

  // 5. Checkout Confirmation & Submission
  const handleInitiateCheckout = () => {
    if (cart.length === 0) {
      alert('Your sale ticket is empty. Please add items to proceed.');
      return;
    }
    setErrorMessage('');
    setIsConfirmModalOpen(true);
  };

  const handleFinalSubmitSale = async () => {
    setErrorMessage('');
    setIsSubmittingSale(true);

    try {
      const payload = {
        branchId: selectedBranchId,
        customerName: customerName.trim() || 'Walk-in Customer',
        customerPhone: customerPhone.trim() || '01700000000',
        customerEmail: customerEmail.trim(),
        customerAddress: customerAddress.trim(),
        paymentMethod,
        discountAmount: Number(discountAmount) || 0,
        notes: notes.trim(),
        items: cart.map((item) => ({
          productId: item.productId,
          originalOhId: item.originalOhId,
          name: item.name,
          sku: item.sku,
          serialNumber: item.serialNumber,
          barcode: item.barcode,
          qty: item.qty,
          unitPrice: item.unitPrice,
          isOtherHouse: item.isOtherHouse,
        })),
      };

      const res = await fetch('/api/admin/pos/sale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Failed to complete sale transaction.');
        setIsSubmittingSale(false);
        return;
      }

      // Success! Show invoice receipt & clear cart
      setCompletedOrder(data.order);
      setCart([]);
      setDiscountAmount(0);
      setNotes('');
      handleResetCustomer();
      setIsConfirmModalOpen(false);

      // Refresh product stock list in background
      fetchProducts();
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error occurred while finalizing sale.');
    } finally {
      setIsSubmittingSale(false);
    }
  };

  // 6. Fetch Sales History
  const fetchSalesHistory = async () => {
    try {
      setLoadingHistory(true);
      const res = await fetch(
        `/api/admin/pos/sales?branchId=${selectedBranchId}&q=${encodeURIComponent(
          historySearch
        )}&dateRange=${historyDateFilter}`
      );
      const data = await res.json();
      if (data.success) {
        setHistoryOrders(data.orders || []);
      }
    } catch (err) {
      console.error('Fetch history error:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'history') {
      fetchSalesHistory();
    }
  }, [activeTab, selectedBranchId, historySearch, historyDateFilter]);

  // Filter Products by Category
  const filteredProducts = useMemo(() => {
    if (selectedCategoryFilter === 'all') return products;
    if (selectedCategoryFilter === 'pc_builder') return products.filter((p) => p.is_pc_builder);
    if (selectedCategoryFilter === 'other_house') return products.filter((p) => p.is_other_house);
    if (selectedCategoryFilter === 'serialized') return products.filter((p) => p.is_serialized);
    return products.filter((p) => p.pc_builder_component === selectedCategoryFilter);
  }, [products, selectedCategoryFilter]);

  const activeBranchObj = branches.find((b) => b.id === selectedBranchId) || branches[0];

  return (
    <div className="space-y-6">
      {/* TOP POS HEADER / TOOLBAR (Hidden when viewing invoice and when printing) */}
      {!completedOrder && (
        <div className="flex items-center justify-between flex-wrap gap-4 bg-white dark:bg-navy-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-xs">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>CORENIX Store Manager POS Terminal</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold uppercase tracking-wider border border-emerald-300 dark:border-emerald-800">
                  Live Register
                </span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                High-speed counter sales for Whole PCs, individual hardware components &amp; serialized stock.
              </p>
            </div>
          </div>

          {/* Counter Branch Selection & Mode Switcher */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Active Branch Context */}
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
              <Building2 className="w-4 h-4 text-sky-600 dark:text-cyan-400" />
              <span className="text-slate-500 dark:text-slate-400 font-semibold hidden sm:inline">Counter Branch:</span>
              {isSuperAdminUser ? (
                <select
                  value={selectedBranchId}
                  onChange={(e) => setSelectedBranchId(Number(e.target.value))}
                  className="bg-transparent text-slate-900 dark:text-white font-bold outline-none cursor-pointer text-xs"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id} className="dark:bg-navy-900">
                      {b.name} ({b.code})
                    </option>
                  ))}
                </select>
              ) : (
                <span className="font-bold text-slate-900 dark:text-white">
                  {activeBranchObj.name}
                </span>
              )}
            </div>

            {/* Tab Controls: POS Sale vs Sales History vs Whole PC Builder */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPcBuilderModalOpen(true)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xs hover:from-purple-500 hover:to-indigo-500 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Assemble Whole PC</span>
              </button>

              <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => {
                    setActiveTab('pos');
                    setCompletedOrder(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'pos'
                      ? 'bg-sky-600 text-white shadow-xs dark:bg-brand-500 dark:text-navy-950'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>POS Register</span>
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'history'
                      ? 'bg-sky-600 text-white shadow-xs dark:bg-brand-500 dark:text-navy-950'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <History className="w-3.5 h-3.5" />
                  <span>Sales History</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 1: ACTIVE POS WORKSPACE */}
      {activeTab === 'pos' && (
        <>
          {completedOrder ? (
            /* PRINTABLE THERMAL & A4 INVOICE RECEIPT VIEW */
            <div className="max-w-3xl mx-auto space-y-4">
              {/* Print-specific style overrides for perfect A4 page fit */}
              <style jsx global>{`
                @media print {
                  @page {
                    size: A4 portrait;
                    margin: 8mm 10mm;
                  }
                  html,
                  body {
                    width: 100% !important;
                    min-width: 0 !important;
                    max-width: 100% !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    background: #ffffff !important;
                    color: #000000 !important;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                    overflow: visible !important;
                  }
                  /* Reset layout structure on print so NO parent padding/margin pushes the invoice */
                  main,
                  div,
                  section,
                  .flex-1,
                  .space-y-4,
                  .space-y-6,
                  .max-w-3xl {
                    padding: 0 !important;
                    margin: 0 !important;
                    max-width: 100% !important;
                    width: 100% !important;
                    box-shadow: none !important;
                    border: none !important;
                  }
                  header,
                  nav,
                  aside,
                  footer,
                  .no-print,
                  .print-hidden,
                  [role="navigation"],
                  button,
                  a[href="/admin/orders"] {
                    display: none !important;
                  }
                  .invoice-print,
                  .print-receipt-wrapper {
                    display: block !important;
                    width: 100% !important;
                    max-width: 100% !important;
                    margin: 0 auto !important;
                    padding: 0 !important;
                    background: #ffffff !important;
                    color: #000000 !important;
                    box-sizing: border-box !important;
                    box-shadow: none !important;
                    border: none !important;
                    border-radius: 0 !important;
                    font-size: 10px !important;
                    line-height: 1.3 !important;
                    break-inside: avoid !important;
                    page-break-inside: avoid !important;
                  }
                  .invoice-print * {
                    box-sizing: border-box !important;
                  }
                  .invoice-print > * + * {
                    margin-top: 2mm !important;
                  }
                  .invoice-header {
                    padding: 0 0 2mm 0 !important;
                    margin-bottom: 2mm !important;
                    border-bottom: 1.5px solid #0f172a !important;
                    text-align: center !important;
                    break-inside: avoid !important;
                    page-break-inside: avoid !important;
                    width: 100% !important;
                  }
                  .invoice-header-logo {
                    width: 22px !important;
                    height: 22px !important;
                    font-size: 12px !important;
                    line-height: 22px !important;
                    margin: 0 auto 1mm auto !important;
                    background: #0f172a !important;
                    color: #ffffff !important;
                    border-radius: 6px !important;
                    display: inline-flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                  }
                  .invoice-header-title {
                    font-size: 15px !important;
                    font-weight: 900 !important;
                    color: #000000 !important;
                    letter-spacing: -0.01em !important;
                    margin: 0 0 0.5mm 0 !important;
                    line-height: 1.15 !important;
                  }
                  .invoice-header-subtitle {
                    font-size: 9.5px !important;
                    font-weight: 500 !important;
                    color: #334155 !important;
                    margin: 0 0 0.5mm 0 !important;
                    line-height: 1.15 !important;
                  }
                  .invoice-header-hotline {
                    font-size: 9px !important;
                    color: #475569 !important;
                    margin: 0 0 1mm 0 !important;
                    line-height: 1.15 !important;
                  }
                  .invoice-header-badge {
                    display: inline-block !important;
                    padding: 1px 8px !important;
                    font-size: 9.5px !important;
                    font-weight: 800 !important;
                    color: #000000 !important;
                    background: #f1f5f9 !important;
                    border: 1px solid #000000 !important;
                    border-radius: 9999px !important;
                  }
                  .customer-section {
                    width: 100% !important;
                    padding: 2mm 3mm !important;
                    margin-bottom: 2mm !important;
                    border: 1px solid #cbd5e1 !important;
                    background: #f8fafc !important;
                    border-radius: 6px !important;
                    display: grid !important;
                    grid-template-columns: 1fr 1fr !important;
                    gap: 1.5mm 4mm !important;
                    break-inside: avoid !important;
                    page-break-inside: avoid !important;
                  }
                  .customer-section .label {
                    font-size: 8px !important;
                    font-weight: 700 !important;
                    text-transform: uppercase !important;
                    color: #64748b !important;
                    line-height: 1 !important;
                    margin-bottom: 1px !important;
                    display: block !important;
                  }
                  .customer-section .value {
                    font-size: 9.5px !important;
                    font-weight: 600 !important;
                    color: #000000 !important;
                    line-height: 1.2 !important;
                    display: block !important;
                  }
                  .customer-section .full-row {
                    grid-column: span 2 / span 2 !important;
                    border-top: 1px solid #e2e8f0 !important;
                    padding-top: 1.5mm !important;
                    margin-top: 0.5mm !important;
                  }
                  .invoice-items {
                    width: 100% !important;
                    margin-bottom: 2mm !important;
                    border: 1px solid #cbd5e1 !important;
                    border-radius: 6px !important;
                    overflow: hidden !important;
                  }
                  .invoice-table {
                    width: 100% !important;
                    max-width: 100% !important;
                    table-layout: fixed !important;
                    border-collapse: collapse !important;
                    font-size: 9.5px !important;
                  }
                  .invoice-table thead {
                    display: table-header-group !important;
                    background: #f1f5f9 !important;
                    border-bottom: 1px solid #cbd5e1 !important;
                  }
                  .invoice-table th {
                    padding: 1.5mm 2mm !important;
                    font-size: 8.5px !important;
                    font-weight: 700 !important;
                    text-transform: uppercase !important;
                    color: #000000 !important;
                    letter-spacing: 0.02em !important;
                  }
                  .invoice-table tbody tr {
                    break-inside: avoid !important;
                    page-break-inside: avoid !important;
                  }
                  .invoice-table td {
                    padding: 1.5mm 2mm !important;
                    vertical-align: top !important;
                    border-bottom: 1px solid #e2e8f0 !important;
                    color: #000000 !important;
                    font-size: 9.5px !important;
                    line-height: 1.25 !important;
                  }
                  .invoice-table .col-num {
                    width: 5% !important;
                    text-align: center !important;
                  }
                  .invoice-table .col-desc {
                    width: 53% !important;
                  }
                  .invoice-table .col-qty {
                    width: 7% !important;
                    text-align: center !important;
                  }
                  .invoice-table .col-unit {
                    width: 16% !important;
                    text-align: right !important;
                  }
                  .invoice-table .col-total {
                    width: 19% !important;
                    text-align: right !important;
                  }
                  .invoice-table .text-money {
                    text-align: right !important;
                    white-space: nowrap !important;
                    font-variant-numeric: tabular-nums !important;
                  }
                  .invoice-table .wrap-text {
                    word-break: break-word !important;
                    overflow-wrap: anywhere !important;
                  }
                  .invoice-total {
                    width: 100% !important;
                    border-top: 1px solid #cbd5e1 !important;
                    padding-top: 1.5mm !important;
                    margin-top: 1.5mm !important;
                    font-size: 9.5px !important;
                    line-height: 1.25 !important;
                    break-inside: avoid !important;
                    page-break-inside: avoid !important;
                  }
                  .invoice-total .total-paid-row {
                    font-size: 12.5px !important;
                    font-weight: 900 !important;
                    color: #000000 !important;
                    padding-top: 1.5mm !important;
                    margin-top: 1mm !important;
                    border-top: 1.5px solid #000000 !important;
                  }
                  .signature-section {
                    width: 100% !important;
                    border-top: 1px solid #cbd5e1 !important;
                    padding-top: 2.5mm !important;
                    margin-top: 2.5mm !important;
                    min-height: 16mm !important;
                    break-inside: avoid !important;
                    page-break-inside: avoid !important;
                  }
                  .signature-grid {
                    width: 100% !important;
                    display: grid !important;
                    grid-template-columns: repeat(3, 1fr) !important;
                    gap: 4mm !important;
                    text-align: center !important;
                    align-items: flex-end !important;
                  }
                  .signature-line {
                    width: 100% !important;
                    height: 8mm !important;
                    border-bottom: 1px dashed #64748b !important;
                    margin-bottom: 1mm !important;
                  }
                  .signature-seal-box {
                    width: 28mm !important;
                    height: 8mm !important;
                    border: 1.5px dashed #64748b !important;
                    border-radius: 6px !important;
                    margin: 0 auto 1mm auto !important;
                    background: transparent !important;
                  }
                  .signature-title {
                    font-size: 8.5px !important;
                    font-weight: 800 !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.05em !important;
                    color: #000000 !important;
                    display: block !important;
                    line-height: 1.1 !important;
                  }
                  .signature-subtitle {
                    font-size: 7.5px !important;
                    color: #64748b !important;
                    display: block !important;
                    line-height: 1.1 !important;
                  }
                  .invoice-footer {
                    width: 100% !important;
                    border-top: 1px solid #e2e8f0 !important;
                    padding-top: 1.5mm !important;
                    margin-top: 2mm !important;
                    font-size: 8px !important;
                    line-height: 1.25 !important;
                    text-align: center !important;
                    color: #475569 !important;
                    break-inside: avoid !important;
                    page-break-inside: avoid !important;
                  }
                  .invoice-footer p {
                    margin: 0.5mm 0 !important;
                  }
                  .invoice-footer .thank-you {
                    font-weight: 700 !important;
                    color: #000000 !important;
                  }
                }
              `}</style>

              <div className="print-receipt-wrapper invoice-print p-6 sm:p-8 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-2xl text-xs space-y-3.5 print:p-0 print:border-none print:shadow-none print:text-black">
                {/* Store Header */}
                <div className="invoice-header text-center space-y-1 pb-3 border-b-2 border-slate-200 dark:border-slate-800">
                  <div className="invoice-header-logo flex items-center justify-center mb-1">
                    <img
                      src="/images/logo.png"
                      alt="CORENIX"
                      className="h-9 w-auto object-contain dark:hidden print:block"
                    />
                    <img
                      src="/images/logo-dark.png"
                      alt="CORENIX"
                      className="h-9 w-auto object-contain hidden dark:block print:hidden"
                    />
                  </div>
                  <h2 className="invoice-header-title text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase print:text-black">
                    CORENIX TECHNOLOGY RETAIL
                  </h2>
                  <p className="invoice-header-subtitle text-slate-600 dark:text-slate-400 font-medium text-[11px] print:text-slate-700">
                    {completedOrder.branch.name} • {completedOrder.branch.address}
                  </p>
                  <p className="invoice-header-hotline text-slate-500 dark:text-slate-400 font-mono text-[10.5px] print:text-slate-600">
                    Hotline: {completedOrder.branch.phone} | BIN/VAT Reg: 002938491-0101
                  </p>
                  <div className="pt-1">
                    <span className="invoice-header-badge inline-block px-3 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-mono font-black text-slate-900 dark:text-brand-400 text-xs border border-slate-300 dark:border-slate-700 print:border-black print:bg-slate-100 print:text-black">
                      INVOICE #{completedOrder.orderNumber}
                    </span>
                  </div>
                </div>

                {/* Metadata Grid */}
                <div className="customer-section grid grid-cols-2 gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] print:bg-slate-50 print:border-slate-300">
                  <div>
                    <span className="label text-slate-500 block text-[9.5px] uppercase font-bold">Sale Date &amp; Time</span>
                    <span className="value font-semibold text-slate-900 dark:text-white print:text-black">{completedOrder.formattedDate}</span>
                  </div>
                  <div>
                    <span className="label text-slate-500 block text-[9.5px] uppercase font-bold">Cashier / Store Manager</span>
                    <span className="value font-semibold text-slate-900 dark:text-white print:text-black">{completedOrder.cashier.name}</span>
                  </div>
                  <div>
                    <span className="label text-slate-500 block text-[9.5px] uppercase font-bold">Customer Name</span>
                    <span className="value font-semibold text-slate-900 dark:text-white print:text-black">{completedOrder.customer.name}</span>
                  </div>
                  <div>
                    <span className="label text-slate-500 block text-[9.5px] uppercase font-bold">Contact Phone</span>
                    <span className="value font-semibold text-slate-900 dark:text-white font-mono print:text-black">{completedOrder.customer.phone}</span>
                  </div>
                  {completedOrder.customer.address && (
                    <div className="full-row col-span-2 border-t border-slate-200 dark:border-slate-800/80 pt-1.5 mt-0.5">
                      <span className="label text-slate-500 block text-[9.5px] uppercase font-bold">Customer Address / Delivery</span>
                      <span className="value font-semibold text-slate-900 dark:text-white print:text-black">{completedOrder.customer.address}</span>
                    </div>
                  )}
                </div>

                {/* Line Items Table with Complete Structured Info */}
                <div className="invoice-items border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden print:border-slate-300">
                  <table className="invoice-table w-full text-left text-[10.5px] border-collapse">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase font-bold text-[9.5px] border-b border-slate-200 dark:border-slate-700 print:bg-slate-100 print:text-black">
                      <tr>
                        <th className="col-num py-2 px-2 text-center w-8">#</th>
                        <th className="col-desc py-2 px-3">Item Description, SKU &amp; Serial Details</th>
                        <th className="col-qty py-2 px-2 text-center w-12">Qty</th>
                        <th className="col-unit py-2 px-3 text-right w-24">Unit Price</th>
                        <th className="col-total py-2 px-3 text-right w-28">Total (৳)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 print:divide-slate-300">
                      {completedOrder.items.map((it: any, idx: number) => (
                        <tr key={idx} className="page-break-avoid">
                          <td className="col-num py-2 px-2 text-center font-mono text-slate-500 align-top">
                            {idx + 1}
                          </td>
                          <td className="col-desc py-2 px-3 align-top wrap-text">
                            <span className="font-bold text-slate-900 dark:text-white block print:text-black">
                              {it.productName || it.name}
                            </span>
                            <div className="flex items-center gap-2 flex-wrap mt-0.5 text-[10px]">
                              <span className="font-mono text-slate-500">SKU: {it.sku}</span>
                              {it.serialNumber && (
                                <span className="font-mono font-bold text-slate-900 dark:text-cyan-300 bg-slate-100 dark:bg-cyan-950 px-1.5 py-0.2 rounded border border-slate-300 dark:border-cyan-800 print:bg-slate-100 print:text-black print:border-slate-400">
                                  SN: {it.serialNumber}
                                </span>
                              )}
                              {it.warrantyDetails && (
                                <span className="text-emerald-700 dark:text-emerald-400 font-medium print:text-slate-700">
                                  • {it.warrantyDetails}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="col-qty py-2 px-2 text-center font-bold text-slate-800 dark:text-slate-200 align-top print:text-black">
                            {it.quantity || it.qty}
                          </td>
                          <td className="col-unit py-2 px-3 text-right font-mono text-money text-slate-700 dark:text-slate-300 align-top print:text-black">
                            ৳{Number(it.unitPrice).toLocaleString()}
                          </td>
                          <td className="col-total py-2 px-3 text-right font-mono font-bold text-money text-slate-900 dark:text-white align-top print:text-black">
                            ৳{Number(it.totalPrice || it.unitPrice * (it.quantity || it.qty)).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals Section */}
                <div className="invoice-total border-t border-slate-200 dark:border-slate-800 pt-2 space-y-1 page-break-avoid">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400 text-xs">
                    <span>Subtotal:</span>
                    <span className="font-mono font-semibold text-slate-900 dark:text-white print:text-black text-money">
                      ৳{completedOrder.subtotal.toLocaleString()}
                    </span>
                  </div>
                  {completedOrder.discount > 0 && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400 text-xs">
                      <span>Discount Applied:</span>
                      <span className="font-mono font-semibold text-money">-৳{completedOrder.discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="total-paid-row flex justify-between text-sm sm:text-base font-black text-slate-900 dark:text-white pt-1.5 border-t border-slate-200 dark:border-slate-800 print:text-black">
                    <span>Total Amount Paid:</span>
                    <span className="text-sky-600 dark:text-brand-400 font-mono print:text-black text-money">
                      ৳{completedOrder.grandTotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Payment Method:</span>
                    <span className="font-bold uppercase text-slate-800 dark:text-slate-200 print:text-black">
                      {completedOrder.paymentMethod.replace('_', ' ')} (PAID IN FULL)
                    </span>
                  </div>
                </div>

                {/* SIGNATURE & OFFICIAL COMPANY SEAL SECTION (CLEAN & BLANK FOR PHYSICAL SIGN / SEAL) */}
                <div className="signature-section border-t border-slate-200 dark:border-slate-800 pt-8 pb-3 page-break-avoid">
                  <div className="signature-grid grid grid-cols-3 gap-6 text-center items-end">
                    {/* 1. Received By (Customer Signature) */}
                    <div className="flex flex-col items-center justify-end">
                      <div className="signature-line w-full border-b border-dashed border-slate-400 dark:border-slate-600 mb-2 h-14">
                        {/* Blank line for customer signature */}
                      </div>
                      <span className="signature-title font-bold text-slate-900 dark:text-slate-200 text-[10px] uppercase tracking-wider block print:text-black">
                        Received By
                      </span>
                      <span className="signature-subtitle text-[9px] text-slate-400 block print:text-slate-600">
                        (Customer Signature)
                      </span>
                    </div>

                    {/* 2. Sold By (Blank for Cashier Sign) */}
                    <div className="flex flex-col items-center justify-end">
                      <div className="signature-line w-full border-b border-dashed border-slate-400 dark:border-slate-600 mb-2 h-14">
                        {/* Blank line for cashier signature */}
                      </div>
                      <span className="signature-title font-bold text-slate-900 dark:text-slate-200 text-[10px] uppercase tracking-wider block print:text-black">
                        Sold By
                      </span>
                      <span className="signature-subtitle text-[9px] text-slate-400 block print:text-slate-600">
                        (Store Manager / Cashier)
                      </span>
                    </div>

                    {/* 3. Authorized By & Company Seal Box (Completely Blank Inside) */}
                    <div className="flex flex-col items-center justify-end">
                      <div className="signature-seal-box w-32 h-14 border-2 border-dashed border-slate-400 dark:border-slate-600 rounded-xl mb-2 flex items-center justify-center bg-transparent">
                        {/* Completely blank for physical rubber stamp / seal */}
                      </div>
                      <span className="signature-title font-bold text-slate-900 dark:text-slate-200 text-[10px] uppercase tracking-wider block print:text-black">
                        Authorized By
                      </span>
                      <span className="signature-subtitle text-[9px] text-slate-400 block print:text-slate-600">
                        (Company Seal &amp; Sign)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Terms & Warranty Policy Footer */}
                <div className="invoice-footer border-t border-slate-200 dark:border-slate-800 pt-3 text-[9.5px] text-slate-500 dark:text-slate-400 space-y-0.5 text-center leading-relaxed page-break-avoid print:text-slate-600">
                  <p className="thank-you font-bold text-slate-700 dark:text-slate-300 print:text-black">
                    Thank you for choosing CORENIX TECHNOLOGY!
                  </p>
                  <p>{completedOrder.warrantyPolicy}</p>
                  <p>{completedOrder.returnPolicy}</p>
                </div>
              </div>

              {/* Print & Action Controls */}
              <div className="flex items-center gap-3 flex-wrap print:hidden">
                <button
                  onClick={handlePrintReceipt}
                  className="flex-1 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 transition-all cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Receipt / PDF</span>
                </button>

                <button
                  onClick={() => {
                    setCompletedOrder(null);
                    setCart([]);
                    handleResetCustomer();
                  }}
                  className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  + Start New Sale
                </button>

                <Link
                  href="/admin/orders"
                  className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-xs transition-colors"
                >
                  View in Orders System
                </Link>
              </div>
            </div>
          ) : (
            /* TWO COLUMN POS WORKSPACE */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* LEFT: PRODUCT SEARCH & CATALOG (7 Cols) */}
              <div className="lg:col-span-7 space-y-4">
                {/* Search & Fast Scanner Bar */}
                <div className="bg-white dark:bg-navy-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      onKeyDown={handleSearchKeyDown}
                      placeholder="Scan Barcode or Search by Serial Number (SN), Product Name, Model, or SKU..."
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-sky-500 font-medium"
                    />
                    {search && (
                      <button
                        onClick={() => setSearch('')}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Category Quick Filter Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                    <button
                      onClick={() => setSelectedCategoryFilter('all')}
                      className={`px-3 py-1.5 rounded-lg font-bold text-xs whitespace-nowrap transition-colors ${
                        selectedCategoryFilter === 'all'
                          ? 'bg-sky-600 text-white dark:bg-brand-500 dark:text-navy-950 shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      All ({products.length})
                    </button>
                    <button
                      onClick={() => setSelectedCategoryFilter('gpu')}
                      className={`px-2.5 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                        selectedCategoryFilter === 'gpu'
                          ? 'bg-sky-600 text-white dark:bg-brand-500 dark:text-navy-950'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      Graphics (GPU)
                    </button>
                    <button
                      onClick={() => setSelectedCategoryFilter('cpu')}
                      className={`px-2.5 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                        selectedCategoryFilter === 'cpu'
                          ? 'bg-sky-600 text-white dark:bg-brand-500 dark:text-navy-950'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      Processors (CPU)
                    </button>
                    <button
                      onClick={() => setSelectedCategoryFilter('motherboard')}
                      className={`px-2.5 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                        selectedCategoryFilter === 'motherboard'
                          ? 'bg-sky-600 text-white dark:bg-brand-500 dark:text-navy-950'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      Motherboards
                    </button>
                    <button
                      onClick={() => setSelectedCategoryFilter('ram')}
                      className={`px-2.5 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                        selectedCategoryFilter === 'ram'
                          ? 'bg-sky-600 text-white dark:bg-brand-500 dark:text-navy-950'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      RAM
                    </button>
                    <button
                      onClick={() => setSelectedCategoryFilter('storage')}
                      className={`px-2.5 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                        selectedCategoryFilter === 'storage'
                          ? 'bg-sky-600 text-white dark:bg-brand-500 dark:text-navy-950'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      SSDs &amp; Storage
                    </button>
                    <button
                      onClick={() => setSelectedCategoryFilter('pc_builder')}
                      className={`px-2.5 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                        selectedCategoryFilter === 'pc_builder'
                          ? 'bg-purple-600 text-white'
                          : 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-900'
                      }`}
                    >
                      ✨ Whole PC &amp; Bundles
                    </button>
                    <button
                      onClick={() => setSelectedCategoryFilter('other_house')}
                      className={`px-2.5 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                        selectedCategoryFilter === 'other_house'
                          ? 'bg-amber-600 text-white'
                          : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900'
                      }`}
                    >
                      🏪 Other House (Lend)
                    </button>
                  </div>
                </div>

                {/* Product Grid */}
                {loadingProducts ? (
                  <div className="p-16 text-center bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <RefreshCw className="w-8 h-8 mx-auto text-sky-500 animate-spin mb-2" />
                    <span className="text-xs text-slate-400 font-semibold">Loading branch inventory...</span>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="p-16 text-center bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                    <AlertTriangle className="w-10 h-10 mx-auto text-slate-400" />
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">No products found</h4>
                    <p className="text-xs text-slate-400">
                      No stock matches query &ldquo;{search}&rdquo; at {activeBranchObj.name}.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[640px] overflow-y-auto pr-1">
                    {filteredProducts.map((p) => {
                      const isOutOfStock = p.stock_quantity <= 0;
                      return (
                        <div
                          key={p.id}
                          onClick={() => handleProductClick(p)}
                          className={`p-3 rounded-2xl bg-white dark:bg-navy-900 border transition-all flex flex-col justify-between group shadow-xs ${
                            isOutOfStock
                              ? 'opacity-60 cursor-not-allowed border-slate-200 dark:border-slate-800'
                              : p.is_other_house
                              ? 'border-amber-300 dark:border-amber-500/40 hover:border-amber-500 cursor-pointer'
                              : 'border-slate-200 dark:border-slate-800 hover:border-sky-500 dark:hover:border-brand-400 hover:shadow-md cursor-pointer'
                          }`}
                        >
                          {/* Image & Badges */}
                          <div className="relative mb-2">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={p.primary_image}
                              alt={p.name}
                              className="w-full h-24 object-contain rounded-lg p-1 bg-slate-50 dark:bg-slate-950"
                            />
                            {/* Serial Badge */}
                            {p.is_serialized && (
                              <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-sky-100 dark:bg-cyan-950 text-sky-800 dark:text-cyan-300 text-[9px] font-bold border border-sky-300 dark:border-cyan-800">
                                SN
                              </span>
                            )}
                            {/* Other House Badge */}
                            {p.is_other_house && (
                              <span className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[9px] font-bold border border-amber-300 dark:border-amber-800">
                                Lend
                              </span>
                            )}
                          </div>

                          {/* Info */}
                          <div className="space-y-1">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-sky-600 dark:group-hover:text-brand-300 transition-colors">
                              {p.name}
                            </h4>
                            <div className="flex items-center justify-between text-[10px] text-slate-400">
                              <span className="font-mono truncate max-w-[90px]">{p.sku}</span>
                              <span
                                className={`font-bold ${
                                  p.stock_quantity > 3
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : p.stock_quantity > 0
                                    ? 'text-amber-600 dark:text-amber-400'
                                    : 'text-rose-600 dark:text-rose-400'
                                }`}
                              >
                                {p.stock_quantity > 0 ? `${p.stock_quantity} in stock` : 'Out of stock'}
                              </span>
                            </div>
                          </div>

                          {/* Price & Add Action */}
                          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <div>
                              <span className="text-xs font-black text-slate-900 dark:text-white block font-mono">
                                ৳{(p.discount_price || p.selling_price).toLocaleString()}
                              </span>
                            </div>
                            <button
                              type="button"
                              disabled={isOutOfStock}
                              className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-sky-600 group-hover:text-white dark:bg-slate-800 dark:group-hover:bg-brand-500 dark:group-hover:text-navy-950 text-slate-700 dark:text-slate-200 font-bold flex items-center justify-center transition-colors shadow-2xs"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* RIGHT: CURRENT SALE TICKET & BILLING (5 Cols) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between min-h-[580px]">
                  <div>
                    {/* Ticket Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                      <div>
                        <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                          <ShoppingCart className="w-4 h-4 text-sky-600 dark:text-brand-400" />
                          <span>Current Sale Ticket</span>
                        </h3>
                        <span className="text-[10px] text-slate-400">
                          {activeBranchObj.name}
                        </span>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-sky-50 dark:bg-slate-800 text-sky-700 dark:text-brand-400 font-mono font-bold text-xs">
                        {cart.reduce((s, i) => s + i.qty, 0)} Items
                      </span>
                    </div>

                    {/* Customer Info & Address Form */}
                    <div className="my-3 space-y-2 text-xs relative">
                      {/* Customer Status Bar */}
                      <div className="flex items-center justify-between text-[11px] pb-1 border-b border-slate-100 dark:border-slate-800">
                        <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-sky-600 dark:text-cyan-400" />
                          <span>Customer &amp; Delivery Details</span>
                        </span>
                        {selectedCustomerObj ? (
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-[10px] border border-emerald-200 dark:border-emerald-800">
                              ✓ Saved Customer (#{selectedCustomerObj.id})
                            </span>
                            <button
                              type="button"
                              onClick={handleResetCustomer}
                              className="text-[10px] text-rose-500 hover:underline font-bold"
                            >
                              Reset
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-medium">
                            Type name/phone to search or save
                          </span>
                        )}
                      </div>

                      {/* Name & Phone Grid */}
                      <div className="grid grid-cols-2 gap-2">
                        {/* Name Input with Autocomplete */}
                        <div className="relative">
                          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-0.5">
                            Customer Name *
                          </label>
                          <input
                            type="text"
                            value={customerName}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCustomerName(val);
                              searchSavedCustomers(val);
                            }}
                            onFocus={() => {
                              if (customerName.trim().length >= 2) {
                                searchSavedCustomers(customerName);
                              }
                            }}
                            placeholder="Full Name / Walk-in"
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-white text-xs outline-none focus:border-sky-500 font-medium"
                          />
                        </div>

                        {/* Phone Input with Autocomplete */}
                        <div className="relative">
                          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-0.5">
                            Phone Number *
                          </label>
                          <input
                            type="tel"
                            value={customerPhone}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCustomerPhone(val);
                              searchSavedCustomers(val);
                            }}
                            onFocus={() => {
                              if (customerPhone.trim().length >= 2) {
                                searchSavedCustomers(customerPhone);
                              }
                            }}
                            placeholder="017XXXXXXXX"
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-white text-xs outline-none focus:border-sky-500 font-mono"
                          />
                        </div>
                      </div>

                      {/* AUTOCOMPLETE SUGGESTIONS FLOATING DROPDOWN */}
                      {isCustomerDropdownOpen && customerSuggestions.length > 0 && (
                        <div className="absolute top-14 left-0 right-0 z-30 bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 max-h-56 overflow-y-auto">
                          <div className="bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between">
                            <span>Saved Customers Found ({customerSuggestions.length})</span>
                            <button
                              type="button"
                              onClick={() => setIsCustomerDropdownOpen(false)}
                              className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {customerSuggestions.map((cust) => (
                              <div
                                key={cust.id}
                                onClick={() => handleSelectCustomer(cust)}
                                className="p-2.5 hover:bg-sky-50 dark:hover:bg-slate-800 transition-colors cursor-pointer text-xs"
                              >
                                <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                                  <span>{cust.name}</span>
                                  <span className="font-mono text-sky-600 dark:text-brand-400 text-[11px]">
                                    {cust.phone}
                                  </span>
                                </div>
                                {cust.address && (
                                  <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                    <span className="truncate">{cust.address}</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Customer Address Input */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-0.5">
                          Customer Address &amp; Delivery Location (Saved to Database)
                        </label>
                        <div className="relative">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2 pointer-events-none" />
                          <input
                            type="text"
                            value={customerAddress}
                            onChange={(e) => setCustomerAddress(e.target.value)}
                            placeholder="House / Road / Area / City (e.g. House 12, Road 4, Uttara, Dhaka)"
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg pl-8 pr-2.5 py-1.5 text-slate-900 dark:text-white text-xs outline-none focus:border-sky-500"
                          />
                        </div>
                      </div>

                      {/* Optional Email Input */}
                      <div>
                        <div className="flex items-center justify-between">
                          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-0.5">
                            Customer Email (Optional)
                          </label>
                        </div>
                        <div className="relative">
                          <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2 pointer-events-none" />
                          <input
                            type="email"
                            value={customerEmail}
                            onChange={(e) => setCustomerEmail(e.target.value)}
                            placeholder="customer@example.com"
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg pl-8 pr-2.5 py-1.5 text-slate-900 dark:text-white text-xs outline-none focus:border-sky-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Cart Items List */}
                    <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                      {cart.length === 0 ? (
                        <div className="py-12 text-center text-slate-400 text-xs space-y-1">
                          <ShoppingCart className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-1" />
                          <p className="font-semibold">Sale ticket is currently empty.</p>
                          <p className="text-[11px] text-slate-400">Click products or scan barcode/SN to add.</p>
                        </div>
                      ) : (
                        cart.map((item) => (
                          <div
                            key={item.id}
                            className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs gap-2"
                          >
                            <div className="flex-1 min-w-0">
                              <h5 className="font-bold text-slate-900 dark:text-white truncate">
                                {item.name}
                              </h5>
                              <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                                {item.serialNumber && (
                                  <span className="font-mono text-[10px] font-bold text-sky-600 dark:text-cyan-400 bg-sky-50 dark:bg-cyan-950 px-1.5 py-0.5 rounded border border-sky-200 dark:border-cyan-800">
                                    SN: {item.serialNumber}
                                  </span>
                                )}
                                {item.isOtherHouse && (
                                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                                    • {item.house_name}
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-500 font-mono block mt-0.5">
                                ৳{item.unitPrice.toLocaleString()} each
                              </span>
                            </div>

                            {/* Qty & Delete */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {!item.isSerialized ? (
                                <div className="flex items-center bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateQty(item.id, -1)}
                                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-l"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <span className="px-2 font-bold text-slate-900 dark:text-white text-xs">
                                    {item.qty}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateQty(item.id, 1)}
                                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-r"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>
                              ) : (
                                <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300">
                                  1x
                                </span>
                              )}

                              <button
                                type="button"
                                onClick={() => handleRemoveFromCart(item.id)}
                                className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Payment Methods & Totals */}
                  <div className="border-t border-slate-200 dark:border-slate-800 pt-3 space-y-3">
                    {/* Discount Input */}
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="text-slate-500 dark:text-slate-400 font-semibold">Custom Discount (৳):</span>
                      <input
                        type="number"
                        min="0"
                        value={discountAmount || ''}
                        onChange={(e) => setDiscountAmount(Math.max(0, Number(e.target.value)))}
                        placeholder="0"
                        className="w-28 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-right text-xs text-slate-900 dark:text-white font-mono outline-none"
                      />
                    </div>

                    {/* Payment Method Selector */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">
                        Select Payment Method:
                      </label>
                      <div className="grid grid-cols-5 gap-1.5 text-[11px]">
                        {[
                          { id: 'cash_pos', label: 'Cash' },
                          { id: 'card', label: 'Card' },
                          { id: 'bkash', label: 'bKash' },
                          { id: 'nagad', label: 'Nagad' },
                          { id: 'bank_transfer', label: 'Bank' },
                        ].map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setPaymentMethod(m.id as any)}
                            className={`py-1.5 rounded-xl font-bold border transition-all cursor-pointer ${
                              paymentMethod === m.id
                                ? 'bg-sky-600 text-white border-sky-600 dark:bg-brand-500 dark:text-navy-950 dark:border-brand-500 shadow-xs'
                                : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                            }`}
                          >
                            {m.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Subtotal & Grand Total */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-1">
                      <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 font-medium">
                        <span>Subtotal:</span>
                        <span className="font-mono">৳{subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center text-base font-black text-slate-900 dark:text-white">
                        <span>Grand Total:</span>
                        <span className="text-xl text-sky-600 dark:text-brand-400 font-mono">
                          ৳{grandTotal.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Complete Sale Button */}
                    <button
                      type="button"
                      onClick={handleInitiateCheckout}
                      disabled={cart.length === 0}
                      className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-lg shadow-emerald-600/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Review &amp; Complete Sale (৳{grandTotal.toLocaleString()})</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* VIEW 2: SALES HISTORY & REPRINT */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="text"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="Search sales by Invoice #, Customer Phone, Product Name, or Serial..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 font-medium"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={historyDateFilter}
                onChange={(e) => setHistoryDateFilter(e.target.value as any)}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
              >
                <option value="all">All Dates</option>
                <option value="today">Today Only</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
              </select>

              <button
                onClick={fetchSalesHistory}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${loadingHistory ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Sales History Table */}
          <div className="bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden text-xs">
            {loadingHistory ? (
              <div className="p-16 text-center">
                <RefreshCw className="w-8 h-8 mx-auto text-sky-500 animate-spin mb-2" />
                <span className="text-slate-400 font-semibold">Loading sales ledger...</span>
              </div>
            ) : historyOrders.length === 0 ? (
              <div className="p-16 text-center text-slate-400 space-y-1">
                <FileText className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-1" />
                <p className="font-bold text-slate-800 dark:text-white">No sales records found</p>
                <p className="text-[11px]">Completed counter sales will appear here for reprint.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Invoice #</th>
                      <th className="py-3 px-4">Date &amp; Time</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Branch</th>
                      <th className="py-3 px-4">Items Summary</th>
                      <th className="py-3 px-4">Payment</th>
                      <th className="py-3 px-4 text-right">Amount</th>
                      <th className="py-3 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {historyOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-sky-600 dark:text-brand-400">
                          {ord.order_number}
                        </td>
                        <td className="py-3 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {new Date(ord.created_at).toLocaleString([], {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-900 dark:text-white block">{ord.customer.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{ord.customer.phone}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-bold text-[10px] text-slate-700 dark:text-slate-300">
                            {ord.branch_code || 'SHOP'}
                          </span>
                        </td>
                        <td className="py-3 px-4 max-w-xs">
                          <div className="space-y-0.5">
                            {ord.items.slice(0, 2).map((it: any, i: number) => (
                              <div key={i} className="text-[11px] text-slate-700 dark:text-slate-300 truncate">
                                {it.product_name} (x{it.quantity})
                                {it.serial_number && (
                                  <span className="text-[10px] font-mono text-sky-600 dark:text-cyan-400 ml-1">
                                    [{it.serial_number}]
                                  </span>
                                )}
                              </div>
                            ))}
                            {ord.items.length > 2 && (
                              <span className="text-[10px] text-slate-400 font-bold">
                                +{ord.items.length - 2} more items
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold uppercase">
                            {ord.payment_method.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                          ৳{ord.total_amount.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                const res = await fetch(`/api/admin/pos/order/${ord.id}`);
                                const data = await res.json();
                                if (data.success && data.order) {
                                  setCompletedOrder(data.order);
                                  setActiveTab('pos');
                                }
                              } catch (err) {
                                alert('Failed to load order receipt.');
                              }
                            }}
                            className="px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-slate-800 text-sky-700 dark:text-brand-300 font-bold text-[11px] hover:bg-sky-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-1 mx-auto cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Reprint</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 1: SERIAL NUMBER SELECTION MODAL */}
      {isSerialModalOpen && pendingSerializedProduct && (() => {
        const filteredSerials = (pendingSerializedProduct.available_serials || []).filter((snItem) => {
          if (!serialSearchQuery.trim()) return true;
          const q = serialSearchQuery.trim().toLowerCase();
          return (
            snItem.serial_number.toLowerCase().includes(q) ||
            (snItem.barcode && snItem.barcode.toLowerCase().includes(q))
          );
        });

        return (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-navy-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-cyan-950 text-sky-600 dark:text-cyan-400 flex items-center justify-center font-bold">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">
                      Select Available Serial Number
                    </h3>
                    <span className="text-[10px] text-slate-400 font-mono line-clamp-1">
                      {pendingSerializedProduct.name}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsSerialModalOpen(false);
                    setSerialSearchQuery('');
                  }}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Serial Search & Barcode Quick Input */}
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    autoFocus
                    value={serialSearchQuery}
                    onChange={(e) => setSerialSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && filteredSerials.length > 0) {
                        e.preventDefault();
                        const targetItem =
                          filteredSerials.find(
                            (s) =>
                              s.serial_number.toLowerCase() === serialSearchQuery.trim().toLowerCase() ||
                              s.barcode?.toLowerCase() === serialSearchQuery.trim().toLowerCase()
                          ) || filteredSerials[0];

                        const isAlreadyInCart = cart.some(
                          (c) =>
                            c.serialNumber &&
                            c.serialNumber.trim().toUpperCase() === targetItem.serial_number.toUpperCase()
                        );
                        if (!isAlreadyInCart) {
                          addSerializedItemToCart(
                            pendingSerializedProduct,
                            targetItem.serial_number,
                            targetItem.barcode
                          );
                          setSerialSearchQuery('');
                        }
                      }
                    }}
                    placeholder="Search or scan Serial Number (SN) / Barcode..."
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-sky-500 font-medium"
                  />
                  {serialSearchQuery && (
                    <button
                      onClick={() => setSerialSearchQuery('')}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>
                    Showing <strong>{filteredSerials.length}</strong> of{' '}
                    <strong>{pendingSerializedProduct.available_serials.length}</strong> available units
                  </span>
                  <span className="text-[10px] text-sky-600 dark:text-cyan-400 font-semibold">
                    Branch: {activeBranchObj.code}
                  </span>
                </div>
              </div>

              {/* Serials List */}
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1 text-xs">
                {filteredSerials.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 space-y-2 bg-slate-50 dark:bg-slate-950 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                    <AlertTriangle className="w-6 h-6 mx-auto text-amber-500 opacity-80" />
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      No serial numbers match &ldquo;{serialSearchQuery}&rdquo;
                    </p>
                    <button
                      type="button"
                      onClick={() => setSerialSearchQuery('')}
                      className="px-3 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold"
                    >
                      Clear Search Filter
                    </button>
                  </div>
                ) : (
                  filteredSerials.map((snItem) => {
                    const isAlreadyInCart = cart.some(
                      (c) =>
                        c.serialNumber &&
                        c.serialNumber.trim().toUpperCase() === snItem.serial_number.toUpperCase()
                    );
                    return (
                      <div
                        key={snItem.id}
                        onClick={() => {
                          if (!isAlreadyInCart) {
                            addSerializedItemToCart(
                              pendingSerializedProduct,
                              snItem.serial_number,
                              snItem.barcode
                            );
                            setSerialSearchQuery('');
                          }
                        }}
                        className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                          isAlreadyInCart
                            ? 'opacity-50 bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800 cursor-not-allowed'
                            : 'bg-slate-50 dark:bg-slate-950 hover:bg-sky-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800 hover:border-sky-500 cursor-pointer'
                        }`}
                      >
                        <div>
                          <span className="font-mono font-bold text-slate-900 dark:text-white block">
                            SN: {snItem.serial_number}
                          </span>
                          {snItem.barcode && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              Barcode: {snItem.barcode}
                            </span>
                          )}
                        </div>
                        <div>
                          {isAlreadyInCart ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-600">
                              In Ticket
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-lg bg-sky-600 text-white font-bold text-[11px] shadow-xs">
                              Pick Unit
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setIsSerialModalOpen(false);
                    setSerialSearchQuery('');
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* MODAL 2: CONFIRMATION SUMMARY MODAL */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-navy-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <h3 className="font-black text-slate-900 dark:text-white text-base">
                  Confirm Counter Sale Checkout
                </h3>
              </div>
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Review Summary Details */}
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Selected Counter:</span>
                  <strong className="text-slate-900 dark:text-white">{activeBranchObj.name}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Customer:</span>
                  <strong className="text-slate-900 dark:text-white">
                    {customerName} ({customerPhone})
                  </strong>
                </div>
                {customerAddress && (
                  <div className="flex justify-between text-[11px] pt-1 border-t border-slate-200/60 dark:border-slate-800/60">
                    <span className="text-slate-500">Address:</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200 text-right max-w-[260px] truncate">
                      {customerAddress}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Mode:</span>
                  <span className="font-bold uppercase text-emerald-600 dark:text-emerald-400">
                    {paymentMethod.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <div className="bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Itemized Ticket ({cart.length} entries)
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-44 overflow-y-auto p-2 space-y-1">
                  {cart.map((it) => (
                    <div key={it.id} className="flex justify-between items-center text-xs py-1">
                      <div className="min-w-0 flex-1 pr-2">
                        <span className="font-bold text-slate-900 dark:text-white truncate block">
                          {it.name} (x{it.qty})
                        </span>
                        {it.serialNumber && (
                          <span className="font-mono text-[10px] text-sky-600 dark:text-cyan-400 block">
                            SN: {it.serialNumber}
                          </span>
                        )}
                      </div>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">
                        ৳{(it.unitPrice * it.qty).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Grand Total */}
              <div className="flex justify-between items-center text-base font-black text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-800">
                <span>Final Payable:</span>
                <span className="text-xl text-sky-600 dark:text-brand-400 font-mono">
                  ৳{grandTotal.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={isSubmittingSale}
                onClick={() => setIsConfirmModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs"
              >
                Back to Ticket
              </button>
              <button
                type="button"
                disabled={isSubmittingSale}
                onClick={handleFinalSubmitSale}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-md disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {isSubmittingSale ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing Transaction...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Confirm &amp; Issue Receipt</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: WHOLE PC / CUSTOM PC BUILDER MODAL */}
      {isPcBuilderModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-navy-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-3xl w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 space-y-4 max-h-[90vh] flex flex-col justify-between">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center font-black text-lg border border-purple-200 dark:border-purple-800">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
                    <span>Whole PC Quick Assembly Assistant</span>
                    <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] font-bold">
                      Multi-Component Sale
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Quickly configure and bundle components for a complete PC sale at {activeBranchObj.name}.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPcBuilderModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Component Slots Grid */}
            <div className="space-y-2.5 overflow-y-auto pr-1 flex-1 text-xs">
              {[
                { key: 'cpu', label: 'Processor (CPU)' },
                { key: 'motherboard', label: 'Motherboard' },
                { key: 'gpu', label: 'Graphics Card (GPU)' },
                { key: 'ram', label: 'RAM / Memory' },
                { key: 'storage', label: 'Storage / SSD' },
                { key: 'power_supply', label: 'Power Supply (PSU)' },
                { key: 'casing', label: 'PC Casing' },
                { key: 'cooler', label: 'CPU Cooler' },
                { key: 'monitor', label: 'Monitor / Display' },
              ].map((slot) => {
                const selectedProd = pcBuilderSelections[slot.key];
                // Filter matching inventory for this slot
                const availableForSlot = products.filter(
                  (p) =>
                    p.stock_quantity > 0 &&
                    (p.pc_builder_component === slot.key ||
                      (slot.key === 'ram' && (p.name.toLowerCase().includes('ram') || p.name.toLowerCase().includes('ddr'))) ||
                      (slot.key === 'storage' && (p.name.toLowerCase().includes('ssd') || p.name.toLowerCase().includes('nvme'))) ||
                      (slot.key === 'gpu' && (p.name.toLowerCase().includes('rtx') || p.name.toLowerCase().includes('rx') || p.name.toLowerCase().includes('graphics'))) ||
                      (slot.key === 'cpu' && (p.name.toLowerCase().includes('core') || p.name.toLowerCase().includes('ryzen') || p.name.toLowerCase().includes('processor'))))
                );

                return (
                  <div
                    key={slot.key}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="w-40 flex-shrink-0">
                      <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs">
                        {slot.label}
                      </span>
                    </div>

                    <div className="flex-1 w-full">
                      <select
                        value={selectedProd ? String(selectedProd.id) : ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (!val) {
                            setPcBuilderSelections((prev) => ({ ...prev, [slot.key]: null }));
                          } else {
                            const found = products.find((p) => String(p.id) === val);
                            setPcBuilderSelections((prev) => ({ ...prev, [slot.key]: found || null }));
                          }
                        }}
                        className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-medium outline-none focus:border-purple-500 cursor-pointer"
                      >
                        <option value="">-- Choose {slot.label} (Optional) --</option>
                        {availableForSlot.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} - ৳{(p.discount_price || p.selling_price).toLocaleString()} ({p.stock_quantity} in stock)
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedProd && (
                      <div className="text-right flex-shrink-0 font-mono font-bold text-purple-600 dark:text-purple-400 text-xs">
                        ৳{(selectedProd.discount_price || selectedProd.selling_price).toLocaleString()}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Build Total & Action */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-3">
              <div>
                <span className="text-slate-500 dark:text-slate-400 text-xs block font-semibold">
                  Total Build Value:
                </span>
                <span className="text-lg font-black font-mono text-purple-600 dark:text-purple-400">
                  ৳
                  {Object.values(pcBuilderSelections)
                    .filter(Boolean)
                    .reduce((sum, p) => sum + (p!.discount_price || p!.selling_price), 0)
                    .toLocaleString()}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPcBuilderSelections({
                      cpu: null,
                      motherboard: null,
                      gpu: null,
                      ram: null,
                      storage: null,
                      power_supply: null,
                      casing: null,
                      cooler: null,
                      monitor: null,
                    });
                  }}
                  className="px-3 py-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 text-xs font-semibold"
                >
                  Clear Build
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const selectedList = Object.values(pcBuilderSelections).filter(Boolean) as ProductItem[];
                    if (selectedList.length === 0) {
                      alert('Please select at least one component to assemble.');
                      return;
                    }

                    // Add all selected components to the cart
                    for (const prod of selectedList) {
                      if (prod.is_serialized && prod.available_serials && prod.available_serials.length > 0) {
                        // Pick first available serial that is not already in cart
                        const unusedSerial = prod.available_serials.find(
                          (s) => !cart.some((c) => c.serialNumber?.toUpperCase() === s.serial_number.toUpperCase())
                        );
                        if (unusedSerial) {
                          addSerializedItemToCart(prod, unusedSerial.serial_number, unusedSerial.barcode);
                        } else {
                          addSerializedItemToCart(prod, prod.available_serials[0].serial_number, prod.available_serials[0].barcode);
                        }
                      } else {
                        addNonSerializedItemToCart(prod);
                      }
                    }

                    setIsPcBuilderModalOpen(false);
                    // Reset builder
                    setPcBuilderSelections({
                      cpu: null,
                      motherboard: null,
                      gpu: null,
                      ram: null,
                      storage: null,
                      power_supply: null,
                      casing: null,
                      cooler: null,
                      monitor: null,
                    });
                  }}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>
                    Add Build (
                    {Object.values(pcBuilderSelections).filter(Boolean).length} Components) to Sale Ticket
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
