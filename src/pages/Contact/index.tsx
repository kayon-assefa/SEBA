import { EnvelopeFill, TelephoneFill, GeoAltFill, ArrowRight } from "react-bootstrap-icons";

export default function Contact() {
  return (
    <section className="relative overflow-hidden bg-[#FFF8F6] py-28">
      {/* animation keyframes for the floating Bauhaus shapes */}
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
        .seba-float { animation: seba-float 6s ease-in-out infinite; }
        .seba-float-slow { animation: seba-float-slow 8s ease-in-out infinite; }
        .seba-float-rev { animation: seba-float-rev 7s ease-in-out infinite; }
        .seba-spin-slow { animation: seba-spin-slow 16s linear infinite; }
        @media (prefers-reduced-motion: reduce) {
          .seba-float, .seba-float-slow, .seba-float-rev, .seba-spin-slow { animation: none; }
        }
      `}</style>

      {/* --- floating Bauhaus geometric pattern, ambient across the whole section --- */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* big soft blurred fields, ground the palette */}
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#FF5A5F]/10 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-[#8B1E2D]/10 blur-3xl" />

        {/* crisp Bauhaus shapes: circle, triangle, square, quarter-circle */}
       
        <div className="seba-float absolute right-[10%] top-[10%] h-14 w-14 rounded-tl-[48px] bg-[#FF5A5F]/80 shadow-lg shadow-[#FF5A5F]/20 lg:right-[16%]" />
        <div
          className="seba-spin-slow absolute right-[6%] top-[42%] h-0 w-0"
          style={{
            borderLeft: "16px solid transparent",
            borderRight: "16px solid transparent",
            borderBottom: "27px solid #D9A441",
            filter: "drop-shadow(0 6px 10px rgba(217,164,65,0.35))",
          }}
        />
        <div className="seba-float-rev absolute left-[4%] bottom-[16%] h-12 w-12 rounded-2xl bg-[#FFF2E6] shadow-md ring-1 ring-[#8B1E2D]/10" />
        <div className="seba-float absolute left-[12%] top-[46%] h-3 w-3 rounded-full bg-[#D9A441]" />
        <div className="seba-float-rev absolute right-[4%] bottom-[10%] h-6 w-6 rounded-full bg-[#8B1E2D]/70" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6">
        <div className="grid gap-16 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          {/* ---------- Left: heading + contact info ---------- */}
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#8B1E2D]">
              Get in touch
            </span>
            <h1 className="mt-4 text-5xl font-black leading-[1.05] tracking-tight text-[#241210] lg:text-6xl">
              Contact <span className="text-[#FF5A5F]">SEBA</span>
            </h1>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-[#6B4D4A]">
              Have questions about listing your business or using SEBA?
              We&apos;d love to hear from you.
            </p>

            <div className="mt-10 flex flex-col gap-4">
              {[
                { Icon: EnvelopeFill, label: "Email", value: "hello@seba.et" },
                { Icon: TelephoneFill, label: "Phone", value: "+251 900 000 000" },
                { Icon: GeoAltFill, label: "Location", value: "Addis Ababa, Ethiopia" },
              ].map(({ Icon, label, value }) => (
                <div
                  key={label}
                  className="flex items-center gap-4 rounded-2xl border border-[#8B1E2D]/10 bg-white/60 p-4 backdrop-blur-sm"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FFF2E6] ring-2 ring-[#D9A441]/40">
                    <Icon className="h-4 w-4 text-[#8B1E2D]" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#8A6B67]">
                      {label}
                    </p>
                    <p className="font-bold text-[#241210]">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ---------- Right: glass form card ---------- */}
          <div className="relative rounded-[32px] border border-white/60 bg-white/70 p-8 shadow-[0_30px_60px_-24px_rgba(139,30,45,0.25)] backdrop-blur-xl sm:p-10">
            {/* glass sheen */}
            <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/60 blur-2xl" />

            <form onSubmit={(e) => e.preventDefault()} className="relative grid gap-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wide text-[#8A6B67]">
                    Name
                  </span>
                  <input
                    className="rounded-xl border border-[#8B1E2D]/15 bg-white p-4 text-[#241210] placeholder:text-[#B5827D] outline-none transition-colors focus:border-[#FF5A5F]"
                    placeholder="Your Business name"
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wide text-[#8A6B67]">
                    Email
                  </span>
                  <input
                    type="email"
                    className="rounded-xl border border-[#8B1E2D]/15 bg-white p-4 text-[#241210] placeholder:text-[#B5827D] outline-none transition-colors focus:border-[#FF5A5F]"
                    placeholder="you@business.com"
                  />
                </label>
              </div>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-[#8A6B67]">
                  Subject
                </span>
                <input
                  className="rounded-xl border border-[#8B1E2D]/15 bg-white p-4 text-[#241210] placeholder:text-[#B5827D] outline-none transition-colors focus:border-[#FF5A5F]"
                  placeholder="What's this about?"
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-[#8A6B67]">
                  Message
                </span>
                <textarea
                  className="h-40 resize-none rounded-xl border border-[#8B1E2D]/15 bg-white p-4 text-[#241210] placeholder:text-[#B5827D] outline-none transition-colors focus:border-[#FF5A5F]"
                  placeholder="Tell us more..."
                />
              </label>

              <button className="group mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-[#FF5A5F] py-4 font-bold text-white transition-all hover:bg-[#E64A50] hover:shadow-xl hover:shadow-[#FF5A5F]/30">
                Send Message
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>

              <p className="text-center text-xs font-medium text-[#8A6B67]">
                We usually reply within one business day.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}