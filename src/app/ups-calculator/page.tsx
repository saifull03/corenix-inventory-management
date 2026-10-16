'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import {
  Zap,
  Battery,
  BatteryCharging,
  Cpu,
  Monitor,
  Wifi,
  Fan,
  Tv,
  Smartphone,
  Plus,
  Trash2,
  RefreshCw,
  Printer,
  Share2,
  CheckCircle2,
  AlertTriangle,
  Info,
  Sliders,
  Sun,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Calculator,
  HelpCircle,
  Clock,
  Layers,
  HardDrive,
  Gauge,
  Activity,
  Check
} from 'lucide-react';

interface DeviceItem {
  id: string;
  name: string;
  category: 'pc' | 'display' | 'networking' | 'home' | 'creator' | 'custom';
  watts: number;
  qty: number;
  icon?: any;
}

const PRESET_DEVICES: DeviceItem[] = [
  // Computers
  { id: 'pc-gaming-ultra', name: 'High-End Gaming PC (RTX 4080/4090/5080)', category: 'pc', watts: 550, qty: 0, icon: Cpu },
  { id: 'pc-gaming-mid', name: 'Mid Gaming PC (RTX 4060/5060, Core i5/i7)', category: 'pc', watts: 320, qty: 1, icon: Cpu },
  { id: 'pc-office', name: 'Office Desktop PC (Integrated Graphics)', category: 'pc', watts: 140, qty: 0, icon: Cpu },
  { id: 'laptop-gaming', name: 'Gaming Laptop (Performance Mode)', category: 'pc', watts: 180, qty: 0, icon: Cpu },
  { id: 'laptop-office', name: 'Ultrabook / Office Laptop', category: 'pc', watts: 65, qty: 0, icon: Cpu },
  { id: 'mac-studio', name: 'Apple Mac Studio / Mac Mini', category: 'pc', watts: 80, qty: 0, icon: Cpu },

  // Displays
  { id: 'mon-24', name: '24" Full HD Monitor (IPS)', category: 'display', watts: 24, qty: 1, icon: Monitor },
  { id: 'mon-27-144', name: '27" QHD 165Hz Gaming Monitor', category: 'display', watts: 42, qty: 0, icon: Monitor },
  { id: 'mon-32-4k', name: '32" 4K UHD Professional Display', category: 'display', watts: 65, qty: 0, icon: Monitor },
  { id: 'mon-oled-ultrawide', name: '34" - 49" Ultrawide OLED Monitor', category: 'display', watts: 85, qty: 0, icon: Monitor },

  // Networking & Storage
  { id: 'net-router', name: 'Wi-Fi 6 / 6E Gigabit Router', category: 'networking', watts: 15, qty: 1, icon: Wifi },
  { id: 'net-onu', name: 'Optical Fiber ONU / GPON', category: 'networking', watts: 8, qty: 1, icon: Wifi },
  { id: 'net-switch', name: '8-Port Gigabit Switch', category: 'networking', watts: 10, qty: 0, icon: Wifi },
  { id: 'nas-storage', name: '4-Bay Network NAS Storage', category: 'networking', watts: 45, qty: 0, icon: HardDrive },

  // Home & Electronics
  { id: 'fan-ceiling', name: '56" AC Ceiling Fan', category: 'home', watts: 75, qty: 0, icon: Fan },
  { id: 'fan-table', name: 'Standing / Pedestal Fan', category: 'home', watts: 45, qty: 0, icon: Fan },
  { id: 'light-led', name: 'Energy Saving LED Bulb (12W)', category: 'home', watts: 12, qty: 0, icon: Zap },
  { id: 'tv-55', name: '55" 4K Smart LED TV', category: 'home', watts: 85, qty: 0, icon: Tv },
  { id: 'ps5-console', name: 'PlayStation 5 / Xbox Series X', category: 'home', watts: 210, qty: 0, icon: Cpu },

  // Creator & Mobile
  { id: 'mobile-charger', name: 'Smartphone Fast Charger (Type-C PD)', category: 'creator', watts: 30, qty: 0, icon: Smartphone },
  { id: 'studio-monitors', name: 'Studio Audio Monitors (Active Pair)', category: 'creator', watts: 50, qty: 0, icon: Zap },
  { id: 'key-light', name: 'Streaming LED Key Light Panel', category: 'creator', watts: 40, qty: 0, icon: Zap },
  { id: 'cpap-machine', name: 'CPAP Medical Device (with Humidifier)', category: 'home', watts: 45, qty: 0, icon: Zap },
];

const PRESETS = [
  {
    name: 'Gamer Battlestation',
    desc: 'Mid Gaming PC + 24" Monitor + Wi-Fi Router + Fiber ONU',
    items: [
      { id: 'pc-gaming-mid', qty: 1 },
      { id: 'mon-24', qty: 1 },
      { id: 'net-router', qty: 1 },
      { id: 'net-onu', qty: 1 },
    ],
  },
  {
    name: 'Pro Esports / Streamer',
    desc: 'High-End PC + 27" Gaming Display + Router + ONU + Streaming Light',
    items: [
      { id: 'pc-gaming-ultra', qty: 1 },
      { id: 'mon-27-144', qty: 1 },
      { id: 'net-router', qty: 1 },
      { id: 'net-onu', qty: 1 },
      { id: 'key-light', qty: 1 },
    ],
  },
  {
    name: 'Work From Home (WFH)',
    desc: 'Office Laptop + 24" Monitor + Router + ONU + LED Bulb + Fan',
    items: [
      { id: 'laptop-office', qty: 1 },
      { id: 'mon-24', qty: 1 },
      { id: 'net-router', qty: 1 },
      { id: 'net-onu', qty: 1 },
      { id: 'light-led', qty: 1 },
      { id: 'fan-table', qty: 1 },
    ],
  },
  {
    name: 'Internet Outage Survival',
    desc: 'Wi-Fi 6 Router + Fiber Optical ONU + Smartphone Charger',
    items: [
      { id: 'net-router', qty: 1 },
      { id: 'net-onu', qty: 1 },
      { id: 'mobile-charger', qty: 1 },
    ],
  },
  {
    name: 'Home Essentials IPS Load',
    desc: '2x Ceiling Fans + 3x LED Bulbs + Wi-Fi Router + 55" TV',
    items: [
      { id: 'fan-ceiling', qty: 2 },
      { id: 'light-led', qty: 3 },
      { id: 'net-router', qty: 1 },
      { id: 'tv-55', qty: 1 },
    ],
  },
];

export default function UpsCalculatorPage() {
  const [devices, setDevices] = useState<DeviceItem[]>(PRESET_DEVICES);
  const [customDevices, setCustomDevices] = useState<DeviceItem[]>([]);
  const [activeTab, setActiveTab] = useState<'appliance' | 'custom_battery' | 'target_runtime'>('appliance');

  // Electrical parameters
  const [powerFactor, setPowerFactor] = useState<number>(0.65);
  const [overheadBuffer, setOverheadBuffer] = useState<number>(25);
  const [batteryTech, setBatteryTech] = useState<'lead_acid' | 'agm' | 'lifepo4'>('lead_acid');

  // Custom battery runtime inputs
  const [customBatteryVolts, setCustomBatteryVolts] = useState<number>(12);
  const [customBatteryAh, setCustomBatteryAh] = useState<number>(100);
  const [customBatteryQty, setCustomBatteryQty] = useState<number>(1);
  const [customPowerStationWh, setCustomPowerStationWh] = useState<number>(512);

  // Target runtime mode inputs
  const [desiredHours, setDesiredHours] = useState<number>(2);
  const [desiredMinutes, setDesiredMinutes] = useState<number>(30);

  // Solar calculation inputs
  const [solarWattage, setSolarWattage] = useState<number>(200);

  // Modal / Custom Item form state
  const [newDeviceName, setNewDeviceName] = useState<string>('');
  const [newDeviceWatts, setNewDeviceWatts] = useState<number>(50);
  const [newDeviceQty, setNewDeviceQty] = useState<number>(1);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);

  // Helper to update device quantity
  const updateQty = (id: string, delta: number) => {
    setDevices((prev) =>
      prev.map((d) => (d.id === id ? { ...d, qty: Math.max(0, d.qty + delta) } : d))
    );
  };

  const updateWatts = (id: string, watts: number) => {
    setDevices((prev) =>
      prev.map((d) => (d.id === id ? { ...d, watts: Math.max(1, watts) } : d))
    );
  };

  const addCustomDevice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeviceName.trim() || newDeviceWatts <= 0) return;
    const newItem: DeviceItem = {
      id: `custom-${Date.now()}`,
      name: newDeviceName.trim(),
      category: 'custom',
      watts: newDeviceWatts,
      qty: Math.max(1, newDeviceQty),
      icon: Zap,
    };
    setCustomDevices((prev) => [...prev, newItem]);
    setNewDeviceName('');
    setNewDeviceWatts(50);
    setNewDeviceQty(1);
  };

  const removeCustomDevice = (id: string) => {
    setCustomDevices((prev) => prev.filter((d) => d.id !== id));
  };

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setDevices((prev) =>
      prev.map((d) => {
        const found = preset.items.find((item) => item.id === d.id);
        return { ...d, qty: found ? found.qty : 0 };
      })
    );
    setCustomDevices([]);
  };

  const clearAllDevices = () => {
    setDevices((prev) => prev.map((d) => ({ ...d, qty: 0 })));
    setCustomDevices([]);
  };

  // Battery Tech specs: Depth of Discharge (DoD) & Inverter Efficiency (η)
  const techSpecs = useMemo(() => {
    switch (batteryTech) {
      case 'lifepo4':
        return { dod: 0.90, eff: 0.90, label: 'LiFePO4 Lithium (Power Station)', desc: '90% DoD, 90% Inverter Efficiency' };
      case 'agm':
        return { dod: 0.70, eff: 0.82, label: 'AGM / Deep Cycle Gel', desc: '70% DoD, 82% Inverter Efficiency' };
      case 'lead_acid':
      default:
        return { dod: 0.55, eff: 0.80, label: 'Lead-Acid (Standard UPS / IPS)', desc: '55% DoD, 80% Inverter Efficiency' };
    }
  }, [batteryTech]);

  // Aggregate Total Power (Watts)
  const allActiveDevices = useMemo(() => {
    const list = [
      ...devices.filter((d) => d.qty > 0),
      ...customDevices.filter((d) => d.qty > 0),
    ];
    return list;
  }, [devices, customDevices]);

  const totalWatts = useMemo(() => {
    return allActiveDevices.reduce((acc, d) => acc + d.watts * d.qty, 0);
  }, [allActiveDevices]);

  // Apparent Power (VA)
  const apparentVA = useMemo(() => {
    if (totalWatts === 0) return 0;
    return Math.round(totalWatts / powerFactor);
  }, [totalWatts, powerFactor]);

  // Recommended UPS Capacity with safety buffer
  const recommendedVA = useMemo(() => {
    if (apparentVA === 0) return 0;
    const withBuffer = apparentVA * (1 + overheadBuffer / 100);
    return Math.ceil(withBuffer / 50) * 50;
  }, [apparentVA, overheadBuffer]);

  // Nearest standard UPS rating in market
  const standardUpsTier = useMemo(() => {
    if (recommendedVA <= 650) return { va: 650, watts: 360, name: '650VA / 360W Offline/Line-Interactive UPS', model: 'Apollo 650VA / MaxGreen 650VA' };
    if (recommendedVA <= 850) return { va: 850, watts: 480, name: '850VA / 480W Line-Interactive UPS', model: 'Apollo 850VA / Prolink 850VA' };
    if (recommendedVA <= 1200) return { va: 1200, watts: 720, name: '1200VA / 720W Dual-Battery UPS', model: 'MaxGreen 1200VA / Apollo 1200VA' };
    if (recommendedVA <= 1500) return { va: 1500, watts: 900, name: '1500VA / 900W Heavy-Duty UPS', model: 'Prolink 1500VA / Santak 1.5KVA' };
    if (recommendedVA <= 2000) return { va: 2000, watts: 1200, name: '2000VA / 1200W High Capacity UPS', model: 'Apollo 2000VA / Kstar 2KVA' };
    if (recommendedVA <= 3000) return { va: 3000, watts: 2400, name: '3000VA / 2400W Online Pure Sine Wave UPS', model: 'APC Smart-UPS 3KVA / Santak Online 3KVA' };
    return { va: Math.ceil(recommendedVA / 1000) * 1000, watts: Math.round(recommendedVA * 0.8), name: `${Math.ceil(recommendedVA / 1000)}KVA Enterprise Online UPS`, model: 'APC / Emerson / Santak Enterprise' };
  }, [recommendedVA]);

  // Calculation of runtime helper
  const calculateRuntime = (batteryWh: number, dod: number, eff: number, loadWatts: number) => {
    if (loadWatts <= 0) return { hours: 0, minutes: 0, totalMinutes: 0, formatted: '0 min' };
    const usableWh = batteryWh * dod * eff;
    const hoursDecimal = usableWh / loadWatts;
    const totalMinutes = Math.round(hoursDecimal * 60);
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    let formatted = '';
    if (hrs > 0) {
      formatted = `${hrs} hr ${mins > 0 ? `${mins} min` : ''}`;
    } else {
      formatted = `${mins} min`;
    }
    return { hours: hrs, minutes: mins, totalMinutes, formatted };
  };

  // Standard UPS / Power Station Matrix
  const runtimeMatrix = useMemo(() => {
    const list = [
      {
        name: '650VA Standard UPS',
        type: '1x 12V 7Ah SLA Battery (84Wh)',
        batteryWh: 12 * 7,
        dod: 0.55,
        eff: 0.80,
        category: 'ups',
        idealFor: 'Safe desktop shutdown & saving documents',
      },
      {
        name: '1200VA Pro Dual-Battery UPS',
        type: '2x 12V 7.2Ah Batteries (172.8Wh)',
        batteryWh: 24 * 7.2,
        dod: 0.55,
        eff: 0.80,
        category: 'ups',
        idealFor: 'Mid-range gaming PC & multi-monitors',
      },
      {
        name: '2000VA Heavy-Duty UPS',
        type: '2x 12V 9Ah Batteries (216Wh)',
        batteryWh: 24 * 9,
        dod: 0.60,
        eff: 0.82,
        category: 'ups',
        idealFor: 'Heavy gaming workstation & NAS storage',
      },
      {
        name: '256Wh Portable Power Station',
        type: 'LiFePO4 Lithium (0.25 kWh)',
        batteryWh: 256,
        dod: 0.90,
        eff: 0.88,
        category: 'powerstation',
        idealFor: 'Wi-Fi, Laptops, Outdoor shoots, cameras',
      },
      {
        name: '512Wh All-Rounder Power Station',
        type: 'LiFePO4 Lithium (0.5 kWh)',
        batteryWh: 512,
        dod: 0.90,
        eff: 0.88,
        category: 'powerstation',
        idealFor: 'Full remote workday & studio lighting',
      },
      {
        name: '1024Wh Flagship Power Station',
        type: 'LiFePO4 Lithium (1.0 kWh)',
        batteryWh: 1024,
        dod: 0.90,
        eff: 0.90,
        category: 'powerstation',
        idealFor: 'Gaming rig, Mini-fridge, CPAP machine',
      },
      {
        name: '130Ah Home Tubular IPS',
        type: '1x 12V 130Ah Deep Cycle Tubular (1560Wh)',
        batteryWh: 12 * 130,
        dod: 0.65,
        eff: 0.80,
        category: 'ips',
        idealFor: 'Apartment lighting, ceiling fans, desktop',
      },
    ];

    return list.map((item) => {
      const rt = calculateRuntime(item.batteryWh, item.dod, item.eff, totalWatts);
      return {
        ...item,
        runtime: rt,
      };
    });
  }, [totalWatts]);

  // Custom Battery Sizing Calculation
  const customBatteryTotalWh = useMemo(() => {
    return customBatteryVolts * customBatteryAh * customBatteryQty;
  }, [customBatteryVolts, customBatteryAh, customBatteryQty]);

  const customBatteryRuntime = useMemo(() => {
    return calculateRuntime(customBatteryTotalWh, techSpecs.dod, techSpecs.eff, totalWatts);
  }, [customBatteryTotalWh, techSpecs, totalWatts]);

  const customPowerStationRuntime = useMemo(() => {
    return calculateRuntime(customPowerStationWh, 0.90, 0.90, totalWatts);
  }, [customPowerStationWh, totalWatts]);

  // Target Runtime Mode -> Required Capacity
  const targetRequiredWh = useMemo(() => {
    const totalDesiredHours = desiredHours + desiredMinutes / 60;
    if (totalWatts <= 0 || totalDesiredHours <= 0) return 0;
    const grossWh = (totalWatts * totalDesiredHours) / (techSpecs.dod * techSpecs.eff);
    return Math.round(grossWh);
  }, [totalWatts, desiredHours, desiredMinutes, techSpecs]);

  const targetRequiredAhAt12V = useMemo(() => {
    return Math.round(targetRequiredWh / 12);
  }, [targetRequiredWh]);

  // Solar Recharging Time
  const solarRechargeHours = useMemo(() => {
    if (solarWattage <= 0) return 0;
    const effectiveSolar = solarWattage * 0.75;
    const hours = customPowerStationWh / effectiveSolar;
    return Math.round(hours * 10) / 10;
  }, [customPowerStationWh, solarWattage]);

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

  // Load level indicator
  const loadLevel = useMemo(() => {
    if (totalWatts <= 150) return { label: 'Low Load (Long Backup)', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500' };
    if (totalWatts <= 450) return { label: 'Optimal Standard Load', color: 'text-sky-600 dark:text-cyan-400', bg: 'bg-sky-500' };
    if (totalWatts <= 800) return { label: 'Heavy Load (Gaming/Studio)', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500' };
    return { label: 'Ultra High Load (Workstation/Multi)', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-500' };
  }, [totalWatts]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 dark:bg-navy-950 dark:text-slate-100 font-sans transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 lg:py-12 w-full space-y-10">
        {/* Hero Section: Perfectly Styled for Light & Dark Mode */}
        <div className="relative rounded-3xl overflow-hidden bg-white dark:bg-gradient-to-br dark:from-navy-900 dark:via-slate-900 dark:to-navy-950 border border-slate-200/90 dark:border-slate-800 p-6 sm:p-10 shadow-xl transition-all">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 dark:bg-cyan-500/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-sky-500/5 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800 text-cyan-800 dark:text-cyan-300 text-xs font-bold tracking-wide uppercase">
                <BatteryCharging className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 animate-pulse" />
                <span>Electrical Engineering Power & Backup Suite</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                UPS & Power Station{' '}
                <span className="bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-600 dark:from-cyan-300 dark:via-sky-300 dark:to-blue-300 bg-clip-text text-transparent">
                  Calculator
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                Accurately compute total continuous electrical wattage, required inverter VA rating, and realistic battery backup runtime during loadshedding for Desktop PCs, Gaming Rigs, Wi-Fi networks, and Portable LiFePO4 Power Stations.
              </p>
            </div>

            {/* Quick Live Power Meter Card */}
            <div className="bg-gradient-to-br from-slate-900 via-navy-900 to-cyan-950 text-force-white rounded-3xl p-6 min-w-[300px] sm:min-w-[320px] shadow-2xl relative overflow-hidden border border-cyan-500/30">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-[11px] uppercase tracking-wider font-extrabold text-cyan-300">
                  Calculated Real Load
                </span>
                <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>LIVE</span>
                </span>
              </div>

              <div className="py-4 space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-black text-cyan-300 tracking-tight font-mono">
                    {totalWatts}
                  </span>
                  <span className="text-sm font-bold text-slate-300">Watts (W)</span>
                </div>
                <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{loadLevel.label}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span>Apparent Power:</span>
                  <span className="font-bold text-force-white font-mono">{apparentVA} VA</span>
                </div>
                <div className="flex justify-between">
                  <span>Recommended UPS:</span>
                  <span className="font-bold text-cyan-300 font-mono">{recommendedVA} VA+</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Preset Buttons Bar */}
          <div className="relative z-10 mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mr-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Quick Presets:</span>
            </span>

            {PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset)}
                className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-slate-700 hover:border-cyan-400 hover:text-cyan-600 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all hover:scale-102 active:scale-98 shadow-2xs"
              >
                {preset.name}
              </button>
            ))}

            <button
              onClick={clearAllDevices}
              className="ml-auto px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold transition-colors hover:bg-rose-100"
            >
              Reset All
            </button>
          </div>
        </div>

        {/* Tab Controls: Appliance Builder vs Battery Sizing vs Target Runtime */}
        <div className="flex items-center justify-center sm:justify-start gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto">
          <button
            onClick={() => setActiveTab('appliance')}
            className={`px-5 py-2.5 rounded-2xl font-extrabold text-xs sm:text-sm flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'appliance'
                ? 'bg-sky-600 text-force-white shadow-md shadow-sky-600/20'
                : 'bg-white dark:bg-navy-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>1. Appliance & Wattage Builder</span>
          </button>

          <button
            onClick={() => setActiveTab('custom_battery')}
            className={`px-5 py-2.5 rounded-2xl font-extrabold text-xs sm:text-sm flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'custom_battery'
                ? 'bg-sky-600 text-force-white shadow-md shadow-sky-600/20'
                : 'bg-white dark:bg-navy-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <Battery className="w-4 h-4" />
            <span>2. Custom Battery & Power Station Sizing</span>
          </button>

          <button
            onClick={() => setActiveTab('target_runtime')}
            className={`px-5 py-2.5 rounded-2xl font-extrabold text-xs sm:text-sm flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'target_runtime'
                ? 'bg-sky-600 text-force-white shadow-md shadow-sky-600/20'
                : 'bg-white dark:bg-navy-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>3. Reverse Target Calculator</span>
          </button>
        </div>

        {/* Tab 1: Appliance & Wattage Builder */}
        {activeTab === 'appliance' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Device Selection List */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-xs">
                <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Cpu className="w-5 h-5 text-sky-600 dark:text-cyan-400" />
                      <span>Select Connected Hardware & Appliances</span>
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Adjust quantities or tweak individual wattages to match your exact hardware.
                    </p>
                  </div>
                  <div className="text-xs font-bold px-3 py-1 rounded-full bg-cyan-50 dark:bg-slate-800 text-cyan-800 dark:text-cyan-300 border border-cyan-200 dark:border-slate-700">
                    {allActiveDevices.length} items active ({totalWatts}W)
                  </div>
                </div>

                {/* Categorized Device List */}
                <div className="space-y-3">
                  {devices.map((device) => {
                    const IconComponent = device.icon || Zap;
                    const isActive = device.qty > 0;

                    return (
                      <div
                        key={device.id}
                        className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl border transition-all gap-3 ${
                          isActive
                            ? 'bg-sky-50/60 dark:bg-sky-950/20 border-sky-300 dark:border-sky-800/80 shadow-2xs'
                            : 'bg-slate-50/50 dark:bg-navy-950/40 border-slate-200/70 dark:border-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                              isActive
                                ? 'bg-sky-600 text-force-white'
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                              {device.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                                Standard: {device.watts}W
                              </span>
                              {isActive && (
                                <span className="text-[11px] font-bold text-sky-600 dark:text-cyan-400">
                                  Subtotal: {device.watts * device.qty}W
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Controls: Wattage Input + Quantity Stepper */}
                        <div className="flex items-center justify-end gap-3 self-end sm:self-center">
                          {/* Wattage modifier */}
                          <div className="flex items-center gap-1 bg-white dark:bg-navy-900 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
                            <input
                              type="number"
                              min={1}
                              max={3000}
                              value={device.watts}
                              onChange={(e) => updateWatts(device.id, parseInt(e.target.value) || 0)}
                              className="w-12 text-xs font-bold text-slate-800 dark:text-white bg-transparent outline-none text-right font-mono"
                            />
                            <span className="text-[10px] text-slate-400 uppercase font-bold">W</span>
                          </div>

                          {/* Quantity Stepper */}
                          <div className="flex items-center rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-700 overflow-hidden shadow-2xs">
                            <button
                              onClick={() => updateQty(device.id, -1)}
                              disabled={device.qty === 0}
                              className="px-2.5 py-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors font-bold"
                            >
                              -
                            </button>
                            <span className="px-3 text-xs font-bold text-slate-900 dark:text-white min-w-[28px] text-center font-mono">
                              {device.qty}
                            </span>
                            <button
                              onClick={() => updateQty(device.id, 1)}
                              className="px-2.5 py-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-bold"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Custom Devices Section */}
                {customDevices.length > 0 && (
                  <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800 space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Your Custom Hardware Additions
                    </h3>
                    {customDevices.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-amber-500 text-force-white flex items-center justify-center">
                            <Zap className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                              {item.name}
                            </div>
                            <div className="text-[11px] text-amber-700 dark:text-amber-400 font-mono">
                              {item.watts}W × {item.qty} = {item.watts * item.qty}W
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => removeCustomDevice(item.id)}
                          className="p-1.5 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Custom Appliance Input Form */}
                <form
                  onSubmit={addCustomDevice}
                  className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-3 bg-slate-50 dark:bg-navy-950/50 p-4 rounded-2xl"
                >
                  <div className="flex-1 min-w-[200px]">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                      Add Custom Device Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 3D Printer, Fish Tank Filter, CPAP"
                      value={newDeviceName}
                      onChange={(e) => setNewDeviceName(e.target.value)}
                      className="w-full text-xs bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div className="w-24">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                      Power (W)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={5000}
                      value={newDeviceWatts}
                      onChange={(e) => setNewDeviceWatts(parseInt(e.target.value) || 0)}
                      className="w-full text-xs bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 font-mono text-center font-bold"
                    />
                  </div>
                  <div className="w-20">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                      Qty
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={newDeviceQty}
                      onChange={(e) => setNewDeviceQty(parseInt(e.target.value) || 1)}
                      className="w-full text-xs bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 font-mono text-center font-bold"
                    />
                  </div>
                  <button
                    type="submit"
                    className="mt-5 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-force-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Item</span>
                  </button>
                </form>
              </div>

              {/* Advanced Electrical Parameters Adjuster */}
              <div className="bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-sky-600 dark:text-cyan-400" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Electrical Factors & Safety Margin
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                  {/* Power Factor */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        Power Factor (PF):
                      </span>
                      <span className="font-bold font-mono text-sky-600 dark:text-cyan-400">
                        {powerFactor}
                      </span>
                    </div>
                    <select
                      value={powerFactor}
                      onChange={(e) => setPowerFactor(parseFloat(e.target.value))}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none font-medium"
                    >
                      <option value={0.6}>0.60 - Standard Offline UPS / Office PC</option>
                      <option value={0.65}>0.65 - Typical Gaming Desktop + Display</option>
                      <option value={0.75}>0.75 - 80-Plus Bronze / Silver Active PFC</option>
                      <option value={0.85}>0.85 - 80-Plus Gold / Platinum Gaming PSU</option>
                      <option value={0.95}>0.95 - Modern LiFePO4 Inverter / Online UPS</option>
                    </select>
                    <p className="text-[11px] text-slate-400">
                      Real power (W) to apparent power (VA) ratio. Standard home UPS run at 0.6 to 0.7.
                    </p>
                  </div>

                  {/* Safety Overhead Buffer */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        Safety Buffer:
                      </span>
                      <span className="font-bold font-mono text-sky-600 dark:text-cyan-400">
                        +{overheadBuffer}%
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {[15, 20, 25, 30].map((val) => (
                        <button
                          key={val}
                          onClick={() => setOverheadBuffer(val)}
                          className={`flex-1 py-2 rounded-xl font-bold transition-colors ${
                            overheadBuffer === val
                              ? 'bg-sky-600 text-force-white'
                              : 'bg-slate-50 dark:bg-navy-950 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {val}%
                        </button>
                      ))}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Recommended 25% overhead handles inrush GPU transient spikes and heat dissipation.
                    </p>
                  </div>

                  {/* Battery Chemistry */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        Battery Chemistry:
                      </span>
                      <span className="font-bold text-sky-600 dark:text-cyan-400">
                        {batteryTech === 'lifepo4' ? 'LiFePO4' : batteryTech === 'agm' ? 'AGM Gel' : 'Lead-Acid'}
                      </span>
                    </div>
                    <select
                      value={batteryTech}
                      onChange={(e) => setBatteryTech(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none font-medium"
                    >
                      <option value="lead_acid">Lead-Acid / SLA (55% DoD, 80% Eff)</option>
                      <option value="agm">Deep Cycle AGM Gel (70% DoD, 82% Eff)</option>
                      <option value="lifepo4">LiFePO4 Power Station (90% DoD, 90% Eff)</option>
                    </select>
                    <p className="text-[11px] text-slate-400">
                      {techSpecs.desc}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Results, Capacity Meter & Recommendation Matrix */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-slate-800/90 rounded-3xl p-6 shadow-lg space-y-6">
                <div>
                  <div className="text-[11px] uppercase tracking-wider font-extrabold text-sky-600 dark:text-cyan-400 mb-1">
                    System Calculation Output
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    Recommended Sizing
                  </h3>
                </div>

                {/* Primary Stats Grid */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Load</span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">{totalWatts}</span>
                      <span className="text-xs font-semibold text-slate-500">W</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Apparent Power</span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">{apparentVA}</span>
                      <span className="text-xs font-semibold text-slate-500">VA</span>
                    </div>
                  </div>
                </div>

                {/* Highlighted Recommendation Banner */}
                <div className="p-5 rounded-2xl bg-sky-50 dark:bg-cyan-950/30 border border-sky-200 dark:border-cyan-800/60 text-slate-900 dark:text-white space-y-2">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-sky-700 dark:text-cyan-300">
                    <CheckCircle2 className="w-4 h-4 text-sky-600 dark:text-cyan-400" />
                    <span>Minimum Safe Inverter Sizing:</span>
                  </div>
                  <div className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                    {standardUpsTier.name}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    With +{overheadBuffer}% safety overhead to handle surge currents. Suitable models include <strong>{standardUpsTier.model}</strong>.
                  </p>
                </div>

                {/* Estimated Runtime on Standard Sizes */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                    <span>Estimated Backup Times</span>
                    <span className="text-[10px] text-sky-600 dark:text-cyan-400 font-semibold font-mono">
                      @ {totalWatts}W load
                    </span>
                  </h4>

                  <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                    {runtimeMatrix.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between shadow-2xs hover:border-sky-300 dark:hover:border-slate-700 transition-colors"
                      >
                        <div className="min-w-0 pr-2">
                          <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {item.name}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {item.type}
                          </div>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-xl text-xs font-black font-mono ${
                              item.runtime.totalMinutes > 60
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                : item.runtime.totalMinutes >= 15
                                ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-cyan-300 border border-sky-200 dark:border-sky-800'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                            }`}
                          >
                            {totalWatts === 0 ? 'Infinite' : item.runtime.formatted}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action buttons: Print Quotation, Share, View Store */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2.5">
                  <Link
                    href="/category/ups"
                    className="w-full py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-force-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
                  >
                    <span>Browse Compatible UPS in Stock</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrint}
                      className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Load Sheet</span>
                    </button>
                    <button
                      onClick={handleShare}
                      className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>{copiedShare ? 'Copied Link!' : 'Share Calc'}</span>
                    </button>
                  </div>

                  <Link
                    href="/emi-calculator"
                    className="py-3 px-3.5 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/40 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-bold flex items-center justify-between transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Calculator className="w-3.5 h-3.5" />
                      <span>Pay for your UPS with 0% EMI</span>
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Custom Battery & Power Station Sizing */}
        {activeTab === 'custom_battery' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-6">
              {/* Option A: Portable LiFePO4 Power Station (Wh) */}
              <div className="bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-cyan-50 dark:bg-cyan-950/50 text-sky-600 dark:text-cyan-400 flex items-center justify-center flex-shrink-0">
                    <BatteryCharging className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Portable Power Station Sizing (Watt-Hours)
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      For modern all-in-one solar generators & lithium battery packs (EcoFlow, Bluetti, Anker).
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Station Capacity (Wh):
                    </span>
                    <span className="text-lg font-black font-mono text-sky-600 dark:text-cyan-400">
                      {customPowerStationWh} Wh
                    </span>
                  </div>

                  <input
                    type="range"
                    min={128}
                    max={4096}
                    step={64}
                    value={customPowerStationWh}
                    onChange={(e) => setCustomPowerStationWh(parseInt(e.target.value))}
                    className="w-full accent-sky-600 dark:accent-cyan-400 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
                  />

                  {/* Quick Preset Buttons */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {[256, 512, 768, 1024, 1536, 2048, 3072].map((wh) => (
                      <button
                        key={wh}
                        onClick={() => setCustomPowerStationWh(wh)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                          customPowerStationWh === wh
                            ? 'bg-sky-600 text-force-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {wh >= 1024 ? `${wh / 1024} kWh` : `${wh} Wh`}
                      </button>
                    ))}
                  </div>

                  {/* Calculated Runtime Result */}
                  <div className="p-4 rounded-2xl bg-sky-50 dark:bg-cyan-950/30 border border-sky-200 dark:border-cyan-800/60 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-600 dark:text-slate-300 block font-medium">
                        Estimated Backup at {totalWatts}W Load:
                      </span>
                      <span className="text-2xl font-black text-slate-900 dark:text-cyan-300 font-mono">
                        {totalWatts === 0 ? 'Select some devices' : customPowerStationRuntime.formatted}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-sky-100 text-sky-800 dark:bg-cyan-500/20 dark:text-cyan-300">
                      90% DoD
                    </span>
                  </div>
                </div>

                {/* Solar Recharging Time Extension */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Sun className="w-4 h-4 text-amber-500" />
                      <span>Solar Panel Recharge Estimator</span>
                    </span>
                    <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                      ~{solarRechargeHours} hrs direct sunlight
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {[100, 200, 400, 800].map((watt) => (
                      <button
                        key={watt}
                        onClick={() => setSolarWattage(watt)}
                        className={`p-2 rounded-xl text-center border text-xs font-bold transition-all ${
                          solarWattage === watt
                            ? 'bg-amber-100 border-amber-300 text-amber-900 dark:bg-amber-950/40 dark:border-amber-700 dark:text-amber-300'
                            : 'bg-slate-50 dark:bg-navy-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400'
                        }`}
                      >
                        {watt}W Solar
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Accounts for ~75% real-world atmospheric derating and MPPT solar charging efficiency.
                  </p>
                </div>
              </div>

              {/* Option B: Traditional Lead-Acid / Tubular Battery Bank */}
              <div className="bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0">
                    <Battery className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      External Battery Bank (Ah & Volts)
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      For traditional Home IPS or long-backup extended UPS with external battery terminals.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      System Voltage (V)
                    </label>
                    <select
                      value={customBatteryVolts}
                      onChange={(e) => setCustomBatteryVolts(parseInt(e.target.value))}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200"
                    >
                      <option value={12}>12V (Single Battery)</option>
                      <option value={24}>24V (2 Batteries Series)</option>
                      <option value={48}>48V (4 Batteries Series)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Capacity (Ah)
                    </label>
                    <input
                      type="number"
                      min={7}
                      max={300}
                      value={customBatteryAh}
                      onChange={(e) => setCustomBatteryAh(parseInt(e.target.value) || 7)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 font-mono text-center"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Number of Units
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={8}
                      value={customBatteryQty}
                      onChange={(e) => setCustomBatteryQty(parseInt(e.target.value) || 1)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 font-mono text-center"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/40 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-600 dark:text-slate-400 block font-medium">
                      Total Bank Energy ({customBatteryVolts}V × {customBatteryAh}Ah × {customBatteryQty}):
                    </span>
                    <span className="text-2xl font-black text-purple-950 dark:text-purple-300 font-mono">
                      {customBatteryTotalWh} Wh ({Math.round(customBatteryTotalWh / 100) / 10} kWh)
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500 block font-medium">Calculated Runtime:</span>
                    <span className="text-lg font-black text-purple-700 dark:text-purple-300 font-mono">
                      {totalWatts === 0 ? 'No Load' : customBatteryRuntime.formatted}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-slate-800/90 rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
                <div className="flex items-center gap-2 text-sky-600 dark:text-cyan-400 font-bold text-sm">
                  <Info className="w-4 h-4" />
                  <span>The Engineering Runtime Formula</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-100 dark:bg-navy-950 font-mono text-xs text-slate-700 dark:text-slate-300 space-y-2 border border-slate-200 dark:border-slate-800">
                  <div className="font-bold text-sky-600 dark:text-cyan-400">
                    Runtime (Hours) = (Wh × DoD × Eff) ÷ Load (Watts)
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    • <strong>Wh (Watt-Hours)</strong> = Volts (V) × Amp-Hours (Ah)<br />
                    • <strong>DoD (Depth of Discharge)</strong> = 50% for standard Lead-Acid, 90% for LiFePO4<br />
                    • <strong>Eff (Inverter Efficiency)</strong> = ~80% - 90%
                  </div>
                </div>

                <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  <h4 className="font-bold text-slate-900 dark:text-white">
                    Why Lead-Acid Batteries Show Lower Runtime:
                  </h4>
                  <p>
                    Standard Sealed Lead-Acid (SLA) batteries inside regular UPS units degrade rapidly if discharged past 50%. Furthermore, under heavy loads (such as a 350W gaming PC on a 7Ah battery), <strong>Peukert’s Law</strong> reduces the effective delivered capacity by up to 35%.
                  </p>
                  <p>
                    Modern <strong>LiFePO4 Lithium Power Stations</strong> can safely discharge up to 90%-95% of their rated capacity without damaging the battery, lasting over 3,000 charge cycles (nearly 10 years of daily use).
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-xs text-emerald-800 dark:text-emerald-300 space-y-1">
                    <span className="font-bold block">💡 CORENIX Pro Tip:</span>
                    <span>
                      If you only need your Wi-Fi router and Fiber ONU to stay online during loadshedding, they draw less than 25W combined! A small 256Wh power station can keep your internet running for <strong>over 9 continuous hours</strong>.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Reverse Target Calculator */}
        {activeTab === 'target_runtime' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-sky-600 dark:text-cyan-400 mb-1">
                    Goal-Oriented Backup Sizing
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    Tell us how long you want to run
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Enter your target duration for your current load of <strong>{totalWatts}W</strong>. We will compute the exact battery capacity you need.
                  </p>
                </div>

                {/* Target Hours & Minutes Stepper */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Desired Hours
                    </label>
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => setDesiredHours((prev) => Math.max(0, prev - 1))}
                        className="w-10 h-10 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-700 font-extrabold text-slate-700 dark:text-slate-200"
                      >
                        -
                      </button>
                      <span className="text-2xl font-black font-mono text-slate-900 dark:text-white">
                        {desiredHours}
                      </span>
                      <button
                        onClick={() => setDesiredHours((prev) => Math.min(24, prev + 1))}
                        className="w-10 h-10 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-700 font-extrabold text-slate-700 dark:text-slate-200"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Desired Minutes
                    </label>
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => setDesiredMinutes((prev) => Math.max(0, prev - 15))}
                        className="w-10 h-10 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-700 font-extrabold text-slate-700 dark:text-slate-200"
                      >
                        -
                      </button>
                      <span className="text-2xl font-black font-mono text-slate-900 dark:text-white">
                        {desiredMinutes}
                      </span>
                      <button
                        onClick={() => setDesiredMinutes((prev) => Math.min(45, prev + 15))}
                        className="w-10 h-10 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-700 font-extrabold text-slate-700 dark:text-slate-200"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Computed Requirements Result Card */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-sky-500/10 via-cyan-500/10 to-blue-500/10 border border-sky-500/20 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-extrabold text-sky-800 dark:text-cyan-300 tracking-wider">
                      Required Energy Capacity
                    </span>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      for {desiredHours}h {desiredMinutes}m @ {totalWatts}W
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-white dark:bg-navy-900 border border-sky-200/80 dark:border-slate-800 shadow-2xs">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">
                        If Using LiFePO4 Power Station
                      </span>
                      <div className="text-2xl font-black text-sky-600 dark:text-cyan-400 font-mono mt-1">
                        ~{Math.round(targetRequiredWh * 0.9)} Wh
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium">
                        Recommendation: {Math.round(targetRequiredWh * 0.9) > 1024 ? '1.5 - 2 kWh Station' : '512Wh - 1kWh Station'}
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-white dark:bg-navy-900 border border-sky-200/80 dark:border-slate-800 shadow-2xs">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">
                        If Using 12V Tubular / Lead-Acid
                      </span>
                      <div className="text-2xl font-black text-purple-600 dark:text-purple-400 font-mono mt-1">
                        ~{targetRequiredAhAt12V} Ah
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium">
                        Recommendation: 1x 12V {targetRequiredAhAt12V > 130 ? '200Ah' : targetRequiredAhAt12V > 80 ? '130Ah' : '100Ah'} Battery
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-slate-800/90 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  <span>Buying Guide for Bangladesh</span>
                </h3>

                <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="font-bold text-slate-900 dark:text-white block">
                      1. Offline vs Line-Interactive UPS
                    </span>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                      Line-Interactive UPS (e.g. Apollo, MaxGreen, Prolink) includes Automatic Voltage Regulation (AVR) to stabilize Dhaka’s fluctuating voltage between 160V and 260V without consuming battery.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="font-bold text-slate-900 dark:text-white block">
                      2. Online Double-Conversion UPS
                    </span>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                      Provides 0ms transfer time and pure sine wave power. Essential for high-end rendering workstations, medical monitors, and audio recording studios.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="font-bold text-slate-900 dark:text-white block">
                      3. LiFePO4 Portable Power Stations
                    </span>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                      Completely silent, fume-free, supports solar charging, fast wall recharge (0-80% in 1 hour), and delivers 10x longer lifespan than acid batteries.
                    </p>
                  </div>
                </div>

                <Link
                  href="/category/ups"
                  className="w-full py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-force-white font-bold text-xs flex items-center justify-center gap-2 transition-all mt-4 shadow-sm"
                >
                  <span>Explore UPS Products</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* FAQ Section */}
        <section className="bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-slate-800/90 rounded-3xl p-6 sm:p-10 shadow-xs space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Frequently Asked Power Questions
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Technical guidance on UPS capacities, power supplies, and battery longevity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4">
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200/80 dark:border-slate-800 space-y-2">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                What is the difference between Watts (W) and Volt-Amperes (VA)?
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Watts (W) measures the real electrical power consumed by your components to do work. Volt-Amperes (VA) measures apparent power, which accounts for inefficiencies in the alternating current cycle (Power Factor). For instance, a 1200VA UPS with a 0.6 power factor delivers 720 Watts of usable real power.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200/80 dark:border-slate-800 space-y-2">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Can a 650VA UPS run my RTX 4070 or 5060 gaming PC?
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                A 650VA UPS typically delivers around 360W – 390W. While an RTX 4060 PC at idle draws only 80W, during high-demand AAA gaming the combined CPU, GPU, and monitor load can spike to 380W–450W, causing a 650VA UPS to immediately trip on overload. For a dedicated gaming PC, a <strong>1200VA (720W)</strong> UPS is strongly advised.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200/80 dark:border-slate-800 space-y-2">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Do I need Pure Sine Wave or Simulated Sine Wave?
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Modern gaming power supplies with Active PFC (Power Factor Correction) work best with Pure Sine Wave or high-quality stepped approximation. High-end workstations and server power supplies may shut down or produce an audible buzzing sound on cheap square wave inverters.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200/80 dark:border-slate-800 space-y-2">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                How often should standard UPS internal batteries be replaced?
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Standard Lead-Acid Sealed (SLA) batteries inside Apollo, MaxGreen, and Prolink UPS units have an operational lifespan of <strong>1.5 to 3 years</strong> depending on ambient room temperature and frequency of load-shedding cycles in Bangladesh. Corenix stocks genuine replacement 12V 7Ah, 7.2Ah, and 9Ah batteries.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
