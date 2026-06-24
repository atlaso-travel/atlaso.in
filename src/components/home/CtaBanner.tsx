import Link from "next/link";
import Image from "next/image";

export default function CtaBanner() {
  return (
    <section className="py-6 px-4 sm:px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Card with rounded corners + background image */}
        <div className="relative rounded-3xl overflow-hidden py-24 text-center">
          {/* Background image */}
          <Image
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80"
            alt="Mountain landscape"
            fill
            sizes="100vw"
            className="object-cover object-center"
            priority={false}
          />
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/55" />
          {/* Subtle vignette */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30" />

          {/* Content */}
          <div className="relative z-10 max-w-xl mx-auto px-4">
            <h2 className="font-display font-black text-5xl md:text-6xl text-white leading-[1.08] mb-5">
              Plan Smarter.
              <br />
              Book Better.
            </h2>
            <p className="text-white/70 text-base font-body leading-relaxed mb-8">
              Compare trusted operators, transparent pricing, and real traveler
              reviews—all in one place.
            </p>
            <Link
              href="/search"
              className="inline-flex items-center bg-rose-pink text-white font-semibold text-sm px-8 py-3.5 rounded-full hover:opacity-90 hover:-translate-y-0.5 transition-all duration-200 shadow-lg"
            >
              Compare Operators
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
