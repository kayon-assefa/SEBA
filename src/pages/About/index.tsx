import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  TelephoneFill,
  JournalText,
  ChatDotsFill,
  Send,
  Calendar2Check,
  PeopleFill,
  BarChartFill,
  LightningChargeFill,
  ShieldFillCheck,
  GraphUpArrow,
  GeoAltFill,
  Award,
  CheckCircleFill,
  RocketTakeoffFill,
  ArrowRight,
} from "react-bootstrap-icons";

/* =========================================================================
   SHARED PRIMITIVES
   A small local design system for this page: scroll-reveal, section labels,
   and a reusable Bauhaus shape kit (circle / triangle / square / quarter-
   circle / dot / ring) so every section can be decorated consistently
   without repeating raw markup everywhere.
   ========================================================================= */

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

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center justify-center gap-3">
      <span className="h-2 w-2 rounded-full bg-[#FF5A5F]" />
      <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#8B1E2D]">
        {children}
      </span>
    </div>
  );
}

/* ---------- Bauhaus shape primitives ---------- */

type ShapeAnim = "float" | "float-slow" | "float-rev" | "spin-slow" | "none";

function shapeAnimClass(anim: ShapeAnim) {
  switch (anim) {
    case "float":
      return "seba-float";
    case "float-slow":
      return "seba-float-slow";
    case "float-rev":
      return "seba-float-rev";
    case "spin-slow":
      return "seba-spin-slow";
    default:
      return "";
  }
}

function ShapeCircle({
  className = "",
  size = 16,
  color = "#8B1E2D",
  filled = false,
  anim = "float-slow",
}: {
  className?: string;
  size?: number;
  color?: string;
  filled?: boolean;
  anim?: ShapeAnim;
}) {
  return (
    <div
      className={`pointer-events-none absolute rounded-full ${shapeAnimClass(anim)} ${className}`}
      style={{
        width: size,
        height: size,
        background: filled ? color : "transparent",
        border: filled ? "none" : `3px solid ${color}33`,
      }}
    />
  );
}

function ShapeSquare({
  className = "",
  size = 16,
  color = "#FFF2E6",
  radius = 16,
  anim = "float-rev",
}: {
  className?: string;
  size?: number;
  color?: string;
  radius?: number;
  anim?: ShapeAnim;
}) {
  return (
    <div
      className={`pointer-events-none absolute shadow-md ring-1 ring-[#8B1E2D]/10 ${shapeAnimClass(anim)} ${className}`}
      style={{ width: size, height: size, background: color, borderRadius: radius }}
    />
  );
}

function ShapeQuarter({
  className = "",
  size = 16,
  color = "#FF5A5F",
  corner = "tl",
  anim = "float",
}: {
  className?: string;
  size?: number;
  color?: string;
  corner?: "tl" | "tr" | "bl" | "br";
  anim?: ShapeAnim;
}) {
  const radiusKey =
    corner === "tl"
      ? "rounded-tl-[999px]"
      : corner === "tr"
      ? "rounded-tr-[999px]"
      : corner === "bl"
      ? "rounded-bl-[999px]"
      : "rounded-br-[999px]";
  return (
    <div
      className={`pointer-events-none absolute ${radiusKey} ${shapeAnimClass(anim)} ${className}`}
      style={{ width: size, height: size, background: color }}
    />
  );
}

function ShapeTriangle({
  className = "",
  size = 16,
  color = "#D9A441",
  anim = "spin-slow",
}: {
  className?: string;
  size?: number;
  color?: string;
  anim?: ShapeAnim;
}) {
  return (
    <div
      className={`pointer-events-none absolute h-0 w-0 ${shapeAnimClass(anim)} ${className}`}
      style={{
        borderLeft: `${size * 0.6}px solid transparent`,
        borderRight: `${size * 0.6}px solid transparent`,
        borderBottom: `${size}px solid ${color}`,
        filter: `drop-shadow(0 6px 10px ${color}55)`,
      }}
    />
  );
}

/* =========================================================================
   MAIN PAGE
   ========================================================================= */

export default function About() {
  return (
    <div className="relative overflow-hidden bg-[#FFF8F6]">
      {/* --- shared animation keyframes for the whole page --- */}
      <style>{`
        @keyframes seba-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-18px); }
        }
        @keyframes seba-float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes seba-float-rev {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(12px) rotate(-10deg); }
        }
        @keyframes seba-spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes seba-pulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.06); }
        }
        .seba-float { animation: seba-float 6s ease-in-out infinite; }
        .seba-float-slow { animation: seba-float-slow 8s ease-in-out infinite; }
        .seba-float-rev { animation: seba-float-rev 7s ease-in-out infinite; }
        .seba-spin-slow { animation: seba-spin-slow 18s linear infinite; }
        .seba-pulse { animation: seba-pulse 4s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .seba-float, .seba-float-slow, .seba-float-rev,
          .seba-spin-slow, .seba-pulse { animation: none; }
        }
      `}</style>

      {/* =====================================================================
          1. HERO
          ===================================================================== */}
      <section className="relative py-28 lg:py-36">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <ShapeCircle className="left-[8%] top-[18%]" size={90} color="#8B1E2D" anim="float-slow" />
          <ShapeQuarter className="right-[10%] top-[10%]" size={70} color="#FF5A5F" corner="tl" anim="float" />
          <ShapeTriangle className="left-[16%] bottom-[14%]" size={34} color="#D9A441" anim="spin-slow" />
          <ShapeSquare className="right-[16%] bottom-[18%]" size={44} color="#FFF2E6" radius={16} anim="float-rev" />
          <ShapeCircle className="left-[46%] top-[8%]" size={10} color="#D9A441" filled anim="float" />
          <ShapeCircle className="right-[38%] bottom-[8%]" size={8} color="#FF5A5F" filled anim="float-rev" />
        </div>

        <div className="relative mx-auto max-w-5xl px-6 text-center">
          <Reveal>
            <Eyebrow>About SEBA</Eyebrow>
            <h1 className="mx-auto mt-6 max-w-4xl text-[2.6rem] font-black leading-[1.08] tracking-tight text-[#1E1E1E] sm:text-5xl lg:text-6xl">
              Building the future of Ethiopian business discovery
            </h1>
            <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-[#6B4D4A] lg:text-xl">
              SEBA connects people with trusted local businesses while
              helping businesses become digital.
            </p>
          </Reveal>
        </div>
      </section>

      {/* =====================================================================
          2. OUR STORY — the "before / after" transformation
          ===================================================================== */}
      <section className="relative bg-white py-24 lg:py-32">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <ShapeCircle className="right-[4%] top-[10%]" size={12} color="#D9A441" filled anim="float" />
          <ShapeQuarter className="left-[2%] bottom-[6%]" size={90} color="#8B1E2D" corner="br" anim="float-slow" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            {/* --- narrative --- */}
            <Reveal>
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#8B1E2D]">
                Our Story
              </span>
              <h2 className="mt-4 text-3xl font-black leading-tight tracking-tight text-[#1E1E1E] lg:text-4xl">
                SEBA was created with one simple idea:
                <br />
                <span className="text-[#FF5A5F]">
                  running a business should be easier.
                </span>
              </h2>
              <p className="mt-6 text-base leading-relaxed text-[#6B4D4A] lg:text-lg">
                Every day, thousands of Ethiopian businesses manage
                appointments through phone calls, handwritten notebooks,
                Telegram messages, and WhatsApp chats. It works &mdash;
                but it&apos;s time-consuming, difficult to organize, and
                easy to make mistakes.
              </p>
              <p className="mt-4 text-base leading-relaxed text-[#6B4D4A] lg:text-lg">
                We believe technology should simplify that experience, not
                complicate it. That&apos;s why we built SEBA &mdash; a
                platform that helps businesses manage appointments,
                customers, staff, and daily operations from one place.
              </p>
            </Reveal>

            {/* --- illustration: scattered chaos, collapsing into one clean card --- */}
            <Reveal delay={120}>
              <div className="relative mx-auto h-[380px] w-full max-w-md">
                {/* scattered "old way" chips, tilted and loose */}
                <div className="seba-float-slow absolute left-0 top-2 flex items-center gap-2 rounded-2xl bg-[#FFF2F2] px-4 py-3 shadow-md -rotate-6">
                  <TelephoneFill className="h-4 w-4 text-[#8B1E2D]" />
                  <span className="text-xs font-bold text-[#241210]">Phone calls</span>
                </div>
                <div className="seba-float absolute right-2 top-14 flex items-center gap-2 rounded-2xl bg-[#FFF2F2] px-4 py-3 shadow-md rotate-3">
                  <JournalText className="h-4 w-4 text-[#8B1E2D]" />
                  <span className="text-xs font-bold text-[#241210]">Notebooks</span>
                </div>
                <div className="seba-float-rev absolute left-6 top-32 flex items-center gap-2 rounded-2xl bg-[#FFF2F2] px-4 py-3 shadow-md rotate-2">
                  <Send className="h-4 w-4 text-[#8B1E2D]" />
                  <span className="text-xs font-bold text-[#241210]">Telegram</span>
                </div>
                <div className="seba-float absolute right-0 top-44 flex items-center gap-2 rounded-2xl bg-[#FFF2F2] px-4 py-3 shadow-md -rotate-3">
                  <ChatDotsFill className="h-4 w-4 text-[#8B1E2D]" />
                  <span className="text-xs font-bold text-[#241210]">WhatsApp</span>
                </div>

                {/* connecting arrow */}
                <div className="absolute left-1/2 top-[52%] flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full bg-white shadow-lg">
                  <ArrowRight className="h-4 w-4 rotate-90 text-[#D9A441]" />
                </div>

                {/* the "new way" — one clean, confident card */}
                <div className="absolute bottom-0 left-1/2 w-[86%] -translate-x-1/2 rounded-[28px] bg-gradient-to-br from-[#FF7A65] to-[#8B1E2D] p-6 text-white shadow-[0_24px_50px_-16px_rgba(139,30,45,0.45)]">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold">SEBA</span>
                    <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#7CE0A0]" />
                      All in one place
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <div className="rounded-xl bg-white/10 py-3 text-center">
                      <Calendar2Check className="mx-auto h-4 w-4" />
                      <p className="mt-1 text-[10px] font-semibold">Bookings</p>
                    </div>
                    <div className="rounded-xl bg-white/10 py-3 text-center">
                      <PeopleFill className="mx-auto h-4 w-4" />
                      <p className="mt-1 text-[10px] font-semibold">Customers</p>
                    </div>
                    <div className="rounded-xl bg-white/10 py-3 text-center">
                      <BarChartFill className="mx-auto h-4 w-4" />
                      <p className="mt-1 text-[10px] font-semibold">Growth</p>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* =====================================================================
          3. MISSION & VISION
          ===================================================================== */}
      <section className="relative py-24 lg:py-32">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <ShapeTriangle className="left-[6%] top-[12%]" size={28} color="#D9A441" anim="spin-slow" />
          <ShapeCircle className="right-[8%] bottom-[16%]" size={60} color="#FF5A5F" anim="float" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Reveal>
              <div className="h-full rounded-[32px] bg-[#FFF2F2] p-10">
                <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-[#8B1E2D]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#FF5A5F]" />
                  Our Mission
                </span>
                <p className="mt-6 text-2xl font-black leading-snug tracking-tight text-[#241210] lg:text-3xl">
                  Help Ethiopian businesses grow through simple, modern
                  technology.
                </p>
                <p className="mt-5 text-base leading-relaxed text-[#6B4D4A]">
                  Whether you&apos;re a barber, salon, clinic, gym, or any
                  service business, SEBA gives you the tools to stay
                  organized, save time, and deliver a better experience to
                  your customers.
                </p>
              </div>
            </Reveal>

            <Reveal delay={100}>
              <div className="h-full rounded-[32px] bg-[#8B1E2D] p-10 text-white">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-[#F4C97A]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#D9A441]" />
                  Our Vision
                </span>
                <p className="mt-6 text-2xl font-black leading-snug tracking-tight lg:text-3xl">
                  Every Ethiopian service business, with a professional
                  online presence.
                </p>
                <p className="mt-5 text-base leading-relaxed text-white/75">
                  A future where customers can discover, book, and connect
                  with businesses in just a few taps. SEBA aims to become
                  the digital operating system for service businesses
                  across Ethiopia and, eventually, across Africa.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* =====================================================================
          4. WHAT WE BELIEVE — five values
          ===================================================================== */}
      <section className="relative bg-white py-24 lg:py-32">
        <div className="relative mx-auto max-w-6xl px-6">
          <Reveal>
            <div className="text-center">
              <Eyebrow>What We Believe</Eyebrow>
              <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-black tracking-tight text-[#1E1E1E] lg:text-4xl">
                The principles behind every decision we make
              </h2>
            </div>
          </Reveal>

          <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {[
              {
                title: "Simplicity",
                desc: "Technology should feel effortless.",
                Icon: LightningChargeFill,
                bg: "#FFF2F2",
                fg: "#FF5A5F",
              },
              {
                title: "Trust",
                desc: "Businesses trust us with their customers, and we take that responsibility seriously.",
                Icon: ShieldFillCheck,
                bg: "#FFF2E6",
                fg: "#D9A441",
              },
              {
                title: "Growth",
                desc: "When businesses grow, communities grow.",
                Icon: GraphUpArrow,
                bg: "#FFF2F2",
                fg: "#8B1E2D",
              },
              {
                title: "Local First",
                desc: "Built with Ethiopian businesses in mind, understanding local needs while delivering a world-class experience.",
                Icon: GeoAltFill,
                bg: "#FFF2E6",
                fg: "#8B1E2D",
              },
              {
                title: "Quality",
                desc: "Every detail matters, from the design of our platform to the experience of every customer.",
                Icon: Award,
                bg: "#FFF2F2",
                fg: "#FF5A5F",
              },
            ].map((value, i) => (
              <Reveal key={value.title} delay={i * 80}>
                <div className="group h-full rounded-[28px] border border-[#8B1E2D]/8 bg-white p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <div
                    className="mx-auto flex h-14 w-14 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-110"
                    style={{ background: value.bg }}
                  >
                    <value.Icon className="h-5 w-5" style={{ color: value.fg }} />
                  </div>
                  <p className="mt-5 font-black text-[#241210]">{value.title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-[#8A6B67]">
                    {value.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================
          5. WHY SEBA — contrast statement band
          ===================================================================== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#8B1E2D] to-[#4A0E17] py-28 text-white lg:py-36">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-24 top-1/3 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#D9A441]/10 blur-3xl seba-pulse" />
          <ShapeCircle className="left-[10%] bottom-[14%]" size={14} color="#D9A441" filled anim="float" />
          <ShapeSquare className="right-[12%] top-[16%]" size={40} color="#FFFFFF" radius={12} anim="float-rev" />
          <ShapeTriangle className="right-[20%] bottom-[10%]" size={26} color="#D9A441" anim="spin-slow" />
        </div>

        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <Reveal>
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#F4C97A]">
              Why SEBA?
            </span>
            <p className="mt-6 text-2xl font-black leading-snug tracking-tight lg:text-4xl">
              SEBA isn&apos;t just an appointment platform. It&apos;s a
              modern business platform designed to help service businesses
              organize their work, connect with customers, and grow with
              confidence.
            </p>
            <div className="mx-auto mt-10 h-px w-16 bg-[#D9A441]/40" />
            <p className="mx-auto mt-10 max-w-2xl text-lg font-medium leading-relaxed text-white/80">
              Our goal isn&apos;t simply to digitize appointments. Our goal
              is to help businesses spend less time managing schedules and
              more time serving people.
            </p>
          </Reveal>
        </div>
      </section>

      {/* =====================================================================
          5b. HOW IT WORKS — the goal made concrete, in three steps
          ===================================================================== */}
      <section className="relative bg-[#FFF8F6] py-24 lg:py-32">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <ShapeCircle className="left-[4%] top-[20%]" size={12} color="#FF5A5F" filled anim="float" />
          <ShapeTriangle className="right-[6%] bottom-[18%]" size={24} color="#D9A441" anim="spin-slow" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6">
          <Reveal>
            <div className="text-center">
              <Eyebrow>How It Works</Eyebrow>
              <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-black tracking-tight text-[#1E1E1E] lg:text-4xl">
                Less time managing schedules, more time serving people
              </h2>
            </div>
          </Reveal>

          <div className="relative mt-16 grid gap-8 md:grid-cols-3">
            {/* connecting line across the three steps, desktop only */}
            <div className="pointer-events-none absolute left-0 right-0 top-8 hidden h-px bg-gradient-to-r from-transparent via-[#8B1E2D]/15 to-transparent md:block" />

            {[
              {
                step: "01",
                title: "Get discovered",
                desc: "Your business gets a clean, professional page customers can find and trust in seconds.",
                Icon: GeoAltFill,
              },
              {
                step: "02",
                title: "Get booked",
                desc: "Customers book appointments themselves, any time, without a single phone call.",
                Icon: Calendar2Check,
              },
              {
                step: "03",
                title: "Get organized",
                desc: "Every appointment, customer, and staff member lives in one simple dashboard.",
                Icon: BarChartFill,
              },
            ].map((step, i) => (
              <Reveal key={step.step} delay={i * 100}>
                <div className="relative rounded-[28px] border border-[#8B1E2D]/8 bg-white p-8 text-center shadow-sm">
                  <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#FF7A65] to-[#8B1E2D] text-white shadow-lg shadow-[#8B1E2D]/20">
                    <step.Icon className="h-6 w-6" />
                    <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#D9A441] text-[10px] font-black text-[#241210]">
                      {step.step}
                    </span>
                  </div>
                  <p className="mt-6 font-black text-[#241210]">{step.title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-[#8A6B67]">
                    {step.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================
          6. LOOKING AHEAD — today vs. tomorrow roadmap
          ===================================================================== */}
      <section className="relative bg-white py-24 lg:py-32">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <ShapeQuarter className="right-[4%] top-[8%]" size={64} color="#FF5A5F" corner="bl" anim="float" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6">
          <Reveal>
            <div className="text-center">
              <Eyebrow>Looking Ahead</Eyebrow>
              <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-black tracking-tight text-[#1E1E1E] lg:text-4xl">
                We&apos;re building technology that grows alongside the
                businesses that use it
              </h2>
            </div>
          </Reveal>

          <div className="relative mt-16 grid gap-10 lg:grid-cols-2">
            {/* connecting line between the two eras, desktop only */}
            <div className="pointer-events-none absolute left-1/2 top-10 hidden h-[calc(100%-5rem)] w-px -translate-x-1/2 bg-gradient-to-b from-[#8B1E2D]/20 via-[#D9A441]/40 to-[#FF5A5F]/20 lg:block" />

            <Reveal>
              <div className="rounded-[32px] border border-[#8B1E2D]/10 bg-[#FFF8F6] p-8 lg:p-10">
                <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-[#8B1E2D] shadow-sm">
                  <CheckCircleFill className="h-3.5 w-3.5 text-[#3FA65C]" />
                  Today
                </span>
                <p className="mt-6 text-xl font-black leading-snug text-[#241210]">
                  SEBA helps businesses manage appointments.
                </p>
                <ul className="mt-6 space-y-3">
                  {["Appointment booking", "Customer visibility", "One shared schedule"].map(
                    (item) => (
                      <li key={item} className="flex items-center gap-3 text-sm font-semibold text-[#6B4D4A]">
                        <CheckCircleFill className="h-4 w-4 shrink-0 text-[#FF5A5F]" />
                        {item}
                      </li>
                    )
                  )}
                </ul>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <div className="rounded-[32px] bg-gradient-to-br from-[#241210] to-[#4A0E17] p-8 text-white lg:p-10">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-[#F4C97A]">
                  <RocketTakeoffFill className="h-3.5 w-3.5" />
                  Tomorrow
                </span>
                <p className="mt-6 text-xl font-black leading-snug">
                  A complete business platform, built to scale with you.
                </p>
                <div className="mt-6 flex flex-wrap gap-2.5">
                  {[
                    "Customer management",
                    "Payments",
                    "Analytics",
                    "Staff management",
                    "& much more",
                  ].map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-white/85"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* =====================================================================
          7. CLOSING STATEMENT
          ===================================================================== */}
      <section className="relative overflow-hidden py-28 lg:py-36">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FF5A5F]/5 blur-3xl" />
          <ShapeCircle className="left-[12%] top-[18%]" size={70} color="#8B1E2D" anim="float-slow" />
          <ShapeQuarter className="right-[10%] top-[14%]" size={56} color="#FF5A5F" corner="tr" anim="float" />
          <ShapeTriangle className="left-[18%] bottom-[16%]" size={30} color="#D9A441" anim="spin-slow" />
          <ShapeSquare className="right-[16%] bottom-[20%]" size={36} color="#FFF2E6" radius={14} anim="float-rev" />
          <ShapeCircle className="left-[42%] bottom-[10%]" size={9} color="#D9A441" filled anim="float" />

          <span
            aria-hidden="true"
            className="absolute -bottom-16 right-[-4%] select-none text-[18rem] font-black leading-none text-[#8B1E2D]/[0.04]"
          >
            S
          </span>
        </div>

        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <Reveal>
            <h2 className="text-3xl font-black leading-tight tracking-tight text-[#1E1E1E] lg:text-5xl">
              SEBA exists to empower Ethiopian businesses with technology
              that&apos;s <span className="text-[#FF5A5F]">simple</span>,{" "}
              <span className="text-[#8B1E2D]">beautiful</span>, and built
              for the future.
            </h2>
            <button className="group mt-10 inline-flex items-center gap-2 rounded-full bg-[#FF5A5F] px-9 py-4 font-bold text-white transition-all hover:bg-[#E64A50] hover:shadow-xl hover:shadow-[#FF5A5F]/30">
              Join SEBA today
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </Reveal>
        </div>
      </section>
    </div>
  );
}