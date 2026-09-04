// File:
// src/features/public-business/hooks/usePublicBusiness.ts

import { useEffect, useState } from "react";

import { supabase } from "../../../lib/supabase";

import type {
  PublicAnnouncement,
  PublicBusiness,
  PublicBusinessTemplate,
  PublicBusinessType,
  PublicProduct,
  PublicService,
  WorkingHours,
} from "../types/publicBusiness";
import type { PublicAppointmentField, PublicStaffMember } from "../types/appointment";

interface UsePublicBusinessResult {
  business: PublicBusiness | null;
  loading: boolean;
  error: Error | null;
}

/* ============================================================
   TEMPLATE MAPPING
   ============================================================

   Onboarding:

   1 = Modern
   2 = Elegant
   3 = Minimal
   4 = Creative

   Public:

   Modern   -> modern
   Elegant  -> editorial
   Minimal  -> minimal
   Creative -> bold
   ============================================================ */

function mapTemplate(
  templateId: number | null | undefined
): PublicBusinessTemplate {
  switch (templateId) {
    case 2:
      return "editorial";

    case 3:
      return "minimal";

    case 4:
      return "bold";

    case 1:
    default:
      return "modern";
  }
}

/* ============================================================
   NUMBER
   ============================================================ */

function toNumber(
  value: unknown
): number | null {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : null;
}

/* ============================================================
   STRING
   ============================================================ */

function toStringOrNull(
  value: unknown
): string | null {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  const valueString = String(value).trim();

  return valueString.length > 0
    ? valueString
    : null;
}

/* ============================================================
   IMAGE EXTRACTION
   ============================================================ */

function extractImageUrls(
  value: unknown
): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const urls: string[] = [];

  for (const item of value) {
    if (typeof item === "string") {
      if (item.trim()) {
        urls.push(item);
      }

      continue;
    }

    if (
      item &&
      typeof item === "object"
    ) {
      const image = item as Record<
        string,
        unknown
      >;

      const url =
        image.url ??
        image.src ??
        image.path ??
        image.image;

      if (
        typeof url === "string" &&
        url.trim()
      ) {
        urls.push(url);
      }
    }
  }

  return urls;
}

/* ============================================================
   BUSINESS HOOK
   ============================================================ */

export function usePublicBusiness(
  username: string
): UsePublicBusinessResult {
  const [business, setBusiness] =
    useState<PublicBusiness | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadBusiness() {
      const normalizedUsername =
        username
          ?.trim()
          .toLowerCase();

      if (!normalizedUsername) {
        setBusiness(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        /* ======================================================
           BUSINESS
           ====================================================== */

        // Public business identity is resolved through a SECURITY DEFINER RPC.
        // This is intentionally used for both anonymous and authenticated visitors:
        // direct reads from `businesses` are protected by RLS and can incorrectly
        // turn an existing public business into a 404 for logged-out visitors.
        const {
          data: businessRow,
          error: businessError,
        } = await supabase.rpc(
          "get_public_business",
          {
            p_username: normalizedUsername,
          }
        );

        if (businessError) {
          throw businessError;
        }

        if (!businessRow) {
          if (!cancelled) {
            setBusiness(null);
            setLoading(false);
          }

          return;
        }

        const businessId =
          String(businessRow.id);

        /* ======================================================
           PUBLIC DATA

           Load independent public resources in parallel. This is
           important for busy public pages: one slow query should
           not make the whole page wait behind the others.
           ====================================================== */

        const [
          settingsResult,
          stateResult,
          themeResult,
          hoursResult,
          servicesResult,
          productsResult,
          fieldsResult,
          staffResult,
        ] = await Promise.all([
          supabase.from("business_settings").select("*").eq("business_id", businessId).maybeSingle(),
          supabase.from("business_state").select("*").eq("business_id", businessId).maybeSingle(),
          supabase.from("business_themes").select("*").eq("business_id", businessId).maybeSingle(),
          supabase.from("business_working_hours").select("*").eq("business_id", businessId).order("day_of_week", { ascending: true }),
          supabase.from("services").select("*").eq("business_id", businessId).order("created_at", { ascending: true }),
          supabase.from("products").select("*").eq("business_id", businessId).order("created_at", { ascending: true }),
          supabase.from("appointment_fields").select("*").eq("business_id", businessId).order("created_at", { ascending: true }),
          supabase.from("staff").select("*").eq("business_id", businessId).order("created_at", { ascending: true }),
        ]);

        const settingsRow = settingsResult.data;
        const stateRow = stateResult.data;
        const themeRow = themeResult.data;
        const hoursRows = hoursResult.data ?? [];
        const serviceRows = servicesResult.data ?? [];
        const productRows = productsResult.data ?? [];
        const fieldRows = fieldsResult.data ?? [];
        const staffRows = staffResult.data ?? [];

        for (const result of [settingsResult, stateResult, themeResult, hoursResult, servicesResult, productsResult, fieldsResult, staffResult]) {
          if (result.error) console.warn("SEBA public page: optional data query failed", result.error);
        }

        const appointmentFields: PublicAppointmentField[] = (fieldRows ?? []).map((row: any) => {
          const rawType = String(row.type ?? row.field_type ?? "text").toLowerCase();
          const allowed = ["text", "phone", "email", "number", "textarea", "select"];
          const type = allowed.includes(rawType) ? rawType : "text";
          const options = Array.isArray(row.options)
            ? row.options.map((v: unknown) => String(v)).filter(Boolean)
            : typeof row.options === "string"
              ? row.options.split(",").map((v: string) => v.trim()).filter(Boolean)
              : [];
          return {
            id: String(row.id),
            name: String(row.name ?? row.field_name ?? row.label ?? "field"),
            label: String(row.label ?? row.name ?? "Additional information"),
            type: type as PublicAppointmentField["type"],
            required: row.required === true || row.is_required === true,
            options,
            placeholder: toStringOrNull(row.placeholder),
          };
        });

        const staff: PublicStaffMember[] = (staffRows ?? []).map((row: any) => ({
          id: String(row.id),
          name: String(row.name ?? row.full_name ?? "Staff member"),
          role: toStringOrNull(row.role ?? row.position),
          imageUrl: toStringOrNull(row.image_url ?? row.image ?? row.avatar_url),
          active: row.active !== false && row.is_active !== false,
        }));

        /* ======================================================
           WORKING HOURS NORMALIZATION
           ====================================================== */

        const workingHours: WorkingHours[] =
          (hoursRows ?? []).map(
            (row: any) => ({
              id:
                row.id
                  ? String(row.id)
                  : undefined,

              dayOfWeek:
                Number(
                  row.day_of_week
                ),

              isOpen:
                row.is_open === true,

              openTime:
                row.opening_time ??
                null,

              closeTime:
                row.closing_time ??
                null,
            })
          );

        /* ======================================================
           SERVICES NORMALIZATION
           ====================================================== */

        const services: PublicService[] =
          (serviceRows ?? []).map(
            (row: any) => ({
              id:
                String(row.id),

              name:
                String(
                  row.name ??
                  "Service"
                ),

              description:
                toStringOrNull(
                  row.description
                ),

              price:
                toNumber(
                  row.price
                ),

              durationMinutes:
                toNumber(
                  row.duration
                ),

              available:
                row.available !== false &&
                row.active !== false,

              featured:
                row.featured === true,
            })
          );

        /* ======================================================
           PRODUCTS NORMALIZATION
           ====================================================== */

        const products: PublicProduct[] =
          (productRows ?? []).map(
            (row: any) => {
              const stock =
                toNumber(
                  row.stock
                );

              const active =
                row.active !== false;

              const allowBackorder =
                row.allow_backorder === true;

              const inStock =
                active &&
                (
                  allowBackorder ||
                  stock === null ||
                  stock > 0
                );

              const imageArray =
                extractImageUrls(
                  row.images
                );

              const oldImage =
                toStringOrNull(
                  row.image
                );

              const allImages =
                imageArray.length > 0
                  ? imageArray
                  : oldImage
                    ? [oldImage]
                    : [];

              return {
                id:
                  String(row.id),

                name:
                  String(
                    row.name ??
                    "Product"
                  ),

                description:
                  toStringOrNull(
                    row.description
                  ),

                price:
                  toNumber(
                    row.price
                  ),

                priceType:
                  String(
                    row.price_type ??
                    "fixed"
                  ),

                category:
                  toStringOrNull(
                    row.category
                  ),

                stock,

                imageUrl:
                  allImages[0] ??
                  null,

                images:
                  allImages,

                active,

                allowBackorder,

                inStock,
              };
            }
          );

        /* ======================================================
           ANNOUNCEMENT

           Your current schema does not contain a dedicated
           announcement table.

           We safely support an announcement if one is later
           returned on the business record.
           ====================================================== */

        let announcement:
          | PublicAnnouncement
          | null = null;

        const rawAnnouncement =
          businessRow.announcement;

        if (
          rawAnnouncement &&
          typeof rawAnnouncement ===
            "object"
        ) {
          const announcementObject =
            rawAnnouncement as Record<
              string,
              unknown
            >;

          const message =
            toStringOrNull(
              announcementObject.message
            );

          if (
            message &&
            announcementObject.enabled !==
              false
          ) {
            announcement = {
              id:
                String(
                  announcementObject.id ??
                  "announcement"
                ),

              message,

              enabled: true,
            };
          }
        }

        /* ======================================================
           PUBLISH STATE
           ====================================================== */

        const explicitlyInactive =
          businessRow.active === false ||
          businessRow.is_active === false ||
          settingsRow?.active === false ||
          settingsRow?.is_active === false ||
          stateRow?.active === false ||
          stateRow?.is_active === false ||
          stateRow?.page_active === false;

        const active = !explicitlyInactive;

        const published =
          active &&
          settingsRow?.is_published !== false &&
          stateRow?.page_unpublished !== true;

        const temporarilyClosed =
          settingsRow?.is_temporarily_closed ===
            true;

        /* ======================================================
           BUSINESS TYPE
           ====================================================== */

        const rawBusinessType =
          String(
            businessRow.business_type ??
              businessRow.type ??
              ""
          ).toLowerCase();

        let businessType:
          | PublicBusinessType;

        if (
          rawBusinessType === "shop" ||
          rawBusinessType ===
            "shop_first" ||
          rawBusinessType ===
            "product"
        ) {
          businessType = "shop";
        } else if (
          products.length > 0 &&
          services.length === 0
        ) {
          businessType = "shop";
        } else {
          businessType =
            "appointment";
        }

        /* ======================================================
           TEMPLATE
           ====================================================== */

        const templateId =
          businessRow.template_id ??
          businessRow.website_template_id;

        const template =
          mapTemplate(
            templateId
          );

        /* ======================================================
           LOCATION

           business_settings is preferred because those are
           specifically public business settings.
           ====================================================== */

        const latitude =
          toNumber(
            settingsRow?.latitude ??
              businessRow.latitude
          );

        const longitude =
          toNumber(
            settingsRow?.longitude ??
              businessRow.longitude
          );

        const address =
          toStringOrNull(
            settingsRow?.address ??
              businessRow.address ??
              businessRow.location_description
          );

        const city =
          toStringOrNull(
            settingsRow?.city ??
              businessRow.city
          );

        /* ======================================================
           CONTACT
           ====================================================== */

        const phone =
          toStringOrNull(
            settingsRow?.business_phone ??
              businessRow.phone
          );

        const email =
          toStringOrNull(
            settingsRow?.business_email
          );

        /* ======================================================
           THEME
           ====================================================== */

        const primaryColor =
          toStringOrNull(
            themeRow?.primary_color
          ) ??
          "#F25F5C";

        const gallery =
          extractImageUrls(
            themeRow?.gallery
          );

        const social = {
          facebook:
            toStringOrNull(
              themeRow?.facebook
            ),

          instagram:
            toStringOrNull(
              themeRow?.instagram
            ),

          telegram:
            toStringOrNull(
              themeRow?.telegram
            ),

          tiktok:
            toStringOrNull(
              themeRow?.tiktok
            ),

          website:
            toStringOrNull(
              themeRow?.website
            ),
        };

        /* ======================================================
           LOGO
           ====================================================== */

        const logoUrl =
          toStringOrNull(
            businessRow.logo
          ) ??
          toStringOrNull(
            businessRow.logo_base64
          );

        /* ======================================================
           WHATSAPP

           There is no dedicated whatsapp column in the schema
           you provided.

           Therefore phone is used for WhatsApp only when the
           public UI needs a WhatsApp action.
           ====================================================== */

        const whatsapp =
          phone;

        /* ======================================================
           FINAL PUBLIC BUSINESS
           ====================================================== */

        const publicBusiness: PublicBusiness =
          {
            id:
              businessId,

            username:
              String(
                businessRow.username ??
                  normalizedUsername
              ).toLowerCase(),

            name:
              String(
                businessRow.business_name ??
                  "Business"
              ),

            category:
              toStringOrNull(
                businessRow.category
              ),

            description:
              toStringOrNull(
                businessRow.description
              ),

            logoUrl,

            verified:
              Boolean(
                businessRow.verified ??
                  businessRow.is_verified ??
                  false
              ),

            published,

            active,

            temporarilyClosed,

            temporaryCloseReason:
              toStringOrNull(
                settingsRow?.temporary_close_reason
              ),

            businessType,

            template,

            phone,

            email,

            whatsapp,

            location: {
              address,

              city,

              latitude,

              longitude,
            },

            workingHours,

            workingDays:
              toStringOrNull(
                businessRow.working_days
              ),

            openingTime:
              toStringOrNull(
                businessRow.opening_time
              ),

            closingTime:
              toStringOrNull(
                businessRow.closing_time
              ),

            timezone:
              toStringOrNull(
                businessRow.timezone
              ),

            appointmentsPaused:
              stateRow?.appointments_paused ===
              true,

            ordersPaused:
              stateRow?.orders_paused ===
              true,

            announcement,

            services,

            products,

            appointmentFields,

            staff,

            theme: {
              primaryColor,

              fontFamily:
                toStringOrNull(
                  themeRow?.font_family
                ),

              borderRadius:
                toStringOrNull(
                  themeRow?.border_radius
                ),

              coverImage:
                toStringOrNull(
                  themeRow?.cover_image
                ),

              gallery,

              social,
            },

            primaryColor,

            secondaryColor:
              null,

            createdAt:
              businessRow.created_at ??
              null,

            updatedAt:
              businessRow.updated_at ??
              null,
          };

        if (!cancelled) {
          setBusiness(
            publicBusiness
          );
        }
      } catch (err) {
        console.error(
          "SEBA public business error:",
          err
        );

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err
              : new Error(
                  "Failed to load business"
                )
          );

          setBusiness(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadBusiness();

    return () => {
      cancelled = true;
    };
  }, [username]);

  return {
    business,
    loading,
    error,
  };
}
