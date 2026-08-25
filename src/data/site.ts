import type {
  BrandItem,
  BusinessStat,
  ContactMethod,
  NavItem,
  ProductCategory,
  ServiceItem,
  SiteConfig,
  SolutionPackage,
} from "@/types/site";

export const siteConfig: SiteConfig = {
  name: "Super Star Electronics Industries",
  shortName: "Super Star Electronics",
  tagline: "Trusted CCTV & Security Solutions in Chitwan, Nepal",
  description:
    "Super Star Electronics Industries is a Chitwan-based IT and security solutions provider delivering CCTV surveillance, networking equipment, installation, maintenance, and reliable after-sales support across Nepal.",
  siteUrl: "https://adityakumarshah.com.np",
  owner: "Suvash Chandra Shah",
  address: {
    street: "Ganesh Market, Narayangarh",
    locality: "Chitwan",
    district: "Chitwan",
    province: "Bagmati Province",
    country: "Nepal",
  },
  contact: {
    primaryPhone: "9855026835",
    whatsapp: "9779855026835",
    productWhatsapp: "9779855026835",
    email: "suvashshah251@gmail.com",
    mapsUrl: "https://maps.app.goo.gl/VRqi16GyjuqKfjkU8?utm_source=chatgpt.com",
    embedMapUrl:
      "https://www.google.com/maps?q=Ganesh%20Market%2C%20Narayangarh%2C%20Chitwan%2C%20Nepal&z=16&output=embed",
  },
  hours: {
    daysLabel: "Sunday - Friday",
    closedOn: "Saturday",
    hoursLabel: "9:00 AM - 6:00 PM",
    opens: "09:00",
    closes: "18:00",
  },
  serviceArea: "Products and services available across Nepal.",
  warranty: "One-year warranty support",
  paymentMethods: ["Cash", "Cheque", "Online Payment"],
  targetCustomers: [
    "Homes & apartments",
    "Offices",
    "Shops & businesses",
    "Industries & factories",
    "Schools & institutions",
    "Organizations needing reliable security systems",
  ],
  keywords: [
    "CCTV shop in Chitwan",
    "CCTV installation Nepal",
    "Hikvision dealer in Chitwan",
    "Security camera installation",
    "CCTV camera price in Nepal",
    "Wireless camera in Nepal",
    "Networking devices Chitwan",
  ],
};

export const navigation: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export const contactMethods: ContactMethod[] = [
  {
    label: "Call Main Line",
    value: siteConfig.contact.primaryPhone,
    href: `tel:${siteConfig.contact.primaryPhone}`,
    note: "Best for urgent product and installation inquiries.",
    icon: "phone",
  },
  {
    label: "WhatsApp",
    value: siteConfig.contact.primaryPhone,
    href: `https://wa.me/${siteConfig.contact.whatsapp}`,
    note: "Quick replies for pricing, availability, and support.",
    icon: "message",
  },
  {
    label: "Email",
    value: siteConfig.contact.email,
    href: `mailto:${siteConfig.contact.email}`,
    note: "Useful for quotations, documents, and business communication.",
    icon: "mail",
  },
  {
    label: "Visit The Shop",
    value: `${siteConfig.address.street}, ${siteConfig.address.locality}`,
    href: siteConfig.contact.mapsUrl,
    note: "Ganesh Market, Narayangarh, Chitwan, Nepal.",
    icon: "map",
  },
];

export const brands: BrandItem[] = [
  {
    name: "Hikvision",
    specialty: "Professional surveillance systems",
    logoSrc: "/brands/hikvision.png",
    logoAlt: "Hikvision logo",
  },
  {
    name: "EZVIZ",
    specialty: "Smart home and wireless monitoring",
    logoSrc: "/brands/ezviz.png",
    logoAlt: "EZVIZ logo",
  },
  {
    name: "HiLook",
    specialty: "Value-focused CCTV solutions",
    logoSrc: "/brands/hilook.webp",
    logoAlt: "HiLook logo",
  },
  {
    name: "IMOU",
    specialty: "Wi-Fi cameras and mobile viewing",
    logoSrc: "/brands/imou.png",
    logoAlt: "IMOU logo",
  },
  {
    name: "Tiandy",
    specialty: "Advanced security cameras and recorders",
    logoSrc: "/brands/tiandy.png",
    logoAlt: "Tiandy logo",
  },
  {
    name: "Consistent",
    specialty: "Networking accessories and infrastructure",
    logoSrc: "/brands/consistent.png",
    logoAlt: "Consistent logo",
  },
  {
    name: "ZKTeco",
    specialty: "Access control and security devices",
    logoSrc: "/brands/zkteco.png",
    logoAlt: "ZKTeco logo",
  },
];

export const businessStats: BusinessStat[] = [
  { value: "Sunday - Friday", label: "Working days" },
  { value: "1-Year Support", label: "Warranty promise" },
  { value: "Across Nepal", label: "Service coverage" },
];

export const whyChooseUs: string[] = [
  "Genuine branded security products",
  "Experienced CCTV installation team",
  "Reliable repair and maintenance support",
  "Affordable pricing for homes and businesses",
  "Wholesale and retail supply options",
  "Customized solutions with after-sales support",
];

export const offerHighlights = [
  {
    title: "Free Site Visit",
    detail: "Available in Chitwan for camera planning and coverage advice.",
    icon: "map" as const,
  },
  {
    title: "Fast Installation",
    detail: "Quick scheduling for urgent home, office, and shop setups.",
    icon: "tools" as const,
  },
  {
    title: "1-Year Support",
    detail: "Ongoing assistance after installation and product delivery.",
    icon: "shield" as const,
  },
  {
    title: "Wholesale Pricing",
    detail: "Supply support for resellers, projects, and bulk purchases.",
    icon: "warehouse" as const,
  },
];

export const customerScenarios = [
  {
    title: "Home Security",
    detail: "Entry points, floors, gates, and mobile viewing for family peace of mind.",
  },
  {
    title: "Shop Monitoring",
    detail: "Counter coverage, customer movement, and storage visibility for daily operations.",
  },
  {
    title: "Office & Network",
    detail: "Cameras, recording, routing, and access planning for reliable business use.",
  },
];

export const productCategories: ProductCategory[] = [
  {
    slug: "cctv-cameras",
    name: "CCTV Cameras",
    description:
      "Indoor and outdoor surveillance cameras designed for reliable coverage, day/night monitoring, and clear video capture.",
    useCases: ["Homes", "Shops", "Offices"],
    supportedBrands: ["Hikvision", "HiLook", "Tiandy"],
    inquiryLabel: "CCTV cameras",
  },
  {
    slug: "wireless-cameras",
    name: "Wireless Cameras",
    description:
      "Smart Wi-Fi cameras that are easy to monitor through mobile apps and ideal for flexible installation.",
    useCases: ["Apartments", "Home entry points", "Small businesses"],
    supportedBrands: ["EZVIZ", "IMOU"],
    inquiryLabel: "wireless cameras",
  },
  {
    slug: "dvr-nvr-systems",
    name: "DVR & NVR Systems",
    description:
      "Recording systems for centralized storage, playback, and long-term monitoring across multiple camera points.",
    useCases: ["Offices", "Retail", "Industrial sites"],
    supportedBrands: ["Hikvision", "Tiandy", "HiLook"],
    inquiryLabel: "DVR and NVR systems",
  },
  {
    slug: "routers-networking",
    name: "Routers & Wireless Networking",
    description:
      "Networking essentials for stable internet distribution, remote camera access, and smooth device connectivity.",
    useCases: ["Homes", "Workstations", "Camera remote access"],
    supportedBrands: ["Consistent", "EZVIZ", "IMOU"],
    inquiryLabel: "routers and wireless networking",
  },
  {
    slug: "poe-switches",
    name: "POE & Gigabit Switches",
    description:
      "Switching hardware for powering IP cameras, building efficient networks, and expanding secure installations.",
    useCases: ["IP CCTV", "Office networks", "Commercial premises"],
    supportedBrands: ["Consistent", "Hikvision"],
    inquiryLabel: "POE and gigabit switches",
  },
  {
    slug: "accessories-power",
    name: "Accessories, Power & Cables",
    description:
      "SMPS power supplies, CCTV accessories, monitors, cables, connectors, and installation essentials.",
    useCases: ["Maintenance", "New setups", "Bulk replacement needs"],
    supportedBrands: ["Consistent", "Hikvision", "ZKTeco"],
    inquiryLabel: "accessories, power supplies, and cables",
  },
];

export const services: ServiceItem[] = [
  {
    slug: "cctv-installation",
    name: "CCTV Installation",
    summary:
      "Professional camera placement, clean wiring, and system setup tailored to homes, shops, offices, and factories.",
    highlights: ["Site review", "Neat installation", "Mobile viewing setup"],
    icon: "camera",
    inquiryLabel: "CCTV installation",
  },
  {
    slug: "security-setup",
    name: "Security System Setup",
    summary:
      "Complete setup of surveillance, access control, and security devices based on your property and risk level.",
    highlights: ["Tailored recommendations", "Brand-aligned solutions", "Practical coverage planning"],
    icon: "shield",
    inquiryLabel: "security system setup",
  },
  {
    slug: "wholesale-retail",
    name: "Wholesale & Retail Supply",
    summary:
      "Supply of genuine security and networking products for direct customers, resellers, and project-based needs.",
    highlights: ["Retail support", "Bulk order assistance", "Brand availability guidance"],
    icon: "warehouse",
    inquiryLabel: "wholesale and retail supply",
  },
  {
    slug: "repair-maintenance",
    name: "Repair & Maintenance",
    summary:
      "Troubleshooting, maintenance, upgrades, and repair support to keep your systems dependable over time.",
    highlights: ["Fault diagnosis", "System servicing", "Upgrade recommendations"],
    icon: "tools",
    inquiryLabel: "repair and maintenance support",
  },
  {
    slug: "networking-support",
    name: "Networking Setup & Support",
    summary:
      "Router, switching, and network support to keep surveillance and internet-connected systems running smoothly.",
    highlights: ["Router setup", "POE planning", "Stable connectivity"],
    icon: "network",
    inquiryLabel: "networking setup and support",
  },
  {
    slug: "consultation",
    name: "Technical Consultation",
    summary:
      "Straightforward guidance on product selection, installation scope, and the right setup for your space and budget.",
    highlights: ["Product advice", "Project scoping", "Budget-focused planning"],
    icon: "support",
    inquiryLabel: "technical consultation",
  },
];

export const solutionPackages: SolutionPackage[] = [
  {
    title: "Home CCTV Package",
    fitFor: "For houses, apartments, and family homes",
    description:
      "A practical setup focused on entry points, perimeter visibility, and convenient mobile monitoring.",
    inquiryLabel: "home CCTV package",
  },
  {
    title: "Office Security Package",
    fitFor: "For workspaces, teams, and admin areas",
    description:
      "Coverage for work areas, reception, storage, and key business zones with organized recording and access support.",
    inquiryLabel: "office security package",
  },
  {
    title: "Shop Surveillance Package",
    fitFor: "For retail counters, showrooms, and store floors",
    description:
      "Compact surveillance plans that help monitor cash points, customer movement, and product display areas.",
    inquiryLabel: "shop surveillance package",
  },
];
