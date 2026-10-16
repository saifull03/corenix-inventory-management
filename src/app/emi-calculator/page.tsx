'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useCart } from '@/context/CartContext';
import {
  CreditCard,
  Calculator,
  Percent,
  Calendar,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Printer,
  Share2,
  Building2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
  Clock,
  Layers,
  ShoppingBag,
  Zap,
  Info,
  TrendingDown,
  Landmark,
  BadgeCheck,
  Check
} from 'lucide-react';

// South Asian English words converter
function numberToWords(num: number): string {
  const integerPart = Math.floor(Math.abs(num));
  if (integerPart === 0) return 'Zero Taka Only';

  const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertTwoDigits(n: number): string {
    if (n < 20) return units[n];
    return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + units[n % 10] : '');
  }

  function convertThreeDigits(n: number): string {
    let str = '';
    if (n >= 100) {
      str += units[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n > 0) {
      str += convertTwoDigits(n) + ' ';
    }
    return str.trim();
  }

  let crore = Math.floor(integerPart / 10000000);
  let remCrore = integerPart % 10000000;
  let lakh = Math.floor(remCrore / 100000);
  let remLakh = remCrore % 100000;
  let thousand = Math.floor(remLakh / 1000);
  let remThousand = remLakh % 1000;
  let hundreds = remThousand;

  let words = '';
  if (crore > 0) words += convertThreeDigits(crore) + ' Crore ';
  if (lakh > 0) words += convertTwoDigits(lakh) + ' Lakh ';
  if (thousand > 0) words += convertTwoDigits(thousand) + ' Thousand ';
  if (hundreds > 0) words += convertThreeDigits(hundreds) + ' ';

  return words.trim() + ' Taka Only';
}

interface BankPartner {
  id: string;
  name: string;
  shortName: string;
  cards: string;
  maxTenure: number;
  zeroPercentAvailable: boolean;
  typicalFee: number; // in percent
  badge: string;
}

const PARTNER_BANKS: BankPartner[] = [
  {
    id: 'city-amex',
    name: 'City Bank PLC',
    shortName: 'City Amex / Visa',
    cards: 'American Express & City Visa/Mastercard',
    maxTenure: 36,
    zeroPercentAvailable: true,
    typicalFee: 0,
    badge: 'Up to 36 Months',
  },
  {
    id: 'brac',
    name: 'BRAC Bank PLC',
    shortName: 'BRAC Bank',
    cards: 'Visa, Mastercard & Diners Club',
    maxTenure: 24,
    zeroPercentAvailable: true,
    typicalFee: 0,
    badge: 'Up to 24 Months',
  },
  {
    id: 'ebl',
    name: 'Eastern Bank PLC (EBL)',
    shortName: 'Eastern Bank',
    cards: 'EBL Visa & Mastercard (0% Zip EMI)',
    maxTenure: 24,
    zeroPercentAvailable: true,
    typicalFee: 0,
    badge: '0% Zip EMI',
  },
  {
    id: 'scb',
    name: 'Standard Chartered Bank',
    shortName: 'SCB (Kuch Bhi EMI)',
    cards: 'Standard Chartered Credit Cards',
    maxTenure: 24,
    zeroPercentAvailable: true,
    typicalFee: 0,
    badge: 'Kuch Bhi EMI',
  },
  {
    id: 'dbbl',
    name: 'Dutch-Bangla Bank (DBBL)',
    shortName: 'DBBL Nexus / Visa',
    cards: 'DBBL Credit Cards',
    maxTenure: 12,
    zeroPercentAvailable: true,
    typicalFee: 0,
    badge: 'Up to 12 Months',
  },
  {
    id: 'prime',
    name: 'Prime Bank PLC',
    shortName: 'Prime Bank',
    cards: 'Prime Bank Credit Cards',
    maxTenure: 18,
    zeroPercentAvailable: true,
    typicalFee: 0,
    badge: 'Up to 18 Months',
  },
  {
    id: 'mtb',
    name: 'Mutual Trust Bank (MTB)',
    shortName: 'MTB Card',
    cards: 'MTB Credit Cards',
    maxTenure: 24,
    zeroPercentAvailable: true,
    typicalFee: 0,
    badge: 'Up to 24 Months',
  },
  {
    id: 'dhaka-bank',
    name: 'Dhaka Bank PLC',
    shortName: 'Dhaka Bank',
    cards: 'Dhaka Bank Cards',
    maxTenure: 18,
    zeroPercentAvailable: true,
    typicalFee: 0,
    badge: 'Up to 18 Months',
  },
];

function EmiCalculatorContent() {
  const searchParams = useSearchParams();
  const { cartItems } = useCart();

  // Primary Inputs
  const [productPrice, setProductPrice] = useState<number>(75000);
  const [downPayment, setDownPayment] = useState<number>(0);
  const [tenureMonths, setTenureMonths] = useState<number>(12);
  const [interestRate, setInterestRate] = useState<number>(0); // 0% default
  const [calcScheme, setCalcScheme] = useState<'zero_percent' | 'reducing_balance' | 'flat_rate'>('zero_percent');
  const [bankFeePercent, setBankFeePercent] = useState<number>(0);
  const [selectedBank, setSelectedBank] = useState<string>('city-amex');
  const [productTitle, setProductTitle] = useState<string>('');

  // UI state
  const [showFullAmortization, setShowFullAmortization] = useState<boolean>(false);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);

  // Cart total helper
  const cartTotal = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + (item.price || 0) * item.quantity, 0);
  }, [cartItems]);

  // Read URL params if coming from a specific product (e.g. ?amount=85000&title=GeForce+RTX+5060)
  useEffect(() => {
    const amt = searchParams.get('amount') || searchParams.get('price');
    const title = searchParams.get('title') || searchParams.get('name');
    if (amt) {
      const parsed = parseFloat(amt);
      if (!isNaN(parsed) && parsed > 0) {
        setProductPrice(Math.round(parsed));
      }
    }
    if (title) {
      setProductTitle(decodeURIComponent(title));
    }
  }, [searchParams]);

  // Auto-manage scheme vs interest rate
  const handleSchemeChange = (scheme: 'zero_percent' | 'reducing_balance' | 'flat_rate') => {
    setCalcScheme(scheme);
    if (scheme === 'zero_percent') {
      setInterestRate(0);
    } else if (scheme === 'reducing_balance' && interestRate === 0) {
      setInterestRate(9.5); // standard bank loan rate
    } else if (scheme === 'flat_rate' && interestRate === 0) {
      setInterestRate(7.0);
    }
  };

  // Down payment percentage helpers
  const downPaymentPercent = useMemo(() => {
    if (productPrice <= 0) return 0;
    return Math.round((downPayment / productPrice) * 100);
  }, [downPayment, productPrice]);

  const setDownPaymentByPercent = (percent: number) => {
    const val = Math.round((productPrice * percent) / 100);
    setDownPayment(val);
  };

  // Principal Loan Amount
  const principal = useMemo(() => {
    return Math.max(0, productPrice - downPayment);
  }, [productPrice, downPayment]);

  // Processing fee amount
  const bankProcessingFeeAmount = useMemo(() => {
    if (principal <= 0 || bankFeePercent <= 0) return 0;
    return Math.round((principal * bankFeePercent) / 100);
  }, [principal, bankFeePercent]);

  // Financial Calculations
  const calculationResults = useMemo(() => {
    const P = principal;
    const n = Math.max(1, tenureMonths);

    let monthlyEmi = 0;
    let totalInterest = 0;
    const schedule: Array<{
      month: number;
      beginningBalance: number;
      emi: number;
      principal: number;
      interest: number;
      endingBalance: number;
    }> = [];

    if (P <= 0) {
      return {
        monthlyEmi: 0,
        totalInterest: 0,
        totalPayable: downPayment,
        schedule: [],
        principalPercent: 100,
        interestPercent: 0,
      };
    }

    if (calcScheme === 'zero_percent' || interestRate === 0) {
      // 0% Interest Scheme
      monthlyEmi = Math.round(P / n);
      totalInterest = 0;

      let balance = P;
      for (let m = 1; m <= n; m++) {
        const isLast = m === n;
        const princ = isLast ? balance : monthlyEmi;
        const endBal = Math.max(0, balance - princ);
        schedule.push({
          month: m,
          beginningBalance: Math.round(balance),
          emi: princ,
          principal: princ,
          interest: 0,
          endingBalance: Math.round(endBal),
        });
        balance = endBal;
      }
    } else if (calcScheme === 'flat_rate') {
      // Flat Rate Scheme: Total Interest = P * (R / 100) * (n / 12)
      totalInterest = Math.round(P * (interestRate / 100) * (n / 12));
      const totalLoanWithInterest = P + totalInterest;
      monthlyEmi = Math.round(totalLoanWithInterest / n);
      const monthlyPrincipal = Math.round(P / n);
      const monthlyInterest = monthlyEmi - monthlyPrincipal;

      let balance = P;
      for (let m = 1; m <= n; m++) {
        const isLast = m === n;
        const princ = isLast ? balance : monthlyPrincipal;
        const endBal = Math.max(0, balance - princ);
        schedule.push({
          month: m,
          beginningBalance: Math.round(balance),
          emi: princ + monthlyInterest,
          principal: princ,
          interest: monthlyInterest,
          endingBalance: Math.round(endBal),
        });
        balance = endBal;
      }
    } else {
      // Reducing Balance EMI: E = P * r * (1+r)^n / ((1+r)^n - 1)
      const r = interestRate / (12 * 100);
      const factor = Math.pow(1 + r, n);
      monthlyEmi = Math.round((P * r * factor) / (factor - 1));

      let balance = P;
      let cumInterest = 0;
      for (let m = 1; m <= n; m++) {
        const isLast = m === n;
        const interestPart = Math.round(balance * r);
        let principalPart = monthlyEmi - interestPart;
        if (isLast || principalPart > balance) {
          principalPart = balance;
        }
        const endBal = Math.max(0, balance - principalPart);
        cumInterest += interestPart;

        schedule.push({
          month: m,
          beginningBalance: Math.round(balance),
          emi: principalPart + interestPart,
          principal: principalPart,
          interest: interestPart,
          endingBalance: Math.round(endBal),
        });
        balance = endBal;
      }
      totalInterest = cumInterest;
    }

    const totalPayable = P + totalInterest + bankProcessingFeeAmount;
    const totalFinanced = P + totalInterest + bankProcessingFeeAmount;
    const principalPercent = totalFinanced > 0 ? Math.round((P / totalFinanced) * 100) : 100;
    const interestPercent = 100 - principalPercent;

    return {
      monthlyEmi,
      totalInterest,
      totalPayable,
      schedule,
      principalPercent,
      interestPercent,
    };
  }, [principal, tenureMonths, interestRate, calcScheme, bankProcessingFeeAmount, downPayment]);

  const handleBankSelect = (bank: BankPartner) => {
    setSelectedBank(bank.id);
    if (bank.zeroPercentAvailable) {
      setCalcScheme('zero_percent');
      setInterestRate(0);
    }
    setBankFeePercent(bank.typicalFee);
    if (tenureMonths > bank.maxTenure) {
      setTenureMonths(bank.maxTenure);
    }
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const currentBankObj = PARTNER_BANKS.find((b) => b.id === selectedBank) || PARTNER_BANKS[0];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 dark:bg-navy-950 dark:text-slate-100 font-sans transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 lg:py-12 w-full space-y-10">
        {/* Hero Section: Perfectly Styled for Light & Dark Mode */}
        <div className="relative rounded-3xl overflow-hidden bg-white dark:bg-gradient-to-br dark:from-navy-900 dark:via-slate-900 dark:to-navy-950 border border-slate-200/90 dark:border-slate-800 p-6 sm:p-10 shadow-xl transition-all">
          {/* Ambient decorative glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 dark:bg-purple-500/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-indigo-500/5 dark:bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/30 text-purple-700 dark:text-purple-300 text-xs font-bold tracking-wide uppercase">
                <CreditCard className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span>CORENIX Finance & 0% Installment Suite</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                Credit Card & Bank{' '}
                <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 dark:from-purple-300 dark:via-pink-300 dark:to-sky-300 bg-clip-text text-transparent">
                  EMI Calculator
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                Calculate your monthly installments with <strong>0% Interest Bank EMI</strong> or custom financing terms. Compare instant amortization schedules across top commercial credit cards in Bangladesh including City Bank Amex, BRAC, EBL, and SCB.
              </p>

              {productTitle && (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-purple-50 dark:bg-white/10 border border-purple-200 dark:border-white/20 text-xs font-semibold text-purple-800 dark:text-cyan-300 shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-cyan-400" />
                  <span>Configuring EMI for: <strong>{productTitle}</strong></span>
                </div>
              )}
            </div>

            {/* Monthly EMI Executive Card */}
            <div className="bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-800 text-force-white rounded-3xl p-6 min-w-[300px] sm:min-w-[320px] shadow-2xl relative overflow-hidden border border-purple-400/30">
              <div className="flex items-center justify-between pb-3 border-b border-white/15">
                <span className="text-[11px] uppercase tracking-wider font-extrabold text-purple-200">
                  Monthly Installment
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-wider">
                  {tenureMonths} Months
                </span>
              </div>

              <div className="py-4 space-y-1">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-bold text-purple-200">৳</span>
                  <span className="text-4xl sm:text-5xl font-black text-force-white tracking-tight font-mono">
                    {calculationResults.monthlyEmi.toLocaleString()}
                  </span>
                  <span className="text-xs font-semibold text-purple-200">/mo</span>
                </div>
                <p className="text-xs text-purple-100/90 font-medium line-clamp-1">
                  {numberToWords(calculationResults.monthlyEmi)}
                </p>
              </div>

              <div className="pt-3 border-t border-white/15 space-y-1.5 text-xs text-purple-100">
                <div className="flex justify-between">
                  <span className="text-purple-200/90">Financed Principal:</span>
                  <span className="font-bold text-force-white font-mono">৳{principal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-200/90">Total Charges/Fee:</span>
                  <span className="font-bold text-cyan-200 font-mono">
                    ৳{(calculationResults.totalInterest + bankProcessingFeeAmount).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Hardware Price Presets Bar */}
          <div className="relative z-10 mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mr-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Quick Tiers:</span>
            </span>

            {[
              { label: '৳35,000 (Office Rig / Display)', amt: 35000 },
              { label: '৳65,000 (RTX 5060 / Laptop)', amt: 65000 },
              { label: '৳1,25,000 (Gaming PC / MacBook)', amt: 125000 },
              { label: '৳2,50,000 (High-End Workstation)', amt: 250000 },
            ].map((tier) => (
              <button
                key={tier.amt}
                onClick={() => setProductPrice(tier.amt)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                  productPrice === tier.amt
                    ? 'bg-purple-600 border-purple-600 text-force-white shadow-sm'
                    : 'bg-slate-50 dark:bg-navy-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-purple-300 hover:text-purple-600'
                }`}
              >
                {tier.label}
              </button>
            ))}

            {cartTotal > 0 && (
              <button
                onClick={() => setProductPrice(cartTotal)}
                className="ml-auto px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-force-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Import Cart Total: ৳{cartTotal.toLocaleString()}</span>
              </button>
            )}
          </div>
        </div>

        {/* Scheme Selector: 0% Bank EMI vs Reducing Balance vs Flat Rate */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => handleSchemeChange('zero_percent')}
            className={`p-5 rounded-3xl border text-left transition-all relative overflow-hidden group ${
              calcScheme === 'zero_percent'
                ? 'bg-purple-50/80 dark:bg-purple-950/40 border-purple-500 shadow-md ring-2 ring-purple-500/20'
                : 'bg-white dark:bg-navy-900 border-slate-200/90 dark:border-slate-800 hover:border-purple-200 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/60 px-2 py-0.5 rounded-md">
                Most Popular
              </span>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                calcScheme === 'zero_percent' ? 'border-purple-600 bg-purple-600 text-force-white' : 'border-slate-300 dark:border-slate-600'
              }`}>
                {calcScheme === 'zero_percent' && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                0% Interest Bank EMI
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Zero annual markup on selected partner bank credit cards in Bangladesh (City Amex, BRAC, EBL, SCB).
            </p>
          </button>

          <button
            onClick={() => handleSchemeChange('reducing_balance')}
            className={`p-5 rounded-3xl border text-left transition-all relative overflow-hidden group ${
              calcScheme === 'reducing_balance'
                ? 'bg-purple-50/80 dark:bg-purple-950/40 border-purple-500 shadow-md ring-2 ring-purple-500/20'
                : 'bg-white dark:bg-navy-900 border-slate-200/90 dark:border-slate-800 hover:border-purple-200 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                Standard Financing
              </span>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                calcScheme === 'reducing_balance' ? 'border-purple-600 bg-purple-600 text-force-white' : 'border-slate-300 dark:border-slate-600'
              }`}>
                {calcScheme === 'reducing_balance' && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Reducing Balance EMI
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Interest calculated on remaining monthly principal balance (standard 7% - 14% commercial bank rates).
            </p>
          </button>

          <button
            onClick={() => handleSchemeChange('flat_rate')}
            className={`p-5 rounded-3xl border text-left transition-all relative overflow-hidden group ${
              calcScheme === 'flat_rate'
                ? 'bg-purple-50/80 dark:bg-purple-950/40 border-purple-500 shadow-md ring-2 ring-purple-500/20'
                : 'bg-white dark:bg-navy-900 border-slate-200/90 dark:border-slate-800 hover:border-purple-200 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                Simple Interest
              </span>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                calcScheme === 'flat_rate' ? 'border-purple-600 bg-purple-600 text-force-white' : 'border-slate-300 dark:border-slate-600'
              }`}>
                {calcScheme === 'flat_rate' && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <Landmark className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Flat Rate Financing
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Simple fixed interest rate applied uniformly across the entire tenure.
            </p>
          </button>
        </div>

        {/* 2-Column Interface: Sliders/Inputs Left, Visual Breakdown & Donut Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Interactive Controls */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-8">
              {/* Product Price Input */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span>Product Price / Financed Amount</span>
                  </label>
                  <div className="flex items-center gap-1 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-700 px-3.5 py-1.5 rounded-xl shadow-2xs">
                    <span className="text-xs font-bold text-slate-400">৳</span>
                    <input
                      type="number"
                      min={1000}
                      max={2000000}
                      step={500}
                      value={productPrice}
                      onChange={(e) => setProductPrice(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-32 text-sm font-extrabold text-slate-900 dark:text-white bg-transparent outline-none text-right font-mono"
                    />
                  </div>
                </div>

                <input
                  type="range"
                  min={5000}
                  max={500000}
                  step={1000}
                  value={productPrice}
                  onChange={(e) => setProductPrice(parseInt(e.target.value))}
                  className="w-full accent-purple-600 dark:accent-purple-400 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
                />

                <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  <span>৳5,000</span>
                  <span>৳2,50,000</span>
                  <span>৳5,00,000+</span>
                </div>
              </div>

              {/* Down Payment Input */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Percent className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span>Down Payment (Advance)</span>
                  </label>
                  <div className="flex items-center gap-1 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-700 px-3.5 py-1.5 rounded-xl shadow-2xs">
                    <span className="text-xs font-bold text-slate-400">৳</span>
                    <input
                      type="number"
                      min={0}
                      max={productPrice}
                      step={500}
                      value={downPayment}
                      onChange={(e) => setDownPayment(Math.min(productPrice, Math.max(0, parseInt(e.target.value) || 0)))}
                      className="w-32 text-sm font-extrabold text-slate-900 dark:text-white bg-transparent outline-none text-right font-mono"
                    />
                  </div>
                </div>

                <input
                  type="range"
                  min={0}
                  max={productPrice}
                  step={1000}
                  value={downPayment}
                  onChange={(e) => setDownPayment(parseInt(e.target.value))}
                  className="w-full accent-purple-600 dark:accent-purple-400 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
                />

                {/* Quick Down Payment Percent Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] text-slate-500 mr-1 font-semibold">Quick Percent:</span>
                  {[0, 10, 20, 30, 50].map((pct) => (
                    <button
                      key={pct}
                      onClick={() => setDownPaymentByPercent(pct)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                        downPaymentPercent === pct
                          ? 'bg-purple-600 text-force-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {pct}% ({pct === 0 ? '0% Down' : `৳${Math.round((productPrice * pct) / 100).toLocaleString()}`})
                    </button>
                  ))}
                </div>
              </div>

              {/* Tenure Selection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span>Tenure Duration</span>
                  </label>
                  <span className="text-sm font-black text-purple-600 dark:text-purple-400 font-mono">
                    {tenureMonths} Months ({tenureMonths >= 12 ? `${tenureMonths / 12} ${tenureMonths === 12 ? 'Year' : 'Years'}` : 'Short Term'})
                  </span>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {[3, 6, 9, 12, 18, 24, 36].map((months) => (
                    <button
                      key={months}
                      onClick={() => setTenureMonths(months)}
                      className={`py-2.5 rounded-2xl text-xs font-extrabold transition-all border ${
                        tenureMonths === months
                          ? 'bg-purple-600 text-force-white border-purple-600 shadow-md scale-102'
                          : 'bg-slate-50 dark:bg-navy-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-purple-300'
                      }`}
                    >
                      {months}M
                    </button>
                  ))}
                </div>
              </div>

              {/* Interest Rate (if non-zero scheme) */}
              {calcScheme !== 'zero_percent' && (
                <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                      <Percent className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <span>Annual Interest Rate (% P.A.)</span>
                    </label>
                    <div className="flex items-center gap-1 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-700 px-3.5 py-1.5 rounded-xl shadow-2xs">
                      <input
                        type="number"
                        min={1}
                        max={30}
                        step={0.5}
                        value={interestRate}
                        onChange={(e) => setInterestRate(parseFloat(e.target.value) || 0)}
                        className="w-16 text-sm font-extrabold text-slate-900 dark:text-white bg-transparent outline-none text-right font-mono"
                      />
                      <span className="text-xs font-bold text-slate-400">%</span>
                    </div>
                  </div>

                  <input
                    type="range"
                    min={5}
                    max={20}
                    step={0.5}
                    value={interestRate}
                    onChange={(e) => setInterestRate(parseFloat(e.target.value))}
                    className="w-full accent-purple-600 dark:accent-purple-400 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
                  />
                </div>
              )}

              {/* Bank Processing / Convenience Fee */}
              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                      Bank Processing / Convenience Fee
                    </label>
                    <p className="text-[11px] text-slate-400">
                      Nominal bank authorization charge (0% for promo cards).
                    </p>
                  </div>
                  <div className="flex items-center gap-1 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-700 px-3.5 py-1.5 rounded-xl shadow-2xs">
                    <input
                      type="number"
                      min={0}
                      max={10}
                      step={0.5}
                      value={bankFeePercent}
                      onChange={(e) => setBankFeePercent(parseFloat(e.target.value) || 0)}
                      className="w-14 text-sm font-extrabold text-slate-900 dark:text-white bg-transparent outline-none text-right font-mono"
                    />
                    <span className="text-xs font-bold text-slate-400">%</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {[0, 1.5, 2.0, 2.5, 3.0].map((fee) => (
                    <button
                      key={fee}
                      onClick={() => setBankFeePercent(fee)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                        bankFeePercent === fee
                          ? 'bg-purple-600 text-force-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {fee}%
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Supported Banks Cards Matrix */}
            <div className="bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span>Eligible Credit Cards in Bangladesh</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Select your bank to configure official 0% tenure limits.
                  </p>
                </div>
                <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                  {PARTNER_BANKS.length} Banks Active
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {PARTNER_BANKS.map((bank) => (
                  <button
                    key={bank.id}
                    onClick={() => handleBankSelect(bank)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      selectedBank === bank.id
                        ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-500 shadow-xs ring-1 ring-purple-500'
                        : 'bg-slate-50 dark:bg-navy-950 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                      {bank.shortName}
                    </div>
                    <div className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold mt-0.5">
                      {bank.badge}
                    </div>
                  </button>
                ))}
              </div>

              <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60 flex items-center justify-between text-xs">
                <div>
                  <strong className="text-slate-900 dark:text-white block font-bold">
                    Active Bank: {currentBankObj.name}
                  </strong>
                  <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                    Supported on: {currentBankObj.cards}
                  </span>
                </div>
                <span className="px-3 py-1 rounded-xl bg-purple-600 text-force-white text-[11px] font-extrabold uppercase tracking-wide">
                  0% Card EMI
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Donut Chart & Detailed Ledger */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-slate-800/90 rounded-3xl p-6 sm:p-7 shadow-lg space-y-6">
              <div>
                <div className="text-[11px] uppercase tracking-wider font-extrabold text-purple-600 dark:text-purple-400 mb-1">
                  Payment Architecture
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  Financial Breakdown
                </h3>
              </div>

              {/* Monthly Installment Callout Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-force-white shadow-md space-y-2">
                <span className="text-[11px] font-bold text-purple-200 uppercase tracking-wider">
                  You Pay Each Month
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-black tracking-tight text-force-white font-mono">
                    ৳{calculationResults.monthlyEmi.toLocaleString()}
                  </span>
                  <span className="text-xs text-purple-200">× {tenureMonths} Months</span>
                </div>
                <p className="text-xs text-purple-100 font-medium">
                  {numberToWords(calculationResults.monthlyEmi)}
                </p>
              </div>

              {/* Visual Breakdown Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-purple-600 dark:text-purple-400">
                    Principal ({calculationResults.principalPercent}%)
                  </span>
                  <span className="text-indigo-600 dark:text-cyan-400">
                    Interest & Fees ({calculationResults.interestPercent}%)
                  </span>
                </div>
                <div className="h-3.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex border border-slate-200/80 dark:border-slate-700">
                  <div
                    style={{ width: `${calculationResults.principalPercent}%` }}
                    className="bg-purple-600 h-full transition-all duration-500"
                  />
                  <div
                    style={{ width: `${calculationResults.interestPercent}%` }}
                    className="bg-indigo-500 dark:bg-cyan-400 h-full transition-all duration-500"
                  />
                </div>
              </div>

              {/* Itemized Financial Breakdown Table */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200/80 dark:border-slate-800 space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">Product Retail Price:</span>
                  <span className="font-bold text-slate-900 dark:text-white font-mono">
                    ৳{productPrice.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">Down Payment Paid:</span>
                  <span className="font-bold text-slate-900 dark:text-white font-mono">
                    ৳{downPayment.toLocaleString()} ({downPaymentPercent}%)
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">Net Financed Principal:</span>
                  <span className="font-bold text-purple-600 dark:text-purple-400 font-mono">
                    ৳{principal.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">Total Interest Amount:</span>
                  <span className="font-bold text-slate-900 dark:text-white font-mono">
                    ৳{calculationResults.totalInterest.toLocaleString()}
                  </span>
                </div>

                {bankProcessingFeeAmount > 0 && (
                  <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-slate-600 dark:text-slate-400">Bank Processing Charge ({bankFeePercent}%):</span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono">
                      ৳{bankProcessingFeeAmount.toLocaleString()}
                    </span>
                  </div>
                )}

                <div className="flex justify-between pt-1 font-extrabold text-sm text-slate-900 dark:text-white">
                  <span>Total Overall Outlay:</span>
                  <span className="text-purple-600 dark:text-purple-400 font-mono">
                    ৳{(calculationResults.totalPayable + downPayment).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5">
                <Link
                  href="/products"
                  className="w-full py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-force-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  <span>Shop Hardware with 0% EMI</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrint}
                    className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print EMI Plan</span>
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>{copiedShare ? 'Copied Link!' : 'Share Plan'}</span>
                  </button>
                </div>

                <Link
                  href="/ups-calculator"
                  className="py-3 px-3.5 rounded-xl bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/40 dark:hover:bg-sky-900/40 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-cyan-300 text-xs font-bold flex items-center justify-between transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-sky-600 dark:text-cyan-400" />
                    <span>Need power backup? Calculate UPS & Powerstation</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Amortization Schedule Table */}
        <section className="bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span>Monthly Amortization Schedule ({tenureMonths} Installments)</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Detailed breakdown of principal reduction and interest amortized across each month.
              </p>
            </div>

            <button
              onClick={() => setShowFullAmortization(!showFullAmortization)}
              className="text-xs font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1 hover:underline"
            >
              <span>{showFullAmortization ? 'Show First 6 Months' : 'View Full Schedule'}</span>
              {showFullAmortization ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-navy-950 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Month #</th>
                  <th className="py-3 px-4">Beginning Balance</th>
                  <th className="py-3 px-4">EMI Installment</th>
                  <th className="py-3 px-4">Principal Paid</th>
                  <th className="py-3 px-4">Interest Component</th>
                  <th className="py-3 px-4">Closing Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                {(showFullAmortization
                  ? calculationResults.schedule
                  : calculationResults.schedule.slice(0, 6)
                ).map((row) => (
                  <tr key={row.month} className="hover:bg-slate-50 dark:hover:bg-navy-950/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      Month {row.month}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      ৳{row.beginningBalance.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-purple-600 dark:text-purple-400">
                      ৳{row.emi.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-emerald-600 dark:text-emerald-400 font-semibold">
                      ৳{row.principal.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                      ৳{row.interest.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200">
                      ৳{row.endingBalance.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!showFullAmortization && calculationResults.schedule.length > 6 && (
            <div className="text-center pt-2">
              <button
                onClick={() => setShowFullAmortization(true)}
                className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline"
              >
                + Expand all {calculationResults.schedule.length} months in amortization schedule
              </button>
            </div>
          )}
        </section>

        {/* Bank EMI Terms & FAQ */}
        <section className="bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-slate-800/90 rounded-3xl p-6 sm:p-10 shadow-xs space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              EMI Policies & Requirements in Bangladesh
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Clear rules regarding credit card authorization, tenure choices, and bank approvals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4">
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200/80 dark:border-slate-800 space-y-2">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                How do I purchase on 0% EMI at CORENIX?
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                You can swipe your credit card in person at our Uttara Flagship (Shop 1) or Dhanmondi (Shop 2) showrooms, or select Credit Card EMI during checkout. Our staff selects your bank’s official 0% EMI tenure on the POS terminal, and your bank splits the charge into equal installments.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200/80 dark:border-slate-800 space-y-2">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Does an EMI purchase block my credit card limit?
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Yes. The full invoice amount is temporarily blocked from your available credit limit. As you pay each monthly installment, that portion of your credit limit is released back to your card.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200/80 dark:border-slate-800 space-y-2">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Can debit cards or bKash be used for EMI?
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Traditional 0% EMI is strictly supported by commercial credit cards (City Amex, BRAC, SCB, EBL, etc.). However, digital financing schemes through selected micro-lending partners or salary account payrolls can be availed for corporate employees upon verification.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200/80 dark:border-slate-800 space-y-2">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Is there any hidden interest or charge on 0% EMI?
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                CORENIX does not charge any interest markup on 0% EMI products. Certain banks may apply a small one-time processing charge (1.5% - 2.5%) for tenures longer than 12 months, which is transparently reflected in this calculator.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default function EmiCalculatorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-navy-950 text-slate-500">
        Loading EMI Calculator...
      </div>
    }>
      <EmiCalculatorContent />
    </Suspense>
  );
}
