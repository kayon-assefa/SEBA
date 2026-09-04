import { adminClient, handleCors, json } from "../_shared/helpers.ts";

const SHAPES = ["circle", "square", "half-circle", "quarter-circle"] as const;
const TILE_COUNT = 12;
const CHALLENGE_TTL_MS = 2 * 60 * 1000;
const TOKEN_TTL_MS = 5 * 60 * 1000;

function pick<T>(values: readonly T[]): T {
  return values[Math.floor(Math.random() * values.length)];
}

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const body = await req.json().catch(() => ({}));
  const supabase = adminClient();

  if (body.action === "start") {
    const targetShape = pick(SHAPES);
    const correctCount = 3 + Math.floor(Math.random() * 3);
    const tiles: { id: string; shape: string }[] = Array.from(
      { length: correctCount },
      () => ({ id: crypto.randomUUID(), shape: targetShape }),
    );

    while (tiles.length < TILE_COUNT) {
      tiles.push({ id: crypto.randomUUID(), shape: pick(SHAPES.filter((shape) => shape !== targetShape)) });
    }
    tiles.sort(() => Math.random() - 0.5);

    const expiresAt = new Date(Date.now() + CHALLENGE_TTL_MS).toISOString();
    const { data, error } = await supabase
      .from("captcha_challenges")
      .insert({
        correct_ids: tiles.filter((tile) => tile.shape === targetShape).map((tile) => tile.id),
        expires_at: expiresAt,
      })
      .select("id")
      .single();

    if (error) return json({ error: error.message }, 500);
    return json({ challengeId: data.id, targetShape, tiles, expiresAt: new Date(expiresAt).getTime() });
  }

  if (body.action === "verify") {
    const selected = Array.isArray(body.selected) ? body.selected : [];
    const { data: challenge } = await supabase
      .from("captcha_challenges")
      .select("id, correct_ids, expires_at, solved")
      .eq("id", body.challengeId)
      .maybeSingle();

    if (!challenge || challenge.solved || new Date(challenge.expires_at) < new Date()) {
      return json({ ok: false });
    }

    const expected = new Set(challenge.correct_ids as string[]);
    const received = new Set(selected as string[]);
    const matches = expected.size === received.size && [...expected].every((id) => received.has(id));

    if (!matches) {
      await supabase.from("captcha_challenges").update({ solved: true }).eq("id", challenge.id);
      return json({ ok: false });
    }

    const token = `${crypto.randomUUID()}${crypto.randomUUID()}`;
    const { data: redeemed, error } = await supabase
      .from("captcha_challenges")
      .update({ solved: true, verified_token: token, token_expires_at: new Date(Date.now() + TOKEN_TTL_MS).toISOString() })
      .eq("id", challenge.id)
      .eq("solved", false)
      .select("id")
      .maybeSingle();

    return !error && redeemed ? json({ ok: true, token }) : json({ ok: false });
  }

  return json({ error: "unknown_action" }, 400);
});
