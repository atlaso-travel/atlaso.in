"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useInView } from "@/hooks/useIntersectionObserver";
import { siteFaqs } from "@/data/faqs";

const FAQS = siteFaqs.map((f) => ({ q: f.question, a: f.answer }));

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);
  const { ref, inView } = useInView(0.1);

  return (
    <section
      className="py-20 overflow-hidden"
      style={{ background: "linear-gradient(145deg,#ffffff 0%,#fff5f8 50%,#f3eeff 100%)" }}
    >
      <div ref={ref} className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-start">

          {/* ── Left: heading + description ── */}
          <div
            className={`md:sticky md:top-28 transition-all duration-700 ease-out ${
              inView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
            }`}
          >
            <h2 className="font-display font-black text-[26px] sm:text-4xl text-map-text leading-tight mb-4">
              Frequently Asked
              <br />
              Questions
              <br />
              (FAQs)
            </h2>
            <p className="text-map-muted font-body text-sm leading-relaxed">
              Discover destinations, compare verified tour operators side-by-side, and book trips
              transparently —{" "}
              <strong className="text-map-text font-semibold">all in one place!</strong>
            </p>
          </div>

          {/* ── Right: accordion ── */}
          <div className="flex flex-col gap-3">
            {FAQS.map((faq, i) => {
              const isOpen = openIndex === i;

              return (
                <div
                  key={i}
                  className={`rounded-2xl overflow-hidden transition-all duration-500 ease-out ${
                    inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                  } ${
                    isOpen
                      ? "bg-rose-pink shadow-lg shadow-rose-pink/20"
                      : "bg-white border border-map-border shadow-sm"
                  }`}
                  style={{ transitionDelay: inView ? `${200 + i * 80}ms` : "0ms" }}
                >
                  {/* Question row */}
                  <button
                    onClick={() => setOpenIndex(isOpen ? -1 : i)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left focus:outline-none"
                  >
                    <span
                      className={`font-display font-semibold text-sm leading-snug pr-3 ${
                        isOpen ? "text-white" : "text-rose-pink"
                      }`}
                    >
                      {faq.q}
                    </span>
                    {isOpen ? (
                      <ChevronUp size={18} className="text-white flex-shrink-0" />
                    ) : (
                      <ChevronDown size={18} className="text-rose-pink flex-shrink-0" />
                    )}
                  </button>

                  {/* Answer — smooth slide */}
                  <div
                    className="overflow-hidden transition-all duration-400 ease-in-out"
                    style={{ maxHeight: isOpen ? "260px" : "0px" }}
                  >
                    <div className="px-5 pb-5">
                      <div className="h-px bg-white/20 mb-3" />
                      <p className="text-white/85 text-sm font-body leading-relaxed">{faq.a}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}
