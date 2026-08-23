import { NavLink } from "react-router-dom";
import { Button } from "../../../components/ui/button";

const links = [
  { name: "Home", path: "/" },
  { name: "Businesses", path: "/businesses" },
  { name: "Categories", path: "/categories" },
  { name: "About", path: "/about" },
  { name: "Contact", path: "/contact" },
];

export default function DesktopMenu() {
  return (
    <div className="hidden lg:flex items-center justify-between flex-1 ml-12">
      {/* Navigation */}
      <nav className="flex items-center gap-9 mx-auto">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            end={link.path === "/"}
            className={({ isActive }) =>
              `relative py-2 text-[13px] font-medium tracking-wide transition-colors duration-200 ${
                isActive
                  ? "text-[#FF3B30]"
                  : "text-gray-600 hover:text-[#1E1E1E]"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {link.name}
                <span
                  className={`absolute left-0 -bottom-0.5 h-[2px] w-full rounded-full bg-[#FF3B30] transition-all duration-300 ${
                    isActive ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
                  }`}
                />
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Right Side */}
      <div className="flex items-center gap-2">
        <NavLink to="/login">
          <Button
            variant="ghost"
            className="rounded-full px-5 h-9 text-[13px] font-medium text-gray-700 hover:text-[#FF3B30] hover:bg-white/60 backdrop-blur-sm transition-all"
          >
            Login
          </Button>
        </NavLink>

        <NavLink to="/register">
          <Button
            className="rounded-full px-6 h-9 text-[13px] font-semibold bg-[#FF3B30] text-white shadow-[0_4px_14px_rgba(255,59,48,0.35)] hover:bg-[#e8352b] hover:shadow-[0_6px_18px_rgba(255,59,48,0.45)] transition-all duration-200"
          >
            Register
          </Button>
        </NavLink>
      </div>
    </div>
  );
}