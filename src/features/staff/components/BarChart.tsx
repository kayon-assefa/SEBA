import { useId, useState } from "react";

export function BarChart({
  data, height = 160, valueFormatter = (n: number) => String(n),
}: {
  data: { label: string; value: number }[];
  height?: number;
  valueFormatter?: (n: number) => string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const gradId = useId();
  const max = Math.max(1, ...data.map(d => d.value));
  const barW = 100 / (data.length * 1.6);
  const gap = barW * 0.6;
  const topPad = 26; // room for the always-on value labels

  return (
    <div style={{ position: "relative" }}>
      <svg viewBox={`0 0 100 ${height}`} width="100%" height={height} preserveAspectRatio="none" style={{ overflow: "visible" }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--coral)" stopOpacity="1" />
            <stop offset="100%" stopColor="var(--coral)" stopOpacity="0.55" />
          </linearGradient>
        </defs>
        {[0, 0.5, 1].map(f => (
          <line key={f} className="ss-chart-grid" x1="0" x2="100" y1={height - 24 - f * (height - 24 - topPad)} y2={height - 24 - f * (height - 24 - topPad)} />
        ))}
        {data.map((d, i) => {
          const barH = (d.value / max) * (height - 24 - topPad);
          const x = i * (barW + gap) + gap / 2;
          const y = height - 24 - barH;
          const r = Math.min(4, barW / 2, Math.max(2, barH / 2));
          return (
            <g key={i} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} style={{ cursor: "default" }}>
              {d.value > 0 && (
                <text
                  x={x + barW / 2} y={y - 6} textAnchor="middle"
                  style={{ font: "700 5px var(--font)", fill: hover === i ? "var(--text)" : "var(--text-faint)", transition: "fill .12s ease" }}
                >
                  {valueFormatter(d.value)}
                </text>
              )}
              <rect
                x={x} y={y} width={barW} height={Math.max(2, barH)} rx={r}
                fill={`url(#${gradId})`}
                opacity={hover === null || hover === i ? 1 : 0.4}
                style={{ transition: "opacity .12s ease" }}
              />
              <rect x={x} y={height - 24} width={barW} height={2} rx={1} fill="var(--border)" />
              <text className="ss-chart-label" x={x + barW / 2} y={height - 8} textAnchor="middle">{d.label}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
