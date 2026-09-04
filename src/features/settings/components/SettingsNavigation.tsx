import { NavLink } from "react-router-dom";

const settingsLinks = [
  { label: "General", path: "/dashboard/settings?section=general" },
  { label: "Business", path: "/dashboard/settings?section=business" },
  { label: "Booking", path: "/dashboard/settings?section=booking" },
  { label: "Shop", path: "/dashboard/settings?section=shop" },
  { label: "Page", path: "/dashboard/settings?section=page" },
  { label: "Staff", path: "/dashboard/settings?section=staff" },
  { label: "Notifications", path: "/dashboard/settings?section=notifications" },
  { label: "Subscription", path: "/dashboard/subscription" },
  { label: "Integrations", path: "/dashboard/settings?section=integrations" },
  { label: "Security", path: "/dashboard/settings?section=security" },
  { label: "Data", path: "/dashboard/settings?section=data" },
  { label: "Branches", path: "/dashboard/settings?section=branches" },
  { label: "Danger Zone", path: "/dashboard/settings?section=danger" },
];

export default function SettingsNavigation() {
  return (
    <nav
      aria-label="Settings navigation"
      className="flex gap-1 overflow-x-auto py-2 scrollbar-hide"
    >
      {settingsLinks.map((link) => (
        <NavLink
          key={link.path}
          to={link.path}
          className={({ isActive }) =>
            [
              "shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition",
              isActive
                ? "bg-gray-900 text-white"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
            ].join(" ")
          }
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
}
