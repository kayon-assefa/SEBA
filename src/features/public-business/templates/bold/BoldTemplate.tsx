import type { PublicBusiness } from "../../types/publicBusiness";

interface BoldTemplateProps {
  business: PublicBusiness;
}

function formatPrice(price: number | null | undefined) {
  if (price === null || price === undefined) {
    return "Price on request";
  }

  return `${price.toLocaleString()} ETB`;
}

export function BoldTemplate({
  business,
}: BoldTemplateProps) {
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

  return (
    <main
      className="min-h-screen bg-black text-white"
      style={
        {
          "--public-primary":
            business.primaryColor ?? "#ff4d00",
          "--public-secondary":
            business.secondaryColor ?? "#ffffff",
        } as React.CSSProperties
      }
    >
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/15 bg-black/70 backdrop-blur-2xl seba-glass">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-4">
            {business.logoUrl ? (
              <img
                src={business.logoUrl}
                alt={business.name}
                className="h-12 w-12 rounded-xl object-cover"
              />
            ) : (
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl text-lg font-black text-black"
                style={{
                  backgroundColor:
                    business.primaryColor ?? "#ff4d00",
                }}
              >
                {business.name.charAt(0)}
              </div>
            )}

            <div>
              <p className="font-black uppercase tracking-tight">
                {business.name}
              </p>

              {business.verified && (
                <p className="text-xs text-white/50">
                  ✓ Verified Business
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={async () => {
              if (navigator.share) {
                await navigator.share({
                  title: business.name,
                  url: window.location.href,
                });
              } else {
                await navigator.clipboard.writeText(
                  window.location.href
                );
              }
            }}
            className="rounded-xl border border-white/20 px-4 py-2 text-sm font-bold transition hover:bg-white hover:text-black"
          >
            ↗ Share
          </button>
        </div>
      </header>

      {/* Closed */}
      {business.temporarilyClosed && (
        <div
          className="px-6 py-5 text-center font-bold text-black"
          style={{
            backgroundColor:
              business.primaryColor ?? "#ff4d00",
          }}
        >
          ⚠ Currently Closed
          <span className="ml-2 font-normal">
            {business.temporaryCloseReason ??
              "This business is temporarily unavailable."}
          </span>
        </div>
      )}

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:py-32">
          {business.category && (
            <div
              className="mb-8 inline-block rounded-full px-4 py-2 text-xs font-black uppercase tracking-widest text-black"
              style={{
                backgroundColor:
                  business.primaryColor ?? "#ff4d00",
              }}
            >
              {business.category}
            </div>
          )}

          <h1 className="max-w-6xl text-6xl font-black uppercase leading-[0.82] tracking-[-0.06em] sm:text-8xl lg:text-[10rem]">
            {business.name}
          </h1>

          {business.description && (
            <p className="mt-10 max-w-2xl text-xl font-medium leading-8 text-white/65">
              {business.description}
            </p>
          )}

          <div className="mt-10 flex flex-wrap gap-4">
            {business.phone && (
              <a
                href={`tel:${business.phone}`}
                className="rounded-xl px-6 py-4 font-black text-black"
                style={{
                  backgroundColor:
                    business.primaryColor ?? "#ff4d00",
                }}
              >
                ☎ Call
              </a>
            )}

            {business.whatsapp && (
              <a
                href={`https://wa.me/${business.whatsapp.replace(
                  /\D/g,
                  ""
                )}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-white/20 px-6 py-4 font-black transition hover:bg-white hover:text-black"
              >
                💬 WhatsApp
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Info strip */}
      <section className="border-y border-white/15">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 py-8 sm:grid-cols-3">
          {address && (
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-white/40">
                Location
              </p>

              <p className="mt-2 font-bold">
                📍 {address}
              </p>
            </div>
          )}

          {business.phone && (
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-white/40">
                Phone
              </p>

              <p className="mt-2 font-bold">
                {business.phone}
              </p>
            </div>
          )}

          {business.email && (
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-white/40">
                Email
              </p>

              <p className="mt-2 break-all font-bold">
                {business.email}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Services */}
      {services.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-20 lg:py-28">
          <div className="mb-12 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <p
                className="text-sm font-black uppercase tracking-widest"
                style={{
                  color:
                    business.primaryColor ?? "#ff4d00",
                }}
              >
                Services
              </p>

              <h2 className="mt-3 text-5xl font-black uppercase tracking-tight sm:text-7xl">
                What we do
              </h2>
            </div>

            <span className="font-bold text-white/40">
              {services.length} services
            </span>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {services.map((service, index) => (
              <article
                key={service.id}
                className="group rounded-2xl border border-white/15 p-7 transition hover:-translate-y-1 hover:border-white/40"
              >
                <div className="flex items-start justify-between gap-5">
                  <span
                    className="text-sm font-black"
                    style={{
                      color:
                        business.primaryColor ??
                        "#ff4d00",
                    }}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <span className="rounded-full border border-white/15 px-3 py-1 text-sm font-bold">
                    {formatPrice(service.price)}
                  </span>
                </div>

                <h3 className="mt-8 text-3xl font-black uppercase">
                  {service.name}
                </h3>

                {service.description && (
                  <p className="mt-3 leading-7 text-white/55">
                    {service.description}
                  </p>
                )}

                {service.durationMinutes && (
                  <p className="mt-5 text-xs font-black uppercase tracking-widest text-white/40">
                    ⏱ {service.durationMinutes} minutes
                  </p>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Products */}
      {products.length > 0 && (
        <section className="border-t border-white/15 bg-white text-black">
          <div className="mx-auto max-w-7xl px-6 py-20 lg:py-28">
            <p
              className="text-sm font-black uppercase tracking-widest"
              style={{
                color:
                  business.primaryColor ?? "#ff4d00",
              }}
            >
              Products
            </p>

            <h2 className="mt-3 text-5xl font-black uppercase tracking-tight sm:text-7xl">
              Shop
            </h2>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <article
                  key={product.id}
                  className="overflow-hidden rounded-2xl border border-black/10"
                >
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="aspect-square w-full object-cover" loading="lazy" decoding="async"
                    />
                  ) : (
                    <div className="aspect-square bg-black/5" />
                  )}

                  <div className="p-6">
                    <div className="flex justify-between gap-4">
                      <h3 className="text-xl font-black uppercase">
                        {product.name}
                      </h3>

                      <span className="font-black">
                        {formatPrice(product.price)}
                      </span>
                    </div>

                    {product.description && (
                      <p className="mt-3 text-sm text-black/50">
                        {product.description}
                      </p>
                    )}

                    <p
                      className={`mt-5 text-xs font-black uppercase tracking-widest ${
                        product.inStock
                          ? "text-black/50"
                          : "text-red-600"
                      }`}
                    >
                      {product.inStock
                        ? "Available"
                        : "Out of Stock"}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Map */}
      {(address || mapUrl) && (
        <section className="border-t border-white/15">
          <div className="mx-auto max-w-7xl px-6 py-20">
            <p className="text-sm font-black uppercase tracking-widest text-white/40">
              Location
            </p>

            <h2 className="mt-3 text-5xl font-black uppercase">
              Come find us
            </h2>

            {address && (
              <p className="mt-6 text-lg font-bold">
                📍 {address}
              </p>
            )}

            {mapUrl && (
              <a
                href={mapUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-8 inline-block rounded-xl px-7 py-4 font-black text-black"
                style={{
                  backgroundColor:
                    business.primaryColor ?? "#ff4d00",
                }}
              >
                Get Directions →
              </a>
            )}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-white/15">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-12 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-black uppercase">
              {business.name}
            </p>

            {address && (
              <p className="mt-2 text-sm text-white/40">
                {address}
              </p>
            )}
          </div>

          <p className="text-xs font-bold uppercase tracking-widest text-white/30">
            Powered by SEBA
          </p>
        </div>
      </footer>
    </main>
  );
}