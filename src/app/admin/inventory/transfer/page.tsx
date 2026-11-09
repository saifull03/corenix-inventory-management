'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowRightLeft,
  Warehouse,
  Building2,
  Package,
  Search,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Truck,
  FileText,
  Printer,
  ChevronRight,
  AlertTriangle,
  RefreshCw,
  Eye,
  SlidersHorizontal,
  X,
  QrCode,
  ShieldCheck,
  ArrowRight,
  Barcode,
  Check,
  Info,
  Layers,
  Edit3
} from 'lucide-react';

interface Branch {
  id: number;
  name: string;
  code: string;
  address?: string;
  phone?: string;
}

interface SerialItem {
  id: number;
  product_id?: number;
  serial_number: string;
  barcode?: string;
  status?: string;
}

interface ProductItem {
  id: number;
  name: string;
  sku: string;
  barcode?: string;
  model?: string;
  selling_price: number;
  purchase_cost: number;
  category_name?: string;
  brand_name?: string;
  branch_stock: number;
  available_stock: number;
  image?: string;
  requires_serial: boolean;
  serials?: SerialItem[];
}

interface ManifestItem {
  product: ProductItem;
  quantity: number;
  selectedSerials: string[];
}

interface TransferRecord {
  id: number;
  transfer_number: string;
  from_branch_id: number;
  to_branch_id: number;
  from_branch_name: string;
  from_branch_code: string;
  to_branch_name: string;
  to_branch_code: string;
  status: 'pending' | 'in_transit' | 'received' | 'cancelled';
  notes?: string;
  created_by_name?: string;
  item_count: number;
  total_quantity: number;
  created_at: string;
  received_at?: string;
  items?: any[];
}

export default function StockTransferPage() {
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');
  const [branches, setBranches] = useState<Branch[]>([]);
  const [fromBranchId, setFromBranchId] = useState<number>(1);
  const [toBranchId, setToBranchId] = useState<number>(2);

  // Search & Catalog
  const [searchQuery, setSearchQuery] = useState('');
  const [availableProducts, setAvailableProducts] = useState<ProductItem[]>([]);
  const [searchingProducts, setSearchingProducts] = useState(false);

  // Serial Selection POPUP Modal
  const [serialModalProduct, setSerialModalProduct] = useState<ProductItem | null>(null);
  const [modalSelectedSerials, setModalSelectedSerials] = useState<string[]>([]);
  const [modalSerialSearch, setModalSerialSearch] = useState('');

  // Cart / Manifest
  const [manifest, setManifest] = useState<ManifestItem[]>([]);
  const [transferMode, setTransferMode] = useState<'received' | 'in_transit'>('received');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successTransfer, setSuccessTransfer] = useState<{ id: number; number: string; status: string } | null>(null);

  // History state
  const [transfers, setTransfers] = useState<TransferRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyStatusFilter, setHistoryStatusFilter] = useState('all');
  const [historySearch, setHistorySearch] = useState('');
  const [selectedTransferDetail, setSelectedTransferDetail] = useState<any | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // 1. Load branches
  useEffect(() => {
    fetch('/api/admin/branches')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.branches?.length > 0) {
          setBranches(data.branches);
          setFromBranchId(data.branches[0].id);
          if (data.branches.length > 1) {
            setToBranchId(data.branches[1].id);
          }
        }
      })
      .catch((err) => console.error('Failed to load branches:', err));
  }, []);

  // 2. Fetch products available at the selected source branch
  const fetchProductsForSource = async () => {
    if (!fromBranchId) return;
    try {
      setSearchingProducts(true);
      const res = await fetch(
        `/api/admin/transfers/products?branch_id=${fromBranchId}&search=${encodeURIComponent(searchQuery)}`
      );
      const data = await res.json();
      if (data.success) {
        setAvailableProducts(data.products || []);
      }
    } catch (e) {
      console.error('Error fetching transfer products:', e);
    } finally {
      setSearchingProducts(false);
    }
  };

  useEffect(() => {
    fetchProductsForSource();
  }, [fromBranchId, searchQuery]);

  // 3. Reset manifest if source branch changes
  const handleFromBranchChange = (newBranchId: number) => {
    if (newBranchId !== fromBranchId) {
      if (manifest.length > 0) {
        if (confirm('Changing source location will clear currently added items. Proceed?')) {
          setFromBranchId(newBranchId);
          setManifest([]);
          if (toBranchId === newBranchId) {
            const other = branches.find((b) => b.id !== newBranchId);
            if (other) setToBranchId(other.id);
          }
        }
      } else {
        setFromBranchId(newBranchId);
        if (toBranchId === newBranchId) {
          const other = branches.find((b) => b.id !== newBranchId);
          if (other) setToBranchId(other.id);
        }
      }
    }
  };

  // 4. Open Serial Popup Modal for a Product
  const openSerialModal = (prod: ProductItem) => {
    setSerialModalProduct(prod);
    setModalSerialSearch('');
    const existing = manifest.find((m) => m.product.id === prod.id);
    if (existing) {
      setModalSelectedSerials([...existing.selectedSerials]);
    } else {
      if (prod.serials && prod.serials.length > 0) {
        setModalSelectedSerials([prod.serials[0].serial_number]);
      } else {
        setModalSelectedSerials([]);
      }
    }
  };

  // 5. Handle direct product add from catalog
  const handleProductClick = (prod: ProductItem) => {
    if (prod.requires_serial && prod.serials && prod.serials.length > 0) {
      openSerialModal(prod);
    } else {
      const existingIndex = manifest.findIndex((m) => m.product.id === prod.id);
      if (existingIndex >= 0) {
        const current = manifest[existingIndex];
        if (current.quantity < prod.available_stock) {
          const next = [...manifest];
          next[existingIndex] = {
            ...current,
            quantity: current.quantity + 1,
          };
          setManifest(next);
        }
      } else {
        setManifest([
          ...manifest,
          {
            product: prod,
            quantity: 1,
            selectedSerials: [],
          },
        ]);
      }
    }
  };

  // 6. Confirm & Apply Serial Modal Selection
  const applyModalSerials = () => {
    if (!serialModalProduct) return;

    if (serialModalProduct.requires_serial && modalSelectedSerials.length === 0) {
      alert(`Please select at least 1 serial number for "${serialModalProduct.name}".`);
      return;
    }

    const qty = Math.max(1, modalSelectedSerials.length);
    const existingIndex = manifest.findIndex((m) => m.product.id === serialModalProduct.id);

    if (existingIndex >= 0) {
      const next = [...manifest];
      next[existingIndex] = {
        ...next[existingIndex],
        quantity: qty,
        selectedSerials: modalSelectedSerials,
      };
      setManifest(next);
    } else {
      setManifest([
        ...manifest,
        {
          product: serialModalProduct,
          quantity: qty,
          selectedSerials: modalSelectedSerials,
        },
      ]);
    }

    setSerialModalProduct(null);
  };

  // 7. Toggle serial in modal
  const toggleModalSerial = (serialNumber: string) => {
    if (modalSelectedSerials.includes(serialNumber)) {
      setModalSelectedSerials(modalSelectedSerials.filter((s) => s !== serialNumber));
    } else {
      setModalSelectedSerials([...modalSelectedSerials, serialNumber]);
    }
  };

  // 8. Auto-Pick All in modal
  const selectAllModalSerials = () => {
    if (!serialModalProduct?.serials) return;
    setModalSelectedSerials(serialModalProduct.serials.map((s) => s.serial_number));
  };

  // 9. Update quantity in manifest for non-serialized items
  const updateManifestQuantity = (productId: number, newQty: number) => {
    setManifest((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          const cappedQty = Math.max(1, Math.min(item.product.available_stock, newQty));
          let updatedSerials = [...item.selectedSerials];
          if (item.product.requires_serial && item.product.serials) {
            if (updatedSerials.length < cappedQty) {
              for (const s of item.product.serials) {
                if (!updatedSerials.includes(s.serial_number) && updatedSerials.length < cappedQty) {
                  updatedSerials.push(s.serial_number);
                }
              }
            } else if (updatedSerials.length > cappedQty) {
              updatedSerials = updatedSerials.slice(0, cappedQty);
            }
          }

          return {
            ...item,
            quantity: cappedQty,
            selectedSerials: updatedSerials,
          };
        }
        return item;
      })
    );
  };

  // 10. Remove item from manifest
  const removeFromManifest = (productId: number) => {
    setManifest((prev) => prev.filter((m) => m.product.id !== productId));
  };

  // 11. Submit Transfer
  const handleSubmitTransfer = async () => {
    if (fromBranchId === toBranchId) {
      alert('Source and destination locations cannot be the same.');
      return;
    }

    if (manifest.length === 0) {
      alert('Please add at least one product to transfer.');
      return;
    }

    // Check serial numbers
    for (const item of manifest) {
      if (item.product.requires_serial && item.product.serials && item.product.serials.length > 0) {
        if (item.selectedSerials.length !== item.quantity) {
          alert(
            `Serial mismatch for "${item.product.name}": ${item.quantity} units requested, but ${item.selectedSerials.length} serial numbers selected. Please click "Change Serials" to assign them.`
          );
          return;
        }
      }
    }

    try {
      setSubmitting(true);
      const payload = {
        from_branch_id: fromBranchId,
        to_branch_id: toBranchId,
        status: transferMode,
        notes: notes.trim(),
        items: manifest.map((m) => ({
          product_id: m.product.id,
          quantity: m.quantity,
          serial_numbers: m.selectedSerials,
        })),
      };

      const res = await fetch('/api/admin/transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessTransfer({
          id: data.transferId,
          number: data.transferNumber,
          status: data.status,
        });
        setManifest([]);
        setNotes('');
        fetchProductsForSource();
        fetchHistory();
      } else {
        alert(data.error || 'Failed to complete transfer.');
      }
    } catch (err: any) {
      console.error('Transfer submission error:', err);
      alert('An unexpected error occurred during transfer.');
    } finally {
      setSubmitting(false);
    }
  };

  // 12. Fetch Transfer History
  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      const res = await fetch(
        `/api/admin/transfers?status=${historyStatusFilter}&search=${encodeURIComponent(historySearch)}`
      );
      const data = await res.json();
      if (data.success) {
        setTransfers(data.transfers || []);
      }
    } catch (e) {
      console.error('Error fetching transfers history:', e);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [activeTab, historyStatusFilter, historySearch]);

  // 13. View transfer detail
  const viewTransferDetail = async (id: number) => {
    try {
      setLoadingDetail(true);
      const res = await fetch(`/api/admin/transfers/${id}`);
      const data = await res.json();
      if (data.success) {
        setSelectedTransferDetail(data.transfer);
      }
    } catch (e) {
      console.error('Failed to fetch transfer detail:', e);
    } finally {
      setLoadingDetail(false);
    }
  };

  // 14. Receive In-Transit Transfer
  const handleReceiveTransfer = async (id: number) => {
    if (!confirm('Confirm receiving this stock transfer at your branch? Inventory and serial numbers will be immediately credited.')) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/transfers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'receive' }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Stock transfer marked as received successfully! Inventory and serial numbers moved.');
        if (selectedTransferDetail && selectedTransferDetail.id === id) {
          viewTransferDetail(id);
        }
        fetchHistory();
        fetchProductsForSource();
      } else {
        alert(data.error || 'Failed to mark as received.');
      }
    } catch (e) {
      console.error('Error receiving transfer:', e);
    }
  };

  // 15. Dedicated Pure A4 Challan Print Function (Prints ONLY the Challan document)
  const printChallan = (transfer: TransferRecord | any) => {
    if (!transfer) return;

    const printWindow = window.open('', '_blank', 'width=900,height=1050');
    if (!printWindow) {
      window.print();
      return;
    }

    const itemsHtml = (transfer.items || [])
      .map(
        (it: any, idx: number) => `
        <tr>
          <td style="padding: 7px 8px; border: 1px solid #cbd5e1; text-align: center; font-family: monospace; font-size: 11px; font-weight: bold; color: #475569;">${idx + 1}</td>
          <td style="padding: 7px 8px; border: 1px solid #cbd5e1;">
            <strong style="font-size: 12px; color: #0f172a; display: block; line-height: 1.3;">${it.product_name || 'Product'}</strong>
            <span style="font-family: monospace; font-size: 10px; color: #64748b; display: block; margin-top: 2px;">SKU: ${it.sku || 'N/A'}</span>
            ${
              it.serials && it.serials.length > 0
                ? `<div style="margin-top: 5px; display: flex; flex-wrap: wrap; gap: 4px;">
                    ${it.serials
                      .map(
                        (s: string) =>
                          `<span style="display: inline-block; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 4px; padding: 2px 6px; font-family: monospace; font-size: 9.5px; font-weight: bold; color: #1e293b;">SN: ${s}</span>`
                      )
                      .join('')}
                  </div>`
                : ''
            }
          </td>
          <td style="padding: 7px 8px; border: 1px solid #cbd5e1; font-size: 11.5px; color: #334155;">${it.brand_name || it.model || '—'}</td>
          <td style="padding: 7px 8px; border: 1px solid #cbd5e1; text-align: center; font-family: monospace; font-size: 12px; font-weight: 800; color: #0f172a;">${it.quantity} Unit${it.quantity > 1 ? 's' : ''}</td>
        </tr>
      `
      )
      .join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Stock Transfer Challan - ${transfer.transfer_number}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 10mm 12mm 10mm 12mm;
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              color: #0f172a;
              background: #ffffff;
              font-size: 11.5px;
              line-height: 1.4;
              padding: 0;
              margin: 0;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .challan-container {
              width: 100%;
              max-width: 100%;
              border: none !important;
              padding: 0 !important;
              background: #ffffff;
            }
            .header-table {
              width: 100%;
              border-bottom: 2px solid #0f172a;
              padding-bottom: 12px;
              margin-bottom: 14px;
            }
            .brand-title {
              font-size: 22px;
              font-weight: 900;
              color: #0f172a;
              letter-spacing: -0.5px;
            }
            .brand-sub {
              font-size: 11px;
              color: #475569;
              margin-top: 2px;
              font-weight: 500;
            }
            .brand-addr {
              font-size: 9.5px;
              color: #64748b;
              font-family: monospace;
              margin-top: 3px;
            }
            .tracking-title {
              font-size: 9.5px;
              text-transform: uppercase;
              font-weight: bold;
              color: #64748b;
            }
            .tracking-num {
              font-family: monospace;
              font-size: 13.5px;
              font-weight: 900;
              color: #0f172a;
              margin-top: 2px;
            }
            .status-badge {
              display: inline-block;
              margin-top: 4px;
              padding: 2.5px 8px;
              border-radius: 4px;
              font-size: 9.5px;
              font-weight: 800;
              text-transform: uppercase;
              background: #ecfdf5;
              color: #065f46;
              border: 1px solid #a7f3d0;
            }
            .route-table {
              width: 100%;
              margin-bottom: 14px;
              border-collapse: separate;
              border-spacing: 12px 0;
            }
            .route-card {
              background: #f8fafc;
              border: 1px solid #cbd5e1;
              border-radius: 6px;
              padding: 10px 12px;
              width: 50%;
              vertical-align: top;
            }
            .route-label {
              font-size: 9.5px;
              font-weight: bold;
              text-transform: uppercase;
              color: #64748b;
              display: block;
              margin-bottom: 2px;
            }
            .route-name {
              font-size: 13px;
              font-weight: 800;
              color: #0f172a;
            }
            .route-code {
              font-family: monospace;
              font-size: 10.5px;
              color: #475569;
              margin-top: 2px;
            }
            .route-addr {
              font-size: 9.5px;
              color: #64748b;
              margin-top: 2px;
            }
            .manifest-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 14px;
            }
            .manifest-table th {
              background: #f1f5f9;
              color: #334155;
              font-size: 10px;
              font-weight: 800;
              text-transform: uppercase;
              padding: 6px 8px;
              border: 1px solid #cbd5e1;
              text-align: left;
            }
            .notes-box {
              background: #f8fafc;
              border: 1px solid #cbd5e1;
              border-radius: 6px;
              padding: 8px 12px;
              margin-bottom: 16px;
              font-size: 10.5px;
            }
            .sign-table {
              width: 100%;
              margin-top: 40px;
              page-break-inside: avoid;
            }
            .sign-col {
              width: 50%;
              vertical-align: bottom;
              padding: 0 15px;
            }
            .sign-space {
              height: 55px;
            }
            .sign-line {
              border-top: 1.5px solid #0f172a;
              padding-top: 6px;
              text-align: center;
            }
            .sign-title {
              font-size: 11.5px;
              font-weight: 800;
              color: #0f172a;
            }
            .sign-sub {
              font-size: 9.5px;
              color: #64748b;
              margin-top: 3px;
            }
            @media print {
              body {
                background: #ffffff;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              .challan-container {
                border: none !important;
                padding: 0 !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="challan-container">
            <table class="header-table" style="width: 100%;">
              <tr>
                <td style="vertical-align: top;">
                  <div class="brand-title">CORENIX IT LOGISTICS</div>
                  <div class="brand-sub">Internal Multi-Branch Stock Movement Challan</div>
                  <div class="brand-addr">Central Warehouse: Tejgaon I/A, Dhaka • Tel: +880 1800-000000</div>
                </td>
                <td style="vertical-align: top; text-align: right;">
                  <div class="tracking-title">Transfer Tracking #</div>
                  <div class="tracking-num">${transfer.transfer_number}</div>
                  <span class="status-badge">Status: ${(transfer.status || '').toUpperCase()}</span>
                </td>
              </tr>
            </table>

            <table class="route-table" style="width: 100%;">
              <tr>
                <td class="route-card" style="width: 48%;">
                  <span class="route-label">Dispatched From (Origin):</span>
                  <div class="route-name">${transfer.from_branch_name}</div>
                  <div class="route-code">Code: ${transfer.from_branch_code}</div>
                  <div class="route-addr">${transfer.from_branch_address || 'Main Hub'}</div>
                </td>
                <td style="width: 4%;"></td>
                <td class="route-card" style="width: 48%;">
                  <span class="route-label">Delivered To (Destination / Receiving Branch):</span>
                  <div class="route-name">${transfer.to_branch_name}</div>
                  <div class="route-code">Code: ${transfer.to_branch_code}</div>
                  <div class="route-addr">${transfer.to_branch_address || 'Branch Showroom'}</div>
                </td>
              </tr>
            </table>

            <table class="manifest-table">
              <thead>
                <tr>
                  <th style="width: 32px; text-align: center;">#</th>
                  <th>Product Description & Serial Numbers</th>
                  <th style="width: 110px;">Brand / Model</th>
                  <th style="width: 95px; text-align: center;">Qty Dispatched</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            ${
              transfer.notes
                ? `<div class="notes-box">
                    <strong>Dispatch Notes / Reference: </strong>
                    <span>${transfer.notes}</span>
                   </div>`
                : ''
            }

            <table class="sign-table">
              <tr>
                <td class="sign-col">
                  <div class="sign-space"></div>
                  <div class="sign-line">
                    <div class="sign-title">Dispatched By (${transfer.from_branch_name})</div>
                    <div class="sign-sub">Origin Location: ${transfer.from_branch_code} • ${transfer.created_by_name || 'Warehouse Officer'} (${new Date(transfer.created_at).toLocaleDateString()})</div>
                  </div>
                </td>
                <td class="sign-col">
                  <div class="sign-space"></div>
                  <div class="sign-line">
                    <div class="sign-title">Received By (${transfer.to_branch_name})</div>
                    <div class="sign-sub">Receiving Branch: ${transfer.to_branch_code} • ${transfer.status === 'received' ? `Verified & Received on ${new Date(transfer.received_at || transfer.created_at).toLocaleDateString()}` : 'Authorized Signature & Receiving Branch Seal'}</div>
                  </div>
                </td>
              </tr>
            </table>
          </div>

          <script>
            window.onload = function() {
              window.focus();
              window.print();
              setTimeout(function() { window.close(); }, 800);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const fromBranchObj = branches.find((b) => b.id === fromBranchId);
  const toBranchObj = branches.find((b) => b.id === toBranchId);

  const totalManifestUnits = manifest.reduce((sum, item) => sum + item.quantity, 0);
  const totalManifestSerials = manifest.reduce((sum, item) => sum + item.selectedSerials.length, 0);

  // Filtered modal serial numbers
  const filteredModalSerials = serialModalProduct?.serials?.filter((s) => {
    const q = modalSerialSearch.trim().toLowerCase();
    if (!q) return true;
    return s.serial_number.toLowerCase().includes(q) || (s.barcode && s.barcode.toLowerCase().includes(q));
  }) || [];

  return (
    <div className="space-y-6">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-semibold mb-1">
            <Link href="/admin/inventory" className="hover:text-sky-600 dark:hover:text-cyan-400 transition-colors">
              Multi-Branch Inventory
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-sky-600 dark:text-cyan-400 font-bold">Stock & Serial Transfer</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <ArrowRightLeft className="w-6 h-6 text-sky-600 dark:text-cyan-400" />
            <span>Multi-Location Stock & Serial Transfer</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Transfer GPU, CPU, Laptop, and component inventory with individual serial number verification between Warehouse and Showrooms.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <button
            onClick={() => setActiveTab('create')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'create'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Transfer</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Transfer History & Tracking</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner if just completed */}
      {successTransfer && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-500/50 flex items-center justify-between gap-4 animate-in fade-in-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-300 dark:border-emerald-500/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 dark:text-white text-sm">
                Transfer Created: <span className="font-mono text-emerald-600 dark:text-emerald-400">{successTransfer.number}</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Status:{' '}
                <span className="font-bold uppercase text-emerald-600 dark:text-emerald-400">
                  {successTransfer.status === 'received' ? 'Completed & Stock Moved' : 'Dispatched In-Transit'}
                </span>
                . Stock and serial numbers have been reassigned in database.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                viewTransferDetail(successTransfer.id);
                setSuccessTransfer(null);
              }}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Waybill Challan</span>
            </button>
            <button
              onClick={() => setSuccessTransfer(null)}
              className="p-1.5 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 1: CREATE TRANSFER                                   */}
      {/* ======================================================== */}
      {activeTab === 'create' && (
        <div className="space-y-6">
          {/* Location Routing Selector Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-sky-700 dark:text-cyan-400 uppercase tracking-wider">
              <Building2 className="w-4 h-4 text-sky-600 dark:text-cyan-400" />
              <span>1. Select Origin & Destination Branches</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
              {/* Source Branch (From) */}
              <div className="md:col-span-5 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                  Origin Location (Dispatched From)
                </label>
                <select
                  value={fromBranchId}
                  onChange={(e) => handleFromBranchChange(Number(e.target.value))}
                  className="w-full bg-white dark:bg-navy-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-sm rounded-xl px-3 py-2.5 outline-none focus:border-sky-500 shadow-xs cursor-pointer"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id} className="bg-white text-slate-900 dark:bg-navy-900 dark:text-white font-medium">
                      {b.name} ({b.code})
                    </option>
                  ))}
                </select>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  Code: <span className="text-slate-900 dark:text-slate-200 font-bold">{fromBranchObj?.code}</span> • {fromBranchObj?.address || 'Main Hub'}
                </div>
              </div>

              {/* Arrow Indicator */}
              <div className="md:col-span-1 flex justify-center">
                <div className="w-10 h-10 rounded-full bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/30 flex items-center justify-center text-sky-600 dark:text-cyan-400 shadow-xs">
                  <ArrowRight className="w-5 h-5 hidden md:block" />
                  <ArrowRightLeft className="w-5 h-5 md:hidden" />
                </div>
              </div>

              {/* Destination Branch (To) */}
              <div className="md:col-span-5 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                  Destination Location (Receiving At)
                </label>
                <select
                  value={toBranchId}
                  onChange={(e) => setToBranchId(Number(e.target.value))}
                  className="w-full bg-white dark:bg-navy-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-sm rounded-xl px-3 py-2.5 outline-none focus:border-sky-500 shadow-xs cursor-pointer"
                >
                  {branches.map((b) => (
                    <option
                      key={b.id}
                      value={b.id}
                      disabled={b.id === fromBranchId}
                      className="bg-white text-slate-900 dark:bg-navy-900 dark:text-white font-medium disabled:text-slate-400"
                    >
                      {b.name} ({b.code}) {b.id === fromBranchId ? '(Origin)' : ''}
                    </option>
                  ))}
                </select>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  Code: <span className="text-slate-900 dark:text-slate-200 font-bold">{toBranchObj?.code}</span> • {toBranchObj?.address || 'Branch Showroom'}
                </div>
              </div>
            </div>

            {fromBranchId === toBranchId && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800/80 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Origin and destination branches must be different.</span>
              </div>
            )}
          </div>

          {/* Main 2-Column Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Product Search & Inventory Catalog (6 Cols) */}
            <div className="lg:col-span-6 space-y-4">
              <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    <Package className="w-4 h-4 text-sky-600 dark:text-cyan-400" />
                    <span>2. Available Products at {fromBranchObj?.name}</span>
                  </div>

                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    {availableProducts.length} items found
                  </span>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by title, SKU, model, or scan serial number..."
                    className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-sky-500 focus:bg-white dark:focus:bg-slate-950 transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Products List */}
                <div className="max-h-[520px] overflow-y-auto space-y-2 pr-1 divide-y divide-slate-100 dark:divide-slate-800/40">
                  {searchingProducts ? (
                    <div className="py-12 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-sky-600 dark:text-cyan-400" />
                      <span>Loading branch inventory...</span>
                    </div>
                  ) : availableProducts.length === 0 ? (
                    <div className="py-12 text-center text-slate-500 text-xs">
                      <Package className="w-8 h-8 mx-auto text-slate-400 dark:text-slate-600 mb-2" />
                      <p className="font-bold text-slate-700 dark:text-slate-300">No available stock found</p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Try a different search term or select another source branch.
                      </p>
                    </div>
                  ) : (
                    availableProducts.map((p) => {
                      const isInManifest = manifest.some((m) => m.product.id === p.id);
                      const currentManifestItem = manifest.find((m) => m.product.id === p.id);
                      const isMaxed = currentManifestItem && currentManifestItem.quantity >= p.available_stock;

                      return (
                        <div
                          key={p.id}
                          className="pt-2.5 pb-1 flex items-center justify-between gap-3 group hover:bg-slate-50 dark:hover:bg-slate-800/30 p-2 rounded-xl transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 overflow-hidden text-slate-400">
                              {p.image ? (
                                <img src={p.image} alt={p.name} width={80} height={80} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                              ) : (
                                <Package className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                              )}
                            </div>

                            <div className="min-w-0">
                              <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate group-hover:text-sky-600 dark:group-hover:text-cyan-400 transition-colors">
                                {p.name}
                              </h4>
                              <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5 flex-wrap">
                                <span>SKU: {p.sku}</span>
                                {p.requires_serial && (
                                  <span className="px-1.5 py-0.2 rounded bg-sky-50 dark:bg-sky-950/80 text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-800 text-[9px] font-extrabold uppercase flex items-center gap-1">
                                    <QrCode className="w-2.5 h-2.5" />
                                    <span>{p.serials?.length || 0} Serials</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <div className="text-right">
                              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 block font-mono">
                                {p.available_stock} Avail
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                ৳{Number(p.purchase_cost || 0).toLocaleString()}
                              </span>
                            </div>

                            <button
                              onClick={() => handleProductClick(p)}
                              disabled={isMaxed}
                              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                                isMaxed
                                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                                  : p.requires_serial
                                  ? 'bg-sky-600 hover:bg-sky-500 text-white shadow-xs'
                                  : isInManifest
                                  ? 'bg-sky-50 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 hover:bg-sky-600 hover:text-white border border-sky-300 dark:border-sky-500/40'
                                  : 'bg-sky-600 hover:bg-sky-500 text-white shadow-xs'
                              }`}
                              title={p.requires_serial ? 'Select serial numbers via popup' : 'Add to manifest'}
                            >
                              {p.requires_serial ? (
                                <>
                                  <QrCode className="w-3.5 h-3.5" />
                                  <span>Select Serials</span>
                                </>
                              ) : (
                                <>
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>Add</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Transfer Manifest Summary (6 Cols) */}
            <div className="lg:col-span-6 space-y-4">
              <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    <FileText className="w-4 h-4 text-sky-600 dark:text-cyan-400" />
                    <span>3. Transfer Manifest ({manifest.length} Items)</span>
                  </div>

                  {manifest.length > 0 && (
                    <button
                      onClick={() => setManifest([])}
                      className="text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:underline"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {manifest.length === 0 ? (
                  <div className="py-16 text-center text-slate-400 dark:text-slate-500 text-xs border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-4">
                    <ArrowRightLeft className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                    <p className="font-bold text-slate-700 dark:text-slate-400">Manifest is empty</p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                      Select products from the catalog to add items to this transfer batch.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                    {manifest.map((item) => {
                      const isSerialized = item.product.requires_serial && item.product.serials && item.product.serials.length > 0;
                      const hasSerialMismatch = isSerialized && item.selectedSerials.length !== item.quantity;

                      return (
                        <div
                          key={item.product.id}
                          className={`p-3.5 rounded-2xl border space-y-3 transition-all ${
                            hasSerialMismatch
                              ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-300 dark:border-amber-500/50'
                              : 'bg-slate-50 dark:bg-slate-950/70 border-slate-200 dark:border-slate-800'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <h5 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">
                                {item.product.name}
                              </h5>
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                                SKU: {item.product.sku} • Max Stock: {item.product.available_stock}
                              </span>
                            </div>

                            <button
                              onClick={() => removeFromManifest(item.product.id)}
                              className="p-1 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                              title="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Non-Serialized Quantity Stepper */}
                          {!isSerialized ? (
                            <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-800/80">
                              <span className="text-xs text-slate-600 dark:text-slate-400 font-semibold">Quantity to Transfer:</span>
                              <div className="flex items-center gap-1.5 bg-white dark:bg-navy-900 border border-slate-300 dark:border-slate-700 rounded-lg p-0.5 shadow-2xs">
                                <button
                                  onClick={() => updateManifestQuantity(item.product.id, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                  className="w-6 h-6 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs disabled:opacity-40"
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  min={1}
                                  max={item.product.available_stock}
                                  value={item.quantity}
                                  onChange={(e) => updateManifestQuantity(item.product.id, parseInt(e.target.value) || 1)}
                                  className="w-12 text-center bg-transparent font-bold text-xs text-slate-900 dark:text-white outline-none font-mono"
                                />
                                <button
                                  onClick={() => updateManifestQuantity(item.product.id, item.quantity + 1)}
                                  disabled={item.quantity >= item.product.available_stock}
                                  className="w-6 h-6 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs disabled:opacity-40"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          ) : (
                            /* Serialized Item Summary & Modal Launch Button */
                            <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-sky-700 dark:text-sky-400">
                                  <QrCode className="w-4 h-4" />
                                  <span>{item.selectedSerials.length} Serial Number(s) Selected</span>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => openSerialModal(item.product)}
                                  className="px-2.5 py-1 rounded-lg bg-sky-100 dark:bg-sky-600/20 hover:bg-sky-600 text-sky-800 dark:text-sky-300 hover:text-white border border-sky-300 dark:border-sky-500/40 text-[11px] font-bold flex items-center gap-1 transition-all"
                                >
                                  <Edit3 className="w-3 h-3" />
                                  <span>Change Serials</span>
                                </button>
                              </div>

                              {/* Clean Serial Badges Preview */}
                              <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
                                {item.selectedSerials.map((sn) => (
                                  <span
                                    key={sn}
                                    className="px-2 py-0.5 rounded-md bg-white dark:bg-sky-950 border border-slate-300 dark:border-sky-800/80 text-slate-800 dark:text-sky-300 text-[10px] font-mono font-bold shadow-2xs"
                                  >
                                    {sn}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Transfer Mode & Execution */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                      Transfer Mode & Fulfillment
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setTransferMode('received')}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          transferMode === 'received'
                            ? 'bg-sky-50 dark:bg-sky-500/15 border-sky-500 dark:border-sky-400 text-sky-950 dark:text-sky-300 shadow-2xs ring-1 ring-sky-500/30'
                            : 'bg-white dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'
                        }`}
                      >
                        <span className="font-bold text-xs block text-slate-900 dark:text-white flex items-center gap-1">
                          <span>⚡ Direct Transfer</span>
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block leading-tight">
                          Immediate stock & serial update at destination
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setTransferMode('in_transit')}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          transferMode === 'in_transit'
                            ? 'bg-amber-50 dark:bg-amber-500/15 border-amber-500 dark:border-amber-400 text-amber-950 dark:text-amber-300 shadow-2xs ring-1 ring-amber-500/30'
                            : 'bg-white dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'
                        }`}
                      >
                        <span className="font-bold text-xs block text-slate-900 dark:text-white flex items-center gap-1">
                          <span>🚚 In-Transit Shipment</span>
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block leading-tight">
                          Dispatch now, destination shop marks as received
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Dispatch Notes */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Dispatch Notes / Vehicle / Courier Ref
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. Courier: Pathao Parcel #98124, Driver: Rafiq (01700-000000)"
                      rows={2}
                      className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-sky-500 focus:bg-white dark:focus:bg-slate-950 resize-none transition-colors"
                    />
                  </div>

                  {/* Manifest Summary Footer */}
                  <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-mono">
                    <div>
                      <span className="text-slate-700 dark:text-slate-300 font-bold block">Total Batch Units:</span>
                      <span className="text-[10px] text-sky-700 dark:text-sky-400">{totalManifestSerials} Serial Numbers Attached</span>
                    </div>
                    <span className="text-sky-700 dark:text-cyan-400 font-black text-sm">{totalManifestUnits} Items</span>
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={handleSubmitTransfer}
                    disabled={submitting || manifest.length === 0 || fromBranchId === toBranchId}
                    className="w-full py-3.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-98 transition-all"
                  >
                    {submitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Processing Stock & Serial Transfer...</span>
                      </>
                    ) : (
                      <>
                        <ArrowRightLeft className="w-4 h-4" />
                        <span>Execute Stock & Serial Transfer</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SERIAL NUMBER POPUP MODAL (After Selecting Product)      */}
      {/* ======================================================== */}
      {serialModalProduct && (
        <div className="fixed inset-0 bg-black/70 dark:bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-700 rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl relative my-auto animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-500/20 border border-sky-200 dark:border-sky-500/40 flex items-center justify-center text-sky-600 dark:text-sky-400 shrink-0">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white line-clamp-1">
                    Select Serials for {serialModalProduct.name}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                    <span>SKU: {serialModalProduct.sku}</span>
                    <span>• {serialModalProduct.available_stock} Units Available at {fromBranchObj?.name}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSerialModalProduct(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Live Search Serial Numbers within Modal */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                Search & Filter Serial Numbers
              </label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={modalSerialSearch}
                  onChange={(e) => setModalSerialSearch(e.target.value)}
                  placeholder="Type to filter specific serial number..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white font-mono placeholder-slate-400 outline-none focus:border-sky-500"
                />
                {modalSerialSearch && (
                  <button
                    onClick={() => setModalSerialSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Quick Helper Actions */}
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-sky-700 dark:text-sky-400 font-mono">
                {modalSelectedSerials.length} of {serialModalProduct.serials?.length || 0} Serials Selected
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={selectAllModalSerials}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-sky-700 dark:text-sky-400 font-bold text-xs transition-colors"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={() => setModalSelectedSerials([])}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold text-xs transition-colors"
                >
                  Deselect All
                </button>
              </div>
            </div>

            {/* Serials Interactive Grid */}
            <div className="max-h-64 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-950/80 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1.5">
              {filteredModalSerials.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No serial numbers match "{modalSerialSearch}".
                </div>
              ) : (
                filteredModalSerials.map((sn) => {
                  const isChecked = modalSelectedSerials.includes(sn.serial_number);
                  return (
                    <button
                      key={sn.id}
                      type="button"
                      onClick={() => toggleModalSerial(sn.serial_number)}
                      className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-left transition-all ${
                        isChecked
                          ? 'bg-sky-50 dark:bg-sky-950/80 border-sky-400 dark:border-sky-500 text-slate-900 dark:text-white shadow-2xs'
                          : 'bg-white dark:bg-navy-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                            isChecked
                              ? 'bg-sky-600 border-sky-500 text-white'
                              : 'border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 text-transparent'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-mono font-bold text-xs">{sn.serial_number}</span>
                      </div>

                      {sn.barcode && (
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono hidden sm:inline">
                          Barcode: {sn.barcode}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSerialModalProduct(null)}
                className="px-4 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={applyModalSerials}
                disabled={modalSelectedSerials.length === 0}
                className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all"
              >
                <Check className="w-4 h-4" />
                <span>Confirm {modalSelectedSerials.length} Serial(s)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: TRANSFER HISTORY & TRACKING                       */}
      {/* ======================================================== */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {/* Filter & Search Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="Search by Transfer # or Notes..."
                className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-sky-500 transition-colors"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-slate-600 dark:text-slate-400 font-semibold hidden sm:inline">Status:</span>
              <select
                value={historyStatusFilter}
                onChange={(e) => setHistoryStatusFilter(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold rounded-xl px-3 py-2 outline-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="received">Received (Completed)</option>
                <option value="in_transit">In-Transit</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <button
                onClick={fetchHistory}
                disabled={loadingHistory}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                title="Refresh history"
              >
                <RefreshCw className={`w-4 h-4 ${loadingHistory ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Transfers Table */}
          <div className="p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            {loadingHistory ? (
              <div className="py-16 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-sky-600 dark:text-cyan-400" />
                <span>Loading transfer records...</span>
              </div>
            ) : transfers.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-xs">
                <ArrowRightLeft className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                <p className="font-bold text-slate-700 dark:text-slate-300">No transfer records found</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Create your first stock transfer using the "New Transfer" tab above.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                      <th className="py-3 px-4">Transfer Number</th>
                      <th className="py-3 px-4">Origin &rarr; Destination</th>
                      <th className="py-3 px-4 text-center">Items & Serials</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4">Dispatched By & Date</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {transfers.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                          {t.transfer_number}
                          {t.notes && (
                            <span className="block text-[10px] text-slate-500 font-sans font-normal truncate max-w-[200px]">
                              {t.notes}
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5 font-bold">
                            <span className="text-slate-700 dark:text-slate-300">{t.from_branch_name}</span>
                            <ArrowRight className="w-3.5 h-3.5 text-sky-600 dark:text-cyan-400 shrink-0" />
                            <span className="text-sky-700 dark:text-sky-300">{t.to_branch_name}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {t.from_branch_code} &rarr; {t.to_branch_code}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-center font-mono font-bold text-slate-900 dark:text-white">
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white text-[11px] border border-slate-200 dark:border-slate-700">
                            {t.total_quantity} Units ({t.item_count} SKUs)
                          </span>
                        </td>

                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1 ${
                              t.status === 'received'
                                ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/80'
                                : t.status === 'in_transit'
                                ? 'bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800/80'
                                : 'bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-800/80'
                            }`}
                          >
                            {t.status === 'received' && <CheckCircle2 className="w-3 h-3" />}
                            {t.status === 'in_transit' && <Truck className="w-3 h-3" />}
                            <span>{t.status.replace('_', ' ')}</span>
                          </span>
                        </td>

                        <td className="py-3 px-4 text-slate-500 text-[11px]">
                          <span className="font-bold text-slate-800 dark:text-slate-300 block">{t.created_by_name || 'Admin'}</span>
                          <span className="font-mono text-[10px]">{new Date(t.created_at).toLocaleString()}</span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {t.status === 'in_transit' && (
                              <button
                                onClick={() => handleReceiveTransfer(t.id)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 transition-colors shadow-2xs"
                                title="Confirm receipt of goods at destination"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Receive</span>
                              </button>
                            )}

                            <button
                              onClick={() => viewTransferDetail(t.id)}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-white font-bold text-[11px] flex items-center gap-1 transition-colors border border-slate-200 dark:border-slate-700"
                              title="View and print challan"
                            >
                              <Eye className="w-3 h-3 text-sky-600 dark:text-cyan-400" />
                              <span>View Challan</span>
                            </button>
                          </div>
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

      {/* ======================================================== */}
      {/* MODAL: TRANSFER DETAILS & PRINTABLE WAYBILL CHALLAN      */}
      {/* ======================================================== */}
      {selectedTransferDetail && (
        <div className="challan-print-overlay fixed inset-0 bg-black/70 dark:bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto print:p-0 print:m-0 print:bg-white print:static print:block print:overflow-visible print:h-auto print:min-h-0">
          {/* Print Style Block to perfectly fit A4 paper starting directly from the top */}
          <style
            dangerouslySetInnerHTML={{
              __html: `
            @media print {
              @page {
                size: A4 portrait;
                margin: 8mm 10mm 8mm 10mm !important;
              }
              html, body {
                background: #ffffff !important;
                color: #000000 !important;
                margin: 0 !important;
                padding: 0 !important;
                width: 100% !important;
                height: auto !important;
                min-height: 0 !important;
                overflow: visible !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                font-size: 9pt !important;
              }
              header, nav, aside, footer, .no-print, .print\\:hidden, button {
                display: none !important;
              }
              .challan-print-overlay {
                position: static !important;
                display: block !important;
                padding: 0 !important;
                margin: 0 !important;
                background: transparent !important;
                backdrop-filter: none !important;
                -webkit-backdrop-filter: none !important;
                width: 100% !important;
                height: auto !important;
                min-height: 0 !important;
                overflow: visible !important;
                inset: auto !important;
                z-index: auto !important;
              }
              .challan-modal-card {
                position: static !important;
                display: block !important;
                padding: 0 !important;
                margin: 0 !important;
                border: none !important;
                box-shadow: none !important;
                background: #ffffff !important;
                width: 100% !important;
                max-width: 100% !important;
                height: auto !important;
                min-height: 0 !important;
              }
              #transfer-challan-printable {
                display: block !important;
                position: static !important;
                width: 100% !important;
                max-width: 100% !important;
                margin: 0 !important;
                padding: 16px !important;
                background: #ffffff !important;
                color: #000000 !important;
                border: 1px solid #cbd5e1 !important;
                border-radius: 8px !important;
                box-shadow: none !important;
                box-sizing: border-box !important;
              }
              #transfer-challan-printable table {
                width: 100% !important;
                border-collapse: collapse !important;
              }
              #transfer-challan-printable th, #transfer-challan-printable td {
                padding: 4px 6px !important;
                border: 1px solid #cbd5e1 !important;
              }
              .page-break-avoid {
                break-inside: avoid !important;
                page-break-inside: avoid !important;
              }
            }
          `,
            }}
          />

          <div className="challan-modal-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-700 rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-auto animate-in zoom-in-95 print:p-0 print:m-0 print:border-none print:shadow-none print:max-w-full print:static print:block print:space-y-0">
            {/* Modal Actions */}
            <div className="flex items-center justify-between no-print border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-sky-100 dark:bg-sky-500/20 text-sky-600 dark:text-cyan-400 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Stock Transfer Delivery Challan
                  </h3>
                  <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                    {selectedTransferDetail.transfer_number}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => printChallan(selectedTransferDetail)}
                  className="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Challan</span>
                </button>

                {selectedTransferDetail.status === 'in_transit' && (
                  <button
                    onClick={() => handleReceiveTransfer(selectedTransferDetail.id)}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark as Received</span>
                  </button>
                )}

                <button
                  onClick={() => setSelectedTransferDetail(null)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable A4 Challan Body */}
            <div id="transfer-challan-printable" className="challan-printable-body p-6 bg-white text-slate-900 rounded-2xl font-sans space-y-4 print:p-0 print:border-none print:space-y-3">
              {/* Top Branding & Transfer Code */}
              <div className="flex items-start justify-between border-b-2 border-slate-900 pb-3">
                <div>
                  <h2 className="text-xl font-black text-slate-950 tracking-tight print:text-lg">CORENIX IT LOGISTICS</h2>
                  <p className="text-[11px] text-slate-600 print:text-[10px]">Internal Multi-Branch Stock Movement Challan</p>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5 print:text-[9px]">
                    Central Warehouse: Tejgaon I/A, Dhaka • Tel: +880 1800-000000
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block print:text-[9px]">Transfer Tracking #</span>
                  <span className="font-mono font-black text-sm text-slate-900 block print:text-xs">
                    {selectedTransferDetail.transfer_number}
                  </span>
                  <span
                    className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider print:text-[9px] ${
                      selectedTransferDetail.status === 'received'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : selectedTransferDetail.status === 'in_transit'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}
                  >
                    Status: {selectedTransferDetail.status.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Origin & Destination Information */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-300 text-xs print:p-2.5 print:text-[10px] page-break-avoid">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block print:text-[9px]">
                    Dispatched From (Origin):
                  </span>
                  <p className="font-black text-slate-900 text-sm mt-0.5 print:text-xs">
                    {selectedTransferDetail.from_branch_name}
                  </p>
                  <p className="text-[11px] text-slate-600 font-mono print:text-[9.5px]">Code: {selectedTransferDetail.from_branch_code}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5 print:text-[9px]">{selectedTransferDetail.from_branch_address || 'Main Hub'}</p>
                </div>

                <div className="border-l border-slate-300 pl-3">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block print:text-[9px]">
                    Delivered To (Destination / Receiving Branch):
                  </span>
                  <p className="font-black text-slate-900 text-sm mt-0.5 print:text-xs">
                    {selectedTransferDetail.to_branch_name}
                  </p>
                  <p className="text-[11px] text-slate-600 font-mono print:text-[9.5px]">Code: {selectedTransferDetail.to_branch_code}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5 print:text-[9px]">{selectedTransferDetail.to_branch_address || 'Branch Showroom'}</p>
                </div>
              </div>

              {/* Items Manifest Table */}
              <div className="page-break-avoid">
                <table className="challan-table w-full text-left text-xs border border-slate-300 print:text-[9.5px]">
                  <thead className="bg-slate-100 border-b border-slate-300 font-bold uppercase text-[10px] text-slate-700 print:text-[9px] print:bg-slate-100">
                    <tr>
                      <th className="py-2 px-2.5 w-8">#</th>
                      <th className="py-2 px-2.5">Product Description & Serial Numbers</th>
                      <th className="py-2 px-2.5 w-28">Brand / Model</th>
                      <th className="py-2 px-2.5 text-center w-24">Qty Dispatched</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {selectedTransferDetail.items?.map((it: any, idx: number) => (
                      <tr key={it.id || idx}>
                        <td className="py-2 px-2.5 font-mono font-bold text-slate-500 text-center">{idx + 1}</td>
                        <td className="py-2 px-2.5">
                          <span className="font-bold text-slate-900 block">{it.product_name}</span>
                          <span className="text-[10px] text-slate-500 font-mono block print:text-[8.5px]">SKU: {it.sku}</span>
                          {it.serials && it.serials.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {it.serials.map((s: string) => (
                                <span
                                  key={s}
                                  className="px-1.5 py-0.2 rounded bg-slate-100 border border-slate-300 text-slate-800 text-[9px] font-mono font-bold inline-flex items-center gap-1 print:text-[8px] print:py-0 print:px-1"
                                >
                                  <QrCode className="w-2.5 h-2.5 text-slate-600 print:hidden" />
                                  <span>SN: {s}</span>
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="py-2 px-2.5 text-slate-600 text-[11px] print:text-[9px]">
                          {it.brand_name || it.model || '-'}
                        </td>
                        <td className="py-2 px-2.5 text-center font-mono font-bold text-slate-900">
                          {it.quantity} Unit{it.quantity > 1 ? 's' : ''}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Notes */}
              {selectedTransferDetail.notes && (
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-300 text-xs print:p-2 print:text-[9.5px] page-break-avoid">
                  <span className="font-bold text-slate-700">Dispatch Notes / Reference: </span>
                  <span className="text-slate-600">{selectedTransferDetail.notes}</span>
                </div>
              )}

              {/* Signatures & Seal boxes */}
              <div className="pt-10 grid grid-cols-2 gap-8 text-xs print:pt-8 print:text-[9.5px] page-break-avoid">
                <div>
                  <div className="h-14"></div>
                  <div className="border-t-2 border-slate-900 pt-1.5 text-center">
                    <span className="font-bold text-slate-900 block">Dispatched By ({selectedTransferDetail.from_branch_name})</span>
                    <span className="text-[10px] text-slate-500 font-mono print:text-[8.5px]">
                      Origin Location: {selectedTransferDetail.from_branch_code} • {selectedTransferDetail.created_by_name || 'Warehouse Officer'} ({new Date(selectedTransferDetail.created_at).toLocaleDateString()})
                    </span>
                  </div>
                </div>

                <div>
                  <div className="h-14"></div>
                  <div className="border-t-2 border-slate-900 pt-1.5 text-center">
                    <span className="font-bold text-slate-900 block">Received By ({selectedTransferDetail.to_branch_name})</span>
                    <span className="text-[10px] text-slate-500 font-mono print:text-[8.5px]">
                      Receiving Branch: {selectedTransferDetail.to_branch_code} • {selectedTransferDetail.status === 'received'
                        ? `Verified & Received on ${new Date(selectedTransferDetail.received_at || selectedTransferDetail.created_at).toLocaleDateString()}`
                        : 'Authorized Signature & Receiving Branch Seal'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
