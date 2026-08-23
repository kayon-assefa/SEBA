import { supabase } from "../../../lib/supabase";
import { getBusinessId, getSettingRow } from "./settings.service";
import type { BusinessSettingsUpdate } from "../types/business-settings";

export type BusinessSettings = {
  business_id: string;
  business_phone: string | null;
  business_email: string | null;
  city: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  is_published: boolean;
  is_temporarily_closed: boolean;
  temporary_close_reason: string | null;
  temporary_close_until: string | null;
  created_at?: string;
  updated_at?: string;
};

const DEFAULTS = {
  business_phone: null,
  business_email: null,
  city: null,
  address: null,
  latitude: null,
  longitude: null,
  is_published: true, // businesses are published by default; this is not a user-facing toggle anymore
  is_temporarily_closed: false,
  temporary_close_reason: null,
  temporary_close_until: null,
};

export const businessSettingsService = {
  async get(): Promise<BusinessSettings> {
    const business_id = await getBusinessId();
    const [settingsRow, business] = await Promise.all([
      getSettingRow("business_settings", business_id),
      supabase.from("businesses").select("*").eq("id", business_id).limit(1).maybeSingle(),
    ]);

    const biz = business.data as Record<string, unknown> | null;

    if (settingsRow) {
      const row = settingsRow as BusinessSettings;
      // Bug fix: business_settings started as a blank row (all null) even when the
      // business itself already had phone/email/location saved on the `businesses`
      // table. Fall back to that data instead of showing blank fields.
      return {
        ...row,
        business_phone: row.business_phone ?? (biz?.phone as string | null) ?? (biz?.business_phone as string | null) ?? null,
        business_email: row.business_email ?? (biz?.email as string | null) ?? (biz?.business_email as string | null) ?? null,
        city: row.city ?? (biz?.city as string | null) ?? null,
        address: row.address ?? (biz?.address as string | null) ?? null,
        latitude: row.latitude ?? (biz?.latitude as number | null) ?? null,
        longitude: row.longitude ?? (biz?.longitude as number | null) ?? null,
        is_published: true,
      };
    }

    return this.save({
      ...DEFAULTS,
      business_phone: (biz?.phone as string | null) ?? (biz?.business_phone as string | null) ?? null,
      business_email: (biz?.email as string | null) ?? (biz?.business_email as string | null) ?? null,
      city: (biz?.city as string | null) ?? null,
      address: (biz?.address as string | null) ?? null,
      latitude: (biz?.latitude as number | null) ?? null,
      longitude: (biz?.longitude as number | null) ?? null,
    });
  },

  async save(values: BusinessSettingsUpdate): Promise<BusinessSettings> {
    const business_id = await getBusinessId();
    // is_published is intentionally not accepted from the UI — a business is always
    // published once created. Settings only controls "temporarily closed".
    const { is_published, ...rest } = values as Record<string, unknown>;
    const { data, error } = await supabase
      .from("business_settings")
      .upsert(
        { business_id, ...rest, is_published: true, updated_at: new Date().toISOString() },
        { onConflict: "business_id" }
      )
      .select("*")
      .single();
    if (error) throw new Error(`Failed to save business settings: ${error.message}`);
    return data as BusinessSettings;
  },

  setTemporarilyClosed(closed: boolean, reason: string | null = null, until: string | null = null) {
    return this.save({
      is_temporarily_closed: closed,
      temporary_close_reason: closed ? reason : null,
      temporary_close_until: closed ? until : null,
    });
  },
};

export const getBusinessSettings = businessSettingsService.get;
export const updateBusinessSettings = businessSettingsService.save;
