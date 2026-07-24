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
    <div className="hidden lg:flex items-center justify-between w-full">
      {/* Navigation */}
      <nav className="flex items-center gap-8 ml-10">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              `relative text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "text-[#FF5A5F]"
                  : "text-gray-700 hover:text-[#FF5A5F]"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {link.name}

                {isActive && (
                  <span className="absolute left-0 -bottom-2 h-[3px] w-full rounded-full bg-[#FF5A5F]" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Right Side */}
      <div className="flex items-center gap-3">
       <NavLink to="/login">
  <Button
    variant="ghost"
    className="rounded-full px-6 text-gray-700 hover:text-[#FF5A5F]"
  >
    Login
  </Button>
</NavLink>
<NavLink to="/register">
  <Button
    variant="ghost"
    className="rounded-full px-6 text-gray-700 hover:text-[#FF5A5F]"
  >
    Register
  </Button>
</NavLink>
      </div>
    </div>
  );
}