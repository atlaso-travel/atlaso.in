import { Map, Shield, Zap } from "lucide-react";

const FEATURES = [
  {
    Icon: Map,
    title: "Every operator, side by side",
    desc: "See price, inclusions, guide, transport and cancellation in one comparison table.",
  },
  {
    Icon: Shield,
    title: "Verified before they're listed",
    desc: "We vet every operator personally. Verified badge means we trust them.",
  },
  {
    Icon: Zap,
    title: "Decide in minutes, not days",
    desc: "Compare 10 operators in under 2 minutes. No more WhatsApp research marathons.",
  },
];

export default function WhyAtlaso() {
  return (
    <section className="py-20 bg-atlas-night relative overflow-hidden">
      <div className="absolute -top-32 -right-24 w-[420px] h-[420px] rounded-full bg-compass-blue/20 blur-3xl" />
      <div className="absolute -bottom-40 -left-24 w-[360px] h-[360px] rounded-full bg-trail-orange/20 blur-3xl" />
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_55%)]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-xs font-semibold tracking-[0.35em] uppercase text-white/50 font-body mb-4">
            Why Atlaso
          </p>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-3 font-display">
            Why travelers choose Atlaso
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto font-body">
            We built the tool we always wished existed.
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map(({ Icon, title, desc }, index) => (
            <div
              key={title}
              className="group rounded-3xl p-8 border border-white/[0.08] bg-white/[0.06] backdrop-blur-md hover:border-white/25 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(14,22,40,0.6)]"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]">
                  <Icon size={26} className="text-compass-blue" />
                </div>
                <span className="text-xs font-semibold text-white/50 tracking-widest font-body">
                  {`0${index + 1}`}
                </span>
              </div>
              <h3 className="text-white font-bold text-xl mb-3 font-display">
                {title}
              </h3>
              <p className="text-white/70 text-sm leading-relaxed font-body">
                {desc}
              </p>
              <div className="mt-6 h-0.5 w-10 bg-compass-blue/80 rounded-full transition-all duration-300 group-hover:w-16" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
