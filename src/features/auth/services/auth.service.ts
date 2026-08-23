import { supabase } from "../../../lib/supabase";

export type AccountType = "owner" | "staff";

export type LoginMode = AccountType;

export type StaffAuthProfile = {
  user_id: string;
  business_id: string;
  full_name: string | null;
  role: string | null;
  status: string | null;
};

const STAFF_PROFILE_TABLE = "staff_profiles";

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
 * Security note:
 * The client must never trust a user-supplied account_type value.
 * Staff membership is determined by the staff_profiles table.
 *
 * During Step 1, before the staff SQL migration exists, an owner login
 * continues to work. Staff login will return a clear configuration error.
 */
export async function getAccountType(
  userId: string
): Promise<{ accountType: AccountType; staff: StaffAuthProfile | null }> {
  const { data, error } = await supabase
    .from(STAFF_PROFILE_TABLE)
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
      staff: data as StaffAuthProfile,
    };
  }

  return { accountType: "owner", staff: null };
}

export async function loginUser(
  email: string,
  password: string,
  loginMode: LoginMode = "owner"
) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) {
    throw error;
  }

  if (!data.user) {
    throw new Error("Unable to sign in. Please try again.");
  }

  if (!data.user.email_confirmed_at) {
    await supabase.auth.signOut();
    throw new Error("Please verify your email first.");
  }

  let account;
  try {
    account = await getAccountType(data.user.id);
  } catch {
    await supabase.auth.signOut();
    throw new Error("Unable to verify your account type. Please try again.");
  }

  if (account.accountType === "staff") {
    const status = account.staff?.status?.toLowerCase();

    if (status && status !== "active") {
      await supabase.auth.signOut();
      throw new Error(
        "Your staff account is currently inactive. Please contact the business owner."
      );
    }

    if (loginMode !== "staff") {
      await supabase.auth.signOut();
      throw new Error(
        "This is a staff account. Please use Staff Login."
      );
    }
  } else if (loginMode === "staff") {
    await supabase.auth.signOut();
    throw new Error(
      "This is a business owner account. Please use Business Owner Login."
    );
  }

  return {
    ...data,
    accountType: account.accountType,
    staff: account.staff,
  };
}

export async function registerUser(
  email: string,
  password: string,
  businessName: string
) {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      data: {
        business_name: businessName,
        account_type: "owner",
      },
      emailRedirectTo: `${window.location.origin}/login`,
    },
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function resendVerificationEmail(email: string) {
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: email.trim(),
  });

  if (error) {
    throw error;
  }
}

export async function logoutUser() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}
