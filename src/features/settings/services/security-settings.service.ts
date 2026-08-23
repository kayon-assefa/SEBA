import { supabase } from "../../../lib/supabase";
import { registerPasskey, verifyPasskey } from "./webauthn";

export const securitySettingsService = {
  async getUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    if (!data.user) throw new Error("User not authenticated");
    return data.user;
  },

  // Bug fix: password is now changed by sending a reset email, not by typing a
  // new one directly into Settings.
  async sendPasswordResetEmail() {
    const user = await this.getUser();
    if (!user.email) throw new Error("No email on this account.");
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  },

  async changeEmail(email: string) {
    const normalized = email.trim().toLowerCase();
    if (!normalized) throw new Error("Email is required");
    const { error } = await supabase.auth.updateUser({ email: normalized });
    if (error) throw error;
  },

  async updateMetadata(values: Record<string, unknown>) {
    const user = await this.getUser();
    const { data, error } = await supabase.auth.updateUser({
      data: { ...user.user_metadata, ...values },
    });
    if (error) throw error;
    return data.user;
  },

  // Real WebAuthn platform passkey (Face ID / Touch ID / Windows Hello).
  async setPasskey() {
    const user = await this.getUser();
    const result = await registerPasskey(user.id, user.email ?? user.id);
    await this.updateMetadata({
      passkey_credential_id: result.credentialId,
      passkey_created_at: result.createdAt,
    });
  },

  async hasPasskey() {
    const user = await this.getUser();
    return typeof user.user_metadata?.passkey_credential_id === "string";
  },

  async verifyDangerZonePasskey() {
    const user = await this.getUser();
    const credentialId = user.user_metadata?.passkey_credential_id;
    if (typeof credentialId !== "string") {
      throw new Error("No passkey is configured. Set one in Security first.");
    }
    return verifyPasskey(credentialId);
  },

  async clearPasskey() {
    await this.updateMetadata({
      passkey_credential_id: null,
      passkey_created_at: null,
    });
  },

  async logoutCurrentDevice() {
    const { error } = await supabase.auth.signOut({ scope: "local" });
    if (error) throw error;
  },

  async logoutEverywhere() {
    const { error } = await supabase.auth.signOut({ scope: "global" });
    if (error) throw error;
  },
};
