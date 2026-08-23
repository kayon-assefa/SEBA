// File: src/features/onboarding/types/business.ts
export interface BusinessFormData {
  business_name: string;
  username: string;

  category: string;
  custom_category?: string;

  phone: string;

  city: string;

  address: string;

  description: string;

  timezone: string;

  logo?: string;

  working_days: string[];

  opening_time: string;

  closing_time: string;
}