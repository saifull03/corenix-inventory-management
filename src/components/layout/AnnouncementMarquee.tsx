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
          scrolldelay?: number;
          scrollamount?: number;
          align?: string;
          behavior?: string;
        };
      }
    }
  }
}

export default function AnnouncementMarquee({ messages }: { messages: string[] }) {
  if (messages.length === 0) return null;

  return (
    <div className="overflow-hidden border-b border-slate-200/80 bg-slate-900 px-4 py-2 text-center text-xs font-semibold text-white dark:border-slate-800">
      <marquee
        onMouseOut={(event) => (event.currentTarget as MarqueeElement).start()}
        onMouseOver={(event) => (event.currentTarget as MarqueeElement).stop()}
        scrolldelay={1}
        scrollamount={3}
        align="center"
        behavior="scroll"
      >
        {messages.map((message, index) => (
          <span key={`${message}-${index}`} className="mx-8">{message}</span>
        ))}
      </marquee>
    </div>
  );
}
