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

        const {
          data: businessRow,
          error: businessError,
        } = await supabase
          .from("businesses")
          .select("*")
          .eq(
            "username",
            normalizedUsername
          )
          .maybeSingle();

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
           BUSINESS SETTINGS
           ====================================================== */

        const {
          data: settingsRow,
          error: settingsError,
        } = await supabase
          .from("business_settings")
          .select("*")
          .eq(
            "business_id",
            businessId
          )
          .maybeSingle();

        if (settingsError) {
          console.warn(
            "SEBA: business settings could not be loaded.",
            settingsError
          );
        }

        /* ======================================================
           BUSINESS STATE
           ====================================================== */

        const {
          data: stateRow,
          error: stateError,
        } = await supabase
          .from("business_state")
          .select("*")
          .eq(
            "business_id",
            businessId
          )
          .maybeSingle();

        if (stateError) {
          console.warn(
            "SEBA: business state could not be loaded.",
            stateError
          );
        }

        /* ======================================================
           BUSINESS THEME
           ====================================================== */

        const {
          data: themeRow,
          error: themeError,
        } = await supabase
          .from("business_themes")
          .select("*")
          .eq(
            "business_id",
            businessId
          )
          .maybeSingle();

        if (themeError) {
          console.warn(
            "SEBA: business theme could not be loaded.",
            themeError
          );
        }

        /* ======================================================
           WORKING HOURS

           IMPORTANT:
           We load these for DISPLAY ONLY.

           We do NOT calculate whether the business is open.
           ====================================================== */

        const {
          data: hoursRows,
          error: hoursError,
        } = await supabase
          .from("business_working_hours")
          .select("*")
          .eq(
            "business_id",
            businessId
          )
          .order(
            "day_of_week",
            {
              ascending: true,
            }
          );

        if (hoursError) {
          console.warn(
            "SEBA: working hours could not be loaded.",
            hoursError
          );
        }

        /* ======================================================
           SERVICES
           ====================================================== */

        const {
          data: serviceRows,
          error: servicesError,
        } = await supabase
          .from("services")
          .select("*")
          .eq(
            "business_id",
            businessId
          )
          .order(
            "created_at",
            {
              ascending: true,
            }
          );

        if (servicesError) {
          console.warn(
            "SEBA: services could not be loaded.",
            servicesError
          );
        }

        /* ======================================================
           PRODUCTS
           ====================================================== */

        const {
          data: productRows,
          error: productsError,
        } = await supabase
          .from("products")
          .select("*")
          .eq(
            "business_id",
            businessId
          )
          .order(
            "created_at",
            {
              ascending: true,
            }
          );

        if (productsError) {
          console.warn(
            "SEBA: products could not be loaded.",
            productsError
          );
        }

        /* ======================================================
           OPTIONAL APPOINTMENT BUILDER DATA
           ====================================================== */

        const { data: fieldRows, error: fieldsError } = await supabase
          .from("appointment_fields")
          .select("*")
          .eq("business_id", businessId)
          .order("created_at", { ascending: true });

        if (fieldsError) {
          console.warn("SEBA: appointment fields could not be loaded.", fieldsError);
        }

        const { data: staffRows, error: staffError } = await supabase
          .from("staff")
          .select("*")
          .eq("business_id", businessId)
          .order("created_at", { ascending: true });

        if (staffError) {
          console.warn("SEBA: staff could not be loaded.", staffError);
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

        const published =
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
