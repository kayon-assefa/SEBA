// File: src/features/onboarding/components/AuthCard.tsx
// (adjust the import path below if this file lives elsewhere in your auth flow)
import type { ReactNode } from "react";
import LanguageToggle from "./LanguageToggle";

export default function AuthCard({
  children,
  title,
  subtitle,
}: {
  children: ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="relative w-full max-w-md">
      {/* Local keyframes so AuthCard's shapes animate wherever it's used */}
      <style>{`
        @keyframes seba-breathe {
          0%, 100% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(1.12); opacity: 1; }
        }
        @keyframes seba-breathe-soft {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.08); opacity: 0.95; }
        }
        @keyframes seba-glow-coral {
          0%, 100% { filter: drop-shadow(0 0 6px rgba(242,95,92,0.25)); }
          50% { filter: drop-shadow(0 0 22px rgba(242,95,92,0.55)); }
        }
        @keyframes seba-glow-gold {
          0%, 100% { filter: drop-shadow(0 0 5px rgba(217,164,65,0.25)); }
          50% { filter: drop-shadow(0 0 18px rgba(217,164,65,0.5)); }
        }
        @keyframes seba-glow-burgundy {
          0%, 100% { filter: drop-shadow(0 0 6px rgba(122,38,58,0.2)); }
          50% { filter: drop-shadow(0 0 20px rgba(122,38,58,0.45)); }
        }
        @keyframes seba-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-14px); }
        }
        @keyframes seba-float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes seba-spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes seba-mark-glow {
          0%, 100% { box-shadow: 0 0 0px rgba(242,95,92,0); }
          50% { box-shadow: 0 0 32px 4px rgba(242,95,92,0.35); }
        }

        .seba-breathe { animation: seba-breathe 5s ease-in-out infinite, seba-glow-coral 5s ease-in-out infinite; }
        .seba-breathe-soft { animation: seba-breathe-soft 6.5s ease-in-out infinite, seba-glow-gold 6.5s ease-in-out infinite; }
        .seba-breathe-burgundy { animation: seba-breathe-soft 7.5s ease-in-out infinite, seba-glow-burgundy 7.5s ease-in-out infinite; }
        .seba-float { animation: seba-float 6s ease-in-out infinite; }
        .seba-float-slow { animation: seba-float-slow 8s ease-in-out infinite; }
        .seba-spin-slow { animation: seba-spin-slow 16s linear infinite; }
        .seba-mark-glow { animation: seba-mark-glow 4s ease-in-out infinite; }

        @media (prefers-reduced-motion: reduce) {
          .seba-breathe, .seba-breathe-soft, .seba-breathe-burgundy,
          .seba-float, .seba-float-slow, .seba-spin-slow, .seba-mark-glow {
            animation: none;
          }
        }
      `}</style>

      {/* ===== Decorative geometric shapes, inspired by the SEBA logo grid ===== */}

      {/* Top-left: hollow ring, breathing + coral glow */}
      <div className="pointer-events-none absolute -left-14 -top-12 h-24 w-24 rounded-full border-[6px] border-[#F25F5C]/25 seba-breathe" />

      {/* Top-right: quarter-circle "petal", soft gold breathing */}
      <div className="pointer-events-none absolute -right-10 -top-6 h-20 w-20 rounded-tl-[999px] bg-[#F25F5C]/12 seba-breathe-soft seba-float" />

      {/* Right side: filled circle, burgundy glow */}
      <div className="pointer-events-none absolute -right-9 top-28 h-16 w-16 rounded-full bg-[#7A263A]/12 seba-breathe-burgundy" />

      {/* Bottom-left: rounded square, coral breathing */}
      <div className="pointer-events-none absolute -bottom-8 -left-8 h-16 w-16 rounded-[18px] bg-[#F25F5C]/10 seba-breathe seba-float-slow" />

      {/* Bottom center-left: small solid dot, gold glow */}
      <div className="pointer-events-none absolute -bottom-4 left-24 h-9 w-9 rounded-full bg-[#D9A441]/25 seba-breathe-soft" />

      {/* Bottom-right: spinning triangle, subtle burgundy tint */}
      <div
        className="pointer-events-none absolute -bottom-10 right-10 h-0 w-0 seba-spin-slow seba-breathe-burgundy"
        style={{
          borderLeft: "12px solid transparent",
          borderRight: "12px solid transparent",
          borderBottom: "20px solid rgba(122,38,58,0.3)",
        }}
      />

      {/* Ambient diffuse glow blobs, very soft, sit furthest back */}
      <div className="pointer-events-none absolute -left-20 top-10 -z-10 h-40 w-40 rounded-full bg-[#F25F5C]/10 blur-3xl seba-breathe-soft" />
      <div className="pointer-events-none absolute -right-16 bottom-0 -z-10 h-36 w-36 rounded-full bg-[#D9A441]/10 blur-3xl seba-breathe-soft" />

      {/* ===== Top bar: wordmark + language toggle ===== */}
      <div className="relative flex items-center justify-between">
        <div className="relative">
          <div className="absolute inset-0 -z-10 rounded-[14px] seba-mark-glow" />
          <div className="flex items-center gap-0.5 rounded-[14px] bg-[#F25F5C] px-3.5 py-2 shadow-[0_6px_18px_rgba(242,95,92,0.35)]">
            <span className="text-lg font-black tracking-tight text-[#1A1A1A]">
              SEBA
            </span>
            <span className="mb-0.5 h-1.5 w-1.5 self-end rounded-full bg-[#1A1A1A]" />
          </div>
        </div>

        <LanguageToggle />
      </div>

      <h2 className="relative mt-6 text-4xl font-black tracking-tight text-[#1E1E1E]">
        {title}
      </h2>
      <p className="relative mt-3 text-[#6B4D4A]">{subtitle}</p>

      <div className="relative mt-8 rounded-[28px] border border-white/60 bg-white/85 p-8 shadow-[0_30px_60px_-24px_rgba(139,30,45,0.28)] backdrop-blur-xl">
        {children}
      </div>
    </div>
  );
}