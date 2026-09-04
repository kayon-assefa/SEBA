import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({
          error: "Method not allowed",
        }),
        {
          status: 405,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const authHeader = req.headers.get("Authorization");

    if (!authHeader) {
      return new Response(
        JSON.stringify({
          error: "Missing authorization",
        }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const admin = createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Verify the currently logged-in user.
    const token = authHeader.replace("Bearer ", "");

    const {
      data: { user: owner },
      error: ownerError,
    } = await admin.auth.getUser(token);

    if (ownerError || !owner) {
      return new Response(
        JSON.stringify({
          error: "Invalid authentication",
        }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Verify that the current user owns a business.
    const { data: business, error: businessError } =
      await admin
        .from("businesses")
        .select("id")
        .eq("owner_id", owner.id)
        .order("id", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (businessError) {
      throw businessError;
    }

    if (!business) {
      return new Response(
        JSON.stringify({
          error: "Business not found",
        }),
        {
          status: 403,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const body = await req.json();

    const fullName = String(body.full_name ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    const role = String(body.role ?? "receptionist");
    const branchId = body.branch_id ? String(body.branch_id) : null;
    const permissions = Array.isArray(body.permissions)
      ? body.permissions
      : [];

    if (!fullName) {
      throw new Error("Full name is required");
    }

    if (!email) {
      throw new Error("Email is required");
    }

    if (!password || password.length < 6) {
      throw new Error(
        "Password must be at least 6 characters"
      );
    }

    const allowedRoles = [
      "receptionist",
      "manager",
      "accountant",
      "staff",
      "custom",
    ];

    if (!allowedRoles.includes(role)) {
      throw new Error("Invalid staff role");
    }

    // Check staff limit.
    const { data: canCreate, error: limitError } =
      await admin.rpc("can_create_staff", {
        target_business_id: business.id,
      });

    if (limitError) {
      throw limitError;
    }

    if (!canCreate) {
      throw new Error(
        "Your current plan has reached its staff limit."
      );
    }

    // Check whether this email already belongs to staff
    // in this business.
    const { data: existingStaff } =
      await admin
        .from("business_staff")
        .select("id")
        .eq("business_id", business.id)
        .ilike("email", email)
        .maybeSingle();

    if (existingStaff) {
      throw new Error(
        "A staff account with this email already exists."
      );
    }

    // Create Supabase Auth account.
    const {
      data: authData,
      error: authError,
    } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        account_type: "staff",
      },
    });

    if (authError) {
      throw authError;
    }

    if (!authData.user) {
      throw new Error(
        "Failed to create authentication account"
      );
    }


const userId = authData.user.id;

const {
  data: staff,
  error: staffError,
} = await admin
  .from("business_staff")
  .insert({
    business_id: business.id,
    user_id: userId,
    branch_id: branchId,
    full_name: fullName,
    email,
    role,
    permissions: Object.fromEntries(
      permissions.map((permission: string) => [permission, true])
    ),
    is_active: true,
    invitation_status: "accepted",
  })
  .select()
  .single();

if (staffError) {
  // Remove the Auth user if the staff record fails.
  await admin.auth.admin.deleteUser(userId);

  throw staffError;
}
    // If custom permissions were supplied, override
    // the default role permissions.
    if (permissions.length > 0) {
      const permissionRows = permissions.map(
        (permission: string) => ({
          staff_id: staff.id,
          permission,
          allowed: true,
        })
      );

      const {
        error: permissionError,
      } = await admin
        .from("staff_permissions")
        .upsert(
          permissionRows,
          {
            onConflict:
              "staff_id,permission",
          }
        );

      if (permissionError) {
        // Remove staff + auth account if permission setup fails.
        await admin
          .from("business_staff")
          .delete()
          .eq("id", staff.id);

        await admin.auth.admin.deleteUser(userId);

        throw permissionError;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        staff: {
          id: staff.id,
          user_id: staff.user_id,
          business_id: staff.business_id,
          full_name: staff.full_name,
          email: staff.email,
          role: staff.role,
        },
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("create-staff error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to create staff account",
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
