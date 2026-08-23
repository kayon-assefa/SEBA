export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#FFFBF8] pb-40 pt-28 lg:pb-48 lg:pt-40">
      {/* animation keyframes used across this section */}
      <style>{`
        @keyframes seba-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-16px); }
        }
        @keyframes seba-float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes seba-float-rev {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(10px) rotate(-8deg); }
        }
        @keyframes seba-rotate-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes seba-wave {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-float { animation: seba-float 6s ease-in-out infinite; }
        .animate-float-slow { animation: seba-float-slow 8s ease-in-out infinite; }
        .animate-float-rev { animation: seba-float-rev 7s ease-in-out infinite; }
        .animate-spin-slow { animation: seba-rotate-slow 14s linear infinite; }
        .animate-wave { animation: seba-wave 16s linear infinite; }
        @media (prefers-reduced-motion: reduce) {
          .animate-float, .animate-float-slow, .animate-float-rev,
          .animate-spin-slow, .animate-wave { animation: none; }
        }
      `}</style>

      <div className="mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
          {/* ---------- Text column — speaks to the business owner, not the customer ---------- */}
          <div className="order-2 lg:order-1">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 bg-[#FF5A5F]" />
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#8B1E2D]">
                Built for Ethiopian business owners
              </span>
            </div>

            <h1 className="mt-6 text-[2.5rem] font-black leading-[1.1] tracking-tight text-[#241210] lg:text-[4.5rem] lg:leading-[1.05]">
              Create your page.
              <br />
              <span className="text-[#FF5A5F]">Manage</span> your business.
            </h1>

            <p className="mt-6 max-w-md text-base leading-relaxed text-white lg:text-xl">
             — Any business gets a home
              online with SEBA: a page customers can find, appointments
              that book themselves, and everything managed from one place.
            </p>

            {/* What SEBA does — three plain verbs, easy to scan */}
            <div className="mt-6 flex flex-wrap gap-2.5">
              {["Design your page", "Take appointments", "Track your growth"].map(
                (item) => (
                  <span
                    key={item}
                    className="rounded-full border border-[#8B1E2D]/15 bg-white px-4 py-2 text-sm font-semibold text-[#8B1E2D]"
                  >
                    {item}
                  </span>
                )
              )}
            </div>

            {/* Owner onboarding — this is the primary action, not a search bar */}
            <div className="mt-8 flex max-w-md flex-col gap-2 rounded-[28px] bg-white p-2 shadow-[0_20px_50px_-18px_rgba(139,30,45,0.3)] ring-1 ring-black/[0.03] sm:flex-row sm:items-center sm:rounded-full sm:pl-5">
              <input
                className="w-full min-w-0 rounded-full bg-transparent px-4 py-3 text-base text-[#241210] placeholder:text-[#B5827D] focus:outline-none sm:px-0"
                placeholder="Your business name"
              />
              <button className="flex-shrink-0 rounded-full bg-[#FF5A5F] px-6 py-3 text-sm font-bold text-white transition-all hover:bg-[#E64A50]">
                Create my page
              </button>
            </div>

            {/* Trust row — hairline-divided, Swiss grid discipline */}
            <div className="mt-10 flex max-w-md items-center divide-x divide-[#241210]/10">
              {[
                ["1,200+", "Businesses on SEBA"],
                ["2", "Cities, and growing"],
                ["4.8★", "Owner satisfaction"],
              ].map(([stat, label]) => (
                <div key={label} className="flex-1 px-5 first:pl-0">
                  <p className="text-xl font-black text-[#241210] lg:text-2xl">{stat}</p>
                  <p className="mt-1 text-xs font-medium leading-snug text-[#8A6B67]">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ---------- Visual column ---------- */}
          <div className="order-1 lg:order-2">
            {/* Mobile-only: Bauhaus-style floating geometric pattern, replaces the orb scene */}
            <div className="relative mx-auto flex h-56 w-full max-w-sm items-center justify-center sm:h-64 lg:hidden">
              {/* thin dashed ring, echoes the desktop ring at smaller weight */}
              <div className="absolute h-40 w-40 rounded-full border-2 border-dashed border-[#8B1E2D]/15" />

              {/* deep burgundy circle, offset back-left */}
              <div className="animate-float-slow absolute left-[14%] top-[18%] h-16 w-16 rounded-full bg-[#8B1E2D]/90 shadow-lg shadow-[#8B1E2D]/30" />

              {/* coral quarter-circle block, classic Bauhaus corner shape */}
              <div className="animate-float-rev absolute right-[16%] top-[8%] h-20 w-20 rounded-tl-[64px] bg-[#FF5A5F]" />

              {/* gold triangle */}
              <div
                className="animate-spin-slow absolute bottom-[14%] left-[20%] h-0 w-0"
                style={{
                  borderLeft: "18px solid transparent",
                  borderRight: "18px solid transparent",
                  borderBottom: "30px solid #D9A441",
                  filter: "drop-shadow(0 6px 10px rgba(217,164,65,0.35))",
                }}
              />

              {/* cream rounded square */}
              <div className="animate-float absolute bottom-[10%] right-[18%] h-14 w-14 rounded-2xl bg-[#FFF2E6] shadow-md ring-1 ring-[#8B1E2D]/10" />

              {/* central coral orb, smaller, still the anchor */}
              <div
                className="relative h-24 w-24 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle at 32% 28%, #FF9B85 0%, #FF5A5F 45%, #8B1E2D 100%)",
                  boxShadow: "0 16px 30px -10px rgba(139,30,45,0.4)",
                }}
              />

              {/* small gold dot accent */}
              <div className="animate-float absolute right-[8%] top-[42%] h-4 w-4 rounded-full bg-[#D9A441] shadow-md shadow-[#D9A441]/40" />

              {/* tiny cream dot, opposite corner for balance */}
              <div className="animate-float-rev absolute bottom-[26%] left-[8%] h-3 w-3 rounded-full bg-[#FFF2E6]" />
            </div>

            {/* Desktop: full orb scene, hidden on mobile */}
            <div className="relative mx-auto hidden h-[420px] w-[420px] items-center justify-center lg:flex">
              {/* woven dashed ring — abstract nod to Ethiopian pattern-work, geometric not literal */}
              <div className="absolute h-[92%] w-[92%] rounded-full border-2 border-dashed border-[#8B1E2D]/15" />

              {/* ground shadow */}
              <div className="absolute bottom-10 h-6 w-56 rounded-full bg-[#8B1E2D]/15 blur-2xl" />

              {/* the orb */}
              <div
                className="animate-float-slow relative h-[320px] w-[320px] rounded-full"
                style={{
                  background:
                    "radial-gradient(circle at 32% 28%, #FF9B85 0%, #FF5A5F 45%, #8B1E2D 100%)",
                  boxShadow:
                    "0 30px 60px -18px rgba(139,30,45,0.45), inset -10px -10px 30px rgba(74,16,6,0.25)",
                }}
              >
                <div className="absolute left-[18%] top-[14%] h-24 w-24 rounded-full bg-white/40 blur-lg" />
              </div>

              {/* single gold accent — used sparingly, exactly as the brand calls for */}
              <div className="animate-float absolute right-4 top-8 h-12 w-12 rounded-full bg-[#D9A441] shadow-lg shadow-[#D9A441]/40" />

              {/* "page is live" badge — the create-your-page moment, made visible */}
              <div className="absolute -top-3 left-2 flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-[#241210] shadow-md">
                <span className="h-1.5 w-1.5 rounded-full bg-[#3FA65C]" />
                Page is live
              </div>

              {/* mini dashboard card — the manage-your-business moment */}
              <div className="absolute -bottom-6 right-0 flex items-center gap-2.5 rounded-2xl bg-white px-4 py-3 shadow-[0_16px_35px_-14px_rgba(36,18,16,0.4)]">
                <div className="flex h-8 items-end gap-0.5">
                  {[6, 10, 7, 14, 11].map((h, i) => (
                    <span
                      key={i}
                      className={`w-1.5 rounded-t-sm ${
                        i === 4 ? "bg-[#FF5A5F]" : "bg-[#D9A441]/60"
                      }`}
                      style={{ height: `${h}px` }}
                    />
                  ))}
                </div>
                <div>
                  <p className="text-sm font-bold text-[#241210]">24 bookings</p>
                  <p className="text-xs font-medium text-[#3FA65C]">↑ 18% this week</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- Animated wave divider — the section's one motion signature, calm and continuous ---------- */}
      <div className="absolute inset-x-0 bottom-0 h-14 overflow-hidden leading-[0] sm:h-20 lg:h-28">
        <div className="animate-wave flex h-full w-[200%]">
          <svg
            className="h-full w-1/2 flex-shrink-0"
            viewBox="0 0 1440 120"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0,64 C240,120 480,0 720,32 C960,64 1200,120 1440,64 L1440,120 L0,120 Z"
              fill="#FFFFFF"
            />
          </svg>
          <svg
            className="h-full w-1/2 flex-shrink-0"
            viewBox="0 0 1440 120"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0,64 C240,120 480,0 720,32 C960,64 1200,120 1440,64 L1440,120 L0,120 Z"
              fill="#FFFFFF"
            />
          </svg>
        </div>
      </div>
    </section>
  );
}