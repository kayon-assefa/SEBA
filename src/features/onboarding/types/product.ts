// File: src/features/onboarding/types/product.ts
export type PriceType = "fixed" | "negotiable";

export interface ProductData {
  name: string;
  description: string;
  price: number;
  price_type: PriceType;
  stock: number;
  allow_backorder: boolean;
  category: string;
  images: string[];
  active: boolean;
}