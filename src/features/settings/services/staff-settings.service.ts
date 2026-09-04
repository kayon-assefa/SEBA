import { supabase } from "../../../lib/supabase";
import { getBusinessId } from "./settings.service";
import type {
  CreateStaffInput,
  StaffPermission,
  StaffMember,
  UpdateStaffInput,
} from "../types/staff-settings";

async function getFunctionErrorMessage(error: unknown) {
  if (
    error &&
    typeof error === "object" &&
    "context" in error &&
    error.context instanceof Response
  ) {
    try {
      const payload = await error.context.clone().json();
      if (typeof payload?.error === "string") return payload.error;
    } catch {
      // Fall back to the SDK error below.
    }
  }

  return error instanceof Error ? error.message : "Failed to create staff account.";
}

export const staffSettingsService = {
  async list(): Promise<StaffMember[]> {
    const business_id = await getBusinessId();
    const { data, error } = await supabase
      .from("business_staff")
      .select("*")
      .eq("business_id", business_id)
      .order("created_at", { ascending: true });

    if (error) throw new Error(`Failed to load staff: ${error.message}`);
    return (data ?? []) as StaffMember[];
  },

  async create(values: CreateStaffInput): Promise<StaffMember> {
    const business_id = await getBusinessId();

    if (!values.full_name.trim()) throw new Error("Full name is required.");
    if (!values.email.trim()) throw new Error("Email is required.");
    if (!values.password) throw new Error("Password is required.");
    if (values.password.length < 6) {
      throw new Error("Password must be at least 6 characters.");
    }

    const { data, error } = await supabase.functions.invoke("create-staff", {
      body: {
        business_id,
        full_name: values.full_name.trim(),
        email: values.email.trim().toLowerCase(),
        password: values.password,
        role: values.role,
        branch_id: values.branch_id ?? null,
        permissions: Object.entries(values.permissions)
          .filter(([, allowed]) => allowed)
          .map(([permission]) => permission as StaffPermission),
      },
    });

    if (error) {
      throw new Error(await getFunctionErrorMessage(error));
    }

    if (!data?.staff) {
      throw new Error(data?.error || "Failed to create staff account.");
    }

    return data.staff as StaffMember;
  },

  async update(id: string, values: UpdateStaffInput): Promise<StaffMember> {
    const business_id = await getBusinessId();

    const payload = {
      ...values,
      ...(values.email !== undefined
        ? { email: values.email.trim().toLowerCase() }
        : {}),
      ...(values.full_name !== undefined
        ? { full_name: values.full_name.trim() }
        : {}),
    };

    const { data, error } = await supabase
      .from("business_staff")
      .update(payload)
      .eq("id", id)
      .eq("business_id", business_id)
      .select("*")
      .single();

    if (error) throw new Error(`Failed to update staff: ${error.message}`);
    return data as StaffMember;
  },

  async remove(id: string) {
    const business_id = await getBusinessId();
    const { error } = await supabase
      .from("business_staff")
      .delete()
      .eq("id", id)
      .eq("business_id", business_id);

    if (error) throw new Error(`Failed to remove staff: ${error.message}`);
  },
};
