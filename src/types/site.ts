export type IconName =
  | "camera"
  | "shield"
  | "network"
  | "tools"
  | "warehouse"
  | "support"
  | "phone"
  | "message"
  | "mail"
  | "map"
  | "clock"
  | "quote";

export interface NavItem {
  href: string;
  label: string;
}

export interface ContactMethod {
  label: string;
  value: string;
  href: string;
  note: string;
  icon: IconName;
}

export interface BrandItem {
  name: string;
  specialty: string;
  logoSrc: string;
  logoAlt: string;
}

export interface CatalogCategory {
  key: string;
  name: string;
  description: string;
  inquiryLabel: string;
  sourceSummary: string;
}

export interface CatalogProduct {
  id: string;
  name: string;
  brand: string;
  model: string | null;
  categoryKey: string;
  categoryName: string;
  price: number;
  originalPrice: number | null;
  currency: string;
  image: string;
  sourceUrl: string;
  sourceCategory: string;
}

export interface ProductCategory {
  slug: string;
  name: string;
  description: string;
  useCases: string[];
  supportedBrands: string[];
  inquiryLabel: string;
}

export interface ServiceItem {
  slug: string;
  name: string;
  summary: string;
  highlights: string[];
  icon: IconName;
  inquiryLabel: string;
}

export interface SolutionPackage {
  title: string;
  fitFor: string;
  description: string;
  inquiryLabel: string;
}

export interface BusinessStat {
  value: string;
  label: string;
}

export interface InquiryContext {
  type: "general" | "product" | "service" | "quote";
  subject?: string;
  details?: string[];
}

export interface SiteConfig {
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  siteUrl: string;
  owner: string;
  address: {
    street: string;
    locality: string;
    district: string;
    province: string;
    country: string;
  };
  contact: {
    primaryPhone: string;
    whatsapp: string;
    productWhatsapp: string;
    email: string;
    mapsUrl: string;
  };
  hours: {
    daysLabel: string;
    closedOn: string;
    hoursLabel: string;
    opens: string;
    closes: string;
  };
  serviceArea: string;
  warranty: string;
  paymentMethods: string[];
  targetCustomers: string[];
  keywords: string[];
}
