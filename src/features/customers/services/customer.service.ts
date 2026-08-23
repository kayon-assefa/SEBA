// src/features/Customers/services/customer.service.ts
//
// This is the SHARED customer service. It is the single source of truth
// for turning an order or an appointment into "customer data". Both the
// Orders module and the Appointments module should call
// `findOrCreateByIdentity()` below instead of writing to the `customers`
// table directly - that's what stops the same person showing up twice
// just because their name was typed slightly differently or another
// customer happens to share their name.
//
// MATCHING RULE (do not match by name - too many people share a name):
//   1. If a phone number is given, match on phone first (normalized).
//   2. Else if an email is given, match on email (normalized/lowercased).
//   3. If neither matches an existing customer, create a new one.
// This means: someone who orders twice, books twice, or does one of
// each, always lands on the SAME customer row, as long as the phone or
// email they used is consistent.

import { supabase } from "../../../lib/supabase";
import { getActiveBusinessId } from "../../../lib/business";
import type {
  Customer,
  CustomerFormInput,
  CustomerNote,
  DuplicateCandidate,
  TimelineEntry,
  VisitFrequencyLabel,
} from "../types/customer";

// ---------------------------------------------------------------------
// Normalization helpers - used for every match/dedupe comparison
// ---------------------------------------------------------------------

function normalizePhone(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const digits = phone.replace(/[^\d+]/g, "");
  return digits.length > 0 ? digits : null;
}

function normalizeEmail(email: string | null | undefined): string | null {
  if (!email) return null;
  const trimmed = email.trim().toLowerCase();
  return trimmed.length > 0 ? trimmed : null;
}

// ---------------------------------------------------------------------
// Basic CRUD
// ---------------------------------------------------------------------

export const customerService = {
  async getCustomers(): Promise<Customer[]> {
    const businessId = await getActiveBusinessId();

    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .eq("business_id", businessId)
      .order("pinned", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data ?? []) as Customer[];
  },

  async searchCustomers(query: string): Promise<Customer[]> {
    const businessId = await getActiveBusinessId();
    const q = query.trim();
    if (!q) return [];

    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .eq("business_id", businessId)
      .or(`name.ilike.%${q}%,phone.ilike.%${q}%,email.ilike.%${q}%`)
      .order("pinned", { ascending: false })
      .limit(20);

    if (error) throw error;
    return (data ?? []) as Customer[];
  },

  async getCustomerById(id: string): Promise<Customer | null> {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    return (data as Customer) ?? null;
  },

  async createCustomer(input: CustomerFormInput): Promise<Customer> {
    const businessId = await getActiveBusinessId();
    const phone = normalizePhone(input.phone);
    const email = normalizeEmail(input.email);

    const notes: CustomerNote[] = input.notes
      ? [
          {
            id: crypto.randomUUID(),
            text: input.notes,
            author: "You",
            created_at: new Date().toISOString(),
          },
        ]
      : [];

    const { data, error } = await supabase
      .from("customers")
      .insert({
        business_id: businessId,
        name: input.name.trim(),
        phone,
        email,
        tags: input.tags ?? [],
        notes,
        referral_source: input.referral_source || null,
        total_orders: 0,
        total_visits: 0,
        total_spent: 0,
        blacklisted: false,
        pinned: false,
      })
      .select("*")
      .single();

    if (error) throw error;
    return data as Customer;
  },

  async updateCustomer(
    id: string,
    input: Partial<CustomerFormInput>
  ): Promise<Customer> {
    const patch: Record<string, unknown> = {};
    if (input.name !== undefined) patch.name = input.name.trim();
    if (input.phone !== undefined) patch.phone = normalizePhone(input.phone);
    if (input.email !== undefined) patch.email = normalizeEmail(input.email);
    if (input.tags !== undefined) patch.tags = input.tags;
    if (input.referral_source !== undefined)
      patch.referral_source = input.referral_source || null;
    patch.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("customers")
      .update(patch)
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;
    return data as Customer;
  },

  async deleteCustomer(id: string): Promise<void> {
    const { error } = await supabase.from("customers").delete().eq("id", id);
    if (error) throw error;
  },

  // Soft-delete style restore used by the "Undo" toast after a delete.
  async restoreCustomer(customer: Customer): Promise<Customer> {
    const { id, ...rest } = customer;
    const { data, error } = await supabase
      .from("customers")
      .insert({ id, ...rest })
      .select("*")
      .single();

    if (error) throw error;
    return data as Customer;
  },

  async togglePinned(id: string, pinned: boolean): Promise<void> {
    const { error } = await supabase
      .from("customers")
      .update({ pinned })
      .eq("id", id);
    if (error) throw error;
  },

  async setBlacklist(
    id: string,
    blacklisted: boolean,
    reason: string | null
  ): Promise<void> {
    const { error } = await supabase
      .from("customers")
      .update({
        blacklisted,
        blacklist_reason: blacklisted ? reason : null,
      })
      .eq("id", id);
    if (error) throw error;
  },

  async addNote(id: string, text: string, author = "You"): Promise<Customer> {
    const existing = await customerService.getCustomerById(id);
    if (!existing) throw new Error("Customer not found");

    const note: CustomerNote = {
      id: crypto.randomUUID(),
      text,
      author,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("customers")
      .update({ notes: [note, ...(existing.notes ?? [])] })
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;
    return data as Customer;
  },

  async logContact(id: string): Promise<void> {
    const { error } = await supabase
      .from("customers")
      .update({ last_contacted: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
  },

  // -------------------------------------------------------------------
  // THE CORE LINKING FUNCTION
  // Call this from Orders and Appointments whenever a booking or an
  // order is created. It finds the existing customer by phone (then
  // email), updates their combined stats, or creates a new customer if
  // this is genuinely a new phone/email.
  // -------------------------------------------------------------------
  async findOrCreateByIdentity(params: {
    name: string;
    phone?: string | null;
    email?: string | null;
    source: "order" | "appointment";
    amount: number;
    visitDate: string; // ISO date
  }): Promise<Customer> {
    const businessId = await getActiveBusinessId();
    const phone = normalizePhone(params.phone);
    const email = normalizeEmail(params.email);

    let existing: Customer | null = null;

    if (phone) {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("business_id", businessId)
        .eq("phone", phone)
        .maybeSingle();
      if (error) throw error;
      existing = (data as Customer) ?? null;
    }

    if (!existing && email) {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("business_id", businessId)
        .eq("email", email)
        .maybeSingle();
      if (error) throw error;
      existing = (data as Customer) ?? null;
    }

    if (existing) {
      const patch: Record<string, unknown> = {
        name: params.name || existing.name,
        // fill in whichever contact detail was missing before, so a
        // customer who first booked with only a phone and later ordered
        // with an email gets both saved against the one record.
        phone: existing.phone ?? phone,
        email: existing.email ?? email,
        total_spent: Number(existing.total_spent ?? 0) + Number(params.amount || 0),
        last_visit: params.visitDate,
        updated_at: new Date().toISOString(),
      };
      if (params.source === "order") {
        patch.total_orders = (existing.total_orders ?? 0) + 1;
      } else {
        patch.total_visits = (existing.total_visits ?? 0) + 1;
      }

      const { data, error } = await supabase
        .from("customers")
        .update(patch)
        .eq("id", existing.id)
        .select("*")
        .single();

      if (error) throw error;
      return data as Customer;
    }

    const { data, error } = await supabase
      .from("customers")
      .insert({
        business_id: businessId,
        name: params.name,
        phone,
        email,
        tags: [],
        notes: [],
        total_orders: params.source === "order" ? 1 : 0,
        total_visits: params.source === "appointment" ? 1 : 0,
        total_spent: Number(params.amount || 0),
        last_visit: params.visitDate,
        blacklisted: false,
        pinned: false,
      })
      .select("*")
      .single();

    if (error) throw error;
    return data as Customer;
  },

  // -------------------------------------------------------------------
  // Duplicate detection - flags likely dupes for a human to review.
  // We never auto-merge on name similarity, only surface it.
  // -------------------------------------------------------------------
  async findDuplicateCandidates(): Promise<DuplicateCandidate[]> {
    const customers = await customerService.getCustomers();
    const candidates: DuplicateCandidate[] = [];

    for (let i = 0; i < customers.length; i++) {
      for (let j = i + 1; j < customers.length; j++) {
        const a = customers[i];
        const b = customers[j];

        const sameName =
          a.name.trim().toLowerCase() === b.name.trim().toLowerCase();
        const noContactOverlap =
          (a.phone ?? "__a") !== (b.phone ?? "__b") &&
          (a.email ?? "__a") !== (b.email ?? "__b");

        // Same phone or email should never happen after findOrCreateByIdentity,
        // but legacy/imported rows can still collide - surface those first.
        if (a.phone && b.phone && a.phone === b.phone) {
          candidates.push({
            id: `${a.id}-${b.id}`,
            customerA: a,
            customerB: b,
            reason: "same_phone",
          });
        } else if (a.email && b.email && a.email === b.email) {
          candidates.push({
            id: `${a.id}-${b.id}`,
            customerA: a,
            customerB: b,
            reason: "same_email",
          });
        } else if (sameName && noContactOverlap) {
          candidates.push({
            id: `${a.id}-${b.id}`,
            customerA: a,
            customerB: b,
            reason: "similar_name_no_contact_overlap",
          });
        }
      }
    }

    return candidates;
  },

  // Merge `duplicateId` into `primaryId`: combines stats, keeps primary's
  // contact info (fills gaps from the duplicate), merges tags/notes, and
  // re-points any orders/appointments that reference the old id.
  // NOTE: the two UPDATE statements against `orders` and `appointments`
  // only take effect once those tables' customer_id column exists and
  // those modules are updated to set it (see README).
  async mergeCustomers(primaryId: string, duplicateId: string): Promise<Customer> {
    const primary = await customerService.getCustomerById(primaryId);
    const duplicate = await customerService.getCustomerById(duplicateId);
    if (!primary || !duplicate) throw new Error("Customer not found");

    const merged = {
      phone: primary.phone ?? duplicate.phone,
      email: primary.email ?? duplicate.email,
      tags: Array.from(new Set([...(primary.tags ?? []), ...(duplicate.tags ?? [])])),
      notes: [...(primary.notes ?? []), ...(duplicate.notes ?? [])],
      total_orders: (primary.total_orders ?? 0) + (duplicate.total_orders ?? 0),
      total_visits: (primary.total_visits ?? 0) + (duplicate.total_visits ?? 0),
      total_spent: Number(primary.total_spent ?? 0) + Number(duplicate.total_spent ?? 0),
      last_visit:
        !primary.last_visit || (duplicate.last_visit && duplicate.last_visit > primary.last_visit)
          ? duplicate.last_visit
          : primary.last_visit,
      updated_at: new Date().toISOString(),
    };

    // Re-point historical records to the surviving customer, if those
    // tables have a customer_id column pointing at this one.
    await supabase.from("orders").update({ customer_id: primaryId }).eq("customer_id", duplicateId);
    await supabase.from("appointments").update({ customer_id: primaryId }).eq("customer_id", duplicateId);

    const { data, error } = await supabase
      .from("customers")
      .update(merged)
      .eq("id", primaryId)
      .select("*")
      .single();
    if (error) throw error;

    await customerService.deleteCustomer(duplicateId);
    return data as Customer;
  },

  // -------------------------------------------------------------------
  // Combined timeline: orders + appointments for one customer, matched
  // by customer_id (preferred) or phone as a fallback for older rows
  // that predate the customer_id link.
  // -------------------------------------------------------------------
  async getCustomerTimeline(customer: Customer): Promise<TimelineEntry[]> {
    const businessId = await getActiveBusinessId();
    const entries: TimelineEntry[] = [];

    let orderQuery = supabase
      .from("orders")
      .select("id, order_number, total, status, created_at, customer_id, customer_phone")
      .eq("business_id", businessId);
    orderQuery = customer.phone
      ? orderQuery.or(`customer_id.eq.${customer.id},customer_phone.eq.${customer.phone}`)
      : orderQuery.eq("customer_id", customer.id);

    const { data: orders, error: ordersError } = await orderQuery;
    if (ordersError) throw ordersError;

    for (const o of orders ?? []) {
      entries.push({
        id: `order-${o.id}`,
        type: "order",
        date: o.created_at,
        title: o.order_number ? `Order #${o.order_number}` : "Order",
        amount: o.total ?? null,
        status: o.status,
      });
    }

    let apptQuery = supabase
      .from("appointments")
      .select("id, service, services, date, price, status, customer_id, phone")
      .eq("business_id", businessId);
    apptQuery = customer.phone
      ? apptQuery.or(`customer_id.eq.${customer.id},phone.eq.${customer.phone}`)
      : apptQuery.eq("customer_id", customer.id);

    const { data: appts, error: apptsError } = await apptQuery;
    if (apptsError) throw apptsError;

    for (const a of appts ?? []) {
      entries.push({
        id: `appt-${a.id}`,
        type: "appointment",
        date: a.date,
        title: Array.isArray(a.services) && a.services.length ? a.services.join(", ") : a.service,
        amount: a.price ?? null,
        status: a.status,
      });
    }

    return entries.sort((a, b) => (a.date < b.date ? 1 : -1));
  },
};

// ---------------------------------------------------------------------
// Pure helpers used by the UI (no network calls)
// ---------------------------------------------------------------------

export function computeLifetimeValue(customer: Customer): number {
  return Number(customer.total_spent ?? 0);
}

export function computeVisitFrequency(customer: Customer): VisitFrequencyLabel {
  const totalTouches = (customer.total_orders ?? 0) + (customer.total_visits ?? 0);
  if (totalTouches <= 1) return "New";

  if (customer.last_visit) {
    const daysSince = Math.floor(
      (Date.now() - new Date(customer.last_visit).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSince > 60) return "Inactive";
  }

  if (totalTouches >= 8) return "Frequent";
  if (totalTouches >= 4) return "Regular";
  return "Occasional";
}

// Suggests tags based on simple spend/visit rules - surfaced in the UI
// as a one-click "accept" chip, never applied automatically.
export function suggestTags(customer: Customer): string[] {
  const suggestions: string[] = [];
  if (computeLifetimeValue(customer) >= 5000 && !customer.tags.includes("VIP")) {
    suggestions.push("VIP");
  }
  if (computeVisitFrequency(customer) === "Inactive" && !customer.tags.includes("At-risk")) {
    suggestions.push("At-risk");
  }
  if (computeVisitFrequency(customer) === "New" && !customer.tags.includes("New")) {
    suggestions.push("New");
  }
  return suggestions;
}
