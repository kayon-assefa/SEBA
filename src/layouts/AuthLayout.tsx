// File: src/features/onboarding/components/AuthLayout.tsx
import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  // AuthShell already owns the complete split-screen layout. Returning the
  // outlet directly avoids rendering this legacy marketing panel as a third
  // column beside it.
  return <Outlet />;

  return (
    <div className="min-h-screen flex">
      {/* Local keyframes for the animated shape grid */}
      <style>{`
        @keyframes seba-breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.07); }
        }
        @keyframes seba-breathe-soft {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes seba-glow-pink {
          0%, 100% { filter: drop-shadow(0 0 0px rgba(255,179,170,0)); }
          50% { filter: drop-shadow(0 0 26px rgba(255,179,170,0.65)); }
        }
        @keyframes seba-glow-gold {
          0%, 100% { filter: drop-shadow(0 0 0px rgba(217,164,65,0)); }
          50% { filter: drop-shadow(0 0 22px rgba(217,164,65,0.5)); }
        }
        @keyframes seba-spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes seba-mark-glow {
          0%, 100% { filter: drop-shadow(0 0 0px rgba(0,0,0,0)); }
          50% { filter: drop-shadow(0 6px 30px rgba(0,0,0,0.35)); }
        }

        .seba-breathe { animation: seba-breathe 5s ease-in-out infinite, seba-glow-pink 5s ease-in-out infinite; }
        .seba-breathe-delay1 { animation: seba-breathe 5s ease-in-out infinite, seba-glow-pink 5s ease-in-out infinite; animation-delay: 0.8s; }
        .seba-breathe-delay2 { animation: seba-breathe 5s ease-in-out infinite, seba-glow-pink 5s ease-in-out infinite; animation-delay: 1.6s; }
        .seba-breathe-soft { animation: seba-breathe-soft 6.5s ease-in-out infinite, seba-glow-gold 6.5s ease-in-out infinite; }
        .seba-breathe-soft-delay { animation: seba-breathe-soft 6.5s ease-in-out infinite, seba-glow-gold 6.5s ease-in-out infinite; animation-delay: 1.2s; }
        .seba-spin-slow { animation: seba-spin-slow 24s linear infinite; }
        .seba-mark-glow { animation: seba-mark-glow 5s ease-in-out infinite; }

        @media (prefers-reduced-motion: reduce) {
          .seba-breathe, .seba-breathe-delay1, .seba-breathe-delay2,
          .seba-breathe-soft, .seba-breathe-soft-delay,
          .seba-spin-slow, .seba-mark-glow {
            animation: none;
          }
        }
      `}</style>

      {/* Left Side */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-[#D6371C] text-white items-center justify-center">
        {/* ===== Shape collage layer ===== */}
        <div className="absolute inset-0">
          {/* top-left large circle */}
          <div className="absolute -left-6 -top-6 h-40 w-40 rounded-full bg-[#FFB3AA] seba-breathe" />

          {/* top area: rounded capsule / pill, tall */}
          <div className="absolute left-[38%] -top-4 h-52 w-28 rounded-t-[999px] bg-[#FFB3AA] seba-breathe-soft" />

          {/* top-right diagonal wedge */}
          <div
            className="absolute right-0 top-0 h-56 w-56 bg-[#FFB3AA] seba-breathe-soft-delay"
            style={{ clipPath: "polygon(100% 0, 100% 100%, 0 0)" }}
          />

          {/* mid-left small square */}
          <div className="absolute left-[6%] top-[38%] h-10 w-10 rounded-[10px] bg-[#FFB3AA] seba-breathe-delay1" />

          {/* behind-wordmark soft circle, peeking */}
          <div className="absolute left-[46%] top-[40%] h-44 w-44 -translate-x-1/2 rounded-full bg-[#FFB3AA]/90 seba-breathe" />

          {/* small dot after wordmark, like the logo's period */}
          <div className="absolute right-[9%] top-[52%] h-9 w-9 rounded-full bg-[#FFB3AA] seba-breathe-delay2" />

          {/* lower-left cut-off half circle */}
          <div className="absolute -left-10 bottom-0 h-32 w-32 rounded-full bg-[#FFB3AA] seba-breathe-soft" />

          {/* lower-left-center full circle */}
          <div className="absolute left-[20%] bottom-2 h-36 w-36 rounded-full bg-[#FFB3AA] seba-breathe" />

          {/* lower-right capsule, cut at bottom */}
          <div className="absolute right-[10%] bottom-0 h-40 w-24 rounded-t-[999px] bg-[#FFB3AA] seba-breathe-soft-delay" />

          {/* bottom-right small square */}
          <div className="absolute right-[6%] bottom-[22%] h-9 w-9 rounded-[8px] bg-[#FFB3AA] seba-breathe-delay1" />

          {/* rotating triangle accent, subtle gold */}
          <div
            className="absolute right-[22%] bottom-[10%] h-0 w-0 seba-spin-slow"
            style={{
              borderLeft: "16px solid transparent",
              borderRight: "16px solid transparent",
              borderBottom: "28px solid #D9A441",
              opacity: 0.55,
            }}
          />

          {/* ambient glow blobs, well behind everything */}
          <div className="absolute -left-16 top-1/3 -z-10 h-72 w-72 rounded-full bg-[#FFB3AA]/25 blur-3xl seba-breathe-soft" />
          <div className="absolute right-0 bottom-0 -z-10 h-64 w-64 rounded-full bg-[#D9A441]/20 blur-3xl seba-breathe-soft-delay" />
        </div>

        {/* ===== Foreground content ===== */}
        <div className="relative z-10 max-w-md px-10">
          <h1 className="flex items-end gap-2 text-8xl font-black leading-none tracking-tight text-[#111111] seba-mark-glow">
            SEBA
            <span className="mb-4 h-4 w-4 rounded-full bg-[#111111]" />
          </h1>

          <p className="mt-10 text-2xl leading-relaxed text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.25)]">
            Discover trusted businesses.
            Connect with your community.
            Grow together.
          </p>

          <div className="mt-10 rounded-3xl bg-black/15 p-6 backdrop-blur">
            <p className="text-lg !text-white">
              Ethiopia's modern business discovery platform.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex flex-1 items-center justify-center p-6">
        <Outlet />
      </div>
    </div>
  );
}
