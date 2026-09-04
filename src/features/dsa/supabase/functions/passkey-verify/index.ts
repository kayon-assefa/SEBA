// supabase/functions/passkey-verify/index.ts
//
// Verifies the browser's WebAuthn response against the stored challenge
// and credential. On successful authentication we don't fabricate a
// Supabase session ourselves (there's no public API to mint arbitrary
// access/refresh tokens, and there shouldn't be) — instead we use
// supabase.auth.admin.generateLink() to get a one-time token_hash for
// that user, hand it back to the client, and the client redeems it with
// supabase.auth.verifyOtp(). That's the same primitive Supabase's own
// magic-link flow uses, so the resulting session is fully real and
// standard, just triggered by a passkey instead of an emailed link.

import {
  verifyRegistrationResponse,
  verifyAuthenticationResponse,
} from "npm:@simplewebauthn/server@9";
import { adminClient, getRequestUserId, handleCors, json } from "../_shared/helpers.ts";

const RP_ID = Deno.env.get("WEBAUTHN_RP_ID") ?? "localhost";
const ORIGIN = Deno.env.get("WEBAUTHN_ORIGIN") ?? "http://localhost:5173";

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  const supabase = adminClient();
  const body = await req.json().catch(() => ({}));

  if (body.action === "register") {
    const userId = await getRequestUserId(req);
    if (!userId) return json({ error: "unauthenticated" }, 401);

    const { data: challengeRow } = await supabase
      .from("webauthn_challenges")
      .select("id, challenge, expires_at")
      .eq("user_id", userId)
      .eq("type", "register")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!challengeRow || new Date(challengeRow.expires_at) < new Date()) {
      return json({ error: "challenge expired" }, 400);
    }

    const verification = await verifyRegistrationResponse({
      response: body.attestation,
      expectedChallenge: challengeRow.challenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
    });

    if (!verification.verified || !verification.registrationInfo) {
      return json({ error: "verification failed" }, 400);
    }

    const { credential } = verification.registrationInfo;

    await supabase.from("passkeys").insert({
      user_id: userId,
      credential_id: credential.id,
      public_key: btoa(String.fromCharCode(...credential.publicKey)),
      counter: credential.counter,
      device_name: req.headers.get("user-agent")?.slice(0, 120) ?? "Unknown device",
    });

    await supabase.from("webauthn_challenges").delete().eq("id", challengeRow.id);

    return json({ ok: true });
  }

  if (body.action === "authenticate") {
    const credentialId = body.assertion?.id;
    if (!credentialId) return json({ error: "missing credential id" }, 400);

    const { data: passkey } = await supabase
      .from("passkeys")
      .select("id, user_id, public_key, counter")
      .eq("credential_id", credentialId)
      .maybeSingle();

    if (!passkey) return json({ error: "unknown passkey" }, 400);

    const { data: challengeRow } = await supabase
      .from("webauthn_challenges")
      .select("id, challenge, expires_at")
      .is("user_id", null)
      .eq("type", "authenticate")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!challengeRow || new Date(challengeRow.expires_at) < new Date()) {
      return json({ error: "challenge expired" }, 400);
    }

    const publicKeyBytes = Uint8Array.from(atob(passkey.public_key), (c) => c.charCodeAt(0));

    const verification = await verifyAuthenticationResponse({
      response: body.assertion,
      expectedChallenge: challengeRow.challenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
      credential: {
        id: passkey.credential_id,
        publicKey: publicKeyBytes,
        counter: passkey.counter,
      },
    });

    if (!verification.verified) return json({ error: "verification failed" }, 400);

    await supabase
      .from("passkeys")
      .update({ counter: verification.authenticationInfo.newCounter })
      .eq("id", passkey.id);
    await supabase.from("webauthn_challenges").delete().eq("id", challengeRow.id);

    const { data: userRow } = await supabase.auth.admin.getUserById(passkey.user_id);
    const email = userRow?.user?.email;
    if (!email) return json({ error: "user not found" }, 400);

    const { data: link, error: linkError } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email,
    });
    if (linkError || !link) return json({ error: "could not issue session" }, 500);

    return json({
      email,
      tokenHash: link.properties.hashed_token,
    });
  }

  return json({ error: "unknown action" }, 400);
});
