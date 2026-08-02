"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { destinations } from "@/data/destinations";
import { generateDestinationAlt } from "@/lib/seo/altText";
import {
  EASE_SETTLE,
  Stagger,
  StaggerItem,
  useMotionProfile,
  VIEWPORT,
} from "@/components/motion/Reveal";

/* Same photograph as the hero, so the page opens and closes on one image.
   Alt text comes from the SEO helper rather than a hand-written string. */
const SUBJECT = destinations[0];

export default function CtaBanner() {
  const { reduced } = useMotionProfile();

  return (
    <section
      className="relative py-12 sm:py-16 bg-warm-ivory"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-[28px] overflow-hidden py-16 sm:py-22 text-center">
          {/* Background — the same slow drift as the hero at roughly two-thirds
              the amplitude, so the two bookends rhyme without reading as the
              identical effect run twice. */}
          <motion.div
            className="absolute -inset-[2%]"
            initial={{ scale: 1 }}
            animate={{ scale: reduced ? 1 : 1.04 }}
            transition={{
              duration: 30,
              ease: "linear",
              repeat: Infinity,
              repeatType: "reverse",
            }}
          >
            <Image
              src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80"
              alt={generateDestinationAlt({
                subject: "Sunset over the Himalayan range",
                destination: SUBJECT.name,
                region: SUBJECT.region,
              })}
              fill
              sizes="100vw"
              className="object-cover object-[center_55%]"
              priority={false}
            />
          </motion.div>

          {/* Shared photo grade, then the warm scrims */}
          <div className="photo-grade absolute inset-0" aria-hidden />

          {/* Warm overlays, matched to the hero temperature */}
          <div className="absolute inset-0 bg-[#1A100D]/62" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#140D0B]/30 via-transparent to-[#140D0B]/40" />

          {/* Content */}
          <Stagger className="relative z-10 max-w-4xl mx-auto px-5" gap={0.08}>

            {/* ── Arrival marker ──
                The page's trail line terminates alongside this section, so the
                copy arrives at a destination rather than at one more banner.
                The ring echoes the spine's terminus exactly. */}
            <StaggerItem className="flex justify-center mb-6">
              <motion.span
                className="relative flex items-center justify-center w-12 h-12"
                initial={{ scale: reduced ? 1 : 0.4, opacity: reduced ? 1 : 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={VIEWPORT}
                transition={{ duration: reduced ? 0.2 : 0.7, ease: EASE_SETTLE }}
              >
                <span className="absolute inset-0 rounded-full bg-muted-coral/20" />
                <span className="absolute inset-[9px] rounded-full bg-muted-coral" />
                <span className="absolute inset-[19px] rounded-full bg-warm-ivory" />
              </motion.span>
            </StaggerItem>

            <StaggerItem
              as="p"
              className="mono-chart text-[10px] sm:text-[11px] uppercase text-white/50 mb-5"
            >
              End of route / Your trip starts here
            </StaggerItem>

            <StaggerItem
              as="h2"
              className="font-display font-black text-[2.75rem] sm:text-6xl text-white leading-[1.05] tracking-display mb-5"
            >
              Plan smarter.
              {/* <br /> */}
              <span className="text-signature">Book better.</span>
            </StaggerItem>

            <StaggerItem as="p" className="text-white/70 text-base font-body leading-relaxed mb-9">
              Compare trusted operators, transparent pricing and real traveller
              reviews — all in one place.
            </StaggerItem>

            <StaggerItem className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.span
                className="inline-block w-full sm:w-auto"
                whileHover={
                  reduced
                    ? undefined
                    : { y: -2, boxShadow: "0 16px 40px rgba(255,90,95,0.45)" }
                }
                whileTap={reduced ? undefined : { scale: 0.985 }}
                transition={{ duration: 0.32, ease: EASE_SETTLE }}
                style={{ borderRadius: 9999 }}
              >
                <Link
                  href="/search"
                  className="bg-cta-gradient inline-flex w-full sm:w-auto items-center justify-center gap-2 text-white font-semibold text-sm px-8 py-4 rounded-full"
                >
                  Compare operators
                  <ArrowUpRight size={16} />
                </Link>
              </motion.span>

              <Link
                href="/destinations"
                className="text-white/65 hover:text-white text-sm font-semibold transition-colors duration-200"
              >
                Browse destinations
              </Link>
            </StaggerItem>
          </Stagger>
        </div>
      </div>
    </section>
  );
}
