import Reveal from "../../../shared/components/Reveal";

/**
 * Ordered by real traffic — most-searched first. The order itself is
 * information, so the top 3 carry a "Popular" mark instead of a
 * decorative number.
 *
 * Icons are inline SVG (thin stroke, rounded joins) — matches the
 * brand's icon rule (rounded / thin / minimal / no heavy outlines)
 * and needs zero extra install.
 */
const categories = [
  {
    name: "Restaurants",
    icon: (
      <>
        <path d="M4 9h13v6a4 4 0 01-4 4H8a4 4 0 01-4-4V9z" />
        <path d="M17 10h1a3 3 0 010 6h-1" />
      </>
    ),
  },
  {
    name: "Beauty & Salons",
    icon: (
      <>
        <circle cx="6" cy="6" r="2.2" />
        <circle cx="6" cy="18" r="2.2" />
        <path d="M7.8 7.6L19 18M7.8 16.4L19 6" />
      </>
    ),
  },
  {
    name: "Hotels",
    icon: (
      <>
        <rect x="5" y="3" width="14" height="18" rx="2.5" />
        <path d="M9 8h.01M9 12h.01M9 16h.01M15 8h.01M15 12h.01M15 16h.01" />
      </>
    ),
  },
  {
    name: "Shopping",
    icon: (
      <>
        <path d="M6.5 8h11l-.9 11.2a2 2 0 01-2 1.8H9.4a2 2 0 01-2-1.8L6.5 8z" />
        <path d="M9 8V6.5a3 3 0 016 0V8" />
      </>
    ),
  },
  {
    name: "Healthcare",
    icon: (
      <path d="M12 20.5s-7-4.2-9.3-8.7A5 5 0 0112 6.6a5 5 0 019.3 5.2C19 16.3 12 20.5 12 20.5z" />
    ),
  },
  {
    name: "Automotive",
    icon: (
      <>
        <path d="M3.5 13.5l1.4-4.6A2 2 0 016.8 7.5h10.4a2 2 0 011.9 1.4l1.4 4.6" />
        <rect x="3" y="13.5" width="18" height="4.8" rx="1.6" />
        <circle cx="7.3" cy="18.3" r="1.4" />
        <circle cx="16.7" cy="18.3" r="1.4" />
      </>
    ),
  },
  {
    name: "Gym & Fitness",
    icon: (
      <>
        <path d="M6.5 8v8M17.5 8v8" />
        <path d="M4.5 10.5v3M19.5 10.5v3" />
        <path d="M8.5 12h7" />
      </>
    ),
  },
  {
    name: "Events & Parks",
    icon: (
      <>
        <rect x="4" y="5.5" width="16" height="14.5" rx="2.2" />
        <path d="M4 9.5h16M8.3 3v4M15.7 3v4" />
      </>
    ),
  },
  {
    name: "Photography",
    icon: (
      <>
        <rect x="3" y="7.2" width="18" height="12" rx="2.2" />
        <circle cx="12" cy="13.2" r="3.4" />
        <path d="M8.3 7.2l1.3-2h4.8l1.3 2" />
      </>
    ),
  },
  {
    name: "Sports Fields",
    icon: (
      <>
        <path d="M8 4h8v3.5a4 4 0 01-8 0V4z" />
        <path d="M6 5H4.3v1.8a2.8 2.8 0 002.8 2.8M18 5h1.7v1.8a2.8 2.8 0 01-2.8 2.8" />
        <path d="M12 11.5V15M9.3 19.5h5.4M10 15.8h4v3.7h-4z" />
      </>
    ),
  },
];

const tones = [
  { bg: "bg-[#FF5A5F]", glow: "shadow-[#FF5A5F]/35" },
  { bg: "bg-[#8B1E2D]", glow: "shadow-[#8B1E2D]/35" },
  { bg: "bg-[#D9A441]", glow: "shadow-[#D9A441]/40" },
];

const shapes = [
  "rounded-full",
  "rounded-tl-[26px] rounded-tr-[8px] rounded-br-[26px] rounded-bl-[8px]",
  "rounded-[16px]",
  "rounded-tr-[26px] rounded-bl-[26px] rounded-tl-[8px] rounded-br-[8px]",
];

export default function CategoriesSection() {
  return (
    <section className="bg-white py-28 lg:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal>
          <p className="text-center text-sm font-bold uppercase tracking-[0.2em] text-[#FF5A5F]">
            Browse SEBA
          </p>
          <h2 className="mt-4 text-center text-4xl font-black tracking-tight text-[#241210] lg:text-5xl">
            A category for everything you do.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-center text-lg text-[#8A6B67]">
            The ten places Ethiopians open SEBA for most — start with what
            you need today.
          </p>
        </Reveal>

        <div className="mt-16 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5 lg:gap-7">
          {categories.map((item, i) => {
            const tone = tones[i % tones.length];
            const shape = shapes[i % shapes.length];
            const popular = i < 3;

            return (
              <Reveal key={item.name} delay={i * 60} className="h-full">
                <a
                  href="#"
                  className="group relative flex h-full flex-col overflow-hidden rounded-[28px] bg-[#FFF8F3] p-7
                  transition-all duration-300 hover:-translate-y-2 hover:bg-white hover:shadow-[0_20px_45px_-15px_rgba(139,30,45,0.25)]"
                >
                  {/* light-sweep — the one motion signature on this card, plays once per hover */}
                  <span
                    className="pointer-events-none absolute inset-0 -translate-x-[150%] bg-gradient-to-r
                    from-transparent via-white/50 to-transparent transition-transform duration-700
                    ease-out group-hover:translate-x-[150%]"
                  />

                  {/* icon + badge share a row, so nothing floats or collides */}
                  <div className="flex items-start justify-between gap-2">
                    <div
                      className={`flex h-14 w-14 flex-shrink-0 items-center justify-center ${shape} ${tone.bg}
                      shadow-lg ${tone.glow} transition-all duration-300 group-hover:scale-110 group-hover:rotate-6`}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth={1.7}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-6 w-6"
                      >
                        {item.icon}
                      </svg>
                    </div>

                    {popular && (
                      <span className="flex flex-shrink-0 items-center gap-1.5 rounded-full bg-[#241210]/[0.06] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#8B1E2D]">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="animate-pulse-dot absolute inline-flex h-full w-full rounded-full bg-[#FF5A5F]" />
                          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#FF5A5F]" />
                        </span>
                        Popular
                      </span>
                    )}
                  </div>

                  <h3 className="mt-7 text-base font-bold leading-snug text-[#241210] lg:text-lg">
                    {item.name}
                  </h3>
                  <p className="mt-1.5 text-sm text-[#8A6B67]">
                    Trusted, verified providers
                  </p>
                </a>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}