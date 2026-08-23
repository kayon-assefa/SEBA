export default function BrandShape() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Large coral disc — top right, the primary anchor shape */}
      <div className="absolute -top-24 -right-16 h-96 w-96 rounded-full bg-[#FF5A5F] opacity-[0.16] blur-3xl" />

      {/* Gold ring overlapping the coral disc — hard edge, no blur,
          the precise Bauhaus counterpoint to the soft blur above */}
      <div className="absolute -top-10 right-10 h-64 w-64 rounded-full border-[3px] border-[#D9A441]/30" />

      {/* Small solid gold dot sitting on the ring's edge —
          a classic Bauhaus device: one small solid mark against large forms */}
      <div className="absolute top-40 right-6 h-4 w-4 rounded-full bg-[#D9A441] opacity-40" />

      {/* Deep red crescent (half-circle) — bottom left, gives weight
          without repeating "full circle" everywhere */}
      <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-[#8B1E2D] opacity-[0.12] blur-2xl" />

      {/* Thin coral ring, offset lower-left — echoes the gold ring
          above for compositional rhyme across the two clusters */}
      <div className="absolute bottom-10 left-16 h-40 w-40 rounded-full border-2 border-[#FF5A5F]/25" />

      {/* Slim horizontal rule — a Swiss-grid gesture, a single
          straight line to ground the circles against something linear */}
      <div className="absolute bottom-24 left-0 h-px w-32 bg-[#8B1E2D]/15" />

      {/* Small cream-filled dot, center-left — quiet, warm accent
          that keeps the palette from being only red/gold */}
      <div className="absolute top-1/2 left-6 h-3 w-3 rounded-full bg-[#FFF2E6] ring-1 ring-[#8B1E2D]/10" />
    </div>
  );
}