// src/features/Appointments/services/appointment.service.ts

import { supabase } from "../../../lib/supabase";
import { getActiveBusinessId } from "../../../lib/business";

import type {
  Appointment,
  AppointmentStatus,
  CreateAppointment,
  UpdateAppointment,
} from "../types/appointment";
import { BookingConflictError } from "../types/appointment";

import { customerService } from "./customer.service";
import { notificationService } from "./notification.service";
import {
  computeEndTime,
  findConflicts,
  suggestAvailableSlots,
  findOverdueForNoShow,
  buildRecurrenceDates,
} from "../lib/availability";

async function getBusinessId(): Promise<string> {
  return getActiveBusinessId();
}

function toRow(input: CreateAppointment | UpdateAppointment, businessId?: string) {
  const row: Record<string, unknown> = {};

  if ("customer" in input && input.customer !== undefined) row.customer = input.customer.trim();
  if ("phone" in input && input.phone !== undefined) row.phone = input.phone.trim() || null;

  if (input.services !== undefined) {
    row.services = input.services;
    row.service = input.services[0] ?? "";
  }
  if (input.staffMembers !== undefined) {
    row.staff_members = input.staffMembers;
    row.staff = input.staffMembers[0] ?? null;
  }

  if (input.date !== undefined) row.date = input.date;
  if (input.time !== undefined) row.time = input.time;
  if (input.duration !== undefined) row.duration = input.duration;
  if (input.date !== undefined || input.time !== undefined || input.duration !== undefined) {
    if (input.time !== undefined && input.duration !== undefined) {
      row.end_time = computeEndTime(input.time, input.duration);
    }
  }

  if (input.status !== undefined) row.status = input.status;
  if (input.paymentStatus !== undefined) row.payment_status = input.paymentStatus;
  if (input.depositAmount !== undefined) row.deposit_amount = Number(input.depositAmount) || 0;
  if (input.notes !== undefined) row.notes = input.notes.trim() || null;
  if (input.price !== undefined) row.price = Number(input.price) || 0;

  if (businessId) row.business_id = businessId;

  return row;
}

export const appointmentService = {
  async getAppointments(): Promise<Appointment[]> {
    const businessId = await getBusinessId();

    const { data, error } = await supabase
      .from("appointments")
      .select("*")
      .eq("business_id", businessId)
      .order("date", { ascending: true })
      .order("time", { ascending: true });

    if (error) throw error;
    return (data ?? []) as Appointment[];
  },

  /** Re-checks the given slot against the freshest data straight from the DB
   *  (belt-and-braces on top of the in-memory check the form already did,
   *  so two people booking at the same second can't both win). */
  async checkConflict(params: {
    date: string;
    time: string;
    duration: number;
    staffMembers: string[];
    excludeId?: string | null;
  }): Promise<Appointment[]> {
    const businessId = await getBusinessId();

    const { data, error } = await supabase
      .from("appointments")
      .select("*")
      .eq("business_id", businessId)
      .eq("date", params.date)
      .neq("status", "Cancelled");

    if (error) throw error;

    return findConflicts({
      date: params.date,
      time: params.time,
      duration: params.duration,
      staffMembers: params.staffMembers,
      appointments: (data ?? []) as Appointment[],
      excludeId: params.excludeId ?? null,
    });
  },

  async getAvailableSlots(params: {
    date: string;
    duration: number;
    staffMembers: string[];
    excludeId?: string | null;
  }): Promise<string[]> {
    const businessId = await getBusinessId();

    const { data, error } = await supabase
      .from("appointments")
      .select("*")
      .eq("business_id", businessId)
      .eq("date", params.date)
      .neq("status", "Cancelled");

    if (error) throw error;

    return suggestAvailableSlots({
      date: params.date,
      duration: params.duration,
      staffMembers: params.staffMembers,
      appointments: (data ?? []) as Appointment[],
      excludeId: params.excludeId ?? null,
    });
  },

  /**
   * Creates one appointment, or a whole recurring series when
   * `input.recurrence` is set. Always re-checks for conflicts against live
   * data first (unless `forceBook` is set, e.g. the user chose "book anyway"
   * after seeing the conflict warning) and always upserts the customer
   * record so the booking shows up on the Customers page.
   */
  async createAppointment(input: CreateAppointment): Promise<Appointment[]> {
    const businessId = await getBusinessId();

    const dates = input.recurrence && input.recurrence.frequency !== "none"
      ? buildRecurrenceDates(input.date, input.recurrence.frequency, input.recurrence.occurrences)
      : [input.date];

    const created: Appointment[] = [];
    const recurrenceGroupId = dates.length > 1 ? crypto.randomUUID() : null;

    for (const date of dates) {
      if (!input.forceBook) {
        const conflicts = await this.checkConflict({
          date,
          time: input.time,
          duration: input.duration,
          staffMembers: input.staffMembers,
        });

        if (conflicts.length > 0) {
          const suggestions = await this.getAvailableSlots({
            date,
            duration: input.duration,
            staffMembers: input.staffMembers,
          });
          throw new BookingConflictError(conflicts, suggestions);
        }
      }

      const row = {
        ...toRow(input, businessId),
        end_time: computeEndTime(input.time, input.duration),
        date,
        status: input.status ?? "Pending",
        payment_status: input.paymentStatus ?? "Unpaid",
        deposit_amount: Number(input.depositAmount) || 0,
        discount_code: null,
        recurrence_frequency: input.recurrence?.frequency ?? null,
        recurrence_occurrences: input.recurrence?.occurrences ?? null,
        recurrence_group_id: recurrenceGroupId,
        reminder_sms_sent: false,
        reminder_email_sent: false,
        reminder_whatsapp_sent: false,
        staff_reminder_sent: false,
      };

      const { data, error } = await supabase
        .from("appointments")
        .insert(row)
        .select("*")
        .single();

      if (error) throw error;
      created.push(data as Appointment);
    }

    // Customer record + simulated confirmation for the first (primary) booking.
    try {
      const customer = await customerService.findOrCreateFromBooking({
        name: input.customer.trim(),
        phone: input.phone.trim() || null,
        price: input.price,
        visitDate: input.date,
      });

      if (customer) {
        await supabase
          .from("appointments")
          .update({ customer_id: customer.id })
          .in(
            "id",
            created.map((a) => a.id)
          );
        created.forEach((a) => (a.customer_id = customer.id));
      }
    } catch (err) {
      console.error("Customer sync error:", err);
    }

    notificationService.sendBookingConfirmation(created[0]).catch(() => {});

    return created;
  },

  async updateAppointment(id: string, input: UpdateAppointment): Promise<Appointment> {
    const businessId = await getBusinessId();

    if (input.date || input.time || input.duration || input.staffMembers) {
      const { data: current } = await supabase.from("appointments").select("*").eq("id", id).single();
      const merged = { ...(current as Appointment), ...input };

      const conflicts = await this.checkConflict({
        date: input.date ?? merged.date,
        time: input.time ?? merged.time,
        duration: input.duration ?? merged.duration,
        staffMembers: input.staffMembers ?? merged.staff_members,
        excludeId: id,
      });

      if (conflicts.length > 0) {
        const suggestions = await this.getAvailableSlots({
          date: input.date ?? merged.date,
          duration: input.duration ?? merged.duration,
          staffMembers: input.staffMembers ?? merged.staff_members,
          excludeId: id,
        });
        throw new BookingConflictError(conflicts, suggestions);
      }
    }

    const payload = { ...toRow(input), updated_at: new Date().toISOString() };

    const { data, error } = await supabase
      .from("appointments")
      .update(payload)
      .eq("id", id)
      .eq("business_id", businessId)
      .select("*")
      .single();

    if (error) throw error;
    return data as Appointment;
  },

  async updateStatus(id: string, status: AppointmentStatus): Promise<Appointment> {
    const businessId = await getBusinessId();

    const { data, error } = await supabase
      .from("appointments")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("business_id", businessId)
      .select("*")
      .single();

    if (error) throw error;
    return data as Appointment;
  },

  async markPayment(id: string, paymentStatus: Appointment["payment_status"], depositAmount = 0): Promise<Appointment> {
    const businessId = await getBusinessId();

    const { data, error } = await supabase
      .from("appointments")
      .update({
        payment_status: paymentStatus,
        deposit_amount: depositAmount,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("business_id", businessId)
      .select("*")
      .single();

    if (error) throw error;
    return data as Appointment;
  },

  async deleteAppointment(id: string): Promise<void> {
    const businessId = await getBusinessId();

    const { error } = await supabase
      .from("appointments")
      .delete()
      .eq("id", id)
      .eq("business_id", businessId);

    if (error) throw error;
  },

  /** Scans the given (already loaded) list for Pending/Confirmed appointments
   *  whose end time has passed, and flips them to No-show in the DB. Call
   *  this once when the page loads. Returns the ids that were flagged. */
  async autoFlagNoShows(appointments: Appointment[]): Promise<string[]> {
    const overdue = findOverdueForNoShow(appointments);
    if (!overdue.length) return [];

    const businessId = await getBusinessId();
    const ids = overdue.map((a) => a.id);

    const { error } = await supabase
      .from("appointments")
      .update({ status: "No-show", updated_at: new Date().toISOString() })
      .in("id", ids)
      .eq("business_id", businessId);

    if (error) {
      console.error("Auto no-show update error:", error);
      return [];
    }

    return ids;
  },
};
