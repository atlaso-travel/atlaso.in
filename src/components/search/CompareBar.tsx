"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { X, GitCompare } from "lucide-react";
import { cn } from "@/lib/utils";

interface CompareBarProps {
  selectedIds: string[];
  operatorNames: Record<string, string>;
  operatorImages: Record<string, string>;
  onRemove: (id: string) => void;
}

const MAX_COMPARE = 3;

export default function CompareBar({
  selectedIds,
  operatorNames,
  operatorImages,
  onRemove,
}: CompareBarProps) {
  const router = useRouter();
  const canCompare = selectedIds.length >= 2;

  const handleCompare = () => {
    if (canCompare) router.push(`/compare?ids=${selectedIds.join(",")}`);
  };

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40 transition-transform duration-300 ease-in-out",
        selectedIds.length > 0 ? "translate-y-0" : "translate-y-full"
      )}
    >
      {/* Bar */}
      <div className="bg-atlas-night border-t border-white/[0.08] shadow-[0_-8px_32px_rgba(0,0,0,0.4)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-4">
          {/* Operator avatars + info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex -space-x-2.5 flex-shrink-0">
              {selectedIds.slice(0, 3).map((id, i) => (
                <div
                  key={id}
                  className="w-9 h-9 rounded-full border-2 border-atlas-night overflow-hidden flex-shrink-0"
                  style={{ zIndex: 3 - i }}
                >
                  {operatorImages[id] ? (
                    <Image
                      src={operatorImages[id]}
                      alt={operatorNames[id] || id}
                      width={36}
                      height={36}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-white/20 flex items-center justify-center text-white text-xs font-bold">
                      {(operatorNames[id] || "?")[0]}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="min-w-0">
              <p className="text-white font-bold text-[13px] leading-tight font-display">
                {selectedIds.length} Operator{selectedIds.length !== 1 ? "s" : ""} selected
              </p>
              <p className="text-white/45 text-[11px] font-body truncate">
                {selectedIds.map((id) => operatorNames[id] || id).join(" · ")}
              </p>
            </div>
          </div>

          {/* Remove chips (hidden on mobile to save space) */}
          <div className="hidden sm:flex gap-2 flex-wrap">
            {selectedIds.map((id) => (
              <div
                key={id}
                className="bg-white/10 border border-white/15 rounded-full px-2.5 py-1 text-white text-[11px] font-medium flex items-center gap-1.5 font-body"
              >
                <span className="max-w-[80px] truncate">{operatorNames[id] || id}</span>
                <button
                  onClick={() => onRemove(id)}
                  className="text-white/50 hover:text-white bg-transparent border-none cursor-pointer p-0 flex items-center transition-colors"
                >
                  <X size={11} />
                </button>
              </div>
            ))}
          </div>

          {/* Count indicator */}
          <span className="text-white/35 text-[11px] whitespace-nowrap flex-shrink-0 font-body hidden md:block">
            {selectedIds.length} / {MAX_COMPARE} max
          </span>

          {/* CTA */}
          <button
            onClick={handleCompare}
            disabled={!canCompare}
            className={cn(
              "flex-shrink-0 h-10 px-5 rounded-xl bg-compass-blue text-white text-[13px] font-bold border-none",
              "flex items-center gap-2 whitespace-nowrap transition-all duration-200",
              canCompare
                ? "cursor-pointer hover:bg-compass-hover shadow-lg shadow-compass-blue/30"
                : "cursor-not-allowed opacity-50"
            )}
          >
            <GitCompare size={14} />
            Compare Operators
          </button>
        </div>
      </div>
    </div>
  );
}
