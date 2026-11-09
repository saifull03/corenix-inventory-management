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
    <article className="group pcard flex min-w-0 flex-col overflow-hidden rounded-[24px] border border-slate-200/90 bg-white shadow-[0_4px_14px_rgba(15,23,42,0.07)] transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_10px_24px_rgba(15,23,42,0.12)] dark:border-slate-700/80 dark:bg-navy-900 dark:shadow-[0_4px_14px_rgba(0,0,0,0.2)] dark:hover:border-slate-600 dark:hover:shadow-[0_10px_24px_rgba(0,0,0,0.3)]">
      <div className="media relative h-64 bg-white p-7 sm:h-72 sm:p-8 dark:bg-slate-100">
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start pointer-events-none">
          {isEmiEligible && (
            <span className="bg-white/90 text-slate-600 border border-slate-200 font-semibold text-[10px] px-2 py-1 rounded-full">
              0% EMI
            </span>
          )}
        </div>

        <div className="absolute top-3 right-3 z-10 flex gap-1.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200">
          <button
            type="button"
            onClick={handleWishlistToggle}
            className={`w-8 h-8 rounded-full border border-slate-200 bg-white/95 shadow-sm flex items-center justify-center transition-all hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-slate-500 ${
              isWishlisted
                ? 'text-rose-500 border-rose-200 bg-rose-50 dark:bg-rose-950/30'
                : 'text-slate-500 hover:text-slate-900 hover:border-slate-400'
            }`}
            title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            aria-label="Wishlist"
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current text-rose-500' : ''}`} />
          </button>
          <button
            type="button"
            onClick={handleCompareToggle}
            className={`w-8 h-8 rounded-full border border-slate-200 bg-white/95 shadow-sm flex items-center justify-center transition-all hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-slate-500 ${
              isCompared
                ? 'text-slate-900 border-slate-400 bg-slate-100'
                : 'text-slate-500 hover:text-slate-900 hover:border-slate-400'
            }`}
            title={isCompared ? 'Remove from compare' : 'Add to compare'}
            aria-label="Compare"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Product Photo */}
        <Link
          href={`/product/${product.slug}`}
          className="h-full w-full flex items-center justify-center"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.primary_image || 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=800&q=80'}
            alt={product.name}
            width={400}
            height={400}
            className={`h-full w-full object-contain object-center transition-transform duration-300 group-hover:scale-105 ${
              isOutOfStock ? 'opacity-60 grayscale-[30%]' : ''
            }`}
            loading="lazy"
            decoding="async"
          />
        </Link>
      </div>

      <div className="pbody flex flex-col gap-2 px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
        <h4 className="ptitle min-h-[26px] text-lg font-semibold leading-tight text-slate-900 dark:text-white line-clamp-1">
          <Link
            href={`/product/${product.slug}`}
            title={product.name}
            className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            {product.name}
          </Link>
        </h4>

        <div className="price flex w-full flex-col items-start gap-2">
          {isCallForPrice ? (
            <span className="text-xl font-bold text-slate-900 dark:text-white">
              Call for price
            </span>
          ) : (
            <>
              <span className="block text-xl font-bold text-slate-900 dark:text-white tabular-nums">
                ৳{currentPrice.toLocaleString('en-US')}
              </span>
              {hasDiscount && (
                <div className="flex w-full flex-wrap items-center gap-2">
                  <span className="old text-base text-slate-500 dark:text-slate-400 line-through tabular-nums">
                    ৳{regularPrice.toLocaleString('en-US')}
                  </span>
                  <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                    ৳ {savingsAmount.toLocaleString('en-US')} OFF
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </article>
  );
}
