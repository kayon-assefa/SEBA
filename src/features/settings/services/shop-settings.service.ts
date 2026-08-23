import { supabase } from "../../../lib/supabase";
import { getBusinessId, getSettingRow } from "./settings.service";
import type { ShopSettingsUpdate } from "../types/shop-settings";
export type BusinessState={business_id:string;appointments_paused:boolean;orders_paused:boolean;page_unpublished:boolean;updated_at:string};
export const shopSettingsService={
 async getBusinessState():Promise<BusinessState>{const business_id=await getBusinessId();const data=await getSettingRow("business_state",business_id);if(data)return data as BusinessState;return this.saveState({appointments_paused:false,orders_paused:false,page_unpublished:false});},
 async saveState(values:Partial<Omit<BusinessState,"business_id"|"updated_at">>){const business_id=await getBusinessId();const {data,error}=await supabase.from("business_state").upsert({business_id,...values,updated_at:new Date().toISOString()},{onConflict:"business_id"}).select("*").single();if(error)throw error;return data as BusinessState;},
 async setOrdersPaused(v:boolean){return this.saveState({orders_paused:v});},async setAppointmentsPaused(v:boolean){return this.saveState({appointments_paused:v});},async setPageUnpublished(v:boolean){return this.saveState({page_unpublished:v});},
 async get(){return this.getBusinessState();},async save(values:ShopSettingsUpdate){return this.saveState(values as never);}
};
