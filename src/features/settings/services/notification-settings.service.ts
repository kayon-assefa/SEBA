import { supabase } from "../../../lib/supabase";import { getBusinessId, getSettingRow } from "./settings.service";
export const notificationSettingsService={
 async get(){const business_id=await getBusinessId();return getSettingRow("notification_settings",business_id);},
 async save(values:Record<string,unknown>){const business_id=await getBusinessId();const {data,error}=await supabase.from("notification_settings").upsert({business_id,...values,updated_at:new Date().toISOString()},{onConflict:"business_id"}).select("*").single();if(error)throw error;return data;}
};
