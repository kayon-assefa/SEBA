import { supabase } from "../../../lib/supabase";
import { getActiveBusinessId } from "../../../lib/business";

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw new Error(`Unable to get authenticated user: ${error.message}`);
  if (!data.user) throw new Error("You must be logged in.");
  return data.user;
}

export async function getBusinessId(): Promise<string> {
  return getActiveBusinessId();
}

export async function getCurrentBusiness() {
  const businessId = await getBusinessId();
  const { data: business, error } = await supabase
    .from("businesses")
    .select("*")
    .eq("id", businessId)
    .limit(1);

  if (error) throw new Error(`Unable to load business: ${error.message}`);
  return business?.[0] ?? null;
}

export async function getSettingRow(table: string, businessId: string) {
  const { data, error } = await supabase
    .from(table)
    .select("*")
    .eq("business_id", businessId)
    .limit(1);
  if (error) throw error;
  return data?.[0] ?? null;
}

export async function uploadCompanyImage(file: File): Promise<string> {
  const user = await getCurrentUser();
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${user.id}/company-image.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from("business-assets")
    .upload(path, file, { upsert: true, contentType: file.type || "image/jpeg" });

  if (uploadError) {
    throw new Error(`Failed to upload company image: ${uploadError.message}`);
  }

  const { data } = supabase.storage.from("business-assets").getPublicUrl(path);
  if (!data.publicUrl) throw new Error("Unable to create company image URL.");

  return data.publicUrl;
}

export async function removeCompanyImage(): Promise<void> {
  const user = await getCurrentUser();
  const prefixes = [`${user.id}/company-image.jpg`, `${user.id}/company-image.jpeg`, `${user.id}/company-image.png`, `${user.id}/company-image.webp`];
  await supabase.storage.from("business-assets").remove(prefixes);
}

export async function requireBusinessId() {
  return getBusinessId();
}

export const settingsService = {
  getCurrentUser,
  getCurrentBusiness,
  getBusinessId,
  uploadCompanyImage,
  removeCompanyImage,
};
