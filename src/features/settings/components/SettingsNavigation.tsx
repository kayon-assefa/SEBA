import { NavLink } from "react-router-dom";

const settingsLinks = [
  { label: "General", path: "/settings/general" },
  { label: "Business", path: "/settings/business" },
  { label: "Booking", path: "/settings/booking" },
  { label: "Shop", path: "/settings/shop" },
  { label: "Page", path: "/settings/page" },
  { label: "Staff", path: "/settings/staff" },
  { label: "Notifications", path: "/settings/notifications" },
  { label: "Subscription", path: "/settings/subscription" },
  { label: "Integrations", path: "/settings/integrations" },
  { label: "Security", path: "/settings/security" },
  { label: "Data", path: "/settings/data" },
  { label: "Branches", path: "/settings/branches" },
  { label: "Danger Zone", path: "/settings/danger-zone" },
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