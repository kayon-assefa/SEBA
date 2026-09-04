import { useEffect } from "react";
import type { PublicBusiness } from "../types/publicBusiness";

function upsertMeta(name: string, content: string) {
  let tag = document.head.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!tag) {
    tag = document.createElement("meta");
    tag.name = name;
    document.head.appendChild(tag);
  }
  tag.content = content;
}

export function PublicBusinessSeo({ business }: { business: PublicBusiness }) {
  useEffect(() => {
    const previousTitle = document.title;
    const description = business.description || `${business.name} on SEBA.`;
    const url = window.location.href;

    document.title = `${business.name}${business.category ? ` — ${business.category}` : ""} | SEBA`;
    upsertMeta("description", description.slice(0, 160));
    upsertMeta("robots", business.active && business.published ? "index,follow" : "noindex,nofollow");

    let canonical = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = url;

    let jsonLd = document.getElementById("seba-business-jsonld");
    if (!jsonLd) {
      jsonLd = document.createElement("script");
      jsonLd.id = "seba-business-jsonld";
      jsonLd.setAttribute("type", "application/ld+json");
      document.head.appendChild(jsonLd);
    }
    jsonLd.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      name: business.name,
      description,
      url,
      image: business.logoUrl || business.theme.coverImage || undefined,
      telephone: business.phone || undefined,
      address: business.location?.address || business.location?.city ? {
        "@type": "PostalAddress",
        streetAddress: business.location?.address || undefined,
        addressLocality: business.location?.city || undefined,
      } : undefined,
      sameAs: Object.values(business.theme.social).filter(Boolean),
    });

    return () => {
      document.title = previousTitle;
    };
  }, [business]);

  return null;
}
