// File: src/features/Dashboard/components/DashboardSidebar.tsx
// Responsive priority: below `lg` this is an off-canvas drawer (opened via
// the topbar hamburger); at `lg`+ it's a collapsible rail. No logo mark —
// wordmark only, kept small per feedback.

import { NavLink } from "react-router-dom";
import {
  LayoutGrid,
  CalendarClock,
  ShoppingBag,
  Users,
  Package,
  BarChart3,
  CreditCard,
  Settings,
  ChevronsLeft,
  Bell,
  ChevronsRight,
  X,
} from "lucide-react";
import { useSidebar } from "../context/SidebarContext";

const links = [
  { name: "Dashboard", to: "/dashboard", icon: LayoutGrid, end: true },
  { name: "Appointments", to: "/dashboard/appointments", icon: CalendarClock },
  { name: "Orders", to: "/dashboard/orders", icon: ShoppingBag },
  { name: "Customers", to: "/dashboard/customers", icon: Users },
  { name: "Products", to: "/dashboard/products", icon: Package },
  { name: "Analytics", to: "/dashboard/analytics", icon: BarChart3 },
  { name: "Subscription", to: "/dashboard/subscription", icon: CreditCard },
  { name: "Settings", to: "/dashboard/settings", icon: Settings },
  { name: "Notifications", to: "/notifications", icon: Bell },
];

type Props = {
  /** Shown only when the signed-in user's language preference is Amharic. */
  languageBadge?: "am" | null;
};

export default function DashboardSidebar({ languageBadge = null }: Props) {
  const { collapsed, setCollapsed, mobileOpen, setMobileOpen } = useSidebar();

  const content = (collapsedView: boolean) => (
    <>
      <div className="flex items-center justify-between gap-2 border-b border-[#F0E3DE] p-4">
        {!collapsedView && (
          <div>
            <h1 className="text-sm font-bold tracking-wide text-[#241413]">
              SEBA
            </h1>
            {languageBadge === "am" && (
              <span className="mt-1 inline-block rounded-full bg-[#D9A441]/15 px-2 py-0.5 text-[10px] font-semibold text-[#B4841F]">
                አማርኛ
              </span>
            )}
          </div>
        )}

        {/* Mobile/tablet close */}
        <button
          onClick={() => setMobileOpen(false)}
          className="seba-press flex h-8 w-8 items-center justify-center rounded-lg text-[#6B5A56] hover:bg-[#FFF2E6] lg:hidden"
          aria-label="Close menu"
        >
          <X size={16} />
        </button>

        {/* Desktop collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="seba-press hidden h-8 w-8 items-center justify-center rounded-lg text-[#6B5A56] hover:bg-[#FFF2E6] lg:flex"
          aria-label="Toggle sidebar"
        >
          {collapsedView ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {links.map((link) => {
          const LinkIcon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={() => setMobileOpen(false)}
              title={collapsedView ? link.name : undefined}
              className={({ isActive }) =>
                `seba-press group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-gradient-to-r from-[#FF5A5F] to-[#FF7A6E] text-white shadow-[0_4px_16px_rgba(255,90,95,0.35)]"
                    : "text-[#4A3B38] hover:bg-[#FFF2E6]"
                }`
              }
            >
              <LinkIcon
                size={18}
                className="shrink-0 transition-transform group-hover:scale-110"
              />
              {!collapsedView && <span className="truncate">{link.name}</span>}
            </NavLink>
          );
        })}
      </nav>

      {!collapsedView && (
        <div className="m-3 rounded-2xl bg-gradient-to-br from-[#FFF2E6] to-[#FFE1CE] p-4 text-xs text-[#6B5A56]">
          <p className="font-semibold text-[#241413]">Book. Manage. Grow.</p>
          <p className="mt-1">
            Your storefront, bookings and shop — all in one place.
          </p>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Desktop / tablet-landscape rail */}
      <aside
        className={`sticky top-0 z-30 hidden h-screen shrink-0 flex-col border-r border-[#F0E3DE] bg-white/80 backdrop-blur-xl transition-all duration-300 lg:flex ${
          collapsed ? "w-[72px]" : "w-60"
        }`}
      >
        {content(collapsed)}
      </aside>

      {/* Mobile / tablet-portrait off-canvas drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-[#F0E3DE] bg-white shadow-2xl transition-transform duration-300 lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {content(false)}
      </aside>
    </>
  );
}
