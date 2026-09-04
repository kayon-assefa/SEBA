import React from "react";

/**
 * A small, dependency-free icon set (no lucide-react / no extra npm installs
 * needed). Every icon takes the same props so they're interchangeable.
 */
type IconProps = { size?: number; className?: string; strokeWidth?: number; style?: React.CSSProperties };
const base = (size = 18, sw = 2, style?: React.CSSProperties) => ({
  width: size, height: size, viewBox: "0 0 24 24", fill: "none",
  stroke: "currentColor", strokeWidth: sw, strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
  style,
});

export const Icon = {
  Dashboard: ({ size, className, strokeWidth, style }: IconProps) => (
    <svg {...base(size, strokeWidth, style)} className={className}><rect x="3" y="3" width="7" height="9" rx="2"/><rect x="14" y="3" width="7" height="5" rx="2"/><rect x="14" y="12" width="7" height="9" rx="2"/><rect x="3" y="16" width="7" height="5" rx="2"/></svg>
  ),
  Calendar: ({ size, className, strokeWidth, style }: IconProps) => (
    <svg {...base(size, strokeWidth, style)} className={className}><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M16 3v4M8 3v4M3 10h18"/></svg>
  ),
  Bag: ({ size, className, strokeWidth, style }: IconProps) => (
    <svg {...base(size, strokeWidth, style)} className={className}><path d="M6 8h12l1 12H5L6 8z"/><path d="M9 8a3 3 0 0 1 6 0"/></svg>
  ),
  Users: ({ size, className, strokeWidth, style }: IconProps) => (
    <svg {...base(size, strokeWidth, style)} className={className}><circle cx="9" cy="8" r="3.2"/><path d="M2.5 20c0-3.5 3-6 6.5-6s6.5 2.5 6.5 6"/><path d="M16 8.2a3 3 0 1 1 3.6 3.9"/><path d="M21.5 20c-.2-2.6-1.6-4.5-3.6-5.5"/></svg>
  ),
  Bell: ({ size, className, strokeWidth, style }: IconProps) => (
    <svg {...base(size, strokeWidth, style)} className={className}><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6z"/><path d="M9.5 20a2.5 2.5 0 0 0 5 0"/></svg>
  ),
  Clock: ({ size, className, strokeWidth, style }: IconProps) => (
    <svg {...base(size, strokeWidth, style)} className={className}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg>
  ),
  Settings: ({ size, className, strokeWidth, style }: IconProps) => (
    <svg {...base(size, strokeWidth, style)} className={className}><circle cx="12" cy="12" r="3.2"/><path d="M19.4 13.5a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.9 2.9l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.9-2.9l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H2.5a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.9-2.9l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.6V2.5a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.9 2.9l-.1.1a1.7 1.7 0 0 0-.3 1.9v.1a1.7 1.7 0 0 0 1.6 1h.2a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.6 1z"/></svg>
  ),
  QR: ({ size, className, strokeWidth, style }: IconProps) => (
    <svg {...base(size, strokeWidth, style)} className={className}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14v3M14 20h3M20 20v.01"/></svg>
  ),
  Search: ({ size, className, strokeWidth, style }: IconProps) => (
    <svg {...base(size, strokeWidth, style)} className={className}><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
  ),
  Sun: ({ size, className, strokeWidth, style }: IconProps) => (
    <svg {...base(size, strokeWidth, style)} className={className}><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2.5M12 19.5V22M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2 12h2.5M19.5 12H22M4.2 19.8 6 18M18 6l1.8-1.8"/></svg>
  ),
  Moon: ({ size, className, strokeWidth, style }: IconProps) => (
    <svg {...base(size, strokeWidth, style)} className={className}><path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z"/></svg>
  ),
  Menu: ({ size, className, strokeWidth, style }: IconProps) => (
    <svg {...base(size, strokeWidth, style)} className={className}><path d="M4 6h16M4 12h16M4 18h16"/></svg>
  ),
  ChevronDown: ({ size, className, strokeWidth, style }: IconProps) => (
    <svg {...base(size, strokeWidth, style)} className={className}><path d="m6 9 6 6 6-6"/></svg>
  ),
  ChevronLeft: ({ size, className, strokeWidth, style }: IconProps) => (
    <svg {...base(size, strokeWidth, style)} className={className}><path d="m15 18-6-6 6-6"/></svg>
  ),
  Check: ({ size, className, strokeWidth, style }: IconProps) => (
    <svg {...base(size, strokeWidth, style)} className={className}><path d="M20 6 9 17l-5-5"/></svg>
  ),
  CheckCircle: ({ size, className, strokeWidth, style }: IconProps) => (
    <svg {...base(size, strokeWidth, style)} className={className}><circle cx="12" cy="12" r="9"/><path d="m8 12.5 2.5 2.5L16 9.5"/></svg>
  ),
  X: ({ size, className, strokeWidth, style }: IconProps) => (
    <svg {...base(size, strokeWidth, style)} className={className}><path d="M18 6 6 18M6 6l12 12"/></svg>
  ),
  XCircle: ({ size, className, strokeWidth, style }: IconProps) => (
    <svg {...base(size, strokeWidth, style)} className={className}><circle cx="12" cy="12" r="9"/><path d="m9 9 6 6M15 9l-6 6"/></svg>
  ),
  AlertTriangle: ({ size, className, strokeWidth, style }: IconProps) => (
    <svg {...base(size, strokeWidth, style)} className={className}><path d="M10.3 3.9 2.4 18a1.7 1.7 0 0 0 1.5 2.6h16.2a1.7 1.7 0 0 0 1.5-2.6L13.7 3.9a1.7 1.7 0 0 0-3.4 0z"/><path d="M12 9.5v4M12 17h.01"/></svg>
  ),
  Info: ({ size, className, strokeWidth, style }: IconProps) => (
    <svg {...base(size, strokeWidth, style)} className={className}><circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.5h.01"/></svg>
  ),
  Plus: ({ size, className, strokeWidth, style }: IconProps) => (
    <svg {...base(size, strokeWidth, style)} className={className}><path d="M12 5v14M5 12h14"/></svg>
  ),
  Edit: ({ size, className, strokeWidth, style }: IconProps) => (
    <svg {...base(size, strokeWidth, style)} className={className}><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>
  ),
  Trash: ({ size, className, strokeWidth, style }: IconProps) => (
    <svg {...base(size, strokeWidth, style)} className={className}><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>
  ),
  Phone: ({ size, className, strokeWidth, style }: IconProps) => (
    <svg {...base(size, strokeWidth, style)} className={className}><path d="M4 4h4l2 5-2.5 1.5a12 12 0 0 0 6 6L15 14l5 2v4a2 2 0 0 1-2.2 2A17 17 0 0 1 2 4.2 2 2 0 0 1 4 4z"/></svg>
  ),
  Mail: ({ size, className, strokeWidth, style }: IconProps) => (
    <svg {...base(size, strokeWidth, style)} className={className}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>
  ),
  Star: ({ size, className, strokeWidth, style }: IconProps) => (
    <svg {...base(size, strokeWidth, style)} className={className}><path d="M12 2.5l2.9 6 6.6.7-4.9 4.6 1.3 6.5L12 16.9l-5.9 3.4 1.3-6.5-4.9-4.6 6.6-.7L12 2.5z"/></svg>
  ),
  TrendUp: ({ size, className, strokeWidth, style }: IconProps) => (
    <svg {...base(size, strokeWidth, style)} className={className}><path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/></svg>
  ),
  TrendDown: ({ size, className, strokeWidth, style }: IconProps) => (
    <svg {...base(size, strokeWidth, style)} className={className}><path d="M3 7l6 6 4-4 8 8"/><path d="M15 17h6v-6"/></svg>
  ),
  Camera: ({ size, className, strokeWidth, style }: IconProps) => (
    <svg {...base(size, strokeWidth, style)} className={className}><path d="M4 8h3l2-2.5h6L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13.5" r="3.5"/></svg>
  ),
  RefreshCw: ({ size, className, strokeWidth, style }: IconProps) => (
    <svg {...base(size, strokeWidth, style)} className={className}><path d="M20 11a8 8 0 0 0-14.9-3.5M4 4v4h4"/><path d="M4 13a8 8 0 0 0 14.9 3.5M20 20v-4h-4"/></svg>
  ),
  Filter: ({ size, className, strokeWidth, style }: IconProps) => (
    <svg {...base(size, strokeWidth, style)} className={className}><path d="M4 5h16l-6 8v6l-4 2v-8L4 5z"/></svg>
  ),
  Download: ({ size, className, strokeWidth, style }: IconProps) => (
    <svg {...base(size, strokeWidth, style)} className={className}><path d="M12 3v13m0 0-4-4m4 4 4-4"/><path d="M4 19h16"/></svg>
  ),
  Lock: ({ size, className, strokeWidth, style }: IconProps) => (
    <svg {...base(size, strokeWidth, style)} className={className}><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>
  ),
  Grip: ({ size, className, strokeWidth, style }: IconProps) => (
    <svg {...base(size, strokeWidth, style)} className={className}><circle cx="9" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="18" r="1"/></svg>
  ),
  Tag: ({ size, className, strokeWidth, style }: IconProps) => (
    <svg {...base(size, strokeWidth, style)} className={className}><path d="M20.5 12.5 12 21l-9-9L11.5 3.5H20a1 1 0 0 1 1 1v8z"/><circle cx="15.5" cy="7.5" r="1.3"/></svg>
  ),
  Command: ({ size, className, strokeWidth, style }: IconProps) => (
    <svg {...base(size, strokeWidth, style)} className={className}><path d="M9 6a2.5 2.5 0 1 0-2.5 2.5H9V6z"/><path d="M15 6a2.5 2.5 0 1 1 2.5 2.5H15V6zM9 18a2.5 2.5 0 1 1-2.5-2.5H9V18zM15 18a2.5 2.5 0 1 0 2.5-2.5H15V18z"/><rect x="9" y="8.5" width="6" height="7"/></svg>
  ),
  Package: ({ size, className, strokeWidth, style }: IconProps) => (
    <svg {...base(size, strokeWidth, style)} className={className}><path d="m21 8-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8M12 13v8"/></svg>
  ),
  LogOut: ({ size, className, strokeWidth, style }: IconProps) => (
    <svg {...base(size, strokeWidth, style)} className={className}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/></svg>
  ),
  Globe: ({ size, className, strokeWidth, style }: IconProps) => (
    <svg {...base(size, strokeWidth, style)} className={className}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>
  ),
  Rows: ({ size, className, strokeWidth, style }: IconProps) => (
    <svg {...base(size, strokeWidth, style)} className={className}><rect x="3" y="4" width="18" height="5" rx="1.5"/><rect x="3" y="15" width="18" height="5" rx="1.5"/></svg>
  ),
  Columns: ({ size, className, strokeWidth, style }: IconProps) => (
    <svg {...base(size, strokeWidth, style)} className={className}><rect x="3" y="4" width="5" height="16" rx="1.5"/><rect x="9.5" y="4" width="5" height="10" rx="1.5"/><rect x="16" y="4" width="5" height="13" rx="1.5"/></svg>
  ),
};
