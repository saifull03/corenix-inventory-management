'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';

export interface Banner {
  id: number;
  title: string;
  subtitle?: string;
  description?: string;
  image_url: string;
  link_url: string;
  button_text?: string;
  cta2_text?: string;
  cta2_link?: string;
  badge_text?: string;
  text_color?: string;
  position: string;
  order_index: number;
  is_active: boolean;
}

interface HeroSliderProps {
  initialBanners?: Banner[];
  initialCollageBanners?: Banner[];
}

const DEFAULT_SLIDES: Banner[] = [
  {
    id: 101,
    title: 'Custom PC Builder Engine',
    subtitle: 'Zero Compatibility Errors',
    description: 'Verify component socket, TDP wattage, and form factor compatibility in real-time before you order.',
    image_url: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?auto=format&fit=crop&w=1600&q=80',
    link_url: '/pc-builder',
    button_text: 'Build Your PC',
    cta2_text: 'Explore Parts',
    cta2_link: '/category/components',
    badge_text: 'Live Compatibility Check',
    position: 'hero',
    order_index: 1,
    is_active: true,
  },
  {
    id: 102,
    title: 'GeForce RTX 50 Series',
    subtitle: 'Next-Gen Blackwell Architecture',
    description: 'Experience DLSS 4 AI frame generation, extreme ray tracing, and ultra-fast GDDR7 memory speeds.',
    image_url: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=1600&q=80',
    link_url: '/category/graphics-card',
    button_text: 'Shop GPUs',
    cta2_text: 'View Specs',
    cta2_link: '/category/graphics-card',
    badge_text: 'In Stock & Ready to Ship',
    position: 'hero',
    order_index: 2,
    is_active: true,
  },
  {
    id: 103,
    title: 'Enterprise Brand Desktops & Macs',
    subtitle: 'Official Manufacturer Warranty',
    description: 'Official HP ProDesk, Dell OptiPlex, Lenovo ThinkCentre, and Apple Mac Studio with multi-branch stock.',
    image_url: 'https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=1600&q=80',
    link_url: '/category/desktop',
    button_text: 'Explore Desktops',
    cta2_text: 'All-in-One PCs',
    cta2_link: '/category/all-in-one-pc',
    badge_text: 'Official HP • Dell • Lenovo • Apple',
    position: 'hero',
    order_index: 3,
    is_active: true,
  },
];

const DEFAULT_COLLAGE_PROMOS: Banner[] = [
  {
    id: 201,
    title: 'NVIDIA RTX 50 Series',
    link_url: '/category/graphics-card',
    image_url: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=800&q=80',
    position: 'hero_collage',
    order_index: 1,
    is_active: true,
  },
  {
    id: 202,
    title: 'Pre-Built PC & Apple Mac',
    link_url: '/category/desktop',
    image_url: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&w=800&q=80',
    position: 'hero_collage',
    order_index: 2,
    is_active: true,
  },
];

export default function HeroSlider({
  initialBanners = [],
  initialCollageBanners = [],
}: HeroSliderProps) {
  const [banners, setBanners] = useState<Banner[]>(
    initialBanners.length > 0 ? initialBanners : DEFAULT_SLIDES
  );
  const [collageBanners, setCollageBanners] = useState<Banner[]>(
    initialCollageBanners.length > 0 ? initialCollageBanners : DEFAULT_COLLAGE_PROMOS
  );
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const progressRef = useRef<NodeJS.Timeout | null>(null);
  const SLIDE_DURATION = 5000;

  // Auto-fetch if no initial banners provided
  useEffect(() => {
    if (initialBanners.length === 0) {
      fetch('/api/admin/banners?position=hero&active=true')
        .then((r) => r.json())
        .then((d) => {
          if (d.success && d.banners && d.banners.length > 0) {
            setBanners(d.banners);
          }
        })
        .catch(() => {});
    }

    if (initialCollageBanners.length === 0) {
      fetch('/api/admin/banners?position=hero_collage&active=true')
        .then((r) => r.json())
        .then((d) => {
          if (d.success && d.banners && d.banners.length > 0) {
            setCollageBanners(d.banners);
          }
        })
        .catch(() => {});
    }
  }, [initialBanners.length, initialCollageBanners.length]);

  const goTo = useCallback(
    (index: number) => {
      if (isTransitioning || banners.length <= 1) return;
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrent(index);
        setIsTransitioning(false);
      }, 350);
    },
    [isTransitioning, banners.length]
  );

  const next = useCallback(() => {
    goTo((current + 1) % banners.length);
  }, [current, banners.length, goTo]);

  const prev = useCallback(() => {
    goTo((current - 1 + banners.length) % banners.length);
  }, [current, banners.length, goTo]);

  // Auto-advance timer
  useEffect(() => {
    if (banners.length <= 1 || isPaused) return;
    progressRef.current = setTimeout(next, SLIDE_DURATION);
    return () => {
      if (progressRef.current) clearTimeout(progressRef.current);
    };
  }, [current, isPaused, banners.length, next]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [next, prev]);

  // Touch/swipe support
  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.touches[0].clientX);
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const delta = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 50) delta > 0 ? next() : prev();
    setTouchStart(null);
  };

  const banner = banners[current] || banners[0];

  // Ensure 2 collage cards are always filled even if only 1 is uploaded
  const displayCollageBanners: Banner[] =
    collageBanners.length >= 2
      ? collageBanners.slice(0, 2)
      : collageBanners.length === 1
      ? [collageBanners[0], DEFAULT_COLLAGE_PROMOS[1]]
      : DEFAULT_COLLAGE_PROMOS.slice(0, 2);

  return (
    <div className="max-w-[1440px] mx-auto px-4 py-4 sm:py-5">
      <div className="grid grid-cols-1 items-stretch gap-3.5 sm:gap-4 lg:grid-cols-12">
        {/* ========================================================================= */}
        {/* LEFT HALF / AREA: INTERACTIVE SLIDER CAROUSEL (Approx. 65% width)        */}
        {/* ========================================================================= */}
        <div
          className="relative flex min-h-0 flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/60 bg-navy-950 shadow-lg sm:rounded-3xl dark:border-slate-800/80 lg:col-span-7 lg:aspect-[16/9] xl:col-span-8"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          aria-label="Hero banner carousel"
        >
          {/* Slides Images & Gradient Overlays */}
          {banners.map((b, i) => (
            <div
              key={b.id || i}
              className="absolute inset-0 transition-opacity duration-700 ease-in-out"
              style={{ opacity: i === current ? 1 : 0, zIndex: i === current ? 2 : 1 }}
              aria-hidden={i !== current}
            >
              {/* Background image: Crystal Clear, 100% Brightness */}
              <div
                className="absolute inset-[-2px] bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage: `url(${b.image_url})`,
                  animation: i === current
                    ? `${i % 2 === 0 ? 'heroZoomIn' : 'heroZoomOut'} ${SLIDE_DURATION}ms ease-out both`
                    : 'none',
                  transformOrigin: 'center center',
                  willChange: i === current ? 'transform' : 'auto',
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  contain: 'paint',
                }}
              />
              {/* Ultra light subtle vignette only for soft text legibility, NO heavy black blur */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent" />
            </div>
          ))}

          {/* Slide Content */}
          <div className="relative z-10 p-6 sm:p-10 md:p-12 flex flex-col justify-between h-full flex-1">
            {/* Top Slide Badge */}
            <div className="flex items-center">
              {banner.badge_text && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-bold backdrop-blur-md shadow-xs">
                  <span>{banner.badge_text}</span>
                </div>
              )}
            </div>

            {/* Middle Main Titles */}
            <div
              className="my-auto py-6 max-w-xl"
              style={{
                opacity: isTransitioning ? 0 : 1,
                transition: 'opacity 0.35s ease',
              }}
            >
              {/* Subtitle */}
              {banner.subtitle && (
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="w-1.5 h-4 bg-sky-400 rounded-full shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
                  <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-sky-300 drop-shadow-md">
                    {banner.subtitle}
                  </span>
                </div>
              )}

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.15] mb-3 drop-shadow-[0_2px_16px_rgba(0,0,0,0.8)]">
                {banner.title}
              </h1>

              {/* Description */}
              {banner.description && (
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-lg drop-shadow-md line-clamp-3">
                  {banner.description}
                </p>
              )}

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3 mt-6">
                <Link
                  href={banner.link_url}
                  className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-sky-500/30 transition-all hover:scale-102 active:scale-98"
                >
                  <span>{banner.button_text || 'Shop Now'}</span>
                </Link>

                {banner.cta2_text && banner.cta2_link && (
                  <Link
                    href={banner.cta2_link}
                    className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border border-white/30 hover:border-white/60 text-white font-bold text-xs sm:text-sm hover:bg-white/10 flex items-center gap-1.5 transition-all backdrop-blur-md"
                  >
                    <span>{banner.cta2_text}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>

            {/* Bottom Progress Bar & Slide Dots */}
            {banners.length > 1 && (
              <div className="flex items-center gap-2 pt-2">
                {banners.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    className="relative overflow-hidden transition-all duration-300 focus:outline-none cursor-pointer"
                    style={{
                      height: '4px',
                      width: i === current ? '36px' : '14px',
                      borderRadius: '2px',
                      backgroundColor: i === current ? '#38BDF8' : 'rgba(255,255,255,0.3)',
                    }}
                    aria-label={`Go to slide ${i + 1}`}
                  >
                    {i === current && !isPaused && (
                      <span
                        className="absolute inset-y-0 left-0 bg-white/70 rounded"
                        style={{
                          animation: `slideProgress ${SLIDE_DURATION}ms linear forwards`,
                          width: '100%',
                        }}
                      />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Left & Right Nav Arrows */}
          {banners.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 sm:w-9 h-8 sm:h-9 rounded-full bg-black/40 hover:bg-black/80 border border-white/20 text-white flex items-center justify-center backdrop-blur-md transition-all hover:scale-110 focus:outline-none cursor-pointer"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-4 sm:w-5 h-4 sm:h-5" />
              </button>

              <button
                onClick={next}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 sm:w-9 h-8 sm:h-9 rounded-full bg-black/40 hover:bg-black/80 border border-white/20 text-white flex items-center justify-center backdrop-blur-md transition-all hover:scale-110 focus:outline-none cursor-pointer"
                aria-label="Next slide"
              >
                <ChevronRight className="w-4 sm:w-5 h-4 sm:h-5" />
              </button>
            </>
          )}
        </div>

        {/* ========================================================================= */}
        {/* RIGHT HALF / AREA: 2 COLLAGE PROMOTIONAL PICTURES (LINK ONLY, NO BLUR)   */}
        {/* ========================================================================= */}
        <div className="grid min-h-0 grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4 lg:col-span-5 lg:flex lg:flex-col xl:col-span-4">
          {displayCollageBanners.map((promo, idx) => (
            <Link
              key={promo.id || idx}
              href={promo.link_url || '/products'}
              className="group relative block min-h-[190px] flex-1 overflow-hidden rounded-2xl border border-slate-200/80 bg-navy-950 shadow-md transition-shadow duration-300 hover:border-sky-500/50 hover:shadow-xl sm:min-h-[210px] sm:rounded-3xl lg:min-h-0 dark:border-slate-800/90"
            >
              {/* 100% Crisp, Clean Picture - NO TEXT, NO BLACK BLUR */}
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 ease-out group-hover:scale-105"
                style={{ backgroundImage: `url(${promo.image_url})` }}
              />
            </Link>
          ))}
        </div>
      </div>

      {/* Progress Animation Style */}
      <style jsx>{`
        @keyframes slideProgress {
          from {
            transform: scaleX(0);
            transform-origin: left;
          }
          to {
            transform: scaleX(1);
            transform-origin: left;
          }
        }

        @keyframes heroZoomIn {
          from {
            transform: translate3d(0, 0, 0) scale(1);
          }
          to {
            transform: translate3d(0, 0, 0) scale(1.04);
          }
        }

        @keyframes heroZoomOut {
          from {
            transform: translate3d(0, 0, 0) scale(1.04);
          }
          to {
            transform: translate3d(0, 0, 0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
