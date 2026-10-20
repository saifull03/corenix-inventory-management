'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShoppingCart,
  Check,
  PhoneCall,
  Sparkles,
  Clock,
  Bell,
  Heart,
  ArrowLeftRight,
  MessageCircle,
  Maximize2,
} from 'lucide-react';
import { Product } from '@/lib/types';
import { useCart } from '@/context/CartContext';

interface Props {
  product: Product;
  allImages?: Array<{ image_url: string; alt_text?: string; is_primary: boolean }>;
}

export default function ProductDetailActions({ product, allImages = [] }: Props) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isCompared, setIsCompared] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>(
    product.primary_image || allImages?.[0]?.image_url || ''
  );
  const [isZoomed, setIsZoomed] = useState(false);

  const currentPrice = Number(product.discount_price || product.selling_price || 0);
  const regularPrice = Number(product.selling_price || 0);
  const hasDiscount = Boolean(product.discount_price && product.discount_price < product.selling_price);
  const discountPercent = hasDiscount && regularPrice > 0
    ? Math.round(((regularPrice - currentPrice) / regularPrice) * 100)
    : 0;

  const stockStatusStr = (product.stock_status || '').toLowerCase();
  const isCallForPrice = stockStatusStr.includes('call');
  const isPreOrder = stockStatusStr.includes('pre') || stockStatusStr.includes('book');
  const isOutOfStock = !isPreOrder && (
    stockStatusStr.includes('out') ||
    (product.total_stock !== undefined && Number(product.total_stock) === 0)
  );
  const isUpcoming = stockStatusStr.includes('upcoming') || stockStatusStr.includes('coming');

  const images = allImages.length > 0 ? allImages : (
    product.primary_image ? [{ image_url: product.primary_image, is_primary: true }] : []
  );

  useEffect(() => {
    try {
      const wl = JSON.parse(localStorage.getItem('corenix_wishlist') || '[]');
      setIsWishlisted(Array.isArray(wl) && wl.includes(product.id));
      const cmp = JSON.parse(localStorage.getItem('corenix_compare') || '[]');
      setIsCompared(Array.isArray(cmp) && cmp.includes(product.id));
    } catch (e) {}
  }, [product.id]);

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      price: currentPrice,
      originalPrice: hasDiscount ? regularPrice : undefined,
      image: selectedImage || product.primary_image || '',
      warranty: product.warranty_period,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  const handleBuyNow = () => {
    addToCart({
      id: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      price: currentPrice,
      originalPrice: hasDiscount ? regularPrice : undefined,
      image: selectedImage || product.primary_image || '',
      warranty: product.warranty_period,
    });
    window.location.href = '/checkout';
  };

  const handleWishlistToggle = () => {
    const next = !isWishlisted;
    setIsWishlisted(next);
    try {
      const saved = JSON.parse(localStorage.getItem('corenix_wishlist') || '[]');
      localStorage.setItem('corenix_wishlist', JSON.stringify(
        next ? [...new Set([...saved, product.id])] : saved.filter((id: number) => id !== product.id)
      ));
    } catch (e) {}
  };

  const handleCompareToggle = () => {
    const next = !isCompared;
    setIsCompared(next);
    try {
      const saved = JSON.parse(localStorage.getItem('corenix_compare') || '[]');
      localStorage.setItem('corenix_compare', JSON.stringify(
        next ? [...new Set([...saved, product.id])] : saved.filter((id: number) => id !== product.id)
      ));
    } catch (e) {}
  };

  return (
    <div className="flex flex-col gap-5">
      {/* ── Gallery ── */}
      <div className="flex gap-3">
        {/* Thumbnail Strip */}
        {images.length > 1 && (
          <div className="flex flex-col gap-2 w-[72px] flex-shrink-0">
            {images.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedImage(img.image_url)}
                className={`w-16 h-16 rounded-lg border-2 overflow-hidden bg-white dark:bg-slate-900 flex items-center justify-center transition-all ${
                  selectedImage === img.image_url
                    ? 'border-[#2340D0] dark:border-[#4F6BEA]'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-400'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.image_url}
                  alt={img.alt_text || product.name}
                  className="w-full h-full object-contain p-1"
                />
              </button>
            ))}
          </div>
        )}

        {/* Main Photo */}
        <div
          className="relative flex-1 aspect-square rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden cursor-zoom-in group"
          onClick={() => setIsZoomed(true)}
        >
          {/* Earn Points ribbon */}
          <div className="absolute -left-8 top-6 w-32 flex items-center justify-center z-10 pointer-events-none" style={{ transform: 'rotate(-45deg)' }}>
            <div className="bg-[#B8400A] text-white font-bold text-[9px] tracking-wider uppercase py-1 px-6 shadow-md whitespace-nowrap">
              EARN 200 POINTS
            </div>
          </div>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={selectedImage || product.primary_image || 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=800&q=80'}
            alt={product.name}
            className="w-4/5 h-4/5 object-contain group-hover:scale-105 transition-transform duration-300"
          />

          {/* Zoom button */}
          <button
            type="button"
            className="absolute bottom-3 right-3 w-8 h-8 rounded-lg bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white shadow-sm"
            onClick={(e) => { e.stopPropagation(); setIsZoomed(true); }}
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Zoom Lightbox */}
      {isZoomed && (
        <div
          className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setIsZoomed(false)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={selectedImage || product.primary_image || ''}
            alt={product.name}
            className="max-h-[90vh] max-w-[90vw] object-contain bg-white rounded-xl p-4"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* ── Action Buttons ── */}
      <div className="flex flex-col gap-3">
        {/* Row 1: Wishlist + Add to Cart + Buy Now */}
        <div className="flex gap-2">
          {/* Wishlist */}
          <button
            type="button"
            onClick={handleWishlistToggle}
            className={`flex items-center gap-2 px-4 h-11 rounded-lg border font-semibold text-sm transition-all flex-shrink-0 ${
              isWishlisted
                ? 'border-rose-300 bg-rose-50 text-rose-600 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-400'
                : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-navy-900 text-slate-700 dark:text-slate-200 hover:border-slate-400 dark:hover:border-slate-500'
            }`}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current text-rose-500' : ''}`} />
            <span>Add to Wishlist</span>
          </button>

          {isCallForPrice ? (
            <a
              href="tel:09600267364"
              className="flex-1 h-11 rounded-lg bg-[#2340D0] hover:bg-[#1B32A8] text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Call for Price</span>
            </a>
          ) : isOutOfStock ? (
            <button
              type="button"
              onClick={() => alert(`We'll notify you when "${product.name}" is back!`)}
              className="flex-1 h-11 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-navy-900 text-slate-600 dark:text-slate-300 font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
            >
              <Bell className="w-4 h-4" />
              <span>Notify Me</span>
            </button>
          ) : isUpcoming ? (
            <button
              type="button"
              onClick={() => alert(`You'll be notified on launch of "${product.name}"!`)}
              className="flex-1 h-11 rounded-lg bg-amber-500 hover:bg-amber-400 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>Notify on Release</span>
            </button>
          ) : (
            <>
              {/* Add to Cart */}
              <button
                type="button"
                onClick={handleAddToCart}
                className={`flex-1 h-11 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm ${
                  added
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : isPreOrder
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : 'bg-slate-900 hover:bg-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 text-white'
                }`}
              >
                {added ? <Check className="w-4 h-4" /> : isPreOrder ? <Clock className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                <span>{added ? 'Added!' : isPreOrder ? 'Pre-Order' : 'Add To Cart'}</span>
              </button>

              {/* Buy Now */}
              <button
                type="button"
                onClick={handleBuyNow}
                className="flex-1 h-11 rounded-lg bg-[#B8400A] hover:bg-[#93340D] active:bg-[#772D0F] text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <span>{isPreOrder ? 'Book Now' : 'Buy Now'}</span>
              </button>
            </>
          )}
        </div>

        {/* Row 2: Contact Options */}
        <div className="flex gap-2">
          <a
            href="https://m.me/corenixbd"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 h-10 rounded-full border border-[#1877F2] text-[#1877F2] dark:border-blue-500 dark:text-blue-400 font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-[#1877F2]/5 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Via Messenger</span>
          </a>
          <a
            href="tel:09600267364"
            className="flex-1 h-10 rounded-full border border-purple-400 text-purple-600 dark:border-purple-500 dark:text-purple-400 font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-colors"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Via Hotline Call</span>
          </a>
          <a
            href="https://wa.me/8809600267364"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 h-10 rounded-full border border-[#25D366] text-[#25D366] dark:border-emerald-500 dark:text-emerald-400 font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-colors"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            <span>Via WhatsApp</span>
          </a>
        </div>

        {/* Compare toggle row */}
        <button
          type="button"
          onClick={handleCompareToggle}
          className={`flex items-center gap-2 text-xs font-medium transition-colors self-start ${
            isCompared
              ? 'text-[#2340D0] dark:text-[#4F6BEA]'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          <ArrowLeftRight className="w-3.5 h-3.5" />
          <span>{isCompared ? 'Remove from Compare' : 'Add to Compare'}</span>
        </button>

        {/* PC Builder link */}
        {product.is_pc_builder && !isOutOfStock && (
          <Link
            href={`/pc-builder?select=${product.pc_builder_component}&pid=${product.id}`}
            className="w-full py-2.5 px-4 rounded-lg border border-[#2340D0]/30 dark:border-[#4F6BEA]/30 bg-[#2340D0]/5 dark:bg-[#4F6BEA]/5 text-[#2340D0] dark:text-[#4F6BEA] font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#2340D0]/10 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Add to Custom PC Build ({product.pc_builder_component?.toUpperCase()})</span>
          </Link>
        )}
      </div>
    </div>
  );
}
