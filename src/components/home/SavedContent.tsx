"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, Search, Trash2, X } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PackageCard from "@/components/search/PackageCard";
import ContourField from "@/components/ui/ContourField";
import { useSavedOperators } from "@/hooks/useSavedOperators";
import { cn, formatPrice } from "@/lib/utils";
import type { PackageSummary } from "@/server/catalogue";

const MAX_COMPARE = 4;

/**
 * Saved trips. Ids come from localStorage, so the full summary list is passed in
 * from the server page and filtered here. When saved lists move to the user
 * account this becomes a scoped server query and the hook goes away.
 */
export default function SavedContent({ allPackages }: { allPackages: PackageSummary[] }) {
  const { savedIds, toggleSave } = useSavedOperators();
  const [compareIds, setCompareIds] = useState<string[]>([]);

  const saved = allPackages.filter((p) => savedIds.includes(p.id));
  const totalSavings = saved.reduce((sum, p) => sum + p.price.savings, 0);

  const toggleCompare = (id: string) =>
    setCompareIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length < MAX_COMPARE
        ? [...prev, id]
        : prev
    );

  const selected = compareIds
    .map((id) => saved.find((p) => p.id === id))
    .filter((p): p is PackageSummary => Boolean(p));

  return (
    <>
      <Navbar />

      <div className="bg-atlas-night">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-9">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
              <Heart size={18} className="fill-white text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white font-display leading-tight">
                Saved trips
              </h1>
              <p className="text-white/50 text-[13px] font-body">
                {saved.length === 0
                  ? "Nothing saved yet"
                  : totalSavings > 0
                  ? `${saved.length} trip${saved.length === 1 ? "" : "s"} · ${formatPrice(totalSavings)} below direct prices in total`
                  : `${saved.length} trip${saved.length === 1 ? "" : "s"} saved`}
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="min-h-screen bg-map-white">
        <div className={cn("max-w-5xl mx-auto px-4 sm:px-6 py-8", selected.length ? "pb-32" : "pb-16")}>
          {saved.length === 0 ? (
            <div className="rounded-2xl border border-map-border bg-map-card px-6 py-14 text-center">
              <div className="max-w-sm mx-auto">
                <div className="h-24 mb-5 opacity-55">
                  <ContourField seed={2.2} className="h-24" opacity={0.5} />
                </div>
                <h2 className="font-display text-lg font-extrabold text-map-text">
                  No saved trips yet
                </h2>
                <p className="text-[13.5px] text-map-muted font-body mt-2 leading-relaxed">
                  Tap the heart on any package to keep it here. Saved trips stay on this
                  device for now — they will follow your account once sign-in is live.
                </p>
                <Link href="/search" className="btn-primary inline-flex mt-5 text-sm">
                  <Search size={15} /> Browse packages
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-[13px] text-map-muted font-body">
                  <span className="font-bold text-map-text tnum">{saved.length}</span> saved
                </p>
                <button
                  onClick={() => savedIds.forEach((id) => toggleSave(id))}
                  className="flex items-center gap-1.5 text-[12.5px] text-map-muted hover:text-rust transition-colors font-body"
                >
                  <Trash2 size={13} /> Clear all
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {saved.map((pkg) => (
                  <PackageCard
                    key={pkg.id}
                    pkg={pkg}
                    isCompact
                    isInCompare={compareIds.includes(pkg.id)}
                    onToggleCompare={toggleCompare}
                    compareFull={compareIds.length >= MAX_COMPARE}
                    isSaved
                    onToggleSave={toggleSave}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      {selected.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-[9999] bg-atlas-night shadow-2xl">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
            <div className="flex -space-x-2 flex-shrink-0">
              {selected.map((p) => (
                <span
                  key={p.id}
                  className="relative w-9 h-9 rounded-full border-2 border-atlas-night overflow-hidden"
                >
                  <Image src={p.image} alt={p.operatorName} fill sizes="36px" className="object-cover" />
                </span>
              ))}
            </div>
            <p className="text-white text-[12.5px] font-bold flex-1 min-w-0 truncate hidden sm:block">
              {selected.length} selected
              {selected.length < 2 && (
                <span className="text-white/50 font-medium"> · add one more to compare</span>
              )}
            </p>
            <button
              onClick={() => setCompareIds([])}
              className="text-white/50 hover:text-white text-[12px] font-body flex items-center gap-1"
            >
              <X size={13} /> Clear
            </button>
            <Link
              href={`/compare?ids=${compareIds.join(",")}`}
              aria-disabled={selected.length < 2}
              className={cn(
                "font-bold text-[13.5px] px-5 py-2.5 rounded-xl transition-colors whitespace-nowrap",
                selected.length < 2
                  ? "bg-white/15 text-white/40 pointer-events-none"
                  : "bg-compass-blue text-white hover:bg-compass-hover"
              )}
            >
              Compare {selected.length}
            </Link>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
