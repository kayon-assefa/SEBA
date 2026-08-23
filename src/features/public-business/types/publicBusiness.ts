// File:
// src/features/public-business/types/publicBusiness.ts

export type PublicBusinessTemplate =
  | "modern"
  | "editorial"
  | "bold"
  | "minimal";

export type PublicBusinessType =
  | "appointment"
  | "shop";

export interface PublicLocation {
  address: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
}

export interface WorkingHours {
  id?: string;
  dayOfWeek: number;
  isOpen: boolean;
  openTime: string | null;
  closeTime: string | null;
}

export interface PublicService {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  durationMinutes: number | null;
  available: boolean;
  featured: boolean;
}

export interface PublicProduct {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  priceType: string;
  category: string | null;
  stock: number | null;
  imageUrl: string | null;
  images: string[];
  active: boolean;
  allowBackorder: boolean;
  inStock: boolean;
}

export interface PublicAnnouncement {
  id: string;
  message: string;
  enabled: boolean;
}

export interface PublicSocialLinks {
  facebook: string | null;
  instagram: string | null;
  telegram: string | null;
  tiktok: string | null;
  website: string | null;
}

export interface PublicTheme {
  primaryColor: string;
  fontFamily: string | null;
  borderRadius: string | null;
  coverImage: string | null;
  gallery: string[];
  social: PublicSocialLinks;
}

export interface PublicBusiness {
  id: string;

  username: string;

  name: string;

  category: string | null;

  description: string | null;

  logoUrl: string | null;

  verified: boolean;

  published: boolean;

  temporarilyClosed: boolean;

  temporaryCloseReason: string | null;

  businessType: PublicBusinessType;

  template: PublicBusinessTemplate;

  phone: string | null;

  email: string | null;

  whatsapp: string | null;

  location: PublicLocation;

  workingHours: WorkingHours[];

  workingDays: string | null;

  openingTime: string | null;

  closingTime: string | null;

  timezone: string | null;

  appointmentsPaused: boolean;

  ordersPaused: boolean;

  announcement: PublicAnnouncement | null;

  services: PublicService[];

  products: PublicProduct[];

  appointmentFields: import("./appointment").PublicAppointmentField[];
  staff: import("./appointment").PublicStaffMember[];

  theme: PublicTheme;

  primaryColor: string;

  secondaryColor: string | null;

  createdAt: string | null;

  updatedAt: string | null;
}

export type PublicBusinessStatus =
  | "unpublished"
  | "temporarily_closed"
  | "open";
