"use client";

import { useState } from "react";
import { ChevronDown, MessagesSquare } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import {
  EASE_SETTLE,
  Reveal,
  Stagger,
  StaggerItem,
  useMotionProfile,
} from "@/components/motion/Reveal";
import { siteFaqs } from "@/data/faqs";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);
  const { reduced } = useMotionProfile();

  return (
    <section className="relative py-20 sm:py-24 overflow-hidden bg-faq-glow">
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">

          {/* ── The rail ──
              The header runs hard left and stays put while the answers scroll
              past it. A small floating badge overlaps the bottom edge of the
              copy block — the one bit of ornament against an otherwise plain
              panel. */}
          <div className="lg:col-span-5 lg:sticky lg:top-28">
            <Reveal>
              <h2 className="font-display font-black text-4xl md:text-[2.75rem] text-espresso leading-[1.15] tracking-display mb-4">
                Frequently Asked
                <br />
                Questions <span className="text-signature">(FAQs)</span>
              </h2>
              <p className="text-warm-taupe font-body text-[0.9375rem] leading-relaxed max-w-sm">
                Discover destinations, compare verified tour operators
                side-by-side, and book trips transparently —{" "}
                <span className="text-espresso font-semibold">
                  all in one place!
                </span>
              </p>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="relative mt-10 max-w-sm rounded-2xl bg-white/70 border border-white/80 shadow-card p-5 backdrop-blur-sm">
                <div className="flex items-start gap-3.5">
                  <span className="w-10 h-10 rounded-xl bg-white border border-blush-tint flex items-center justify-center flex-shrink-0">
                    <MessagesSquare size={16} className="text-coral-ink" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-display font-bold text-[0.9375rem] text-espresso leading-snug">
                      Still not sure?
                    </p>
                    <p className="text-warm-taupe text-[13px] font-body leading-relaxed mt-1">
                      Ask us anything before you pay — or request a callback
                      and someone will talk it through with you.
                    </p>
                    <a
                      href="mailto:support@atlaso.in"
                      className="group inline-flex items-center gap-1.5 mt-3 text-espresso font-semibold text-[13px] border-b-2 border-brand-coral/40 hover:border-brand-coral pb-0.5 transition-colors"
                    >
                      support@atlaso.in
                    </a>
                  </div>
                </div>

                {/* Floating badge — echoes the reference layout's overlapping
                    avatar bubble, tucked on the card's corner. */}
                <span className="absolute -bottom-4 -right-4 w-12 h-12 rounded-full bg-espresso-deep border-4 border-white shadow-card flex items-center justify-center">
                  <MessagesSquare size={16} className="text-white" />
                </span>
              </div>
            </Reveal>
          </div>

          {/* ── The answers ──
              Plain white pills at rest; the open question fills solid coral
              with the answer carried straight underneath in white, rather
              than a bordered card that lifts onto a separate white surface. */}
          <Stagger className="lg:col-span-7 flex flex-col gap-3.5" gap={0.05}>
            {siteFaqs.map((faq, i) => {
              const isOpen = openIndex === i;

              return (
                <StaggerItem key={faq.question}>
                  <div
                    className={`rounded-2xl overflow-hidden transition-colors duration-500 ${
                      isOpen
                        ? "bg-brand-coral shadow-card"
                        : "bg-white shadow-sm hover:shadow-card"
                    }`}
                  >
                    <button
                      onClick={() => setOpenIndex(isOpen ? -1 : i)}
                      aria-expanded={isOpen}
                      className="group w-full flex items-center gap-3 px-5 py-4 sm:py-4.5 text-left rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-muted-coral/40"
                    >
                      <span
                        className={`flex-1 min-w-0 font-body font-semibold text-[15px] sm:text-[16px] leading-snug transition-colors duration-300 ${
                          isOpen ? "text-white" : "text-coral-ink"
                        }`}
                      >
                        {faq.question}
                      </span>

                      <motion.span
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{
                          duration: reduced ? 0.15 : 0.42,
                          ease: EASE_SETTLE,
                        }}
                        className="flex-shrink-0"
                      >
                        <ChevronDown
                          size={18}
                          className={isOpen ? "text-white" : "text-warm-taupe"}
                        />
                      </motion.span>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          key="answer"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{
                            height: { duration: reduced ? 0.15 : 0.42, ease: EASE_SETTLE },
                            opacity: { duration: reduced ? 0.15 : 0.3 },
                          }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-5">
                            <p className="text-white/85 text-sm sm:text-[15px] font-body leading-[1.75]">
                              {faq.answer}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>
      </div>
    </section>
  );
}
