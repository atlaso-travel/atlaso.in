"use client";

import { useRouter } from "next/navigation";
import { X, GitCompare } from "lucide-react";
import { cn } from "@/lib/utils";

interface CompareBarProps {
  selectedIds: string[];
  operatorNames: Record<string, string>;
  onRemove: (id: string) => void;
}

const MAX_COMPARE = 3;

export default function CompareBar({
  selectedIds,
  operatorNames,
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
        "fixed bottom-0 left-0 right-0 h-14 bg-atlas-night border-t border-white/[0.08]",
        "flex items-center px-6 gap-3 z-40 transition-transform duration-300",
        selectedIds.length > 0 ? "translate-y-0" : "translate-y-full"
      )}
    >
      {/* Label */}
      <span className="text-xs text-white/50 whitespace-nowrap font-body">
        Compare:
      </span>

      {/* Chips */}
      <div className="flex gap-2 flex-1 flex-wrap overflow-hidden">
        {selectedIds.map((id) => {
          const name = operatorNames[id] || id;
          return (
            <div
              key={id}
              className="bg-white/10 border border-white/15 rounded-full px-2.5 py-1 text-white text-xs font-medium flex items-center gap-1.5"
            >
              <span>{name}</span>
              <button
                onClick={() => onRemove(id)}
                className="text-white/50 bg-transparent border-none cursor-pointer p-0 flex items-center"
                aria-label={`Remove ${name}`}
              >
                <X size={12} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Count */}
      <span className="text-xs text-white/40 whitespace-nowrap ml-auto flex-shrink-0 font-body">
        {selectedIds.length} of {MAX_COMPARE} selected
      </span>

      {/* Compare button */}
      <button
        onClick={handleCompare}
        disabled={!canCompare}
        className={cn(
          "h-9 px-5 rounded-full bg-compass-blue text-white text-[13px] font-bold border-none",
          "flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 transition-opacity duration-200",
          canCompare ? "cursor-pointer opacity-100" : "cursor-not-allowed opacity-50"
        )}
      >
        <GitCompare size={14} />
        Compare Now →
      </button>
    </div>
  );
}
