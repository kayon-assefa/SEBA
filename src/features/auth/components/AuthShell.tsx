import type { ReactNode } from "react";
import LanguageToggle from "./LanguageToggle";
import GeometricPanel from "./GeometricPanel";
import { seba } from "../design/tokens";

/**
 * Replaces the old AuthCard. Desktop: 50/50 split — the SEBA geometric
 * mark fills the left half exactly like the uploaded logo, the form sits
 * on a plain cream panel on the right. No marketing tagline; the logo
 * panel *is* the brand statement.
 *
 * Mobile (< lg): the geometric panel collapses to a fixed-height band at
 * the top so the wordmark is still visible, and the form takes the rest
 * of the viewport with consistent, fixed padding — no shape ever pushes
 * into form spacing on small screens.
 */
export default function AuthShell({
  children,
  title,
  subtitle,
}: {
  children: ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row">
      {/* Left: geometric brand panel — desktop only shows the full version */}
      <div className="hidden h-screen w-1/2 lg:sticky lg:top-0 lg:block">
        <GeometricPanel />
      </div>

      {/* Mobile brand band */}
      <div className="h-36 w-full shrink-0 lg:hidden">
        <GeometricPanel compact />
      </div>

      {/* Right: form panel */}
      <div
        className="flex w-full flex-1 flex-col lg:w-1/2"
        style={{ background: seba.cream }}
      >
        <div className="flex justify-end px-5 pt-5 sm:px-8 sm:pt-6 lg:px-10 lg:pt-8">
          <LanguageToggle />
        </div>

        <div className="flex flex-1 items-center justify-center px-5 pb-10 pt-4 sm:px-8 lg:px-16">
          <div className="w-full max-w-sm">
            <h1
              className="text-[28px] font-black leading-tight tracking-tight sm:text-4xl"
              style={{ color: seba.ink }}
            >
              {title}
            </h1>
            <p className="mt-2.5 text-[15px] sm:mt-3 sm:text-base" style={{ color: seba.inkMuted }}>
              {subtitle}
            </p>

            <div className="mt-7 sm:mt-8">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
