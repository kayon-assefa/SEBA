// Minimal client-side WebAuthn helper for a platform authenticator (Face ID /
// Touch ID / Windows Hello). This registers a real passkey with the device.
//
// IMPORTANT for production: this stores the credential ID on the Supabase user
// so the browser can later ask "do you have this credential?" via
// navigator.credentials.get(). For full security you should also verify the
// attestation/assertion server-side (e.g. with @simplewebauthn/server) instead
// of trusting the client. That backend piece is not included here — see the
// README's "Security / passkeys" section for how to add it.

function randomChallenge(): ArrayBuffer {
  // Explicitly allocate an ArrayBuffer: current TypeScript lib definitions
  // distinguish this from a possibly SharedArrayBuffer-backed Uint8Array.
  const bytes = new Uint8Array(new ArrayBuffer(32));
  crypto.getRandomValues(bytes);
  return bytes.buffer;
}

function bufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let str = "";
  for (const b of bytes) str += String.fromCharCode(b);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function isPlatformAuthenticatorAvailable(): Promise<boolean> {
  if (typeof window === "undefined" || !window.PublicKeyCredential) return false;
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

export async function registerPasskey(userId: string, userEmail: string) {
  const challenge = randomChallenge();

  const credential = (await navigator.credentials.create({
    publicKey: {
      challenge,
      rp: { name: "SEBA" },
      user: {
        id: new TextEncoder().encode(userId),
        name: userEmail,
        displayName: userEmail,
      },
      pubKeyCredParams: [
        { type: "public-key", alg: -7 }, // ES256
        { type: "public-key", alg: -257 }, // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        userVerification: "required",
      },
      timeout: 60000,
      attestation: "none",
    },
  })) as PublicKeyCredential | null;

  if (!credential) throw new Error("Passkey registration was cancelled.");

  return {
    credentialId: bufferToBase64Url(credential.rawId),
    createdAt: new Date().toISOString(),
  };
}

export async function verifyPasskey(credentialId: string) {
  const challenge = randomChallenge();
  const idBytes = Uint8Array.from(atob(credentialId.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));

  const assertion = await navigator.credentials.get({
    publicKey: {
      challenge,
      allowCredentials: [{ id: idBytes, type: "public-key" }],
      userVerification: "required",
      timeout: 60000,
    },
  });

  return !!assertion;
}
