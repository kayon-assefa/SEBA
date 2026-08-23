// File: src/features/Dashboard/components/BusinessStatus.tsx
// Clear green/red live status (no pulsing animation — just an unambiguous
// color read). Share buttons now look like real app icons (squircle,
// brand-colored, white glyph) instead of plain circles.

import { useState } from "react";
import toast from "react-hot-toast";
import { Copy, ExternalLink, QrCode, MessageCircle, Send } from "lucide-react";
import { ShareFill } from "react-bootstrap-icons";
import GlassCard from "./GlassCard";

type Props = {
  businessName: string;
  username: string;
  isLive: boolean;
};

export default function BusinessStatus({
  businessName,
  username,
  isLive,
}: Props) {
  const [showQr, setShowQr] = useState(false);
  const website = `https://seba.app/${username}`;
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=8&color=241413&bgcolor=FFF2E6&data=${encodeURIComponent(
    website
  )}`;

  function copyLink() {
    navigator.clipboard.writeText(website);
    toast.success("Link copied to clipboard", {
      style: { borderRadius: "12px", background: "#241413", color: "#fff" },
      iconTheme: { primary: "#D9A441", secondary: "#fff" },
    });
  }

  async function sharePage() {
    if (navigator.share) {
      await navigator.share({ title: businessName, text: `Check out ${businessName} on SEBA`, url: website });
      return;
    }
    copyLink();
  }

  const shareTargets = [
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodeURIComponent(
        `Check out ${businessName} on SEBA: ${website}`
      )}`,
      bg: "linear-gradient(145deg, #33D06B, #1FA855)",
      icon: <MessageCircle size={20} fill="white" strokeWidth={0} />,
    },
    {
      label: "Telegram",
      href: `https://t.me/share/url?url=${encodeURIComponent(
        website
      )}&text=${encodeURIComponent(`Check out ${businessName} on SEBA`)}`,
      bg: "linear-gradient(145deg, #4FC3F7, #229ED9)",
      icon: <Send size={18} />,
    },
    {
      label: "X",
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        `Check out ${businessName} on SEBA`
      )}&url=${encodeURIComponent(website)}`,
      bg: "linear-gradient(145deg, #3a3a3a, #000000)",
      icon: (
        <span className="text-[15px] font-black leading-none">𝕏</span>
      ),
    },
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        website
      )}`,
      bg: "linear-gradient(145deg, #4293F5, #1565D8)",
      icon: <span className="text-lg font-bold leading-none">f</span>,
    },
  ];

  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              isLive ? "bg-emerald-500" : "bg-red-500"
            }`}
          />
          <h2 className="text-sm font-bold text-[#241413]">
            Business Status
          </h2>
        </div>

        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
            isLive
              ? "bg-emerald-500/10 text-emerald-700"
              : "bg-red-500/10 text-red-700"
          }`}
        >
          {isLive ? "Live" : "Offline"}
        </span>
      </div>

      <p className="mt-4 break-words font-semibold text-[#241413]">{businessName}</p>
      <p className="mt-1 truncate text-sm text-[#B4A29C]">{website}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => window.open(website, "_blank")}
          className="seba-press seba-ripple flex items-center gap-2 rounded-xl border border-[#F0E3DE] bg-white px-3 py-2 text-xs font-semibold text-[#241413] hover:border-[#D9A441]"
        >
          <ExternalLink size={14} />
          Visit
        </button>

        <button
          onClick={copyLink}
          className="seba-press seba-ripple flex items-center gap-2 rounded-xl border border-[#F0E3DE] bg-white px-3 py-2 text-xs font-semibold text-[#241413] hover:border-[#D9A441]"
        >
          <Copy size={14} />
          Copy Link
        </button>

        <button
          onClick={() => setShowQr((v) => !v)}
          className="seba-press seba-ripple flex items-center gap-2 rounded-xl border border-[#F0E3DE] bg-white px-3 py-2 text-xs font-semibold text-[#241413] hover:border-[#D9A441]"
        >
          <QrCode size={14} />
          {showQr ? "Hide QR" : "QR Code"}
        </button>
        <button
          onClick={() => void sharePage()}
          className="seba-press seba-ripple flex items-center gap-2 rounded-xl border border-[#F0E3DE] bg-white px-3 py-2 text-xs font-semibold text-[#241413] hover:border-[#D9A441]"
        >
          <ShareFill size={14} />
          Share
        </button>
      </div>

      {showQr && (
        <div className="seba-rise mt-4 flex items-center gap-4 rounded-2xl border border-[#F0E3DE] bg-white/70 p-4">
          <img
            src={qrSrc}
            alt={`QR code linking to ${website}`}
            width={96}
            height={96}
            className="rounded-lg"
          />
          <p className="text-xs text-[#6B5A56]">
            Scan to open your storefront on any phone.
          </p>
        </div>
      )}

      <div className="mt-5 border-t border-[#F0E3DE] pt-4">
        <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-[#B4A29C]">
          Share your page
        </p>
        <div className="flex flex-wrap gap-2.5">
          {shareTargets.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Share on ${s.label}`}
              className="seba-app-icon seba-press"
              style={{ background: s.bg }}
            >
              {s.icon}
            </a>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}
