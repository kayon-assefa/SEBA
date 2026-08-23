import Reveal from "../../../shared/components/Reveal";

const steps = [
  {
    title: "Create your page",
    text: "Set up your business profile in minutes — name, photos, services and location.",
  },
  {
    title: "Design your page",
    text: "Make it yours. Add your hours, pricing, and the details that show what you do best.",
  },
  {
    title: "Grow",
    text: "Get discovered, take bookings, and manage it all as more customers find you.",
  },
];

/** Hand-drawn, dashed connector — points to what's next, not just decoration. */
function ScratchArrow({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 90 40"
      className={`h-10 w-24 overflow-visible ${className}`}
      fill="none"
    >
      <path
        d="M3 21 Q 26 33 44 19 T 74 13"
        stroke="#FF5A5F"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeDasharray="1.5 10"
      />
      <path
        d="M64 6 L 78 13 L 65 21"
        stroke="#FF5A5F"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function HowItWorks() {
  return (
    <section className="bg-white py-28">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal>
          <p className="text-center text-sm font-bold uppercase tracking-[0.2em] text-[#FF5A5F]">
            The process
          </p>
          <h2 className="mt-4 text-center text-4xl font-black tracking-tight text-[#241210] lg:text-5xl">
            How SEBA works
          </h2>
        </Reveal>

        <div className="relative mt-16">
          {/* arrows — only between columns, so they never fight with the cards */}
          <div className="pointer-events-none absolute inset-0 hidden md:block">
            <ScratchArrow className="absolute left-1/3 top-[70px] -translate-x-1/2 rotate-[-2deg]" />
            <ScratchArrow className="absolute left-2/3 top-[70px] -translate-x-1/2 rotate-[3deg]" />
          </div>

          <div className="grid items-stretch gap-8 md:grid-cols-3">
            {steps.map((step, index) => (
              <Reveal key={step.title} delay={index * 120} className="h-full">
                <div className="group relative flex h-full flex-col items-center rounded-[32px] bg-[#FFF8F3] p-9 text-center transition-all duration-300 hover:-translate-y-2">
                  <div className="relative flex h-20 w-20 flex-shrink-0 items-center justify-center">
                    <div className="absolute inset-0 rounded-[26px] bg-[#FF5A5F] transition-transform duration-300 group-hover:rotate-6" />
                    <span className="relative text-2xl font-black text-white">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="mt-7 text-xl font-bold text-[#241210]">
                    {step.title}
                  </h3>
                  <p className="mt-3 leading-relaxed text-[#8A6B67]">
                    {step.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* one CTA, for the one action this whole section builds toward */}
        <Reveal delay={360}>
          <div className="mt-14 flex justify-center">
            <button className="rounded-full bg-[#FF5A5F] px-10 py-4 font-bold text-white transition-all hover:bg-[#E64A50] hover:shadow-xl hover:shadow-[#FF5A5F]/30">
              Create your page
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}