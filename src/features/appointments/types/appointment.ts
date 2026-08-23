// src/features/Appointments/types/appointment.ts

export type AppointmentStatus =
  | "Pending"
  | "Confirmed"
  | "Completed"
  | "Cancelled"
  | "No-show"
  | "Waitlisted";

export type PaymentStatus = "Unpaid" | "Deposit" | "Paid";

export type RecurrenceFrequency = "none" | "weekly" | "biweekly" | "monthly";

export interface RecurrenceInput {
  frequency: RecurrenceFrequency;
  occurrences: number; // total appointments to create, including the first
}

export interface Appointment {
  id: string;
  business_id: string;

  customer: string;
  customer_id: string | null;
  phone: string | null;

  // Legacy single-value columns, kept in sync with the arrays below so any
  // older UI/reports that still read `service` / `staff` keep working.
  service: string;
  staff: string | null;

  services: string[];
  staff_members: string[];

  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  duration: number; // minutes
  end_time: string; // HH:mm, computed from time + duration

  status: AppointmentStatus;

  payment_status: PaymentStatus;
  deposit_amount: number;
  discount_code: string | null; // reserved column - feature is "coming soon" in the UI

  notes: string | null;
  price: number;

  recurrence_frequency: RecurrenceFrequency | null;
  recurrence_occurrences: number | null;
  recurrence_group_id: string | null;

  reminder_sms_sent: boolean;
  reminder_email_sent: boolean;
  reminder_whatsapp_sent: boolean;
  staff_reminder_sent: boolean;

  created_at: string | null;
  updated_at: string | null;
}

export interface CreateAppointment {
  customer: string;
  phone: string;
  services: string[];
  staffMembers: string[];
  date: string;
  time: string;
  duration: number;
  status?: AppointmentStatus;
  paymentStatus?: PaymentStatus;
  depositAmount?: number;
  notes: string;
  price: number;
  recurrence?: RecurrenceInput | null;
  /** set true to book anyway even though a conflict was detected (skips the guard) */
  forceBook?: boolean;
}

export interface UpdateAppointment {
  customer?: string;
  phone?: string;
  services?: string[];
  staffMembers?: string[];
  date?: string;
  time?: string;
  duration?: number;
  status?: AppointmentStatus;
  paymentStatus?: PaymentStatus;
  depositAmount?: number;
  notes?: string;
  price?: number;
}

export class BookingConflictError extends Error {
  conflicts: Appointment[];
  suggestions: string[];

  constructor(conflicts: Appointment[], suggestions: string[]) {
    super("This time slot is already booked for the selected staff.");
    this.name = "BookingConflictError";
    this.conflicts = conflicts;
    this.suggestions = suggestions;
  }
}
