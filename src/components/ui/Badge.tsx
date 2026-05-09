import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "primary" | "accent" | "muted" | "success";
  className?: string;
}

const VARIANT_CLASSES: Record<string, string> = {
  primary: "bg-compass-light text-compass-blue",
  accent:  "bg-trail-light text-trail-orange",
  muted:   "bg-[#F1F5F9] text-map-muted",
  success: "bg-summit-light text-summit-green",
};

export default function Badge({ children, variant = "primary", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium font-body",
        VARIANT_CLASSES[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
