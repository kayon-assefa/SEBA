import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  textClassName?: string;
  iconOnly?: boolean;
};

export default function Logo({
  className,
  textClassName,
  iconOnly = false,
}: LogoProps) {
  return (
    <Link
      to="/"
      className={cn(
        "flex items-center gap-3 select-none transition-opacity hover:opacity-90",
        className
      )}
    >
      {/* Logo Icon */}
      <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-[#FF5A5F] shadow-lg shadow-[#FF5A5F]/30">
        {/* Background Decoration */}
        <div className="absolute -right-3 -top-3 h-7 w-7 rounded-full bg-[#D9A441]/70 blur-sm" />

        <div className="absolute bottom-0 left-0 h-5 w-5 rounded-tr-full bg-[#8B1E2D]" />

        {/* S */}
        <span className="relative text-xl font-black tracking-tight text-white">
          S
        </span>
      </div>

      {!iconOnly && (
        <div className="flex flex-col leading-none">
          <span
            className={cn(
              "text-2xl font-extrabold tracking-tight text-[#1E1E1E]",
              textClassName
            )}
          >
            SEBA
          </span>

          <span className="text-xs tracking-[0.25em] uppercase text-gray-500">
            Discover Ethiopia
          </span>
        </div>
      )}
    </Link>
  );
}