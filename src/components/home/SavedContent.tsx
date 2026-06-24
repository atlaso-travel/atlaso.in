"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Search, Trash2 } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import OperatorCard from "@/components/search/OperatorCard";
import CompareBar from "@/components/search/CompareBar";
import { packages } from "@/data/packages";
import { useSavedOperators } from "@/hooks/useSavedOperators";

export default function SavedContent() {
  const { savedIds, toggleSave } = useSavedOperators();
  const [compareIds, setCompareIds] = useState<string[]>([]);

  const savedPackages = packages.filter((p) => savedIds.includes(p.id));

  const toggleCompare = (id: string) => {
    setCompareIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  };

  const operatorNames: Record<string, string> = {};
  const operatorImages: Record<string, string> = {};
  packages.forEach((p) => {
    operatorNames[p.id] = p.operatorName;
    operatorImages[p.id] = p.images[0];
  });

  return (
    <>
      <Navbar />

      {/* Header */}
      <div className="bg-atlas-night border-b border-white/[0.07]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-[#FFF1F2] flex items-center justify-center">
              <Heart size={18} className="fill-[#F43F5E] text-[#F43F5E]" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white font-display leading-tight">
                Saved Trips
              </h1>
              <p className="text-white/45 text-[13px] font-body">
                {savedPackages.length === 0
                  ? "No trips saved yet"
                  : `${savedPackages.length} trip${savedPackages.length !== 1 ? "s" : ""} saved`}
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="min-h-screen bg-[#F5F7FA]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 pb-28">
          {savedPackages.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 rounded-full bg-white border border-[#E8ECF0] flex items-center justify-center mb-5 shadow-sm">
                <Heart size={32} className="text-[#CBD5E1]" />
              </div>
              <h2 className="text-xl font-bold text-[#0F172A] font-display mb-2">
                No saved trips yet
              </h2>
              <p className="text-[#64748B] text-[14px] font-body mb-6 max-w-xs">
                Tap the heart icon on any operator card to save trips for later.
              </p>
              <Link
                href="/search"
                className="bg-compass-blue hover:bg-compass-hover text-white rounded-xl px-6 py-3 font-bold text-sm flex items-center gap-2 transition-colors no-underline"
              >
                <Search size={15} />
                Explore Operators
              </Link>
            </div>
          ) : (
            <>
              {/* Clear all */}
              <div className="flex items-center justify-between mb-5">
                <p className="text-[13px] text-[#64748B] font-body">
                  <span className="font-semibold text-[#0F172A]">{savedPackages.length}</span> saved trip{savedPackages.length !== 1 ? "s" : ""}
                </p>
                <button
                  onClick={() => savedIds.forEach((id) => toggleSave(id))}
                  className="flex items-center gap-1.5 text-[12px] text-[#94A3B8] hover:text-[#F43F5E] transition-colors font-body"
                >
                  <Trash2 size={13} />
                  Clear all
                </button>
              </div>

              {/* Cards */}
              <div className="flex flex-col gap-3">
                {savedPackages.map((pkg, i) => (
                  <div
                    key={pkg.id}
                    className="animate-fade-up"
                    style={{ animationDelay: `${i * 55}ms`, opacity: 0 }}
                  >
                    <OperatorCard
                      pkg={pkg}
                      isInCompare={compareIds.includes(pkg.id)}
                      onToggleCompare={toggleCompare}
                      isCompact
                      isSaved={savedIds.includes(pkg.id)}
                      onToggleSave={toggleSave}
                    />
                  </div>
                ))}
              </div>

              {/* Explore more */}
              <div className="mt-10 text-center">
                <Link
                  href="/search"
                  className="inline-flex items-center gap-2 text-compass-blue font-semibold text-[14px] hover:underline font-body no-underline"
                >
                  <Search size={14} />
                  Explore more operators
                </Link>
              </div>
            </>
          )}
        </div>
      </main>

      <CompareBar
        selectedIds={compareIds}
        operatorNames={operatorNames}
        operatorImages={operatorImages}
        onRemove={(id) => setCompareIds((prev) => prev.filter((x) => x !== id))}
      />

      <Footer />
    </>
  );
}
