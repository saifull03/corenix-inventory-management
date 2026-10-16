import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { CartProvider } from '@/context/CartContext';

export const metadata: Metadata = {
  title: 'CORENIX | Enterprise Computing & Technology Ecosystem',
  description: 'Official retailer for high-performance computer hardware, laptops, PC components, enthusiast custom builds, and multi-branch RMA service in Bangladesh.',
  keywords: 'corenix, computer bd, graphics card price, gaming laptop bd, pc builder bangladesh, msi bd, asus bd, rtx 5060 bd',
  openGraph: {
    title: 'CORENIX | Next-Gen Computing Hardware & Tech Ecosystem',
    description: 'Explore the latest graphics cards, processors, DDR5 memory, gaming displays, and instant multi-branch stock.',
    url: 'https://corenix.com.bd',
    siteName: 'CORENIX Bangladesh',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark font-sans" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('corenix-theme') || 'dark';
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                  document.documentElement.classList.remove('light');
                } else {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.classList.add('light');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="bg-slate-50 text-slate-800 dark:bg-navy-950 dark:text-slate-100 min-h-screen selection:bg-sky-500 selection:text-white font-sans antialiased transition-colors duration-200">
        <ThemeProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

