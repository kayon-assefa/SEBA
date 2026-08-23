import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ShieldCheck,
  Search,
  Sparkles,
  Users,
  TrendingUp,
  ArrowRight,
  Star,
} from "lucide-react";

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

const reasons = [
  {
    title: "Trusted businesses",
    desc: "Every listing is verified, so customers book with confidence.",
    icon: ShieldCheck,
    shape: "rounded-full",
  },
  {
    title: "Fast search",
    desc: "Find the right business and book in seconds, not minutes.",
    icon: Search,
    shape: "rounded-tl-[28px] rounded-br-[28px] rounded-tr-md rounded-bl-md",
  },
  {
    title: "Modern experience",
    desc: "A clean, simple platform that feels effortless to use.",
    icon: Sparkles,
    shape: "rounded-[22px]",
  },
  {
    title: "Growing community",
    desc: "Join a fast-growing network of Ethiopian entrepreneurs.",
    icon: Users,
    shape: "rounded-tr-[28px] rounded-bl-[28px] rounded-tl-md rounded-br-md",
  },
  {
    title: "Business visibility",
    desc: "Get discovered by thousands of new local customers.",
    icon: TrendingUp,
    shape: "rounded-full",
  },
];

const stats = [
  { value: "500+", label: "Businesses" },
  { value: "50k+", label: "Bookings made" },
  { value: "4.9", label: "Average rating", star: true },
];

export default function WhySeba() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#FFE3D8] via-[#FF8A72] to-[#E2453D] py-28">
      {/* --- signature brand shape composition (soft, overlapping, cream/gold) --- */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-[#FFF2E6]/40 blur-[1px]" />
      <div className="pointer-events-none absolute -right-16 top-10 h-56 w-56 rounded-bl-[120px] rounded-tr-[40px] bg-[#8B1E2D]/15" />
      <div className="pointer-events-none absolute -bottom-32 -right-24 h-[420px] w-[420px] rounded-full bg-[#8B1E2D]/20" />
      <div className="pointer-events-none absolute bottom-10 left-[8%] h-24 w-24 rounded-full bg-[#D9A441]/70" />
      <div className="pointer-events-none absolute left-[38%] top-8 h-10 w-10 rounded-full bg-[#FFF2E6]/70" />

      <div className="relative mx-auto max-w-7xl px-6">
        <Reveal>
          <p className="text-center text-sm font-bold uppercase tracking-[0.25em] text-[#8B1E2D]">
            The difference
          </p>
          <h2 className="mt-4 text-center text-4xl font-black tracking-tight text-[#FFF2E6] lg:text-5xl">
            Why businesses choose SEBA
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-center text-lg font-medium text-[#FFF2E6]/85">
            Everything you need to get booked, get paid, and grow &mdash; built
            for how Ethiopian businesses actually work.
          </p>
        </Reveal>

        {/* --- social proof row (adds credibility / persuasion) --- */}
        <Reveal delay={80}>
          <div className="mx-auto mt-10 flex max-w-xl flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="flex items-center justify-center gap-1 text-2xl font-black text-[#5A1019]">
                  {s.value}
                  {s.star && (
                    <Star className="h-5 w-5 fill-[#D9A441] text-[#D9A441]" />
                  )}
                </div>
                <div className="text-xs font-semibold uppercase tracking-wide text-[#8B1E2D]/70">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        {/* --- liquid glass cards --- */}
        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {reasons.map((reason, i) => {
            const Icon = reason.icon;
            return (
              <Reveal key={reason.title} delay={i * 90}>
                <div className="group relative h-full overflow-hidden rounded-[28px] border border-white/60 bg-white/30 p-7 text-center shadow-[0_8px_32px_rgba(139,30,45,0.18)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:bg-white/45 hover:shadow-[0_14px_40px_rgba(139,30,45,0.28)]">
                  {/* glass sheen */}
                  <div className="pointer-events-none absolute -left-10 -top-10 h-24 w-24 rounded-full bg-white/50 blur-2xl" />

                  <div
                    className={`relative mx-auto flex h-14 w-14 items-center justify-center bg-[#FFF2E6] ring-2 ring-[#D9A441]/50 ${reason.shape} transition-transform duration-300 group-hover:scale-110`}
                  >
                    <Icon className="h-6 w-6 text-[#8B1E2D]" strokeWidth={2} />
                  </div>

                  <p className="relative mt-6 font-bold leading-snug !text-white">
                    {reason.title}
                  </p>
                  <p className="relative mt-2 text-sm leading-relaxed !text-white">
                    {reason.desc}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>

        {/* --- CTA (persuasion close) --- */}
        <Reveal delay={200}>
          <div className="mt-16 flex flex-col items-center justify-center gap-4">
            <button className="group inline-flex items-center gap-2 rounded-full bg-[#5A1019] px-8 py-4 font-bold text-[#FFF2E6] shadow-[0_10px_30px_rgba(90,16,25,0.35)] transition-all duration-300 hover:bg-[#8B1E2D] hover:shadow-[0_14px_36px_rgba(90,16,25,0.45)]">
              Start growing with SEBA
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
            <p className="text-sm font-medium text-[#7A2430]">
              Free to join &middot; No credit card required
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}