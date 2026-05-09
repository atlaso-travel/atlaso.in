import Link from "next/link";

export default function CtaBanner() {
  return (
    <section className="py-16 relative overflow-hidden bg-compass-blue">
      {/* Dot pattern overlay */}
      <div className="absolute inset-0 bg-cta-dots" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight font-display">
          Your next adventure starts here.
        </h2>
        <p className="text-white/70 text-lg mb-8 max-w-lg mx-auto font-body">
          Join 10,000+ travelers who compare smarter on Atlaso.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
          <Link
            href="/search"
            className="bg-white text-compass-blue font-bold px-8 py-3.5 rounded-full transition-all duration-200 hover:scale-105 font-display"
          >
            Search Destinations
          </Link>
          <Link
            href="/operators"
            className="border-2 border-white/60 text-white font-semibold px-8 py-3.5 rounded-full hover:border-white hover:bg-white/10 transition-all duration-200 font-body"
          >
            List Your Packages
          </Link>
        </div>
      </div>
    </section>
  );
}
