import { supabase, callEdgeFunction } from "../../../lib/supabase";
import { normalizeEmail, sanitizePlainText } from "../../../lib/security";

export type AccountType = "owner" | "staff";
export type LoginMode = AccountType;

export type StaffAuthProfile = {
  user_id: string;
  business_id: string;
  full_name: string | null;
  role: string | null;
  status: string | null;
  must_reset_password?: boolean | null;
};

const STAFF_PROFILE_TABLE = "staff_profiles";

/**
 * A single, generic message for every "credentials were wrong" case.
 * Item #1: the old code told the caller whether the email belonged to an
 * owner or a staff account before they'd even entered a password, and told
 * them explicitly to "use Staff Login" / "use Business Owner Login" —
 * both are account-enumeration + account-type leaks. Every failure path
 * below now throws AUTH_GENERIC_ERROR and nothing more specific, except
 * for states that legitimately need their own recovery action (email not
 * verified, account locked) — those still don't reveal account type.
 */
export const AUTH_GENERIC_ERROR = "AUTH_GENERIC_ERROR";
export const AUTH_NEEDS_VERIFICATION = "AUTH_NEEDS_VERIFICATION";
export const AUTH_LOCKED = "AUTH_LOCKED";
export const AUTH_INACTIVE = "AUTH_INACTIVE";
export const AUTH_MUST_RESET = "AUTH_MUST_RESET";

export class AuthFlowError extends Error {
  code: string;
  retryAfterSeconds?: number;
  constructor(code: string, retryAfterSeconds?: number) {
    super(code);
    this.code = code;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

function isMissingStaffTableError(error: unknown) {
  const message =
    error && typeof error === "object" && "message" in error
      ? String((error as { message?: unknown }).message ?? "")
      : "";
  return (
    message.includes("relation") &&
    message.includes(STAFF_PROFILE_TABLE) &&
    message.includes("does not exist")
  );
}

/**
 * Resolves the account type from the database.
 *
 * Security note (unchanged from before, still true): the client must never
 * trust a user-supplied account_type value. Staff membership is determined
 * solely by the staff_profiles table, which only the backend/owner can
 * write to (see supabase/migrations for RLS).
 */
export async function getAccountType(
  userId: string
): Promise<{ accountType: AccountType; staff: StaffAuthProfile | null }> {
  const { data, error } = await supabase
    .from(STAFF_PROFILE_TABLE)
    // Keep this compatible with existing staff_profiles views. The optional
    // password-reset flag is supplied by the staff SQL migration, but older
    // projects do not expose it yet.
    .select("user_id, business_id, full_name, role, status")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    if (isMissingStaffTableError(error)) {
      return { accountType: "owner", staff: null };
    }
    throw error;
  }

  if (data) {
    return {
      accountType: "staff",
      staff: { ...data, must_reset_password: false } as StaffAuthProfile,
    };
  }

  return { accountType: "owner", staff: null };
}

/**
 * Runs BEFORE we ever touch supabase.auth. Calls the login-guard edge
 * function, which: (a) checks the caller's IP + email against
 * login_attempts/blocked_ips and throws AUTH_LOCKED if throttled, and
 * (b) validates the CAPTCHA token was issued for THIS request and hasn't
 * been used yet. See supabase/functions/login-guard.
 */
async function guardLoginAttempt(email: string, captchaToken: string) {
  const result = await callEdgeFunction<{ allowed: boolean; retryAfterSeconds?: number }>(
    "login-guard",
    { action: "check", email, captchaToken }
  );

  if (!result.allowed) {
    throw new AuthFlowError(AUTH_LOCKED, result.retryAfterSeconds);
  }
}

async function recordLoginAttempt(email: string, success: boolean) {
  try {
    await callEdgeFunction("login-guard", { action: "record", email, success });
  } catch {
    // Never let telemetry failures block the login flow itself.
  }
}

export async function loginUser(
  email: string,
  password: string,
  loginMode: LoginMode,
  captchaToken: string
) {
  const normalizedEmail = normalizeEmail(email);

  await guardLoginAttempt(normalizedEmail, captchaToken);

  const { data, error } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password,
  });

  if (error) {
    await recordLoginAttempt(normalizedEmail, false);
    throw new AuthFlowError(AUTH_GENERIC_ERROR);
  }

  if (!data.user) {
    await recordLoginAttempt(normalizedEmail, false);
    throw new AuthFlowError(AUTH_GENERIC_ERROR);
  }

  if (!data.user.email_confirmed_at) {
    await supabase.auth.signOut();
    await recordLoginAttempt(normalizedEmail, false);
    throw new AuthFlowError(AUTH_NEEDS_VERIFICATION);
  }

  let account;
  try {
    account = await getAccountType(data.user.id);
  } catch {
    await supabase.auth.signOut();
    throw new AuthFlowError(AUTH_GENERIC_ERROR);
  }

  if (account.accountType === "staff") {
    const status = account.staff?.status?.toLowerCase();

    if (status && status !== "active") {
      await supabase.auth.signOut();
      await recordLoginAttempt(normalizedEmail, false);
      throw new AuthFlowError(AUTH_INACTIVE);
    }

    if (loginMode !== "staff") {
      await supabase.auth.signOut();
      await recordLoginAttempt(normalizedEmail, false);
      // Same generic error as a wrong password — do NOT say "this is a
      // staff account, use Staff Login": that told an attacker the
      // account type. The UI's own tab choice is the only hint given.
      throw new AuthFlowError(AUTH_GENERIC_ERROR);
    }

    if (account.staff?.must_reset_password) {
      // Item #32: staff reactivated after being deactivated must set a
      // new password before continuing — old password could be stale/
      // shared during the inactive window.
      throw new AuthFlowError(AUTH_MUST_RESET);
    }
  } else if (loginMode === "staff") {
    await supabase.auth.signOut();
    await recordLoginAttempt(normalizedEmail, false);
    throw new AuthFlowError(AUTH_GENERIC_ERROR);
  }

  await recordLoginAttempt(normalizedEmail, true);

  return {
    ...data,
    accountType: account.accountType,
    staff: account.staff,
  };
}

export async function registerUser(
  email: string,
  password: string,
  businessName: string,
  captchaToken: string
) {
  const normalizedEmail = normalizeEmail(email);
  const cleanBusinessName = sanitizePlainText(businessName, 120);

  const guard = await callEdgeFunction<{ allowed: boolean }>("login-guard", {
    action: "check",
    email: normalizedEmail,
    captchaToken,
  });

  if (!guard.allowed) throw new AuthFlowError(AUTH_LOCKED);

  const { data, error } = await supabase.auth.signUp({
    email: normalizedEmail,
    password,
    options: {
      data: {
        business_name: cleanBusinessName,
        // account_type is metadata ONLY — never trusted for authorization.
        // getAccountType() above is the single source of truth, driven by
        // the staff_profiles table, not this field.
        account_type: "owner",
      },
      emailRedirectTo: `${window.location.origin}/login`,
    },
  });

  if (error) {
    throw new AuthFlowError(AUTH_GENERIC_ERROR);
  }

  return data;
}

export async function resendVerificationEmail(email: string, captchaToken?: string) {
  const normalizedEmail = normalizeEmail(email);

  // Item #6: resend was previously unthrottled — an attacker could bomb a
  // user's inbox. resend-guard applies its own IP + email rate limit,
  // independent of the login limiter.
  await callEdgeFunction("resend-guard", { email: normalizedEmail, captchaToken });

  const { error } = await supabase.auth.resend({
    type: "signup",
    email: normalizedEmail,
  });

  if (error) {
    throw new AuthFlowError(AUTH_GENERIC_ERROR);
  }
}

export async function logoutUser() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// ---------------------------------------------------------------------
// Feature #41 / #42 / #43: OAuth, magic link, passkey sign-in
// ---------------------------------------------------------------------

export async function loginWithOAuth(provider: "google") {
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: `${window.location.origin}/dashboard` },
  });
  if (error) throw new AuthFlowError(AUTH_GENERIC_ERROR);
}

export async function sendMagicLink(email: string, captchaToken: string) {
  const normalizedEmail = normalizeEmail(email);
  const guard = await callEdgeFunction<{ allowed: boolean }>("login-guard", {
    action: "check",
    email: normalizedEmail,
    captchaToken,
  });

  if (!guard.allowed) throw new AuthFlowError(AUTH_LOCKED);

  const { error } = await supabase.auth.signInWithOtp({
    email: normalizedEmail,
    options: { emailRedirectTo: `${window.location.origin}/dashboard` },
  });
  if (error) throw new AuthFlowError(AUTH_GENERIC_ERROR);
}

/** See supabase/functions/passkey-options and passkey-verify. Wraps the
 * WebAuthn browser API; requires @simplewebauthn/browser (in package.json). */
export async function loginWithPasskey() {
  const { startAuthentication } = await import("@simplewebauthn/browser");

  const options = await callEdgeFunction<Record<string, unknown>>("passkey-options", {
    action: "authenticate",
  });

  const assertion = await startAuthentication(options as never);

  const result = await callEdgeFunction<{ email: string; tokenHash: string }>(
    "passkey-verify",
    { action: "authenticate", assertion }
  );

  // See passkey-verify's comment: this redeems the same kind of one-time
  // token a magic-link email uses, which is the only supported way to
  // mint a real Supabase session for a user without their password.
  const { error } = await supabase.auth.verifyOtp({
    email: result.email,
    token: result.tokenHash,
    type: "magiclink",
  });
  if (error) throw new AuthFlowError(AUTH_GENERIC_ERROR);
}

export async function registerPasskey() {
  const { startRegistration } = await import("@simplewebauthn/browser");

  const options = await callEdgeFunction<Record<string, unknown>>("passkey-options", {
    action: "register",
  });

  const attestation = await startRegistration(options as never);

  await callEdgeFunction("passkey-verify", { action: "register", attestation });
}
