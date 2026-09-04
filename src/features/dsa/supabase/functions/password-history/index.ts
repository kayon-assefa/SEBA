// supabase/functions/password-history/index.ts
//
// Item #13, done properly. The version in the uploaded code stored
// btoa(password).slice(0,24) inside auth user_metadata — base64 is
// reversible, not a hash, and user_metadata is readable by the client's
// own session, so that was effectively storing a lightly-obscured
// plaintext password on the user object. This function instead:
//   - hashes with SHA-256 + a per-row random salt (server-side only)
//   - stores history in a private table no client role can read
//   - keeps the last 5 passwords per user

import { adminClient, getRequestUserId, handleCors, json, sha256Hex } from "../_shared/helpers.ts";

const HISTORY_SIZE = 5;

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  const userId = await getRequestUserId(req);
  if (!userId) return json({ error: "unauthenticated" }, 401);

  const { action, password } = await req.json().catch(() => ({}));
  if (!password) return json({ error: "password required" }, 400);

  const supabase = adminClient();

  const { data: history } = await supabase
    .from("password_history")
    .select("id, salt, hash")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(HISTORY_SIZE);

  if (action === "check") {
    for (const row of history ?? []) {
      const candidate = await sha256Hex(row.salt + password);
      if (candidate === row.hash) {
        return json({ allowed: false });
      }
    }
    return json({ allowed: true });
  }

  if (action === "record") {
    const salt = crypto.randomUUID();
    const hash = await sha256Hex(salt + password);

    await supabase.from("password_history").insert({ user_id: userId, salt, hash });

    // Trim to the last HISTORY_SIZE rows.
    const { data: all } = await supabase
      .from("password_history")
      .select("id, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    const toDelete = (all ?? []).slice(HISTORY_SIZE).map((r) => r.id);
    if (toDelete.length) {
      await supabase.from("password_history").delete().in("id", toDelete);
    }

    return json({ ok: true });
  }

  return json({ error: "unknown action" }, 400);
});
