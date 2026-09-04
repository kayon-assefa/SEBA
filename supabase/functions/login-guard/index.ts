import { adminClient, getClientIp, handleCors, json } from "../_shared/helpers.ts";

const FAILURE_WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 5;
const LOCK_MS = 15 * 60 * 1000;

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const body = await req.json().catch(() => ({}));
  const supabase = adminClient();
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const ip = getClientIp(req);

  if (body.action === "record") {
    if (!email || typeof body.success !== "boolean") return json({ error: "invalid_request" }, 400);
    const { error } = await supabase.from("login_attempts").insert({ email, ip, success: body.success });
    return error ? json({ error: error.message }, 500) : json({ ok: true });
  }

  if (body.action !== "check" || !email || typeof body.captchaToken !== "string") {
    return json({ allowed: false, reason: "invalid_request" }, 400);
  }

  const since = new Date(Date.now() - FAILURE_WINDOW_MS).toISOString();
  const { count, error: countError } = await supabase
    .from("login_attempts")
    .select("id", { count: "exact", head: true })
    .eq("email", email)
    .eq("success", false)
    .gte("created_at", since);

  if (countError) return json({ allowed: false, reason: "storage_error" }, 500);
  if ((count ?? 0) >= MAX_FAILURES) {
    return json({ allowed: false, reason: "locked", retryAfterSeconds: LOCK_MS / 1000 }, 429);
  }

  // Redeem the verified CAPTCHA token atomically; it can only authorize one request.
  const { data: redeemed, error } = await supabase
    .from("captcha_challenges")
    .update({ redeemed: true })
    .eq("verified_token", body.captchaToken)
    .eq("redeemed", false)
    .gt("token_expires_at", new Date().toISOString())
    .select("id")
    .maybeSingle();

  if (error) return json({ allowed: false, reason: "storage_error" }, 500);
  return redeemed ? json({ allowed: true }) : json({ allowed: false, reason: "captcha_invalid" }, 403);
});
