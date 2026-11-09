'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Heart,
  ArrowLeftRight,
} from 'lucide-react';
import { Product } from '@/lib/types';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isCompared, setIsCompared] = useState(false);

  // Load wishlist and compare status from localStorage
  useEffect(() => {
    try {
      const savedWishlist = JSON.parse(localStorage.getItem('corenix_wishlist') || '[]');
      if (Array.isArray(savedWishlist) && savedWishlist.includes(product.id)) {
        setIsWishlisted(true);
      }
      const savedCompare = JSON.parse(localStorage.getItem('corenix_compare') || '[]');
      if (Array.isArray(savedCompare) && savedCompare.includes(product.id)) {
        setIsCompared(true);
      }
    } catch (e) {}
  }, [product.id]);

  // Pricing calculations
  const regularPrice = Number(product.selling_price || 0);
  const currentPrice = Number(product.discount_price || product.selling_price || 0);
  const hasDiscount = Boolean(product.discount_price && product.discount_price < product.selling_price);
  const savingsAmount = hasDiscount ? regularPrice - currentPrice : 0;

  // 0% EMI eligibility (Standard BD retail rule: items ৳5,000+ or marked eligible)
  const isEmiEligible = currentPrice >= 5000 || Boolean((product as any).is_emi_eligible);

  // Stock status checks
  const stockStatusStr = (product.stock_status || '').toLowerCase();
  const isCallForPrice = stockStatusStr.includes('call');
  const isOutOfStock = (
    stockStatusStr.includes('out') ||
    (product.total_stock !== undefined && Number(product.total_stock) === 0)
  );

  // Wishlist toggle
  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nextState = !isWishlisted;
    setIsWishlisted(nextState);
    try {
      const saved = JSON.parse(localStorage.getItem('corenix_wishlist') || '[]');
      const updated = nextState
        ? [...new Set([...saved, product.id])]
        : saved.filter((id: number) => id !== product.id);
      localStorage.setItem('corenix_wishlist', JSON.stringify(updated));
    } catch (e) {}
  };

  // Compare toggle
  const handleCompareToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nextState = !isCompared;
    setIsCompared(nextState);
    try {
      const saved = JSON.parse(localStorage.getItem('corenix_compare') || '[]');
      const updated = nextState
        ? [...new Set([...saved, product.id])]
        : saved.filter((id: number) => id !== product.id);
      localStorage.setItem('corenix_compare', JSON.stringify(updated));
    } catch (e) {}
  };

  return (
    <article
      style={{ fontFamily: "'Inter', 'Interfallback', sans-serif" }}
      className="group relative flex h-full min-w-0 flex-col overflow-hidden rounded-2xl sm:rounded-[20px] border border-slate-200/90 bg-white font-['Inter',_'Interfallback',_sans-serif] shadow-[0_2px_10px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_10px_24px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-900 dark:shadow-[0_2px_10px_rgba(0,0,0,0.2)] dark:hover:border-slate-700 dark:hover:shadow-[0_10px_24px_rgba(0,0,0,0.35)]"
    >
      {/* 0% EMI Badge */}
      {isEmiEligible && (
        <div className="absolute top-3 left-3 z-10 pointer-events-none">
          <span className="rounded-full border border-slate-200/90 bg-white/95 px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-800/95 dark:text-slate-300">
            0% EMI
          </span>
        </div>
      )}

      {/* Top action buttons (hidden by default, revealed on hover) */}
      <div className="absolute top-3 right-3 z-10 flex gap-1.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus-within:opacity-100">
        <button
          type="button"
          onClick={handleWishlistToggle}
          className={`flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white/95 shadow-sm transition-all hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-slate-400 dark:border-slate-700 dark:bg-slate-800/95 ${
            isWishlisted
              ? 'border-rose-200 bg-rose-50 text-rose-500 dark:border-rose-900/50 dark:bg-rose-950/40'
              : 'text-slate-500 hover:border-slate-400 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
          title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          aria-label="Wishlist"
        >
          <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current text-rose-500' : ''}`} />
        </button>
        <button
          type="button"
          onClick={handleCompareToggle}
          className={`flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white/95 shadow-sm transition-all hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-slate-400 dark:border-slate-700 dark:bg-slate-800/95 ${
            isCompared
              ? 'border-slate-400 bg-slate-100 text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white'
              : 'text-slate-500 hover:border-slate-400 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
          title={isCompared ? 'Remove from compare' : 'Add to compare'}
          aria-label="Compare"
        >
          <ArrowLeftRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Product Image Area - Uniform fixed height for all cards */}
      <div className="relative flex h-52 sm:h-60 w-full shrink-0 items-center justify-center overflow-hidden bg-white p-4 sm:p-5 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800/80">
        <Link
          href={`/product/${product.slug}`}
          className="flex h-full w-full items-center justify-center"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.primary_image || 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=800&q=80'}
            alt={product.name}
            width={400}
            height={400}
            className={`max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105 ${
              isOutOfStock ? 'opacity-60 grayscale-[30%]' : ''
            }`}
            loading="lazy"
            decoding="async"
          />
        </Link>
      </div>

      {/* Product Information - Evenly distributed flex layout */}
      <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
        {/* Title: Fixed 2-line box so titles always occupy the exact same vertical space */}
        <div className="h-11 sm:h-12 overflow-hidden mb-2">
          <h3 className="line-clamp-2 text-sm sm:text-base font-semibold leading-snug text-slate-900 dark:text-white">
            <Link
              href={`/product/${product.slug}`}
              title={product.name}
              className="text-slate-900 dark:text-white hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              {product.name}
            </Link>
          </h3>
        </div>

        {/* Pricing: Aligned to bottom with reserved height for consistency across discount & non-discount products */}
        <div className="mt-auto flex flex-col justify-end w-full">
          {isCallForPrice ? (
            <div className="h-[52px] flex items-center">
              <span className="text-xl font-bold text-slate-900 dark:text-white">
                Call for price
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-start gap-1 w-full">
              {/* Main Price */}
              <div className="text-xl sm:text-[22px] font-bold tracking-tight text-slate-900 dark:text-white">
                ৳{currentPrice.toLocaleString('en-US')}
              </div>

              {/* Sub-row: Strikethrough price + discount pill (min-height keeps height consistent) */}
              <div className="min-h-[24px] flex items-center">
                {hasDiscount ? (
                  <div className="flex flex-wrap items-center gap-2 pt-0.5">
                    <span className="text-sm font-normal text-slate-400 line-through dark:text-slate-500 tabular-nums">
                      ৳{regularPrice.toLocaleString('en-US')}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-[#dcfce7] px-2.5 py-0.5 text-xs font-semibold text-[#16a34a] dark:bg-emerald-950/70 dark:text-emerald-400">
                      ৳ {savingsAmount.toLocaleString('en-US')} OFF
                    </span>
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
