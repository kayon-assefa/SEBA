import { seba } from "../design/tokens";

/**
 * Rebuilds the visual language of the SEBA logo as a live layout instead of
 * a static image: a red field, a loose grid of pink circles / quarter-circles
 * / half-circles / a diagonal cut, and the bold black wordmark sitting on
 * top. Three flat colors only — exactly what the logo uses, nothing added.
 *
 * Desktop: fills the left half of the split auth layout.
 * Mobile: not rendered (see AuthShell) — the shapes reappear only as a thin
 * decorative strip so the form stays the focus on small screens.
 */
export default function GeometricPanel({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{ background: seba.red }}
      aria-hidden="true"
    >
      {/* grid of flat pink shapes, positioned like the logo's tile grid */}
      <div className="absolute inset-0 grid grid-cols-4 grid-rows-4">
        <div className="relative border border-black/0">
          <div
            className="absolute left-[-10%] top-[-10%] h-[65%] w-[65%] rounded-full"
            style={{ background: seba.pink }}
          />
        </div>
        <div className="relative">
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, transparent 49.3%, ${seba.pink} 50%)`,
            }}
          />
        </div>
        <div className="relative">
          <div
            className="absolute right-[-15%] top-[-25%] h-[140%] w-[70%] rounded-b-full"
            style={{ background: seba.pink }}
          />
        </div>
        <div className="relative overflow-hidden">
          <div
            className="absolute inset-[10%] rounded-full"
            style={{ background: seba.pink }}
          />
        </div>

        <div />
        <div />
        <div className="relative overflow-hidden">
          <div
            className="absolute left-1/2 top-1/2 h-[85%] w-[85%] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ background: seba.pink }}
          />
        </div>
        <div className="relative">
          <div
            className="absolute right-[10%] top-[15%] h-[35%] w-[35%]"
            style={{ background: seba.pink }}
          />
        </div>

        <div className="relative overflow-hidden">
          <div
            className="absolute bottom-[-20%] left-[-10%] h-[80%] w-[80%] rounded-full"
            style={{ background: seba.pink }}
          />
        </div>
        <div />
        <div className="relative">
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(-45deg, transparent 49.3%, ${seba.pink} 50%)`,
            }}
          />
        </div>
        <div />

        <div className="relative overflow-hidden">
          <div
            className="absolute bottom-[-30%] left-[10%] h-[90%] w-[90%] rounded-full"
            style={{ background: seba.pink }}
          />
        </div>
        <div className="relative overflow-hidden">
          <div
            className="absolute bottom-[-35%] left-1/2 h-[95%] w-[95%] -translate-x-1/2 rounded-full"
            style={{ background: seba.pink }}
          />
        </div>
        <div className="relative">
          <div
            className="absolute bottom-[15%] left-[20%] h-[30%] w-[30%] rounded-full"
            style={{ background: seba.pink }}
          />
        </div>
        <div className="relative">
          <div
            className="absolute bottom-[20%] right-[10%] h-[45%] w-[45%]"
            style={{
              background: `linear-gradient(45deg, transparent 49.3%, ${seba.pink} 50%)`,
            }}
          />
        </div>
      </div>

      {/* bold wordmark, centered, exactly as in the logo */}
      {!compact && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="select-none text-[18vw] font-black leading-none tracking-tight xl:text-[9rem]"
            style={{ color: seba.black }}
          >
            SEBA
          </span>
        </div>
      )}

      {compact && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="select-none text-5xl font-black leading-none tracking-tight"
            style={{ color: seba.black }}
          >
            SEBA
          </span>
        </div>
      )}
    </div>
  );
}
