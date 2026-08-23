import { supabase } from "../../../lib/supabase";import { getBusinessId, getSettingRow } from "./settings.service";
export const pageSettingsService={
 async getTheme(){const business_id=await getBusinessId();return getSettingRow("business_themes",business_id);},
 async saveTheme(values:Record<string,unknown>){const business_id=await getBusinessId();const {data,error}=await supabase.from("business_themes").upsert({business_id,...values},{onConflict:"business_id"}).select("*").single();if(error)throw error;return data;},
 async updatePublicTemplate(templateId:number){const user=await (await import("./settings.service")).getCurrentUser();const {error}=await supabase.from("businesses").update({website_template_id:templateId} as never).eq("owner_id",user.id);if(error)throw error;}
};
