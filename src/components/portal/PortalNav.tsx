"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/**
 * Layouts do not receive the pathname, so the active-tab state lives in this
 * small client island rather than being derived from a header set by middleware.
 */
export default function PortalNav({
  items,
}: {
  items: { href: string; label: string; exact?: boolean }[];
}) {
  const pathname = usePathname();

  return (
    <nav className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex overflow-x-auto scrollbar-hide">
      <div className="inline-flex gap-1 rounded-xl border border-white/10 bg-white/[0.05] p-1">
        {items.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "px-3.5 py-1.5 rounded-lg text-[13px] font-semibold font-body whitespace-nowrap transition-all duration-200",
                active ? "text-white shadow-sm" : "text-white/55 hover:text-white/85 hover:bg-white/5"
              )}
              style={active ? { backgroundImage: "var(--gradient-signature)" } : undefined}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
