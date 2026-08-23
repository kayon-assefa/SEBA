import { supabase } from "../../../lib/supabase";
import { getBusinessId, getSettingRow } from "./settings.service";

export type BookingSettings = {
  business_id: string; enabled: boolean; allow_online_booking: boolean; allow_same_day_booking: boolean;
  minimum_booking_notice_minutes: number; maximum_advance_booking_days: number; allow_cancellation: boolean;
  cancellation_deadline_minutes: number; allow_rescheduling: boolean; default_duration_minutes: number;
  buffer_minutes: number; maximum_daily_appointments: number | null; auto_confirm: boolean;
  confirmation_message: string | null; cancellation_message: string | null; reminder_message: string | null;
  completion_message: string | null; require_customer_name: boolean; require_customer_phone: boolean;
  require_customer_email: boolean; require_customer_notes: boolean; created_at?: string; updated_at?: string;
};

const DEFAULTS = { enabled:true, allow_online_booking:true, allow_same_day_booking:true, minimum_booking_notice_minutes:0,
  maximum_advance_booking_days:30, allow_cancellation:true, cancellation_deadline_minutes:60, allow_rescheduling:true,
  default_duration_minutes:60, buffer_minutes:0, maximum_daily_appointments:null, auto_confirm:false,
  confirmation_message:null, cancellation_message:null, reminder_message:null, completion_message:null,
  require_customer_name:true, require_customer_phone:true, require_customer_email:false, require_customer_notes:false };

export const bookingSettingsService = {
  async get(): Promise<BookingSettings> {
    const business_id=await getBusinessId();
    const data=await getSettingRow("booking_settings",business_id);
    if(data) return data as BookingSettings;
    return this.save(DEFAULTS as Partial<BookingSettings>);
  },
  async save(values: Partial<BookingSettings>): Promise<BookingSettings> {
    const business_id=await getBusinessId();
    const {data,error}=await supabase.from("booking_settings").upsert({business_id,...values,updated_at:new Date().toISOString()},{onConflict:"business_id"}).select("*").single();
    if(error) throw new Error(`Failed to save booking settings: ${error.message}`);
    return data as BookingSettings;
  }
};
export const getBookingSettings=bookingSettingsService.get;
export const updateBookingSettings=bookingSettingsService.save;
