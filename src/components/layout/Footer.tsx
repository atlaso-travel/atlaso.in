import Link from "next/link";
import { Globe, MessageCircle, Video, Share2 } from "lucide-react";

function AtlasoIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
      <rect width="36" height="36" rx="9" fill="#2A6DD9" />
      <circle cx="18" cy="18" r="8" stroke="white" strokeWidth="1.2" fill="none" opacity="0.7" />
      <path d="M18 10 Q22 15 18 26 Q14 15 18 10Z" fill="white" opacity="0.55" />
      <path d="M10 18 Q15 14 26 18 Q15 22 10 18Z" fill="white" opacity="0.55" />
      <line x1="18" y1="10" x2="18" y2="26" stroke="white" strokeWidth="0.5" opacity="0.3" />
      <line x1="10" y1="18" x2="26" y2="18" stroke="white" strokeWidth="0.5" opacity="0.3" />
      <circle cx="18" cy="18" r="2" fill="white" />
    </svg>
  );
}

const SOCIALS = [
  { Icon: Globe, href: "#", label: "Website" },
  { Icon: MessageCircle, href: "#", label: "Twitter" },
  { Icon: Video, href: "#", label: "YouTube" },
  { Icon: Share2, href: "#", label: "LinkedIn" },
];

const DESTINATIONS = ["Spiti Valley", "Leh Ladakh", "Meghalaya", "Coorg", "Rishikesh"];
const COMPANY = ["About", "Blog", "Careers", "Press", "Trust & Safety"];
const SUPPORT = [
  { label: "How It Works", href: "/#how-it-works" },
  { label: "For Operators", href: "/operators" },
  { label: "Contact", href: "#" },
  { label: "Report an Issue", href: "#" },
];

export default function Footer() {
  return (
    <footer className="pt-10 pb-6 sm:pt-16 sm:pb-8 bg-atlas-night">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 sm:gap-12 mb-8 sm:mb-12">
          {/* Col 1: Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-2">
              <AtlasoIcon size={28} />
              <span
                className="font-display font-bold tracking-[-0.5px] leading-none"
                style={{ fontSize: 18 }}
              >
                <span className="text-white">Atl</span>
                <span className="text-blue-400">a</span>
                <span className="text-white">so</span>
              </span>
            </Link>
            <p className="text-[10px] text-white/35 font-body mb-4">
              Your map to the right operator.
            </p>

            <div className="flex items-center gap-2 mt-3 sm:mt-4">
              {SOCIALS.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="social-icon-btn text-white/50 hover:text-white"
                >
                  <Icon size={14} />
                </a>
              ))}
            </div>

            <p className="mt-4 sm:mt-6 text-xs text-white/25 font-body">
              © 2026 Atlaso. Made with ❤️ for Indian travelers.
            </p>
          </div>

          {/* Cols 2-4: Link columns */}
          <div className="md:col-span-3">
            <div className="grid grid-cols-3 gap-4 sm:gap-6">
              {/* Col 2: Destinations */}
              <div>
                <h3 className="font-semibold text-white mb-3 sm:mb-5 text-xs uppercase tracking-wider">
                  Destinations
                </h3>
                <ul className="space-y-1 sm:space-y-2">
                  {DESTINATIONS.map((d) => (
                    <li key={d}>
                      <Link
                        href={`/search?destination=${encodeURIComponent(d)}`}
                        className="text-xs sm:text-sm text-white/45 transition-colors duration-200 hover:text-white font-body"
                      >
                        {d}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Col 3: Company */}
              <div>
                <h3 className="font-semibold text-white mb-3 sm:mb-5 text-xs uppercase tracking-wider">
                  Company
                </h3>
                <ul className="space-y-1 sm:space-y-2">
                  {COMPANY.map((item) => (
                    <li key={item}>
                      <Link
                        href="#"
                        className="text-xs sm:text-sm text-white/45 transition-colors duration-200 hover:text-white font-body"
                      >
                        {item}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Col 4: Support */}
              <div>
                <h3 className="font-semibold text-white mb-3 sm:mb-5 text-xs uppercase tracking-wider">
                  Support
                </h3>
                <ul className="space-y-1 sm:space-y-2">
                  {SUPPORT.map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className="text-xs sm:text-sm text-white/45 transition-colors duration-200 hover:text-white font-body"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/[0.08] mt-8 sm:mt-12 pt-4 sm:pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-3">
          <p className="text-xs text-white/25 font-body">
            © 2026 Atlaso. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {["Privacy Policy", "Terms of Service"].map((item) => (
              <Link
                key={item}
                href="#"
                className="text-xs text-white/25 transition-colors duration-200 hover:text-white/50 font-body"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
