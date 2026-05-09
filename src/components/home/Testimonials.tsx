"use client";

import { Star } from "lucide-react";

interface Review {
  name: string;
  init: string;
  dest: string;
  rating: number;
  text: string;
}

const ALL_REVIEWS: Review[] = [
  { name: "Rahul S", init: "RS", dest: "Spiti Valley", rating: 5, text: "Finally a platform that shows me what I'm actually paying for. Compared 4 operators in one page. Booked with confidence." },
  { name: "Priya M", init: "PM", dest: "Leh Ladakh", rating: 5, text: "The comparison table saved me ₹8,000. Saw exactly what was included vs excluded before paying." },
  { name: "Aditya N", init: "AN", dest: "Meghalaya", rating: 5, text: "Used Atlaso for Meghalaya. The root bridges trek with Nomad Tribe was beyond words. Perfect operator match." },
  { name: "Kavya R", init: "KR", dest: "Coorg", rating: 5, text: "Loved that I could see cancellation policy upfront. No surprise costs. This is how travel should be booked." },
  { name: "Siddharth R", init: "SR", dest: "Rishikesh", rating: 5, text: "Compared 3 Ladakh operators in 5 minutes. Would've taken me days on Google. Atlaso is a game changer." },
  { name: "Ananya S", init: "AS", dest: "Spiti Valley", rating: 5, text: "The verified badge actually means something. Our guide from Alpine Treks was incredibly professional." },
  { name: "Vikram P", init: "VP", dest: "Leh Ladakh", rating: 4, text: "Group of 8 found the perfect operator who could handle our size. Saved us so many WhatsApp headaches." },
  { name: "Meera J", init: "MJ", dest: "Meghalaya", rating: 5, text: "Transparent pricing, side by side. I didn't realize how different operator inclusions were until I compared." },
  { name: "Arjun K", init: "AK", dest: "Rishikesh", rating: 5, text: "Bungee + rafting combo at the best price. Trailblazers India was exactly what we needed." },
  { name: "Sneha T", init: "ST", dest: "Spiti Valley", rating: 5, text: "Atlaso showed me a budget option I never would have found. 6 days Spiti for under ₹10k. Incredible." },
  { name: "Rohan D", init: "RD", dest: "Coorg", rating: 5, text: "Cancelled last minute and got full refund because I checked cancellation policy on Atlaso before booking." },
  { name: "Ishaan M", init: "IM", dest: "Leh Ladakh", rating: 5, text: "Peak Pathways luxury camp at Pangong Lake — saw this on Atlaso comparison. Worth every rupee." },
  { name: "Divya P", init: "DP", dest: "Meghalaya", rating: 5, text: "Northeast India is underrated and Atlaso's operator list proved it. Nomad Tribe was spectacular." },
  { name: "Kartik B", init: "KB", dest: "Spiti Valley", rating: 4, text: "Himalayan Souls gave us a local homestay experience. Found them only because Atlaso listed them." },
  { name: "Nisha G", init: "NG", dest: "Rishikesh", rating: 5, text: "Super easy to compare. Saw meals, transport, guide all in one row per operator. Done in 10 minutes." },
  { name: "Amit V", init: "AV", dest: "Leh Ladakh", rating: 5, text: "Zenith Expeditions premium 10-day Ladakh. Found and compared here. Best travel decision of my life." },
];

const ROW1 = ALL_REVIEWS.slice(0, 8);
const ROW2 = ALL_REVIEWS.slice(8, 16);

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={12}
          className={i < rating ? "fill-trail-orange text-trail-orange" : "fill-map-border text-map-border"}
        />
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="flex-shrink-0 w-80 mx-3 rounded-2xl p-5 border border-map-border bg-white">
      {/* Top row */}
      <div className="flex items-start justify-between mb-2">
        <span
          className="text-5xl leading-none select-none text-compass-blue/20 font-display"
          aria-hidden
        >
          &ldquo;
        </span>
        <StarRow rating={review.rating} />
      </div>

      {/* Review text */}
      <p className="text-sm italic leading-relaxed mt-1 line-clamp-3 text-map-muted font-body">
        {review.text}
      </p>

      {/* Divider */}
      <div className="my-3 border-t border-map-border" />

      {/* Reviewer info */}
      <div className="flex items-center gap-3">
        <div className="avatar-circle">
          {review.init}
        </div>
        <div>
          <p className="font-semibold text-sm text-map-text font-display">
            {review.name}
          </p>
          <p className="text-xs text-map-muted font-body">
            Traveled to {review.dest}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Testimonials() {
  return (
    <section className="py-20 overflow-hidden bg-map-white">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-12 text-center">
        <h2 className="text-4xl font-bold mb-6 text-map-text font-display">
          10,000+ travelers trust Atlaso
        </h2>

        {/* Rating summary */}
        <div className="inline-flex items-end gap-2">
          <span className="text-5xl font-black leading-none text-compass-blue font-display">
            4.9
          </span>
          <span className="text-2xl mb-0.5 text-map-muted font-display">
            / 5.0
          </span>
          <div className="flex gap-0.5 mb-1 ml-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={18} className="fill-trail-orange text-trail-orange" />
            ))}
          </div>
        </div>
        <p className="text-sm mt-2 text-map-muted font-body">
          Based on 2,400+ reviews
        </p>
      </div>

      {/* Row 1 — scrolls left */}
      <div className="mb-4">
        <div className="marquee-track">
          {[...ROW1, ...ROW1].map((review, i) => (
            <ReviewCard key={i} review={review} />
          ))}
        </div>
      </div>

      {/* Row 2 — scrolls right */}
      <div>
        <div className="marquee-track-reverse">
          {[...ROW2, ...ROW2].map((review, i) => (
            <ReviewCard key={i} review={review} />
          ))}
        </div>
      </div>
    </section>
  );
}
