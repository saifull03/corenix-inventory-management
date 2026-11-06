'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import {
  ShoppingCart,
  Trash2,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Tag,
  ArrowLeft,
  PackageOpen,
  CheckCircle2,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, clearCart, subtotal, cartCount, isLoaded } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [shippingMethod, setShippingMethod] = useState<'pickup' | 'dhaka' | 'outside'>('pickup');
  const [deletedNotice, setDeletedNotice] = useState<string | null>(null);

  const shippingCost = shippingMethod === 'pickup' ? 0 : shippingMethod === 'dhaka' ? 100 : 180;
  const total = Math.max(0, subtotal - discount + shippingCost);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.trim().toUpperCase() === 'CORENIX500') {
      setDiscount(500);
      alert('Success! ৳500 discount promo code applied.');
    } else if (couponCode.trim().toUpperCase() === 'CORENIX1000') {
      setDiscount(1000);
      alert('Success! ৳1,000 VIP discount promo code applied.');
    } else {
      alert('Invalid coupon code. Try "CORENIX500"');
    }
  };

  const handleDeleteItem = (id: number | string, name: string) => {
    removeFromCart(id);
    setDeletedNotice(`Removed "${name}" from cart`);
    setTimeout(() => setDeletedNotice(null), 3000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 dark:bg-navy-950 dark:text-slate-100 font-sans transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        {/* Breadcrumb / Page Title */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
              <ShoppingCart className="w-7 h-7 sm:w-8 h-8 text-sky-600 dark:text-brand-400" />
              <span>Shopping Cart</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Review and manage your selected computer hardware and accessories before checkout.
            </p>
          </div>

          {cartItems.length > 0 && (
            <button
              onClick={clearCart}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/60 border border-rose-200 dark:border-rose-900/50 transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Entire Cart</span>
            </button>
          )}
        </div>

        {/* Action feedback toast */}
        {deletedNotice && (
          <div className="mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-semibold flex items-center justify-between animate-fadeIn">
            <span>{deletedNotice}</span>
            <span className="text-[10px] uppercase font-mono">Cart Updated</span>
          </div>
        )}

        {isLoaded && cartItems.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Cart Items List */}
            <div className="lg:col-span-8 space-y-4">
              <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800/80 shadow-xs">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="py-4 first:pt-0 last:pb-0 flex items-center justify-between flex-wrap gap-4 transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-900/40 p-2 rounded-2xl"
                  >
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.image || 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=400&q=80'}
                        alt={item.name}
                        className="w-16 h-16 sm:w-20 sm:h-20 object-contain bg-slate-50 dark:bg-navy-950 rounded-2xl p-2 border border-slate-200 dark:border-slate-800 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <Link
                          href={item.slug ? `/product/${item.slug}` : '#'}
                          className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white hover:text-sky-600 dark:hover:text-brand-400 line-clamp-2 transition-colors"
                        >
                          {item.name}
                        </Link>
                        <div className="flex items-center gap-2 mt-1 flex-wrap text-[11px] text-slate-500 dark:text-slate-400">
                          {item.sku && <span className="font-mono">SKU: {item.sku}</span>}
                          <span>•</span>
                          <span className="text-sky-600 dark:text-brand-400 flex items-center gap-1 font-medium">
                            <ShieldCheck className="w-3.5 h-3.5" /> {item.warranty || 'Official Warranty'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 sm:gap-6 shrink-0">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-2xs">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="px-3 py-1.5 text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700 font-bold transition-colors text-sm"
                          title="Decrease quantity"
                        >
                          -
                        </button>
                        <span className="px-3 py-1.5 text-xs font-black text-slate-900 dark:text-white min-w-[28px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="px-3 py-1.5 text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700 font-bold transition-colors text-sm"
                          title="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      {/* Line Item Total */}
                      <div className="text-right min-w-[90px]">
                        <span className="text-sm sm:text-base font-black text-sky-600 dark:text-brand-400 block">
                          ৳{(item.price * item.quantity).toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          ৳{item.price.toLocaleString()} each
                        </span>
                      </div>

                      {/* Instant Delete Button */}
                      <button
                        onClick={() => handleDeleteItem(item.id, item.name)}
                        className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900 text-rose-600 dark:text-rose-400 transition-all border border-rose-200 dark:border-rose-900/50 hover:scale-105 active:scale-95 shadow-2xs"
                        title="Delete product from cart"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Store Pickup & Dispatch Notice */}
              <div className="p-4 rounded-2xl bg-sky-50/80 dark:bg-slate-900 border border-sky-200/70 dark:border-slate-800 flex items-center gap-3 text-xs text-slate-700 dark:text-slate-300">
                <MapPin className="w-5 h-5 text-sky-600 dark:text-brand-400 flex-shrink-0" />
                <span>
                  All items are reserved instantly in inventory upon ordering. Ready for instant pickup at <strong className="text-slate-900 dark:text-white">Shop 1 (Uttara Flagship)</strong> or <strong className="text-slate-900 dark:text-white">Shop 2 (Dhanmondi Branch)</strong>, or express doorstep delivery across Bangladesh.
                </span>
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-4 space-y-4">
              <div className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 space-y-5 shadow-xs">
                <h3 className="text-base font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span>Order Summary</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                    {cartCount} {cartCount === 1 ? 'item' : 'items'}
                  </span>
                </h3>

                {/* Shipping & Delivery Method Selector */}
                <div className="space-y-2 text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] block">
                    Fulfillment Method:
                  </span>
                  <div className="space-y-1.5">
                    <label className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-colors ${
                      shippingMethod === 'pickup'
                        ? 'bg-sky-50 border-sky-300 dark:bg-brand-500/10 dark:border-brand-500/40 text-sky-900 dark:text-brand-300 font-bold'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                    }`}>
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="shipping"
                          checked={shippingMethod === 'pickup'}
                          onChange={() => setShippingMethod('pickup')}
                          className="text-sky-600"
                        />
                        <span>Store Pickup (Shop 1 / Shop 2)</span>
                      </div>
                      <span className="text-emerald-600 font-bold">FREE</span>
                    </label>

                    <label className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-colors ${
                      shippingMethod === 'dhaka'
                        ? 'bg-sky-50 border-sky-300 dark:bg-brand-500/10 dark:border-brand-500/40 text-sky-900 dark:text-brand-300 font-bold'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                    }`}>
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="shipping"
                          checked={shippingMethod === 'dhaka'}
                          onChange={() => setShippingMethod('dhaka')}
                          className="text-sky-600"
                        />
                        <span>Inside Dhaka Delivery</span>
                      </div>
                      <span className="font-mono font-bold">৳100</span>
                    </label>

                    <label className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-colors ${
                      shippingMethod === 'outside'
                        ? 'bg-sky-50 border-sky-300 dark:bg-brand-500/10 dark:border-brand-500/40 text-sky-900 dark:text-brand-300 font-bold'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                    }`}>
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="shipping"
                          checked={shippingMethod === 'outside'}
                          onChange={() => setShippingMethod('outside')}
                          className="text-sky-600"
                        />
                        <span>Outside Dhaka (Courier Delivery)</span>
                      </div>
                      <span className="font-mono font-bold">৳180</span>
                    </label>
                  </div>
                </div>

                {/* Promo Coupon Form */}
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Promo code (e.g. CORENIX500)"
                      className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 pl-9 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 font-mono"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-colors shrink-0"
                  >
                    Apply
                  </button>
                </form>

                {/* Pricing Breakdown */}
                <div className="space-y-2 text-xs pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>Subtotal:</span>
                    <span className="font-bold text-slate-900 dark:text-white">৳{subtotal.toLocaleString()}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                      <span>Promo Discount:</span>
                      <span className="font-bold">-৳{discount.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>Shipping / Fulfillment:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {shippingCost === 0 ? <span className="text-emerald-600">FREE</span> : `৳${shippingCost}`}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>VAT & Taxes:</span>
                    <span className="text-slate-500">Included</span>
                  </div>

                  <div className="flex justify-between items-baseline pt-3 border-t border-slate-200 dark:border-slate-800">
                    <span className="text-sm font-black text-slate-900 dark:text-white">Total:</span>
                    <span className="text-xl font-black text-sky-600 dark:text-brand-400">
                      ৳{total.toLocaleString()}
                    </span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="w-full py-3.5 px-6 rounded-2xl bg-sky-600 hover:bg-sky-500 dark:bg-brand-500 dark:hover:bg-brand-400 text-white dark:text-navy-950 font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-sky-600/20 hover:shadow-lg transition-all text-center"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <div className="text-[11px] text-center text-slate-400">
                  <span>🔒 100% Safe & Secure Checkout</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Empty Cart State */
          <div className="text-center py-16 px-4 bg-white dark:bg-navy-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs max-w-xl mx-auto my-8">
            <div className="w-16 h-16 rounded-3xl bg-sky-50 dark:bg-brand-500/10 border border-sky-200 dark:border-brand-500/30 flex items-center justify-center mx-auto text-sky-600 dark:text-brand-400 mb-4">
              <PackageOpen className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2">
              Your Shopping Cart is Empty
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-6">
              Looks like you have not added any products yet or have deleted all items from your cart.
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link
                href="/products"
                className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 dark:bg-brand-500 dark:hover:bg-brand-400 text-white dark:text-navy-950 font-bold text-xs flex items-center gap-2 transition-all shadow-sm"
              >
                <span>Browse Products</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/pc-builder"
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-2 transition-colors border border-slate-200 dark:border-slate-700"
              >
                <span>Custom PC Builder</span>
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
