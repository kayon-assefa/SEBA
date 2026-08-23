// File: src/features/Dashboard/components/BusinessFlyer.tsx
// A printable, cream/white promotional flyer — abstract coral/gold shapes
// (echoing the SEBA brand kit), QR code, business name + tagline. "Print"
// uses the browser's print dialog scoped to just this card (see the
// `@media print` rule in styles/dashboard-theme.css), so no extra
// dependency is needed to get a clean printable page or "save as PDF".

import { Printer, Download } from "lucide-react";
import GlassCard from "./GlassCard";

type Props = {
  businessName: string;
  username: string;
};

export default function BusinessFlyer({ businessName, username }: Props) {
  const website = `https://seba.app/${username}`;
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=10&color=241413&bgcolor=FFFDFB&data=${encodeURIComponent(
    website
  )}`;

  return (
    <GlassCard className="p-6" hover={false}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="min-w-0 text-sm font-bold text-[#241413]">Printable Flyer</h2>
        <div className="flex shrink-0 gap-2">
          <a
            href={qrSrc}
            download={`${username}-qr.png`}
            className="seba-press flex h-8 w-8 items-center justify-center rounded-lg border border-[#F0E3DE] bg-white text-[#6B5A56] hover:border-[#D9A441]"
            aria-label="Download QR code"
          >
            <Download size={14} />
          </a>
          <button
            onClick={() => window.print()}
            className="seba-press flex h-8 w-8 items-center justify-center rounded-lg border border-[#F0E3DE] bg-white text-[#6B5A56] hover:border-[#D9A441]"
            aria-label="Print flyer"
          >
            <Printer size={14} />
          </button>
        </div>
      </div>

      {/* The flyer itself */}
      <div
        id="seba-flyer"
        className="relative mt-4 overflow-hidden rounded-2xl border border-[#F0E3DE]"
        style={{ background: "linear-gradient(160deg, #FFFDFB 0%, #FFF2E6 100%)" }}
      >
        {/* Abstract brand shapes */}
        <div
          className="absolute -left-10 -top-10 h-40 w-40 rounded-full opacity-70"
          style={{ background: "radial-gradient(circle, #FFB8A8 0%, rgba(255,184,168,0) 70%)" }}
        />
        <div
          className="absolute -right-8 top-6 h-28 w-28 rounded-[40%_60%_60%_40%/50%_40%_60%_50%]"
          style={{ background: "linear-gradient(135deg, #FF7A6E, #FF5A5F)", opacity: 0.85 }}
        />
        <div
          className="absolute -bottom-12 -right-12 h-44 w-44 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(217,164,65,0.35) 0%, rgba(217,164,65,0) 70%)" }}
        />
        <div className="absolute bottom-8 left-8 h-6 w-6 rounded-full bg-[#D9A441]" />

        <div className="relative z-[1] flex flex-col items-center gap-4 px-8 py-10 text-center">
          <div>
            <h3 className="break-words text-xl font-extrabold text-[#241413]">
              {businessName}
            </h3>
            <p className="mt-1 text-sm font-medium text-[#B4841F]">
              Book. Manage. Grow.
            </p>
          </div>

          <div className="rounded-2xl border border-white bg-white/80 p-3 shadow-sm backdrop-blur-sm">
            <img
              src={qrSrc}
              alt={`QR code linking to ${website}`}
              width={140}
              height={140}
              className="rounded-lg"
            />
          </div>

          <p className="max-w-xs text-xs text-[#6B5A56]">
            Scan the code to book with us online — @{username}
          </p>
        </div>
      </div>
    </GlassCard>
  );
}
