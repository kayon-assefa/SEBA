// src/features/Appointments/types/customer.ts

export interface Customer {
  id: string;
  business_id: string;

  name: string;
  phone: string | null;
  email: string | null;

  notes: string | null;
  tags: string[];

  total_visits: number;
  total_spent: number;

  created_at: string | null;
  last_visit: string | null;
}
