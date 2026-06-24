"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Heart } from "lucide-react";

function AtlasoIcon({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
      <rect width="36" height="36" rx="9" fill="#FF5A5F" />
      <circle cx="18" cy="18" r="8" stroke="white" strokeWidth="1.2" fill="none" opacity="0.7" />
      <path d="M18 10 Q22 15 18 26 Q14 15 18 10Z" fill="white" opacity="0.55" />
      <path d="M10 18 Q15 14 26 18 Q15 22 10 18Z" fill="white" opacity="0.55" />
      <line x1="18" y1="10" x2="18" y2="26" stroke="white" strokeWidth="0.5" opacity="0.3" />
      <line x1="10" y1="18" x2="26" y2="18" stroke="white" strokeWidth="0.5" opacity="0.3" />
      <circle cx="18" cy="18" r="2" fill="white" />
    </svg>
  );
}

function AtlasoWordmark({ size = 20 }: { size?: number }) {
  return (
    <span
      className="font-display font-bold tracking-[-0.5px] leading-none"
      style={{ fontSize: size }}
    >
      <span className="text-white">Atl</span>
      <span style={{ color: "#FF5A5F" }}>a</span>
      <span className="text-white">so</span>
    </span>
  );
}

const NAV_LINKS = [
  { href: "/destinations", label: "Destinations" },
  // { href: "/#how-it-works", label: "How It Works" },
  { href: "/saved", label: "Saved Trips" },
  { href: "/comparisons", label: "My Comparisons" },
  { href: "/operators", label: "For Operators" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-white/5 bg-atlas-night">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
          <AtlasoIcon size={36} />
          <div className="flex flex-col">
            <AtlasoWordmark size={20} />
            <span className="hidden sm:block text-[10px] text-white/35 tracking-[0.02em] font-body mt-px">
              Your map to the right operator.
            </span>
          </div>
        </Link>

        {/* Center nav links */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-white/60 hover:text-white text-sm transition-colors duration-200 font-medium"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right buttons */}
        <div className="hidden md:flex items-center gap-3">
          {/* <Link
            href="/saved"
            className="relative p-2 text-white/50 hover:text-[#F43F5E] transition-colors duration-200"
            title="Saved trips"
          >
            <Heart size={18} />
          </Link> */}
          <Link
            href="/operators"
             className="bg-compass-blue text-white rounded-full px-5 py-1.5 text-sm font-semibold transition-all duration-200 hover:opacity-90"
            // className="border border-white/20 text-white/70 rounded-full px-4 py-1.5 text-sm hover:border-white/40 hover:text-white transition-all duration-200"
          >
            List Your Package
          </Link>
          {/* <Link
            href="/search"
            className="border border-white/20 text-white/70 rounded-full px-4 py-1.5 text-sm hover:border-white/40 hover:text-white transition-all duration-200"
            
            className="bg-compass-blue text-white rounded-full px-5 py-1.5 text-sm font-semibold transition-all duration-200 hover:opacity-90"
          >
            Search Trips
          </Link> */}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-white p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile fullscreen overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 md:hidden bg-atlas-night">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(255,90,95,0.25),transparent_45%),radial-gradient(circle_at_80%_85%,rgba(249,115,22,0.18),transparent_50%)]" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B162A]/40 via-[#0A1628] to-[#07101E]" />

          <button
            className="absolute top-4 right-4 text-white p-2 rounded-full bg-white/10 border border-white/10"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={22} />
          </button>

          <div className="relative z-10 h-full flex flex-col justify-center px-6">
            <div className="max-w-sm w-full mx-auto">
              <div className="flex items-center gap-3 mb-8">
                <AtlasoIcon size={32} />
                <div>
                  <AtlasoWordmark size={22} />
                  <p className="text-white/45 text-xs mt-1 font-body">
                    Find the right operator, faster.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="group flex items-center justify-between px-4 py-3 rounded-2xl bg-white/[0.06] border border-white/10 text-white text-lg font-semibold transition-all hover:bg-white/[0.12] hover:border-white/30"
                    onClick={() => setMenuOpen(false)}
                  >
                    <span>{link.label}</span>
                    <span className="text-white/40 group-hover:text-white">→</span>
                  </Link>
                ))}
              </div>

              <div className="flex flex-col gap-3 mt-8">
                <Link
                  href="/operators"
                  className="w-full border border-white/20 text-white text-center text-base font-semibold px-6 py-3 rounded-full hover:border-white/40 transition-all"
                  onClick={() => setMenuOpen(false)}
                >
                  List Your Package
                </Link>
                {/* <Link
                  href="/search"
                  className="w-full bg-compass-blue text-white text-center text-base font-bold px-6 py-3 rounded-full hover:opacity-90 transition-all"
                  onClick={() => setMenuOpen(false)}
                >
                  Search Trips
                </Link> */}
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
