import type { PublicBusiness } from "../../types/publicBusiness";

interface EditorialTemplateProps {
  business: PublicBusiness;
}

function formatPrice(price: number | null | undefined) {
  if (price === null || price === undefined) {
    return "Price on request";
  }

  return `${price.toLocaleString()} ETB`;
}

export function EditorialTemplate({
  business,
}: EditorialTemplateProps) {
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
      className="min-h-screen bg-[#f5f1ea] text-[#241f1b]"
      style={
        {
          "--public-primary":
            business.primaryColor ?? "#241f1b",
        } as React.CSSProperties
      }
    >
      {/* Top bar */}
      <div className="sticky top-0 z-50 border-b border-black/10 bg-[#f5f1ea]/75 backdrop-blur-2xl seba-glass">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 text-xs uppercase tracking-[0.18em]">
          <span>SEBA</span>

          <span>
            {business.category ?? "Business"}
          </span>
        </div>
      </div>

      {/* Closed */}
      {business.temporarilyClosed && (
        <div className="bg-[#241f1b] px-6 py-4 text-center text-sm text-white">
          <strong>Currently Closed</strong>
          <span className="ml-2 opacity-80">
            {business.temporaryCloseReason ??
              "This business is temporarily unavailable."}
          </span>
        </div>
      )}

      {/* Editorial hero */}
      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[1.2fr_0.8fr] lg:items-end lg:py-28">
        <div>
          {business.verified && (
            <p className="mb-8 text-xs uppercase tracking-[0.25em]">
              ✓ Verified Business
            </p>
          )}

          <h1 className="max-w-5xl text-6xl font-serif leading-[0.9] tracking-[-0.04em] sm:text-8xl">
            {business.name}
          </h1>

          {business.description && (
            <p className="mt-10 max-w-2xl text-xl leading-8 text-black/60">
              {business.description}
            </p>
          )}
        </div>

        {business.logoUrl && (
          <div className="lg:justify-self-end">
            <img
              src={business.logoUrl}
              alt={business.name}
              className="h-48 w-48 object-cover grayscale"
            />
          </div>
        )}
      </section>

      {/* Information */}
      <section className="border-y border-black/10">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-8 text-sm sm:grid-cols-3">
          {address && (
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.15em] opacity-50">
                Location
              </p>
              <p>{address}</p>
            </div>
          )}

          {business.phone && (
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.15em] opacity-50">
                Contact
              </p>

              <a href={`tel:${business.phone}`}>
                {business.phone}
              </a>
            </div>
          )}

          {business.email && (
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.15em] opacity-50">
                Email
              </p>

              <a href={`mailto:${business.email}`}>
                {business.email}
              </a>
            </div>
          )}
        </div>
      </section>

      {/* Services */}
      {services.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-20 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-[0.35fr_0.65fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] opacity-50">
                Services
              </p>

              <h2 className="mt-4 font-serif text-5xl leading-none">
                Our work
              </h2>
            </div>

            <div>
              {services.map((service, index) => (
                <article
                  key={service.id}
                  className="border-t border-black/15 py-7"
                >
                  <div className="flex gap-6">
                    <span className="text-sm opacity-40">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <div className="flex-1">
                      <div className="flex flex-col justify-between gap-3 sm:flex-row">
                        <h3 className="font-serif text-2xl">
                          {service.name}
                        </h3>

                        <span className="text-sm">
                          {formatPrice(service.price)}
                        </span>
                      </div>

                      {service.description && (
                        <p className="mt-3 max-w-xl text-sm leading-6 text-black/55">
                          {service.description}
                        </p>
                      )}

                      {service.durationMinutes && (
                        <p className="mt-3 text-xs uppercase tracking-wider opacity-40">
                          {service.durationMinutes} minutes
                        </p>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Products */}
      {products.length > 0 && (
        <section className="border-t border-black/10 px-6 py-20 lg:py-28">
          <div className="mx-auto max-w-7xl">
            <p className="text-xs uppercase tracking-[0.2em] opacity-50">
              Collection
            </p>

            <h2 className="mt-4 font-serif text-5xl">
              Products
            </h2>

            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <article key={product.id}>
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="aspect-[4/5] w-full object-cover"
                    />
                  ) : (
                    <div className="aspect-[4/5] w-full bg-black/5" />
                  )}

                  <div className="pt-5">
                    <div className="flex justify-between gap-4">
                      <h3 className="font-serif text-xl">
                        {product.name}
                      </h3>

                      <span className="text-sm">
                        {formatPrice(product.price)}
                      </span>
                    </div>

                    {product.description && (
                      <p className="mt-2 text-sm text-black/50">
                        {product.description}
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Location */}
      {(address || mapUrl) && (
        <section className="border-t border-black/10">
          <div className="mx-auto max-w-7xl px-6 py-20">
            <p className="text-xs uppercase tracking-[0.2em] opacity-50">
              Visit
            </p>

            <h2 className="mt-4 font-serif text-4xl">
              Find us
            </h2>

            {address && (
              <p className="mt-5 text-black/60">
                {address}
              </p>
            )}

            {mapUrl && (
              <a
                href={mapUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-block border border-black px-6 py-3 text-xs uppercase tracking-wider transition hover:bg-black hover:text-white"
              >
                Get Directions
              </a>
            )}
          </div>
        </section>
      )}

      <footer className="border-t border-black/10">
        <div className="mx-auto flex max-w-7xl justify-between px-6 py-10 text-xs uppercase tracking-[0.15em] opacity-50">
          <span>{business.name}</span>
          <span>Powered by SEBA</span>
        </div>
      </footer>
    </main>
  );
}