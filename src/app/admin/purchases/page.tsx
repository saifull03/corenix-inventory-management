'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Truck,
  Store,
  Building2,
  Plus,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertTriangle,
  X,
  FileText,
  RefreshCw,
  Search,
  Copy,
  Check,
  CreditCard,
  Printer,
  ArrowRight,
  ArrowUpRight,
  ArrowDownLeft,
  Scale,
  Filter,
  Eye,
  Calendar,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Tag,
  Phone,
  MapPin,
  UserPlus,
  BookOpen,
  Download,
  Layers,
  ChevronDown,
  ChevronRight,
  FileSpreadsheet,
  ArrowUpDown,
  SlidersHorizontal,
} from 'lucide-react';
import { OtherHousePurchase, PartnerHouse, OtherHouseSale } from '@/lib/types';
import { canManagePurchases, canPurchaseProducts, isStoreManagerOnly } from '@/lib/permissions';

function PurchasesContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'other-house'
    ? 'other-house'
    : searchParams.get('tab') === 'sales-to-houses'
    ? 'sales-to-houses'
    : 'all';

  const [activeTab, setActiveTab] = useState<'all' | 'other-house' | 'sales-to-houses' | 'distributor'>(initialTab);

  // Distributor PO states
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loadingDistributor, setLoadingDistributor] = useState(true);
  const [isPoModalOpen, setIsPoModalOpen] = useState(false);
  const [poSearch, setPoSearch] = useState('');

  // PO form states
  const [supplierId, setSupplierId] = useState<number>(1);
  const [poBranchId, setPoBranchId] = useState<number>(1);
  const [totalAmount, setTotalAmount] = useState('');
  const [paidAmount, setPaidAmount] = useState('');
  const [transportCost, setTransportCost] = useState('0');
  const [poNotes, setPoNotes] = useState('');
  const [submittingPo, setSubmittingPo] = useState(false);
  const [poErrorMsg, setPoErrorMsg] = useState('');

  // Other House Purchases states
  const [otherHousePurchases, setOtherHousePurchases] = useState<OtherHousePurchase[]>([]);
  const [otherHouseMetrics, setOtherHouseMetrics] = useState({
    total_count: 0,
    total_value: 0,
    total_lend_due: 0,
    lend_count: 0,
    paid_count: 0,
    total_paid: 0,
  });
  const [catalogProducts, setCatalogProducts] = useState<any[]>([]);
  const [knownHouses, setKnownHouses] = useState<any[]>([]);
  const [loadingOtherHouse, setLoadingOtherHouse] = useState(true);
  const [ohSearch, setOhSearch] = useState('');
  const [ohPaymentFilter, setOhPaymentFilter] = useState<'all' | 'lend' | 'paid'>('all');
  const [ohBranchFilter, setOhBranchFilter] = useState<string>('all');
  const [copiedSerial, setCopiedSerial] = useState<string | null>(null);

  // Partner Houses Directory & Add New House States
  const [partnerHouses, setPartnerHouses] = useState<PartnerHouse[]>([]);
  const [loadingPartnerHouses, setLoadingPartnerHouses] = useState(false);
  const [isAddHouseModalOpen, setIsAddHouseModalOpen] = useState(false);
  const [isHouseDirectoryOpen, setIsHouseDirectoryOpen] = useState(false);
  const [newHouseName, setNewHouseName] = useState('');
  const [newHouseContact, setNewHouseContact] = useState('');
  const [newHousePhone, setNewHousePhone] = useState('');
  const [newHouseAddress, setNewHouseAddress] = useState('');
  const [newHouseNotes, setNewHouseNotes] = useState('');
  const [submittingNewHouse, setSubmittingNewHouse] = useState(false);
  const [newHouseError, setNewHouseError] = useState('');
  const [newHouseSuccess, setNewHouseSuccess] = useState('');

  // Shop Statement / House Ledger States
  const [isLedgerModalOpen, setIsLedgerModalOpen] = useState(false);
  const [ledgerHouseFilter, setLedgerHouseFilter] = useState<string>('all');
  const [ledgerStartDate, setLedgerStartDate] = useState<string>('');
  const [ledgerEndDate, setLedgerEndDate] = useState<string>('');
  const [ledgerStatusFilter, setLedgerStatusFilter] = useState<'all' | 'lend' | 'paid'>('all');
  const [ledgerBranchFilter, setLedgerBranchFilter] = useState<string>('all');
  const [ledgerTypeFilter, setLedgerTypeFilter] = useState<string>('all'); // all | purchases | sales | payments | collections
  const [ledgerSearchQuery, setLedgerSearchQuery] = useState<string>('');
  const [ledgerSortOrder, setLedgerSortOrder] = useState<'asc' | 'desc'>('asc');
  const [ledgerData, setLedgerData] = useState<any>(null);
  const [loadingLedger, setLoadingLedger] = useState(false);
  const [ledgerViewMode, setLedgerViewMode] = useState<'summary' | 'daily' | 'transactions'>('daily');
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({});
  const [expandedTransactions, setExpandedTransactions] = useState<Record<string, boolean>>({});

  // Other House Create Modal states
  const [isOhModalOpen, setIsOhModalOpen] = useState(false);
  const [submittingOh, setSubmittingOh] = useState(false);
  const [ohErrorMsg, setOhErrorMsg] = useState('');

  // Form fields for Other House Purchase
  const [houseName, setHouseName] = useState('');
  const [houseContact, setHouseContact] = useState('');
  const [housePhone, setHousePhone] = useState('');
  const [houseAddress, setHouseAddress] = useState('');
  const [branchId, setBranchId] = useState<number>(1);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [productName, setProductName] = useState('');
  const [productBrand, setProductBrand] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [productModel, setProductModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unitCost, setUnitCost] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [warrantyPeriod, setWarrantyPeriod] = useState('1 Year Official Warranty');
  const [isLend, setIsLend] = useState(true); // default true: brought on lend
  const [ohPaidAmount, setOhPaidAmount] = useState('');
  const [ohPaymentMethod, setOhPaymentMethod] = useState('Cash');
  const [ohPaymentReference, setOhPaymentReference] = useState('');
  const [ohPaidByName, setOhPaidByName] = useState('Admin');
  const [ohPaymentNotes, setOhPaymentNotes] = useState('');
  const [ohGeneralNotes, setOhGeneralNotes] = useState('');
  const [addToInventory, setAddToInventory] = useState(true);

  // Lend Settlement Modal states
  const [settleModalItem, setSettleModalItem] = useState<OtherHousePurchase | null>(null);
  const [settleAmount, setSettleAmount] = useState('');
  const [settleMethod, setSettleMethod] = useState('Cash');
  const [settleRef, setSettleRef] = useState('');
  const [settleDate, setSettleDate] = useState('');
  const [settleBy, setSettleBy] = useState('Admin');
  const [settleNotes, setSettleNotes] = useState('');
  const [submittingSettle, setSubmittingSettle] = useState(false);
  const [settleError, setSettleError] = useState('');

  // ==========================================
  // OTHER HOUSE SALES (SELLING TO HOUSES) STATES
  // ==========================================
  const [otherHouseSales, setOtherHouseSales] = useState<OtherHouseSale[]>([]);
  const [otherHouseSalesMetrics, setOtherHouseSalesMetrics] = useState({
    total_count: 0,
    total_value: 0,
    total_paid: 0,
    total_receivable_due: 0,
    lend_count: 0,
    paid_count: 0,
  });
  const [loadingOtherHouseSales, setLoadingOtherHouseSales] = useState(true);
  const [ohsSearch, setOhsSearch] = useState('');
  const [ohsPaymentFilter, setOhsPaymentFilter] = useState<'all' | 'lend' | 'paid'>('all');
  const [ohsBranchFilter, setOhsBranchFilter] = useState<string>('all');

  // Sell to Partner House Modal States
  const [isOhsModalOpen, setIsOhsModalOpen] = useState(false);
  const [submittingOhs, setSubmittingOhs] = useState(false);
  const [ohsErrorMsg, setOhsErrorMsg] = useState('');

  // Form fields for Selling to House
  const [ohsHouseName, setOhsHouseName] = useState('');
  const [ohsHouseContact, setOhsHouseContact] = useState('');
  const [ohsHousePhone, setOhsHousePhone] = useState('');
  const [ohsHouseAddress, setOhsHouseAddress] = useState('');
  const [ohsBranchId, setOhsBranchId] = useState<number>(1);
  const [ohsSelectedProductId, setOhsSelectedProductId] = useState<number | null>(null);
  const [ohsProductName, setOhsProductName] = useState('');
  const [ohsProductBrand, setOhsProductBrand] = useState('');
  const [ohsProductCategory, setOhsProductCategory] = useState('');
  const [ohsProductModel, setOhsProductModel] = useState('');
  const [ohsSerialNumber, setOhsSerialNumber] = useState('');
  const [ohsQuantity, setOhsQuantity] = useState(1);
  const [ohsCostPrice, setOhsCostPrice] = useState('');
  const [ohsUnitPrice, setOhsUnitPrice] = useState('');
  const [ohsWarrantyPeriod, setOhsWarrantyPeriod] = useState('1 Year Official Warranty');
  const [ohsIsLend, setOhsIsLend] = useState(true); // default true: lend out
  const [ohsPaidAmount, setOhsPaidAmount] = useState('');
  const [ohsPaymentMethod, setOhsPaymentMethod] = useState('Cash');
  const [ohsPaymentReference, setOhsPaymentReference] = useState('');
  const [ohsReceivedByName, setOhsReceivedByName] = useState('Manager');
  const [ohsPaymentNotes, setOhsPaymentNotes] = useState('');
  const [ohsGeneralNotes, setOhsGeneralNotes] = useState('');

  // Available Serials in Branch Stock for Selected Product
  const [availableSerialsList, setAvailableSerialsList] = useState<any[]>([]);
  const [loadingAvailableSerials, setLoadingAvailableSerials] = useState(false);

  // Settle Sale Lend / Receivable Modal States
  const [settleSaleModalItem, setSettleSaleModalItem] = useState<OtherHouseSale | null>(null);
  const [settleSaleAmount, setSettleSaleAmount] = useState('');
  const [settleSaleMethod, setSettleSaleMethod] = useState('Cash');
  const [settleSaleRef, setSettleSaleRef] = useState('');
  const [settleSaleDate, setSettleSaleDate] = useState('');
  const [settleSaleBy, setSettleSaleBy] = useState('Accounts');
  const [settleSaleNotes, setSettleSaleNotes] = useState('');
  const [submittingSaleSettle, setSubmittingSaleSettle] = useState(false);
  const [settleSaleError, setSettleSaleError] = useState('');

  // Inspection / Delivery Challan Modal state for Sales
  const [viewSaleChallanItem, setViewSaleChallanItem] = useState<OtherHouseSale | null>(null);

  // User authentication & RBAC states
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Inspection / Voucher Modal state for Purchases
  const [viewVoucherItem, setViewVoucherItem] = useState<OtherHousePurchase | null>(null);

  // Popular / Suggestion Houses in Bangladesh Computer Market
  const popularHouses = [
    { name: 'Star Tech & Engineering (Multiplan)', contact: 'Sabbir Hossain', phone: '01712-345678', address: 'Level 4, Multiplan Center, Elephant Road' },
    { name: 'Ryans Computers Ltd (IDB Bhaban)', contact: 'Tanvir Alam', phone: '01819-876543', address: 'Ground Floor, BCS Computer City, Agargaon' },
    { name: 'UCC (Uttara Showroom Partner)', contact: 'Kamrul Hasan', phone: '01911-223344', address: 'Sector 3, Commercial Area, Uttara' },
    { name: 'Techland BD (Multiplan Level 5)', contact: 'Arif Chowdhury', phone: '01700-112233', address: 'Shop 508, Multiplan Center, Dhaka' },
    { name: 'Skyland Computer Center', contact: 'Zubair Ahmed', phone: '01855-998877', address: 'Shop 310, Alpana Plaza, Elephant Road' },
  ];

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
          if (data.user.branch_id) {
            setBranchId(data.user.branch_id);
            setPoBranchId(data.user.branch_id);
            if (data.user.role_slug === 'shop-manager' || data.user.role_slug === 'store-manager') {
              setOhBranchFilter(data.user.branch_id.toString());
            }
          }
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setAuthLoading(false));

    fetchDistributorPOs();
    fetchOtherHousePurchases();
    fetchOtherHouseSales();
    fetchPartnerHouses();
    // Default settle date to current ISO string formatted for datetime-local
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    setSettleDate(now.toISOString().slice(0, 16));
    setSettleSaleDate(now.toISOString().slice(0, 16));
  }, []);

  const fetchDistributorPOs = async () => {
    try {
      setLoadingDistributor(true);
      const res = await fetch('/api/admin/purchases');
      const data = await res.json();
      if (data.success) {
        setPurchaseOrders(data.purchaseOrders || []);
        setSuppliers(data.suppliers || []);
        setBranches(data.branches || []);
        if (data.suppliers.length > 0) setSupplierId(data.suppliers[0].id);
        if (data.branches.length > 0) {
          setPoBranchId(data.branches[0].id);
          setBranchId(data.branches[0].id);
          setOhsBranchId(data.branches[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDistributor(false);
    }
  };

  const fetchOtherHousePurchases = async () => {
    try {
      setLoadingOtherHouse(true);
      const res = await fetch('/api/admin/purchases/other-house');
      const data = await res.json();
      if (data.success) {
        setOtherHousePurchases(data.purchases || []);
        setOtherHouseMetrics(data.metrics || {
          total_count: 0,
          total_value: 0,
          total_lend_due: 0,
          lend_count: 0,
          paid_count: 0,
          total_paid: 0,
        });
        setCatalogProducts(data.products || []);
        setKnownHouses(data.knownHouses || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOtherHouse(false);
    }
  };

  const fetchOtherHouseSales = async () => {
    try {
      setLoadingOtherHouseSales(true);
      const res = await fetch('/api/admin/purchases/other-house/sales');
      const data = await res.json();
      if (data.success) {
        setOtherHouseSales(data.sales || []);
        setOtherHouseSalesMetrics(data.metrics || {
          total_count: 0,
          total_value: 0,
          total_paid: 0,
          total_receivable_due: 0,
          lend_count: 0,
          paid_count: 0,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOtherHouseSales(false);
    }
  };

  // Helper to fetch live available serial numbers in branch stock for a selected product
  const fetchAvailableSerialsForProduct = async (pId: number, bId: number) => {
    try {
      setLoadingAvailableSerials(true);
      const res = await fetch(`/api/admin/pos/serials?productId=${pId}&branchId=${bId}`);
      const data = await res.json();
      if (data.success && data.serials) {
        setAvailableSerialsList(data.serials || []);
        if (data.serials.length > 0 && !ohsSerialNumber) {
          setOhsSerialNumber(data.serials[0].serial_number);
        }
      } else {
        setAvailableSerialsList([]);
      }
    } catch (err) {
      console.error('Error fetching available serials:', err);
      setAvailableSerialsList([]);
    } finally {
      setLoadingAvailableSerials(false);
    }
  };

  const handleSelectProductForSale = (productIdStr: string) => {
    const pId = Number(productIdStr);
    if (!pId) {
      setOhsSelectedProductId(null);
      setAvailableSerialsList([]);
      return;
    }
    const found = catalogProducts.find((p) => p.id === pId);
    if (found) {
      setOhsSelectedProductId(found.id);
      setOhsProductName(found.name);
      setOhsProductBrand(found.brand_name || '');
      setOhsProductCategory(found.category_name || '');
      setOhsCostPrice(found.purchase_cost?.toString() || '0');
      setOhsUnitPrice(found.selling_price?.toString() || '');
      if (found.warranty_period) setOhsWarrantyPeriod(found.warranty_period);
      fetchAvailableSerialsForProduct(found.id, ohsBranchId);
    }
  };

  // Handle Create Other House Sale (Selling / Lending out to partner house)
  const handleCreateOtherHouseSale = async (e: React.FormEvent) => {
    e.preventDefault();
    setOhsErrorMsg('');
    setSubmittingOhs(true);

    if (!ohsHouseName.trim()) {
      setOhsErrorMsg('Please specify the Partner House / Buyer Shop Name.');
      setSubmittingOhs(false);
      return;
    }
    if (!ohsProductName.trim()) {
      setOhsErrorMsg('Please specify the Product Name.');
      setSubmittingOhs(false);
      return;
    }
    if (!ohsSerialNumber.trim()) {
      setOhsErrorMsg('Product Serial Number (SN) is strictly required.');
      setSubmittingOhs(false);
      return;
    }

    const calculatedTotal = (parseFloat(ohsUnitPrice) || 0) * (Number(ohsQuantity) || 1);
    if (calculatedTotal <= 0) {
      setOhsErrorMsg('Unit price and total amount must be greater than 0.');
      setSubmittingOhs(false);
      return;
    }

    try {
      const res = await fetch('/api/admin/purchases/other-house/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          houseName: ohsHouseName,
          houseContact: ohsHouseContact,
          housePhone: ohsHousePhone,
          houseAddress: ohsHouseAddress,
          branchId: ohsBranchId,
          productId: ohsSelectedProductId,
          productName: ohsProductName,
          productBrand: ohsProductBrand,
          productCategory: ohsProductCategory,
          productModel: ohsProductModel,
          serialNumber: ohsSerialNumber,
          quantity: Number(ohsQuantity) || 1,
          costPrice: parseFloat(ohsCostPrice || '0'),
          unitPrice: parseFloat(ohsUnitPrice),
          totalAmount: calculatedTotal,
          warrantyPeriod: ohsWarrantyPeriod,
          isLend: ohsIsLend,
          paidAmount: ohsIsLend ? parseFloat(ohsPaidAmount || '0') : calculatedTotal,
          paymentMethod: ohsIsLend ? (ohsPaidAmount ? ohsPaymentMethod : null) : ohsPaymentMethod,
          paymentReference: ohsPaymentReference,
          receivedByName: ohsReceivedByName,
          paymentNotes: ohsPaymentNotes,
          notes: ohsGeneralNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setOhsErrorMsg(data.error || 'Failed to record Sale to House');
        setSubmittingOhs(false);
        return;
      }

      // Reset form
      setOhsHouseName('');
      setOhsHouseContact('');
      setOhsHousePhone('');
      setOhsHouseAddress('');
      setOhsSelectedProductId(null);
      setOhsProductName('');
      setOhsProductBrand('');
      setOhsProductCategory('');
      setOhsProductModel('');
      setOhsSerialNumber('');
      setOhsQuantity(1);
      setOhsCostPrice('');
      setOhsUnitPrice('');
      setOhsPaidAmount('');
      setOhsPaymentReference('');
      setOhsGeneralNotes('');
      setOhsIsLend(true);
      setIsOhsModalOpen(false);

      fetchOtherHouseSales();
      fetchPartnerHouses();
    } catch (err: any) {
      setOhsErrorMsg(err.message || 'Error communicating with server.');
    } finally {
      setSubmittingOhs(false);
    }
  };

  // Open Settle Sale Lend / Collect Receivable Modal
  const openSettleSaleModal = (item: OtherHouseSale) => {
    setSettleSaleModalItem(item);
    setSettleSaleAmount(item.due_amount.toString());
    setSettleSaleMethod('Cash');
    setSettleSaleRef('');
    setSettleSaleNotes('');
    setSettleSaleBy(currentUser?.name || 'Accounts');
    setSettleSaleError('');

    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    setSettleSaleDate(now.toISOString().slice(0, 16));
  };

  // Submit Settle Sale Receivable
  const handleSettleSaleReceivable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settleSaleModalItem) return;
    setSettleSaleError('');
    setSubmittingSaleSettle(true);

    const amt = parseFloat(settleSaleAmount);
    if (!amt || amt <= 0) {
      setSettleSaleError('Payment amount must be greater than 0.');
      setSubmittingSaleSettle(false);
      return;
    }

    try {
      const res = await fetch('/api/admin/purchases/other-house/sales', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: settleSaleModalItem.id,
          action: 'settle_receivable',
          paymentAmount: amt,
          paymentMethod: settleSaleMethod,
          paymentReference: settleSaleRef,
          paidAtDate: settleSaleDate,
          receivedByName: settleSaleBy,
          paymentNotes: settleSaleNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setSettleSaleError(data.error || 'Failed to collect payment');
        setSubmittingSaleSettle(false);
        return;
      }

      setSettleSaleModalItem(null);
      fetchOtherHouseSales();
      fetchPartnerHouses();
    } catch (err: any) {
      setSettleSaleError(err.message || 'Server error while settling payment.');
    } finally {
      setSubmittingSaleSettle(false);
    }
  };

  // Delete Other House Sale
  const handleDeleteOtherHouseSale = async (id: number, invoiceNo: string) => {
    if (!confirm(`Are you sure you want to delete Sale Invoice #${invoiceNo}? This will restore the serial number to stock.`)) return;
    try {
      const res = await fetch(`/api/admin/purchases/other-house/sales?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchOtherHouseSales();
      } else {
        alert(data.error || 'Failed to delete sale');
      }
    } catch (err: any) {
      alert(err.message || 'Error deleting sale');
    }
  };

  const fetchPartnerHouses = async () => {
    try {
      setLoadingPartnerHouses(true);
      const res = await fetch('/api/admin/partner-houses');
      const data = await res.json();
      if (data.success) {
        setPartnerHouses(data.houses || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPartnerHouses(false);
    }
  };

  const handleCreatePartnerHouse = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewHouseError('');
    setNewHouseSuccess('');
    setSubmittingNewHouse(true);

    try {
      const res = await fetch('/api/admin/partner-houses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newHouseName,
          contact_person: newHouseContact,
          phone: newHousePhone,
          address: newHouseAddress,
          notes: newHouseNotes,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setNewHouseError(data.error || 'Failed to save partner house');
        setSubmittingNewHouse(false);
        return;
      }

      setNewHouseSuccess('Partner House registered successfully!');
      fetchPartnerHouses();
      fetchOtherHousePurchases();

      // If user was creating a purchase, prefill the new house
      setHouseName(data.house.name);
      setHouseContact(data.house.contact_person || '');
      setHousePhone(data.house.phone || '');
      setHouseAddress(data.house.address || '');

      setTimeout(() => {
        setIsAddHouseModalOpen(false);
        setNewHouseName('');
        setNewHouseContact('');
        setNewHousePhone('');
        setNewHouseAddress('');
        setNewHouseNotes('');
        setNewHouseSuccess('');
      }, 900);
    } catch (err: any) {
      setNewHouseError(err.message || 'Error creating partner house');
    } finally {
      setSubmittingNewHouse(false);
    }
  };

  const handleDeletePartnerHouse = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to remove "${name}" from registered partner houses?`)) return;
    try {
      const res = await fetch(`/api/admin/partner-houses?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchPartnerHouses();
      } else {
        alert(data.error || 'Failed to delete partner house');
      }
    } catch (err: any) {
      alert(err.message || 'Error deleting partner house');
    }
  };

  const fetchLedgerReport = async (
    targetHouse = ledgerHouseFilter,
    targetStart = ledgerStartDate,
    targetEnd = ledgerEndDate,
    targetStatus = ledgerStatusFilter,
    targetBranch = ledgerBranchFilter,
    targetType = ledgerTypeFilter,
    targetSearch = ledgerSearchQuery,
    targetSort = ledgerSortOrder
  ) => {
    try {
      setLoadingLedger(true);
      const params = new URLSearchParams();
      if (targetHouse && targetHouse !== 'all') params.set('house_name', targetHouse);
      if (targetStart) params.set('from_date', targetStart);
      if (targetEnd) params.set('to_date', targetEnd);
      if (targetStatus && targetStatus !== 'all') params.set('payment_status', targetStatus);
      if (targetBranch && targetBranch !== 'all') params.set('branch_id', targetBranch);
      if (targetType && targetType !== 'all') params.set('type', targetType);
      if (targetSearch.trim()) params.set('search', targetSearch.trim());
      if (targetSort) params.set('sort_order', targetSort);

      const res = await fetch(`/api/admin/purchases/other-house/ledger?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setLedgerData(data);
        if (data.groupedByDay) {
          const exp: Record<string, boolean> = {};
          data.groupedByDay.forEach((g: any) => {
            exp[g.date] = true;
          });
          setExpandedDays(exp);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLedger(false);
    }
  };

  const openLedgerForHouse = (houseName = 'all') => {
    setLedgerHouseFilter(houseName);
    setIsLedgerModalOpen(true);
    fetchLedgerReport(houseName, ledgerStartDate, ledgerEndDate, ledgerStatusFilter, ledgerBranchFilter, ledgerTypeFilter, ledgerSearchQuery, ledgerSortOrder);
  };

  const applyDatePreset = (preset: 'today' | 'yesterday' | 'this_week' | 'last_week' | 'this_month' | 'last_month' | 'this_year' | 'all') => {
    const today = new Date();
    const formatDate = (d: Date) => d.toISOString().split('T')[0];

    let start = '';
    let end = formatDate(today);

    if (preset === 'today') {
      start = end;
    } else if (preset === 'yesterday') {
      const y = new Date(today);
      y.setDate(y.getDate() - 1);
      start = formatDate(y);
      end = formatDate(y);
    } else if (preset === 'this_week') {
      const d = new Date(today);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      d.setDate(diff);
      start = formatDate(d);
    } else if (preset === 'last_week') {
      const d = new Date(today);
      const day = d.getDay();
      const diff = d.getDate() - day - 6;
      d.setDate(diff);
      start = formatDate(d);
      const dEnd = new Date(d);
      dEnd.setDate(dEnd.getDate() + 6);
      end = formatDate(dEnd);
    } else if (preset === 'this_month') {
      const d = new Date(today.getFullYear(), today.getMonth(), 1);
      start = formatDate(d);
    } else if (preset === 'last_month') {
      const dStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const dEnd = new Date(today.getFullYear(), today.getMonth(), 0);
      start = formatDate(dStart);
      end = formatDate(dEnd);
    } else if (preset === 'this_year') {
      const d = new Date(today.getFullYear(), 0, 1);
      start = formatDate(d);
    } else if (preset === 'all') {
      start = '';
      end = '';
    }

    setLedgerStartDate(start);
    setLedgerEndDate(end);
    fetchLedgerReport(ledgerHouseFilter, start, end, ledgerStatusFilter, ledgerBranchFilter, ledgerTypeFilter, ledgerSearchQuery, ledgerSortOrder);
  };

  const toggleDayExpand = (dayKey: string) => {
    setExpandedDays(prev => ({
      ...prev,
      [dayKey]: !prev[dayKey]
    }));
  };

  const expandAllDays = () => {
    if (!ledgerData?.groupedByDay) return;
    const exp: Record<string, boolean> = {};
    ledgerData.groupedByDay.forEach((g: any) => { exp[g.date] = true; });
    setExpandedDays(exp);
  };

  const collapseAllDays = () => {
    setExpandedDays({});
  };

  const toggleTransactionExpand = (id: string) => {
    setExpandedTransactions(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const exportLedgerToCSV = () => {
    if (!ledgerData?.activities || ledgerData.activities.length === 0) {
      alert('No ledger transactions available to export.');
      return;
    }

    const headers = [
      'Date',
      'Time',
      'Transaction Type',
      'Reference',
      'Partner House',
      'Description',
      'Product Name',
      'SKU',
      'Serial Number',
      'Quantity',
      'Unit Price (BDT)',
      'Debit (BDT)',
      'Credit (BDT)',
      'Paid Amount (BDT)',
      'Due Amount (BDT)',
      'Running Balance (BDT)',
      'Payment Method',
      'Staff / Recorded By',
      'Branch',
      'Notes'
    ];

    const rows = ledgerData.activities.map((act: any) => [
      new Date(act.date).toLocaleDateString('en-GB'),
      new Date(act.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
      `"${act.type_display || act.type_code || act.activity_type}"`,
      `"${act.doc_no || ''}"`,
      `"${act.house_name || ''}"`,
      `"${(act.title || '').replace(/"/g, '""')}"`,
      `"${(act.product_name || '').replace(/"/g, '""')}"`,
      `"${act.sku || ''}"`,
      `"${act.serial_number || ''}"`,
      act.quantity || 1,
      act.unit_price || 0,
      act.debit || 0,
      act.credit || 0,
      act.paid_amount || 0,
      act.due_amount || 0,
      act.running_balance || 0,
      `"${act.payment_method || ''}"`,
      `"${act.staff_name || ''}"`,
      `"${act.branch_name || ''}"`,
      `"${(act.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e: any[]) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Corenix_Ledger_${ledgerHouseFilter !== 'all' ? ledgerHouseFilter : 'All_Houses'}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  // Handle Distributor PO creation
  const handleCreatePO = async (e: React.FormEvent) => {
    e.preventDefault();
    setPoErrorMsg('');
    setSubmittingPo(true);

    try {
      const res = await fetch('/api/admin/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierId,
          branchId: poBranchId,
          totalAmount: parseFloat(totalAmount),
          paidAmount: parseFloat(paidAmount || '0'),
          transportCost: parseFloat(transportCost || '0'),
          notes: poNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setPoErrorMsg(data.error || 'Failed to create PO');
        setSubmittingPo(false);
        return;
      }

      setTotalAmount('');
      setPaidAmount('');
      setPoNotes('');
      setIsPoModalOpen(false);
      fetchDistributorPOs();
    } catch (err) {
      setPoErrorMsg('Failed to create purchase order');
    } finally {
      setSubmittingPo(false);
    }
  };

  const handlePoStatusUpdate = async (id: number, status: string) => {
    try {
      await fetch('/api/admin/purchases', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      fetchDistributorPOs();
    } catch (err) {
      console.error(err);
    }
  };

  // Product autofill helper when catalog product is chosen
  const handleCatalogProductSelect = (productIdStr: string) => {
    const pId = Number(productIdStr);
    if (!pId) {
      setSelectedProductId(null);
      return;
    }
    const found = catalogProducts.find((p) => p.id === pId);
    if (found) {
      setSelectedProductId(found.id);
      setProductName(found.name);
      setProductBrand(found.brand_name || '');
      setProductCategory(found.category_name || '');
      setUnitCost(found.purchase_cost?.toString() || '');
      setSellingPrice(found.selling_price?.toString() || '');
      if (found.warranty_period) setWarrantyPeriod(found.warranty_period);
    }
  };

  // Quick house suggestion selection
  const handleSelectSuggestedHouse = (h: { name: string; contact?: string; phone?: string; address?: string }) => {
    setHouseName(h.name);
    if (h.contact) setHouseContact(h.contact);
    if (h.phone) setHousePhone(h.phone);
    if (h.address) setHouseAddress(h.address);
  };

  // Create Other House Purchase (with Serial Number & Lend option)
  const handleCreateOtherHousePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    setOhErrorMsg('');
    setSubmittingOh(true);

    if (!houseName.trim()) {
      setOhErrorMsg('Please specify the Other House / Vendor Name.');
      setSubmittingOh(false);
      return;
    }
    if (!productName.trim()) {
      setOhErrorMsg('Please provide product details / name.');
      setSubmittingOh(false);
      return;
    }
    if (!serialNumber.trim()) {
      setOhErrorMsg('Serial number is required to track hardware units from other houses.');
      setSubmittingOh(false);
      return;
    }
    if (!unitCost || Number(unitCost) <= 0) {
      setOhErrorMsg('Please specify a valid purchase unit cost.');
      setSubmittingOh(false);
      return;
    }

    const calculatedTotal = Number(unitCost) * (quantity || 1);

    try {
      const res = await fetch('/api/admin/purchases/other-house', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          houseName,
          houseContact,
          housePhone,
          houseAddress,
          branchId,
          productId: selectedProductId,
          productName,
          productBrand,
          productCategory,
          productModel,
          serialNumber,
          quantity: Number(quantity) || 1,
          unitCost: parseFloat(unitCost),
          totalCost: calculatedTotal,
          sellingPrice: sellingPrice ? parseFloat(sellingPrice) : 0,
          warrantyPeriod,
          isLend, // Brought in lend
          paidAmount: isLend ? parseFloat(ohPaidAmount || '0') : calculatedTotal,
          paymentMethod: isLend ? (ohPaidAmount ? ohPaymentMethod : null) : ohPaymentMethod,
          paymentReference: ohPaymentReference,
          paidByName: ohPaidByName,
          paymentNotes: ohPaymentNotes,
          notes: ohGeneralNotes,
          addToInventory,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setOhErrorMsg(data.error || 'Failed to record Other House Purchase');
        setSubmittingOh(false);
        return;
      }

      // Reset form
      setHouseName('');
      setHouseContact('');
      setHousePhone('');
      setHouseAddress('');
      setSelectedProductId(null);
      setProductName('');
      setProductBrand('');
      setProductCategory('');
      setProductModel('');
      setSerialNumber('');
      setQuantity(1);
      setUnitCost('');
      setSellingPrice('');
      setOhPaidAmount('');
      setOhPaymentReference('');
      setOhGeneralNotes('');
      setIsLend(true);
      setIsOhModalOpen(false);

      fetchOtherHousePurchases();
    } catch (err: any) {
      setOhErrorMsg(err.message || 'Error communicating with server.');
    } finally {
      setSubmittingOh(false);
    }
  };

  // Open Lend Settlement Modal
  const openSettleModal = (item: OtherHousePurchase) => {
    setSettleModalItem(item);
    setSettleAmount(item.due_amount.toString());
    setSettleMethod('Cash');
    setSettleRef('');
    setSettleNotes('');
    setSettleBy('Admin');
    setSettleError('');

    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    setSettleDate(now.toISOString().slice(0, 16));
  };

  // Submit Lend Settlement (Mark as Paid / Partial)
  const handleSettleLend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settleModalItem) return;
    setSettleError('');
    setSubmittingSettle(true);

    const amt = parseFloat(settleAmount);
    if (!amt || amt <= 0) {
      setSettleError('Payment amount must be greater than 0.');
      setSubmittingSettle(false);
      return;
    }

    try {
      const res = await fetch('/api/admin/purchases/other-house', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: settleModalItem.id,
          action: 'settle_payment',
          paymentAmount: amt,
          paymentMethod: settleMethod,
          paymentReference: settleRef,
          paidAtDate: settleDate,
          paidByName: settleBy,
          paymentNotes: settleNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setSettleError(data.error || 'Failed to settle lend payment');
        setSubmittingSettle(false);
        return;
      }

      setSettleModalItem(null);
      fetchOtherHousePurchases();
    } catch (err: any) {
      setSettleError(err.message || 'Server error while settling payment.');
    } finally {
      setSubmittingSettle(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSerial(text);
    setTimeout(() => setCopiedSerial(null), 2500);
  };

  // Filter Other House purchases
  const filteredOtherHouse = otherHousePurchases.filter((p) => {
    const q = ohSearch.toLowerCase();
    const matchesSearch =
      p.tracking_number.toLowerCase().includes(q) ||
      p.house_name.toLowerCase().includes(q) ||
      p.product_name.toLowerCase().includes(q) ||
      p.serial_number.toLowerCase().includes(q) ||
      (p.house_contact && p.house_contact.toLowerCase().includes(q)) ||
      (p.house_phone && p.house_phone.toLowerCase().includes(q));

    const matchesStatus =
      ohPaymentFilter === 'all' ||
      (ohPaymentFilter === 'lend' && (p.payment_status === 'lend' || p.payment_status === 'partially_paid')) ||
      (ohPaymentFilter === 'paid' && p.payment_status === 'paid');

    const matchesBranch =
      ohBranchFilter === 'all' || p.branch_id.toString() === ohBranchFilter;

    return matchesSearch && matchesStatus && matchesBranch;
  });

  // Filter Other House Sales (Selling to Houses)
  const filteredOtherHouseSales = otherHouseSales.filter((s) => {
    const q = ohsSearch.toLowerCase();
    const matchesSearch =
      s.invoice_no?.toLowerCase().includes(q) ||
      s.house_name.toLowerCase().includes(q) ||
      s.product_name.toLowerCase().includes(q) ||
      s.serial_number.toLowerCase().includes(q) ||
      (s.house_contact && s.house_contact.toLowerCase().includes(q)) ||
      (s.house_phone && s.house_phone.toLowerCase().includes(q));

    const matchesStatus =
      ohsPaymentFilter === 'all' ||
      (ohsPaymentFilter === 'lend' && (s.payment_status === 'lend' || s.payment_status === 'partially_paid')) ||
      (ohsPaymentFilter === 'paid' && s.payment_status === 'paid');

    const matchesBranch =
      ohsBranchFilter === 'all' || s.branch_id.toString() === ohsBranchFilter;

    return matchesSearch && matchesStatus && matchesBranch;
  });

  // Filter POs
  const filteredPOs = purchaseOrders.filter((po) => {
    const q = poSearch.toLowerCase();
    return (
      po.po_number?.toLowerCase().includes(q) ||
      po.supplier_name?.toLowerCase().includes(q) ||
      po.branch_name?.toLowerCase().includes(q)
    );
  });

  const totalDistributorSpent = purchaseOrders.reduce((sum, po) => sum + Number(po.total_amount || 0), 0);
  const totalDistributorDue = purchaseOrders.reduce(
    (sum, po) => sum + (Number(po.total_amount || 0) - Number(po.paid_amount || 0)),
    0
  );

  const hasManageAccess = canManagePurchases(currentUser);
  const hasPurchaseAccess = canPurchaseProducts(currentUser);
  const isStoreManager = isStoreManagerOnly(currentUser);

  if (!authLoading && !hasPurchaseAccess) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Access Restricted</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Only <strong>Accounts Manager</strong>, <strong>Admin</strong>, <strong>HR</strong>, and authorized <strong>Store Managers</strong> have access to the Purchases & Procurement section.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 text-left">
            <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-500" />
              <span>Permission Access Rules</span>
            </div>
            <ul className="list-disc pl-4 space-y-1 text-[10px]">
              <li><strong>Accounts Manager, Admin & HR</strong>: Full access to manage house ledgers, settlements, partner shops, and procurement.</li>
              <li><strong>Store Manager</strong>: Authorized strictly to purchase products and sell to partner houses for their assigned store branch.</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-6 print:hidden">
        {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-cyan-400">
              Procurement & Partner Supply Chain
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
              {otherHouseMetrics.lend_count} Sourced on Lend
            </span>
            {otherHouseSalesMetrics.lend_count > 0 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                {otherHouseSalesMetrics.lend_count} Sold on Lend
              </span>
            )}
            {isStoreManager && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border border-sky-300 dark:border-sky-800">
                <Store className="w-3 h-3 text-sky-600 dark:text-sky-400" />
                <span>Store Manager</span>
              </span>
            )}
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 mt-0.5">
            <Truck className="w-6 h-6 text-sky-600 dark:text-cyan-400" />
            <span>Purchases, Partner Sourcing & House Sales</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Procure stock from brand distributors, source from market houses on lend, or sell/lend out hardware units to partner houses (সহযোগী হাউস থেকে ক্রয় ও বিক্রয়).
          </p>
        </div>

        {/* Action Buttons: Accounts/Admin/HR get full actions, Store Manager gets Purchase & Sell */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Option 1: Add New House - Accounts Manager, Admin, HR only */}
          {hasManageAccess && (
            <button
              onClick={() => {
                setNewHouseError('');
                setNewHouseSuccess('');
                setIsAddHouseModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-purple-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Add New House (নতুন হাউস)</span>
            </button>
          )}

          {/* Option 2: Purchase Product from House - Store Manager + Managers */}
          <button
            onClick={() => setIsOhModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-navy-950 font-bold text-xs flex items-center gap-2 shadow-md shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <ArrowDownLeft className="w-4 h-4 text-navy-950" />
            <span>+ Purchase from House (হাউস ক্রয়)</span>
          </button>

          {/* Option 3: Sell Product to Partner House - Store Manager + Managers */}
          <button
            onClick={() => {
              setOhsErrorMsg('');
              setIsOhsModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>+ Sell to House (হাউসে বিক্রয়)</span>
          </button>

          {/* Option 4: Seeing Ledger to the House - Accounts Manager, Admin, HR only */}
          {hasManageAccess && (
            <button
              onClick={() => openLedgerForHouse('all')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-700 to-cyan-700 hover:from-teal-600 hover:to-cyan-600 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-teal-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>House Ledger & Statement (লেজার খতিয়ান)</span>
            </button>
          )}
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'all'
                ? 'border-sky-600 text-sky-600 dark:border-cyan-400 dark:text-cyan-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>All Procurement & Sourcing</span>
          </button>

          <button
            onClick={() => setActiveTab('other-house')}
            className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'other-house'
                ? 'border-amber-500 text-amber-600 dark:border-amber-400 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4 text-amber-500" />
            <span>Purchases from House (ক্রয় / ধার আনা)</span>
            {otherHouseMetrics.lend_count > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-500 text-navy-950 font-black">
                {otherHouseMetrics.lend_count}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('sales-to-houses')}
            className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'sales-to-houses'
                ? 'border-emerald-500 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <ArrowUpRight className="w-4 h-4 text-emerald-500" />
            <span>Selling to Houses (হাউসে বিক্রয় / লেন্ড)</span>
            {otherHouseSalesMetrics.lend_count > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-500 text-white font-black">
                {otherHouseSalesMetrics.lend_count}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('distributor')}
            className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'distributor'
                ? 'border-sky-600 text-sky-600 dark:border-cyan-400 dark:text-cyan-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Official Distributor POs</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-200 dark:bg-navy-800 text-slate-700 dark:text-slate-300 font-bold">
              {purchaseOrders.length}
            </span>
          </button>
        </div>

        <button
          onClick={() => {
            fetchDistributorPOs();
            fetchOtherHousePurchases();
            fetchOtherHouseSales();
            fetchPartnerHouses();
          }}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-navy-900 dark:hover:bg-navy-800 text-slate-600 dark:text-slate-300 transition-colors text-xs flex items-center gap-1.5"
          title="Refresh Data"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loadingDistributor || loadingOtherHouse || loadingOtherHouseSales || loadingPartnerHouses ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* SECTION 1: OTHER HOUSE PURCHASES & LEND SECTION          */}
      {/* ======================================================== */}
      {(activeTab === 'all' || activeTab === 'other-house') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Store className="w-5 h-5 text-amber-500" />
                <span>Other House Procurement & Serial Lend Tracking</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Units brought from other shops / partner houses with exact serial numbers. Easily track products brought on lend, generate shop ledgers, and record when paid.
              </p>
            </div>
            {activeTab === 'all' && (
              <button
                onClick={() => setActiveTab('other-house')}
                className="text-xs font-bold text-sky-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
              >
                <span>View Full Other House View</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Metric Cards for Other House */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
                <span>Total Other House Sourced</span>
                <Store className="w-4 h-4 text-sky-500" />
              </div>
              <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
                {otherHouseMetrics.total_count} Units
              </span>
              <span className="text-[10px] text-sky-600 dark:text-cyan-400 font-semibold">
                ৳{Number(otherHouseMetrics.total_value).toLocaleString()} Total hardware cost
              </span>
            </div>

            {/* CRITICAL: Active On Lend Metric */}
            <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 shadow-xs">
              <div className="flex items-center justify-between text-amber-700 dark:text-amber-400 text-xs font-semibold">
                <span>Currently On Lend (ধার / বাকি)</span>
                <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <span className="text-2xl font-black text-amber-700 dark:text-amber-400 mt-1 block">
                ৳{Number(otherHouseMetrics.total_lend_due).toLocaleString()}
              </span>
              <span className="text-[10px] text-amber-800 dark:text-amber-300 font-bold">
                {otherHouseMetrics.lend_count} items awaiting payment settlement
              </span>
            </div>

            {/* CRITICAL: Paid & Cleared Metric */}
            <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 shadow-xs">
              <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
                <span>Paid & Cleared (পরিশোধিত)</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1 block">
                ৳{Number(otherHouseMetrics.total_paid).toLocaleString()}
              </span>
              <span className="text-[10px] text-emerald-800 dark:text-emerald-300 font-bold">
                {otherHouseMetrics.paid_count} items with logged payment timestamps
              </span>
            </div>

            {/* Partner Houses Card - Clickable for Directory & Ledgers */}
            <div
              onClick={() => setIsHouseDirectoryOpen(true)}
              className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-xs cursor-pointer hover:border-purple-500/60 transition-all group"
            >
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
                <span>Partner Houses (সহযোগী দোকান)</span>
                <Building2 className="w-4 h-4 text-purple-500 group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1 block">
                {partnerHouses.length > 0 ? partnerHouses.length : knownHouses.length} Registered Houses
              </span>
              <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold group-hover:underline flex items-center gap-1">
                <span>Directory & statement ledgers</span>
                <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3.5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="text"
                value={ohSearch}
                onChange={(e) => setOhSearch(e.target.value)}
                placeholder="Search Product, Serial Number (SN), House Name, Phone..."
                className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 pl-10 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
              {/* Payment Filter */}
              <div className="flex items-center bg-slate-100 dark:bg-navy-950 rounded-xl p-1 border border-slate-200 dark:border-slate-800 text-xs font-semibold">
                <button
                  onClick={() => setOhPaymentFilter('all')}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    ohPaymentFilter === 'all'
                      ? 'bg-white dark:bg-navy-800 text-slate-900 dark:text-white shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  All ({otherHousePurchases.length})
                </button>
                <button
                  onClick={() => setOhPaymentFilter('lend')}
                  className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1 ${
                    ohPaymentFilter === 'lend'
                      ? 'bg-amber-500 text-navy-950 shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span>On Lend</span>
                  <span className="text-[10px] opacity-80">({otherHouseMetrics.lend_count})</span>
                </button>
                <button
                  onClick={() => setOhPaymentFilter('paid')}
                  className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1 ${
                    ohPaymentFilter === 'paid'
                      ? 'bg-emerald-600 text-white shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span>Paid</span>
                  <span className="text-[10px] opacity-80">({otherHouseMetrics.paid_count})</span>
                </button>
              </div>

              {/* Branch Filter */}
              <select
                value={ohBranchFilter}
                onChange={(e) => setOhBranchFilter(e.target.value)}
                className="bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="all">All Branches</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id.toString()}>
                    {b.name}
                  </option>
                ))}
              </select>

              {/* Quick Statement Trigger - Accounts Manager, Admin, HR only */}
              {hasManageAccess && (
                <button
                  onClick={() => openLedgerForHouse('all')}
                  className="px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 hover:bg-teal-100 text-teal-700 dark:text-teal-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
                  title="Open Statement & Print Ledger"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Ledger</span>
                </button>
              )}
            </div>
          </div>

          {/* Other House Table */}
          <div className="bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-navy-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Tracking #</th>
                    <th className="py-3.5 px-4">Source Other House</th>
                    <th className="py-3.5 px-4">Product Details</th>
                    <th className="py-3.5 px-4">Serial Number (SN)</th>
                    <th className="py-3.5 px-4">Cost / Price</th>
                    <th className="py-3.5 px-4">Payment & Lend Status</th>
                    <th className="py-3.5 px-4">Paid Timestamp (When Paid)</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {filteredOtherHouse.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                        No other house purchases found matching your filters. Click &quot;+ Other House Purchase&quot; to log a new purchase with serial number and lend tracking.
                      </td>
                    </tr>
                  ) : (
                    filteredOtherHouse.map((oh) => {
                      const isDue = oh.payment_status === 'lend' || oh.payment_status === 'partially_paid';
                      return (
                        <tr
                          key={oh.id}
                          className="hover:bg-slate-50/60 dark:hover:bg-navy-800/50 transition-colors"
                        >
                          {/* Tracking & Date */}
                          <td className="py-3.5 px-4">
                            <span className="font-mono font-bold text-slate-900 dark:text-white block">
                              {oh.tracking_number}
                            </span>
                            <span className="text-[10px] text-slate-400 block whitespace-nowrap">
                              {new Date(oh.created_at).toLocaleDateString()}
                            </span>
                            {oh.branch_name && (
                              <span className="text-[10px] text-sky-600 dark:text-cyan-400 font-semibold block">
                                {oh.branch_code || oh.branch_name}
                              </span>
                            )}
                          </td>

                          {/* Sourcing House Details */}
                          <td className="py-3.5 px-4">
                            {hasManageAccess ? (
                              <button
                                type="button"
                                onClick={() => openLedgerForHouse(oh.house_name)}
                                className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 hover:text-sky-600 dark:hover:text-cyan-400 text-left transition-colors group cursor-pointer"
                                title="Click to view full shop ledger statement"
                              >
                                <Store className="w-3.5 h-3.5 text-amber-500 shrink-0 group-hover:scale-110 transition-transform" />
                                <span className="underline decoration-dotted underline-offset-2">{oh.house_name}</span>
                              </button>
                            ) : (
                              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                <Store className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                <span>{oh.house_name}</span>
                              </div>
                            )}
                            {oh.house_contact && (
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                                Contact: {oh.house_contact} {oh.house_phone ? `(${oh.house_phone})` : ''}
                              </span>
                            )}
                            {oh.house_address && (
                              <span className="text-[10px] text-slate-400 truncate block max-w-xs" title={oh.house_address}>
                                {oh.house_address}
                              </span>
                            )}
                          </td>

                          {/* Product Details */}
                          <td className="py-3.5 px-4 max-w-xs">
                            <span className="font-bold text-slate-900 dark:text-white block line-clamp-2">
                              {oh.product_name}
                            </span>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                              {oh.product_brand && <span className="text-sky-600 dark:text-cyan-400 font-semibold">{oh.product_brand}</span>}
                              {oh.product_category && <span>• {oh.product_category}</span>}
                              {oh.quantity > 1 && <span className="font-bold text-amber-500">Qty: {oh.quantity}</span>}
                            </div>
                          </td>

                          {/* SERIAL NUMBER */}
                          <td className="py-3.5 px-4">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-cyan-300 font-mono text-[11px] font-bold">
                              <span>{oh.serial_number}</span>
                              <button
                                onClick={() => copyToClipboard(oh.serial_number)}
                                className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                                title="Copy Serial"
                              >
                                {copiedSerial === oh.serial_number ? (
                                  <Check className="w-3 h-3 text-emerald-500" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              {oh.warranty_period || '1 Year Official Warranty'}
                            </span>
                          </td>

                          {/* Cost & Price */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="font-black text-slate-900 dark:text-white">
                              ৳{Number(oh.total_cost).toLocaleString()}
                            </div>
                            {Number(oh.selling_price) > 0 && (
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-semibold">
                                Retail: ৳{Number(oh.selling_price).toLocaleString()}
                              </span>
                            )}
                          </td>

                          {/* LEND AND PAYMENT STATUS */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {oh.payment_status === 'paid' ? (
                              <div className="space-y-1">
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                  <span>Paid / Cleared</span>
                                </span>
                                <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">
                                  Paid ৳{Number(oh.paid_amount).toLocaleString()}
                                </span>
                              </div>
                            ) : oh.payment_status === 'partially_paid' ? (
                              <div className="space-y-1">
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-50 text-sky-700 dark:bg-cyan-950 dark:text-cyan-300 border border-sky-300 dark:border-cyan-800">
                                  <Clock className="w-3 h-3" />
                                  <span>Partially Paid</span>
                                </span>
                                <div className="text-[10px] block">
                                  <span className="text-emerald-600 font-semibold">Paid: ৳{Number(oh.paid_amount).toLocaleString()}</span>
                                  <span className="text-rose-600 font-bold block">Due: ৳{Number(oh.due_amount).toLocaleString()}</span>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                                  <AlertTriangle className="w-3 h-3 text-amber-500" />
                                  <span>On Lend (ধার / বাকি)</span>
                                </span>
                                <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 block">
                                  ৳{Number(oh.due_amount).toLocaleString()} Due
                                </span>
                              </div>
                            )}
                          </td>

                          {/* CRITICAL REQUIREMENT: "BUT SHOULD BE SHOWN WHEN ITS PAID" */}
                          <td className="py-3.5 px-4 max-w-xs">
                            {oh.paid_at ? (
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-1 text-slate-900 dark:text-emerald-400 font-semibold text-[11px]">
                                  <Calendar className="w-3 h-3 text-emerald-500 shrink-0" />
                                  <span>
                                    {new Date(oh.paid_at).toLocaleString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric',
                                      hour: 'numeric',
                                      minute: '2-digit',
                                      hour12: true,
                                    })}
                                  </span>
                                </div>
                                {oh.payment_method && (
                                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-mono">
                                    Via: <strong className="text-slate-700 dark:text-slate-300">{oh.payment_method}</strong>
                                    {oh.payment_reference ? ` (${oh.payment_reference})` : ''}
                                  </span>
                                )}
                                {oh.paid_by_name && (
                                  <span className="text-[10px] text-slate-400 block">
                                    By: {oh.paid_by_name}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold italic flex items-center gap-1">
                                <Clock className="w-3 h-3 text-amber-500 shrink-0" />
                                <span>Unsettled Lend</span>
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Settle Lend Button if due - Accounts Manager, Admin, HR only */}
                              {isDue && hasManageAccess && (
                                <button
                                  onClick={() => openSettleModal(oh)}
                                  className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-navy-950 text-[11px] font-bold flex items-center gap-1 shadow-xs transition-colors"
                                  title="Record Payment / Clear Lend"
                                >
                                  <CreditCard className="w-3 h-3" />
                                  <span>Settle Lend</span>
                                </button>
                              )}

                              {/* View Shop Statement / Ledger - Accounts Manager, Admin, HR only */}
                              {hasManageAccess && (
                                <button
                                  onClick={() => openLedgerForHouse(oh.house_name)}
                                  className="px-2 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/60 dark:hover:bg-teal-900 text-teal-700 dark:text-teal-300 text-[11px] font-bold flex items-center gap-1 transition-colors"
                                  title="View Shop Ledger Statement"
                                >
                                  <FileText className="w-3 h-3" />
                                  <span>Ledger</span>
                                </button>
                              )}

                              <button
                                onClick={() => setViewVoucherItem(oh)}
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-navy-950 dark:hover:bg-navy-800 text-slate-600 dark:text-slate-300 transition-colors"
                                title="View Voucher / Full Details"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 2: SELLING TO PARTNER HOUSES & LEND OUT SECTION  */}
      {/* ======================================================== */}
      {(activeTab === 'all' || activeTab === 'sales-to-houses') && (
        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5 text-emerald-500" />
                <span>Selling to Partner Houses (অন্য দোকানে বিক্রয় ও ধার প্রদান)</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Deliver or lend hardware units from branch stock to market partner shops with serial numbers, printable delivery challans, and receivable balance tracking.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {hasManageAccess && (
                <button
                  onClick={() => openLedgerForHouse('all')}
                  className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>Shop Ledger & Daily Activities (দৈনিক খতিয়ান)</span>
                </button>
              )}
              {activeTab === 'all' && (
                <button
                  onClick={() => setActiveTab('sales-to-houses')}
                  className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <span>View Full Sales View</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Metric Cards for Sales to Houses */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
                <span>Total Delivered to Houses</span>
                <ArrowUpRight className="w-4 h-4 text-emerald-500" />
              </div>
              <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
                {otherHouseSalesMetrics.total_count} Units
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                ৳{Number(otherHouseSalesMetrics.total_value).toLocaleString()} Total sales value
              </span>
            </div>

            {/* Lend Out Receivable Metric */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 shadow-xs">
              <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                <span>Lend Receivables (দোকান থেকে বাকি প্রাপ্য)</span>
                <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1 block">
                ৳{Number(otherHouseSalesMetrics.total_receivable_due).toLocaleString()}
              </span>
              <span className="text-[10px] text-emerald-800 dark:text-emerald-200 font-bold">
                {otherHouseSalesMetrics.lend_count} items on credit/lend to houses
              </span>
            </div>

            {/* Collected & Paid Metric */}
            <div className="p-4 rounded-2xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900/60 shadow-xs">
              <div className="flex items-center justify-between text-teal-700 dark:text-teal-400 text-xs font-semibold">
                <span>Collected & Settled (আদায়কৃত টাকা)</span>
                <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              </div>
              <span className="text-2xl font-black text-teal-700 dark:text-teal-400 mt-1 block">
                ৳{Number(otherHouseSalesMetrics.total_paid).toLocaleString()}
              </span>
              <span className="text-[10px] text-teal-800 dark:text-teal-300 font-bold">
                {otherHouseSalesMetrics.paid_count} sales fully settled & paid
              </span>
            </div>

            {/* Partner Houses Card - Directory & Ledgers */}
            <div
              onClick={() => setIsHouseDirectoryOpen(true)}
              className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-xs cursor-pointer hover:border-purple-500/60 transition-all group"
            >
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
                <span>Partner Houses (সহযোগী দোকান)</span>
                <Building2 className="w-4 h-4 text-purple-500 group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1 block">
                {partnerHouses.length > 0 ? partnerHouses.length : knownHouses.length} Partner Shops
              </span>
              <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold group-hover:underline flex items-center gap-1">
                <span>View statements & balances</span>
                <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3.5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="text"
                value={ohsSearch}
                onChange={(e) => setOhsSearch(e.target.value)}
                placeholder="Search Invoice #, Product, Serial (SN), House Name, Phone..."
                className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 pl-10 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
              {/* Payment Filter */}
              <div className="flex items-center bg-slate-100 dark:bg-navy-950 rounded-xl p-1 border border-slate-200 dark:border-slate-800 text-xs font-semibold">
                <button
                  onClick={() => setOhsPaymentFilter('all')}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    ohsPaymentFilter === 'all'
                      ? 'bg-white dark:bg-navy-800 text-slate-900 dark:text-white shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  All ({otherHouseSales.length})
                </button>
                <button
                  onClick={() => setOhsPaymentFilter('lend')}
                  className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1 ${
                    ohsPaymentFilter === 'lend'
                      ? 'bg-emerald-600 text-white shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span>On Lend</span>
                  <span className="text-[10px] opacity-80">({otherHouseSalesMetrics.lend_count})</span>
                </button>
                <button
                  onClick={() => setOhsPaymentFilter('paid')}
                  className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1 ${
                    ohsPaymentFilter === 'paid'
                      ? 'bg-teal-600 text-white shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span>Paid</span>
                  <span className="text-[10px] opacity-80">({otherHouseSalesMetrics.paid_count})</span>
                </button>
              </div>

              {/* Branch Filter */}
              <select
                value={ohsBranchFilter}
                onChange={(e) => setOhsBranchFilter(e.target.value)}
                className="bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="all">All Branches</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id.toString()}>
                    {b.name}
                  </option>
                ))}
              </select>

              {/* Quick Statement Trigger - Accounts Manager, Admin, HR only */}
              {hasManageAccess && (
                <button
                  onClick={() => openLedgerForHouse('all')}
                  className="px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 hover:bg-teal-100 text-teal-700 dark:text-teal-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
                  title="Open Statement & Print Ledger"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Ledger</span>
                </button>
              )}
            </div>
          </div>

          {/* Sales to Houses Table */}
          <div className="bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-navy-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Invoice #</th>
                    <th className="py-3.5 px-4">Buyer Partner House</th>
                    <th className="py-3.5 px-4">Product Details</th>
                    <th className="py-3.5 px-4">Serial Number (SN)</th>
                    <th className="py-3.5 px-4">Sale Price / Total</th>
                    <th className="py-3.5 px-4">Payment & Lend Status</th>
                    <th className="py-3.5 px-4">Settlement Info</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {filteredOtherHouseSales.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                        No sales to partner houses found. Click &quot;+ Sell to House (হাউসে বিক্রয়)&quot; to deliver hardware to partner shops on cash or lend.
                      </td>
                    </tr>
                  ) : (
                    filteredOtherHouseSales.map((sale) => {
                      const isDue = sale.payment_status === 'lend' || sale.payment_status === 'partially_paid';
                      return (
                        <tr
                          key={sale.id}
                          className="hover:bg-slate-50/60 dark:hover:bg-navy-800/50 transition-colors"
                        >
                          {/* Invoice & Date */}
                          <td className="py-3.5 px-4">
                            <span className="font-mono font-bold text-slate-900 dark:text-white block">
                              {sale.invoice_no}
                            </span>
                            <span className="text-[10px] text-slate-400 block whitespace-nowrap">
                              {new Date(sale.created_at).toLocaleDateString()}
                            </span>
                            {sale.branch_name && (
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block">
                                {sale.branch_code || sale.branch_name}
                              </span>
                            )}
                          </td>

                          {/* Buyer Partner House */}
                          <td className="py-3.5 px-4">
                            {hasManageAccess ? (
                              <button
                                type="button"
                                onClick={() => openLedgerForHouse(sale.house_name)}
                                className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 hover:text-emerald-600 dark:hover:text-emerald-400 text-left transition-colors group cursor-pointer"
                                title="Click to view full shop ledger statement"
                              >
                                <Building2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 group-hover:scale-110 transition-transform" />
                                <span className="underline decoration-dotted underline-offset-2">{sale.house_name}</span>
                              </button>
                            ) : (
                              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                <Building2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                <span>{sale.house_name}</span>
                              </div>
                            )}
                            {sale.house_contact && (
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                                Contact: {sale.house_contact} {sale.house_phone ? `(${sale.house_phone})` : ''}
                              </span>
                            )}
                            {sale.house_address && (
                              <span className="text-[10px] text-slate-400 truncate block max-w-xs" title={sale.house_address}>
                                {sale.house_address}
                              </span>
                            )}
                          </td>

                          {/* Product Details */}
                          <td className="py-3.5 px-4 max-w-xs">
                            <span className="font-bold text-slate-900 dark:text-white block line-clamp-2">
                              {sale.product_name}
                            </span>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                              {sale.product_brand && <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{sale.product_brand}</span>}
                              {sale.product_category && <span>• {sale.product_category}</span>}
                              {sale.quantity > 1 && <span className="font-bold text-emerald-500">Qty: {sale.quantity}</span>}
                            </div>
                          </td>

                          {/* SERIAL NUMBER */}
                          <td className="py-3.5 px-4">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-emerald-300 font-mono text-[11px] font-bold">
                              <span>{sale.serial_number}</span>
                              <button
                                onClick={() => copyToClipboard(sale.serial_number)}
                                className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                                title="Copy Serial"
                              >
                                {copiedSerial === sale.serial_number ? (
                                  <Check className="w-3 h-3 text-emerald-500" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              {sale.warranty_period || '1 Year Official Warranty'}
                            </span>
                          </td>

                          {/* Price & Amount */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="font-black text-slate-900 dark:text-white">
                              ৳{Number(sale.total_amount).toLocaleString()}
                            </div>
                            {Number(sale.quantity) > 1 && (
                              <span className="text-[10px] text-slate-400 block">
                                ৳{Number(sale.unit_price).toLocaleString()} / unit
                              </span>
                            )}
                          </td>

                          {/* Payment & Lend Status */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {sale.payment_status === 'paid' ? (
                              <div className="space-y-1">
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                  <span>Paid / Settled</span>
                                </span>
                                <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">
                                  Received ৳{Number(sale.paid_amount).toLocaleString()}
                                </span>
                              </div>
                            ) : sale.payment_status === 'partially_paid' ? (
                              <div className="space-y-1">
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-50 text-sky-700 dark:bg-cyan-950 dark:text-cyan-300 border border-sky-300 dark:border-cyan-800">
                                  <Clock className="w-3 h-3" />
                                  <span>Partially Paid</span>
                                </span>
                                <div className="text-[10px] block">
                                  <span className="text-emerald-600 font-semibold">Paid: ৳{Number(sale.paid_amount).toLocaleString()}</span>
                                  <span className="text-rose-600 font-bold block">Due: ৳{Number(sale.due_amount).toLocaleString()}</span>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                                  <Clock className="w-3 h-3 text-amber-500" />
                                  <span>On Lend (ধার / বাকি)</span>
                                </span>
                                <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 block">
                                  ৳{Number(sale.due_amount).toLocaleString()} Due
                                </span>
                              </div>
                            )}
                          </td>

                          {/* Settlement / Timestamp */}
                          <td className="py-3.5 px-4 max-w-xs">
                            {sale.paid_at ? (
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-1 text-slate-900 dark:text-emerald-400 font-semibold text-[11px]">
                                  <Calendar className="w-3 h-3 text-emerald-500 shrink-0" />
                                  <span>
                                    {new Date(sale.paid_at).toLocaleString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric',
                                      hour: 'numeric',
                                      minute: '2-digit',
                                      hour12: true,
                                    })}
                                  </span>
                                </div>
                                {sale.payment_method && (
                                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-mono">
                                    Via: <strong className="text-slate-700 dark:text-slate-300">{sale.payment_method}</strong>
                                    {sale.payment_reference ? ` (${sale.payment_reference})` : ''}
                                  </span>
                                )}
                                {sale.received_by_name && (
                                  <span className="text-[10px] text-slate-400 block">
                                    By: {sale.received_by_name}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold italic flex items-center gap-1">
                                <Clock className="w-3 h-3 text-amber-500 shrink-0" />
                                <span>Unsettled Lend</span>
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Settle / Collect Payment if due - Accounts/Admin/HR only */}
                              {isDue && hasManageAccess && (
                                <button
                                  onClick={() => openSettleSaleModal(sale)}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1 shadow-xs transition-colors"
                                  title="Collect Payment / Settle Lend"
                                >
                                  <CreditCard className="w-3 h-3" />
                                  <span>Collect Lend</span>
                                </button>
                              )}

                              {/* View Partner House Statement / Ledger - Accounts Manager, Admin, HR only */}
                              {hasManageAccess && (
                                <button
                                  onClick={() => openLedgerForHouse(sale.house_name)}
                                  className="px-2 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/60 dark:hover:bg-teal-900 text-teal-700 dark:text-teal-300 text-[11px] font-bold flex items-center gap-1 transition-colors"
                                  title={`View Two-Way Ledger for ${sale.house_name}`}
                                >
                                  <FileText className="w-3 h-3" />
                                  <span>Ledger</span>
                                </button>
                              )}

                              {/* Print Delivery Challan / Invoice */}
                              <button
                                onClick={() => setViewSaleChallanItem(sale)}
                                className="px-2 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/60 dark:hover:bg-sky-900 text-sky-700 dark:text-cyan-300 text-[11px] font-bold flex items-center gap-1 transition-colors"
                                title="Print Official B2B Delivery Challan"
                              >
                                <Printer className="w-3 h-3" />
                                <span>Challan</span>
                              </button>

                              {/* View Details */}
                              <button
                                onClick={() => setViewSaleChallanItem(sale)}
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-navy-950 dark:hover:bg-navy-800 text-slate-600 dark:text-slate-300 transition-colors"
                                title="View Voucher / Full Details"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete - Accounts/Admin/HR only */}
                              {hasManageAccess && (
                                <button
                                  onClick={() => handleDeleteOtherHouseSale(sale.id, sale.invoice_no)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                                  title="Delete Record"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 3: OFFICIAL DISTRIBUTOR PURCHASE ORDERS          */}
      {/* ======================================================== */}
      {(activeTab === 'all' || activeTab === 'distributor') && (
        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-sky-600 dark:text-cyan-400" />
                <span>Authorized Distributor Purchase Orders</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official bulk hardware shipments from global distributor partners (Smart Technologies, Global Brand, UCC, etc.)
              </p>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">Total Distributor POs</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
                {purchaseOrders.length}
              </span>
              <span className="text-[10px] text-sky-600 dark:text-cyan-400 font-semibold">Distributor supply pipeline</span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">Distributor Invoiced</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
                ৳{totalDistributorSpent.toLocaleString()}
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Total PO invoiced</span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">Vendor Payables Due</span>
              <span className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1 block">
                ৳{totalDistributorDue.toLocaleString()}
              </span>
              <span className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold">Outstanding distributor credit</span>
            </div>
          </div>

          {/* PO Search */}
          <div className="bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3.5 shadow-xs flex items-center justify-between gap-3">
            <div className="relative max-w-sm w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="text"
                value={poSearch}
                onChange={(e) => setPoSearch(e.target.value)}
                placeholder="Search PO #, Distributor Supplier, Branch..."
                className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 pl-10 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* PO Table */}
          <div className="bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-navy-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">PO Number</th>
                    <th className="py-3.5 px-4">Supplier Partner</th>
                    <th className="py-3.5 px-4">Receiving Location</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Total Cost</th>
                    <th className="py-3.5 px-4">Paid / Due</th>
                    <th className="py-3.5 px-4">Created Date</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {filteredPOs.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                        No distributor purchase orders recorded yet.
                      </td>
                    </tr>
                  ) : (
                    filteredPOs.map((po) => {
                      const due = Number(po.total_amount) - Number(po.paid_amount || 0);
                      return (
                        <tr key={po.id} className="hover:bg-slate-50/50 dark:hover:bg-navy-800/50 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                            {po.po_number}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-slate-900 dark:text-white block">{po.supplier_name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{po.supplier_code}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{po.branch_name}</span>
                            <span className="text-[10px] text-sky-600 dark:text-cyan-400 block font-mono">{po.branch_code}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                po.status === 'received'
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                  : po.status === 'ordered'
                                  ? 'bg-sky-50 text-sky-700 dark:bg-cyan-950 dark:text-cyan-300 border border-sky-200 dark:border-cyan-800'
                                  : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                              }`}
                            >
                              {po.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-black text-slate-900 dark:text-white">
                            ৳{Number(po.total_amount).toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold block">
                              Paid: ৳{Number(po.paid_amount || 0).toLocaleString()}
                            </span>
                            {due > 0 && (
                              <span className="text-rose-600 dark:text-rose-400 text-[10px] font-bold block">
                                Due: ৳{due.toLocaleString()}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                            {new Date(po.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {po.status !== 'received' && (
                              <button
                                onClick={() => handlePoStatusUpdate(po.id, 'received')}
                                className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-[11px] font-bold transition-colors"
                              >
                                Mark Received
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: NEW OTHER HOUSE PURCHASE (WITH LEND & SERIAL)   */}
      {/* ======================================================== */}
      {isOhModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-navy-900 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full shadow-2xl relative flex flex-col max-h-[92vh] sm:max-h-[88vh] my-auto overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 sm:px-6 sm:py-4 border-b border-slate-200 dark:border-slate-800 shrink-0 bg-white dark:bg-navy-900">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Store className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                    Procure from Other House (অন্য হাউস থেকে ক্রয়)
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Source hardware units from market partner shops on lend or paid with exact serial numbers.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOhModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleCreateOtherHousePurchase} className="flex flex-col flex-1 overflow-hidden">
              <div className="overflow-y-auto p-4 sm:p-5 space-y-3.5 flex-1 text-xs">
                {ohErrorMsg && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{ohErrorMsg}</span>
                  </div>
                )}
              {/* Sourcing House Information */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Store className="w-4 h-4 text-amber-500" />
                    <span>Other House / Partner Vendor Details</span>
                  </span>
                  <span className="text-[10px] text-slate-400">Select or type custom shop name</span>
                </div>

                {/* Registered Partner House Dropdown Selector */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      Select Registered Partner House (বা নিচে নাম লিখুন)
                    </label>
                    {hasManageAccess && (
                      <button
                        type="button"
                        onClick={() => {
                          setNewHouseError('');
                          setNewHouseSuccess('');
                          setIsAddHouseModalOpen(true);
                        }}
                        className="text-[10px] font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <UserPlus className="w-3 h-3" />
                        <span>+ Add New House</span>
                      </button>
                    )}
                  </div>
                  <select
                    value={partnerHouses.some(ph => ph.name === houseName) ? houseName : ''}
                    onChange={(e) => {
                      const selectedName = e.target.value;
                      if (!selectedName) return;
                      setHouseName(selectedName);
                      const match = partnerHouses.find((ph) => ph.name === selectedName);
                      if (match) {
                        if (match.contact_person) setHouseContact(match.contact_person);
                        if (match.phone) setHousePhone(match.phone);
                        if (match.address) setHouseAddress(match.address);
                      }
                    }}
                    className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="">-- Choose from Registered Houses / দোকানের তালিকা ({partnerHouses.length}) --</option>
                    {partnerHouses.map((ph) => {
                      const due = Number(ph.current_due || ph.total_lend_due || 0);
                      return (
                        <option key={ph.id} value={ph.name}>
                          {ph.name} {ph.phone ? `(${ph.phone})` : ''} {due > 0 ? `• Due: ৳${due.toLocaleString()}` : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      House / Shop Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={houseName}
                      onChange={(e) => setHouseName(e.target.value)}
                      placeholder="e.g. Star Tech Multiplan / Ryans IDB"
                      className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Contact Person & Phone
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={houseContact}
                        onChange={(e) => setHouseContact(e.target.value)}
                        placeholder="Contact person"
                        className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                      />
                      <input
                        type="text"
                        value={housePhone}
                        onChange={(e) => setHousePhone(e.target.value)}
                        placeholder="Phone (017...)"
                        className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Shop / Market Location (Address)
                    </label>
                    <input
                      type="text"
                      value={houseAddress}
                      onChange={(e) => setHouseAddress(e.target.value)}
                      placeholder="e.g. Multiplan Center Level 4, Elephant Road"
                      className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Receiving Branch *
                    </label>
                    {isStoreManager ? (
                      <select
                        value={branchId}
                        disabled
                        className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-500 dark:text-slate-400 font-semibold cursor-not-allowed text-xs"
                      >
                        {branches.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name} ({b.code}) - Your Assigned Store
                          </option>
                        ))}
                      </select>
                    ) : (
                      <select
                        value={branchId}
                        onChange={(e) => setBranchId(Number(e.target.value))}
                        className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                      >
                        {branches.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name} ({b.code})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              </div>

              {/* Product Details & Serial Number */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 space-y-3">
                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-sky-500" />
                  <span>Product Details & Serial Number</span>
                </span>

                {/* Optional catalog product selector */}
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Link to Catalog Product (Optional Autofill)
                  </label>
                  <select
                    value={selectedProductId || ''}
                    onChange={(e) => handleCatalogProductSelect(e.target.value)}
                    className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="">-- Manual Custom Product Entry --</option>
                    {catalogProducts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.sku}) - ৳{p.purchase_cost}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      placeholder="e.g. MSI GeForce RTX 4070 Ti SUPER 16G Ventus"
                      className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Brand / Category
                    </label>
                    <input
                      type="text"
                      value={productBrand}
                      onChange={(e) => setProductBrand(e.target.value)}
                      placeholder="e.g. MSI / GPU"
                      className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* CRITICAL: SERIAL NUMBER INPUT */}
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
                  <label className="block font-bold text-amber-900 dark:text-amber-300 mb-1 flex items-center justify-between">
                    <span>Hardware Serial Number (S/N) *</span>
                    <span className="text-[10px] font-normal text-amber-700 dark:text-amber-400">
                      Crucial for warranty & house tracking
                    </span>
                  </label>
                  <input
                    type="text"
                    required
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    placeholder="e.g. SN-MSI-4070-881923 (or comma separated if multiple)"
                    className="w-full bg-white dark:bg-navy-900 border border-amber-400 dark:border-amber-600 rounded-xl px-3 py-2 text-slate-900 dark:text-cyan-300 font-mono text-xs font-bold focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Quantity
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Unit Purchase Cost (৳) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={unitCost}
                      onChange={(e) => setUnitCost(e.target.value)}
                      placeholder="105000"
                      className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Expected Selling (৳)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={sellingPrice}
                      onChange={(e) => setSellingPrice(e.target.value)}
                      placeholder="115000"
                      className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Warranty Period
                    </label>
                    <input
                      type="text"
                      value={warrantyPeriod}
                      onChange={(e) => setWarrantyPeriod(e.target.value)}
                      placeholder="e.g. 3 Years"
                      className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="addToInventoryCheckbox"
                    checked={addToInventory}
                    onChange={(e) => setAddToInventory(e.target.checked)}
                    className="rounded text-amber-500 focus:ring-amber-500"
                  />
                  <label htmlFor="addToInventoryCheckbox" className="text-slate-700 dark:text-slate-300 text-xs">
                    Auto-increment stock count for receiving branch inventory
                  </label>
                </div>
              </div>

              {/* CRITICAL: LEND VS DIRECT PAYMENT SELECTION */}
              <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5 text-xs">
                    <CreditCard className="w-4 h-4 text-amber-500" />
                    <span>Lend & Payment Settlement Terms</span>
                  </span>
                  <span className="text-[10px] text-amber-800 dark:text-amber-400 font-semibold">
                    Total Sourcing Cost: ৳{(Number(unitCost || 0) * (quantity || 1)).toLocaleString()}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    onClick={() => setIsLend(true)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                      isLend
                        ? 'bg-amber-100 dark:bg-amber-900/40 border-amber-500 text-amber-950 dark:text-amber-200 ring-2 ring-amber-500/20'
                        : 'bg-white dark:bg-navy-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="lendOption"
                      checked={isLend}
                      onChange={() => setIsLend(true)}
                      className="mt-0.5 text-amber-500"
                    />
                    <div>
                      <span className="font-bold block text-xs">Brought in Lend (ধার / বাকিতে আনা)</span>
                      <p className="text-[10px] mt-0.5 opacity-80">
                        Item is sourced without immediate payment. Settle whenever paid; exact payment time, method, and transaction ID will be shown.
                      </p>
                    </div>
                  </label>

                  <label
                    onClick={() => setIsLend(false)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                      !isLend
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-950 dark:text-emerald-200 ring-2 ring-emerald-500/20'
                        : 'bg-white dark:bg-navy-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="lendOption"
                      checked={!isLend}
                      onChange={() => setIsLend(false)}
                      className="mt-0.5 text-emerald-500"
                    />
                    <div>
                      <span className="font-bold block text-xs">Paid Immediately (নগদ পরিশোধিত)</span>
                      <p className="text-[10px] mt-0.5 opacity-80">
                        Paid on the spot to other house. Immediate paid timestamp and method recorded.
                      </p>
                    </div>
                  </label>
                </div>

                {/* If Paid Immediately */}
                {!isLend && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-amber-200/50 dark:border-amber-900/40">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Payment Method *
                      </label>
                      <select
                        value={ohPaymentMethod}
                        onChange={(e) => setOhPaymentMethod(e.target.value)}
                        className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                      >
                        <option value="Cash">Cash (নগদ)</option>
                        <option value="bKash Merchant">bKash Merchant</option>
                        <option value="Nagad">Nagad</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Cheque">Cheque</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Trx ID / Voucher Ref
                      </label>
                      <input
                        type="text"
                        value={ohPaymentReference}
                        onChange={(e) => setOhPaymentReference(e.target.value)}
                        placeholder="TRX-102948"
                        className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Settled By
                      </label>
                      <input
                        type="text"
                        value={ohPaidByName}
                        onChange={(e) => setOhPaidByName(e.target.value)}
                        placeholder="Admin / Staff Name"
                        className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* If Lend with optional partial deposit */}
                {isLend && (
                  <div className="pt-1">
                    <label className="block font-semibold text-amber-900 dark:text-amber-300 mb-1">
                      Optional Advance Paid Deposit (৳) (Leave 0 if 100% on lend)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={ohPaidAmount}
                      onChange={(e) => setOhPaidAmount(e.target.value)}
                      placeholder="0"
                      className="w-full sm:w-1/2 bg-white dark:bg-navy-900 border border-amber-300 dark:border-amber-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Procurement Notes / Customer Order Link
                </label>
                <textarea
                  rows={2}
                  value={ohGeneralNotes}
                  onChange={(e) => setOhGeneralNotes(e.target.value)}
                  placeholder="e.g. Sourced for customer Walk-in request at Shop 1 Uttara. Settle in 3 days."
                  className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Sticky Footer */}
            <div className="px-5 py-3 sm:px-6 sm:py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-navy-950 shrink-0 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsOhModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 font-bold text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingOh}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-navy-950 font-bold shadow-md shadow-amber-500/20 disabled:opacity-50 flex items-center gap-1.5 text-xs"
                  >
                    {submittingOh ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Recording...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Confirm Other House Purchase</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      {/* ======================================================== */}
      {/* MODAL 2: SETTLE LEND PAYMENT ("MARK AS PAID")             */}
      {/* ======================================================== */}
      {settleModalItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-navy-900 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 max-w-xl w-full shadow-2xl relative flex flex-col max-h-[92vh] sm:max-h-[88vh] my-auto overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 sm:px-6 sm:py-4 border-b border-slate-200 dark:border-slate-800 shrink-0 bg-white dark:bg-navy-900">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                    Settle Other House Lend (হাওলাত / বাকি পরিশোধ)
                  </h3>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {settleModalItem.tracking_number}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSettleModalItem(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSettleLend} className="flex flex-col flex-1 overflow-hidden">
              <div className="overflow-y-auto p-4 sm:p-5 space-y-3.5 flex-1 text-xs">
                {settleError && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300">
                    {settleError}
                  </div>
                )}

                {/* Settle Info Card - Compact 3-Column Layout */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Source Partner House</span>
                      <span className="font-bold text-slate-900 dark:text-white text-xs">{settleModalItem.house_name}</span>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{settleModalItem.product_name}</p>
                    </div>
                    <span className="font-mono font-bold text-[11px] text-sky-600 dark:text-cyan-400 bg-sky-500/10 px-2 py-0.5 rounded-md border border-sky-500/20 shrink-0">
                      S/N: {settleModalItem.serial_number}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center pt-0.5">
                    <div className="p-2 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 font-medium block">Total Cost</span>
                      <span className="font-bold text-slate-900 dark:text-white text-xs">৳{Number(settleModalItem.total_cost).toLocaleString()}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 font-medium block">Already Paid</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs">৳{Number(settleModalItem.paid_amount || 0).toLocaleString()}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900">
                      <span className="text-[10px] text-rose-500 dark:text-rose-400 font-bold block">Current Due</span>
                      <span className="font-bold text-rose-600 dark:text-rose-400 text-xs">৳{Number(settleModalItem.due_amount).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Amount to Settle & Quick Preset Chips */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold text-slate-700 dark:text-slate-300">
                      Payment Amount to Settle (৳) *
                    </label>
                    <span className="text-[10px] text-slate-400">Can be paid in full or partial installments</span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={settleAmount}
                    onChange={(e) => setSettleAmount(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-bold text-sm focus:outline-none focus:border-emerald-500"
                  />

                  {/* Preset Chips */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    <button
                      type="button"
                      onClick={() => setSettleAmount(settleModalItem.due_amount.toString())}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold text-[10px] border border-emerald-500/20 transition-colors"
                    >
                      Full Due: ৳{Number(settleModalItem.due_amount).toLocaleString()}
                    </button>
                    {Number(settleModalItem.due_amount) > 1000 && (
                      <button
                        type="button"
                        onClick={() => setSettleAmount(Math.round(Number(settleModalItem.due_amount) / 2).toString())}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-[10px] border border-slate-200 dark:border-slate-700 transition-colors"
                      >
                        50% (৳{Math.round(Number(settleModalItem.due_amount) / 2).toLocaleString()})
                      </button>
                    )}
                    {Number(settleModalItem.due_amount) >= 5000 && (
                      <button
                        type="button"
                        onClick={() => setSettleAmount('5000')}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-[10px] border border-slate-200 dark:border-slate-700 transition-colors"
                      >
                        ৳5,000
                      </button>
                    )}
                    {Number(settleModalItem.due_amount) >= 1000 && (
                      <button
                        type="button"
                        onClick={() => setSettleAmount('1000')}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-[10px] border border-slate-200 dark:border-slate-700 transition-colors"
                      >
                        ৳1,000
                      </button>
                    )}
                  </div>
                </div>

                {/* Dynamic Live Balance Preview */}
                {(() => {
                  const paying = parseFloat(settleAmount) || 0;
                  const currentDue = Number(settleModalItem.due_amount);
                  const remainingAfter = Math.max(0, currentDue - paying);
                  const isPartial = paying > 0 && paying < currentDue;
                  const isOverpaid = paying > currentDue;

                  return (
                    <div className={`p-2.5 rounded-xl border flex items-center justify-between text-[11px] ${
                      isPartial
                        ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800'
                        : isOverpaid
                        ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800'
                        : 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                    }`}>
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          isPartial ? 'bg-amber-500 text-navy-950' : 'bg-emerald-600 text-white'
                        }`}>
                          {isPartial ? 'Partial Installment' : 'Full Settlement'}
                        </span>
                        <span className="text-slate-600 dark:text-slate-400">Remaining Balance:</span>
                      </div>
                      <span className={`font-bold ${isPartial ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        ৳{remainingAfter.toLocaleString()}
                      </span>
                    </div>
                  );
                })()}

                {/* Payment Method & Trx Ref */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Payment Method *
                    </label>
                    <select
                      value={settleMethod}
                      onChange={(e) => setSettleMethod(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-900 dark:text-white focus:outline-none"
                    >
                      <option value="Cash">Cash (নগদ)</option>
                      <option value="bKash Merchant">bKash Merchant</option>
                      <option value="Nagad">Nagad</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Cheque">Cheque</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Trx / Voucher Ref #
                    </label>
                    <input
                      type="text"
                      value={settleRef}
                      onChange={(e) => setSettleRef(e.target.value)}
                      placeholder="TRX-BK788910"
                      className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Date & Settled By */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Payment Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={settleDate}
                      onChange={(e) => setSettleDate(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Settled By (Staff / Manager) *
                    </label>
                    <input
                      type="text"
                      required
                      value={settleBy}
                      onChange={(e) => setSettleBy(e.target.value)}
                      placeholder="Manager / Cashier Name"
                      className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Settlement Notes / Remarks
                  </label>
                  <input
                    type="text"
                    value={settleNotes}
                    onChange={(e) => setSettleNotes(e.target.value)}
                    placeholder="e.g. 1st installment ৳5,000 paid / rest next week"
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Sticky Footer */}
              <div className="px-5 py-3 sm:px-6 sm:py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-navy-950 shrink-0 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setSettleModalItem(null)}
                  className="px-3.5 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 font-bold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingSettle}
                  className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl font-bold shadow-md disabled:opacity-50 flex items-center gap-1.5 text-white text-xs ${
                    (parseFloat(settleAmount) || 0) < Number(settleModalItem.due_amount)
                      ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/20'
                      : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
                  }`}
                >
                  {submittingSettle ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Recording...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>
                        {(parseFloat(settleAmount) || 0) < Number(settleModalItem.due_amount)
                          ? `Record Partial Payment (৳${(parseFloat(settleAmount) || 0).toLocaleString()})`
                          : `Full Settlement & Clear Lend (৳${(parseFloat(settleAmount) || 0).toLocaleString()})`}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: VIEW VOUCHER & COMPLETE AUDIT DETAILS           */}
      {/* ======================================================== */}
      {viewVoucherItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-navy-900 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full shadow-2xl relative flex flex-col max-h-[92vh] sm:max-h-[88vh] my-auto overflow-hidden text-xs">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 sm:px-6 sm:py-4 border-b border-slate-200 dark:border-slate-800 shrink-0 bg-white dark:bg-navy-900">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-600 dark:text-cyan-400 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                    Other House Procurement Voucher
                  </h3>
                  <span className="font-mono text-sky-600 dark:text-cyan-400 font-bold text-[11px]">
                    {viewVoucherItem.tracking_number}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setViewVoucherItem(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Voucher Body - Scrollable */}
            <div className="overflow-y-auto p-4 sm:p-5 space-y-3.5 flex-1">
              {/* Other House details */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Source Partner House</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm block">{viewVoucherItem.house_name}</span>
                {viewVoucherItem.house_contact && (
                  <span className="text-slate-500 dark:text-slate-400 block">
                    Contact: {viewVoucherItem.house_contact} ({viewVoucherItem.house_phone || 'N/A'})
                  </span>
                )}
                {viewVoucherItem.house_address && (
                  <span className="text-slate-400 block text-[11px]">{viewVoucherItem.house_address}</span>
                )}
              </div>

              {/* Product & Serial Number */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Hardware Details</span>
                <div className="font-bold text-slate-900 dark:text-white">{viewVoucherItem.product_name}</div>
                <div className="flex justify-between items-center py-1 border-t border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500">Hardware Serial (S/N):</span>
                  <span className="font-mono font-bold text-cyan-500 bg-navy-900 px-2 py-0.5 rounded-md border border-slate-700">
                    {viewVoucherItem.serial_number}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Warranty:</span>
                  <span className="font-medium text-slate-900 dark:text-white">{viewVoucherItem.warranty_period || '1 Year Official'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Total Purchase Cost:</span>
                  <span className="font-black text-slate-900 dark:text-white">৳{Number(viewVoucherItem.total_cost).toLocaleString()}</span>
                </div>
              </div>

              {/* PAYMENT & LEND AUDIT BOX */}
              <div
                className={`p-3.5 rounded-2xl border ${
                  viewVoucherItem.payment_status === 'paid'
                    ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800'
                    : 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Lend & Payment Audit
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      viewVoucherItem.payment_status === 'paid'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-amber-500 text-navy-950'
                    }`}
                  >
                    {viewVoucherItem.payment_status === 'paid' ? 'PAID / CLEARED' : 'ON LEND (DUE)'}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Paid Amount:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      ৳{Number(viewVoucherItem.paid_amount).toLocaleString()}
                    </span>
                  </div>

                  {Number(viewVoucherItem.due_amount) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Outstanding Due:</span>
                      <span className="font-bold text-rose-600 dark:text-rose-400">
                        ৳{Number(viewVoucherItem.due_amount).toLocaleString()}
                      </span>
                    </div>
                  )}

                  {viewVoucherItem.paid_at && (
                    <div className="flex justify-between border-t border-slate-200 dark:border-slate-800/80 pt-1.5">
                      <span className="text-slate-500 dark:text-slate-400">Paid Date & Time:</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {new Date(viewVoucherItem.paid_at).toLocaleString('en-US', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </span>
                    </div>
                  )}

                  {viewVoucherItem.payment_method && (
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Payment Channel:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {viewVoucherItem.payment_method}
                        {viewVoucherItem.payment_reference ? ` (${viewVoucherItem.payment_reference})` : ''}
                      </span>
                    </div>
                  )}

                  {viewVoucherItem.paid_by_name && (
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Settled By Staff:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{viewVoucherItem.paid_by_name}</span>
                    </div>
                  )}

                  {viewVoucherItem.payment_notes && (
                    <div className="mt-2 p-2 rounded-xl bg-white/60 dark:bg-navy-900/60 text-[10px] text-slate-600 dark:text-slate-300 font-mono whitespace-pre-line border border-slate-200 dark:border-slate-800">
                      {viewVoucherItem.payment_notes}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 sm:px-6 sm:py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-navy-950 shrink-0 flex items-center justify-end gap-2.5">
              <button
                onClick={() => window.print()}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-navy-800 dark:hover:bg-navy-700 text-slate-800 dark:text-slate-200 font-bold flex items-center gap-1.5 transition-colors text-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Voucher</span>
              </button>
              <button
                onClick={() => setViewVoucherItem(null)}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold transition-colors text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3.1: SELL TO PARTNER HOUSE (LEND OUT / DIRECT SALE)*/}
      {/* ======================================================== */}
      {isOhsModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-navy-900 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full shadow-2xl relative flex flex-col max-h-[92vh] sm:max-h-[88vh] my-auto overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 sm:px-6 sm:py-4 border-b border-slate-200 dark:border-slate-800 shrink-0 bg-white dark:bg-navy-900">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                    Sell to Partner House (অন্য হাউসে বিক্রয় / লেন্ড)
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Deliver inventory items with exact serial numbers to partner shops on cash or lend.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOhsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleCreateOtherHouseSale} className="flex flex-col flex-1 overflow-hidden">
              <div className="overflow-y-auto p-4 sm:p-5 space-y-3.5 flex-1 text-xs">
                {ohsErrorMsg && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{ohsErrorMsg}</span>
                  </div>
                )}

                {/* Buyer Partner House Information */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-emerald-500" />
                      <span>Buyer Partner House Details (ক্রেতা দোকান)</span>
                    </span>
                    <span className="text-[10px] text-slate-400">Select or write custom partner shop</span>
                  </div>

                  {/* Registered Partner House Dropdown */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                        Select Registered Partner House (বা নিচে নাম লিখুন)
                      </label>
                      {hasManageAccess && (
                        <button
                          type="button"
                          onClick={() => {
                            setNewHouseError('');
                            setNewHouseSuccess('');
                            setIsAddHouseModalOpen(true);
                          }}
                          className="text-[10px] font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <UserPlus className="w-3 h-3" />
                          <span>+ Add New House</span>
                        </button>
                      )}
                    </div>
                    <select
                      value={partnerHouses.some((ph) => ph.name === ohsHouseName) ? ohsHouseName : ''}
                      onChange={(e) => {
                        const selectedName = e.target.value;
                        if (!selectedName) return;
                        setOhsHouseName(selectedName);
                        const match = partnerHouses.find((ph) => ph.name === selectedName);
                        if (match) {
                          if (match.contact_person) setOhsHouseContact(match.contact_person);
                          if (match.phone) setOhsHousePhone(match.phone);
                          if (match.address) setOhsHouseAddress(match.address);
                        }
                      }}
                      className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="">-- Choose from Registered Houses / দোকানের তালিকা ({partnerHouses.length}) --</option>
                      {partnerHouses.map((ph) => (
                        <option key={ph.id} value={ph.name}>
                          {ph.name} {ph.phone ? `(${ph.phone})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Partner House Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={ohsHouseName}
                        onChange={(e) => setOhsHouseName(e.target.value)}
                        placeholder="e.g. Computer Source / Star Tech"
                        className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Contact Person & Phone
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={ohsHouseContact}
                          onChange={(e) => setOhsHouseContact(e.target.value)}
                          placeholder="Contact person"
                          className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                        />
                        <input
                          type="text"
                          value={ohsHousePhone}
                          onChange={(e) => setOhsHousePhone(e.target.value)}
                          placeholder="Phone (017...)"
                          className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Shop Location / Address
                      </label>
                      <input
                        type="text"
                        value={ohsHouseAddress}
                        onChange={(e) => setOhsHouseAddress(e.target.value)}
                        placeholder="e.g. ECS Computer City, Multiplan Center"
                        className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Delivering Branch (স্টোর শাখা) *
                      </label>
                      {isStoreManager ? (
                        <select
                          value={ohsBranchId}
                          disabled
                          className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-500 dark:text-slate-400 font-semibold cursor-not-allowed text-xs"
                        >
                          {branches.map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.name} ({b.code}) - Your Assigned Store
                            </option>
                          ))}
                        </select>
                      ) : (
                        <select
                          value={ohsBranchId}
                          onChange={(e) => {
                            const newBranchId = Number(e.target.value);
                            setOhsBranchId(newBranchId);
                            if (ohsSelectedProductId) {
                              fetchAvailableSerialsForProduct(ohsSelectedProductId, newBranchId);
                            }
                          }}
                          className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                        >
                          {branches.map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.name} ({b.code})
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                </div>

                {/* Product & Available Serial Selection */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 space-y-3">
                  <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-emerald-500" />
                    <span>Product & Serial Number from Inventory</span>
                  </span>

                  {/* Catalog Selector */}
                  <div>
                    <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Choose Product from Catalog (Autofill stock & serials)
                    </label>
                    <select
                      value={ohsSelectedProductId || ''}
                      onChange={(e) => handleSelectProductForSale(e.target.value)}
                      className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                    >
                      <option value="">-- Choose Catalog Product / বা নিচে লিখুন --</option>
                      {catalogProducts.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.sku}) - Retail: ৳{p.selling_price || 0}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Product Description *
                      </label>
                      <input
                        type="text"
                        required
                        value={ohsProductName}
                        onChange={(e) => setOhsProductName(e.target.value)}
                        placeholder="e.g. ASUS ROG Strix GeForce RTX 4080 OC 16GB"
                        className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Brand / Model
                      </label>
                      <input
                        type="text"
                        value={ohsProductBrand}
                        onChange={(e) => setOhsProductBrand(e.target.value)}
                        placeholder="e.g. ASUS / ROG"
                        className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* SERIAL NUMBER PICKER */}
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1">
                        <span>Hardware Serial Number (S/N) *</span>
                        {availableSerialsList.length > 0 && (
                          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-600 text-white font-bold">
                            {availableSerialsList.length} in Branch Stock
                          </span>
                        )}
                      </label>
                      {loadingAvailableSerials && (
                        <span className="text-[10px] text-emerald-600 flex items-center gap-1">
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          <span>Checking stock serials...</span>
                        </span>
                      )}
                    </div>

                    {availableSerialsList.length > 0 ? (
                      <div className="space-y-1.5">
                        <select
                          value={ohsSerialNumber}
                          onChange={(e) => setOhsSerialNumber(e.target.value)}
                          className="w-full bg-white dark:bg-navy-900 border border-emerald-400 dark:border-emerald-600 rounded-xl px-3 py-2 text-slate-900 dark:text-emerald-300 font-mono text-xs font-bold focus:outline-none"
                        >
                          <option value="">-- Select Serial from Branch Stock --</option>
                          {availableSerialsList.map((s) => (
                            <option key={s.id || s.serial_number} value={s.serial_number}>
                              {s.serial_number} {s.warranty_expiry ? `(Warranty: ${new Date(s.warranty_expiry).toLocaleDateString()})` : ''}
                            </option>
                          ))}
                        </select>
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span>Or type manual serial below if untracked:</span>
                          <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{ohsSerialNumber}</span>
                        </div>
                      </div>
                    ) : null}

                    <input
                      type="text"
                      required
                      value={ohsSerialNumber}
                      onChange={(e) => setOhsSerialNumber(e.target.value)}
                      placeholder="e.g. SN-ASUS-4080-99210"
                      className="w-full bg-white dark:bg-navy-900 border border-emerald-400 dark:border-emerald-600 rounded-xl px-3 py-2 text-slate-900 dark:text-emerald-300 font-mono text-xs font-bold focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={ohsQuantity}
                        onChange={(e) => setOhsQuantity(parseInt(e.target.value) || 1)}
                        className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Sale Unit Price (৳) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={ohsUnitPrice}
                        onChange={(e) => setOhsUnitPrice(e.target.value)}
                        placeholder="145000"
                        className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none font-bold"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Total Amount (৳)
                      </label>
                      <div className="w-full bg-slate-100 dark:bg-navy-800 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-emerald-600 dark:text-emerald-400 font-black text-xs">
                        ৳{((parseFloat(ohsUnitPrice) || 0) * (Number(ohsQuantity) || 1)).toLocaleString()}
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Warranty Period
                      </label>
                      <input
                        type="text"
                        value={ohsWarrantyPeriod}
                        onChange={(e) => setOhsWarrantyPeriod(e.target.value)}
                        placeholder="e.g. 3 Years Official"
                        className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* PAYMENT & LEND TERMS */}
                <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5 text-xs">
                      <CreditCard className="w-4 h-4 text-emerald-500" />
                      <span>Sale & Credit / Lend Terms (পরিশোধ বা লেন্ড)</span>
                    </span>
                    <span className="text-[10px] text-emerald-800 dark:text-emerald-400 font-semibold">
                      Total Invoiced: ৳{((parseFloat(ohsUnitPrice) || 0) * (Number(ohsQuantity) || 1)).toLocaleString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label
                      onClick={() => setOhsIsLend(true)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                        ohsIsLend
                          ? 'bg-emerald-100 dark:bg-emerald-900/40 border-emerald-500 text-emerald-950 dark:text-emerald-200 ring-2 ring-emerald-500/20'
                          : 'bg-white dark:bg-navy-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <input
                        type="radio"
                        name="ohsLendOption"
                        checked={ohsIsLend}
                        onChange={() => setOhsIsLend(true)}
                        className="mt-0.5 text-emerald-500"
                      />
                      <div>
                        <span className="font-bold block text-xs">Delivered on Lend / Credit (ধার / বাকিতে প্রদান)</span>
                        <p className="text-[10px] mt-0.5 opacity-80">
                          House receives goods on credit. Receivable balance added to House Ledger; settle whenever collected.
                        </p>
                      </div>
                    </label>

                    <label
                      onClick={() => setOhsIsLend(false)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                        !ohsIsLend
                          ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-500 text-teal-950 dark:text-teal-200 ring-2 ring-teal-500/20'
                          : 'bg-white dark:bg-navy-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <input
                        type="radio"
                        name="ohsLendOption"
                        checked={!ohsIsLend}
                        onChange={() => setOhsIsLend(false)}
                        className="mt-0.5 text-teal-500"
                      />
                      <div>
                        <span className="font-bold block text-xs">Paid Immediately (নগদ আদায় / পরিশোধিত)</span>
                        <p className="text-[10px] mt-0.5 opacity-80">
                          Payment received on delivery. Instant settlement timestamp and transaction reference recorded.
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Immediate Payment Fields */}
                  {!ohsIsLend && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-emerald-200/50 dark:border-emerald-900/40">
                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Payment Method *
                        </label>
                        <select
                          value={ohsPaymentMethod}
                          onChange={(e) => setOhsPaymentMethod(e.target.value)}
                          className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                        >
                          <option value="Cash">Cash (নগদ)</option>
                          <option value="bKash Merchant">bKash Merchant</option>
                          <option value="Nagad">Nagad</option>
                          <option value="Bank Transfer">Bank Transfer</option>
                          <option value="Cheque">Cheque</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Trx ID / Voucher Ref
                        </label>
                        <input
                          type="text"
                          value={ohsPaymentReference}
                          onChange={(e) => setOhsPaymentReference(e.target.value)}
                          placeholder="TRX-89012"
                          className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Received By Staff
                        </label>
                        <input
                          type="text"
                          value={ohsReceivedByName}
                          onChange={(e) => setOhsReceivedByName(e.target.value)}
                          placeholder="Staff / Cashier Name"
                          className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* Partial Advance Deposit if Lend */}
                  {ohsIsLend && (
                    <div className="pt-1">
                      <label className="block font-semibold text-emerald-900 dark:text-emerald-300 mb-1">
                        Optional Partial Advance Collected (৳) (Leave 0 if 100% on lend)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={ohsPaidAmount}
                        onChange={(e) => setOhsPaidAmount(e.target.value)}
                        placeholder="0"
                        className="w-full sm:w-1/2 bg-white dark:bg-navy-900 border border-emerald-300 dark:border-emerald-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Delivery Notes / Reference
                  </label>
                  <textarea
                    rows={2}
                    value={ohsGeneralNotes}
                    onChange={(e) => setOhsGeneralNotes(e.target.value)}
                    placeholder="e.g. Delivered to Star Tech Multiplan for customer build order #8812. 7-day credit terms."
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Sticky Footer */}
              <div className="px-5 py-3 sm:px-6 sm:py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-navy-950 shrink-0 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsOhsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 font-bold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingOhs}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md shadow-emerald-600/20 disabled:opacity-50 flex items-center gap-1.5 text-xs cursor-pointer"
                >
                  {submittingOhs ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Recording Delivery...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Confirm Sale to House</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3.2: SETTLE SALE RECEIVABLE / COLLECT PAYMENT       */}
      {/* ======================================================== */}
      {settleSaleModalItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-navy-900 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 max-w-xl w-full shadow-2xl relative flex flex-col max-h-[92vh] sm:max-h-[88vh] my-auto overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 sm:px-6 sm:py-4 border-b border-slate-200 dark:border-slate-800 shrink-0 bg-white dark:bg-navy-900">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                    Collect Lend Payment (দোকান থেকে বাকি আদায়)
                  </h3>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {settleSaleModalItem.invoice_no}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSettleSaleModalItem(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSettleSaleReceivable} className="flex flex-col flex-1 overflow-hidden">
              <div className="overflow-y-auto p-4 sm:p-5 space-y-3.5 flex-1 text-xs">
                {settleSaleError && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300">
                    {settleSaleError}
                  </div>
                )}

                {/* Settle Info Card */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Buyer Partner House</span>
                      <span className="font-bold text-slate-900 dark:text-white text-xs">{settleSaleModalItem.house_name}</span>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{settleSaleModalItem.product_name}</p>
                    </div>
                    <span className="font-mono font-bold text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 shrink-0">
                      S/N: {settleSaleModalItem.serial_number}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center pt-0.5">
                    <div className="p-2 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 font-medium block">Total Price</span>
                      <span className="font-bold text-slate-900 dark:text-white text-xs">৳{Number(settleSaleModalItem.total_amount).toLocaleString()}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 font-medium block">Received</span>
                      <span className="font-bold text-teal-600 dark:text-teal-400 text-xs">৳{Number(settleSaleModalItem.paid_amount || 0).toLocaleString()}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900">
                      <span className="text-[10px] text-rose-500 dark:text-rose-400 font-bold block">Remaining Due</span>
                      <span className="font-bold text-rose-600 dark:text-rose-400 text-xs">৳{Number(settleSaleModalItem.due_amount).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Amount to Collect Input & Presets */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold text-slate-700 dark:text-slate-300">
                      Collection Amount (৳) *
                    </label>
                    <span className="text-[10px] text-slate-400">Record partial or full payment</span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={settleSaleAmount}
                    onChange={(e) => setSettleSaleAmount(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-bold text-sm focus:outline-none focus:border-emerald-500"
                  />

                  {/* Preset Chips */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    <button
                      type="button"
                      onClick={() => setSettleSaleAmount(settleSaleModalItem.due_amount.toString())}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold text-[10px] border border-emerald-500/20 transition-colors"
                    >
                      Full Due: ৳{Number(settleSaleModalItem.due_amount).toLocaleString()}
                    </button>
                    {Number(settleSaleModalItem.due_amount) > 1000 && (
                      <button
                        type="button"
                        onClick={() => setSettleSaleAmount(Math.round(Number(settleSaleModalItem.due_amount) / 2).toString())}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-[10px] border border-slate-200 dark:border-slate-700 transition-colors"
                      >
                        50% (৳{Math.round(Number(settleSaleModalItem.due_amount) / 2).toLocaleString()})
                      </button>
                    )}
                    {Number(settleSaleModalItem.due_amount) >= 5000 && (
                      <button
                        type="button"
                        onClick={() => setSettleSaleAmount('5000')}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-[10px] border border-slate-200 dark:border-slate-700 transition-colors"
                      >
                        ৳5,000
                      </button>
                    )}
                  </div>
                </div>

                {/* Remaining Balance Preview */}
                {(() => {
                  const collecting = parseFloat(settleSaleAmount) || 0;
                  const currentDue = Number(settleSaleModalItem.due_amount);
                  const remainingAfter = Math.max(0, currentDue - collecting);
                  const isPartial = collecting > 0 && collecting < currentDue;

                  return (
                    <div className={`p-2.5 rounded-xl border flex items-center justify-between text-[11px] ${
                      isPartial
                        ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800'
                        : 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                    }`}>
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          isPartial ? 'bg-amber-500 text-navy-950' : 'bg-emerald-600 text-white'
                        }`}>
                          {isPartial ? 'Partial Payment' : 'Full Settlement'}
                        </span>
                        <span className="text-slate-600 dark:text-slate-400">Remaining Balance:</span>
                      </div>
                      <span className={`font-bold ${isPartial ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        ৳{remainingAfter.toLocaleString()}
                      </span>
                    </div>
                  );
                })()}

                {/* Payment Method & Trx Ref */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Payment Method *
                    </label>
                    <select
                      value={settleSaleMethod}
                      onChange={(e) => setSettleSaleMethod(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-900 dark:text-white focus:outline-none"
                    >
                      <option value="Cash">Cash (নগদ)</option>
                      <option value="bKash Merchant">bKash Merchant</option>
                      <option value="Nagad">Nagad</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Cheque">Cheque</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Trx / Receipt Ref #
                    </label>
                    <input
                      type="text"
                      value={settleSaleRef}
                      onChange={(e) => setSettleSaleRef(e.target.value)}
                      placeholder="TRX-REC-99120"
                      className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Date & Received By */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Receipt Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={settleSaleDate}
                      onChange={(e) => setSettleSaleDate(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Received By (Staff) *
                    </label>
                    <input
                      type="text"
                      required
                      value={settleSaleBy}
                      onChange={(e) => setSettleSaleBy(e.target.value)}
                      placeholder="Accounts Officer"
                      className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Notes / Remarks
                  </label>
                  <input
                    type="text"
                    value={settleSaleNotes}
                    onChange={(e) => setSettleSaleNotes(e.target.value)}
                    placeholder="e.g. Paid by Cheque clearing or direct cash counter"
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Sticky Footer */}
              <div className="px-5 py-3 sm:px-6 sm:py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-navy-950 shrink-0 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setSettleSaleModalItem(null)}
                  className="px-3.5 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 font-bold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingSaleSettle}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md shadow-emerald-600/20 disabled:opacity-50 flex items-center gap-1.5 text-xs cursor-pointer"
                >
                  {submittingSaleSettle ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Recording...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Record Payment (৳{(parseFloat(settleSaleAmount) || 0).toLocaleString()})</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3.3: PRINTABLE A4 DELIVERY CHALLAN & B2B INVOICE    */}
      {/* ======================================================== */}
      {viewSaleChallanItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-navy-900 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 max-w-3xl w-full shadow-2xl relative flex flex-col max-h-[95vh] sm:max-h-[92vh] my-auto overflow-hidden">
            {/* Screen Header Bar */}
            <div className="flex items-center justify-between px-5 py-3.5 sm:px-6 sm:py-4 border-b border-slate-200 dark:border-slate-800 shrink-0 bg-white dark:bg-navy-900 print:hidden">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-600 dark:text-cyan-400 flex items-center justify-center">
                  <Printer className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                    B2B Delivery Challan & Sale Invoice
                  </h3>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                    {viewSaleChallanItem.invoice_no}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Challan (A4)</span>
                </button>
                <button
                  onClick={() => setViewSaleChallanItem(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Printable A4 Challan Document */}
            <div className="overflow-y-auto p-4 sm:p-8 flex-1 bg-slate-100 dark:bg-navy-950 print:p-0 print:bg-white print:overflow-visible">
              <div
                id="printable-challan"
                className="bg-white text-slate-900 p-8 sm:p-10 rounded-2xl shadow-sm border border-slate-200 space-y-6 max-w-2xl mx-auto print:shadow-none print:border-none print:p-6 print:max-w-none print:w-full print:m-0"
              >
                {/* Clean Official Header */}
                <div className="flex items-start justify-between border-b-2 border-slate-900 pb-5">
                  <div>
                    <div className="flex items-center gap-3">
                      <img
                        src="/images/logo.png"
                        alt="CORENIX"
                        className="h-8 w-auto object-contain"
                      />
                      <div>
                        <h1 className="text-xl font-black tracking-tight text-slate-900 uppercase">
                          ENTERPRISE
                        </h1>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                          Custom High Performance Systems & Tech Distribution
                        </p>
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-600 mt-2 space-y-0.5">
                      <p>Corporate Hotline: +880 1700-000000 | Email: b2b@corenix.com</p>
                      <p>Issuing Location: <strong>{viewSaleChallanItem.branch_name || 'Corenix Central'} ({viewSaleChallanItem.branch_code || 'MAIN'})</strong></p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="inline-block px-3 py-1 rounded-md text-xs font-black uppercase tracking-wider bg-slate-900 text-white">
                      DELIVERY CHALLAN & INVOICE
                    </span>
                    <div className="text-[11px] text-slate-700 mt-2 space-y-0.5">
                      <div>Challan #: <strong className="font-mono text-slate-900 text-xs">{viewSaleChallanItem.invoice_no}</strong></div>
                      <div>Date: <strong>{new Date(viewSaleChallanItem.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</strong></div>
                      <div>Terms: <strong className="uppercase">{viewSaleChallanItem.payment_status === 'paid' ? 'PAID CASH' : 'ON LEND (CREDIT)'}</strong></div>
                    </div>
                  </div>
                </div>

                {/* 2-Column Information: Delivered To & Challan Details */}
                <div className="grid grid-cols-2 gap-6 pt-1">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">
                      Delivered To / Buyer Partner House:
                    </span>
                    <h3 className="font-black text-slate-900 text-sm">
                      {viewSaleChallanItem.house_name}
                    </h3>
                    {viewSaleChallanItem.house_contact && (
                      <p className="text-[11px] text-slate-700 mt-0.5">
                        Attn: <strong>{viewSaleChallanItem.house_contact}</strong> {viewSaleChallanItem.house_phone ? `(${viewSaleChallanItem.house_phone})` : ''}
                      </p>
                    )}
                    {viewSaleChallanItem.house_address && (
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        {viewSaleChallanItem.house_address}
                      </p>
                    )}
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">
                      Issuing Branch & Delivery Meta:
                    </span>
                    <div className="text-[11px] text-slate-700 space-y-1">
                      <div>Dispatch Branch: <strong>{viewSaleChallanItem.branch_name || 'Central Store'}</strong></div>
                      <div>Issued By: <strong>{viewSaleChallanItem.created_by_name || 'Store Executive'}</strong></div>
                      <div>Status: <span className="font-bold text-slate-900 uppercase">{viewSaleChallanItem.payment_status}</span></div>
                    </div>
                  </div>
                </div>

                {/* Itemized Table */}
                <div>
                  <table className="w-full text-left text-xs border border-slate-300">
                    <thead className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="py-2.5 px-3 border-r border-slate-300 text-center w-10">SL</th>
                        <th className="py-2.5 px-3 border-r border-slate-300">Product & Specification</th>
                        <th className="py-2.5 px-3 border-r border-slate-300">Serial Number (S/N)</th>
                        <th className="py-2.5 px-3 border-r border-slate-300 text-center">Warranty</th>
                        <th className="py-2.5 px-3 border-r border-slate-300 text-center w-12">Qty</th>
                        <th className="py-2.5 px-3 border-r border-slate-300 text-right">Unit Price</th>
                        <th className="py-2.5 px-3 text-right">Total (৳)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-300">
                      <tr>
                        <td className="py-3 px-3 border-r border-slate-300 text-center font-bold text-slate-500">
                          01
                        </td>
                        <td className="py-3 px-3 border-r border-slate-300">
                          <div className="font-bold text-slate-900">{viewSaleChallanItem.product_name}</div>
                          {viewSaleChallanItem.product_brand && (
                            <div className="text-[10px] text-slate-500">{viewSaleChallanItem.product_brand} • {viewSaleChallanItem.product_category || 'Hardware'}</div>
                          )}
                        </td>
                        <td className="py-3 px-3 border-r border-slate-300 font-mono font-bold text-slate-900 text-[11px]">
                          {viewSaleChallanItem.serial_number}
                        </td>
                        <td className="py-3 px-3 border-r border-slate-300 text-center font-medium text-slate-700 text-[11px]">
                          {viewSaleChallanItem.warranty_period || '1 Year Official'}
                        </td>
                        <td className="py-3 px-3 border-r border-slate-300 text-center font-bold text-slate-900">
                          {viewSaleChallanItem.quantity}
                        </td>
                        <td className="py-3 px-3 border-r border-slate-300 text-right font-semibold text-slate-800">
                          ৳{Number(viewSaleChallanItem.unit_price).toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-right font-black text-slate-900">
                          ৳{Number(viewSaleChallanItem.total_amount).toLocaleString()}
                        </td>
                      </tr>
                    </tbody>
                    <tfoot className="bg-slate-50 border-t-2 border-slate-900 font-bold text-xs">
                      <tr>
                        <td colSpan={5} className="py-2.5 px-3 text-right text-slate-600 border-r border-slate-300">
                          Total Invoiced Amount:
                        </td>
                        <td colSpan={2} className="py-2.5 px-3 text-right font-black text-slate-900 text-sm">
                          ৳{Number(viewSaleChallanItem.total_amount).toLocaleString()}
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={5} className="py-2 px-3 text-right text-emerald-700 border-r border-slate-300">
                          Amount Paid / Collected:
                        </td>
                        <td colSpan={2} className="py-2 px-3 text-right font-bold text-emerald-700">
                          ৳{Number(viewSaleChallanItem.paid_amount || 0).toLocaleString()}
                        </td>
                      </tr>
                      {Number(viewSaleChallanItem.due_amount) > 0 && (
                        <tr>
                          <td colSpan={5} className="py-2 px-3 text-right text-rose-700 border-r border-slate-300">
                            Outstanding Lend / Due (দোকান থেকে প্রাপ্য):
                          </td>
                          <td colSpan={2} className="py-2 px-3 text-right font-black text-rose-700">
                            ৳{Number(viewSaleChallanItem.due_amount).toLocaleString()}
                          </td>
                        </tr>
                      )}
                    </tfoot>
                  </table>
                </div>

                {/* Terms and Notes */}
                <div className="text-[10px] text-slate-500 space-y-1 border-t border-slate-200 pt-3">
                  <p><strong>Declaration:</strong> Goods received in intact and good operational condition matching the specific serial numbers listed above.</p>
                  <p><strong>Warranty Policy:</strong> Official manufacturer warranty applies. Serial number warranty stickers must remain intact for warranty service.</p>
                </div>

                {/* Clean Dual Signatures with Clear Branch and House Mention */}
                <div className="pt-12 pb-2 grid grid-cols-2 gap-12 text-center text-xs">
                  <div>
                    <div className="border-t-2 border-slate-800 pt-1.5 font-bold text-slate-900">
                      Authorized Signature
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Corenix — {viewSaleChallanItem.branch_name || 'Issuing Store'}
                    </p>
                  </div>

                  <div>
                    <div className="border-t-2 border-slate-800 pt-1.5 font-bold text-slate-900">
                      Receiver Signature & Seal
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {viewSaleChallanItem.house_name} (Buyer House)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Screen Modal Footer */}
            <div className="px-5 py-3 sm:px-6 sm:py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-navy-950 shrink-0 flex items-center justify-between gap-2.5 print:hidden">
              <span className="text-[11px] text-slate-400">
                A4 Fitted Delivery Challan & Official B2B Sale Invoice
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewSaleChallanItem(null)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-navy-800 text-slate-800 dark:text-slate-200 font-bold text-xs"
                >
                  Close
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Challan</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: DISTRIBUTOR PO MODAL                            */}
      {/* ======================================================== */}
      {isPoModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-navy-900 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 max-w-md w-full shadow-2xl relative flex flex-col max-h-[92vh] sm:max-h-[88vh] my-auto overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-sky-600 dark:text-cyan-400" />
                <span>Issue Supplier Purchase Order</span>
              </h3>
              <button
                onClick={() => setIsPoModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {poErrorMsg && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300">
                {poErrorMsg}
              </div>
            )}

            <form onSubmit={handleCreatePO} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Supplier / Distributor Partner *
                </label>
                <select
                  value={supplierId}
                  onChange={(e) => setSupplierId(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id} className="dark:bg-navy-900">
                      {s.name} ({s.code}) - {s.payment_terms}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Receiving Destination Facility *
                </label>
                {isStoreManager ? (
                  <select
                    value={poBranchId}
                    disabled
                    className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-500 dark:text-slate-400 font-semibold cursor-not-allowed text-xs"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id} className="dark:bg-navy-900">
                        {b.name} ({b.code}) - Your Assigned Store
                      </option>
                    ))}
                  </select>
                ) : (
                  <select
                    value={poBranchId}
                    onChange={(e) => setPoBranchId(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id} className="dark:bg-navy-900">
                        {b.name} ({b.code})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Total Order Value (৳) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    placeholder="150000"
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Initial Paid Amount (৳)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value)}
                    placeholder="50000"
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Procurement Notes / Batch Details
                </label>
                <textarea
                  rows={2}
                  value={poNotes}
                  onChange={(e) => setPoNotes(e.target.value)}
                  placeholder="e.g. 10x RTX 5060 GPUs, 20x DDR5 32GB Kits"
                  className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPoModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPo}
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold shadow-xs disabled:opacity-50"
                >
                  {submittingPo ? 'Generating...' : 'Issue PO'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 5: ADD NEW PARTNER HOUSE                           */}
      {/* ======================================================== */}
      {isAddHouseModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-navy-900 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full shadow-2xl relative flex flex-col max-h-[92vh] sm:max-h-[88vh] my-auto overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 sm:px-6 sm:py-4 border-b border-slate-200 dark:border-slate-800 shrink-0 bg-white dark:bg-navy-900">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                    Add New Partner House (নতুন সহযোগী দোকান যোগ)
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Register market shop for instant lend sourcing & ledger tracking
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsAddHouseModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreatePartnerHouse} className="flex flex-col flex-1 overflow-hidden">
              <div className="overflow-y-auto p-4 sm:p-5 space-y-3.5 flex-1 text-xs">
                {newHouseError && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300">
                    {newHouseError}
                  </div>
                )}
                {newHouseSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-700 dark:text-emerald-300">
                    {newHouseSuccess}
                  </div>
                )}

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    House / Shop Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newHouseName}
                    onChange={(e) => setNewHouseName(e.target.value)}
                    placeholder="e.g. Star Tech Multiplan / Ryans IDB"
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Contact Person
                    </label>
                    <input
                      type="text"
                      value={newHouseContact}
                      onChange={(e) => setNewHouseContact(e.target.value)}
                      placeholder="e.g. Sujon Ahmed (Manager)"
                      className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={newHousePhone}
                      onChange={(e) => setNewHousePhone(e.target.value)}
                      placeholder="01711-XXXXXX"
                      className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Shop / Market Location (Address)
                  </label>
                  <input
                    type="text"
                    value={newHouseAddress}
                    onChange={(e) => setNewHouseAddress(e.target.value)}
                    placeholder="e.g. Level 4, Shop 420, Multiplan Center, Elephant Road, Dhaka"
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Notes / Credit Agreement Terms
                  </label>
                  <textarea
                    rows={2}
                    value={newHouseNotes}
                    onChange={(e) => setNewHouseNotes(e.target.value)}
                    placeholder="e.g. 7-day lend clearance term. Accepts bKash Merchant and Cash."
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="px-5 py-3 sm:px-6 sm:py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-navy-950 shrink-0 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddHouseModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 font-bold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingNewHouse}
                  className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-md shadow-purple-600/20 disabled:opacity-50 flex items-center gap-1.5 text-xs"
                >
                  {submittingNewHouse ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Register Partner House</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 6: PARTNER HOUSES DIRECTORY & OVERVIEW              */}
      {/* ======================================================== */}
      {isHouseDirectoryOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-navy-900 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 max-w-3xl w-full shadow-2xl relative flex flex-col max-h-[92vh] sm:max-h-[88vh] my-auto overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 sm:px-6 sm:py-4 border-b border-slate-200 dark:border-slate-800 shrink-0 bg-white dark:bg-navy-900">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                    Partner Houses Directory (সহযোগী দোকান তালিকা)
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Manage market partners, view balances, and print shop statements
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setNewHouseError('');
                    setNewHouseSuccess('');
                    setIsAddHouseModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add New House</span>
                </button>
                <button
                  onClick={() => setIsHouseDirectoryOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="overflow-y-auto p-4 sm:p-5 space-y-3 flex-1 text-xs">
              {partnerHouses.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <Store className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
                  <p>No partner houses registered yet.</p>
                  <button
                    onClick={() => {
                      setNewHouseError('');
                      setNewHouseSuccess('');
                      setIsAddHouseModalOpen(true);
                    }}
                    className="mt-3 px-3.5 py-1.5 rounded-xl bg-purple-600 text-white font-bold text-xs"
                  >
                    + Add Your First Partner House
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {partnerHouses.map((h) => (
                    <div
                      key={h.id || h.name}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-3 hover:border-purple-400/50 transition-colors"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                            {h.name}
                          </h4>
                          {Number(h.total_lend_due || 0) > 0 ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-navy-950 shrink-0">
                              ৳{Number(h.total_lend_due).toLocaleString()} Due
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 shrink-0">
                              Cleared
                            </span>
                          )}
                        </div>

                        {h.contact_person && (
                          <span className="text-[11px] text-slate-600 dark:text-slate-400 block">
                            Contact: <strong>{h.contact_person}</strong> {h.phone ? `(${h.phone})` : ''}
                          </span>
                        )}
                        {h.address && (
                          <span className="text-[10px] text-slate-400 block line-clamp-1">
                            {h.address}
                          </span>
                        )}
                      </div>

                      <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                          {h.total_transactions || 0} items sourced • ৳{Number(h.total_purchase_amount || 0).toLocaleString()} Total
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setIsHouseDirectoryOpen(false);
                              openLedgerForHouse(h.name);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 dark:bg-teal-950 dark:hover:bg-teal-900 text-teal-700 dark:text-teal-300 font-bold text-[11px] flex items-center gap-1"
                          >
                            <FileText className="w-3 h-3" />
                            <span>Statement</span>
                          </button>
                          {h.id && (
                            <button
                              onClick={() => handleDeletePartnerHouse(h.id!, h.name)}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
                              title="Delete Partner House"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-navy-950 shrink-0 flex items-center justify-end">
              <button
                onClick={() => setIsHouseDirectoryOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-navy-800 text-slate-800 dark:text-slate-200 font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      </div>

      {/* ======================================================== */}
      {/* MODAL 7: 2-WAY SHOP STATEMENT & HOUSE LEDGER (PRINTABLE) */}
      {/* ======================================================== */}
      {isLedgerModalOpen && (
        <>
          {/* ============================================================== */}
          {/* DEDICATED A4 PRINT-ONLY REPORT LAYOUT                          */}
          {/* (Visible ONLY when printing, perfectly fitted for A4 Portrait) */}
          {/* ============================================================== */}
          <div id="ledger-official-print-report" className="hidden print:block w-full bg-white text-black p-0 m-0 font-sans">
            <style jsx global>{`
              @media print {
                @page {
                  size: A4 portrait;
                  margin: 10mm 12mm 12mm 12mm;
                }
                html, body {
                  background: #ffffff !important;
                  color: #000000 !important;
                  margin: 0 !important;
                  padding: 0 !important;
                  font-size: 8pt !important;
                  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
                /* Hide screen-only interactive modal elements */
                .print\\:hidden,
                .fixed.inset-0.bg-black\\/60,
                nav,
                aside,
                header,
                footer:not(.print-footer) {
                  display: none !important;
                }
                #ledger-official-print-report {
                  display: block !important;
                  width: 100% !important;
                  max-width: 186mm !important;
                  margin: 0 auto !important;
                  padding: 0 !important;
                  background: #ffffff !important;
                  color: #000000 !important;
                  position: static !important;
                }
                .ledger-report-table {
                  width: 100% !important;
                  border-collapse: collapse !important;
                  margin-top: 4px !important;
                  margin-bottom: 8px !important;
                  font-size: 7.5pt !important;
                  line-height: 1.25 !important;
                }
                .ledger-report-table thead {
                  display: table-header-group !important;
                }
                .ledger-report-table thead th {
                  background-color: #f1f5f9 !important;
                  color: #0f172a !important;
                  font-weight: 700 !important;
                  border: 1px solid #cbd5e1 !important;
                  padding: 4px 5px !important;
                  text-transform: uppercase !important;
                  font-size: 7pt !important;
                  letter-spacing: 0.2px !important;
                }
                .ledger-report-table tbody td {
                  border: 1px solid #e2e8f0 !important;
                  padding: 3.5px 5px !important;
                  vertical-align: top !important;
                  color: #0f172a !important;
                }
                .ledger-report-table tbody tr {
                  page-break-inside: avoid !important;
                  break-inside: avoid !important;
                }
                .avoid-page-break {
                  page-break-inside: avoid !important;
                  break-inside: avoid !important;
                }
              }
            `}</style>

            {/* 1. REPORT HEADER */}
            <div className="border-b-2 border-slate-900 pb-2 mb-2 text-center avoid-page-break">
              <div className="text-base font-black tracking-wider uppercase text-slate-900">
                CORENIX ENTERPRISE COMPUTING
              </div>
              <div className="text-xs font-bold text-slate-800 tracking-normal mt-0.5 uppercase">
                Two-Way Partner House Ledger & Statement
              </div>
              <div className="text-[7.5pt] font-semibold text-slate-600">
                (দৈনিক ক্রয় ও লেনদেন বিবরণী — পূর্ণাঙ্গ হিসাব খতিয়ান)
              </div>
              <div className="flex justify-between items-center text-[7pt] text-slate-600 mt-1.5 pt-1 border-t border-slate-300 font-mono">
                <span>Statement Period: <strong>{ledgerStartDate ? ledgerStartDate : 'Beginning'} — {ledgerEndDate ? ledgerEndDate : 'Present'}</strong></span>
                <span>Filter: <strong>{ledgerTypeFilter !== 'all' ? ledgerTypeFilter.toUpperCase() : ledgerStatusFilter === 'lend' ? 'Outstanding Due (বাকি)' : ledgerStatusFilter === 'paid' ? 'Paid Only' : 'All Transactions'}</strong></span>
                <span>Generated: <strong>{new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</strong></span>
              </div>
            </div>

            {/* 2. PARTNER INFORMATION & 3. ACCOUNT SUMMARY TABLES (COMPACT 2-COLUMN) */}
            <div className="grid grid-cols-2 gap-2 mb-2.5 avoid-page-break">
              {/* Partner Information Box */}
              <div className="border border-slate-300 rounded-sm p-2 bg-slate-50/40">
                <div className="text-[7pt] font-black uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1 mb-1">
                  TARGET PARTNER SHOP / HOUSE
                </div>
                <table className="w-full text-[7.5pt] leading-tight">
                  <tbody>
                    <tr>
                      <td className="font-semibold text-slate-600 w-24 py-0.5">Partner Name:</td>
                      <td className="font-bold text-slate-900 py-0.5">{ledgerData?.house?.name || ledgerHouseFilter || 'All Partner Houses'}</td>
                    </tr>
                    <tr>
                      <td className="font-semibold text-slate-600 py-0.5">Contact Person:</td>
                      <td className="text-slate-800 py-0.5">{ledgerData?.house?.contact_person || '—'}</td>
                    </tr>
                    <tr>
                      <td className="font-semibold text-slate-600 py-0.5">Phone Number:</td>
                      <td className="font-mono text-slate-800 py-0.5">{ledgerData?.house?.phone || '—'}</td>
                    </tr>
                    <tr>
                      <td className="font-semibold text-slate-600 py-0.5">Address:</td>
                      <td className="text-slate-800 py-0.5">{ledgerData?.house?.address || '—'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Accounting Summary Table */}
              <div className="border border-slate-300 rounded-sm p-2 bg-slate-50/40">
                <div className="text-[7pt] font-black uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1 mb-1 flex justify-between">
                  <span>PERIOD FINANCIAL SUMMARY</span>
                  <span>AMOUNT (৳)</span>
                </div>
                <table className="w-full text-[7.5pt] font-mono leading-tight">
                  <tbody>
                    {Number(ledgerData?.openingBalance || 0) !== 0 && (
                      <tr className="bg-slate-100/80">
                        <td className="font-sans text-slate-700 py-0.5">Opening Balance (পূর্ববর্তী জের):</td>
                        <td className="text-right font-bold text-slate-900 py-0.5">
                          ৳{Math.abs(Number(ledgerData?.openingBalance || 0)).toLocaleString()} {Number(ledgerData?.openingBalance || 0) > 0 ? 'Dr' : 'Cr'}
                        </td>
                      </tr>
                    )}
                    <tr>
                      <td className="font-sans text-slate-700 py-0.5">Purchases (ক্রয় / দেনা - Payable):</td>
                      <td className="text-right font-bold text-slate-900 py-0.5">৳{Number(ledgerData?.summary?.totalPurchasesCost || 0).toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td className="font-sans text-slate-700 py-0.5">Sales / Lending (বিক্রয় - Receivable):</td>
                      <td className="text-right font-bold text-slate-900 py-0.5">৳{Number(ledgerData?.summary?.totalSalesAmount || 0).toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td className="font-sans text-slate-700 py-0.5">Total Cash Received (আদায়কৃত টাকা):</td>
                      <td className="text-right font-bold text-emerald-800 py-0.5">৳{Number(ledgerData?.summary?.totalSalesPaid || 0).toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td className="font-sans text-slate-700 py-0.5">Total Cash Paid to House (পরিশোধ):</td>
                      <td className="text-right font-bold text-slate-800 py-0.5">৳{Number(ledgerData?.summary?.totalPurchasesPaid || 0).toLocaleString()}</td>
                    </tr>
                    {(() => {
                      const net = Number(ledgerData?.summary?.netBalance ?? 0);
                      const isReceivable = net > 0;
                      const isPayable = net < 0;

                      return (
                        <tr className="border-t border-slate-400 font-bold bg-slate-100">
                          <td className="font-sans text-slate-900 font-black uppercase text-[7pt] py-1">
                            CLOSING NET BALANCE (চলতি জের):
                          </td>
                          <td className="text-right font-black text-[8pt] text-slate-900 py-1">
                            ৳{Math.abs(net).toLocaleString()} {isReceivable ? 'RECEIVABLE (পাওনা)' : isPayable ? 'PAYABLE (দেনা)' : 'SETTLED (০)'}
                          </td>
                        </tr>
                      );
                    })()}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 4. MAIN TRANSACTION & PAYMENT LEDGER TABLE */}
            <div className="mb-2">
              <div className="text-[7.5pt] font-black uppercase tracking-wider text-slate-900 mb-1 pb-0.5 border-b border-slate-900 flex justify-between items-center">
                <span>TRANSACTION & PAYMENT ACTIVITIES LEDGER (লেনদেন ও খতিয়ান বিবরণী)</span>
                <span className="font-mono font-normal text-[6.5pt] text-slate-500">All amounts in BDT (৳)</span>
              </div>

              <table className="ledger-report-table">
                <thead>
                  <tr>
                    <th style={{ width: '9%' }}>Date</th>
                    <th style={{ width: '7%' }}>Time</th>
                    <th style={{ width: '10%' }}>Type</th>
                    <th style={{ width: '12%' }}>Reference</th>
                    <th style={{ width: '28%' }}>Description / Product & Serial</th>
                    <th style={{ width: '10%' }}>Branch</th>
                    <th style={{ width: '8%', textAlign: 'right' }}>Debit (৳)</th>
                    <th style={{ width: '8%', textAlign: 'right' }}>Credit (৳)</th>
                    <th style={{ width: '8%', textAlign: 'right' }}>Balance (৳)</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Opening Balance Row if present */}
                  {Number(ledgerData?.openingBalance || 0) !== 0 && (
                    <tr className="bg-slate-100/70 font-bold text-[7pt] border-b border-slate-300">
                      <td colSpan={6} className="py-1 px-2 font-bold text-slate-800 italic">
                        ⭐ Opening Balance Brought Forward (পূর্ববর্তী প্রারম্ভিক জের)
                      </td>
                      <td className="text-right font-mono text-[7pt]">{Number(ledgerData?.openingBalance || 0) > 0 ? `৳${Math.abs(Number(ledgerData.openingBalance)).toLocaleString()}` : '—'}</td>
                      <td className="text-right font-mono text-[7pt]">{Number(ledgerData?.openingBalance || 0) < 0 ? `৳${Math.abs(Number(ledgerData.openingBalance)).toLocaleString()}` : '—'}</td>
                      <td className="text-right font-mono font-black text-[7pt]">
                        ৳{Math.abs(Number(ledgerData?.openingBalance || 0)).toLocaleString()} {Number(ledgerData?.openingBalance || 0) > 0 ? 'Dr' : 'Cr'}
                      </td>
                    </tr>
                  )}

                  {(!ledgerData?.activities || ledgerData.activities.length === 0) ? (
                    <tr>
                      <td colSpan={9} className="text-center py-4 text-slate-500 italic">
                        No transactions recorded for the selected house and date period.
                      </td>
                    </tr>
                  ) : ledgerData?.groupedByDay && ledgerData.groupedByDay.length > 0 ? (
                    ledgerData.groupedByDay.map((group: any) => (
                      <React.Fragment key={group.date}>
                        <tr className="bg-slate-100 font-bold text-[7pt] border-t-2 border-b border-slate-300">
                          <td colSpan={9} className="py-1 px-2 font-bold text-slate-900 bg-slate-100">
                            📅 {group.dayFormatted} — [Sales: ৳{group.totalSales.toLocaleString()} | Received: ৳{group.totalCollections.toLocaleString()} | Purchases: ৳{group.totalPurchases.toLocaleString()} | Paid: ৳{group.totalPaymentsPaid.toLocaleString()} | Day Closing: ৳{Math.abs(group.closingBalance).toLocaleString()} {group.closingBalance > 0 ? 'Dr' : group.closingBalance < 0 ? 'Cr' : ''}]
                          </td>
                        </tr>
                        {group.activities.map((act: any) => {
                          const isSale = act.activity_type === 'sale_delivery';
                          const isCollection = act.activity_type === 'sale_collection';
                          const isPurchase = act.activity_type === 'purchase_inward';
                          const isPaymentOut = act.activity_type === 'purchase_payment';

                          return (
                            <tr key={act.id}>
                              <td className="whitespace-nowrap font-mono text-[7pt]">
                                {new Date(act.date).toLocaleDateString('en-GB')}
                              </td>
                              <td className="whitespace-nowrap font-mono text-[6.5pt] text-slate-600">
                                {new Date(act.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                              </td>
                              <td className="font-bold whitespace-nowrap text-[7pt]">
                                {isSale && 'SALE'}
                                {isCollection && 'COLLECTION'}
                                {isPurchase && 'PURCHASE'}
                                {isPaymentOut && 'PAYMENT'}
                              </td>
                              <td className="font-mono font-bold text-[7pt]">
                                {act.doc_no}
                              </td>
                              <td>
                                <div className="font-semibold text-[7.5pt]">{act.product_name || act.title}</div>
                                {act.serial_number && (
                                  <div className="font-mono text-[6.5pt] text-slate-700">SN: {act.serial_number}</div>
                                )}
                                {act.payment_method && (
                                  <div className="text-[6.5pt] text-slate-500">
                                    Via {act.payment_method} {act.payment_reference ? `(${act.payment_reference})` : ''} {act.staff_name ? `• Staff: ${act.staff_name}` : ''}
                                  </div>
                                )}
                              </td>
                              <td className="text-[7pt]">{act.branch_name || 'Main Branch'}</td>
                              <td className="text-right font-mono font-semibold text-[7pt]">
                                {act.debit > 0 ? `৳${act.debit.toLocaleString()}` : '—'}
                              </td>
                              <td className="text-right font-mono font-semibold text-[7pt]">
                                {act.credit > 0 ? `৳${act.credit.toLocaleString()}` : '—'}
                              </td>
                              <td className="text-right font-mono font-bold text-[7pt] whitespace-nowrap">
                                ৳{Math.abs(act.running_balance).toLocaleString()} {act.running_balance > 0 ? 'Dr' : act.running_balance < 0 ? 'Cr' : ''}
                              </td>
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    ))
                  ) : (
                    (ledgerData?.activities || []).map((act: any) => (
                      <tr key={act.id}>
                        <td className="whitespace-nowrap font-mono text-[7pt]">
                          {new Date(act.date).toLocaleDateString('en-GB')}
                        </td>
                        <td className="whitespace-nowrap font-mono text-[6.5pt] text-slate-600">
                          {new Date(act.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                        </td>
                        <td className="font-bold text-[7pt]">
                          {act.type_code}
                        </td>
                        <td className="font-mono font-bold text-[7pt]">
                          {act.doc_no}
                        </td>
                        <td>
                          <div className="font-semibold text-[7.5pt]">{act.product_name}</div>
                          {act.serial_number && <div className="font-mono text-[6.5pt] text-slate-700">SN: {act.serial_number}</div>}
                        </td>
                        <td className="text-[7pt]">{act.branch_name || 'Main Branch'}</td>
                        <td className="text-right font-mono text-[7pt]">{act.debit > 0 ? `৳${act.debit.toLocaleString()}` : '—'}</td>
                        <td className="text-right font-mono text-[7pt]">{act.credit > 0 ? `৳${act.credit.toLocaleString()}` : '—'}</td>
                        <td className="text-right font-mono font-bold text-[7pt]">৳{Math.abs(act.running_balance).toLocaleString()} {act.running_balance > 0 ? 'Dr' : 'Cr'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* 5. DUAL / TRIPLE SIGNATURES & OFFICIAL SEAL (KEPT AT BOTTOM) */}
            <div className="avoid-page-break mt-6 pt-4">
              <div className="grid grid-cols-3 gap-6 text-center text-[7.5pt] text-slate-800">
                <div>
                  <div className="h-10 border-b border-slate-400 mb-1"></div>
                  <div className="font-bold uppercase tracking-wider">Prepared By (Store Executive)</div>
                  <div className="text-slate-500 text-[6.5pt]">Store Executive / POS Officer</div>
                </div>
                <div>
                  <div className="h-10 border-b border-slate-400 mb-1"></div>
                  <div className="font-bold uppercase tracking-wider">Checked & Approved (Accounts)</div>
                  <div className="text-slate-500 text-[6.5pt]">Accounts & Finance Manager</div>
                </div>
                <div>
                  <div className="h-10 border-b border-slate-400 mb-1"></div>
                  <div className="font-bold uppercase tracking-wider">Partner House Seal & Signature</div>
                  <div className="text-slate-500 text-[6.5pt]">Recipient Signature & Date</div>
                </div>
              </div>

              {/* 6. DOCUMENT FOOTER */}
              <div className="flex justify-between items-center text-[6.5pt] text-slate-500 mt-5 pt-1 border-t border-slate-300 font-mono">
                <span>Corenix Enterprise ERP — B2B Partner House Accounting Engine</span>
                <span>Confidential Official Accounting Statement</span>
                <span>Printed: {new Date().toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })}</span>
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* SCREEN-ONLY INTERACTIVE MODAL UI                               */}
          {/* (Hidden completely when printing, full rich web UX for user)   */}
          {/* ============================================================== */}
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:hidden">
            <div className="bg-white dark:bg-navy-900 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 max-w-6xl w-full shadow-2xl relative flex flex-col max-h-[96vh] my-auto overflow-hidden">
              {/* Header (Screen Only) */}
              <div className="flex items-center justify-between px-5 py-3.5 sm:px-6 sm:py-4 border-b border-slate-200 dark:border-slate-800 shrink-0 bg-white dark:bg-navy-900">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                    <Scale className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base flex items-center gap-2">
                      <span>Two-Way Partner House Ledger & Statement</span>
                      <span className="text-[11px] font-normal text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 px-2 py-0.5 rounded-full">
                        ২-মুখী হিসাব খতিয়ান
                      </span>
                    </h3>
                    <span className="text-[11px] text-slate-400">
                      Complete accounting history: Day-by-Day activities, purchases, sales, collections, settlements & running balance
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={exportLedgerToCSV}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Export ledger as CSV"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Statement</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsLedgerModalOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Scrollable Content Body */}
              <div className="overflow-y-auto p-4 sm:p-6 space-y-4 flex-1 text-xs">
                {/* FILTERS & SEARCH TOOLBAR (Screen Only) */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 space-y-3">
                  {/* Top search & key filters row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-2.5">
                    {/* Live Search */}
                    <div className="md:col-span-4">
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 text-[11px] flex items-center gap-1">
                        <Search className="w-3 h-3 text-slate-400" />
                        <span>Search Transactions</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={ledgerSearchQuery}
                          onChange={(e) => {
                            setLedgerSearchQuery(e.target.value);
                            fetchLedgerReport(ledgerHouseFilter, ledgerStartDate, ledgerEndDate, ledgerStatusFilter, ledgerBranchFilter, ledgerTypeFilter, e.target.value, ledgerSortOrder);
                          }}
                          placeholder="Search Ref, Product, S/N, SKU, Staff, Notes..."
                          className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-8 pr-7 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                        />
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                        {ledgerSearchQuery && (
                          <button
                            type="button"
                            onClick={() => {
                              setLedgerSearchQuery('');
                              fetchLedgerReport(ledgerHouseFilter, ledgerStartDate, ledgerEndDate, ledgerStatusFilter, ledgerBranchFilter, ledgerTypeFilter, '', ledgerSortOrder);
                            }}
                            className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Partner House Select */}
                    <div className="md:col-span-3">
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 text-[11px]">
                        Partner Shop / House
                      </label>
                      <select
                        value={ledgerHouseFilter}
                        onChange={(e) => {
                          setLedgerHouseFilter(e.target.value);
                          fetchLedgerReport(e.target.value, ledgerStartDate, ledgerEndDate, ledgerStatusFilter, ledgerBranchFilter, ledgerTypeFilter, ledgerSearchQuery, ledgerSortOrder);
                        }}
                        className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white font-bold focus:outline-none"
                      >
                        <option value="all">All Partner Houses (Overview)</option>
                        {partnerHouses.map((h) => (
                          <option key={h.id || h.name} value={h.name}>
                            {h.name}
                          </option>
                        ))}
                        {knownHouses.filter((kh) => !partnerHouses.some((ph) => ph.name === kh.house_name)).map((kh) => (
                          <option key={kh.house_name} value={kh.house_name}>
                            {kh.house_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Transaction Type Filter */}
                    <div className="md:col-span-3">
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 text-[11px]">
                        Transaction Type
                      </label>
                      <select
                        value={ledgerTypeFilter}
                        onChange={(e) => {
                          setLedgerTypeFilter(e.target.value);
                          fetchLedgerReport(ledgerHouseFilter, ledgerStartDate, ledgerEndDate, ledgerStatusFilter, ledgerBranchFilter, e.target.value, ledgerSearchQuery, ledgerSortOrder);
                        }}
                        className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white font-bold focus:outline-none"
                      >
                        <option value="all">All Transaction Types</option>
                        <option value="purchases">Purchases Only (হাউস ক্রয়)</option>
                        <option value="sales">Sales Only (হাউসে বিক্রয়)</option>
                        <option value="payments">Payments Paid (পরিশোধ)</option>
                        <option value="collections">Collections Received (আদায়)</option>
                      </select>
                    </div>

                    {/* Sort Order */}
                    <div className="md:col-span-2">
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 text-[11px]">
                        Sort Order
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const nextSort = ledgerSortOrder === 'asc' ? 'desc' : 'asc';
                          setLedgerSortOrder(nextSort);
                          fetchLedgerReport(ledgerHouseFilter, ledgerStartDate, ledgerEndDate, ledgerStatusFilter, ledgerBranchFilter, ledgerTypeFilter, ledgerSearchQuery, nextSort);
                        }}
                        className="w-full bg-white dark:bg-navy-900 hover:bg-slate-100 dark:hover:bg-navy-800 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white font-bold flex items-center justify-between transition-colors"
                      >
                        <span>{ledgerSortOrder === 'asc' ? 'Oldest → Newest' : 'Newest → Oldest'}</span>
                        <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                    </div>
                  </div>

                  {/* Secondary Filters row: Dates, Status, Branch */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 text-[11px]">
                        From Date (তারিখ থেকে)
                      </label>
                      <input
                        type="date"
                        value={ledgerStartDate}
                        onChange={(e) => {
                          setLedgerStartDate(e.target.value);
                          fetchLedgerReport(ledgerHouseFilter, e.target.value, ledgerEndDate, ledgerStatusFilter, ledgerBranchFilter, ledgerTypeFilter, ledgerSearchQuery, ledgerSortOrder);
                        }}
                        className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 text-[11px]">
                        To Date (তারিখ পর্যন্ত)
                      </label>
                      <input
                        type="date"
                        value={ledgerEndDate}
                        onChange={(e) => {
                          setLedgerEndDate(e.target.value);
                          fetchLedgerReport(ledgerHouseFilter, ledgerStartDate, e.target.value, ledgerStatusFilter, ledgerBranchFilter, ledgerTypeFilter, ledgerSearchQuery, ledgerSortOrder);
                        }}
                        className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 text-[11px]">
                        Payment / Lend Status
                      </label>
                      <select
                        value={ledgerStatusFilter}
                        onChange={(e: any) => {
                          setLedgerStatusFilter(e.target.value);
                          fetchLedgerReport(ledgerHouseFilter, ledgerStartDate, ledgerEndDate, e.target.value, ledgerBranchFilter, ledgerTypeFilter, ledgerSearchQuery, ledgerSortOrder);
                        }}
                        className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                      >
                        <option value="all">All Statuses (Due & Paid)</option>
                        <option value="lend">On Lend (Outstanding Due Only)</option>
                        <option value="paid">Fully Paid & Cleared Only</option>
                      </select>
                    </div>
                  </div>

                  {/* Quick Date Range Preset Buttons */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-slate-200/80 dark:border-slate-800/80">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Quick Date Presets:</span>
                    <button
                      type="button"
                      onClick={() => applyDatePreset('today')}
                      className="px-2 py-0.5 rounded-lg bg-white dark:bg-navy-900 hover:bg-slate-100 dark:hover:bg-navy-800 border border-slate-200 dark:border-slate-800 text-[10px] text-slate-700 dark:text-slate-300 font-semibold"
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      onClick={() => applyDatePreset('yesterday')}
                      className="px-2 py-0.5 rounded-lg bg-white dark:bg-navy-900 hover:bg-slate-100 dark:hover:bg-navy-800 border border-slate-200 dark:border-slate-800 text-[10px] text-slate-700 dark:text-slate-300 font-semibold"
                    >
                      Yesterday
                    </button>
                    <button
                      type="button"
                      onClick={() => applyDatePreset('this_week')}
                      className="px-2 py-0.5 rounded-lg bg-white dark:bg-navy-900 hover:bg-slate-100 dark:hover:bg-navy-800 border border-slate-200 dark:border-slate-800 text-[10px] text-slate-700 dark:text-slate-300 font-semibold"
                    >
                      This Week
                    </button>
                    <button
                      type="button"
                      onClick={() => applyDatePreset('last_week')}
                      className="px-2 py-0.5 rounded-lg bg-white dark:bg-navy-900 hover:bg-slate-100 dark:hover:bg-navy-800 border border-slate-200 dark:border-slate-800 text-[10px] text-slate-700 dark:text-slate-300 font-semibold"
                    >
                      Last Week
                    </button>
                    <button
                      type="button"
                      onClick={() => applyDatePreset('this_month')}
                      className="px-2 py-0.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900 border border-teal-200 dark:border-teal-800 text-[10px] text-teal-700 dark:text-teal-300 font-semibold"
                    >
                      This Month
                    </button>
                    <button
                      type="button"
                      onClick={() => applyDatePreset('last_month')}
                      className="px-2 py-0.5 rounded-lg bg-white dark:bg-navy-900 hover:bg-slate-100 dark:hover:bg-navy-800 border border-slate-200 dark:border-slate-800 text-[10px] text-slate-700 dark:text-slate-300 font-semibold"
                    >
                      Last Month
                    </button>
                    <button
                      type="button"
                      onClick={() => applyDatePreset('this_year')}
                      className="px-2 py-0.5 rounded-lg bg-white dark:bg-navy-900 hover:bg-slate-100 dark:hover:bg-navy-800 border border-slate-200 dark:border-slate-800 text-[10px] text-slate-700 dark:text-slate-300 font-semibold"
                    >
                      This Year
                    </button>
                    <button
                      type="button"
                      onClick={() => applyDatePreset('all')}
                      className="px-2 py-0.5 rounded-lg bg-white dark:bg-navy-900 hover:bg-slate-100 dark:hover:bg-navy-800 border border-slate-200 dark:border-slate-800 text-[10px] text-slate-700 dark:text-slate-300 font-semibold"
                    >
                      All Time
                    </button>
                  </div>
                </div>

                {/* 3 VIEW MODES SWITCHER & MASTER CONTROLS (Screen Only) */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setLedgerViewMode('daily')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        ledgerViewMode === 'daily'
                          ? 'bg-teal-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-navy-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>1. Day-by-Day Ledger (দৈনিক খতিয়ান)</span>
                      {ledgerData?.groupedByDay?.length > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white">
                          {ledgerData.groupedByDay.length} Days
                        </span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setLedgerViewMode('transactions')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        ledgerViewMode === 'transactions'
                          ? 'bg-teal-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-navy-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>2. Transaction-by-Transaction (বিস্তারিত লেনদেন)</span>
                      {ledgerData?.activities?.length > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white">
                          {ledgerData.activities.length} Trx
                        </span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setLedgerViewMode('summary')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        ledgerViewMode === 'summary'
                          ? 'bg-teal-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-navy-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Scale className="w-3.5 h-3.5" />
                      <span>3. Summary & Financial Position (সারসংক্ষেপ)</span>
                    </button>
                  </div>

                  {/* Expand / Collapse All Controls */}
                  {ledgerViewMode === 'daily' && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={expandAllDays}
                        className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 font-semibold text-[11px]"
                      >
                        Expand All Days
                      </button>
                      <button
                        type="button"
                        onClick={collapseAllDays}
                        className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 font-semibold text-[11px]"
                      >
                        Collapse All
                      </button>
                    </div>
                  )}
                </div>

                {/* OPENING BALANCE BANNER (If date range is active) */}
                {Number(ledgerData?.openingBalance || 0) !== 0 && (
                  <div className="p-3 rounded-xl bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white text-xs">
                          Opening Balance Brought Forward (প্রারম্ভিক ব্যালেন্স):
                        </span>
                        <span className="text-[10px] text-slate-500 ml-1">
                          Calculated prior to {ledgerStartDate}
                        </span>
                      </div>
                    </div>
                    <div className="font-mono font-black text-sm text-slate-900 dark:text-white">
                      ৳{Math.abs(Number(ledgerData.openingBalance)).toLocaleString()}{' '}
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                        Number(ledgerData.openingBalance) > 0
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}>
                        {Number(ledgerData.openingBalance) > 0 ? 'RECEIVABLE (পাওনা)' : 'PAYABLE (দেনা)'}
                      </span>
                    </div>
                  </div>
                )}

                {/* ================================================================= */}
                {/* VIEW 1: DAY-BY-DAY ACCORDION & DAILY SUMMARIES                     */}
                {/* ================================================================= */}
                {ledgerViewMode === 'daily' && (
                  <div className="space-y-4">
                    {loadingLedger ? (
                      <div className="py-12 text-center text-slate-400 bg-white dark:bg-navy-950 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-teal-500" />
                        <span className="font-semibold">Loading day-by-day partner ledger...</span>
                      </div>
                    ) : !ledgerData?.groupedByDay || ledgerData.groupedByDay.length === 0 ? (
                      <div className="py-12 text-center text-slate-400 bg-white dark:bg-navy-950 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <Calendar className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
                        <p className="font-bold text-slate-600 dark:text-slate-400">No transactions recorded matching your search / filters.</p>
                        <p className="text-[11px] text-slate-400 mt-1">Try resetting filters or selecting &quot;All Time&quot;.</p>
                      </div>
                    ) : (
                      ledgerData.groupedByDay.map((group: any) => {
                        const isExpanded = expandedDays[group.date] !== false; // default true

                        return (
                          <div
                            key={group.date}
                            className="bg-white dark:bg-navy-950 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs"
                          >
                            {/* Day Header Bar (Expandable Accordion) */}
                            <div
                              onClick={() => toggleDayExpand(group.date)}
                              className="px-4 py-3 bg-slate-50 dark:bg-navy-900 hover:bg-slate-100/80 dark:hover:bg-navy-800/80 cursor-pointer border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 transition-colors select-none"
                            >
                              <div className="flex items-center gap-2">
                                {isExpanded ? (
                                  <ChevronDown className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                                ) : (
                                  <ChevronRight className="w-4 h-4 text-slate-400" />
                                )}
                                <span className="font-black text-slate-900 dark:text-white text-xs sm:text-sm">
                                  📅 {group.dayFullFormatted}
                                </span>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-navy-800 text-slate-700 dark:text-slate-300 font-mono font-bold">
                                  {group.transactionCount} Trx
                                </span>
                              </div>

                              {/* Quick day summary tags */}
                              <div className="flex items-center gap-1.5 flex-wrap text-[10px] font-bold">
                                {group.totalPurchases > 0 && (
                                  <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60">
                                    Purchases: ৳{group.totalPurchases.toLocaleString()}
                                  </span>
                                )}
                                {group.totalSales > 0 && (
                                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60">
                                    Sales: ৳{group.totalSales.toLocaleString()}
                                  </span>
                                )}
                                {group.totalCollections > 0 && (
                                  <span className="px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-900/60">
                                    Received: ৳{group.totalCollections.toLocaleString()}
                                  </span>
                                )}
                                {group.totalPaymentsPaid > 0 && (
                                  <span className="px-2 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-900/60">
                                    Paid: ৳{group.totalPaymentsPaid.toLocaleString()}
                                  </span>
                                )}
                                <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-navy-800 text-slate-800 dark:text-slate-200 font-mono">
                                  Day Close: ৳{Math.abs(group.closingBalance).toLocaleString()} {group.closingBalance > 0 ? 'Dr' : group.closingBalance < 0 ? 'Cr' : ''}
                                </span>
                              </div>
                            </div>

                            {/* Collapsible Content */}
                            {isExpanded && (
                              <div className="p-0">
                                {/* Transactions Table */}
                                <div className="overflow-x-auto">
                                  <table className="w-full text-left text-xs">
                                    <thead className="bg-slate-50/70 dark:bg-navy-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase text-[9.5px]">
                                      <tr>
                                        <th className="py-2 px-3">Time</th>
                                        <th className="py-2 px-3">Type</th>
                                        <th className="py-2 px-3">Reference #</th>
                                        <th className="py-2 px-3">Description / Item</th>
                                        <th className="py-2 px-3">Branch</th>
                                        <th className="py-2 px-3 text-right">Debit (৳)</th>
                                        <th className="py-2 px-3 text-right">Credit (৳)</th>
                                        <th className="py-2 px-3 text-right">Running Balance</th>
                                        <th className="py-2 px-2 text-center w-8">Details</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                                      {group.activities.map((act: any) => {
                                        const isTrxExpanded = expandedTransactions[act.id] === true;
                                        const isSale = act.activity_type === 'sale_delivery';
                                        const isCollection = act.activity_type === 'sale_collection';
                                        const isPurchase = act.activity_type === 'purchase_inward';
                                        const isPaymentOut = act.activity_type === 'purchase_payment';

                                        return (
                                          <React.Fragment key={act.id}>
                                            <tr
                                              onClick={() => toggleTransactionExpand(act.id)}
                                              className={`hover:bg-slate-50/70 dark:hover:bg-navy-900/50 cursor-pointer transition-colors ${
                                                isTrxExpanded ? 'bg-slate-50 dark:bg-navy-900/60' : ''
                                              }`}
                                            >
                                              <td className="py-2 px-3 font-mono text-slate-500 whitespace-nowrap text-[11px]">
                                                {new Date(act.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                                              </td>
                                              <td className="py-2 px-3 whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                                  isSale
                                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                                    : isCollection
                                                    ? 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                                                    : isPurchase
                                                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                                    : 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                                                }`}>
                                                  {act.type_code}
                                                </span>
                                              </td>
                                              <td className="py-2 px-3 font-mono font-bold text-slate-900 dark:text-white text-[11px] whitespace-nowrap">
                                                {act.doc_no}
                                              </td>
                                              <td className="py-2 px-3">
                                                <div className="font-semibold text-slate-900 dark:text-white text-[11px]">
                                                  {act.product_name || act.title}
                                                </div>
                                                {act.serial_number && (
                                                  <div className="font-mono text-[10px] text-sky-600 dark:text-cyan-400 font-bold">
                                                    SN: {act.serial_number}
                                                  </div>
                                                )}
                                              </td>
                                              <td className="py-2 px-3 text-slate-600 dark:text-slate-400 whitespace-nowrap text-[11px]">
                                                {act.branch_name}
                                              </td>
                                              <td className="py-2 px-3 text-right font-mono font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                                                {act.debit > 0 ? `৳${act.debit.toLocaleString()}` : '—'}
                                              </td>
                                              <td className="py-2 px-3 text-right font-mono font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                                                {act.credit > 0 ? `৳${act.credit.toLocaleString()}` : '—'}
                                              </td>
                                              <td className="py-2 px-3 text-right font-mono font-bold whitespace-nowrap">
                                                <span className={
                                                  act.running_balance > 0
                                                    ? 'text-emerald-600 dark:text-emerald-400'
                                                    : act.running_balance < 0
                                                    ? 'text-rose-600 dark:text-rose-400'
                                                    : 'text-slate-500'
                                                }>
                                                  ৳{Math.abs(act.running_balance).toLocaleString()} {act.running_balance > 0 ? 'Dr' : act.running_balance < 0 ? 'Cr' : ''}
                                                </span>
                                              </td>
                                              <td className="py-2 px-2 text-center">
                                                <button
                                                  type="button"
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleTransactionExpand(act.id);
                                                  }}
                                                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                                                >
                                                  {isTrxExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                                                </button>
                                              </td>
                                            </tr>

                                            {/* EXPANDED TRANSACTION DETAIL CARD */}
                                            {isTrxExpanded && (
                                              <tr className="bg-slate-50/90 dark:bg-navy-900/90">
                                                <td colSpan={9} className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-800">
                                                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-[11px]">
                                                    {/* Block 1: Transaction Metadata */}
                                                    <div className="space-y-1 p-2.5 rounded-xl bg-white dark:bg-navy-950 border border-slate-200 dark:border-slate-800">
                                                      <span className="font-bold text-slate-400 uppercase text-[9px] block">
                                                        Transaction Profile
                                                      </span>
                                                      <div>Type: <strong>{act.type_display}</strong></div>
                                                      <div>Doc / Ref: <strong className="font-mono">{act.doc_no}</strong></div>
                                                      <div>Date: <strong>{new Date(act.date).toLocaleDateString()} {new Date(act.date).toLocaleTimeString()}</strong></div>
                                                      <div>Staff / Handler: <strong>{act.staff_name || 'System'}</strong></div>
                                                    </div>

                                                    {/* Block 2: Product & Hardware Info */}
                                                    <div className="space-y-1 p-2.5 rounded-xl bg-white dark:bg-navy-950 border border-slate-200 dark:border-slate-800">
                                                      <span className="font-bold text-slate-400 uppercase text-[9px] block">
                                                        Product & Hardware SKU
                                                      </span>
                                                      <div className="font-bold text-slate-900 dark:text-white truncate">{act.product_name || '—'}</div>
                                                      {act.serial_number && <div>Serial (S/N): <strong className="font-mono text-cyan-600">{act.serial_number}</strong></div>}
                                                      {act.sku && <div>SKU: <strong className="font-mono">{act.sku}</strong></div>}
                                                      <div>Quantity: <strong>{act.quantity || 1} Unit(s)</strong> @ ৳{Number(act.unit_price || 0).toLocaleString()}</div>
                                                    </div>

                                                    {/* Block 3: Payment & Settlement */}
                                                    <div className="space-y-1 p-2.5 rounded-xl bg-white dark:bg-navy-950 border border-slate-200 dark:border-slate-800">
                                                      <span className="font-bold text-slate-400 uppercase text-[9px] block">
                                                        Financial Settlement
                                                      </span>
                                                      <div>Total Amount: <strong>৳{act.total_value.toLocaleString()}</strong></div>
                                                      <div>Paid: <strong className="text-emerald-600">৳{Number(act.paid_amount || 0).toLocaleString()}</strong></div>
                                                      <div>Due / On Lend: <strong className="text-rose-600">৳{Number(act.due_amount || 0).toLocaleString()}</strong></div>
                                                      <div>Method: <strong>{act.payment_method}</strong> {act.payment_reference ? `(${act.payment_reference})` : ''}</div>
                                                    </div>

                                                    {/* Block 4: Target House & Notes */}
                                                    <div className="space-y-1 p-2.5 rounded-xl bg-white dark:bg-navy-950 border border-slate-200 dark:border-slate-800">
                                                      <span className="font-bold text-slate-400 uppercase text-[9px] block">
                                                        Partner & Remarks
                                                      </span>
                                                      <div>Partner: <strong>{act.house_name}</strong></div>
                                                      <div>Branch: <strong>{act.branch_name}</strong></div>
                                                      {act.warranty_period && <div>Warranty: <strong>{act.warranty_period}</strong></div>}
                                                      {act.notes && <div className="text-slate-500 italic mt-0.5">Notes: {act.notes}</div>}
                                                    </div>
                                                  </div>
                                                </td>
                                              </tr>
                                            )}
                                          </React.Fragment>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>

                                {/* Daily Summary Footer Box */}
                                <div className="px-4 py-2.5 bg-slate-50 dark:bg-navy-900/60 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                                  <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
                                    <span>Daily Summary:</span>
                                    {group.totalPurchases > 0 && <span>Purchases: <strong>৳{group.totalPurchases.toLocaleString()}</strong></span>}
                                    {group.totalSales > 0 && <span>• Sales: <strong>৳{group.totalSales.toLocaleString()}</strong></span>}
                                    {group.totalCollections > 0 && <span>• Collected: <strong className="text-emerald-600">৳{group.totalCollections.toLocaleString()}</strong></span>}
                                    {group.totalPaymentsPaid > 0 && <span>• Paid to House: <strong className="text-sky-600">৳{group.totalPaymentsPaid.toLocaleString()}</strong></span>}
                                  </div>

                                  <div className="font-mono font-bold text-slate-900 dark:text-white">
                                    Day Closing Balance: ৳{Math.abs(group.closingBalance).toLocaleString()}{' '}
                                    <span className={group.closingBalance > 0 ? 'text-emerald-600' : group.closingBalance < 0 ? 'text-rose-600' : 'text-slate-500'}>
                                      ({group.closingBalance > 0 ? 'RECEIVABLE / পাওনা' : group.closingBalance < 0 ? 'PAYABLE / দেনা' : 'SETTLED'})
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}

                {/* ================================================================= */}
                {/* VIEW 2: CONTINUOUS TRANSACTION-BY-TRANSACTION LEDGER TABLE         */}
                {/* ================================================================= */}
                {ledgerViewMode === 'transactions' && (
                  <div className="bg-white dark:bg-navy-950 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 dark:bg-navy-900 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px]">
                          <tr>
                            <th className="py-3 px-3">Date</th>
                            <th className="py-3 px-3">Time</th>
                            <th className="py-3 px-3">Type</th>
                            <th className="py-3 px-3">Reference #</th>
                            <th className="py-3 px-3">Product / Description</th>
                            <th className="py-3 px-3">Partner House</th>
                            <th className="py-3 px-3 text-right">Debit (৳)</th>
                            <th className="py-3 px-3 text-right">Credit (৳)</th>
                            <th className="py-3 px-3 text-right">Running Balance</th>
                            <th className="py-3 px-2 text-center w-8">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                          {/* Opening Balance row */}
                          {Number(ledgerData?.openingBalance || 0) !== 0 && (
                            <tr className="bg-slate-100/80 dark:bg-navy-900/80 font-bold">
                              <td colSpan={6} className="py-2.5 px-3 italic text-slate-800 dark:text-slate-200">
                                ⭐ Opening Balance Brought Forward (পূর্ববর্তী প্রারম্ভিক জের)
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono">
                                {Number(ledgerData.openingBalance) > 0 ? `৳${Math.abs(Number(ledgerData.openingBalance)).toLocaleString()}` : '—'}
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono">
                                {Number(ledgerData.openingBalance) < 0 ? `৳${Math.abs(Number(ledgerData.openingBalance)).toLocaleString()}` : '—'}
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono font-black">
                                ৳{Math.abs(Number(ledgerData.openingBalance)).toLocaleString()} {Number(ledgerData.openingBalance) > 0 ? 'Dr' : 'Cr'}
                              </td>
                              <td></td>
                            </tr>
                          )}

                          {loadingLedger ? (
                            <tr>
                              <td colSpan={10} className="py-12 text-center text-slate-400">
                                <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-teal-500" />
                                <span>Loading transaction ledger records...</span>
                              </td>
                            </tr>
                          ) : !ledgerData?.activities || ledgerData.activities.length === 0 ? (
                            <tr>
                              <td colSpan={10} className="py-12 text-center text-slate-400">
                                No transaction activities found for the selected house and date range.
                              </td>
                            </tr>
                          ) : (
                            ledgerData.activities.map((act: any) => {
                              const isTrxExpanded = expandedTransactions[act.id] === true;
                              const isSale = act.activity_type === 'sale_delivery';
                              const isCollection = act.activity_type === 'sale_collection';
                              const isPurchase = act.activity_type === 'purchase_inward';
                              const isPaymentOut = act.activity_type === 'purchase_payment';

                              return (
                                <React.Fragment key={act.id}>
                                  <tr
                                    onClick={() => toggleTransactionExpand(act.id)}
                                    className={`hover:bg-slate-50/70 dark:hover:bg-navy-900/50 cursor-pointer transition-colors ${
                                      isTrxExpanded ? 'bg-slate-50 dark:bg-navy-900/60' : ''
                                    }`}
                                  >
                                    <td className="py-2.5 px-3 font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap text-[11px]">
                                      {new Date(act.date).toLocaleDateString('en-GB')}
                                    </td>
                                    <td className="py-2.5 px-3 font-mono text-slate-500 whitespace-nowrap text-[11px]">
                                      {new Date(act.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                                    </td>
                                    <td className="py-2.5 px-3 whitespace-nowrap">
                                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                        isSale
                                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                          : isCollection
                                          ? 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                                          : isPurchase
                                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                          : 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                                      }`}>
                                        {act.type_code}
                                      </span>
                                    </td>
                                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900 dark:text-white text-[11px] whitespace-nowrap">
                                      {act.doc_no}
                                    </td>
                                    <td className="py-2.5 px-3">
                                      <div className="font-semibold text-slate-900 dark:text-white text-[11px]">
                                        {act.product_name || act.title}
                                      </div>
                                      {act.serial_number && (
                                        <div className="font-mono text-[10px] text-sky-600 dark:text-cyan-400 font-bold">
                                          SN: {act.serial_number}
                                        </div>
                                      )}
                                    </td>
                                    <td className="py-2.5 px-3 font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                                      {act.house_name}
                                    </td>
                                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                                      {act.debit > 0 ? `৳${act.debit.toLocaleString()}` : '—'}
                                    </td>
                                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                                      {act.credit > 0 ? `৳${act.credit.toLocaleString()}` : '—'}
                                    </td>
                                    <td className="py-2.5 px-3 text-right font-mono font-bold whitespace-nowrap">
                                      <span className={
                                        act.running_balance > 0
                                          ? 'text-emerald-600 dark:text-emerald-400'
                                          : act.running_balance < 0
                                          ? 'text-rose-600 dark:text-rose-400'
                                          : 'text-slate-500'
                                      }>
                                        ৳{Math.abs(act.running_balance).toLocaleString()} {act.running_balance > 0 ? 'Dr' : act.running_balance < 0 ? 'Cr' : ''}
                                      </span>
                                    </td>
                                    <td className="py-2.5 px-2 text-center">
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleTransactionExpand(act.id);
                                        }}
                                        className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                                      >
                                        {isTrxExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                                      </button>
                                    </td>
                                  </tr>

                                  {/* Deep Transaction Expansion Row */}
                                  {isTrxExpanded && (
                                    <tr className="bg-slate-50/90 dark:bg-navy-900/90">
                                      <td colSpan={10} className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-800">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-[11px]">
                                          <div className="space-y-1 p-2.5 rounded-xl bg-white dark:bg-navy-950 border border-slate-200 dark:border-slate-800">
                                            <span className="font-bold text-slate-400 uppercase text-[9px] block">Transaction Profile</span>
                                            <div>Type: <strong>{act.type_display}</strong></div>
                                            <div>Doc / Ref: <strong className="font-mono">{act.doc_no}</strong></div>
                                            <div>Timestamp: <strong>{new Date(act.date).toLocaleString()}</strong></div>
                                            <div>Staff: <strong>{act.staff_name || 'Store Executive'}</strong></div>
                                          </div>

                                          <div className="space-y-1 p-2.5 rounded-xl bg-white dark:bg-navy-950 border border-slate-200 dark:border-slate-800">
                                            <span className="font-bold text-slate-400 uppercase text-[9px] block">Product & Serial Details</span>
                                            <div className="font-bold text-slate-900 dark:text-white truncate">{act.product_name || '—'}</div>
                                            {act.serial_number && <div>S/N: <strong className="font-mono text-cyan-600">{act.serial_number}</strong></div>}
                                            {act.sku && <div>SKU: <strong className="font-mono">{act.sku}</strong></div>}
                                            <div>Qty: <strong>{act.quantity || 1}</strong> @ ৳{Number(act.unit_price || 0).toLocaleString()}</div>
                                          </div>

                                          <div className="space-y-1 p-2.5 rounded-xl bg-white dark:bg-navy-950 border border-slate-200 dark:border-slate-800">
                                            <span className="font-bold text-slate-400 uppercase text-[9px] block">Payment Breakdown</span>
                                            <div>Total: <strong>৳{act.total_value.toLocaleString()}</strong></div>
                                            <div>Paid: <strong className="text-emerald-600">৳{Number(act.paid_amount || 0).toLocaleString()}</strong></div>
                                            <div>Due: <strong className="text-rose-600">৳{Number(act.due_amount || 0).toLocaleString()}</strong></div>
                                            <div>Via: <strong>{act.payment_method}</strong></div>
                                          </div>

                                          <div className="space-y-1 p-2.5 rounded-xl bg-white dark:bg-navy-950 border border-slate-200 dark:border-slate-800">
                                            <span className="font-bold text-slate-400 uppercase text-[9px] block">House & Remarks</span>
                                            <div>Partner: <strong>{act.house_name}</strong></div>
                                            <div>Branch: <strong>{act.branch_name}</strong></div>
                                            {act.notes && <div className="text-slate-500 italic mt-0.5">Notes: {act.notes}</div>}
                                          </div>
                                        </div>
                                      </td>
                                    </tr>
                                  )}
                                </React.Fragment>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* ================================================================= */}
                {/* VIEW 3: SUMMARY OVERVIEW & FINANCIAL POSITION                     */}
                {/* ================================================================= */}
                {ledgerViewMode === 'summary' && (
                  <div className="space-y-4">
                    {/* Partner House Info Card (If single house selected) */}
                    {ledgerData?.house && (
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                          Target Partner Shop / House
                        </span>
                        <h4 className="font-bold text-slate-900 dark:text-white text-base">
                          {ledgerData.house.name}
                        </h4>
                        <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400 flex-wrap">
                          {ledgerData.house.contact_person && (
                            <span>Contact Person: <strong>{ledgerData.house.contact_person}</strong></span>
                          )}
                          {ledgerData.house.phone && (
                            <span>Phone Number: <strong className="font-mono">{ledgerData.house.phone}</strong></span>
                          )}
                          {ledgerData.house.address && (
                            <span>Address: {ledgerData.house.address}</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* KPI Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {/* Purchases */}
                      <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 space-y-1">
                        <div className="flex items-center justify-between text-amber-800 dark:text-amber-300 font-bold text-xs">
                          <span className="flex items-center gap-1">
                            <ArrowDownLeft className="w-4 h-4 text-amber-600" />
                            <span>Purchases (ক্রয় / দেনা)</span>
                          </span>
                          <span className="text-[10px] bg-amber-200/60 dark:bg-amber-900/60 px-1.5 py-0.5 rounded font-mono">
                            {ledgerData?.summary?.totalPurchasesCount || 0} Units
                          </span>
                        </div>
                        <div className="text-xl font-black text-amber-900 dark:text-amber-200">
                          ৳{Number(ledgerData?.summary?.totalPurchasesCost || 0).toLocaleString()}
                        </div>
                        <div className="flex justify-between text-[10px] text-amber-800 dark:text-amber-300 pt-1 border-t border-amber-200/60">
                          <span>Paid: ৳{Number(ledgerData?.summary?.totalPurchasesPaid || 0).toLocaleString()}</span>
                          <span className="font-bold text-rose-600">Due: ৳{Number(ledgerData?.summary?.totalPurchasesCost - ledgerData?.summary?.totalPurchasesPaid || 0).toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Sales */}
                      <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 space-y-1">
                        <div className="flex items-center justify-between text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                          <span className="flex items-center gap-1">
                            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                            <span>Sales (বিক্রয় / পাওনা)</span>
                          </span>
                          <span className="text-[10px] bg-emerald-200/60 dark:bg-emerald-900/60 px-1.5 py-0.5 rounded font-mono">
                            {ledgerData?.summary?.totalSalesCount || 0} Units
                          </span>
                        </div>
                        <div className="text-xl font-black text-emerald-900 dark:text-emerald-200">
                          ৳{Number(ledgerData?.summary?.totalSalesAmount || 0).toLocaleString()}
                        </div>
                        <div className="flex justify-between text-[10px] text-emerald-800 dark:text-emerald-300 pt-1 border-t border-emerald-200/60">
                          <span>Collected: ৳{Number(ledgerData?.summary?.totalSalesPaid || 0).toLocaleString()}</span>
                          <span className="font-bold text-emerald-700">Due: ৳{Number(ledgerData?.summary?.totalSalesAmount - ledgerData?.summary?.totalSalesPaid || 0).toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Cash Received */}
                      <div className="p-4 rounded-2xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900/60 space-y-1">
                        <div className="flex items-center justify-between text-teal-800 dark:text-teal-300 font-bold text-xs">
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4 text-teal-600" />
                            <span>Total Cash Received</span>
                          </span>
                        </div>
                        <div className="text-xl font-black text-teal-900 dark:text-teal-200">
                          ৳{Number(ledgerData?.summary?.totalSalesPaid || 0).toLocaleString()}
                        </div>
                        <p className="text-[10px] text-teal-800 dark:text-teal-300 pt-1 border-t border-teal-200/60">
                          Cash in from shop collections
                        </p>
                      </div>

                      {/* Net Balance Position */}
                      {(() => {
                        const net = Number(ledgerData?.summary?.netBalance ?? 0);
                        const isReceivable = net > 0;
                        const isPayable = net < 0;

                        return (
                          <div className={`p-4 rounded-2xl border space-y-1 ${
                            isReceivable
                              ? 'bg-emerald-100/70 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800'
                              : isPayable
                              ? 'bg-rose-100/70 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800'
                              : 'bg-slate-100 dark:bg-navy-950 border-slate-300 dark:border-slate-800'
                          }`}>
                            <div className="flex items-center justify-between font-bold text-xs">
                              <span className="flex items-center gap-1">
                                <Scale className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                                <span>Closing Net Position</span>
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                isReceivable
                                  ? 'bg-emerald-600 text-white'
                                  : isPayable
                                  ? 'bg-rose-600 text-white'
                                  : 'bg-slate-200 text-slate-800'
                              }`}>
                                {isReceivable ? 'Receivable (পাওনা)' : isPayable ? 'Payable (দেনা)' : 'Settled (০)'}
                              </span>
                            </div>
                            <div className={`text-xl font-black ${
                              isReceivable ? 'text-emerald-900 dark:text-emerald-200' : isPayable ? 'text-rose-900 dark:text-rose-200' : 'text-slate-900 dark:text-white'
                            }`}>
                              ৳{Math.abs(net).toLocaleString()}
                            </div>
                            <p className="text-[10px] text-slate-600 dark:text-slate-400 pt-1 border-t border-slate-200/60 truncate">
                              {isReceivable
                                ? `${ledgerData?.house?.name || 'House'} owes Corenix net ৳${Math.abs(net).toLocaleString()}`
                                : isPayable
                                ? `Corenix owes ${ledgerData?.house?.name || 'House'} net ৳${Math.abs(net).toLocaleString()}`
                                : 'All balances between Corenix and House are fully cleared.'}
                            </p>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}

                {/* ================================================================= */}
                {/* BOTTOM COMPLETE PERIOD SUMMARY CARD                               */}
                {/* ================================================================= */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                    <span className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <Scale className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                      <span>Complete Period Accounting Summary (হিসাব বিবরণী সারসংক্ষেপ)</span>
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">
                      Period: {ledgerStartDate || 'Beginning'} → {ledgerEndDate || 'Present'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-center">
                    <div className="p-2.5 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 font-bold block">Opening Balance</span>
                      <span className="text-xs font-black font-mono text-slate-900 dark:text-white">
                        ৳{Math.abs(Number(ledgerData?.openingBalance || 0)).toLocaleString()}{' '}
                        <span className="text-[9px] opacity-75">{Number(ledgerData?.openingBalance || 0) > 0 ? 'Dr' : Number(ledgerData?.openingBalance || 0) < 0 ? 'Cr' : ''}</span>
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 font-bold block">Total Purchases</span>
                      <span className="text-xs font-black font-mono text-amber-600 dark:text-amber-400">
                        ৳{Number(ledgerData?.summary?.totalPurchasesCost || 0).toLocaleString()}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 font-bold block">Total Sales</span>
                      <span className="text-xs font-black font-mono text-emerald-600 dark:text-emerald-400">
                        ৳{Number(ledgerData?.summary?.totalSalesAmount || 0).toLocaleString()}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 font-bold block">Cash Received</span>
                      <span className="text-xs font-black font-mono text-teal-600 dark:text-teal-400">
                        ৳{Number(ledgerData?.summary?.totalSalesPaid || 0).toLocaleString()}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 font-bold block">Paid to House</span>
                      <span className="text-xs font-black font-mono text-sky-600 dark:text-sky-400">
                        ৳{Number(ledgerData?.summary?.totalPurchasesPaid || 0).toLocaleString()}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800">
                      <span className="text-[10px] text-teal-700 dark:text-teal-300 font-bold block">Closing Balance</span>
                      <span className={`text-xs font-black font-mono ${
                        Number(ledgerData?.summary?.netBalance ?? 0) > 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : Number(ledgerData?.summary?.netBalance ?? 0) < 0
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-slate-900 dark:text-white'
                      }`}>
                        ৳{Math.abs(Number(ledgerData?.summary?.netBalance ?? 0)).toLocaleString()}{' '}
                        <span className="text-[9px]">{Number(ledgerData?.summary?.netBalance ?? 0) > 0 ? 'Dr' : Number(ledgerData?.summary?.netBalance ?? 0) < 0 ? 'Cr' : ''}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-5 py-3 sm:px-6 sm:py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-navy-950 shrink-0 flex items-center justify-between gap-2.5">
                <span className="text-[11px] text-slate-400 hidden sm:inline">
                  Tip: Toggle between Day-by-Day, Detailed Transactions, and Summary views above.
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={exportLedgerToCSV}
                    className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsLedgerModalOpen(false)}
                    className="px-3.5 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Statement</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}


export default function AdminPurchasesPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Loading Purchases & Sourcing Module...</span>
        </div>
      }
    >
      <PurchasesContent />
    </Suspense>
  );
}
