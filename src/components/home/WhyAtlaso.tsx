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
    <section className="py-20 bg-atlas-night">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold text-white mb-3 font-display">
            Why travelers choose Atlaso
          </h2>
          <p className="text-white/50 text-lg max-w-xl mx-auto font-body">
            We built the tool we always wished existed.
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map(({ Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-2xl p-8 border border-white/[0.08] bg-white/5 hover:border-white/20 transition-all duration-300"
            >
              <Icon size={32} className="text-compass-blue mb-6" />
              <h3 className="text-white font-bold text-xl mb-2 font-display">
                {title}
              </h3>
              <p className="text-white/60 text-sm leading-relaxed font-body">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
