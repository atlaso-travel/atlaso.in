import Link from "next/link";

// Brand-icon SVGs (lucide-react doesn't ship these)
function LinkedinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
      <rect x="2" y="9" width="4" height="12"/>
      <circle cx="4" cy="4" r="2"/>
    </svg>
  );
}
function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  );
}
function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
      <rect x="2" y="2" width="20" height="20" rx="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
  );
}
function YoutubeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.5C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
      <polygon points="9.75,15.02 15.5,12 9.75,8.98" fill="white"/>
    </svg>
  );
}
function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.74l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}

function AtlasoIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
      {/* Outer rounded bg */}
      <rect width="34" height="34" rx="9" fill="white" fillOpacity="0.08" />
      {/* Mountain / A shape */}
      <path
        d="M17 7L28 25H6L17 7Z"
        stroke="white"
        strokeWidth="1.6"
        strokeLinejoin="round"
        fill="white"
        fillOpacity="0.12"
      />
      {/* Inner highlight peak */}
      <path
        d="M17 7L22 18H12L17 7Z"
        fill="white"
        fillOpacity="0.25"
      />
      {/* Rose-pink dot at summit */}
      <circle cx="17" cy="7" r="2.4" fill="#E91E63" />
    </svg>
  );
}

const SOCIALS = [
  { Icon: LinkedinIcon,  href: "#", label: "LinkedIn"  },
  { Icon: FacebookIcon,  href: "#", label: "Facebook"  },
  { Icon: InstagramIcon, href: "#", label: "Instagram" },
  { Icon: YoutubeIcon,   href: "#", label: "YouTube"   },
  { Icon: XIcon,         href: "#", label: "X"         },
];

const QUICK_LINKS = [
  { label: "Compare Tours",         href: "/search"        },
  { label: "Destinations",          href: "/destinations"  },
  { label: "How It Works",          href: "/#how-it-works" },
  { label: "Pricing Transparency",  href: "#"              },
];

const LEGAL = [
  { label: "Privacy Policy",     href: "#" },
  { label: "Terms & Conditions", href: "#" },
];

const COMPANY = [
  { label: "About Us",      href: "#" },
  { label: "Trust & Safety",href: "#" },
  { label: "Contact",       href: "#" },
  { label: "Help Centre",   href: "#" },
];

export default function Footer() {
  return (
    <footer className="bg-atlas-night pt-14 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr] gap-10 mb-12">

          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <AtlasoIcon />
              <span className="font-display font-bold text-xl text-white tracking-tight">
                Atlaso.in
              </span>
            </Link>
            <p className="text-white/45 text-sm font-body leading-relaxed mb-6 max-w-[240px]">
              Your trusted map to the right travel operator. Discover verified itineraries and book
              with confidence.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-2">
              {SOCIALS.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-xl bg-white/[0.07] border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.13] transition-all duration-200"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-5 font-display">Quick Links</h3>
            <ul className="space-y-3">
              {QUICK_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-white/45 text-sm font-body hover:text-white transition-colors duration-200"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-5 font-display">Legal</h3>
            <ul className="space-y-3">
              {LEGAL.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-white/45 text-sm font-body hover:text-white transition-colors duration-200"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-5 font-display">Company</h3>
            <ul className="space-y-3">
              {COMPANY.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-white/45 text-sm font-body hover:text-white transition-colors duration-200"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* ── Bottom bar ── */}
        <div className="border-t border-white/[0.08] pt-5">
          <p className="text-white/30 text-xs font-body">
            © Copyright Avalon Labs Private Limited 2025. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
}
