// supabase/functions/resend-guard/index.ts
//
// Item #6: the old "Resend Email" button had no rate limit at all, so it
// could be used to bomb someone's inbox. This limiter is intentionally
// separate from login-guard's — resend abuse and login-brute-force are
// different threat patterns and shouldn't share (or reset) each other's
// counters.

import { adminClient, getClientIp, handleCors, json } from "../_shared/helpers.ts";

const WINDOW_MINUTES = 60;
const MAX_PER_EMAIL = 3;
const MAX_PER_IP = 10;

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  const { email, captchaToken } = await req.json().catch(() => ({}));
  if (!email) return json({ error: "email required" }, 400);
  if (!captchaToken) return json({ allowed: false, reason: "captcha_required" }, 429);

  const supabase = adminClient();
  const ip = getClientIp(req);

  const { data: challenge } = await supabase
    .from("captcha_challenges")
    .select("id, redeemed, token_expires_at")
    .eq("verified_token", captchaToken)
    .maybeSingle();

  if (!challenge || challenge.redeemed || new Date(challenge.token_expires_at) < new Date()) {
    return json({ allowed: false, reason: "captcha_invalid" }, 429);
  }
  await supabase.from("captcha_challenges").update({ redeemed: true }).eq("id", challenge.id);

  const since = new Date(Date.now() - WINDOW_MINUTES * 60_000).toISOString();

  const { count: perEmail } = await supabase
    .from("resend_attempts")
    .select("id", { count: "exact", head: true })
    .eq("email", email)
    .gte("created_at", since);

  const { count: perIp } = await supabase
    .from("resend_attempts")
    .select("id", { count: "exact", head: true })
    .eq("ip", ip)
    .gte("created_at", since);

  if ((perEmail ?? 0) >= MAX_PER_EMAIL || (perIp ?? 0) >= MAX_PER_IP) {
    return json({ allowed: false, reason: "rate_limited", retryAfterSeconds: WINDOW_MINUTES * 60 }, 429);
  }

  await supabase.from("resend_attempts").insert({ email, ip });

  return json({ allowed: true });
});
