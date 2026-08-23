import { Link } from "react-router-dom";
import DesktopMenu from "./DesktopMenu";
import MobileMenu from "./MobileMenu";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full">
      <nav
        className="
          relative w-full
          bg-white/60 backdrop-blur-2xl backdrop-saturate-150
          border-b border-white/40
          shadow-[0_8px_32px_-8px_rgba(255,59,48,0.08)]
        "
      >
        {/* subtle top highlight to sell the glass */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />

        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex h-16 lg:h-[68px] items-center justify-between">
            {/* Logo */}
            <Link
              to="/"
              className="text-lg font-extrabold tracking-tight text-[#FF3B30] transition-opacity hover:opacity-80"
            >
              SEBA
            </Link>

            {/* Desktop nav */}
            <DesktopMenu />

            {/* Mobile menu trigger lives inside MobileMenu */}
            <MobileMenu />
          </div>
        </div>
      </nav>
    </header>
  );
}
