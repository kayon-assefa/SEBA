import { supabase } from "../../../lib/supabase";

const BUCKET = "product-images";
const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

/**
 * Feature #24 - real image upload to Supabase Storage (replaces the
 * "paste an image URL" text field). SECURITY FIX: validates file type
 * and size client-side before upload; the storage bucket policy in
 * schema.sql restricts writes to authenticated users.
 */
export async function uploadProductImage(file: File): Promise<string> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Only PNG, JPEG, WEBP or GIF images are allowed");
  }

  if (file.size > MAX_FILE_BYTES) {
    throw new Error("Image must be smaller than 5MB");
  }

  const ext = file.name.split(".").pop();
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);

  return data.publicUrl;
}
