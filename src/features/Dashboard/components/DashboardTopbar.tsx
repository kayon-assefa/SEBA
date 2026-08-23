// File: src/features/Dashboard/components/DashboardTopbar.tsx
// Search bar and "Live" indicator removed per feedback. Now just: menu
// toggle (drives the responsive sidebar drawer below `lg`) + user identity.

import { Menu } from "lucide-react";
import { useAuth } from "../../auth/context/AuthContext";
import { useSidebar } from "../context/SidebarContext";

export default function DashboardTopbar() {
  const { user } = useAuth();
  const { setMobileOpen } = useSidebar();

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? "SE";

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-[#F0E3DE]/70 bg-white/70 px-4 backdrop-blur-xl sm:px-6">
      <button
        onClick={() => setMobileOpen(true)}
        className="seba-press flex h-9 w-9 items-center justify-center rounded-lg text-[#241413] hover:bg-[#FFF2E6] lg:hidden"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      <h2 className="text-sm font-semibold text-[#241413] sm:text-base">
        Dashboard
      </h2>

      <div className="ml-auto flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-semibold text-[#241413]">
            {user?.email?.split("@")[0] ?? "Business owner"}
          </p>
          <p className="text-xs text-[#B4A29C]">{user?.email}</p>
        </div>

        <span className="seba-gold-ring flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#FF7A6E] to-[#FF5A5F] text-xs font-bold text-white">
          {initials}
        </span>
      </div>
    </header>
  );
}
