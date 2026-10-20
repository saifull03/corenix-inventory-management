import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // Complete Interface Kit Blue Ramp
        blue: {
          50: '#EEF1FD',
          100: '#DCE3FB',
          200: '#B9C6F6',
          300: '#8EA2EF',
          400: '#5F78E5',
          500: '#3B57DA',
          600: '#2340D0',
          700: '#1B32A8',
          800: '#172A85',
          900: '#14246A',
          950: '#0C1640',
        },
        // Complete Interface Kit Orange / Deal Ramp
        orange: {
          50: '#FFF4EC',
          100: '#FFE4D1',
          200: '#FEC6A1',
          300: '#FC9F66',
          400: '#F97A33',
          500: '#EE5F12',
          600: '#D94E0B',
          700: '#B8400A',
          800: '#93340D',
          900: '#772D0F',
          950: '#4A1A06',
        },
        // Complete Interface Kit Grey Ramp
        grey: {
          0: '#FFFFFF',
          50: '#F3F5F8',
          100: '#E9EDF2',
          200: '#DCE1E8',
          300: '#C3CAD5',
          400: '#959FAF',
          500: '#687284',
          600: '#4B5465',
          700: '#353D4C',
          800: '#222833',
          900: '#161A23',
        },
        // Semantic kit tokens (dynamic with theme)
        kit: {
          bg: 'var(--bg)',
          surface: 'var(--surface)',
          'surface-2': 'var(--surface-2)',
          'surface-img': 'var(--surface-img)',
          'surface-inverse': 'var(--surface-inverse)',
          border: 'var(--border)',
          'border-strong': 'var(--border-strong)',
          text: 'var(--text)',
          'text-muted': 'var(--text-muted)',
          'text-subtle': 'var(--text-subtle)',
          'text-inverse': 'var(--text-inverse)',
          'text-disabled': 'var(--text-disabled)',
          primary: 'var(--primary)',
          'primary-hover': 'var(--primary-hover)',
          'primary-active': 'var(--primary-active)',
          'primary-soft': 'var(--primary-soft)',
          'primary-on': 'var(--primary-on)',
          link: 'var(--link)',
          accent: 'var(--accent)',
          'accent-hover': 'var(--accent-hover)',
          'accent-soft': 'var(--accent-soft)',
          'accent-on': 'var(--accent-on)',
          sticker: 'var(--sticker)',
          danger: 'var(--danger)',
        },
        // Brand palette aligned with interface kit primary
        brand: {
          50: '#EEF1FD',
          100: '#DCE3FB',
          200: '#B9C6F6',
          300: '#8EA2EF',
          400: '#5F78E5',
          500: '#2340D0',
          600: '#1B32A8',
          700: '#172A85',
          800: '#14246A',
          900: '#0C1640',
          DEFAULT: '#2340D0',
        },
        // Night Blue theme surfaces from kit
        navy: {
          800: '#1D2540',
          850: '#151C31',
          900: '#151C31',
          950: '#0E1426',
        },
        accent: {
          blue: '#2340D0',
          purple: '#6236C9',
          amber: '#EE5F12',
          orange: '#B8400A',
          rose: '#C42B1C',
          emerald: '#087443',
        }
      },
      fontFamily: {
        ui: ["var(--font-ui)", "Instrument Sans", "Hind Siliguri", "system-ui", "-apple-system", "sans-serif"],
        bn: ["var(--font-bn)", "Hind Siliguri", "Noto Sans Bengali", "sans-serif"],
        sans: ["var(--font-ui)", "Instrument Sans", "Hind Siliguri", "Plus Jakarta Sans", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "Menlo", "monospace"],
      },
      borderRadius: {
        badge: "var(--r-badge, 4px)",
        control: "var(--r-control, 8px)",
        card: "var(--r-card, 12px)",
        sheet: "var(--r-sheet, 16px)",
        pill: "var(--r-pill, 999px)",
      },
      boxShadow: {
        lift: "var(--lift)",
        overlay: "var(--overlay)",
        modal: "var(--modal)",
      },
      transitionDuration: {
        fast: "var(--dur-fast, 150ms)",
        base: "var(--dur-base, 200ms)",
        slow: "var(--dur-slow, 250ms)",
      },
      transitionTimingFunction: {
        kit: "var(--ease, cubic-bezier(.2,0,0,1))",
      }
    },
  },
  plugins: [],
};

export default config;
