/* Partner marquee. Rendered tonally rather than in each brand's own colour —
   twelve saturated logos in a row was the second-loudest thing on the page
   after the hero gradient, and a monochrome partner strip is the more
   confident signal anyway. */
const COMPANY_LOGOS = [
  { name: "MakeMyTrip",      abbr: "MMT"  },
  { name: "Yatra.com",       abbr: "YTR"  },
  { name: "Thrillophilia",   abbr: "TH"   },
  { name: "India Hikes",     abbr: "IH"   },
  { name: "Cox & Kings",     abbr: "C&K"  },
  { name: "Thomas Cook",     abbr: "TC"   },
  { name: "SOTC Travel",     abbr: "SOTC" },
  { name: "Kesari Tours",    abbr: "KT"   },
  { name: "EaseMyTrip",      abbr: "EMT"  },
  { name: "Spiti Ecosphere", abbr: "SE"   },
  { name: "Club Mahindra",   abbr: "CM"   },
  { name: "OYO Rooms",       abbr: "OYO"  },
];

export default function PartnerStrip() {
  return (
    <section className="relative w-full max-w-5xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-6">
        <p className="text-[11px] text-warm-taupe font-body flex-shrink-0 max-w-[190px] leading-snug hidden sm:block">
          Partnering with trusted travel operators across India
        </p>

        <div className="relative flex-1 overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-warm-ivory to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-warm-ivory to-transparent z-10 pointer-events-none" />
          <div className="marquee-track" style={{ animationDuration: "42s" }}>
            {[...COMPANY_LOGOS, ...COMPANY_LOGOS].map((logo, i) => (
              <div
                key={i}
                className="flex-shrink-0 mx-3 flex items-center gap-2.5 px-4 py-2 rounded-xl border border-warm-line bg-white/70"
              >
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 bg-blush-wash text-warm-taupe border border-warm-line">
                  {logo.abbr}
                </div>
                <span className="text-sm font-medium text-warm-taupe font-body whitespace-nowrap">
                  {logo.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
