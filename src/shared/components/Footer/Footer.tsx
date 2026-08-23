import { Link } from "react-router-dom";
import {
  Facebook,
  Instagram,
  Linkedin,
  TwitterX,
  EnvelopeFill,
  ArrowRight,
  GeoAltFill,
} from "react-bootstrap-icons";

const socialLinks = [
  { label: "Facebook", href: "https://facebook.com", Icon: Facebook },
  { label: "Instagram", href: "https://instagram.com", Icon: Instagram },
  { label: "LinkedIn", href: "https://linkedin.com", Icon: Linkedin },
  { label: "X (Twitter)", href: "https://twitter.com", Icon: TwitterX },
];

const exploreLinks = [
  { label: "Home", to: "/" },
  { label: "Businesses", to: "/businesses" },
  { label: "Categories", to: "/categories" },
];

const companyLinks = [
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
  { label: "Privacy", to: "/privacy" },
];

function FooterLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="group relative inline-flex w-fit items-center text-sm text-white transition-colors duration-300 hover:text-[#F4C97A]"
    >
      <span>{children}</span>
      <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-gradient-to-r from-[#D9A441] to-transparent transition-all duration-300 ease-out group-hover:w-full" />
    </Link>
  );
}

export default function Footer() {
  return (
    <footer className="relative isolate overflow-hidden bg-gradient-to-b from-[#850a18] via-[#5A0D18] to-[#33060D] text-white">
      {/* --- signature brand ribbon: a compressed echo of the hero shape pattern --- */}
      <div className="h-2 w-full bg-[linear-gradient(90deg,#FF5A5F_0%,#D9A441_25%,#8B1E2D_50%,#FF7A65_75%,#D9A441_100%)]" />

      {/* --- ambient background shapes --- */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-[#FF5A5F]/15 blur-3xl" />
        <div className="absolute top-1/3 -right-20 h-96 w-96 rounded-full bg-[#D9A441]/10 blur-3xl" />
        <div className="absolute -bottom-32 left-1/4 h-80 w-80 rounded-full bg-white/5 blur-3xl" />

        {/* layered geometric shapes, echoing the hero composition */}
        <div className="absolute top-16 left-[18%] h-24 w-24 rounded-full border border-white/10 bg-white/[0.03]" />
        <div className="absolute top-40 right-[14%] h-20 w-20 rounded-tl-[48px] rounded-br-[48px] bg-[#FF5A5F]/10" />
        <div className="absolute bottom-24 left-[8%] h-16 w-16 rounded-full bg-[#D9A441]/15" />
        <div className="absolute bottom-10 right-[30%] h-3 w-3 rounded-full bg-[#D9A441]/60" />
        <div className="absolute top-10 left-[45%] h-2 w-2 rounded-full bg-white/40" />

        {/* soft floating gold ring, top right corner */}
        <div className="absolute -top-10 right-10 h-24 w-24 rounded-full border border-[#D9A441]/20 bg-[#D9A441]/5 backdrop-blur-sm" />

        {/* thin gold accent line */}
        <div className="absolute top-2 left-1/2 h-px w-40 -translate-x-1/2 bg-gradient-to-r from-transparent via-[#D9A441]/40 to-transparent" />

        {/* giant watermark "S" — quiet, premium, bottom-right */}
        <span
          aria-hidden="true"
          className="absolute -bottom-24 -right-10 select-none text-[26rem] font-black leading-none text-white/[0.04]"
        >
          S
        </span>
      </div>

      {/* Glass layer */}
      <div className="relative border-t border-white/10 bg-white/[0.03] backdrop-blur-xl">
        {/* --- newsletter row --- */}
        <div className="mx-auto max-w-[90rem] px-6 pt-16 lg:px-10">
          <div className="flex flex-col items-start justify-between gap-8 rounded-[28px] border border-white/10 bg-white/[0.05] p-8 backdrop-blur-md sm:flex-row sm:items-center sm:p-10">
            <div>
              <h3 className="text-xl font-light tracking-tight text-[#FFF2E6] sm:text-2xl ">
                Stay ahead of the search.
              </h3>
              <p className="mt-2 max-w-md text-sm font-light !text-white">
                Get new businesses, features, and local tips straight to your
                inbox &mdash; no spam, ever.
              </p>
            </div>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex w-full max-w-sm items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] p-1.5 backdrop-blur-md focus-within:border-[#D9A441]/50"
            >
              <EnvelopeFill className="ml-3 h-4 w-4 shrink-0 text-white/50" aria-hidden="true" />
              <input
                type="email"
                required
                placeholder="you@business.com"
                className="w-full bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
              />
              <button
                type="submit"
                aria-label="Subscribe"
                className="group flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#D9A441] text-[#33060D] transition-all duration-300 hover:bg-[#F4C97A] hover:shadow-[0_0_20px_-2px_rgba(217,164,65,0.6)]"
              >
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              </button>
            </form>
          </div>
        </div>

        <div className="mx-auto grid max-w-[90rem] grid-cols-1 gap-14 px-6 py-20 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-16 lg:grid-cols-4 lg:gap-10 lg:px-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-3xl font-black tracking-tight text-[#FFF2E6] sm:text-4xl">SEBA</h2>
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#D9A441]" />
            </div>
            <span className="mt-2 block h-px w-10 bg-gradient-to-r from-[#D9A441] to-transparent" />
            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] !text-white">
              Book. Manage. Grow.
            </p>
            <p className="mt-5 max-w-[24ch] text-sm font-light leading-relaxed !text-white">
              Ethiopia&apos;s modern business discovery platform.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs font-medium text-white/70">
              <GeoAltFill className="h-3 w-3 text-[#D9A441]" aria-hidden="true" />
              Made in Addis Ababa
            </div>
          </div>

          {/* Explore */}
          <div>
            <h3 className="mb-6 text-xs font-semibold uppercase tracking-[0.2em] text-white">
              Explore
            </h3>
            <nav className="flex flex-col gap-4">
              {exploreLinks.map((link) => (
                <FooterLink key={link.to} to={link.to}>
                  {link.label}
                </FooterLink>
              ))}
            </nav>
          </div>

          {/* Company */}
          <div>
            <h3 className="mb-6 text-xs font-semibold uppercase tracking-[0.2em] text-white">
              Company
            </h3>
            <nav className="flex flex-col gap-4">
              {companyLinks.map((link) => (
                <FooterLink key={link.to} to={link.to}>
                  {link.label}
                </FooterLink>
              ))}
            </nav>
          </div>

          {/* Follow */}
          <div>
            <h3 className="mb-6 text-xs font-semibold uppercase tracking-[0.2em] text-white">
              Follow
            </h3>
            <div className="flex gap-3">
              {socialLinks.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="group flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white backdrop-blur-md transition-all duration-300 hover:border-[#D9A441]/40 hover:bg-[#D9A441]/15 hover:text-[#F4C97A] hover:shadow-[0_0_20px_-4px_rgba(217,164,65,0.5)]"
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="relative mx-auto max-w-[90rem] px-6 lg:px-10">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-[#D9A441]/30 to-transparent" />
          <div className="flex flex-col items-center justify-between gap-3 py-6 text-center sm:flex-row sm:text-left">
            <p className="text-xs font-light tracking-wide !text-white">
              © 2026 SEBA. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <FooterLink to="/terms">Terms</FooterLink>
              <FooterLink to="/privacy">Privacy</FooterLink>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}