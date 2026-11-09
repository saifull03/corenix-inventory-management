'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X } from 'lucide-react';

interface PromotionPopupProps {
  bannerId?: number;
  imageUrl?: string;
  href?: string;
  alt?: string;
}

export default function PromotionPopup({ bannerId, imageUrl, href = '#', alt = 'Promotional offer' }: PromotionPopupProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!imageUrl || !bannerId || sessionStorage.getItem(`corenix-promotion-dismissed-${bannerId}`) === 'true') return;

    setIsOpen(true);
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = '';
    };
  }, [imageUrl]);

  const closePopup = () => {
    if (bannerId) {
      sessionStorage.setItem(`corenix-promotion-dismissed-${bannerId}`, 'true');
    }
    setIsOpen(false);
    document.body.style.overflow = '';
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closePopup();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen || !imageUrl) return null;

  const image = (
    <Image
      src={imageUrl}
      alt={alt}
      width={1600}
      height={900}
      priority
      sizes="(max-width: 768px) calc(100vw - 2rem), min(1024px, calc(100vw - 4rem))"
      className="block max-h-[78vh] w-full rounded-lg object-contain"
    />
  );

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-md sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-label="Special promotion"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closePopup();
      }}
    >
      <div className="relative w-full max-w-4xl animate-fadeIn">
        <button
          type="button"
          onClick={closePopup}
          className="absolute -right-2 -top-2 z-10 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-700 text-white shadow-lg transition-colors hover:bg-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          aria-label="Close promotion"
        >
          <X className="h-6 w-6" />
        </button>

        {href && href !== '#' ? (
          <Link href={href} onClick={closePopup} className="block overflow-hidden rounded-lg bg-white shadow-2xl">
            {image}
          </Link>
        ) : (
          <div className="overflow-hidden rounded-lg bg-white shadow-2xl">{image}</div>
        )}
      </div>
    </div>
  );
}
