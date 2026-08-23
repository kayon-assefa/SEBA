import { useState } from "react";
import { createPortal } from "react-dom";
import { NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "../../../components/ui/button";

const links = [
  { name: "Home", path: "/" },
  { name: "Businesses", path: "/businesses" },
  { name: "Categories", path: "/categories" },
  { name: "About", path: "/about" },
  { name: "Contact", path: "/contact" },
];

export default function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Hamburger */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden rounded-xl p-2 text-gray-700 hover:bg-white/60 hover:text-[#FF3B30] transition-colors"
        aria-label="Open Menu"
      >
        <Menu size={24} />
      </button>

      {/* Portal escapes the navbar's backdrop-blur containing block,
          so fixed positioning works correctly on mobile */}
      {createPortal(
        <>
          {/* Overlay */}
          <div
            onClick={() => setOpen(false)}
            className={`fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
              open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            }`}
          />

          {/* Drawer */}
          <aside
            className={`
              fixed right-0 top-0 z-[101] flex h-[100dvh] w-[85vw] max-w-sm flex-col
              bg-white/60 backdrop-blur-3xl backdrop-saturate-[1.8]
              border-l border-white/60
              shadow-[-16px_0_50px_-12px_rgba(0,0,0,0.25)]
              transition-transform duration-300 ease-out
              ${open ? "translate-x-0" : "translate-x-full"}
            `}
          >
            {/* soft liquid highlight along the top edge */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/50 to-transparent" />
            {/* soft red glow bleeding in from the edge, sells "liquid" over "flat glass" */}
            <div className="pointer-events-none absolute -left-10 top-1/3 h-56 w-56 rounded-full bg-[#FF3B30]/10 blur-3xl" />

            {/* Header */}
            <div className="relative flex items-center justify-between border-b border-white/40 px-6 py-5">
              <h2 className="text-lg font-bold text-[#1E1E1E]">Menu</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full p-2 text-gray-600 hover:bg-white/70 hover:text-[#FF3B30] transition-colors"
                aria-label="Close Menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Links */}
            <nav className="relative flex flex-col gap-1 p-4">
              {links.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  end={link.path === "/"}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `rounded-xl px-4 py-3 text-[15px] font-medium transition-colors duration-200 ${
                      isActive
                        ? "bg-[#FF3B30] text-white shadow-[0_4px_14px_rgba(255,59,48,0.35)]"
                        : "text-gray-700 hover:bg-white/60"
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              ))}
            </nav>

            {/* Bottom Buttons */}
            <div className="relative mt-auto border-t border-white/40 p-5 space-y-3">
              <NavLink to="/login" onClick={() => setOpen(false)}>
                <Button
                  variant="outline"
                  className="w-full rounded-full h-11 border-gray-300/70 bg-white/40 backdrop-blur-sm text-gray-700 hover:text-[#FF3B30] hover:border-[#FF3B30]/40 transition-all"
                >
                  Login
                </Button>
              </NavLink>

              <NavLink to="/register" onClick={() => setOpen(false)}>
                <Button className="w-full rounded-full h-11 bg-[#FF3B30] text-white font-semibold shadow-[0_4px_14px_rgba(255,59,48,0.35)] hover:bg-[#e8352b] transition-all">
                  Register
                </Button>
              </NavLink>
            </div>
          </aside>
        </>,
        document.body
      )}
    </>
  );
}