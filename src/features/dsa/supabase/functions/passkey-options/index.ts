// supabase/functions/passkey-options/index.ts
//
// Generates WebAuthn registration/authentication options using
// @simplewebauthn/server. Pairs with passkey-verify, which checks the
// browser's response.
//
// IMPORTANT — please read before relying on this in production:
// WebAuthn is unforgiving about exact origin/RP ID matching and about
// binary encoding (ArrayBuffer <-> base64url) between client and server.
// This is a correct, complete implementation of the standard flow, but
// treat it as a first draft to test end-to-end against your real domain
// before shipping — set WEBAUTHN_RP_ID and WEBAUTHN_ORIGIN in the
// function's environment (see .env.example) to your actual production
// values, not localhost, before deploying.

import { generateRegistrationOptions, generateAuthenticationOptions } from "npm:@simplewebauthn/server@9";
import { adminClient, getRequestUserId, handleCors, json } from "../_shared/helpers.ts";

const RP_NAME = "SEBA";
const RP_ID = Deno.env.get("WEBAUTHN_RP_ID") ?? "localhost";
const CHALLENGE_TTL_SECONDS = 300;

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  const supabase = adminClient();
  const { action } = await req.json().catch(() => ({}));

  if (action === "register") {
    const userId = await getRequestUserId(req);
    if (!userId) return json({ error: "unauthenticated" }, 401);

    const { data: userRow } = await supabase.auth.admin.getUserById(userId);
    const email = userRow?.user?.email ?? "user@seba.app";

    const { data: existing } = await supabase
      .from("passkeys")
      .select("credential_id")
      .eq("user_id", userId);

    const options = await generateRegistrationOptions({
      rpName: RP_NAME,
      rpID: RP_ID,
      userID: new TextEncoder().encode(userId),
      userName: email,
      attestationType: "none",
      excludeCredentials: (existing ?? []).map((p) => ({
        id: p.credential_id,
        type: "public-key",
      })),
      authenticatorSelection: {
        residentKey: "preferred",
        userVerification: "preferred",
      },
    });

    await supabase.from("webauthn_challenges").insert({
      user_id: userId,
      challenge: options.challenge,
      type: "register",
      expires_at: new Date(Date.now() + CHALLENGE_TTL_SECONDS * 1000).toISOString(),
    });

    return json(options);
  }

  if (action === "authenticate") {
    // Passwordless / passkey-first login — no user id known yet, so this
    // is a discoverable-credential ("resident key") flow: allowCredentials
    // is left empty and the authenticator itself picks a matching passkey.
    const options = await generateAuthenticationOptions({
      rpID: RP_ID,
      userVerification: "preferred",
    });

    await supabase.from("webauthn_challenges").insert({
      user_id: null,
      challenge: options.challenge,
      type: "authenticate",
      expires_at: new Date(Date.now() + CHALLENGE_TTL_SECONDS * 1000).toISOString(),
    });

    return json(options);
  }

  return json({ error: "unknown action" }, 400);
});
