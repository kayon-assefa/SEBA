import Reveal from "../../../shared/components/Reveal";
const businesses = [
  {
    name: "Addis Taste Restaurant",
    category: "Restaurant",
    location: "Addis Ababa",
    rating: "4.8",
  },
  {
    name: "Beauty Studio",
    category: "Salon",
    location: "Bole",
    rating: "4.9",
  },
  {
    name: "Prime Auto Care",
    category: "Automotive",
    location: "Kazanchis",
    rating: "4.7",
  },
];

export default function FeaturedBusinesses() {
  return (
    <section className="bg-[#FFF8F3] py-28">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal>
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#FF5A5F]">
              Handpicked
            </p>
            <h2 className="text-4xl font-black tracking-tight text-[#241210] lg:text-5xl">
              Featured businesses
            </h2>
            <p className="max-w-md text-lg text-[#8A6B67]">
              A rotating shortlist of the businesses customers trust most,
              right now.
            </p>
          </div>
        </Reveal>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {businesses.map((business, i) => (
            <Reveal key={business.name} delay={i * 100}>
              <div className="group overflow-hidden rounded-[32px] bg-white shadow-[0_20px_50px_-20px_rgba(139,30,45,0.18)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_30px_60px_-20px_rgba(139,30,45,0.3)]">
                {/* Abstract shape composition standing in for photography */}
                <div className="relative h-52 overflow-hidden bg-gradient-to-br from-[#FF7A65] to-[#8B1E2D]">
                  <div className="absolute -left-8 -top-8 h-32 w-32 rounded-full bg-white/15" />
                  <div className="absolute bottom-[-40px] right-[-20px] h-40 w-40 rounded-full bg-[#241210]/10" />
                  <div className="absolute right-6 top-6 h-8 w-8 rounded-full bg-[#D9A441] shadow-lg shadow-black/10 transition-transform duration-500 group-hover:scale-125" />
                  <span className="absolute bottom-5 left-6 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-[#8B1E2D] backdrop-blur">
                    {business.category}
                  </span>
                </div>

                <div className="p-7">
                  <h3 className="text-xl font-bold text-[#241210]">
                    {business.name}
                  </h3>
                  <p className="mt-1.5 flex items-center gap-1.5 text-sm text-[#8A6B67]">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21c-4.5-4.4-7-8.1-7-11.5A7 7 0 0119 9.5C19 12.9 16.5 16.6 12 21z" />
                      <circle cx="12" cy="9.5" r="2.5" />
                    </svg>
                    {business.location}
                  </p>

                  <div className="mt-5 flex items-center justify-between">
                    <span className="flex items-center gap-1 text-sm font-bold text-[#D9A441]">
                      ★ {business.rating}
                    </span>
                    <span className="rounded-full bg-[#FFF2F2] px-3 py-1 text-xs font-bold text-[#8B1E2D]">
                      Verified
                    </span>
                  </div>

                  <button className="mt-6 w-full rounded-full bg-[#241210] py-3.5 text-sm font-bold text-white transition-colors duration-300 group-hover:bg-[#FF5A5F]">
                    View details
                  </button>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}