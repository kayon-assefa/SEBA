import { useMemo } from "react";
import QRCode from "qrcode";

type Props = {
  value: string;
  size?: number;
  /** Text shown inside the center emblem, e.g. shop initial */
  emblemText?: string;
};

/**
 * Renders a QR code with dot-style modules, wrapped in a thick dark-orange
 * circular ring, with a small round emblem in the center.
 *
 * Uses error-correction level "H" (~30% recoverable) so the center emblem
 * doesn't break scanning. Keep the emblem small (it's capped below).
 */
export default function QRCodeBadge({
  value,
  size = 220,
  emblemText = "S",
}: Props) {
  const matrix = useMemo(() => {
    const code = QRCode.create(value, {
      errorCorrectionLevel: "H",
    });
    return code.modules;
  }, [value]);

  const moduleCount = matrix.size;
  const quietZone = 2; // modules of padding
  const totalModules = moduleCount + quietZone * 2;
  const moduleSize = size / totalModules;

  const dots: { x: number; y: number }[] = [];

  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (matrix.get(row, col)) {
        dots.push({
          x: (col + quietZone) * moduleSize,
          y: (row + quietZone) * moduleSize,
        });
      }
    }
  }

  const center = size / 2;
  const emblemRadius = size * 0.11;
  const ringThickness = size * 0.07;
  const outerSize = size + ringThickness * 2;

  return (
    <div
      className="relative flex items-center justify-center rounded-full bg-white p-0 shadow-sm"
      style={{
        width: outerSize,
        height: outerSize,
        border: `${ringThickness}px solid #C2410C`,
        boxShadow:
          "0 0 0 3px #FFF7ED, 0 6px 16px rgba(194,65,12,0.18)",
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="rounded-2xl bg-white"
      >
        <rect
          x={0}
          y={0}
          width={size}
          height={size}
          rx={size * 0.06}
          fill="#FFFFFF"
        />

        {dots.map((dot, index) => (
          <circle
            key={index}
            cx={dot.x + moduleSize / 2}
            cy={dot.y + moduleSize / 2}
            r={moduleSize * 0.46}
            fill="#1C1917"
          />
        ))}

        {/* Center emblem cutout + badge */}
        <circle
          cx={center}
          cy={center}
          r={emblemRadius + moduleSize * 0.6}
          fill="#FFFFFF"
        />
        <circle
          cx={center}
          cy={center}
          r={emblemRadius}
          fill="#C2410C"
        />
        <text
          x={center}
          y={center}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={emblemRadius * 1.15}
          fontWeight={700}
          fill="#FFF7ED"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          {emblemText.slice(0, 1).toUpperCase()}
        </text>
      </svg>
    </div>
  );
}
