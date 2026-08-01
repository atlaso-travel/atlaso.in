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
    <nav className="max-w-6xl mx-auto px-4 sm:px-6 flex gap-1 overflow-x-auto scrollbar-hide">
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
              "px-3.5 py-2.5 text-[13.5px] font-semibold font-body whitespace-nowrap border-b-2 transition-colors",
              active
                ? "border-compass-blue text-white"
                : "border-transparent text-white/55 hover:text-white/85"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
