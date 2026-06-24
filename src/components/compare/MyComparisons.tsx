"use client";

import { useState } from "react";
import Link from "next/link";
import {
  LayoutGrid,
  MoreVertical,
  Trash2,
  Search,
  ArrowLeft,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { packages } from "@/data/packages";
import { useSavedComparisons } from "@/hooks/useSavedComparisons";

const ICON_STYLES = [
  { bg: "bg-blue-100", text: "text-blue-600" },
  { bg: "bg-green-100", text: "text-green-600" },
  { bg: "bg-rose-100", text: "text-rose-500" },
  { bg: "bg-orange-100", text: "text-orange-500" },
  { bg: "bg-purple-100", text: "text-purple-600" },
];

const AVATAR_COLORS = [
  "bg-blue-400",
  "bg-emerald-400",
  "bg-pink-400",
  "bg-amber-400",
  "bg-purple-400",
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const pkgMap = Object.fromEntries(packages.map((p) => [p.id, p]));

export default function MyComparisons() {
  const { comparisons, removeComparison, clearAll } = useSavedComparisons();
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  return (
    <>
      <Navbar />
      <main
        className="min-h-screen bg-[#F5F7FA]"
        onClick={() => setOpenMenu(null)}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          {/* Header */}
          <Link
            href="/search"
            className="inline-flex items-center gap-1.5 text-[#1A2B4A] text-sm font-medium hover:underline mb-5"
          >
            <ArrowLeft size={14} />
            Back to Search
          </Link>

          <div className="mb-6">
            <h1 className="text-2xl font-black text-[#1A2B4A]">My Comparisons</h1>
            <p className="text-[#64748B] text-sm mt-1">
              Your saved operator comparisons
            </p>
          </div>

          {comparisons.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 rounded-2xl bg-white border border-[#E2E8F0] flex items-center justify-center mb-5 shadow-sm">
                <LayoutGrid size={32} className="text-[#CBD5E1]" />
              </div>
              <h2 className="text-lg font-bold text-[#1A2B4A] mb-2">
                No saved comparisons yet
              </h2>
              <p className="text-[#64748B] text-sm mb-6 max-w-xs">
                Compare operators and tap &quot;Save Comparison&quot; to find them here
                later.
              </p>
              <Link
                href="/search"
                className="bg-[#1A2B4A] hover:bg-[#243a60] text-white rounded-xl px-6 py-2.5 font-bold text-sm flex items-center gap-2 transition-colors"
              >
                <Search size={14} />
                Search Operators
              </Link>
            </div>
          ) : (
            <>
              {comparisons.length > 1 && (
                <div className="flex justify-end mb-3">
                  <button
                    onClick={clearAll}
                    className="text-xs text-[#94A3B8] hover:text-[#E85D75] flex items-center gap-1 transition-colors"
                  >
                    <Trash2 size={12} />
                    Clear all
                  </button>
                </div>
              )}

              <div className="space-y-3">
                {comparisons.map((comp, ci) => {
                  const style = ICON_STYLES[ci % ICON_STYLES.length];
                  const compPkgs = comp.packageIds
                    .map((id) => pkgMap[id])
                    .filter(Boolean);
                  const visibleAvatars = compPkgs.slice(0, 3);
                  const overflow = compPkgs.length - 3;
                  const compareUrl = `/compare?ids=${comp.packageIds.join(",")}`;

                  return (
                    <div
                      key={comp.id}
                      className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm px-4 py-3.5 flex items-center gap-3 sm:gap-4"
                    >
                      {/* Colored icon */}
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${style.bg}`}
                      >
                        <LayoutGrid size={20} className={style.text} />
                      </div>

                      {/* Trip name + date */}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[#1A2B4A] text-sm truncate">
                          {comp.name}
                        </p>
                        <p className="text-[#94A3B8] text-[11px] mt-0.5">
                          Compared on {formatDate(comp.savedAt)}
                        </p>
                      </div>

                      {/* Avatars + count */}
                      <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                        <div className="flex -space-x-2">
                          {visibleAvatars.map((pkg, ai) => (
                            <div
                              key={pkg.id}
                              title={pkg.operatorName}
                              className={`w-8 h-8 rounded-full border-2 border-white ${
                                AVATAR_COLORS[ai % AVATAR_COLORS.length]
                              } flex items-center justify-center text-white text-[10px] font-black`}
                            >
                              {pkg.operatorName
                                .split(" ")
                                .map((w) => w[0])
                                .join("")
                                .slice(0, 2)}
                            </div>
                          ))}
                          {overflow > 0 && (
                            <div className="w-8 h-8 rounded-full border-2 border-white bg-[#E2E8F0] flex items-center justify-center text-[#64748B] text-[10px] font-bold">
                              +{overflow}
                            </div>
                          )}
                        </div>
                        <span className="text-[#94A3B8] text-[11px] font-medium whitespace-nowrap">
                          {compPkgs.length} Operator{compPkgs.length !== 1 ? "s" : ""}
                        </span>
                      </div>

                      {/* View button */}
                      <Link
                        href={compareUrl}
                        className="flex-shrink-0 border border-[#E85D75] text-[#E85D75] text-xs font-bold px-3 sm:px-4 py-2 rounded-xl hover:bg-[#FFF1F2] transition-colors whitespace-nowrap"
                      >
                        View Comparison
                      </Link>

                      {/* Three-dot menu */}
                      <div className="relative flex-shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenu(openMenu === comp.id ? null : comp.id);
                          }}
                          className="p-1.5 text-[#94A3B8] hover:text-[#1A2B4A] rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <MoreVertical size={16} />
                        </button>

                        {openMenu === comp.id && (
                          <div className="absolute right-0 top-9 bg-white rounded-xl shadow-lg border border-[#E2E8F0] z-20 py-1 min-w-[140px]">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeComparison(comp.id);
                                setOpenMenu(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 size={13} />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
