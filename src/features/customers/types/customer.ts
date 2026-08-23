// src/features/Customers/types/customer.ts

export type CustomerTag = string; // free-form, e.g. "VIP", "New", "At-risk"

export interface CustomerNote {
  id: string;
  text: string;
  author: string;
  created_at: string;
}

export interface Customer {
  id: string;
  business_id: string;

  name: string;
  phone: string | null;
  email: string | null;

  tags: CustomerTag[];
  notes: CustomerNote[];

  // Combined stats - fed by BOTH the Orders module and the Appointments
  // module, matched to this single record by phone/email. See
  // services/customer.service.ts -> findOrCreateByIdentity().
  total_orders: number;
  total_visits: number; // appointments count
  total_spent: number; // orders total + appointments price, combined

  last_visit: string | null; // most recent order OR appointment date
  last_contacted: string | null; // manually logged, separate from visits

  referral_source: string | null;

  blacklisted: boolean;
  blacklist_reason: string | null;

  pinned: boolean;

  created_at: string;
  updated_at: string | null;
}

export interface CustomerFormInput {
  name: string;
  phone: string;
  email: string;
  tags: string[];
  referral_source: string;
  notes?: string; // optional first note on create
}

// A likely-duplicate pair surfaced for manual review. We only ever
// auto-link by phone/email (see service) - name-only similarity is
// flagged here for a human to decide, never merged automatically.
export interface DuplicateCandidate {
  id: string; // candidate group id (just customerA.id-customerB.id)
  customerA: Customer;
  customerB: Customer;
  reason: "same_phone" | "same_email" | "similar_name_no_contact_overlap";
}

export interface TimelineEntry {
  id: string;
  type: "order" | "appointment";
  date: string; // ISO date used for sorting
  title: string; // e.g. "Order #1042" or "Haircut with Sara"
  amount: number | null;
  status: string;
}

export type VisitFrequencyLabel =
  | "New"
  | "Frequent"
  | "Regular"
  | "Occasional"
  | "Inactive";

export interface CustomerFilters {
  search: string;
  tag: string | null; // "All" when null
  segment: "all" | "pinned" | "blacklisted" | "vip" | "inactive";
}
