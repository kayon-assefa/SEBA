import { useEffect, useRef, useState, type ReactNode } from "react";

/* ---------- tiny local Reveal (no external import needed) ---------- */
interface RevealProps {
  children: ReactNode;
  delay?: number;
}

function Reveal({ children, delay = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]: IntersectionObserverEntry[]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setShown(true), delay);
          obs.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      className="transition-all duration-700 ease-out"
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "translateY(0px)" : "translateY(24px)",
      }}
    >
      {children}
    </div>
  );
}

/* ---------- brand tokens ---------- */
// Coral Red #FF5A5F · Deep Burgundy #8B1E2D · Gold #D9A441 · Cream #FFF2E6 · White #FFFFFF

export default function FinalCTA() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#FF5A5F] to-[#8B1E2D] py-28 text-white">
      {/* gentle float keyframes, respects reduced-motion — shared visual language with the other sections */}
      <style>{`
        @keyframes seba-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-16px); }
        }
        @keyframes seba-float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(12px) rotate(6deg); }
        }
        .seba-float { animation: seba-float 6s ease-in-out infinite; }
        .seba-float-slow { animation: seba-float-slow 9s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .seba-float, .seba-float-slow { animation: none; }
        }
      `}</style>

      {/* --- ambient brand shapes --- */}
      <div className="pointer-events-none absolute -left-24 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-black/10" />
      <div className="pointer-events-none absolute left-[12%] bottom-8 h-8 w-8 rounded-full bg-[#FFF2E6]/50 seba-float-slow" />
      <div className="pointer-events-none absolute right-[22%] top-12 h-6 w-6 rounded-tr-[16px] rounded-bl-[16px] bg-white/25 seba-float" />

      {/* signature gold seal — echoes the accent used once per section throughout the site */}
      <div className="seba-float pointer-events-none absolute bottom-10 right-16 h-12 w-12 rounded-full bg-[#D9A441] shadow-lg shadow-black/20" />

      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <Reveal>
          <h2 className="text-4xl font-black leading-tight tracking-tight text-[#FFF2E6] lg:text-6xl">
            Ready to find your
            <br /> next favorite place?
          </h2>
          <p className="mx-auto mt-6 max-w-lg text-lg !text-white">
            Thousands of verified businesses are one search away.
          </p>
          <button className="mt-10 rounded-full bg-white px-10 py-4 font-bold text-[#8B1E2D] transition-all hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-black/20">
            Explore businesses
          </button>
        </Reveal>
      </div>
    </section>
  );
}