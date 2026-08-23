// File: src/features/onboarding/validation/business.schema.ts
import { z } from "zod";

export const businessSchema = z.object({
  business_name: z.string().min(3, "Business name is required"),

  username: z.string().min(3, "Username is required"),

  category: z.string().min(2),

  custom_category: z.string().optional(),

  phone: z.string().min(9),

  city: z.string().min(2),

  address: z.string().min(5),

  description: z.string().max(300),

  timezone: z.string(),

  logo: z.string().optional(),

  working_days: z.array(z.string()),

  opening_time: z.string(),

  closing_time: z.string(),
});

export type BusinessSchema = z.infer<typeof businessSchema>;