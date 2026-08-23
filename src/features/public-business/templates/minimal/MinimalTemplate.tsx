import type { PublicBusiness } from "../../types/publicBusiness";

interface MinimalTemplateProps {
  business: PublicBusiness;
}

function formatPrice(price: number | null | undefined) {
  if (price === null || price === undefined) return "Price on request";

  return `${price.toLocaleString()} ETB`;
}

export function MinimalTemplate({
  business,
}: MinimalTemplateProps) {
  const services = business.services ?? [];
  const products = business.products ?? [];

  const address = [
    business.location?.address,
    business.location?.city,
  ]
    .filter(Boolean)
    .join(", ");

  const mapUrl =
    business.location?.latitude !== null &&
    business.location?.latitude !== undefined &&
    business.location?.longitude !== null &&
    business.location?.longitude !== undefined
      ? `https://www.google.com/maps/search/?api=1&query=${business.location.latitude},${business.location.longitude}`
      : null;

  const socialLinks = [
    {
      label: "Instagram",
      url: business.theme.social.instagram,
    },
    {
      label: "Facebook",
      url: business.theme.social.facebook,
    },
    {
      label: "Telegram",
      url: business.theme.social.telegram,
    },
    {
      label: "TikTok",
      url: business.theme.social.tiktok,
    },
    {
      label: "Website",
      url: business.theme.social.website,
    },
  ].filter((item) => item.url);

  return (
    <main
      className="min-h-screen bg-white text-neutral-900"
      style={
        {
          "--public-primary":
            business.primaryColor ?? "#111111",
        } as React.CSSProperties
      }
    >
      {/* Header */}
      <header className="border-b border-neutral-200">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            {business.logoUrl ? (
              <img
                src={business.logoUrl}
                alt={business.name}
                className="h-11 w-11 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-neutral-300 text-sm font-semibold">
                {business.name.charAt(0)}
              </div>
            )}

            <div>
              <p className="font-semibold">{business.name}</p>

              {business.verified && (
                <p className="text-xs text-neutral-500">
                  ✓ Verified Business
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              navigator.share?.({
                title: business.name,
                url: window.location.href,
              })
            }
            className="border border-neutral-300 px-4 py-2 text-sm transition hover:bg-neutral-100"
          >
            Share
          </button>
        </div>
      </header>

      {/* Closed */}
      {business.temporarilyClosed && (
        <div className="border-b border-red-200 bg-red-50 px-6 py-4 text-center text-sm text-red-700">
          <strong>Currently Closed</strong>
          <span className="ml-2">
            {business.temporaryCloseReason ??
              "This business is temporarily unavailable."}
          </span>
        </div>
      )}

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="max-w-3xl">
          {business.category && (
            <p className="mb-5 text-sm uppercase tracking-[0.2em] text-neutral-500">
              {business.category}
            </p>
          )}

          <h1 className="text-5xl font-semibold tracking-tight sm:text-7xl">
            {business.name}
          </h1>

          {business.description && (
            <p className="mt-8 max-w-2xl text-lg leading-8 text-neutral-600">
              {business.description}
            </p>
          )}

          <div className="mt-8 flex flex-wrap gap-3 text-sm text-neutral-600">
            {address && (
              <span className="border border-neutral-200 px-4 py-2">
                📍 {address}
              </span>
            )}

            {business.phone && (
              <a
                href={`tel:${business.phone}`}
                className="border border-neutral-200 px-4 py-2 hover:bg-neutral-50"
              >
                ☎ {business.phone}
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Services */}
      {services.length > 0 && (
        <section className="border-t border-neutral-200">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <div className="mb-10">
              <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                Services
              </p>

              <h2 className="mt-2 text-3xl font-semibold">
                What we offer
              </h2>
            </div>

            <div className="divide-y divide-neutral-200">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="flex flex-col justify-between gap-4 py-7 sm:flex-row sm:items-center"
                >
                  <div>
                    <h3 className="text-xl font-medium">
                      {service.name}
                    </h3>

                    {service.description && (
                      <p className="mt-2 max-w-xl text-sm text-neutral-500">
                        {service.description}
                      </p>
                    )}

                    {service.durationMinutes && (
                      <p className="mt-2 text-sm text-neutral-400">
                        {service.durationMinutes} minutes
                      </p>
                    )}
                  </div>

                  <div className="text-lg font-semibold">
                    {formatPrice(service.price)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Products */}
      {products.length > 0 && (
        <section className="border-t border-neutral-200">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
              Products
            </p>

            <h2 className="mt-2 text-3xl font-semibold">
              Available products
            </h2>

            <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <article key={product.id}>
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="aspect-[4/3] w-full object-cover"
                    />
                  ) : (
                    <div className="aspect-[4/3] bg-neutral-100" />
                  )}

                  <div className="pt-4">
                    <h3 className="font-medium">
                      {product.name}
                    </h3>

                    {product.description && (
                      <p className="mt-2 text-sm text-neutral-500">
                        {product.description}
                      </p>
                    )}

                    <div className="mt-3 flex items-center justify-between">
                      <span className="font-semibold">
                        {formatPrice(product.price)}
                      </span>

                      {!product.inStock && (
                        <span className="text-sm text-red-500">
                          Out of Stock
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Location */}
      {(address || mapUrl) && (
        <section className="border-t border-neutral-200">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <h2 className="text-3xl font-semibold">
              Find us
            </h2>

            {address && (
              <p className="mt-4 text-neutral-600">
                📍 {address}
              </p>
            )}

            {mapUrl && (
              <a
                href={mapUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-block border border-neutral-900 px-5 py-3 text-sm font-medium transition hover:bg-neutral-900 hover:text-white"
              >
                Get Directions
              </a>
            )}
          </div>
        </section>
      )}

      {/* Social */}
      {socialLinks.length > 0 && (
        <section className="border-t border-neutral-200">
          <div className="mx-auto max-w-6xl px-6 py-12">
            <div className="flex flex-wrap gap-6">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.url!}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm underline underline-offset-4 hover:no-underline"
                >
                  {social.label}
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-neutral-200">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-10 text-sm text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
          <span>{business.name}</span>
          <span>Powered by SEBA</span>
        </div>
      </footer>
    </main>
  );
}
