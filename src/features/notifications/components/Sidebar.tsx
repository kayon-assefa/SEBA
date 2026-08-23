// src/features/Notifications/components/Sidebar.tsx
//
// A drop-in sidebar in the same visual language as the rest of the app
// (white bg, gray-200 borders, orange-600 active state, rounded-lg items).
// If you already have a real Sidebar/Shell component elsewhere in the
// app, you almost certainly want to add ONE nav item to it instead of
// using this file - see the "Wiring it up" section in the README. This
// component exists so the Notifications page looks right out of the box
// even before you've done that.

import { NavLink } from "react-router-dom";
import {
  Bell,
  Calendar,
  LayoutGrid,
  Package,
  ShoppingBag,
  Users,
} from "lucide-react";

interface SidebarProps {
  unreadCount?: number;
}

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { to: "/orders", label: "Orders", icon: ShoppingBag },
  { to: "/appointments", label: "Appointments", icon: Calendar },
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/products", label: "Products", icon: Package },
];

export default function Sidebar({ unreadCount = 0 }: SidebarProps) {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-gray-200 bg-white md:flex">
      <div className="flex h-16 items-center gap-2 border-b border-gray-200 px-5">
        <div className="h-7 w-7 rounded-lg bg-orange-600" />
        <span className="text-sm font-semibold text-gray-900">SEBA</span>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-orange-50 text-orange-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}

        <NavLink
          to="/notifications"
          className={({ isActive }) =>
            `flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isActive
                ? "bg-orange-50 text-orange-600"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`
          }
        >
          <span className="flex items-center gap-3">
            <Bell className="h-4 w-4" />
            Notifications
          </span>
          {unreadCount > 0 && (
            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-orange-600 px-1.5 text-xs font-semibold text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </NavLink>
      </nav>
    </aside>
  );
}
