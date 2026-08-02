"use client";

import { useState } from "react";
import { ArrowUpRight, MessagesSquare, Plus } from "lucide-react";
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
    <section className="relative py-20 sm:py-24 overflow-hidden bg-warm-ivory">
      <div className="absolute inset-0 wash-bottom pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">

          {/* ── The rail ──
              The header runs hard left and stays put while the answers scroll
              past it, so the section reads as a conversation with someone
              rather than a centred FAQ block with a support note bolted on the
              end. The count and the contact card live here because that is
              where a reader looks once the accordion has run out of answers. */}
          <div className="lg:col-span-5 lg:sticky lg:top-28">
            <Reveal>
              <p className="eyebrow mb-4">Answers</p>
              <h2 className="font-display font-black text-4xl md:text-5xl text-espresso leading-[1.05] tracking-display mb-4">
                Before you <span className="text-signature">book</span>
              </h2>
              <p className="text-warm-taupe font-body text-[0.9375rem] leading-relaxed max-w-sm">
                The questions travellers actually ask us, answered without the
                marketing.
              </p>

              <div className="flex items-center gap-3 mt-6 pt-6 border-t border-warm-line">
                <span className="mono-chart text-[10px] uppercase text-coral-ink">
                  {String(siteFaqs.length).padStart(2, "0")} questions
                </span>
                <span className="h-px flex-1 bg-warm-line" />
                <span className="mono-chart text-[10px] uppercase text-warm-taupe">
                  {openIndex >= 0
                    ? `reading ${String(openIndex + 1).padStart(2, "0")}`
                    : "all closed"}
                </span>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="mt-8 rounded-2xl border border-warm-line bg-warm-peach/60 p-5">
                <div className="flex items-start gap-3.5">
                  <span className="w-10 h-10 rounded-xl bg-white border border-blush-tint flex items-center justify-center flex-shrink-0">
                    <MessagesSquare size={16} className="text-coral-ink" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-display font-bold text-[0.9375rem] text-espresso leading-snug">
                      Still not sure?
                    </p>
                    <p className="text-warm-taupe text-[13px] font-body leading-relaxed mt-1">
                      Ask us anything before you pay — or request a callback on
                      any package and someone will talk it through with you.
                    </p>
                    <a
                      href="mailto:support@atlaso.in"
                      className="group inline-flex items-center gap-1.5 mt-3 text-espresso font-semibold text-[13px] border-b-2 border-brand-coral/40 hover:border-brand-coral pb-0.5 transition-colors"
                    >
                      support@atlaso.in
                      <ArrowUpRight
                        size={14}
                        className="text-coral-ink transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      />
                    </a>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>

          {/* ── The answers ──
              Each question is its own card rather than a row in a ruled list:
              closed it sits in a faint warm well, open it lifts onto white
              behind a coral hairline — the same resting/active language the
              steps in How It Works use. The index chip keeps the surveyed feel
              the ruled version had, and the topic label above each question
              gives the stack a second reading order for someone scanning for
              one thing. */}
          <Stagger className="lg:col-span-7 flex flex-col gap-2.5" gap={0.05}>
            {siteFaqs.map((faq, i) => {
              const isOpen = openIndex === i;

              return (
                <StaggerItem key={faq.question}>
                  <div
                    className={`rounded-2xl border overflow-hidden transition-colors duration-500 ${
                      isOpen
                        ? "border-blush-tint bg-white shadow-card"
                        : "border-warm-line bg-warm-peach/50 hover:bg-warm-peach hover:border-blush-tint"
                    }`}
                  >
                    <button
                      onClick={() => setOpenIndex(isOpen ? -1 : i)}
                      aria-expanded={isOpen}
                      className="group w-full flex items-start gap-3.5 p-4 sm:p-5 text-left rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-muted-coral/40"
                    >
                      <span
                        className={`w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0 transition-colors duration-500 ${
                          isOpen
                            ? "bg-brand-coral border-transparent"
                            : "bg-white/70 border-warm-line"
                        }`}
                      >
                        <span
                          className={`mono-chart text-[10px] ${
                            isOpen ? "text-white" : "text-warm-taupe"
                          }`}
                        >
                          {String(i + 1).padStart(2, "0")}
                        </span>
                      </span>

                      <span className="flex-1 min-w-0">
                        <span
                          className={`label-util block mb-1 transition-colors duration-500 ${
                            isOpen ? "text-coral-ink" : ""
                          }`}
                        >
                          {faq.topic}
                        </span>
                        <span
                          className={`block font-display font-bold text-[15px] sm:text-[16.5px] leading-snug tracking-display transition-colors duration-300 ${
                            isOpen
                              ? "text-coral-ink"
                              : "text-espresso group-hover:text-coral-ink"
                          }`}
                        >
                          {faq.question}
                        </span>
                      </span>

                      <motion.span
                        className={`w-7 h-7 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors duration-500 ${
                          isOpen
                            ? "border-blush-tint bg-blush-wash"
                            : "border-warm-line bg-white/70"
                        }`}
                        animate={{ rotate: isOpen ? 45 : 0 }}
                        transition={{
                          duration: reduced ? 0.15 : 0.42,
                          ease: EASE_SETTLE,
                        }}
                      >
                        <Plus
                          size={15}
                          className={isOpen ? "text-coral-ink" : "text-warm-taupe"}
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
                          {/* Indented to the question and carried on a coral
                              rule, so the answer reads as belonging to it
                              rather than as loose copy under a heading. */}
                          <div className="px-4 sm:px-5 pb-5">
                            <p className="ml-[2.75rem] border-l-2 border-blush-tint pl-4 text-warm-taupe text-sm sm:text-[15px] font-body leading-[1.75]">
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
