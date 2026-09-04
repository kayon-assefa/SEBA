import type { PublicBusiness } from "../types/publicBusiness";

interface PublicBusinessUnavailableProps {
  business?: Pick<PublicBusiness, "name" | "logoUrl"> | null;
}

export function PublicBusinessUnavailable({ business }: PublicBusinessUnavailableProps) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f6f7f8] px-6 text-[#171717]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,.95),transparent_55%)]" />
      <div className="relative w-full max-w-md rounded-[32px] border border-white/80 bg-white/75 p-8 text-center shadow-[0_24px_80px_rgba(0,0,0,.08)] backdrop-blur-2xl">
        {business?.logoUrl ? (
          <img src={business.logoUrl} alt={business.name} className="mx-auto mb-5 h-20 w-20 rounded-2xl object-cover shadow-lg" />
        ) : (
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-black text-2xl font-black text-white">
            {business?.name?.charAt(0)?.toUpperCase() || "S"}
          </div>
        )}
        <p className="text-xs font-bold uppercase tracking-[.22em] text-black/45">SEBA Business</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight">Business unavailable</h1>
        {business?.name && <p className="mt-2 text-sm font-semibold text-black/55">{business.name}</p>}
        <p className="mt-4 text-sm leading-6 text-black/55">This business page is temporarily unavailable. Please check back later.</p>
      </div>
    </main>
  );
}
