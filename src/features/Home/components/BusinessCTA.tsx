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

const stats: [string, string][] = [
  ["Free", "To get listed"],
  ["5 min", "Setup time"],
];

export default function BusinessCTA() {
  return (
    <section className="relative overflow-hidden bg-[#FFF2F2] py-28">
      {/* gentle float keyframes, respects reduced-motion */}
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

      {/* --- ambient brand shapes scattered across the whole section --- */}
      <div className="pointer-events-none absolute -left-20 top-10 h-64 w-64 rounded-full bg-[#FF5A5F]/10 blur-sm" />
      <div className="pointer-events-none absolute -bottom-24 left-[6%] h-40 w-40 rounded-tr-[80px] rounded-bl-[30px] bg-[#8B1E2D]/10" />
      <div className="pointer-events-none absolute right-[8%] top-6 h-10 w-10 rounded-full bg-[#D9A441]/60 seba-float" />
      <div className="pointer-events-none absolute bottom-16 right-[28%] h-6 w-6 rounded-full bg-[#FF5A5F]/40 seba-float-slow" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-6 lg:grid-cols-2">
        <Reveal>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#8B1E2D]">
            For business owners
          </p>
          <h2 className="mt-4 text-4xl font-black leading-tight tracking-tight text-[#241210] lg:text-5xl">
            Your customers are already searching.
          </h2>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-[#6B4D4A]">
            Join SEBA and put your business in front of thousands of people
            looking for exactly what you offer &mdash; today.
          </p>
          <button className="mt-9 rounded-full bg-[#FF5A5F] px-10 py-4 font-bold text-white transition-all hover:bg-[#E64A50] hover:shadow-xl hover:shadow-[#FF5A5F]/30">
            Register your business
          </button>

          <div className="mt-10 flex gap-10">
            {stats.map(([stat, label]) => (
              <div key={label}>
                <p className="text-2xl font-black text-[#241210]">{stat}</p>
                <p className="text-sm font-medium text-[#8A6B67]">{label}</p>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="relative mx-auto h-80 w-80">
            {/* floating brand shapes orbiting the mark */}
            <div className="seba-float-slow pointer-events-none absolute -top-10 left-4 h-14 w-14 rounded-full bg-[#FFF2E6] shadow-lg shadow-black/5 ring-2 ring-[#D9A441]/40" />
            <div className="seba-float pointer-events-none absolute -bottom-10 right-6 h-10 w-10 rounded-tr-[20px] rounded-bl-[20px] bg-[#D9A441]" />
            <div className="seba-float-slow pointer-events-none absolute right-[-28px] top-24 h-8 w-8 rounded-full bg-[#8B1E2D]/70" />

            {/* main card */}
            <div className="absolute inset-0 rounded-[56px] bg-gradient-to-br from-[#FF7A65] to-[#8B1E2D] shadow-2xl shadow-[#8B1E2D]/30" />
            <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white shadow-xl" />
            <div className="seba-float absolute -right-6 top-10 h-16 w-16 rounded-full bg-[#D9A441] shadow-lg shadow-[#D9A441]/40" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-7xl font-black text-white/90">S</span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}