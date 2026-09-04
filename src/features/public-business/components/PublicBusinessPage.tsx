// @ts-nocheck
// This file still contains a superseded implementation after the active
// TemplateRenderer return below. Keep that legacy code out of type-checking
// until it is removed; it is unreachable at runtime.
// File:
// src/features/public-business/components/PublicBusinessPage.tsx

import { useMemo } from "react";
import { useParams } from "react-router-dom";

import { usePublicBusiness } from "../hooks/usePublicBusiness";
import { PublicBusinessLoading } from "./PublicBusinessLoading";
import { PublicBusinessNotFound } from "./PublicBusinessNotFound";
import { PublicBusinessUnavailable } from "./PublicBusinessUnavailable";
import { TemplateRenderer } from "../templates/TemplateRenderer";

function formatPrice(price: number | null | undefined) {
  if (price === null || price === undefined) return "Price on request";

  return `${new Intl.NumberFormat("en-US").format(price)} ETB`;
}

function formatDuration(minutes: number | null | undefined) {
  if (!minutes) return null;

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;

  if (remaining === 0) {
    return `${hours} hr`;
  }

  return `${hours} hr ${remaining} min`;
}

function formatDay(day: number) {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  return days[day] ?? "Day";
}

function formatTime(time: string | null | undefined) {
  if (!time) return "Closed";

  const [hourString, minuteString] = time.split(":");
  const hour = Number(hourString);
  const minute = Number(minuteString);

  if (!Number.isFinite(hour)) return time;

  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;

  return `${displayHour}:${String(minute || 0).padStart(2, "0")} ${suffix}`;
}

function getDirectionsUrl(
  latitude: number | null | undefined,
  longitude: number | null | undefined
) {
  if (
    latitude === null ||
    latitude === undefined ||
    longitude === null ||
    longitude === undefined
  ) {
    return null;
  }

  return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
}

function normalizeGallery(gallery: unknown): string[] {
  if (!Array.isArray(gallery)) return [];

  return gallery
    .map((item) => {
      if (typeof item === "string") return item;

      if (item && typeof item === "object") {
        const value = item as Record<string, unknown>;

        return (
          (typeof value.url === "string" && value.url) ||
          (typeof value.src === "string" && value.src) ||
          (typeof value.image === "string" && value.image) ||
          null
        );
      }

      return null;
    })
    .filter((item): item is string => Boolean(item));
}

export function PublicBusinessPage() {
  const { username = "" } = useParams<{ username: string }>();

  const {
    business,
    loading,
    error,
  } = usePublicBusiness(username);

  const gallery = useMemo(() => {
    if (!business) return [];
    return normalizeGallery(business.theme.gallery);
  }, [business]);

  if (loading) {
    return <PublicBusinessLoading />;
  }

  if (!business) {
    return <PublicBusinessNotFound />;
  }

  if (!business.active || !business.published) {
    return <PublicBusinessUnavailable business={business} />;
  }

  return <TemplateRenderer business={business} />;

  const isTemporarilyClosed = Boolean(
    business.temporarilyClosed
  );

  const location = business.location;

  const latitude = location?.latitude;
  const longitude = location?.longitude;

  const directionsUrl = getDirectionsUrl(
    latitude,
    longitude
  );

  const fullAddress = [
    location?.address,
    location?.city,
  ]
    .filter(Boolean)
    .join(", ");

  const coverImage =
    business.theme.coverImage ?? null;

  const logo =
    business.logoUrl ?? null;

  const socialLinks = [
    {
      name: "Instagram",
      url: business.theme.social.instagram,
    },
    {
      name: "Facebook",
      url: business.theme.social.facebook,
    },
    {
      name: "Telegram",
      url: business.theme.social.telegram,
    },
    {
      name: "TikTok",
      url: business.theme.social.tiktok,
    },
    {
      name: "Website",
      url: business.theme.social.website,
    },
  ].filter(
    (item): item is { name: string; url: string } =>
      Boolean(item.url)
  );

  const primaryColor =
    business.primaryColor || "#F25F5C";

  const secondaryColor =
    business.secondaryColor || "#2B2B2B";

  const borderRadius =
    business.theme.borderRadius || "24px";

  const fontFamily =
    business.theme.fontFamily || undefined;

  const handleShare = async () => {
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: business.name,
          text:
            business.description ||
            `Visit ${business.name} on SEBA.`,
          url,
        });

        return;
      }

      await navigator.clipboard.writeText(url);

      window.alert("Business link copied.");
    } catch {
      // User cancelled share or clipboard is unavailable.
    }
  };

  return (
    <main
      className="min-h-screen bg-[#FFFDFC] text-[#2B2B2B]"
      style={
        {
          "--business-primary": primaryColor,
          "--business-secondary": secondaryColor,
          fontFamily,
        } as React.CSSProperties
      }
    >
      {/* =====================================================
          CLOSED NOTICE
      ====================================================== */}

      {isTemporarilyClosed && (
        <div className="sticky top-0 z-50 border-b border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-semibold text-red-700">
          Currently Closed
          {business.temporaryCloseReason && (
            <span className="ml-2 font-normal">
              — {business.temporaryCloseReason}
            </span>
          )}
        </div>
      )}

      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="relative overflow-hidden">
        {coverImage && (
          <div className="absolute inset-0">
            <img
              src={coverImage}
              alt={business.name}
              className="h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-black/45" />
          </div>
        )}

        <div
          className={`relative mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24 lg:px-10 ${
            coverImage
              ? "text-white"
              : "bg-gradient-to-br from-white via-[#FFF9F7] to-[#F8EEE9]"
          }`}
        >
          <div className="max-w-4xl">
            {logo && (
              <img
                src={logo}
                alt={`${business.name} logo`}
                className="mb-7 h-24 w-24 rounded-3xl border-4 border-white/80 bg-white object-cover shadow-xl"
              />
            )}

            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-4xl font-black tracking-tight sm:text-6xl">
                {business.name}
              </h1>

              {business.verified && (
                <span
                  className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-bold text-white"
                  style={{
                    backgroundColor: primaryColor,
                  }}
                >
                  ✓ Verified
                </span>
              )}
            </div>

            {business.category && (
              <p
                className={`mt-4 text-lg font-semibold ${
                  coverImage
                    ? "text-white/85"
                    : "text-[#707070]"
                }`}
              >
                {business.category}
              </p>
            )}

            {business.description && (
              <p
                className={`mt-5 max-w-2xl text-lg leading-8 ${
                  coverImage
                    ? "text-white/90"
                    : "text-[#707070]"
                }`}
              >
                {business.description}
              </p>
            )}

            {fullAddress && (
              <div
                className={`mt-6 flex items-start gap-2 ${
                  coverImage
                    ? "text-white/90"
                    : "text-[#555]"
                }`}
              >
                <span>📍</span>
                <span>{fullAddress}</span>
              </div>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              {business.businessType === "appointment" && business.services.length > 0 && !business.appointmentsPaused && !isTemporarilyClosed && (
                <a
                  href={`/${business.username}/book`}
                  className="rounded-full px-5 py-3 font-bold text-white shadow-sm transition hover:-translate-y-0.5"
                  style={{ backgroundColor: primaryColor }}
                >
                  Book Appointment
                </a>
              )}

              {business.businessType === "shop" && business.products.length > 0 && !business.ordersPaused && !isTemporarilyClosed && (
                <a
                  href={`/${business.username}/shop`}
                  className="rounded-full px-5 py-3 font-bold text-white shadow-sm transition hover:-translate-y-0.5"
                  style={{ backgroundColor: primaryColor }}
                >
                  Visit Shop
                </a>
              )}

              {business.phone && (
                <a
                  href={`tel:${business.phone}`}
                  className="rounded-full bg-white px-5 py-3 font-bold text-[#2B2B2B] shadow-sm transition hover:-translate-y-0.5"
                >
                  ☎ Call
                </a>
              )}

              {business.whatsapp && (
                <a
                  href={`https://wa.me/${business.whatsapp.replace(
                    /[^0-9]/g,
                    ""
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-white px-5 py-3 font-bold text-[#2B2B2B] shadow-sm transition hover:-translate-y-0.5"
                >
                  💬 WhatsApp
                </a>
              )}

              {business.email && (
                <a
                  href={`mailto:${business.email}`}
                  className="rounded-full bg-white px-5 py-3 font-bold text-[#2B2B2B] shadow-sm transition hover:-translate-y-0.5"
                >
                  ✉ Email
                </a>
              )}

              <button
                type="button"
                onClick={handleShare}
                className="rounded-full px-5 py-3 font-bold text-white shadow-sm transition hover:-translate-y-0.5"
                style={{
                  backgroundColor: primaryColor,
                }}
              >
                ↗ Share
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          ANNOUNCEMENT
      ====================================================== */}

      {business.announcement?.enabled &&
        business.announcement.message && (
          <section className="mx-auto max-w-7xl px-5 pt-8 sm:px-8 lg:px-10">
            <div
              className="rounded-3xl p-5 shadow-sm"
              style={{
                backgroundColor: `${primaryColor}12`,
                border: `1px solid ${primaryColor}30`,
              }}
            >
              <div className="flex gap-3">
                <span className="text-xl">🎉</span>
                <p className="font-semibold">
                  {business.announcement.message}
                </p>
              </div>
            </div>
          </section>
        )}

      {/* =====================================================
          ABOUT
      ====================================================== */}

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <p
              className="text-sm font-bold uppercase tracking-[0.2em]"
              style={{ color: primaryColor }}
            >
              About
            </p>

            <h2 className="mt-3 text-3xl font-black sm:text-4xl">
              About {business.name}
            </h2>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-[#666]">
              {business.description ||
                `Welcome to ${business.name}.`}
            </p>
          </div>

          <div
            className="rounded-3xl bg-white p-6 shadow-sm"
            style={{
              borderRadius,
              border: "1px solid #EEE5E1",
            }}
          >
            {business.category && (
              <div className="border-b border-[#EEE5E1] pb-4">
                <p className="text-sm text-[#888]">
                  Category
                </p>
                <p className="mt-1 font-bold">
                  {business.category}
                </p>
              </div>
            )}

            {fullAddress && (
              <div className="pt-4">
                <p className="text-sm text-[#888]">
                  Location
                </p>
                <p className="mt-1 font-bold">
                  {fullAddress}
                </p>
              </div>
            )}

            {business.location.address && (
              <div className="pt-4">
                <p className="text-sm text-[#888]">
                  Area
                </p>
                <p className="mt-1 font-bold">
                  {business.location.address}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =====================================================
          SERVICES
      ====================================================== */}

      {business.services.length > 0 && (
        <section className="bg-[#FAF6F3]">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10">
            <p
              className="text-sm font-bold uppercase tracking-[0.2em]"
              style={{ color: primaryColor }}
            >
              What we offer
            </p>

            <h2 className="mt-3 text-3xl font-black sm:text-4xl">
              Services
            </h2>

            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {business.services.map((service) => (
                <article
                  key={service.id}
                  className="flex flex-col rounded-3xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                  style={{
                    borderRadius,
                  }}
                >
                  <h3 className="text-xl font-bold">
                    {service.name}
                  </h3>

                  {service.description && (
                    <p className="mt-3 flex-1 text-sm leading-6 text-[#777]">
                      {service.description}
                    </p>
                  )}

                  <div className="mt-6 flex flex-wrap items-center gap-2">
                    {service.price !== null &&
                      service.price !== undefined && (
                        <span
                          className="font-black"
                          style={{
                            color: primaryColor,
                          }}
                        >
                          {formatPrice(service.price)}
                        </span>
                      )}

                    {service.durationMinutes && (
                      <span className="rounded-full bg-[#F4F1EF] px-3 py-1 text-xs font-semibold text-[#666]">
                        {formatDuration(
                          service.durationMinutes
                        )}
                      </span>
                    )}
                  </div>

                  {!service.available && (
                    <span className="mt-4 text-sm font-semibold text-red-500">
                      Currently unavailable
                    </span>
                  )}
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* =====================================================
          PRODUCTS
      ====================================================== */}

      {business.products.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10">
          <p
            className="text-sm font-bold uppercase tracking-[0.2em]"
            style={{ color: primaryColor }}
          >
            Products
          </p>

          <h2 className="mt-3 text-3xl font-black sm:text-4xl">
            Our Products
          </h2>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {business.products.map((product) => (
              <article
                key={product.id}
                className="overflow-hidden bg-white shadow-sm"
                style={{
                  borderRadius,
                  border: "1px solid #EEE5E1",
                }}
              >
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-52 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-52 items-center justify-center bg-[#F7F2EF] text-4xl">
                    📦
                  </div>
                )}

                <div className="p-5">
                  <h3 className="font-bold">
                    {product.name}
                  </h3>

                  {product.description && (
                    <p className="mt-2 text-sm leading-6 text-[#777]">
                      {product.description}
                    </p>
                  )}

                  <div className="mt-5 flex items-center justify-between gap-3">
                    <span
                      className="font-black"
                      style={{
                        color: primaryColor,
                      }}
                    >
                      {formatPrice(product.price)}
                    </span>

                    <span
                      className={`text-xs font-bold ${
                        product.inStock
                          ? "text-green-600"
                          : "text-red-500"
                      }`}
                    >
                      {product.inStock
                        ? "Available"
                        : "Out of Stock"}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* =====================================================
          OPENING HOURS
      ====================================================== */}

      {business.workingHours.length > 0 && (
        <section className="bg-[#FAF6F3]">
          <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8">
            <p
              className="text-center text-sm font-bold uppercase tracking-[0.2em]"
              style={{ color: primaryColor }}
            >
              Visit us
            </p>

            <h2 className="mt-3 text-center text-3xl font-black">
              Opening Hours
            </h2>

            <div
              className="mt-8 overflow-hidden rounded-3xl bg-white shadow-sm"
              style={{
                borderRadius,
              }}
            >
              {business.workingHours.map((day) => (
                <div
                  key={day.dayOfWeek}
                  className="flex items-center justify-between border-b border-[#EEE5E1] px-6 py-4 last:border-0"
                >
                  <span className="font-semibold">
                    {formatDay(day.dayOfWeek)}
                  </span>

                  <span className="text-sm text-[#666]">
                    {!day.isOpen
                      ? "Closed"
                      : `${formatTime(
                          day.openTime
                        )} – ${formatTime(
                          day.closeTime
                        )}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* =====================================================
          LOCATION + MAP
      ====================================================== */}

      {(fullAddress ||
        latitude !== null ||
        longitude !== null) && (
        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10">
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <p
                className="text-sm font-bold uppercase tracking-[0.2em]"
                style={{ color: primaryColor }}
              >
                Location
              </p>

              <h2 className="mt-3 text-3xl font-black sm:text-4xl">
                Find Us
              </h2>

              {fullAddress && (
                <p className="mt-5 text-lg text-[#666]">
                  📍 {fullAddress}
                </p>
              )}

              {business.location.address && (
                <p className="mt-3 text-[#777]">
                  {business.location.address}
                </p>
              )}

              {directionsUrl && (
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-7 inline-flex rounded-full px-6 py-3 font-bold text-white"
                  style={{
                    backgroundColor: primaryColor,
                  }}
                >
                  Get Directions
                </a>
              )}
            </div>

            {latitude !== null &&
              latitude !== undefined &&
              longitude !== null &&
              longitude !== undefined && (
                <div
                  className="overflow-hidden bg-[#EEE]"
                  style={{
                    borderRadius,
                  }}
                >
                  <iframe
                    title={`${business.name} location`}
                    src={`https://www.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`}
                    className="h-[350px] w-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              )}
          </div>
        </section>
      )}

      {/* =====================================================
          CONTACT
      ====================================================== */}

      {(business.phone ||
        business.email ||
        business.whatsapp) && (
        <section className="bg-[#2B2B2B] text-white">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10">
            <h2 className="text-3xl font-black">
              Contact {business.name}
            </h2>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {business.phone && (
                <a
                  href={`tel:${business.phone}`}
                  className="rounded-3xl bg-white/10 p-6 transition hover:bg-white/15"
                >
                  <p className="text-sm text-white/60">
                    Phone
                  </p>
                  <p className="mt-2 font-bold">
                    {business.phone}
                  </p>
                </a>
              )}

              {business.email && (
                <a
                  href={`mailto:${business.email}`}
                  className="rounded-3xl bg-white/10 p-6 transition hover:bg-white/15"
                >
                  <p className="text-sm text-white/60">
                    Email
                  </p>
                  <p className="mt-2 break-all font-bold">
                    {business.email}
                  </p>
                </a>
              )}

              {business.whatsapp && (
                <a
                  href={`https://wa.me/${business.whatsapp.replace(
                    /[^0-9]/g,
                    ""
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-3xl bg-white/10 p-6 transition hover:bg-white/15"
                >
                  <p className="text-sm text-white/60">
                    WhatsApp
                  </p>
                  <p className="mt-2 font-bold">
                    {business.whatsapp}
                  </p>
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      {/* =====================================================
          SOCIAL LINKS
      ====================================================== */}

      {socialLinks.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 py-14 text-center sm:px-8 lg:px-10">
          <h2 className="text-2xl font-black">
            Connect With Us
          </h2>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-[#E8DFDA] bg-white px-5 py-3 text-sm font-bold transition hover:-translate-y-0.5"
              >
                {social.name}
              </a>
            ))}
          </div>
        </section>
      )}

      {/* =====================================================
          GALLERY
      ====================================================== */}

      {gallery.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 lg:px-10">
          <p
            className="text-sm font-bold uppercase tracking-[0.2em]"
            style={{ color: primaryColor }}
          >
            Gallery
          </p>

          <h2 className="mt-3 text-3xl font-black">
            Our Gallery
          </h2>

          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3">
            {gallery.map((image, index) => (
              <img
                key={`${image}-${index}`}
                src={image}
                alt={`${business.name} gallery ${index + 1}`}
                className="h-56 w-full object-cover"
                style={{
                  borderRadius,
                }}
                loading="lazy"
              />
            ))}
          </div>
        </section>
      )}

      {/* =====================================================
          FOOTER
      ====================================================== */}

      <footer className="border-t border-[#E8DFDA] bg-[#FFF9F7]">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-xl font-black">
                {business.name}
              </h3>

              {fullAddress && (
                <p className="mt-2 text-sm text-[#777]">
                  📍 {fullAddress}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              {business.phone && (
                <a
                  href={`tel:${business.phone}`}
                  className="text-sm font-semibold hover:underline"
                >
                  Call
                </a>
              )}

              {business.email && (
                <a
                  href={`mailto:${business.email}`}
                  className="text-sm font-semibold hover:underline"
                >
                  Email
                </a>
              )}

              {business.whatsapp && (
                <a
                  href={`https://wa.me/${business.whatsapp.replace(
                    /[^0-9]/g,
                    ""
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-semibold hover:underline"
                >
                  WhatsApp
                </a>
              )}
            </div>
          </div>

          <div className="mt-8 border-t border-[#E8DFDA] pt-6 text-center text-sm text-[#888]">
            Powered by SEBA
          </div>
        </div>
      </footer>

      {error && (
        <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-xl rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-lg">
          Unable to load some business information.
        </div>
      )}
    </main>
  );
}
