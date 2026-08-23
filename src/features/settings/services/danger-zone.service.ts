import { supabase } from "../../../lib/supabase";import { getBusinessId, getSettingRow } from "./settings.service";
export const dangerZoneService={
 async getState(){const business_id=await getBusinessId();return getSettingRow("business_state",business_id);},
 async pauseBusiness(){const business_id=await getBusinessId();const {data,error}=await supabase.from("business_state").upsert({business_id,appointments_paused:true,orders_paused:true,updated_at:new Date().toISOString()},{onConflict:"business_id"}).select("*").single();if(error)throw error;return data;},
 async resumeBusiness(){const business_id=await getBusinessId();const {data,error}=await supabase.from("business_state").upsert({business_id,appointments_paused:false,orders_paused:false,updated_at:new Date().toISOString()},{onConflict:"business_id"}).select("*").single();if(error)throw error;return data;},
 async unpublishBusiness(){const business_id=await getBusinessId();const [{error:e1},{error:e2}]=await Promise.all([supabase.from("business_settings").update({is_published:false,updated_at:new Date().toISOString()}).eq("business_id",business_id),supabase.from("business_state").upsert({business_id,page_unpublished:true,updated_at:new Date().toISOString()},{onConflict:"business_id"})]);if(e1)throw e1;if(e2)throw e2;},
 async deleteBusiness(){const business_id=await getBusinessId();const {error}=await supabase.from("businesses").delete().eq("id",business_id);if(error)throw error;await supabase.auth.signOut();}
};
