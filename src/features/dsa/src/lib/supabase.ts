import { createClient } from "@supabase/supabase-js";

// NOTE: If your project already has a src/lib/supabase.ts, keep that file —
// this one is only included so the auth package is drop-in runnable on its
// own. It reads the same two env vars every Supabase + Vite project uses.

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  // Fail loudly in dev instead of silently making requests to "undefined".
  // eslint-disable-next-line no-console
  console.error(
    "Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. Copy .env.example to .env and fill them in."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/**
 * Calls a Supabase Edge Function and returns parsed JSON.
 * Centralized so every security-sensitive call (rate limiting, captcha,
 * passkeys) goes through one place with consistent error handling.
 */
export async function callEdgeFunction<T = unknown>(
  name: string,
  body: Record<string, unknown>
): Promise<T> {
  const { data, error } = await supabase.functions.invoke(name, { body });
  if (error) throw error;
  return data as T;
}
