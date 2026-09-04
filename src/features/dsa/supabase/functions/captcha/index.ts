// supabase/functions/captcha/index.ts
//
// Issues and verifies SEBA's own shape-matching CAPTCHA. See
// src/features/auth/components/SebaCaptcha.tsx for the "why shapes, not
// letters, and why this needs a server side at all" explanation.
//
// KNOWN LIMITATION (be honest about this — see README "Custom CAPTCHA"):
// the tile shapes are sent to the client as plain data ({ id, shape }) so
// the UI can render them. A bot that talks to this API directly (instead
// of a real browser) could compute the matching tiles itself just as
// easily as a human can see them — this stops naive/scripted form-spam
// and keeps the human flow easy and bilingual, but it is NOT equivalent
// to an image-based CAPTCHA against a determined attacker. The rate
// limiting and account lockout in login-guard/resend-guard are the real
// backstop and work independently of whether the CAPTCHA itself is
// beaten.

import { adminClient, handleCors, json } from "../_shared/helpers.ts";

const SHAPES = ["circle", "square", "half-circle", "quarter-circle"] as const;
const TILE_COUNT = 12;
const CHALLENGE_TTL_SECONDS = 120;
const TOKEN_TTL_SECONDS = 300;

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  const supabase = adminClient();
  const body = await req.json().catch(() => ({}));

  if (body.action === "start") {
    const targetShape = pick(SHAPES);
    // 3–5 correct tiles among the grid, rest are distractors of other shapes.
    const correctCount = 3 + Math.floor(Math.random() * 3);

    const tiles: { id: string; shape: string }[] = [];
    for (let i = 0; i < correctCount; i++) {
      tiles.push({ id: crypto.randomUUID(), shape: targetShape });
    }
    while (tiles.length < TILE_COUNT) {
      const shape = pick(SHAPES.filter((s) => s !== targetShape));
      tiles.push({ id: crypto.randomUUID(), shape });
    }
    // shuffle
    for (let i = tiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
    }

    const correctIds = tiles.filter((t) => t.shape === targetShape).map((t) => t.id);
    const expiresAt = new Date(Date.now() + CHALLENGE_TTL_SECONDS * 1000).toISOString();

    const { data, error } = await supabase
      .from("captcha_challenges")
      .insert({
        target_shape: targetShape,
        tiles,
        correct_ids: correctIds,
        expires_at: expiresAt,
      })
      .select("id")
      .single();

    if (error) return json({ error: error.message }, 500);

    return json({
      challengeId: data.id,
      targetShape,
      tiles: tiles.map((t) => ({ id: t.id, shape: t.shape })),
      expiresAt: new Date(expiresAt).getTime(),
    });
  }

  if (body.action === "verify") {
    const { challengeId, selected } = body as { challengeId: string; selected: string[] };

    const { data: challenge, error } = await supabase
      .from("captcha_challenges")
      .select("id, correct_ids, expires_at, solved")
      .eq("id", challengeId)
      .maybeSingle();

    if (error || !challenge) return json({ ok: false });
    if (challenge.solved) return json({ ok: false }); // single attempt per challenge
    if (new Date(challenge.expires_at) < new Date()) return json({ ok: false });

    const correct = new Set(challenge.correct_ids as string[]);
    const attempted = new Set(selected ?? []);
    const isMatch =
      correct.size === attempted.size && [...correct].every((id) => attempted.has(id));

    // Mark solved either way — one attempt per challenge, whether right or
    // wrong, so a bot can't brute-force selections against a single
    // challenge id.
    if (!isMatch) {
      await supabase.from("captcha_challenges").update({ solved: true }).eq("id", challengeId);
      return json({ ok: false });
    }

    const token = crypto.randomUUID() + crypto.randomUUID();
    const tokenExpiresAt = new Date(Date.now() + TOKEN_TTL_SECONDS * 1000).toISOString();

    await supabase
      .from("captcha_challenges")
      .update({ solved: true, verified_token: token, token_expires_at: tokenExpiresAt })
      .eq("id", challengeId);

    return json({ ok: true, token });
  }

  return json({ error: "unknown action" }, 400);
});
