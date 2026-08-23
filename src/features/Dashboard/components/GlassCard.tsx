// File: src/features/Dashboard/components/GlassCard.tsx
// Apple-style "liquid glass" surface: blurred translucent panel with a
// specular highlight sweep (defined in styles/dashboard-theme.css).

import { forwardRef } from "react";

type Props = {
  children: React.ReactNode;
  className?: string;
  strong?: boolean;
  hover?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
  as?: "div" | "button";
};

const GlassCard = forwardRef<HTMLDivElement, Props>(function GlassCard(
  { children, className = "", strong = false, hover = true, onClick, style, as = "div" },
  ref
) {
  const classes = [
    "seba-glass min-w-0 max-w-full overflow-hidden",
    strong ? "seba-glass-strong" : "",
    hover ? "seba-card-hover" : "",
    onClick ? "cursor-pointer seba-press" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (as === "button") {
    return (
      <button
        onClick={onClick}
        className={`${classes} text-left w-full`}
        style={style}
      >
        {children}
      </button>
    );
  }

  return (
    <div ref={ref} onClick={onClick} className={classes} style={style}>
      {children}
    </div>
  );
});

export default GlassCard;
