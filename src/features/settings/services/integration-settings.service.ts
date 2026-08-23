import { supabase } from "../../../lib/supabase";
import { getBusinessId } from "./settings.service";

export type BusinessIntegration = {
  id: string;
  business_id: string;
  provider: string;
  status: "connected" | "disconnected" | "error";
  external_account_id: string | null;
  connected_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export const integrationSettingsService = {
  async list() {
    const business_id = await getBusinessId();
    const { data, error } = await supabase
      .from("business_integrations")
      .select("*")
      .eq("business_id", business_id)
      .order("provider");

    if (error) throw new Error(`Failed to load integrations: ${error.message}`);
    return (data ?? []) as BusinessIntegration[];
  },

  async connect(provider: string, externalAccountId: string | null = null, metadata: Record<string, unknown> = {}) {
    const business_id = await getBusinessId();
    const now = new Date().toISOString();

    const existing = await supabase
      .from("business_integrations")
      .select("id")
      .eq("business_id", business_id)
      .eq("provider", provider)
      .limit(1);

    if (existing.error) {
      throw new Error(`Failed to check integration: ${existing.error.message}`);
    }

    const payload = {
      business_id,
      provider,
      status: "connected",
      external_account_id: externalAccountId,
      connected_at: now,
      metadata,
      updated_at: now,
    };

    if (existing.data?.[0]?.id) {
      const { data, error } = await supabase
        .from("business_integrations")
        .update(payload)
        .eq("id", existing.data[0].id)
        .eq("business_id", business_id)
        .select("*")
        .single();

      if (error) throw new Error(`Failed to connect integration: ${error.message}`);
      return data as BusinessIntegration;
    }

    const { data, error } = await supabase
      .from("business_integrations")
      .insert({ ...payload, created_at: now })
      .select("*")
      .single();

    if (error) throw new Error(`Failed to connect integration: ${error.message}`);
    return data as BusinessIntegration;
  },

  async disconnect(provider: string) {
    const business_id = await getBusinessId();
    const { data, error } = await supabase
      .from("business_integrations")
      .update({
        status: "disconnected",
        external_account_id: null,
        connected_at: null,
        metadata: {},
        updated_at: new Date().toISOString(),
      })
      .eq("business_id", business_id)
      .eq("provider", provider)
      .select("*")
      .limit(1);

    if (error) throw new Error(`Failed to disconnect integration: ${error.message}`);
    if (!data?.[0]) throw new Error(`Integration "${provider}" is not connected.`);
    return data[0] as BusinessIntegration;
  },
};

export const getIntegrations = integrationSettingsService.list;
export const connectIntegration = integrationSettingsService.connect;
export const disconnectIntegration = integrationSettingsService.disconnect;
