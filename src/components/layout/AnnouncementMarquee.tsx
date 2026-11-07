'use client';

import React from 'react';

interface MarqueeElement extends HTMLElement {
  start: () => void;
  stop: () => void;
}

declare global {
  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        marquee: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
          scrollDelay?: number;
          scrollAmount?: number;
          align?: string;
          behavior?: string;
        };
      }
    }
  }
}

export default function AnnouncementMarquee() {
  return (
    <div className="overflow-hidden border-b border-slate-200/80 bg-slate-900 px-4 py-2 text-center text-xs font-semibold text-white dark:border-slate-800">
      <marquee
        onMouseOut={(event) => (event.currentTarget as MarqueeElement).start()}
        onMouseOver={(event) => (event.currentTarget as MarqueeElement).stop()}
        scrollDelay={1}
        scrollAmount={3}
        align="center"
        behavior="scroll"
      >
        <span className="mx-8">Genuine products with official warranty</span>
        <span className="mx-8">Nationwide delivery available</span>
        <span className="mx-8">Build your perfect PC with our compatibility builder</span>
        <span className="mx-8">Visit our showrooms for expert support</span>
      </marquee>
    </div>
  );
}
