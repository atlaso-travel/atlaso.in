"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ShieldCheck,
  RefreshCcw,
  Headphones,
  CheckCircle2,
  XCircle,
  ChevronDown,
  Calendar,
  Users,
  Hotel,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import StarRating from "@/components/ui/StarRating";
import Badge from "@/components/ui/Badge";
import ReviewCard from "@/components/ui/ReviewCard";
import { packages } from "@/data/packages";
import { formatPrice } from "@/lib/utils";

export default function PackageDetailPage() {
  const { id } = useParams<{ id: string }>();
  const pkg = packages.find((p) => p.id === id);
  const [activeTab, setActiveTab] = useState<"itinerary" | "inclusions" | "reviews">("itinerary");
  const [openDays, setOpenDays] = useState<number[]>([1]);

  if (!pkg) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen flex items-center justify-center bg-map-white">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-map-text font-display mb-2">
              Package not found
            </h1>
            <Link href="/search" className="text-compass-blue hover:underline font-body">
              ← Back to search
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const toggleDay = (day: number) =>
    setOpenDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );

  const tabs = ["itinerary", "inclusions", "reviews"] as const;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-map-white">
        {/* Breadcrumb */}
        <div className="border-b border-map-border bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 text-sm text-map-muted font-body">
            <Link href="/" className="hover:text-compass-blue transition-colors">
              Home
            </Link>
            <span>›</span>
            <Link
              href={`/search?destination=${pkg.destinationId}`}
              className="hover:text-compass-blue transition-colors"
            >
              {pkg.destinationId.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
            </Link>
            <span>›</span>
            <span className="text-map-text font-medium">{pkg.operatorName}</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <Link
            href="/search"
            className="inline-flex items-center gap-2 text-compass-blue text-sm mb-6 hover:underline font-body"
          >
            <ArrowLeft size={15} />
            Back to Results
          </Link>

          {/* Image gallery */}
          <div className="grid grid-cols-3 gap-3 rounded-2xl overflow-hidden mb-10 h-64 md:h-80">
            <div className="col-span-2 relative">
              <Image
                src={pkg.images[0]}
                alt={pkg.title}
                fill
                sizes="(max-width: 768px) 100vw, 60vw"
                className="object-cover"
                priority
              />
            </div>
            <div className="flex flex-col gap-3">
              {pkg.images.slice(1, 3).map((img, i) => (
                <div key={i} className="relative flex-1 overflow-hidden">
                  <Image
                    src={img}
                    alt={`${pkg.title} ${i + 2}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 30vw"
                    className="object-cover"
                  />
                  {i === 1 && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="text-white text-sm font-semibold bg-black/60 rounded-full px-3 py-1">
                        View all {pkg.images.length} photos
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 2-col layout */}
          <div className="flex flex-col lg:flex-row gap-10">
            {/* LEFT COLUMN */}
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold text-map-text font-display mb-4">{pkg.title}</h1>

              {/* Operator row */}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-full bg-compass-light flex items-center justify-center text-compass-blue font-bold text-sm font-display">
                  {pkg.operatorName.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-map-text font-body">{pkg.operatorName}</span>
                    {pkg.operatorVerified && (
                      <ShieldCheck size={15} className="text-summit-green" />
                    )}
                  </div>
                  <StarRating
                    rating={pkg.operatorRating}
                    showNumber
                    reviewCount={pkg.operatorReviews}
                    size={12}
                  />
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-8">
                <Badge variant="muted">{pkg.duration}</Badge>
                <Badge variant="muted">{pkg.groupSize}</Badge>
                <Badge variant="muted">{pkg.difficulty}</Badge>
              </div>

              {/* Tabs */}
              <div
                className="border-b border-map-border flex gap-6 mb-6 sticky top-28 z-10 pt-2 bg-map-white"
              >
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-3 text-sm font-semibold capitalize transition-all font-body ${
                      activeTab === tab
                        ? "border-b-2 border-compass-blue text-compass-blue"
                        : "text-map-muted hover:text-map-text"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              {activeTab === "itinerary" && (
                <div className="space-y-3">
                  {pkg.itinerary.map((day) => (
                    <div
                      key={day.day}
                      className="border border-map-border rounded-2xl overflow-hidden"
                    >
                      <button
                        onClick={() => toggleDay(day.day)}
                        className="w-full p-4 flex items-center justify-between hover:bg-map-white transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="bg-compass-blue text-white rounded-full px-3 py-1 text-xs font-semibold">
                            Day {day.day}
                          </span>
                          <span className="font-semibold text-map-text text-sm md:text-base font-display">
                            {day.title}
                          </span>
                        </div>
                        <ChevronDown
                          size={16}
                          className={`text-map-muted transition-transform ${openDays.includes(day.day) ? "rotate-180" : ""}`}
                        />
                      </button>
                      {openDays.includes(day.day) && (
                        <div className="px-4 pb-4 border-t border-map-border">
                          <p className="text-map-muted text-sm mb-3 pt-3 font-body">
                            {day.description}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {day.activities.map((act) => (
                              <span
                                key={act}
                                className="bg-trail-light text-trail-orange rounded-full text-xs px-2.5 py-1 font-body"
                              >
                                {act}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "inclusions" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-bold text-map-text mb-4 flex items-center gap-2 font-display">
                      <CheckCircle2 size={16} className="text-summit-green" />
                      Included
                    </h3>
                    <ul className="space-y-2.5">
                      {pkg.inclusions.map((item) => (
                        <li key={item} className="flex items-start gap-2.5">
                          <CheckCircle2 size={15} className="text-summit-green mt-0.5 flex-shrink-0" />
                          <span className="text-map-text text-sm font-body">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-bold text-map-text mb-4 flex items-center gap-2 font-display">
                      <XCircle size={16} className="text-red-400" />
                      Not Included
                    </h3>
                    <ul className="space-y-2.5">
                      {pkg.exclusions.map((item) => (
                        <li key={item} className="flex items-start gap-2.5">
                          <XCircle size={15} className="text-red-400 mt-0.5 flex-shrink-0" />
                          <span className="text-map-muted text-sm font-body">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === "reviews" && (
                <div>
                  {/* Overall rating */}
                  <div className="flex items-center gap-6 mb-6 p-5 bg-map-card border border-map-border rounded-2xl">
                    <div className="text-center">
                      <p className="text-6xl font-black text-compass-blue font-display">
                        {pkg.operatorRating}
                      </p>
                      <StarRating
                        rating={pkg.operatorRating}
                        size={16}
                        className="justify-center mt-1"
                      />
                      <p className="text-map-muted text-xs mt-1 font-body">
                        Based on {pkg.operatorReviews} reviews
                      </p>
                    </div>
                    <div className="flex-1 space-y-2">
                      {[5, 4, 3, 2, 1].map((star) => {
                        const pct =
                          star === 5 ? 70 : star === 4 ? 20 : star === 3 ? 7 : star === 2 ? 2 : 1;
                        return (
                          <div key={star} className="flex items-center gap-2">
                            <span className="text-xs text-map-muted w-4 font-body">{star}★</span>
                            <div className="flex-1 h-2 bg-compass-light rounded-full overflow-hidden">
                              <div
                                className="h-full bg-compass-blue rounded-full"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-xs text-map-muted w-8 font-body">{pct}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-4">
                    {pkg.reviews.map((review) => (
                      <ReviewCard key={review.name} {...review} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN — Booking card */}
            <div className="lg:w-96 flex-shrink-0">
              <div className="bg-map-card border border-map-border rounded-2xl p-6 shadow-lg sticky top-28">
                {/* Price */}
                <div className="mb-5">
                  <span className="text-5xl font-black text-compass-blue font-display">
                    {formatPrice(pkg.price)}
                  </span>
                  <span className="text-map-muted text-sm ml-1 font-body">/person</span>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {[
                    { icon: <Calendar size={14} />, label: pkg.duration },
                    { icon: <Users size={14} />, label: pkg.groupSize },
                    { icon: <Hotel size={14} />, label: pkg.hotelType },
                    { icon: <RefreshCcw size={14} />, label: "Free cancellation", small: true },
                  ].map(({ icon, label, small }) => (
                    <div
                      key={label}
                      className="flex items-center gap-2 bg-map-white rounded-xl px-3 py-2.5"
                    >
                      <span className="text-compass-blue">{icon}</span>
                      <span
                        className={`text-map-text font-body ${small ? "text-xs" : "text-sm"} font-medium`}
                      >
                        {label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Book now */}
                <button className="w-full bg-compass-blue hover:bg-compass-hover text-white rounded-xl py-4 text-lg font-bold transition-all animate-pulse-blue mb-3 font-body">
                  Book Now
                </button>

                <button className="w-full border-2 border-map-border text-map-muted rounded-xl py-3 font-semibold hover:border-compass-blue hover:text-compass-blue transition-all text-sm font-body">
                  Contact Operator
                </button>

                {/* Trust badges */}
                <div className="mt-5 pt-5 border-t border-map-border space-y-2.5">
                  {[
                    { icon: <ShieldCheck size={14} className="text-summit-green" />, text: "Verified Operator" },
                    { icon: <RefreshCcw size={14} className="text-compass-blue" />, text: pkg.cancellationPolicy },
                    { icon: <Headphones size={14} className="text-compass-blue" />, text: "24/7 Support" },
                  ].map(({ icon, text }) => (
                    <div key={text} className="flex items-center gap-2">
                      {icon}
                      <span className="text-xs text-map-muted font-body">{text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
