import { supabase } from "../../../lib/supabase";import { getBusinessId } from "./settings.service";
const TABLES={customers:"customers",appointments:"appointments",orders:"orders",products:"products"} as const;type ExportTable=keyof typeof TABLES;
export const dataSettingsService={
 async exportTable(table:ExportTable){const business_id=await getBusinessId();const {data,error}=await supabase.from(TABLES[table]).select("*").eq("business_id",business_id);if(error)throw new Error(`Failed to export ${table}: ${error.message}`);return data??[];},
 async exportCustomers(){return this.exportTable("customers")},async exportAppointments(){return this.exportTable("appointments")},async exportOrders(){return this.exportTable("orders")},async exportProducts(){return this.exportTable("products")},
 async exportAll(){const [customers,appointments,orders,products]=await Promise.all([this.exportCustomers(),this.exportAppointments(),this.exportOrders(),this.exportProducts()]);return {customers,appointments,orders,products}}
};
