// src/features/Appointments/services/customer.service.ts
//
// Talks to the same Supabase `customers` table the Customers page uses.
// See /sql/migration.sql to create it if it does not exist yet.

import { supabase } from "../../../lib/supabase";
import { getActiveBusinessId } from "../../../lib/business";

import type { Customer } from "../types/customer";

export const customerService = {
  async getCustomers(): Promise<Customer[]> {
    const businessId = await getActiveBusinessId();

    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .eq("business_id", businessId)
      .order("name", { ascending: true });

    if (error) throw error;
    return (data ?? []) as Customer[];
  },

  async searchCustomers(query: string): Promise<Customer[]> {
    const businessId = await getActiveBusinessId();
    if (!query.trim()) return [];

    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .eq("business_id", businessId)
      .or(`name.ilike.%${query.trim()}%,phone.ilike.%${query.trim()}%`)
      .limit(8);

    if (error) throw error;
    return (data ?? []) as Customer[];
  },

  /**
   * Called whenever an appointment is booked. Finds the customer by phone
   * (the most reliable dedupe key we have) and either bumps their stats or
   * creates a brand new customer record - this is how newly booked
   * appointments show up on the Customers page automatically.
   */
  async findOrCreateFromBooking(params: {
    name: string;
    phone: string | null;
    price: number;
    visitDate: string;
  }): Promise<Customer | null> {
    const businessId = await getActiveBusinessId();
    const phone = params.phone?.trim() || null;

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

    if (existing) {
      const { data, error } = await supabase
        .from("customers")
        .update({
          name: params.name || existing.name,
          total_visits: (existing.total_visits ?? 0) + 1,
          total_spent: Number(existing.total_spent ?? 0) + Number(params.price || 0),
          last_visit: params.visitDate,
        })
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
        email: null,
        notes: null,
        tags: [],
        total_visits: 1,
        total_spent: Number(params.price || 0),
        last_visit: params.visitDate,
      })
      .select("*")
      .single();

    if (error) throw error;
    return data as Customer;
  },
};
