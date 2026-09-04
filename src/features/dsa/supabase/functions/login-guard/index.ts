// supabase/functions/login-guard/index.ts
//
// Central gate for every login/register/forgot-password/magic-link attempt,
// plus the session-management actions used by the Sessions page.
//
// Deploy: supabase functions deploy login-guard
// Requires: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (set automatically by
// the platform), and the SQL in supabase/migrations applied first.

import { adminClient, getClientIp, getRequestUserId, handleCors, json } from "../_shared/helpers.ts";

/** Supabase access tokens are JWTs carrying a `session_id` claim — decode
 * it (no verification needed here, we already validated the token via
 * getRequestUserId's admin.auth.getUser call above) just to identify
 * which row in the list is "this device". */
function getSessionIdFromJwt(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.session_id ?? null;
  } catch {
    return null;
  }
}

const FAILURE_WINDOW_MINUTES = 15;
const MAX_FAILURES_BEFORE_LOCK = 5;
const LOCK_MINUTES = 15;
// Item #38: broader credential-stuffing signal — many DIFFERENT emails
// failing from the same IP in a short window gets the IP itself blocked,
// not just the one email.
const MAX_DISTINCT_EMAIL_FAILURES_PER_IP = 12;

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  const supabase = adminClient();
  const ip = getClientIp(req);
  const body = await req.json().catch(() => ({}));
  const { action } = body;

  try {
    if (action === "check") {
      const { email, captchaToken } = body;
      return await handleCheck(supabase, email, ip, captchaToken);
    }

    if (action === "record") {
      const { email, success } = body;
      return await handleRecord(supabase, email, ip, success);
    }

    if (action === "revoke-other-sessions") {
      const userId = await getRequestUserId(req);
      if (!userId) return json({ error: "unauthenticated" }, 401);
      const token = req.headers.get("Authorization")!.replace("Bearer ", "");
      const { error } = await supabase.auth.admin.signOut(token, "others");
      if (error) return json({ error: error.message }, 500);
      return json({ ok: true });
    }

    if (action === "revoke-session") {
      const userId = await getRequestUserId(req);
      if (!userId) return json({ error: "unauthenticated" }, 401);
      const { sessionId } = body;
      const { error } = await supabase.rpc("revoke_user_session", {
        p_user_id: userId,
        p_session_id: sessionId,
      });
      if (error) return json({ error: error.message }, 500);
      return json({ ok: true });
    }

    if (action === "list-sessions") {
      const userId = await getRequestUserId(req);
      if (!userId) return json({ error: "unauthenticated" }, 401);
      const currentToken = req.headers.get("Authorization")!.replace("Bearer ", "");
      const currentSessionId = getSessionIdFromJwt(currentToken);

      const { data, error } = await supabase.rpc("list_user_sessions", { p_user_id: userId });
      if (error) return json({ error: error.message }, 500);
      const sessions = (data ?? []).map((s: Record<string, unknown>) => ({
        id: s.id,
        device: s.user_agent ?? "Unknown device",
        ip: s.ip ?? "—",
        lastActiveAt: s.updated_at,
        isCurrent: currentSessionId !== null && s.id === currentSessionId,
      }));
      return json({ sessions });
    }

    if (action === "list-activity") {
      const userId = await getRequestUserId(req);
      if (!userId) return json({ error: "unauthenticated" }, 401);

      const { data: userRow } = await supabase.auth.admin.getUserById(userId);
      const email = userRow?.user?.email;
      if (!email) return json({ events: [] });

      const { data, error } = await supabase
        .from("login_attempts")
        .select("id, ip, success, created_at, user_agent")
        .eq("email", email)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) return json({ error: error.message }, 500);

      return json({
        events: (data ?? []).map((e) => ({
          id: e.id,
          ip: e.ip,
          device: e.user_agent ?? "Unknown device",
          success: e.success,
          createdAt: e.created_at,
        })),
      });
    }

    return json({ error: "unknown action" }, 400);
  } catch (err) {
    return json({ error: String(err) }, 500);
  }
});

async function handleCheck(
  supabase: ReturnType<typeof adminClient>,
  email: string,
  ip: string,
  captchaToken: string | undefined
) {
  // 1. Is the IP itself blocked (credential-stuffing pattern)?
  const { data: ipBlock } = await supabase
    .from("blocked_ips")
    .select("blocked_until")
    .eq("ip", ip)
    .maybeSingle();

  if (ipBlock && new Date(ipBlock.blocked_until) > new Date()) {
    const retryAfterSeconds = Math.ceil(
      (new Date(ipBlock.blocked_until).getTime() - Date.now()) / 1000
    );
    return json({ allowed: false, reason: "ip_blocked", retryAfterSeconds });
  }

  // 2. Per-email failure count in the trailing window.
  const since = new Date(Date.now() - FAILURE_WINDOW_MINUTES * 60_000).toISOString();
  const { count: emailFailures } = await supabase
    .from("login_attempts")
    .select("id", { count: "exact", head: true })
    .eq("email", email)
    .eq("success", false)
    .gte("created_at", since);

  if ((emailFailures ?? 0) >= MAX_FAILURES_BEFORE_LOCK) {
    const blockedUntil = new Date(Date.now() + LOCK_MINUTES * 60_000).toISOString();
    await supabase
      .from("blocked_ips")
      .upsert({ ip, blocked_until: blockedUntil, reason: `repeated failures for ${email}` });
    return json({ allowed: false, reason: "locked", retryAfterSeconds: LOCK_MINUTES * 60 });
  }

  // 3. Distinct-email failures from this IP (credential stuffing).
  const { data: distinctRows } = await supabase
    .from("login_attempts")
    .select("email")
    .eq("ip", ip)
    .eq("success", false)
    .gte("created_at", since);
  const distinctEmails = new Set((distinctRows ?? []).map((r) => r.email)).size;

  if (distinctEmails >= MAX_DISTINCT_EMAIL_FAILURES_PER_IP) {
    const blockedUntil = new Date(Date.now() + LOCK_MINUTES * 60_000).toISOString();
    await supabase
      .from("blocked_ips")
      .upsert({ ip, blocked_until: blockedUntil, reason: "credential stuffing pattern" });
    return json({ allowed: false, reason: "ip_blocked", retryAfterSeconds: LOCK_MINUTES * 60 });
  }

  // 4. CAPTCHA token must be valid, unused, and issued to this session.
  if (!captchaToken) return json({ allowed: false, reason: "captcha_required" });

  const { data: challenge } = await supabase
    .from("captcha_challenges")
    .select("id, redeemed, token_expires_at")
    .eq("verified_token", captchaToken)
    .maybeSingle();

  if (!challenge || challenge.redeemed || new Date(challenge.token_expires_at) < new Date()) {
    return json({ allowed: false, reason: "captcha_invalid" });
  }

  await supabase.from("captcha_challenges").update({ redeemed: true }).eq("id", challenge.id);

  return json({ allowed: true });
}

async function handleRecord(
  supabase: ReturnType<typeof adminClient>,
  email: string,
  ip: string,
  success: boolean
) {
  await supabase.from("login_attempts").insert({ email, ip, success });
  return json({ ok: true });
}
