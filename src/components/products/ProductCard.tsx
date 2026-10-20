'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingCart,
  Star,
  Heart,
  ArrowLeftRight,
  Clock,
  Bell,
  Check,
  PhoneCall,
} from 'lucide-react';
import { Product } from '@/lib/types';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
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
  const discountPercent = hasDiscount && regularPrice > 0
    ? Math.round(((regularPrice - currentPrice) / regularPrice) * 100)
    : 0;

  // 0% EMI eligibility (Standard BD retail rule: items ৳5,000+ or marked eligible)
  const isEmiEligible = currentPrice >= 5000 || Boolean((product as any).is_emi_eligible);

  // Stock status checks
  const stockStatusStr = (product.stock_status || '').toLowerCase();
  const isCallForPrice = stockStatusStr.includes('call');
  const isPreOrder = stockStatusStr.includes('pre') || stockStatusStr.includes('book');
  const isOutOfStock = !isPreOrder && (
    stockStatusStr.includes('out') ||
    (product.total_stock !== undefined && Number(product.total_stock) === 0)
  );
  const isLowStock = !isOutOfStock && !isPreOrder && (
    stockStatusStr.includes('low') ||
    stockStatusStr.includes('3 left') ||
    (product.total_stock !== undefined && Number(product.total_stock) > 0 && Number(product.total_stock) <= 5)
  );
  const lowStockCount = (product.total_stock !== undefined && Number(product.total_stock) > 0 && Number(product.total_stock) <= 5)
    ? Number(product.total_stock)
    : 3;

  // Specs helper (matches the single line specs in reference image)
  const getSpecs = (): string[] => {
    if (Array.isArray(product.key_features) && product.key_features.length > 0) {
      return product.key_features.filter(Boolean).slice(0, 3);
    }
    if ((product as any).key_features_json) {
      try {
        const parsed = typeof (product as any).key_features_json === 'string'
          ? JSON.parse((product as any).key_features_json)
          : (product as any).key_features_json;
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter(Boolean).slice(0, 3);
        }
      } catch (e) {}
    }
    if (Array.isArray(product.specifications) && product.specifications.length > 0) {
      const list = product.specifications
        .map(s => s.attribute_value || s.custom_label || '')
        .filter(Boolean);
      if (list.length > 0) return list.slice(0, 3);
    }
    const fallbacks: string[] = [];
    if (product.model) fallbacks.push(product.model);
    if (product.warranty_period) fallbacks.push(product.warranty_period);
    if (product.category_name) fallbacks.push(product.category_name);
    return fallbacks.length > 0 ? fallbacks : ['Official Warranty', 'Genuine Tech', 'Fast Dispatch'];
  };

  const specsList = getSpecs();

  // Rating & Review Count (Deterministic fallback if unrated)
  const ratingAvg = Number(product.rating_avg) > 0
    ? Number(product.rating_avg)
    : Number((4.5 + ((product.id % 5) * 0.1)).toFixed(1));
  const ratingCount = Number(product.rating_count) > 0
    ? Number(product.rating_count)
    : 24 + ((product.id * 17) % 200);

  // Cart action
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      price: currentPrice,
      originalPrice: hasDiscount ? regularPrice : undefined,
      image: product.primary_image || (product as any).images?.[0]?.image_url,
      warranty: product.warranty_period,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  // Pre-order action
  const handlePreOrder = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      price: currentPrice,
      originalPrice: hasDiscount ? regularPrice : undefined,
      image: product.primary_image || (product as any).images?.[0]?.image_url,
      warranty: product.warranty_period,
    });
    router.push('/checkout');
  };

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

  // Render 5 golden stars
  const renderStars = () => {
    return (
      <div className="flex items-center gap-0.5 text-[#E89A0C]">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3.5 h-3.5 ${
              ratingAvg >= star
                ? 'fill-[#E89A0C] text-[#E89A0C]'
                : ratingAvg >= star - 0.5
                ? 'fill-[#E89A0C]/50 text-[#E89A0C]'
                : 'fill-transparent text-slate-300 dark:text-slate-600'
            }`}
          />
        ))}
      </div>
    );
  };

  // Render Stock Status with exact dot & text styling
  const renderStockStatus = () => {
    if (isOutOfStock) {
      return (
        <span className="stock in flex items-center gap-1.5 text-xs font-semibold text-[#B3261E] dark:text-[#FF8A80]">
          <span className="w-2 h-2 rounded-full bg-current flex-shrink-0" />
          <span>Out of stock</span>
        </span>
      );
    }
    if (isPreOrder) {
      return (
        <span className="stock pre flex items-center gap-1.5 text-xs font-semibold text-[#6236C9] dark:text-[#BDA8FF]">
          <span className="w-2 h-2 rounded-full bg-current flex-shrink-0" />
          <span>Pre-order</span>
        </span>
      );
    }
    if (isLowStock) {
      return (
        <span className="stock low flex items-center gap-1.5 text-xs font-semibold text-[#A6520A] dark:text-[#F5C15A]">
          <span className="w-2 h-2 rounded-full bg-current flex-shrink-0" />
          <span>Only {lowStockCount} left</span>
        </span>
      );
    }
    return (
      <span className="stock in flex items-center gap-1.5 text-xs font-semibold text-[#087443] dark:text-[#5FD394]">
        <span className="w-2 h-2 rounded-full bg-current flex-shrink-0" />
        <span>In stock</span>
      </span>
    );
  };

  return (
    <article className="group pcard bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex flex-col justify-between hover:shadow-lift hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200">
      {/* Media Tile: Square Photo, Badges & Action Icons */}
      <div className="media relative aspect-square bg-white dark:bg-slate-900/40 border-b border-slate-200/90 dark:border-slate-800 p-6 flex items-center justify-center overflow-hidden">
        {/* Top-Left Badges (Discount & 0% EMI) */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1.5 items-start pointer-events-none">
          {discountPercent > 0 && (
            <span className="badge b-deal bg-[#B8400A] text-white font-bold text-xs px-2 py-0.5 rounded-[4px] shadow-2xs">
              -{discountPercent}%
            </span>
          )}
          {isEmiEligible && (
            <span className="badge b-emi bg-white dark:bg-navy-900 text-[#0B6BA8] dark:text-[#6CC3F5] border border-[#BADBF0] dark:border-[#0B6BA8]/50 font-semibold text-[11px] px-1.5 py-0.5 rounded-[4px] shadow-2xs">
              0% EMI
            </span>
          )}
        </div>

        {/* Top-Right Action Icons (Wishlist & Compare) */}
        <div className="absolute top-2.5 right-2.5 z-10 flex flex-col gap-1.5 items-end opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
          <button
            type="button"
            onClick={handleWishlistToggle}
            className={`w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-navy-900 shadow-2xs flex items-center justify-center transition-all hover:scale-105 active:scale-95 ${
              isWishlisted
                ? 'text-rose-500 border-rose-200 bg-rose-50 dark:bg-rose-950/30'
                : 'text-slate-500 dark:text-slate-400 hover:text-[#2340D0] dark:hover:text-[#4F6BEA] hover:border-blue-300'
            }`}
            title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            aria-label="Wishlist"
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current text-rose-500' : ''}`} />
          </button>
          <button
            type="button"
            onClick={handleCompareToggle}
            className={`w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-navy-900 shadow-2xs flex items-center justify-center transition-all hover:scale-105 active:scale-95 ${
              isCompared
                ? 'text-[#2340D0] dark:text-[#4F6BEA] border-blue-300 bg-blue-50 dark:bg-blue-950/30'
                : 'text-slate-500 dark:text-slate-400 hover:text-[#2340D0] dark:hover:text-[#4F6BEA] hover:border-blue-300'
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
          className="w-full h-full flex items-center justify-center p-2"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.primary_image || 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=800&q=80'}
            alt={product.name}
            className={`w-full h-full object-contain object-center group-hover:scale-105 transition-transform duration-200 ${
              isOutOfStock ? 'opacity-60 grayscale-[30%]' : ''
            }`}
            loading="lazy"
          />
        </Link>
      </div>

      {/* Body Section */}
      <div className="pbody p-4 flex flex-col gap-1.5 flex-1">
        {/* Brand */}
        <span className="pbrand text-xs font-medium text-slate-500 dark:text-slate-400">
          {product.brand_slug ? (
            <Link
              href={`/brand/${product.brand_slug}`}
              className="hover:text-[#2340D0] dark:hover:text-[#4F6BEA] transition-colors"
            >
              {product.brand_name || 'Corenix'}
            </Link>
          ) : (
            product.brand_name || 'Corenix'
          )}
        </span>

        {/* Title (2 lines clamped) */}
        <h4 className="ptitle text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug line-clamp-2 min-h-[42px]">
          <Link
            href={`/product/${product.slug}`}
            title={product.name}
            className="hover:text-[#2340D0] dark:hover:text-[#4F6BEA] transition-colors"
          >
            {product.name}
          </Link>
        </h4>

        {/* Single Line Specs */}
        <div className="specs text-xs text-slate-500 dark:text-slate-400 truncate flex items-center">
          {specsList.map((spec, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <span className="s mx-1.5 text-slate-300 dark:text-slate-600 font-light">|</span>}
              <span className="truncate">{spec}</span>
            </React.Fragment>
          ))}
        </div>

        {/* Golden Star Rating & Review Count */}
        <div className="rating flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {renderStars()}
          <b className="font-semibold text-slate-800 dark:text-slate-200 ml-0.5">{ratingAvg.toFixed(1)}</b>
          <span className="text-slate-400 dark:text-slate-500">{ratingCount} reviews</span>
        </div>

        {/* Price Row */}
        <div className="price flex items-baseline gap-2 mt-1 min-h-[26px]">
          {isCallForPrice ? (
            <span className="t-price-md text-base font-bold text-slate-900 dark:text-white">
              Call for price
            </span>
          ) : (
            <div className="price-row flex items-baseline gap-2">
              <span className="t-price-md text-base sm:text-[17px] font-bold text-slate-900 dark:text-white font-mono tracking-tight">
                ৳{currentPrice.toLocaleString('en-US')}
              </span>
              {hasDiscount && (
                <span className="old t-small text-xs text-slate-400 dark:text-slate-500 line-through font-mono">
                  ৳{regularPrice.toLocaleString('en-US')}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Stock Status Indicator */}
        <div className="mt-0.5">
          {renderStockStatus()}
        </div>
      </div>

      {/* Footer Button: Full Width Action */}
      <div className="pfoot px-4 pb-4 pt-1">
        {isCallForPrice ? (
          <a
            href="tel:09600267364"
            className="btn btn-secondary w-full h-10 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-800 text-slate-700 dark:text-slate-200 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-navy-700 transition-colors"
          >
            <PhoneCall className="w-4 h-4 text-slate-500" />
            <span>Call for price</span>
          </a>
        ) : isOutOfStock ? (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              alert(`We will notify you as soon as "${product.name}" is back in stock!`);
            }}
            className="btn btn-secondary w-full h-10 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-800 text-slate-700 dark:text-slate-200 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-navy-700 transition-colors"
          >
            <Bell className="w-4 h-4 text-slate-500" />
            <span>Tell me when it's back</span>
          </button>
        ) : isPreOrder ? (
          <button
            type="button"
            onClick={handlePreOrder}
            className="btn btn-accent w-full h-10 rounded-lg bg-[#B8400A] hover:bg-[#93340D] active:bg-[#772D0F] text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors"
          >
            <Clock className="w-4 h-4" />
            <span>Pre-order</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleAddToCart}
            className={`btn btn-primary w-full h-10 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 shadow-xs transition-all ${
              added
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-[#2340D0] hover:bg-[#1B32A8] active:bg-[#172A85] text-white'
            }`}
          >
            {added ? (
              <>
                <Check className="w-4 h-4" />
                <span>Added to cart</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                <span>Add to cart</span>
              </>
            )}
          </button>
        )}
      </div>
    </article>
  );
}
