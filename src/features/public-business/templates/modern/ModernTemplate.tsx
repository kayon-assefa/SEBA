// File:
// src/features/public-business/templates/modern/ModernTemplate.tsx

import type { CSSProperties } from "react";
import type { PublicBusiness } from "../../types/publicBusiness";

interface ModernTemplateProps {
  business: PublicBusiness;
}

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function formatPrice(price: number | null | undefined) {
  if (price === null || price === undefined) {
    return null;
  }

  return `${price.toLocaleString()} ETB`;
}

function formatTime(time: string | null | undefined) {
  if (!time) return null;

  const [hourString, minuteString] = time.split(":");

  const hour = Number(hourString);
  const minute = Number(minuteString);

  if (!Number.isFinite(hour)) {
    return time;
  }

  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;

  return `${displayHour}:${String(minute || 0).padStart(2, "0")} ${suffix}`;
}

function getMapUrl(
  latitude: number | null | undefined,
  longitude: number | null | undefined
) {
  if (latitude === null || latitude === undefined) return null;
  if (longitude === null || longitude === undefined) return null;

  return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
}

function getDirectionsUrl(
  latitude: number | null | undefined,
  longitude: number | null | undefined
) {
  if (latitude === null || latitude === undefined) return null;
  if (longitude === null || longitude === undefined) return null;

  return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
}

function getCoverImage(business: PublicBusiness) {
  const businessWithExtras = business as PublicBusiness & {
    coverImage?: string | null;
    gallery?: unknown;
  };

  return businessWithExtras.coverImage ?? null;
}

function getGalleryImages(business: PublicBusiness): string[] {
  const businessWithExtras = business as PublicBusiness & {
    gallery?: unknown;
  };

  const gallery = businessWithExtras.gallery;

  if (!Array.isArray(gallery)) {
    return [];
  }

  return gallery
    .map((item) => {
      if (typeof item === "string") {
        return item;
      }

      if (item && typeof item === "object") {
        const value = item as {
          url?: unknown;
          src?: unknown;
          image?: unknown;
        };

        if (typeof value.url === "string") {
          return value.url;
        }

        if (typeof value.src === "string") {
          return value.src;
        }

        if (typeof value.image === "string") {
          return value.image;
        }
      }

      return null;
    })
    .filter((image): image is string => Boolean(image));
}

export function ModernTemplate({
  business,
}: ModernTemplateProps) {
  const primaryColor =
    business.primaryColor || "#F25F5C";

  const secondaryColor =
    business.secondaryColor || "#D9A441";

  const coverImage = getCoverImage(business);
  const galleryImages = getGalleryImages(business);

  const mapUrl = getMapUrl(
    business.location?.latitude,
    business.location?.longitude
  );

  const directionsUrl = getDirectionsUrl(
    business.location?.latitude,
    business.location?.longitude
  );

  const services = business.services ?? [];

  const featuredServices = services.filter(
    (service) =>
      service.featured && service.available !== false
  );

  const locationAddress = [
    business.location?.address,
    business.location?.city,
  ]
    .filter(Boolean)
    .join(", ");

  const hasSocialLinks =
    business.theme.social.facebook ||
    business.theme.social.instagram ||
    business.theme.social.telegram ||
    business.theme.social.tiktok ||
    business.theme.social.website;

  const style = {
    "--public-primary": primaryColor,
    "--public-secondary": secondaryColor,
  } as CSSProperties;

  return (
    <main
      className="min-h-screen bg-[#FAFAFA] text-[#202020]"
      style={style}
    >
      {/* =====================================================
          COVER
      ====================================================== */}

      <section className="relative">
        {coverImage ? (
          <div className="h-[260px] w-full overflow-hidden sm:h-[340px] lg:h-[430px]">
            <img
              src={coverImage}
              alt={`${business.name} cover`}
              className="h-full w-full object-cover" loading="lazy" decoding="async"
            />
          </div>
        ) : (
          <div
            className="h-[220px] w-full sm:h-[280px]"
            style={{
              background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
            }}
          />
        )}

        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/40 to-transparent" />
      </section>

      {/* =====================================================
          MAIN CONTAINER
      ====================================================== */}

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* ===================================================
            BUSINESS HEADER
        ==================================================== */}

        <section className="relative -mt-16 sm:-mt-20">
          <div className="rounded-3xl border border-[#ECECEC] bg-white p-6 shadow-xl sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                {/* LOGO */}

                <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-3xl border-4 border-white bg-[#F4F4F4] shadow-lg">
                  {business.logoUrl ? (
                    <img
                      src={business.logoUrl}
                      alt={business.name}
                      className="h-full w-full object-cover" loading="lazy" decoding="async"
                    />
                  ) : (
                    <span
                      className="text-3xl font-bold"
                      style={{
                        color: primaryColor,
                      }}
                    >
                      {business.name
                        ?.charAt(0)
                        .toUpperCase()}
                    </span>
                  )}
                </div>

                {/* BUSINESS NAME */}

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                      {business.name}
                    </h1>

                    {business.verified && (
                      <span
                        className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold text-white"
                        style={{
                          backgroundColor: primaryColor,
                        }}
                      >
                        ✓ Verified Business
                      </span>
                    )}
                  </div>

                  {business.category && (
                    <p className="mt-2 text-sm font-medium text-[#777]">
                      {business.category}
                    </p>
                  )}

                  {locationAddress && (
                    <p className="mt-2 flex items-center gap-2 text-sm text-[#666]">
                      <span>📍</span>
                      <span>{locationAddress}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* SHARE */}

              <button
                type="button"
                onClick={async () => {
                  const url = window.location.href;

                  if (
                    navigator.share
                  ) {
                    try {
                      await navigator.share({
                        title: business.name,
                        text:
                          business.description ||
                          business.name,
                        url,
                      });
                    } catch {
                      // User cancelled share.
                    }
                  } else {
                    try {
                      await navigator.clipboard.writeText(
                        url
                      );

                      alert(
                        "Business link copied."
                      );
                    } catch {
                      // Clipboard unavailable.
                    }
                  }
                }}
                className="rounded-full border border-[#E5E5E5] bg-white px-5 py-3 text-sm font-semibold transition hover:bg-[#F7F7F7]"
              >
                ↗ Share
              </button>
            </div>

            {/* =================================================
                OPEN / CLOSED
            ================================================== */}

            <div className="mt-6">
              {business.temporarilyClosed ? (
                <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4">
                  <div className="flex items-center gap-3">
                    <span className="h-3 w-3 rounded-full bg-orange-500" />

                    <div>
                      <p className="font-semibold text-orange-800">
                        Currently Closed
                      </p>

                      <p className="mt-1 text-sm text-orange-700">
                        This business is temporarily
                        unavailable.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
                  <div className="flex items-center gap-3">
                    <span className="h-3 w-3 rounded-full bg-green-500" />

                    <div>
                      <p className="font-semibold text-green-800">
                        Open
                      </p>

                      <p className="mt-1 text-sm text-green-700">
                        Business information and services
                        are available below.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ===================================================
            ANNOUNCEMENT
        ==================================================== */}

        {business.announcement?.enabled &&
          business.announcement.message && (
            <section className="mt-8">
              <div
                className="rounded-3xl p-6 text-white shadow-sm"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                }}
              >
                <p className="text-sm font-semibold uppercase tracking-wider opacity-80">
                  Announcement
                </p>

                <p className="mt-2 text-lg font-semibold sm:text-xl">
                  🎉 {business.announcement.message}
                </p>
              </div>
            </section>
          )}

        {/* ===================================================
            ABOUT
        ==================================================== */}

        {business.description && (
          <section className="mt-12">
            <div className="rounded-3xl border border-[#ECECEC] bg-white p-6 sm:p-8">
              <p
                className="text-sm font-semibold uppercase tracking-wider"
                style={{
                  color: primaryColor,
                }}
              >
                About us
              </p>

              <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
                Welcome to {business.name}
              </h2>

              <p className="mt-4 max-w-4xl text-base leading-8 text-[#666]">
                {business.description}
              </p>
            </div>
          </section>
        )}

        {/* ===================================================
            QUICK CONTACT
        ==================================================== */}

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {business.phone && (
            <a
              href={`tel:${business.phone}`}
              className="rounded-2xl border border-[#ECECEC] bg-white p-5 transition hover:-translate-y-1 hover:shadow-md"
            >
              <span className="text-2xl">☎</span>

              <p className="mt-3 text-sm text-[#777]">
                Phone
              </p>

              <p className="mt-1 font-semibold">
                {business.phone}
              </p>
            </a>
          )}

          {business.whatsapp && (
            <a
              href={`https://wa.me/${String(
                business.whatsapp
              ).replace(/\D/g, "")}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl border border-[#ECECEC] bg-white p-5 transition hover:-translate-y-1 hover:shadow-md"
            >
              <span className="text-2xl">💬</span>

              <p className="mt-3 text-sm text-[#777]">
                WhatsApp
              </p>

              <p className="mt-1 font-semibold">
                Contact us
              </p>
            </a>
          )}

          {business.email && (
            <a
              href={`mailto:${business.email}`}
              className="rounded-2xl border border-[#ECECEC] bg-white p-5 transition hover:-translate-y-1 hover:shadow-md"
            >
              <span className="text-2xl">✉</span>

              <p className="mt-3 text-sm text-[#777]">
                Email
              </p>

              <p className="mt-1 break-all font-semibold">
                {business.email}
              </p>
            </a>
          )}

          {directionsUrl && (
            <a
              href={directionsUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl border border-[#ECECEC] bg-white p-5 transition hover:-translate-y-1 hover:shadow-md"
            >
              <span className="text-2xl">📍</span>

              <p className="mt-3 text-sm text-[#777]">
                Location
              </p>

              <p
                className="mt-1 font-semibold"
                style={{
                  color: primaryColor,
                }}
              >
                Get Directions
              </p>
            </a>
          )}
        </section>

        {/* ===================================================
            FEATURED SERVICES
        ==================================================== */}

        {featuredServices.length > 0 && (
          <section className="mt-14">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p
                  className="text-sm font-semibold uppercase tracking-wider"
                  style={{
                    color: primaryColor,
                  }}
                >
                  Featured
                </p>

                <h2 className="mt-2 text-3xl font-bold">
                  Popular Services
                </h2>
              </div>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {featuredServices.map((service) => (
                <div
                  key={service.id}
                  className="rounded-3xl border border-[#ECECEC] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span
                      className="rounded-full px-3 py-1 text-xs font-bold text-white"
                      style={{
                        backgroundColor: primaryColor,
                      }}
                    >
                      ⭐ Popular
                    </span>
                  </div>

                  <h3 className="mt-5 text-xl font-bold">
                    {service.name}
                  </h3>

                  {service.description && (
                    <p className="mt-3 text-sm leading-6 text-[#777]">
                      {service.description}
                    </p>
                  )}

                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    {service.price !== null &&
                      service.price !== undefined && (
                        <span className="font-bold">
                          {formatPrice(service.price)}
                        </span>
                      )}

                    {service.durationMinutes && (
                      <span className="text-sm text-[#777]">
                        {service.durationMinutes} min
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ===================================================
            ALL SERVICES
        ==================================================== */}

        {services.length > 0 && (
          <section className="mt-14">
            <div>
              <p
                className="text-sm font-semibold uppercase tracking-wider"
                style={{
                  color: primaryColor,
                }}
              >
                Services
              </p>

              <h2 className="mt-2 text-3xl font-bold">
                What We Offer
              </h2>

              <p className="mt-2 text-[#777]">
                Explore the services available at{" "}
                {business.name}.
              </p>
            </div>

            <div className="mt-6 overflow-hidden rounded-3xl border border-[#ECECEC] bg-white">
              {services.map((service, index) => (
                <div
                  key={service.id}
                  className={`flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between ${
                    index !== services.length - 1
                      ? "border-b border-[#EEEEEE]"
                      : ""
                  }`}
                >
                  <div className="max-w-2xl">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-lg font-bold">
                        {service.name}
                      </h3>

                      {service.featured && (
                        <span
                          className="rounded-full px-2.5 py-1 text-xs font-semibold"
                          style={{
                            backgroundColor: `${primaryColor}18`,
                            color: primaryColor,
                          }}
                        >
                          Featured
                        </span>
                      )}

                      {service.available === false && (
                        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-500">
                          Currently unavailable
                        </span>
                      )}
                    </div>

                    {service.description && (
                      <p className="mt-2 text-sm leading-6 text-[#777]">
                        {service.description}
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-5">
                    {service.durationMinutes && (
                      <span className="text-sm text-[#777]">
                        ⏱ {service.durationMinutes} min
                      </span>
                    )}

                    {service.price !== null &&
                      service.price !== undefined && (
                        <span className="text-lg font-bold">
                          {formatPrice(service.price)}
                        </span>
                      )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ===================================================
            WORKING HOURS
        ==================================================== */}

        {business.workingHours &&
          business.workingHours.length > 0 && (
            <section className="mt-14">
              <div className="rounded-3xl border border-[#ECECEC] bg-white p-6 sm:p-8">
                <p
                  className="text-sm font-semibold uppercase tracking-wider"
                  style={{
                    color: primaryColor,
                  }}
                >
                  Visit Us
                </p>

                <h2 className="mt-2 text-3xl font-bold">
                  Working Hours
                </h2>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {business.workingHours.map((day) => (
                    <div
                      key={day.dayOfWeek}
                      className="flex items-center justify-between rounded-2xl bg-[#FAFAFA] p-4"
                    >
                      <span className="font-medium">
                        {DAY_NAMES[day.dayOfWeek] ??
                          "Day"}
                      </span>

                      {day.isOpen ? (
                        <span className="text-sm font-medium text-[#555]">
                          {formatTime(day.openTime) ??
                            "Open"}{" "}
                          –{" "}
                          {formatTime(day.closeTime) ??
                            "Close"}
                        </span>
                      ) : (
                        <span className="text-sm font-semibold text-red-500">
                          Closed
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

        {/* ===================================================
            LOCATION + MAP
        ==================================================== */}

        {(locationAddress || mapUrl) && (
          <section className="mt-14">
            <div className="grid overflow-hidden rounded-3xl border border-[#ECECEC] bg-white lg:grid-cols-2">
              <div className="p-6 sm:p-8">
                <p
                  className="text-sm font-semibold uppercase tracking-wider"
                  style={{
                    color: primaryColor,
                  }}
                >
                  Find Us
                </p>

                <h2 className="mt-2 text-3xl font-bold">
                  Our Location
                </h2>

                {locationAddress && (
                  <p className="mt-5 text-lg leading-7 text-[#666]">
                    📍 {locationAddress}
                  </p>
                )}

                {directionsUrl && (
                  <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-6 inline-flex rounded-full px-6 py-3 text-sm font-semibold text-white"
                    style={{
                      backgroundColor: primaryColor,
                    }}
                  >
                    Get Directions
                  </a>
                )}
              </div>

              {mapUrl && (
                <div className="min-h-[320px] bg-[#F2F2F2]">
                  <iframe
                    title={`${business.name} location`}
                    src={`https://www.google.com/maps?q=${business.location?.latitude},${business.location?.longitude}&z=15&output=embed`}
                    className="h-full min-h-[320px] w-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              )}
            </div>
          </section>
        )}

        {/* ===================================================
            GALLERY
        ==================================================== */}

        {galleryImages.length > 0 && (
          <section className="mt-14">
            <p
              className="text-sm font-semibold uppercase tracking-wider"
              style={{
                color: primaryColor,
              }}
            >
              Gallery
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              Our Business
            </h2>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {galleryImages.map((image, index) => (
                <div
                  key={`${image}-${index}`}
                  className="group overflow-hidden rounded-3xl bg-[#EEE]"
                >
                  <img
                    src={image}
                    alt={`${business.name} gallery ${index + 1}`}
                    className="h-64 w-full object-cover transition duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ===================================================
            SOCIAL / WEBSITE
        ==================================================== */}

        {hasSocialLinks && (
          <section className="mt-14">
            <div className="rounded-3xl border border-[#ECECEC] bg-white p-6 sm:p-8">
              <p
                className="text-sm font-semibold uppercase tracking-wider"
                style={{
                  color: primaryColor,
                }}
              >
                Connect
              </p>

              <h2 className="mt-2 text-3xl font-bold">
                Follow {business.name}
              </h2>

              <div className="mt-6 flex flex-wrap gap-3">
                {business.theme.social.website && (
                  <a
                    href={business.theme.social.website}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border px-5 py-3 text-sm font-semibold"
                  >
                    🌐 Website
                  </a>
                )}

                {business.theme.social.facebook && (
                  <a
                    href={business.theme.social.facebook}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border px-5 py-3 text-sm font-semibold"
                  >
                    Facebook
                  </a>
                )}

                {business.theme.social.instagram && (
                  <a
                    href={business.theme.social.instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border px-5 py-3 text-sm font-semibold"
                  >
                    Instagram
                  </a>
                )}

                {business.theme.social.telegram && (
                  <a
                    href={business.theme.social.telegram}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border px-5 py-3 text-sm font-semibold"
                  >
                    Telegram
                  </a>
                )}

                {business.theme.social.tiktok && (
                  <a
                    href={business.theme.social.tiktok}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border px-5 py-3 text-sm font-semibold"
                  >
                    TikTok
                  </a>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ===================================================
            CONTACT CTA
        ==================================================== */}

        {(business.phone ||
          business.whatsapp ||
          business.email) && (
          <section className="mt-14">
            <div
              className="rounded-3xl p-8 text-white sm:p-10"
              style={{
                background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
              }}
            >
              <h2 className="text-3xl font-bold">
                Get in touch with {business.name}
              </h2>

              <p className="mt-3 max-w-2xl text-white/80">
                Have a question? Contact the business
                directly using one of the options below.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                {business.phone && (
                  <a
                    href={`tel:${business.phone}`}
                    className="rounded-full bg-white px-6 py-3 text-sm font-bold text-[#222]"
                  >
                    ☎ Call
                  </a>
                )}

                {business.whatsapp && (
                  <a
                    href={`https://wa.me/${String(
                      business.whatsapp
                    ).replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full bg-white px-6 py-3 text-sm font-bold text-[#222]"
                  >
                    💬 WhatsApp
                  </a>
                )}

                {business.email && (
                  <a
                    href={`mailto:${business.email}`}
                    className="rounded-full bg-white px-6 py-3 text-sm font-bold text-[#222]"
                  >
                    ✉ Email
                  </a>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ===================================================
            FOOTER
        ==================================================== */}

        <footer className="mt-20 border-t border-[#EAEAEA] py-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-bold">
                {business.name}
              </p>

              {locationAddress && (
                <p className="mt-1 text-sm text-[#777]">
                  📍 {locationAddress}
                </p>
              )}
            </div>

            <p className="text-sm text-[#999]">
              Powered by SEBA
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}
