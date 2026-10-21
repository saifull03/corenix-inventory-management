export interface SpecField {
  key: string;
  label: string;
  section: string;
  placeholder?: string;
  required?: boolean;
  type?: 'text' | 'number' | 'textarea' | 'select';
  options?: string[];
  helper?: string;
}

export interface SpecSection {
  title: string;
  icon?: string;
  fields: SpecField[];
}

export interface SpecTemplate {
  categoryName: string;
  sections: SpecSection[];
  preset?: Record<string, string>;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. MOTHERBOARD OFFICIAL SPECIFICATION TEMPLATE (GIGABYTE / MSI / ASUS STANDARD)
// ─────────────────────────────────────────────────────────────────────────────
export const MOTHERBOARD_SPEC_TEMPLATE: SpecTemplate = {
  categoryName: 'Motherboard',
  sections: [
    {
      title: 'CPU',
      fields: [
        {
          key: 'cpu_socket',
          label: 'CPU Socket',
          section: 'CPU',
          placeholder: 'e.g. AMD Socket AM5 / Intel LGA1851 / LGA1700',
          required: true,
        },
        {
          key: 'supported_processors',
          label: 'Supported Processors',
          section: 'CPU',
          placeholder: 'e.g. AMD Ryzen™ 9000 / 8000 / 7000 Series Processors (or Intel® Core™ Ultra)',
          required: true,
        },
        {
          key: 'cpu_power_design',
          label: 'VRM / Power Phase Design',
          section: 'CPU',
          placeholder: 'e.g. 16+2+2 Twin Digital VRM Design with 80A Smart Power Stage',
        },
      ],
    },
    {
      title: 'Chipset',
      fields: [
        {
          key: 'chipset',
          label: 'Chipset Model',
          section: 'Chipset',
          placeholder: 'e.g. AMD X870 / AMD B650 / Intel Z890 / Intel B760',
          required: true,
        },
      ],
    },
    {
      title: 'Memory',
      fields: [
        {
          key: 'memory_type',
          label: 'Memory Type & Architecture',
          section: 'Memory',
          placeholder: 'e.g. Dual Channel DDR5 DIMM',
          required: true,
        },
        {
          key: 'memory_slots',
          label: 'Memory Slots',
          section: 'Memory',
          placeholder: 'e.g. 4 x DDR5 DIMM sockets',
          required: true,
        },
        {
          key: 'max_memory',
          label: 'Max System Memory Capacity',
          section: 'Memory',
          placeholder: 'e.g. Up to 256 GB (64 GB single DIMM capacity)',
          required: true,
        },
        {
          key: 'memory_frequency_support',
          label: 'Supported Memory Speeds (MT/s / MHz)',
          section: 'Memory',
          placeholder: 'e.g. Support for DDR5 8200(OC) / 8000(OC) / 7800(OC) / 7200(OC) / 6400(OC) / 6000(OC) / 5600 / 5200 / 4800 MT/s',
          required: true,
        },
        {
          key: 'memory_overclock_profile',
          label: 'Overclocking Profiles',
          section: 'Memory',
          placeholder: 'e.g. Support for AMD EXPO™ and Intel® Extreme Memory Profile (XMP)',
        },
        {
          key: 'ecc_support',
          label: 'ECC Memory Support',
          section: 'Memory',
          placeholder: 'e.g. Non-ECC Un-buffered DIMM 1Rx8/2Rx8/1Rx16',
        },
      ],
    },
    {
      title: 'Onboard Graphics & Video',
      fields: [
        {
          key: 'graphics_display_ports',
          label: 'Integrated Graphics Ports',
          section: 'Onboard Graphics & Video',
          placeholder: 'e.g. 2 x USB4® USB Type-C® (DP 1.4, max 3840x2160@240Hz), 1 x HDMI 2.1 (max 4096x2160@60Hz)',
        },
        {
          key: 'graphics_features',
          label: 'Graphics Display Features',
          section: 'Onboard Graphics & Video',
          placeholder: 'e.g. DisplayPort 1.4 with HDR, HDCP 2.3, Native HDMI 2.1 TMDS',
        },
      ],
    },
    {
      title: 'Audio',
      fields: [
        {
          key: 'audio_codec',
          label: 'Audio Chipset & CODEC',
          section: 'Audio',
          placeholder: 'e.g. Realtek® ALC1220-VB Audio CODEC / Realtek® High Definition Audio',
          required: true,
        },
        {
          key: 'audio_channels',
          label: 'Audio Channel Support',
          section: 'Audio',
          placeholder: 'e.g. High Definition Audio 2/4/5.1/7.1-channel with S/PDIF Out',
        },
        {
          key: 'audio_enhancements',
          label: 'Audio Hardware Enhancements',
          section: 'Audio',
          placeholder: 'e.g. Premium Audio Capacitors, Audio Noise Guard, Dedicated PCB Layers',
        },
      ],
    },
    {
      title: 'LAN & Networking',
      fields: [
        {
          key: 'lan_controller',
          label: 'LAN Ethernet Controller & Speed',
          section: 'LAN & Networking',
          placeholder: 'e.g. Realtek® 2.5GbE LAN chip (2.5 Gbps / 1 Gbps / 100 Mbps)',
          required: true,
        },
      ],
    },
    {
      title: 'Wireless Communication',
      fields: [
        {
          key: 'wireless_module',
          label: 'Wi-Fi Specification',
          section: 'Wireless Communication',
          placeholder: 'e.g. Wi-Fi 7 (802.11be) 2.4/5/6 GHz carrier bands, 160MHz/320MHz channel bandwidth',
        },
        {
          key: 'bluetooth_version',
          label: 'Bluetooth Version',
          section: 'Wireless Communication',
          placeholder: 'e.g. BLUETOOTH 5.4',
        },
      ],
    },
    {
      title: 'Expansion Slots',
      fields: [
        {
          key: 'pcie_x16_cpu',
          label: 'PCIe x16 Slot (CPU Integrated)',
          section: 'Expansion Slots',
          placeholder: 'e.g. 1 x PCI Express x16 slot, supporting PCIe 5.0 x16 mode (PCIEX16)',
          required: true,
        },
        {
          key: 'pcie_x16_chipset',
          label: 'PCIe Slots (Chipset Integrated)',
          section: 'Expansion Slots',
          placeholder: 'e.g. 2 x PCI Express x16 slots, supporting PCIe 4.0/3.0 running at x1/x4',
        },
        {
          key: 'multi_gpu_support',
          label: 'Multi-GPU / Slot Reinforcement',
          section: 'Expansion Slots',
          placeholder: 'e.g. PCIe EZ-Latch Click, Ultra Durable PCIe Armor with zinc alloy',
        },
      ],
    },
    {
      title: 'Storage Interface',
      fields: [
        {
          key: 'm2_cpu_slots',
          label: 'M.2 Slots (CPU Integrated)',
          section: 'Storage Interface',
          placeholder: 'e.g. 1 x M.2 Socket 3 (M2A_CPU), PCIe 5.0 x4/x2 SSDs, type 25110/22110/2280',
          required: true,
        },
        {
          key: 'm2_chipset_slots',
          label: 'M.2 Slots (Chipset Integrated)',
          section: 'Storage Interface',
          placeholder: 'e.g. 2 x M.2 connectors (M2B_SB / M2C_SB), PCIe 4.0 x4/x2 SSDs, type 25110/2280',
        },
        {
          key: 'sata_ports',
          label: 'SATA Ports',
          section: 'Storage Interface',
          placeholder: 'e.g. 4 x SATA 6Gb/s connectors',
          required: true,
        },
        {
          key: 'raid_support',
          label: 'RAID Support',
          section: 'Storage Interface',
          placeholder: 'e.g. RAID 0, RAID 1, RAID 5, and RAID 10 support for NVMe and SATA storage',
        },
      ],
    },
    {
      title: 'USB Ports',
      fields: [
        {
          key: 'usb4_ports',
          label: 'USB4® / Thunderbolt Ports',
          section: 'USB Ports',
          placeholder: 'e.g. 2 x USB4® USB Type-C® ports (40Gbps) on the back panel',
        },
        {
          key: 'usb_back_panel',
          label: 'Back Panel USB Ports',
          section: 'USB Ports',
          placeholder: 'e.g. 2x USB4 Type-C, 1x USB 3.2 Gen 2 Type-A, 3x USB 3.2 Gen 1, 4x USB 2.0/1.1',
          required: true,
        },
        {
          key: 'usb_internal_headers',
          label: 'Internal USB Headers',
          section: 'USB Ports',
          placeholder: 'e.g. 1x USB Type-C (USB 3.2 Gen 2x2), 1x USB 3.2 Gen 1 header (2 ports), 2x USB 2.0 headers (4 ports)',
        },
      ],
    },
    {
      title: 'Internal I/O Connectors',
      fields: [
        {
          key: 'power_connectors',
          label: 'Main & CPU Power Connectors',
          section: 'Internal I/O Connectors',
          placeholder: 'e.g. 1 x 24-pin ATX main power, 1 x 8-pin + 1 x 4-pin ATX 12V power',
        },
        {
          key: 'fan_pump_headers',
          label: 'Fan & Water Cooling Headers',
          section: 'Internal I/O Connectors',
          placeholder: 'e.g. 1 x CPU fan header, 1 x CPU water pump header, 4 x system fan headers',
        },
        {
          key: 'rgb_headers',
          label: 'RGB & ARGB LED Headers',
          section: 'Internal I/O Connectors',
          placeholder: 'e.g. 3 x addressable RGB Gen2 LED strip headers, 1 x RGB LED strip header',
        },
        {
          key: 'other_internal_headers',
          label: 'Buttons & Other Headers',
          section: 'Internal I/O Connectors',
          placeholder: 'e.g. Front panel audio, TPM 2.0 header, Power button, Reset jumper, Clear CMOS jumper',
        },
      ],
    },
    {
      title: 'Back Panel Connectors',
      fields: [
        {
          key: 'back_panel_io',
          label: 'Rear I/O Panel Layout',
          section: 'Back Panel Connectors',
          placeholder: 'e.g. 1 x Q-Flash Plus button, 2 x Wi-Fi antenna connectors (EZ-Plug), 1 x HDMI, 2 x USB4 Type-C, 4 x USB 3.2, 4 x USB 2.0, 1 x RJ-45 LAN, 3 x audio jacks',
          required: true,
        },
      ],
    },
    {
      title: 'I/O Controller & H/W Monitoring',
      fields: [
        {
          key: 'io_controller',
          label: 'I/O Controller Chip',
          section: 'I/O Controller & H/W Monitoring',
          placeholder: 'e.g. iTE® I/O Controller Chip / NUVOTON',
        },
        {
          key: 'hw_monitoring',
          label: 'Hardware Monitoring & Sensors',
          section: 'I/O Controller & H/W Monitoring',
          placeholder: 'e.g. Voltage, Temperature, Fan speed, Water cooling flow rate detection, Smart Fan 6 fan speed control',
        },
      ],
    },
    {
      title: 'BIOS & Unique Features',
      fields: [
        {
          key: 'bios',
          label: 'BIOS Chip & Standard',
          section: 'BIOS & Unique Features',
          placeholder: 'e.g. 1 x 256 Mbit flash, licensed AMI UEFI BIOS, PnP 1.0a, DMI 2.7, ACPI 5.0',
        },
        {
          key: 'unique_features',
          label: 'Brand Software & Unique Features',
          section: 'BIOS & Unique Features',
          placeholder: 'e.g. GIGABYTE Control Center (GCC) / MSI Center, Q-Flash, Q-Flash Plus, Smart Backup',
        },
        {
          key: 'bundled_software',
          label: 'Bundled Software',
          section: 'BIOS & Unique Features',
          placeholder: 'e.g. Norton® Internet Security (OEM version), LAN bandwidth management software',
        },
        {
          key: 'operating_system',
          label: 'Supported Operating System',
          section: 'BIOS & Unique Features',
          placeholder: 'e.g. Support for Windows 11 64-bit / Windows 10 64-bit',
        },
      ],
    },
    {
      title: 'Form Factor & Dimensions',
      fields: [
        {
          key: 'form_factor',
          label: 'Motherboard Form Factor',
          section: 'Form Factor & Dimensions',
          placeholder: 'e.g. ATX Form Factor (30.5cm x 24.4cm) / Micro-ATX (24.4cm x 24.4cm)',
          required: true,
        },
      ],
    },
  ],
  preset: {
    cpu_socket: 'AMD Socket AM5',
    supported_processors: 'AMD Ryzen™ 9000 Series / AMD Ryzen™ 8000 Series / AMD Ryzen™ 7000 Series Processors',
    cpu_power_design: '16+2+2 Twin Digital VRM Design with 80A Smart Power Stage',
    chipset: 'AMD X870',
    memory_type: 'Dual Channel DDR5 DIMM',
    memory_slots: '4 x DDR5 DIMM sockets',
    max_memory: 'Up to 256 GB (64 GB single DIMM capacity)',
    memory_frequency_support: 'DDR5 8200(OC) / 8000(OC) / 7800(OC) / 7200(OC) / 6400(OC) / 6000(OC) / 5600 / 5200 / 4800 MT/s',
    memory_overclock_profile: 'Support for AMD EXPO™ and Intel® Extreme Memory Profile (XMP)',
    ecc_support: 'Non-ECC Un-buffered DIMM 1Rx8/2Rx8/1Rx16',
    graphics_display_ports: '2 x USB4® USB Type-C® (DisplayPort 1.4, max 3840x2160@240Hz), 1 x HDMI (max 4096x2160@60Hz)',
    graphics_features: 'Support for DisplayPort 1.4, HDMI 2.1, HDCP 2.3, and HDR',
    audio_codec: 'Realtek® Audio CODEC High Definition Audio',
    audio_channels: '2/4/5.1/7.1-channel High Definition Audio',
    audio_enhancements: 'Dedicated Audio Capacitors and PCB Noise Isolation Guard',
    lan_controller: 'Realtek® 2.5GbE LAN chip (2.5 Gbps/1 Gbps/100 Mbps)',
    wireless_module: 'Wi-Fi 7 (802.11be, 2.4/5/6 GHz carrier bands, 160MHz bandwidth)',
    bluetooth_version: 'BLUETOOTH 5.4',
    pcie_x16_cpu: '1 x PCI Express x16 slot, PCIe 5.0 x16 mode (PCIEX16)',
    pcie_x16_chipset: '2 x PCI Express x16 slots, supporting PCIe 3.0 running at x1',
    multi_gpu_support: 'PCIe EZ-Latch Click, Ultra Durable PCIe Armor',
    m2_cpu_slots: '1 x M.2 connector (M2A_CPU), PCIe 5.0 x4/x2 SSDs (type 25110/22110/2580/2280)',
    m2_chipset_slots: '2 x M.2 connectors (M2B_SB / M2C_SB), PCIe 4.0 x4/x2 SSDs with Thermal Guards',
    sata_ports: '4 x SATA 6Gb/s connectors',
    raid_support: 'RAID 0, RAID 1, RAID 5, and RAID 10 support for NVMe SSDs and SATA devices',
    usb4_ports: '2 x USB4® USB Type-C® ports (40Gbps) on the back panel',
    usb_back_panel: '2 x USB4 Type-C, 1 x USB 3.2 Gen 2 Type-A, 3 x USB 3.2 Gen 1, 4 x USB 2.0/1.1',
    usb_internal_headers: '1 x USB Type-C (USB 3.2 Gen 2x2), 1 x USB 3.2 Gen 1 header, 2 x USB 2.0 headers',
    power_connectors: '1 x 24-pin ATX main power, 1 x 8-pin + 1 x 4-pin ATX 12V power connectors',
    fan_pump_headers: '1 x CPU fan header, 1 x CPU fan/water cooling pump header, 4 x system fan headers',
    rgb_headers: '3 x addressable RGB Gen2 LED strip headers, 1 x RGB LED strip header',
    other_internal_headers: 'Front panel audio, TPM 2.0 header, Power button, Reset jumper, Clear CMOS jumper',
    back_panel_io: '1 x Q-Flash Plus button, 2 x antenna connectors, 1 x HDMI, 2 x USB4 Type-C, 4 x USB 3.2, 4 x USB 2.0, 1 x RJ-45, 3 x audio jacks',
    io_controller: 'iTE® I/O Controller Chip',
    hw_monitoring: 'Voltage, Temperature, Fan speed, Water flow detection, Smart Fan 6 fan fail warning',
    bios: '1 x 256 Mbit flash, licensed AMI UEFI BIOS, PnP 1.0a, DMI 2.7, ACPI 5.0',
    unique_features: 'Support for GIGABYTE Control Center (GCC), Q-Flash, Q-Flash Plus, Smart Backup',
    bundled_software: 'Norton® Internet Security (OEM version), LAN bandwidth management software',
    operating_system: 'Support for Windows 11 64-bit',
    form_factor: 'ATX Form Factor; 30.5cm x 24.4cm',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. PROCESSOR (CPU) OFFICIAL SPECIFICATION TEMPLATE (AMD / INTEL STANDARD)
// ─────────────────────────────────────────────────────────────────────────────
export const PROCESSOR_SPEC_TEMPLATE: SpecTemplate = {
  categoryName: 'Processor (CPU)',
  sections: [
    {
      title: 'General Specifications',
      fields: [
        { key: 'cpu_socket', label: 'CPU Socket', section: 'General Specifications', placeholder: 'e.g. AM5 / LGA1851 / LGA1700', required: true },
        { key: 'architecture', label: 'Architecture & Core Family', section: 'General Specifications', placeholder: 'e.g. Zen 5 (Granite Ridge) / Arrow Lake-S / Raptor Lake Refresh' },
        { key: 'lithography', label: 'Manufacturing Process (Lithography)', section: 'General Specifications', placeholder: 'e.g. TSMC 4nm FinFET / Intel 20A / Intel 7' },
        { key: 'launch_date', label: 'Platform & Launch Generation', section: 'General Specifications', placeholder: 'e.g. AMD Ryzen™ 9000 Series / Intel® Core™ Ultra (Series 2)' },
      ],
    },
    {
      title: 'CPU Performance & Cores',
      fields: [
        { key: 'cores', label: 'Total Cores', section: 'CPU Performance & Cores', placeholder: 'e.g. 16 (or 24: 8 Performance + 16 Efficient)', required: true },
        { key: 'threads', label: 'Total Threads', section: 'CPU Performance & Cores', placeholder: 'e.g. 32 Threads', required: true },
        { key: 'base_clock', label: 'Base Clock Frequency', section: 'CPU Performance & Cores', placeholder: 'e.g. 4.4 GHz (P-core Base: 3.2 GHz)' },
        { key: 'boost_clock', label: 'Max Boost / Turbo Frequency', section: 'CPU Performance & Cores', placeholder: 'e.g. Up to 5.7 GHz (Intel Thermal Velocity Boost: 5.7 GHz)', required: true },
        { key: 'l2_cache', label: 'L2 Cache', section: 'CPU Performance & Cores', placeholder: 'e.g. 16 MB L2 Cache (1 MB per core)' },
        { key: 'l3_cache', label: 'L3 Cache (AMD 3D V-Cache)', section: 'CPU Performance & Cores', placeholder: 'e.g. 64 MB L3 Cache (Total 80 MB Cache) / 96MB 3D V-Cache', required: true },
        { key: 'unlocked', label: 'Unlocked for Overclocking', section: 'CPU Performance & Cores', placeholder: 'e.g. Yes (AMD Precision Boost Overdrive / Intel XTU)' },
      ],
    },
    {
      title: 'Power & Thermal',
      fields: [
        { key: 'tdp', label: 'Default TDP / Processor Base Power', section: 'Power & Thermal', placeholder: 'e.g. 120W / 65W / 125W', required: true },
        { key: 'max_turbo_power', label: 'Max Turbo Power (PPT / PL2)', section: 'Power & Thermal', placeholder: 'e.g. 162W PPT / 253W Max Turbo Power' },
        { key: 'tjmax', label: 'Max Operating Temperature (Tjmax)', section: 'Power & Thermal', placeholder: 'e.g. 95°C / 100°C' },
        { key: 'thermal_solution', label: 'Thermal Solution / Cooler Included', section: 'Power & Thermal', placeholder: 'e.g. Cooler Not Included - Liquid Cooler Recommended' },
      ],
    },
    {
      title: 'Memory Specifications',
      fields: [
        { key: 'memory_types', label: 'Supported Memory Types', section: 'Memory Specifications', placeholder: 'e.g. DDR5-5600 MT/s (DDR4 support where applicable)', required: true },
        { key: 'max_memory_size', label: 'Max Memory Size (capacity)', section: 'Memory Specifications', placeholder: 'e.g. Up to 192 GB / 256 GB' },
        { key: 'memory_channels', label: 'Max Memory Channels', section: 'Memory Specifications', placeholder: 'e.g. 2 Channels (Dual Channel)' },
        { key: 'ecc_supported', label: 'ECC Memory Support', section: 'Memory Specifications', placeholder: 'e.g. Yes (requires motherboard support)' },
      ],
    },
    {
      title: 'Graphics & Expansion',
      fields: [
        { key: 'igpu', label: 'Integrated Processor Graphics', section: 'Graphics & Expansion', placeholder: 'e.g. AMD Radeon™ Graphics (2 Cores, 2200 MHz) / Intel® UHD Graphics 770 / Discrete Required' },
        { key: 'pcie_revision', label: 'PCI Express Revision & Lanes', section: 'Graphics & Expansion', placeholder: 'e.g. PCIe 5.0 (28 Total Lanes, 24 Usable)', required: true },
      ],
    },
  ],
  preset: {
    cpu_socket: 'AMD Socket AM5',
    architecture: 'Zen 5 (Granite Ridge)',
    lithography: 'TSMC 4nm FinFET',
    launch_date: 'AMD Ryzen™ 9000 Series',
    cores: '16 Cores',
    threads: '32 Threads',
    base_clock: '4.4 GHz',
    boost_clock: 'Up to 5.7 GHz',
    l2_cache: '16 MB',
    l3_cache: '64 MB L3 Cache (Total 80 MB Cache)',
    unlocked: 'Yes',
    tdp: '170W',
    max_turbo_power: '230W PPT',
    tjmax: '95°C',
    thermal_solution: 'Cooler Not Included - Liquid Cooler Recommended',
    memory_types: 'DDR5-5600 MT/s (Dual Channel, up to 192GB)',
    max_memory_size: '192 GB',
    memory_channels: '2',
    ecc_supported: 'Yes',
    igpu: 'AMD Radeon™ Graphics (2 Cores, 2200 MHz)',
    pcie_revision: 'PCIe 5.0 (28 Total Lanes)',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. GRAPHICS CARD (GPU) OFFICIAL SPECIFICATION TEMPLATE (MSI / GIGABYTE / ASUS)
// ─────────────────────────────────────────────────────────────────────────────
export const GPU_SPEC_TEMPLATE: SpecTemplate = {
  categoryName: 'Graphics Card (GPU)',
  sections: [
    {
      title: 'GPU Engine & Processing',
      fields: [
        { key: 'gpu_model', label: 'Graphics Processing Unit (GPU)', section: 'GPU Engine & Processing', placeholder: 'e.g. NVIDIA® GeForce RTX™ 5070 / RTX 4090 / AMD Radeon RX 7900 XTX', required: true },
        { key: 'cuda_cores', label: 'CUDA Cores / Stream Processors', section: 'GPU Engine & Processing', placeholder: 'e.g. 6,144 CUDA Cores / 16,384 CUDA Cores', required: true },
        { key: 'boost_clock', label: 'Engine Boost Clock Speed', section: 'GPU Engine & Processing', placeholder: 'e.g. Extreme Performance: 2625 MHz, Boost: 2610 MHz', required: true },
        { key: 'base_clock', label: 'Engine Base Clock Speed', section: 'GPU Engine & Processing', placeholder: 'e.g. 2295 MHz' },
        { key: 'ray_tracing_tensor', label: 'Ray Tracing & AI Cores', section: 'GPU Engine & Processing', placeholder: 'e.g. 4th Gen Tensor Cores, 3rd Gen RT Cores, DLSS 4 Support' },
      ],
    },
    {
      title: 'Video Memory (VRAM)',
      fields: [
        { key: 'vram_capacity', label: 'Memory Size', section: 'Video Memory (VRAM)', placeholder: 'e.g. 12GB / 16GB / 24GB', required: true },
        { key: 'memory_type', label: 'Memory Type', section: 'Video Memory (VRAM)', placeholder: 'e.g. GDDR7 / GDDR6X / GDDR6', required: true },
        { key: 'memory_bus', label: 'Memory Bus Width', section: 'Video Memory (VRAM)', placeholder: 'e.g. 192-bit / 256-bit / 384-bit', required: true },
        { key: 'memory_speed', label: 'Memory Clock Speed / Bandwidth', section: 'Video Memory (VRAM)', placeholder: 'e.g. 28 Gbps (672 GB/s Bandwidth)' },
      ],
    },
    {
      title: 'Display & Interface',
      fields: [
        { key: 'bus_interface', label: 'Bus Standard', section: 'Display & Interface', placeholder: 'e.g. PCI Express® Gen 5.0 x16 / Gen 4.0 x16', required: true },
        { key: 'display_outputs', label: 'Display Output Ports', section: 'Display & Interface', placeholder: 'e.g. 3 x DisplayPort 2.1a (UHBR20), 1 x HDMI 2.1b (up to 4K@240Hz / 8K@60Hz HDR)', required: true },
        { key: 'max_displays', label: 'Multi-Display Support', section: 'Display & Interface', placeholder: 'e.g. 4 Displays simultaneously' },
        { key: 'digital_max_resolution', label: 'Maximum Digital Resolution', section: 'Display & Interface', placeholder: 'e.g. 7680 x 4320 (8K UHD)' },
        { key: 'hdcp_support', label: 'HDCP Support & API', section: 'Display & Interface', placeholder: 'e.g. HDCP 2.3, DirectX 12 Ultimate, OpenGL 4.6, Vulkan 1.3' },
      ],
    },
    {
      title: 'Power & Thermal Design',
      fields: [
        { key: 'power_consumption', label: 'Power Consumption (TDP / TGP)', section: 'Power & Thermal Design', placeholder: 'e.g. 250W / 285W / 450W', required: true },
        { key: 'recommended_psu', label: 'Recommended System Power Supply', section: 'Power & Thermal Design', placeholder: 'e.g. 750W (or 850W recommended)', required: true },
        { key: 'power_connectors', label: 'Power Input Connectors', section: 'Power & Thermal Design', placeholder: 'e.g. 1 x 16-pin 12V-2x6 / 12VHPWR (or 2 x 8-pin PCIe)', required: true },
        { key: 'cooling_solution', label: 'Cooling Thermal Design', section: 'Power & Thermal Design', placeholder: 'e.g. TRI FROZR 3 Thermal Design, TORX FAN 5.0, Copper Baseplate, Core Pipes' },
      ],
    },
    {
      title: 'Physical Dimensions & Form Factor',
      fields: [
        { key: 'card_dimensions', label: 'Card Dimensions (L x W x H)', section: 'Physical Dimensions & Form Factor', placeholder: 'e.g. 307 x 125 x 46 mm', required: true },
        { key: 'slot_width', label: 'Slot Width / Form Factor', section: 'Physical Dimensions & Form Factor', placeholder: 'e.g. 2.5 Slots / 3.5 Slots' },
        { key: 'card_weight', label: 'Card Weight', section: 'Physical Dimensions & Form Factor', placeholder: 'e.g. 1098g / 1870g' },
        { key: 'accessories', label: 'Accessories Included', section: 'Physical Dimensions & Form Factor', placeholder: 'e.g. Anti-Bending Graphics Card Support Bracket, 16-pin to 2x 8-pin Power Cable' },
      ],
    },
  ],
  preset: {
    gpu_model: 'NVIDIA® GeForce RTX™ 5070',
    cuda_cores: '6,144 CUDA Cores',
    boost_clock: 'Extreme Performance: 2625 MHz (MSI Center) / Boost: 2610 MHz',
    base_clock: '2295 MHz',
    ray_tracing_tensor: '5th Gen Tensor Cores, 4th Gen RT Cores, DLSS 4 Neural Rendering',
    vram_capacity: '12GB',
    memory_type: 'GDDR7',
    memory_bus: '192-bit',
    memory_speed: '28 Gbps (672 GB/s Bandwidth)',
    bus_interface: 'PCI Express® Gen 5.0 x16',
    display_outputs: '3 x DisplayPort 2.1a (UHBR20), 1 x HDMI 2.1b (up to 4K@240Hz / 8K@60Hz HDR)',
    max_displays: '4 Displays',
    digital_max_resolution: '7680 x 4320 (8K UHD)',
    hdcp_support: 'HDCP 2.3, DirectX 12 Ultimate, OpenGL 4.6',
    power_consumption: '250W',
    recommended_psu: '750W',
    power_connectors: '1 x 16-pin (12V-2x6 / 12VHPWR)',
    cooling_solution: 'TRI FROZR 3 Thermal Design with TORX Fan 5.0 & Airflow Control',
    card_dimensions: '307 x 125 x 46 mm',
    slot_width: '2.5 Slots',
    card_weight: '1150g',
    accessories: 'Graphics Card Support Bracket, 16-pin Power Cable Adapter',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. DESKTOP RAM / MEMORY OFFICIAL SPECIFICATION TEMPLATE (CORSAIR / G.SKILL)
// ─────────────────────────────────────────────────────────────────────────────
export const RAM_SPEC_TEMPLATE: SpecTemplate = {
  categoryName: 'Desktop RAM',
  sections: [
    {
      title: 'Memory Specifications',
      fields: [
        { key: 'memory_type', label: 'Memory Type & Standard', section: 'Memory Specifications', placeholder: 'e.g. DDR5 / DDR4 Unbuffered DIMM', required: true },
        { key: 'capacity', label: 'Total Kit Capacity', section: 'Memory Specifications', placeholder: 'e.g. 32GB (2 x 16GB) / 64GB (2 x 32GB)', required: true },
        { key: 'kit_configuration', label: 'Kit Configuration', section: 'Memory Specifications', placeholder: 'e.g. Dual Channel Kit (2x 16GB DIMMs)', required: true },
        { key: 'tested_speed', label: 'Tested Frequency / Speed', section: 'Memory Specifications', placeholder: 'e.g. 6000 MT/s / 6400 MT/s / 7200 MT/s', required: true },
        { key: 'tested_latency', label: 'Tested CAS Latency & Timings', section: 'Memory Specifications', placeholder: 'e.g. CL30-36-36-76 / CL36-44-44-96', required: true },
        { key: 'tested_voltage', label: 'Tested Voltage', section: 'Memory Specifications', placeholder: 'e.g. 1.35V / 1.40V', required: true },
      ],
    },
    {
      title: 'Compatibility & Overclocking',
      fields: [
        { key: 'spd_speed', label: 'SPD Default Speed & Voltage', section: 'Compatibility & Overclocking', placeholder: 'e.g. 4800 MT/s @ 1.10V' },
        { key: 'overclock_profile', label: 'Overclocking Profile Support', section: 'Compatibility & Overclocking', placeholder: 'e.g. AMD EXPO™ & Intel® XMP 3.0 Ready', required: true },
        { key: 'pin_out', label: 'Form Factor / Pin Count', section: 'Compatibility & Overclocking', placeholder: 'e.g. 288-pin DIMM' },
        { key: 'ecc_type', label: 'Error Correction (ECC)', section: 'Compatibility & Overclocking', placeholder: 'e.g. Non-ECC, On-Die ECC' },
      ],
    },
    {
      title: 'Design & Aesthetics',
      fields: [
        { key: 'heat_spreader', label: 'Heat Spreader Material', section: 'Design & Aesthetics', placeholder: 'e.g. Solid Anodized Brushed Aluminum Heatsink' },
        { key: 'lighting', label: 'RGB Lighting & Control', section: 'Design & Aesthetics', placeholder: 'e.g. Dynamic 10-Zone RGB Light Bar, iCUE / Mystic Light / Aura Sync' },
        { key: 'module_height', label: 'Module Height', section: 'Design & Aesthetics', placeholder: 'e.g. 44mm (Low profile clearance)' },
      ],
    },
  ],
  preset: {
    memory_type: 'DDR5 Unbuffered DIMM',
    capacity: '32GB (2 x 16GB)',
    kit_configuration: '2 x 16GB Dual Channel Kit',
    tested_speed: 'DDR5-6000 MT/s',
    tested_latency: 'CL30-36-36-76',
    tested_voltage: '1.35V',
    spd_speed: '4800 MT/s @ 1.10V',
    overclock_profile: 'AMD EXPO™ & Intel® XMP 3.0 Certified',
    pin_out: '288-pin DIMM',
    ecc_type: 'Non-ECC, On-Die ECC',
    heat_spreader: 'Matte Black Anodized Solid Aluminum',
    lighting: 'Dynamic Panoramic Multi-Zone ARGB Light Bar',
    module_height: '44 mm',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. STORAGE / SSD (M.2 NVMe) OFFICIAL SPECIFICATION TEMPLATE (SAMSUNG / WD)
// ─────────────────────────────────────────────────────────────────────────────
export const SSD_SPEC_TEMPLATE: SpecTemplate = {
  categoryName: 'Storage (SSD/M.2)',
  sections: [
    {
      title: 'General & Interface',
      fields: [
        { key: 'capacity', label: 'Storage Capacity', section: 'General & Interface', placeholder: 'e.g. 2TB / 1TB / 4TB', required: true },
        { key: 'form_factor', label: 'Form Factor', section: 'General & Interface', placeholder: 'e.g. M.2 (2280) / 2.5-inch SATA', required: true },
        { key: 'interface', label: 'Host Interface', section: 'General & Interface', placeholder: 'e.g. PCIe® Gen 5.0 x4, NVMe™ 2.0 / PCIe Gen 4.0 x4, NVMe 1.4', required: true },
        { key: 'nand_type', label: 'NAND Flash Architecture', section: 'General & Interface', placeholder: 'e.g. Samsung V-NAND 3-bit MLC (TLC) / 3D TLC NAND', required: true },
        { key: 'controller', label: 'SSD Controller', section: 'General & Interface', placeholder: 'e.g. In-House Pascal Controller / Phison PS5026-E26' },
        { key: 'dram_cache', label: 'DRAM Cache Memory', section: 'General & Interface', placeholder: 'e.g. 2GB Low Power DDR4 SDRAM / DRAM-less HMB' },
      ],
    },
    {
      title: 'Performance & Speeds',
      fields: [
        { key: 'seq_read', label: 'Sequential Read Speed', section: 'Performance & Speeds', placeholder: 'e.g. Up to 14,500 MB/s (PCIe 5.0) / 7,450 MB/s (PCIe 4.0)', required: true },
        { key: 'seq_write', label: 'Sequential Write Speed', section: 'Performance & Speeds', placeholder: 'e.g. Up to 12,000 MB/s (PCIe 5.0) / 6,900 MB/s (PCIe 4.0)', required: true },
        { key: 'random_read', label: 'Random Read (4KB, QD32)', section: 'Performance & Speeds', placeholder: 'e.g. Up to 1,600,000 IOPS' },
        { key: 'random_write', label: 'Random Write (4KB, QD32)', section: 'Performance & Speeds', placeholder: 'e.g. Up to 1,550,000 IOPS' },
      ],
    },
    {
      title: 'Reliability, Thermal & Encryption',
      fields: [
        { key: 'endurance_tbw', label: 'Endurance (TBW Rating)', section: 'Reliability, Thermal & Encryption', placeholder: 'e.g. 1,200 TBW (for 2TB model)', required: true },
        { key: 'mtbf', label: 'Mean Time Between Failures (MTBF)', section: 'Reliability, Thermal & Encryption', placeholder: 'e.g. 1.5 Million Hours' },
        { key: 'encryption', label: 'Hardware Encryption', section: 'Reliability, Thermal & Encryption', placeholder: 'e.g. AES 256-bit Encryption (Class 0), TCG/Opal, IEEE1667' },
        { key: 'thermal_guard', label: 'Heatsink / Thermal Solution', section: 'Reliability, Thermal & Encryption', placeholder: 'e.g. Built-in Aluminum Fin Heatsink with RGB / Nickel-Coated Controller' },
        { key: 'operating_power', label: 'Power Consumption', section: 'Reliability, Thermal & Encryption', placeholder: 'e.g. Average: 7.8W, Burst: 11.5W, Sleep: 5mW' },
      ],
    },
  ],
  preset: {
    capacity: '2TB',
    form_factor: 'M.2 2280 (Double-sided)',
    interface: 'PCIe® Gen 5.0 x4, NVMe™ 2.0',
    nand_type: 'Micron 232-Layer 3D TLC NAND',
    controller: 'Phison PS5026-E26 PCIe 5.0 Controller',
    dram_cache: '4GB LPDDR4 Cache',
    seq_read: 'Up to 14,000 MB/s',
    seq_write: 'Up to 12,000 MB/s',
    random_read: 'Up to 1,500,000 IOPS',
    random_write: 'Up to 1,400,000 IOPS',
    endurance_tbw: '1,400 TBW (Terabytes Written)',
    mtbf: '1.6 Million Hours',
    encryption: 'AES 256-bit Full Disk Encryption, TCG Opal 2.0',
    thermal_guard: 'High-Density Aluminum Fin Thermal Heatsink',
    operating_power: 'Average: 8.5W, Idle: 1.5W',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 6. POWER SUPPLY (PSU) OFFICIAL SPECIFICATION TEMPLATE (CORSAIR / MSI)
// ─────────────────────────────────────────────────────────────────────────────
export const PSU_SPEC_TEMPLATE: SpecTemplate = {
  categoryName: 'Power Supply (PSU)',
  sections: [
    {
      title: 'Power & Efficiency',
      fields: [
        { key: 'wattage', label: 'Total Continuous Power', section: 'Power & Efficiency', placeholder: 'e.g. 850W / 1000W / 1200W', required: true },
        { key: 'efficiency_rating', label: '80 PLUS Efficiency Rating', section: 'Power & Efficiency', placeholder: 'e.g. 80 PLUS Gold (Up to 90% efficiency at 50% load) / Platinum', required: true },
        { key: 'cybenetics_rating', label: 'Cybenetics Rating', section: 'Power & Efficiency', placeholder: 'e.g. ETA Gold / LAMBDA A- (Ultra Quiet)' },
        { key: 'form_factor', label: 'Form Factor Standard', section: 'Power & Efficiency', placeholder: 'e.g. ATX 3.1 & PCIe 5.1 Ready / ATX 3.0 / SFX', required: true },
        { key: 'modularity', label: 'Cable Modularity', section: 'Power & Efficiency', placeholder: 'e.g. 100% Fully Modular Flat Embossed Cables', required: true },
      ],
    },
    {
      title: 'Connectors & Cables',
      fields: [
        { key: 'pcie_16pin', label: '12V-2x6 / 12VHPWR (16-pin) PCIe 5.1', section: 'Connectors & Cables', placeholder: 'e.g. 1 x 600W Native 16-pin PCIe 5.1 cable', required: true },
        { key: 'pcie_8pin', label: 'PCIe 8-pin (6+2 pin) Connectors', section: 'Connectors & Cables', placeholder: 'e.g. 4 x 8-pin (6+2) PCIe Connectors', required: true },
        { key: 'eps_8pin', label: 'EPS / CPU 8-pin (4+4 pin) Connectors', section: 'Connectors & Cables', placeholder: 'e.g. 2 x 8-pin EPS 12V Connectors', required: true },
        { key: 'sata_connectors', label: 'SATA Power Connectors', section: 'Connectors & Cables', placeholder: 'e.g. 8 x SATA Connectors' },
        { key: 'molex_connectors', label: 'Peripheral (Molex 4-pin) Connectors', section: 'Connectors & Cables', placeholder: 'e.g. 4 x 4-pin Molex Connectors' },
      ],
    },
    {
      title: 'Fan, Protection & Dimensions',
      fields: [
        { key: 'fan_size', label: 'Cooling Fan & Bearing', section: 'Fan, Protection & Dimensions', placeholder: 'e.g. 135mm Fluid Dynamic Bearing (FDB) Fan with Zero RPM Mode' },
        { key: 'protections', label: 'Protection Circuits', section: 'Fan, Protection & Dimensions', placeholder: 'e.g. OVP, OCP, OPP, OTP, SCP, UVP (Full Industrial Protection)', required: true },
        { key: 'dimensions', label: 'Dimensions (L x W x H)', section: 'Fan, Protection & Dimensions', placeholder: 'e.g. 150 x 140 x 86 mm' },
        { key: 'warranty', label: 'Manufacturer Warranty', section: 'Fan, Protection & Dimensions', placeholder: 'e.g. 10 Years Official Replacement Warranty', required: true },
      ],
    },
  ],
  preset: {
    wattage: '850W Continuous Power',
    efficiency_rating: '80 PLUS Gold Certified (Up to 90% Efficiency)',
    cybenetics_rating: 'ETA Gold Efficiency / LAMBDA A- Acoustic',
    form_factor: 'Intel ATX 3.1 & PCIe 5.1 Compliant',
    modularity: '100% Fully Modular Flat Black Cables',
    pcie_16pin: '1 x 600W 12V-2x6 Native PCIe 5.1 Cable',
    pcie_8pin: '4 x PCIe 8-pin (6+2) Connectors',
    eps_8pin: '2 x EPS 12V 8-pin (4+4) CPU Connectors',
    sata_connectors: '8 x SATA Connectors',
    molex_connectors: '4 x 4-pin Molex Connectors',
    fan_size: '135mm Fluid Dynamic Bearing Fan (Zero RPM mode under 40% load)',
    protections: 'OVP, OCP, OPP, OTP, SCP, UVP (Full Suite Protection)',
    dimensions: '150 x 140 x 86 mm (Compact ATX)',
    warranty: '10 Years Official Replacement Warranty',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 7. PC CASING / CHASSIS OFFICIAL SPECIFICATION TEMPLATE (LIAN LI / NZXT)
// ─────────────────────────────────────────────────────────────────────────────
export const CASING_SPEC_TEMPLATE: SpecTemplate = {
  categoryName: 'Casing',
  sections: [
    {
      title: 'Form Factor & Structure',
      fields: [
        { key: 'case_type', label: 'Chassis Type / Form Factor', section: 'Form Factor & Structure', placeholder: 'e.g. Mid Tower / Full Tower Dual-Chamber Panoramic Showcase', required: true },
        { key: 'mb_support', label: 'Motherboard Compatibility', section: 'Form Factor & Structure', placeholder: 'e.g. E-ATX, ATX, Micro-ATX, Mini-ITX (Back-connect MB support)', required: true },
        { key: 'materials', label: 'Chassis Materials & Panels', section: 'Form Factor & Structure', placeholder: 'e.g. SPCC Steel, 4.0mm Dual Tempered Glass (Front & Side Pillarless)' },
        { key: 'dimensions', label: 'Case Dimensions (D x W x H)', section: 'Form Factor & Structure', placeholder: 'e.g. 465 x 285 x 459 mm', required: true },
      ],
    },
    {
      title: 'Clearances & Drive Bays',
      fields: [
        { key: 'gpu_clearance', label: 'Max GPU Length Clearance', section: 'Clearances & Drive Bays', placeholder: 'e.g. 430 mm (Supports 4-slot GPUs)', required: true },
        { key: 'cpu_cooler_clearance', label: 'Max CPU Cooler Height', section: 'Clearances & Drive Bays', placeholder: 'e.g. 167 mm', required: true },
        { key: 'psu_clearance', label: 'Max PSU Length Clearance', section: 'Clearances & Drive Bays', placeholder: 'e.g. 220 mm' },
        { key: 'drive_bays', label: 'Storage Drive Bays', section: 'Clearances & Drive Bays', placeholder: 'e.g. 2 x 3.5" HDD + 4 x 2.5" SSD' },
        { key: 'expansion_slots', label: 'PCIe Expansion Slots', section: 'Clearances & Drive Bays', placeholder: 'e.g. 7 Standard Horizontal / Vertical GPU Mount Ready' },
      ],
    },
    {
      title: 'Cooling & Radiator Support',
      fields: [
        { key: 'radiator_support', label: 'Liquid Cooling Radiator Support', section: 'Cooling & Radiator Support', placeholder: 'e.g. Top: Up to 360mm, Side: Up to 360mm, Bottom: Up to 360mm, Rear: 120mm', required: true },
        { key: 'fan_support', label: 'Total Fan Capacity', section: 'Cooling & Radiator Support', placeholder: 'e.g. Top: 3x 120mm / 2x 140mm, Side: 3x 120mm, Bottom: 3x 120mm, Rear: 1x 120mm (Up to 10 Fans)' },
        { key: 'preinstalled_fans', label: 'Pre-Installed Fans', section: 'Cooling & Radiator Support', placeholder: 'e.g. 4 x 120mm ARGB PWM Reverse-Blade Fans Included' },
        { key: 'front_io', label: 'Front Panel I/O Ports', section: 'Cooling & Radiator Support', placeholder: 'e.g. 1 x USB 3.2 Gen 2x2 Type-C (20Gbps), 2 x USB 3.2 Gen 1 Type-A, 1 x HD Audio, LED Mode Button', required: true },
      ],
    },
  ],
  preset: {
    case_type: 'Dual-Chamber Panoramic Mid Tower Showcase (Pillarless)',
    mb_support: 'E-ATX (under 280mm), ATX, Micro-ATX, Mini-ITX (Supports MSI Project Zero & ASUS BTF)',
    materials: 'Steel structure, 4.0mm Dual Beveled Tempered Glass',
    dimensions: '465 x 285 x 459 mm',
    gpu_clearance: '430 mm (Vertical & Horizontal support)',
    cpu_cooler_clearance: '167 mm',
    psu_clearance: '220 mm ATX',
    drive_bays: '2 x 3.5" HDD + 4 x 2.5" SSD',
    expansion_slots: '7 Full-Height Expansion Slots',
    radiator_support: 'Top: 360/280mm, Side: 360/280mm, Bottom: 360mm, Rear: 120mm',
    fan_support: 'Up to 10 x 120mm Fans (3x Top, 3x Side, 3x Bottom, 1x Rear)',
    preinstalled_fans: '4 x 120mm ARGB PWM Fans (3x Reverse Intake on Side, 1x Rear Exhaust)',
    front_io: '1 x USB 3.2 Gen 2x2 Type-C, 2 x USB 3.2 Gen 1, 1 x Audio/Mic Combo, ARGB Sync Button',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 8. CPU COOLER / LIQUID COOLER OFFICIAL SPECIFICATION TEMPLATE (MSI / DEEPCOOL)
// ─────────────────────────────────────────────────────────────────────────────
export const COOLER_SPEC_TEMPLATE: SpecTemplate = {
  categoryName: 'CPU Cooler',
  sections: [
    {
      title: 'Cooler Overview & Compatibility',
      fields: [
        { key: 'cooler_type', label: 'Cooler Type', section: 'Cooler Overview & Compatibility', placeholder: 'e.g. 360mm All-in-One (AIO) Liquid CPU Cooler / Dual-Tower Air Cooler', required: true },
        { key: 'socket_compatibility', label: 'CPU Socket Compatibility', section: 'Cooler Overview & Compatibility', placeholder: 'e.g. AMD AM5 / AM4, Intel LGA1851 / LGA1700 / LGA1200 / LGA115x', required: true },
        { key: 'tdp_rating', label: 'TDP Dissipation Capability', section: 'Cooler Overview & Compatibility', placeholder: 'e.g. Up to 320W TDP' },
      ],
    },
    {
      title: 'Radiator & Water Pump (for AIO)',
      fields: [
        { key: 'radiator_dimensions', label: 'Radiator Dimensions & Material', section: 'Radiator & Water Pump (for AIO)', placeholder: 'e.g. 394 x 119.2 x 27 mm (Solid Aluminum)' },
        { key: 'tubing', label: 'Cooling Tubing', section: 'Radiator & Water Pump (for AIO)', placeholder: 'e.g. 400mm Braided Mesh Reinforced Leak-Proof Rubber Tubing' },
        { key: 'pump_speed', label: 'Pump Motor Speed & Bearing', section: 'Radiator & Water Pump (for AIO)', placeholder: 'e.g. 3100 RPM ± 10%, Ceramic Bearing (100,000 hrs MTBF)' },
        { key: 'pump_block_display', label: 'Waterblock Display / Lighting', section: 'Radiator & Water Pump (for AIO)', placeholder: 'e.g. 2.4" IPS LCD Screen (320x240, 60Hz) / 270° Rotatable ARGB Block' },
      ],
    },
    {
      title: 'Cooling Fans',
      fields: [
        { key: 'fan_dimensions', label: 'Fan Dimensions & Quantity', section: 'Cooling Fans', placeholder: 'e.g. 3 x 120 x 120 x 25 mm', required: true },
        { key: 'fan_speed', label: 'Fan Speed Range', section: 'Cooling Fans', placeholder: 'e.g. 600 - 2000 RPM (PWM Controlled)', required: true },
        { key: 'fan_airflow', label: 'Fan Airflow & Air Pressure', section: 'Cooling Fans', placeholder: 'e.g. Airflow: 77.4 CFM, Static Pressure: 3.17 mmH2O' },
        { key: 'fan_noise', label: 'Noise Level', section: 'Cooling Fans', placeholder: 'e.g. 14.3 ~ 32.5 dBA (Ultra-Quiet Fluid Dynamic Bearing)' },
      ],
    },
  ],
  preset: {
    cooler_type: '360mm Premium AIO Liquid CPU Cooler with LCD Display',
    socket_compatibility: 'AMD AM5 / AM4, Intel LGA1851 / LGA1700 / LGA1200',
    tdp_rating: 'Up to 300W+ TDP Dissipation',
    radiator_dimensions: '394 x 119.2 x 27 mm (Aluminum Radiator)',
    tubing: '400mm Braided Reinforced Anti-Evaporation Rubber Tubing',
    pump_speed: '3100 RPM, Durable Ceramic Shaft Bearing (100,000h Life)',
    pump_block_display: '2.4-inch High-Brightness IPS LCD Screen (Hardware Monitor & Custom GIFs)',
    fan_dimensions: '3 x 120mm ARGB PWM Fans',
    fan_speed: '600 - 2000 RPM ± 10%',
    fan_airflow: '77.4 CFM Max Airflow, 3.17 mmH2O Air Pressure',
    fan_noise: 'Max 32.5 dBA (Fluid Dynamic Bearing)',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 9. GAMING MONITOR OFFICIAL SPECIFICATION TEMPLATE (MSI / GIGABYTE / ASUS)
// ─────────────────────────────────────────────────────────────────────────────
export const MONITOR_SPEC_TEMPLATE: SpecTemplate = {
  categoryName: 'Gaming Monitor',
  sections: [
    {
      title: 'Display Panel & Picture Quality',
      fields: [
        { key: 'panel_size', label: 'Screen Size (Diagonal)', section: 'Display Panel & Picture Quality', placeholder: 'e.g. 27" (68.58 cm) / 32" / 34" Curved', required: true },
        { key: 'panel_type', label: 'Panel Technology', section: 'Display Panel & Picture Quality', placeholder: 'e.g. Quantum Dot OLED (QD-OLED) / Fast IPS / Rapid VA', required: true },
        { key: 'resolution', label: 'Native Resolution', section: 'Display Panel & Picture Quality', placeholder: 'e.g. 2560 x 1440 (2K WQHD) / 3840 x 2160 (4K UHD)', required: true },
        { key: 'aspect_ratio', label: 'Aspect Ratio & Curvature', section: 'Display Panel & Picture Quality', placeholder: 'e.g. 16:9 Flat / 21:9 Ultrawide 1800R Curvature' },
        { key: 'refresh_rate', label: 'Max Refresh Rate', section: 'Display Panel & Picture Quality', placeholder: 'e.g. 360Hz / 240Hz / 180Hz', required: true },
        { key: 'response_time', label: 'Response Time (GtG / MPRT)', section: 'Display Panel & Picture Quality', placeholder: 'e.g. 0.03ms (GtG QD-OLED) / 1ms (GtG)', required: true },
        { key: 'contrast_ratio', label: 'Contrast Ratio', section: 'Display Panel & Picture Quality', placeholder: 'e.g. 1,500,000:1 (Infinite QD-OLED) / 1000:1 (IPS)' },
        { key: 'brightness', label: 'Peak Brightness', section: 'Display Panel & Picture Quality', placeholder: 'e.g. 1000 nits (HDR Peak 3%), 250 nits (SDR)' },
      ],
    },
    {
      title: 'Color & Sync Technology',
      fields: [
        { key: 'color_gamut', label: 'Color Gamut & Accuracy', section: 'Color & Sync Technology', placeholder: 'e.g. 99% DCI-P3, 138% sRGB, Delta E ≤ 2 Factory Calibrated' },
        { key: 'hdr_rating', label: 'HDR Certification', section: 'Color & Sync Technology', placeholder: 'e.g. VESA DisplayHDR™ True Black 400 / VESA DisplayHDR 600' },
        { key: 'sync_technology', label: 'Adaptive Sync Technology', section: 'Color & Sync Technology', placeholder: 'e.g. AMD FreeSync™ Premium Pro, NVIDIA® G-SYNC® Compatible' },
      ],
    },
    {
      title: 'Connectivity & Ergonomics',
      fields: [
        { key: 'video_inputs', label: 'Video Input Ports', section: 'Connectivity & Ergonomics', placeholder: 'e.g. 2 x HDMI 2.1 (48Gbps), 1 x DisplayPort 1.4a (DSC), 1 x USB Type-C (DP Alt, 90W PD)', required: true },
        { key: 'usb_hub', label: 'USB Hub & Audio Ports', section: 'Connectivity & Ergonomics', placeholder: 'e.g. 2 x USB 2.0 Type-A downstream, 1 x USB Type-B upstream, 1 x Headphone Out' },
        { key: 'ergonomics', label: 'Ergonomic Adjustments', section: 'Connectivity & Ergonomics', placeholder: 'e.g. Height (110mm), Tilt (-5°~20°), Swivel (-30°~30°), Pivot (-90°~90°)' },
        { key: 'vesa_mount', label: 'VESA Wall Mount', section: 'Connectivity & Ergonomics', placeholder: 'e.g. 100 x 100 mm' },
      ],
    },
  ],
  preset: {
    panel_size: '27-inch (68.58 cm)',
    panel_type: 'Next-Gen Quantum Dot OLED (QD-OLED)',
    resolution: '2560 x 1440 (2K WQHD)',
    aspect_ratio: '16:9 Flat',
    refresh_rate: '360Hz Ultra-Smooth Refresh Rate',
    response_time: '0.03ms (GtG)',
    contrast_ratio: '1,500,000:1 (Infinite QD-OLED Contrast)',
    brightness: '1000 nits (HDR Peak), 250 nits (Typ. SDR)',
    color_gamut: '99% DCI-P3, 138% sRGB, 1.07 Billion Colors (10-bit)',
    hdr_rating: 'VESA DisplayHDR™ True Black 400 & ClearMR 13000',
    sync_technology: 'Adaptive-Sync, AMD FreeSync™ Premium Pro, G-Sync Compatible',
    video_inputs: '2 x HDMI 2.1 (48Gbps, 2K@360Hz), 1 x DisplayPort 1.4a, 1 x USB-C (DisplayPort, 90W PD)',
    usb_hub: '2 x USB 2.0 Type-A, 1 x USB Type-B, 1 x 3.5mm Headphone Jack',
    ergonomics: 'Height Adjust (0~110mm), Tilt (-5°~20°), Swivel (-30°~30°), Pivot (-90°~90°)',
    vesa_mount: '100 x 100 mm',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 10. GAMING LAPTOP OFFICIAL SPECIFICATION TEMPLATE (MSI / ASUS / LENOVO)
// ─────────────────────────────────────────────────────────────────────────────
export const LAPTOP_SPEC_TEMPLATE: SpecTemplate = {
  categoryName: 'Gaming Laptop',
  sections: [
    {
      title: 'Core Hardware & Processing',
      fields: [
        { key: 'cpu', label: 'Processor (CPU)', section: 'Core Hardware & Processing', placeholder: 'e.g. Intel® Core™ i9-14900HX (24 Cores, up to 5.8 GHz) / AMD Ryzen 9 7945HX', required: true },
        { key: 'gpu', label: 'Graphics Card (GPU)', section: 'Core Hardware & Processing', placeholder: 'e.g. NVIDIA® GeForce RTX™ 4090 Laptop GPU 16GB GDDR6 (175W Max TGP)', required: true },
        { key: 'mux_switch', label: 'MUX Switch & Advanced Optimus', section: 'Core Hardware & Processing', placeholder: 'e.g. MUX Switch with NVIDIA® Advanced Optimus' },
      ],
    },
    {
      title: 'Display & Visuals',
      fields: [
        { key: 'display_panel', label: 'Display Panel', section: 'Display & Visuals', placeholder: 'e.g. 17.0" QHD+ (2560x1600), 240Hz, 16:10, 100% DCI-P3, IPS-Level, 500 nits', required: true },
      ],
    },
    {
      title: 'Memory & Storage',
      fields: [
        { key: 'ram', label: 'System Memory (RAM)', section: 'Memory & Storage', placeholder: 'e.g. 32GB (2x16GB) DDR5-5600MHz (2x SO-DIMM slots, up to 64GB)', required: true },
        { key: 'storage', label: 'Storage Drive (SSD)', section: 'Memory & Storage', placeholder: 'e.g. 2TB NVMe PCIe Gen4 SSD (2x M.2 slots, 1x PCIe Gen5 ready)', required: true },
      ],
    },
    {
      title: 'Keyboard, Audio & Webcam',
      fields: [
        { key: 'keyboard', label: 'Keyboard & Lighting', section: 'Keyboard, Audio & Webcam', placeholder: 'e.g. SteelSeries Per-Key RGB Gaming Keyboard with Mystic Light Matrix Bar' },
        { key: 'audio_speakers', label: 'Sound System & Speakers', section: 'Keyboard, Audio & Webcam', placeholder: 'e.g. Dynaudio Sound System: 2x 2W Speakers + 4x 2W Woofers, Hi-Res Audio' },
        { key: 'webcam', label: 'Webcam & Biometrics', section: 'Keyboard, Audio & Webcam', placeholder: 'e.g. FHD (1080p@30fps) with Privacy Shutter & Windows Hello IR Facial Recognition' },
      ],
    },
    {
      title: 'Connectivity, Battery & Chassis',
      fields: [
        { key: 'wireless_networking', label: 'Wireless & LAN Networking', section: 'Connectivity, Battery & Chassis', placeholder: 'e.g. Intel® Killer™ Wi-Fi 7 BE1750 + Bluetooth 5.4, 2.5 GbE Killer LAN', required: true },
        { key: 'io_ports', label: 'I/O Connectivity Ports', section: 'Connectivity, Battery & Chassis', placeholder: 'e.g. 1x Thunderbolt™ 4 / USB4 Type-C (PD 3.0), 1x USB 3.2 Gen 2 Type-C (DP), 2x USB 3.2 Gen 2 Type-A, 1x HDMI 2.1, 1x SD Express, 1x RJ45, 1x Audio Jack', required: true },
        { key: 'battery', label: 'Battery Capacity & Power Adapter', section: 'Connectivity, Battery & Chassis', placeholder: 'e.g. 4-Cell 99.9 Whr (Flight Legal Limit), 330W Power Adapter', required: true },
        { key: 'dimensions_weight', label: 'Dimensions & Weight', section: 'Connectivity, Battery & Chassis', placeholder: 'e.g. 380 x 298 x 23 mm | 3.1 kg' },
        { key: 'operating_system', label: 'Operating System', section: 'Connectivity, Battery & Chassis', placeholder: 'e.g. Windows 11 Home / Windows 11 Pro', required: true },
      ],
    },
  ],
  preset: {
    cpu: 'Intel® Core™ i9-14900HX (24 Cores: 8 P-cores + 16 E-cores, up to 5.8 GHz, 36MB Cache)',
    gpu: 'NVIDIA® GeForce RTX™ 4090 Laptop GPU 16GB GDDR6 (Up to 175W with Dynamic Boost)',
    mux_switch: 'Discrete Graphics Mode (MUX Switch) + NVIDIA Advanced Optimus',
    display_panel: '17.0" QHD+ (2560x1600), 16:10, 240Hz, 100% DCI-P3, IPS-Level, 500 nits, Anti-Glare',
    ram: '32GB (2x 16GB) DDR5-5600MHz (2x SO-DIMM, expandable to 64GB)',
    storage: '2TB NVMe PCIe Gen4x4 SSD (Extra PCIe Gen5 M.2 slot available)',
    keyboard: 'SteelSeries Per-Key RGB Gaming Keyboard with Mystic Light Aurora Bar',
    audio_speakers: 'Dynaudio 6-Speaker System (2x Tweeters + 4x Woofers), Hi-Res Audio, Nahimic 3',
    webcam: 'FHD 1080p Web Camera with Privacy Shutter and Windows Hello Facial Recognition',
    wireless_networking: 'Intel® Killer™ Wi-Fi 7 BE1750 (802.11be) + Bluetooth 5.4, 2.5G Killer LAN',
    io_ports: '1x Thunderbolt™ 4 / USB4 (PD 3.0), 1x USB 3.2 Gen 2 Type-C (DP), 2x USB 3.2 Gen 2 Type-A, 1x HDMI 2.1 (8K@60Hz), 1x SD Express Reader, 1x RJ45, 1x Audio Combo',
    battery: '4-Cell 99.9 Whr Li-Polymer, 330W High-Efficiency Power Adapter',
    dimensions_weight: '380 x 298 x 23 mm | 3.1 kg',
    operating_system: 'Windows 11 Home (64-bit Official)',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// REGISTRY MAPPING & RESOLVER
// ─────────────────────────────────────────────────────────────────────────────
export const DESKTOP_PC_SPEC_TEMPLATE: SpecTemplate = {
  categoryName: 'Desktop / Brand PC',
  sections: [
    {
      title: 'Processor',
      fields: [
        { key: 'cpu_model', label: 'Processor Model', section: 'Processor', placeholder: 'e.g. Intel Core Ultra 7 265K / AMD Ryzen 7 9800X3D', required: true },
        { key: 'cpu_cores_threads', label: 'Cores / Threads', section: 'Processor', placeholder: 'e.g. 8 Cores / 16 Threads' },
        { key: 'cpu_clock', label: 'Processor Clock Speed', section: 'Processor', placeholder: 'e.g. Up to 5.5 GHz' },
        { key: 'cpu_cooler', label: 'CPU Cooling', section: 'Processor', placeholder: 'e.g. 240 mm liquid cooler / tower air cooler' },
      ],
    },
    {
      title: 'Memory & Storage',
      fields: [
        { key: 'memory_capacity', label: 'Memory Capacity', section: 'Memory & Storage', placeholder: 'e.g. 32 GB (2 x 16 GB)', required: true },
        { key: 'memory_type', label: 'Memory Type / Speed', section: 'Memory & Storage', placeholder: 'e.g. DDR5 6000 MT/s' },
        { key: 'primary_storage', label: 'Primary Storage', section: 'Memory & Storage', placeholder: 'e.g. 1 TB PCIe 4.0 NVMe SSD', required: true },
        { key: 'secondary_storage', label: 'Additional Storage', section: 'Memory & Storage', placeholder: 'e.g. 2 TB HDD / None' },
      ],
    },
    {
      title: 'Graphics & Mainboard',
      fields: [
        { key: 'graphics_model', label: 'Graphics Card', section: 'Graphics & Mainboard', placeholder: 'e.g. NVIDIA GeForce RTX 5070 12 GB', required: true },
        { key: 'graphics_memory', label: 'Graphics Memory', section: 'Graphics & Mainboard', placeholder: 'e.g. 12 GB GDDR7' },
        { key: 'motherboard_model', label: 'Motherboard Model / Chipset', section: 'Graphics & Mainboard', placeholder: 'e.g. ASUS B850M / AMD B850' },
      ],
    },
    {
      title: 'System & Connectivity',
      fields: [
        { key: 'power_supply', label: 'Power Supply', section: 'System & Connectivity', placeholder: 'e.g. 750 W 80 PLUS Gold' },
        { key: 'case_model', label: 'Case / Chassis', section: 'System & Connectivity', placeholder: 'e.g. ATX Mid Tower with tempered glass' },
        { key: 'operating_system', label: 'Operating System', section: 'System & Connectivity', placeholder: 'e.g. Windows 11 Home / No OS' },
        { key: 'wireless_connectivity', label: 'Wireless Connectivity', section: 'System & Connectivity', placeholder: 'e.g. Wi-Fi 6E, Bluetooth 5.3' },
        { key: 'included_accessories', label: 'Included Accessories', section: 'System & Connectivity', placeholder: 'e.g. Power cable, keyboard and mouse' },
      ],
    },
  ],
};

export const ALL_SPEC_TEMPLATES: Record<string, SpecTemplate> = {
  motherboard: MOTHERBOARD_SPEC_TEMPLATE,
  processor: PROCESSOR_SPEC_TEMPLATE,
  cpu: PROCESSOR_SPEC_TEMPLATE,
  'graphics-card': GPU_SPEC_TEMPLATE,
  gpu: GPU_SPEC_TEMPLATE,
  ram: RAM_SPEC_TEMPLATE,
  'desktop-ram': RAM_SPEC_TEMPLATE,
  memory: RAM_SPEC_TEMPLATE,
  storage: SSD_SPEC_TEMPLATE,
  ssd: SSD_SPEC_TEMPLATE,
  'm2-ssd': SSD_SPEC_TEMPLATE,
  'power-supply': PSU_SPEC_TEMPLATE,
  psu: PSU_SPEC_TEMPLATE,
  casing: CASING_SPEC_TEMPLATE,
  'pc-case': CASING_SPEC_TEMPLATE,
  'cpu-cooler': COOLER_SPEC_TEMPLATE,
  cooler: COOLER_SPEC_TEMPLATE,
  monitor: MONITOR_SPEC_TEMPLATE,
  'gaming-monitor': MONITOR_SPEC_TEMPLATE,
  laptop: LAPTOP_SPEC_TEMPLATE,
  'gaming-laptop': LAPTOP_SPEC_TEMPLATE,
  laptops: LAPTOP_SPEC_TEMPLATE,
  'brand-pc': DESKTOP_PC_SPEC_TEMPLATE,
  'desktop-pc': DESKTOP_PC_SPEC_TEMPLATE,
  'gaming-pc': DESKTOP_PC_SPEC_TEMPLATE,
  'gaming-desktop': DESKTOP_PC_SPEC_TEMPLATE,
  desktop: DESKTOP_PC_SPEC_TEMPLATE,
};

// Numeric ID fallback mapping (from existing seed database IDs)
export const DB_CATEGORY_ID_TO_TEMPLATE_KEY: Record<number, string> = {
  5: 'processor',
  6: 'graphics-card',
  7: 'motherboard',
  8: 'ram',
  9: 'storage',
  10: 'power-supply',
  11: 'casing',
  12: 'cpu-cooler',
  3: 'monitor',
  13: 'laptop',
};

/**
 * Resolves the best-matching official specification template for any category
 */
export function getCategorySpecTemplate(
  categoryId?: number | null,
  categorySlug?: string | null,
  categoryName?: string | null
): SpecTemplate | null {
  // Prefer the category's current slug/name over legacy seed IDs so newly
  // created categories always select the correct template.
  if (categorySlug) {
    const cleanSlug = categorySlug.toLowerCase().trim();
    if (ALL_SPEC_TEMPLATES[cleanSlug]) return ALL_SPEC_TEMPLATES[cleanSlug];

    if (cleanSlug.includes('motherboard') || cleanSlug.includes('mobo')) return MOTHERBOARD_SPEC_TEMPLATE;
    if (cleanSlug.includes('processor') || cleanSlug.includes('cpu') || cleanSlug.includes('ryzen') || cleanSlug.includes('intel-core')) return PROCESSOR_SPEC_TEMPLATE;
    if (cleanSlug.includes('graphics') || cleanSlug.includes('gpu') || cleanSlug.includes('rtx') || cleanSlug.includes('radeon') || cleanSlug.includes('video-card')) return GPU_SPEC_TEMPLATE;
    if (cleanSlug.includes('ram') || cleanSlug.includes('memory')) return RAM_SPEC_TEMPLATE;
    if (cleanSlug.includes('ssd') || cleanSlug.includes('storage') || cleanSlug.includes('m2') || cleanSlug.includes('nvme')) return SSD_SPEC_TEMPLATE;
    if (cleanSlug.includes('power') || cleanSlug.includes('psu') || cleanSlug.includes('supply')) return PSU_SPEC_TEMPLATE;
    if (cleanSlug.includes('case') || cleanSlug.includes('casing') || cleanSlug.includes('chassis')) return CASING_SPEC_TEMPLATE;
    if (cleanSlug.includes('cooler') || cleanSlug.includes('cooling') || cleanSlug.includes('aio') || cleanSlug.includes('heatsink')) return COOLER_SPEC_TEMPLATE;
    if (cleanSlug.includes('monitor') || cleanSlug.includes('display')) return MONITOR_SPEC_TEMPLATE;
    if (cleanSlug.includes('laptop') || cleanSlug.includes('notebook')) return LAPTOP_SPEC_TEMPLATE;
    if (cleanSlug.includes('brand-pc') || cleanSlug.includes('desktop-pc') || cleanSlug.includes('gaming-pc') || cleanSlug.includes('desktop')) return DESKTOP_PC_SPEC_TEMPLATE;
  }

  if (categoryName) {
    const cleanName = categoryName.toLowerCase().trim();
    if (cleanName.includes('motherboard')) return MOTHERBOARD_SPEC_TEMPLATE;
    if (cleanName.includes('processor') || cleanName.includes('cpu')) return PROCESSOR_SPEC_TEMPLATE;
    if (cleanName.includes('graphics') || cleanName.includes('gpu') || cleanName.includes('rtx') || cleanName.includes('card')) return GPU_SPEC_TEMPLATE;
    if (cleanName.includes('ram') || cleanName.includes('memory')) return RAM_SPEC_TEMPLATE;
    if (cleanName.includes('ssd') || cleanName.includes('storage') || cleanName.includes('nvme')) return SSD_SPEC_TEMPLATE;
    if (cleanName.includes('power supply') || cleanName.includes('psu')) return PSU_SPEC_TEMPLATE;
    if (cleanName.includes('casing') || cleanName.includes('case') || cleanName.includes('chassis')) return CASING_SPEC_TEMPLATE;
    if (cleanName.includes('cooler') || cleanName.includes('cooling')) return COOLER_SPEC_TEMPLATE;
    if (cleanName.includes('monitor') || cleanName.includes('display')) return MONITOR_SPEC_TEMPLATE;
    if (cleanName.includes('laptop') || cleanName.includes('notebook')) return LAPTOP_SPEC_TEMPLATE;
    if (cleanName.includes('brand pc') || cleanName.includes('desktop pc') || cleanName.includes('gaming pc') || cleanName === 'desktop') return DESKTOP_PC_SPEC_TEMPLATE;
  }

  // Numeric IDs are a fallback for older records without a useful slug/name.
  if (categoryId && DB_CATEGORY_ID_TO_TEMPLATE_KEY[categoryId]) {
    const key = DB_CATEGORY_ID_TO_TEMPLATE_KEY[categoryId];
    if (ALL_SPEC_TEMPLATES[key]) return ALL_SPEC_TEMPLATES[key];
  }

  return null;
}
