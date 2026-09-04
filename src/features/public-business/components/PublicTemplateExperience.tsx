import { useEffect, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import type { PublicBusiness } from "../types/publicBusiness";

export function PublicTemplateExperience({ business, children }: { business: PublicBusiness; children: ReactNode }) {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 500);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const canBook = business.businessType === "appointment" && business.services.length > 0 && !business.appointmentsPaused && !business.temporarilyClosed;
  const canShop = business.businessType === "shop" && business.products.length > 0 && !business.ordersPaused && !business.temporarilyClosed;

  return (
    <div className="seba-public-template min-h-screen" style={{ "--seba-primary": business.primaryColor || "#111" } as CSSProperties}>
      <style>{`\n        .seba-public-template{--seba-glass:rgba(255,255,255,.72)}\n        .seba-public-template img{content-visibility:auto}\n        .seba-public-template a,.seba-public-template button{transition:transform .2s ease,box-shadow .2s ease,opacity .2s ease}\n        .seba-public-template a:focus-visible,.seba-public-template button:focus-visible{outline:3px solid color-mix(in srgb,var(--seba-primary),white 35%);outline-offset:3px}\n        @media (prefers-reduced-motion:reduce){.seba-public-template *{scroll-behavior:auto!important;transition:none!important;animation:none!important}}\n        .seba-glass{background:var(--seba-glass);backdrop-filter:blur(22px) saturate(150%);-webkit-backdrop-filter:blur(22px) saturate(150%);border:1px solid rgba(255,255,255,.65);box-shadow:0 18px 50px rgba(0,0,0,.08)}\n      `}</style>
      {children}

      {(canBook || canShop) && (
        <nav aria-label="Quick actions" className="fixed inset-x-3 bottom-3 z-[60] mx-auto flex max-w-md items-center gap-2 rounded-2xl p-2 seba-glass md:hidden">
          <a href={`/${business.username}`} className="flex-1 rounded-xl px-3 py-3 text-center text-xs font-bold">Home</a>
          {canBook && <a href={`/${business.username}/book`} className="flex-[1.4] rounded-xl px-3 py-3 text-center text-xs font-black text-white shadow-lg" style={{background: business.primaryColor}}>Book</a>}
          {canShop && <a href={`/${business.username}/shop`} className="flex-[1.4] rounded-xl px-3 py-3 text-center text-xs font-black text-white shadow-lg" style={{background: business.primaryColor}}>Shop</a>}
        </nav>
      )}

      {showTop && <button aria-label="Back to top" onClick={() => window.scrollTo({top:0, behavior:"smooth"})} className="fixed bottom-20 right-5 z-50 hidden h-11 w-11 items-center justify-center rounded-full bg-black text-white shadow-xl md:flex">↑</button>}
    </div>
  );
}
