// File: src/features/onboarding/services/onboarding.service.ts

import { supabase } from "../../../lib/supabase";
import { getActiveBusinessIdForUser } from "../../../lib/business";

import type { BusinessFormData } from "../types/business";
import type { ThemeData } from "../types/theme";
import type { ServiceData } from "../types/service";
import type { AppointmentFieldData } from "../types/appointmentField";
import type { ProductData } from "../types/product";

type BusinessIdentifier = {
  id: string;
} | null;

/**
 * Get the business belonging to the currently authenticated user.
 *
 * IMPORTANT:
 * We do NOT use .single() or .maybeSingle() here because old/test data
 * may contain more than one business for the same owner.
 */
async function getBusinessByOwner(
  userId: string
): Promise<BusinessIdentifier> {
  try {
    return { id: await getActiveBusinessIdForUser(userId) };
  } catch (error) {
    if (error instanceof Error && error.message === "Business not found") {
      return null;
    }

    throw error;
  }
}

export const onboardingService = {
  // ============================================================
  // BUSINESS
  // ============================================================

  async createBusiness(data: BusinessFormData) {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error("User not authenticated");
    }

    const { data: business, error } = await supabase
      .from("businesses")
      .insert({
        owner_id: user.id,

        business_name: data.business_name,

        username: data.username,

        category:
          data.category === "Other"
            ? data.custom_category
            : data.category,

        phone: data.phone,

        city: data.city,

        address: data.address,

        description: data.description,

        timezone: data.timezone,

        logo: data.logo,

        working_days: data.working_days,

        opening_time: data.opening_time,

        closing_time: data.closing_time,

        latitude: (data as any).latitude ?? null,

        longitude: (data as any).longitude ?? null,

        location_description:
          (data as any).location_description ?? null,
      } as any)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return business;
  },

  // ============================================================
  // ONBOARDING PROGRESS
  // ============================================================

  async createProgress(businessId: string) {
    /*
     * First check whether progress already exists.
     *
     * This prevents creating multiple onboarding_progress rows
     * when the user refreshes/re-enters onboarding.
     */
    const { data: existing, error: findError } = await supabase
      .from("onboarding_progress")
      .select("id")
      .eq("business_id", businessId)
      .limit(1);

    if (findError) {
      throw findError;
    }

    // Progress already exists → do not create another row.
    if (existing && existing.length > 0) {
      return;
    }

    const { error } = await supabase
      .from("onboarding_progress")
      .insert({
        business_id: businessId,
        current_step: 2,
        completed: false,
      } as any);

    if (error) {
      throw error;
    }
  },

// File: src/features/onboarding/services/onboarding.service.ts
// REPLACE ONLY getProgress() WITH THIS

async getProgress() {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    throw authError;
  }

  if (!user) {
    return null;
  }

  /*
   * Do NOT use maybeSingle() here.
   * There may be multiple businesses/progress rows.
   * We only need the latest onboarding record.
   */
  const { data: businesses, error: businessError } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_id", user.id)
    .order("id", { ascending: false });

  if (businessError) {
    throw businessError;
  }

  const businessIds = businesses?.map((business) => business.id) ?? [];

  if (businessIds.length === 0) {
    return null;
  }

  /*
   * Your onboarding_progress table does NOT have created_at.
   * It has updated_at.
   */
  const { data: progressRows, error: progressError } = await supabase
    .from("onboarding_progress")
    .select("*")
    .in("business_id", businessIds)
    .order("updated_at", { ascending: false, nullsFirst: false })

  if (progressError) {
    throw progressError;
  }

  const progress = progressRows?.find(
    (row) => row.completed === true || Number(row.current_step) >= 6
  ) ?? progressRows?.[0];

  if (!progress) {
    return null;
  }

  return progress;
},
  async updateProgress(step: number) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    const business = await getBusinessByOwner(user.id);

    if (!business) {
      throw new Error("Business not found");
    }

    const completed = step >= 6;

    /*
     * Get the latest progress row.
     */
    const { data: progressRows, error: findError } = await supabase
      .from("onboarding_progress")
      .select("id")
      .eq("business_id", business.id)
      .order("updated_at", { ascending: false })
      .limit(1);

    if (findError) {
      throw findError;
    }

    const progress = progressRows?.[0];

    /*
     * If progress exists, update ONLY that row.
     */
    if (progress) {
      const { error } = await supabase
        .from("onboarding_progress")
        .update({
          current_step: step,
          completed,
        } as any)
        .eq("id", progress.id);

      if (error) {
        throw error;
      }

      return;
    }

    /*
     * If no progress exists, create it.
     */
    const { error } = await supabase
      .from("onboarding_progress")
      .insert({
        business_id: business.id,
        current_step: step,
        completed,
      } as any);

    if (error) {
      throw error;
    }
  },

  async completeOnboarding() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    const business = await getBusinessByOwner(user.id);

    if (!business) {
      throw new Error("Business not found");
    }

    /*
     * Get latest progress row.
     */
    const { data: progressRows, error: findError } = await supabase
      .from("onboarding_progress")
      .select("id")
      .eq("business_id", business.id)
      .order("updated_at", { ascending: false })
      .limit(1);

    if (findError) {
      throw findError;
    }

    const progress = progressRows?.[0];

    if (!progress) {
      /*
       * No progress row → create completed progress.
       */
      const { error } = await supabase
        .from("onboarding_progress")
        .insert({
          business_id: business.id,
          current_step: 6,
          completed: true,
        } as any);

      if (error) {
        throw error;
      }

      return;
    }

    const { error } = await supabase
      .from("onboarding_progress")
      .update({
        current_step: 6,
        completed: true,
      } as any)
      .eq("id", progress.id);

    if (error) {
      throw error;
    }
  },

  // ============================================================
  // TEMPLATE
  // ============================================================

  async saveTemplate(templateId: number) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Not authenticated");
    }

    const { error } = await supabase
      .from("businesses")
      .update({
        website_template_id: templateId,
      } as any)
      .eq("owner_id", user.id);

    if (error) {
      throw error;
    }
  },

  // ============================================================
  // THEME
  // ============================================================

  async saveTheme(theme: ThemeData) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Not authenticated");
    }

    const business = await getBusinessByOwner(user.id);

    if (!business) {
      throw new Error("Business not found");
    }

    const { error } = await supabase
      .from("business_themes")
      .upsert({
        business_id: business.id,
        ...theme,
      });

    if (error) {
      throw error;
    }
  },

  // ============================================================
  // SERVICES
  // ============================================================

  async createService(service: ServiceData) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Not authenticated");
    }

    const business = await getBusinessByOwner(user.id);

    if (!business) {
      throw new Error("Business not found");
    }

    const { error } = await supabase
      .from("services")
      .insert({
        business_id: business.id,
        ...service,
      });

    if (error) {
      throw error;
    }
  },

  async getServices() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Not authenticated");
    }

    const business = await getBusinessByOwner(user.id);

    if (!business) {
      throw new Error("Business not found");
    }

    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("business_id", business.id)
      .order("created_at", { ascending: true });

    if (error) {
      throw error;
    }

    return data ?? [];
  },

  // ============================================================
  // PRODUCTS
  // ============================================================

  async createProduct(product: ProductData) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Not authenticated");
    }

    const business = await getBusinessByOwner(user.id);

    if (!business) {
      throw new Error("Business not found");
    }

    const { error } = await supabase
      .from("products")
      .insert({
        business_id: business.id,
        ...product,
      });

    if (error) {
      throw error;
    }
  },

  async getProducts() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Not authenticated");
    }

    const business = await getBusinessByOwner(user.id);

    if (!business) {
      throw new Error("Business not found");
    }

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("business_id", business.id)
      .order("created_at", { ascending: true });

    if (error) {
      throw error;
    }

    return data ?? [];
  },

  // ============================================================
  // APPOINTMENT FIELDS
  // ============================================================

  async createAppointmentField(
    field: AppointmentFieldData
  ) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Not authenticated");
    }

    const business = await getBusinessByOwner(user.id);

    if (!business) {
      throw new Error("Business not found");
    }

    const { error } = await supabase
      .from("appointment_fields")
      .insert({
        business_id: business.id,
        label: field.label,
        field_type: field.field_type,
        placeholder: field.placeholder,
        required: field.required,
        options: field.options,
      });

    if (error) {
      throw error;
    }
  },

  // ============================================================
  // USERNAME
  // ============================================================

  async checkUsername(username: string) {
    const { data, error } = await supabase
      .from("businesses")
      .select("id")
      .eq("username", username)
      .limit(1);

    if (error) {
      throw error;
    }

    return !data || data.length === 0;
  },
};
