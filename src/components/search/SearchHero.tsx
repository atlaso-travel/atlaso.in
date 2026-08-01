"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import DestinationInput from "@/components/home/DestinationInput";
import DatePicker from "@/components/home/DatePicker";
import TravelersInput from "@/components/home/TravelersInput";

/** The glass search widget. Submits to /search, preserving any active filters. */
export default function SearchHero({
  destination,
  dates,
  people,
}: {
  destination: string;
  dates: string;
  people: string;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [dest, setDest] = useState(destination);
  const [when, setWhen] = useState(dates);
  const [who, setWho] = useState(people);

  const submit = () => {
    const q = new URLSearchParams(params.toString());
    if (dest && dest !== "All Destinations") q.set("destination", dest);
    else q.delete("destination");
    if (when) q.set("dates", when); else q.delete("dates");
    if (who) q.set("people", who); else q.delete("people");
    router.push(`/search?${q.toString()}`);
  };

  return (
    <div className="glass-dark rounded-2xl border border-white/10 p-2">
      <div className="flex flex-col md:flex-row md:items-center gap-1.5">
        <div className="flex-1 min-w-0 md:border-r md:border-white/10 md:pr-1.5">
          <DestinationInput value={dest} onChange={setDest} />
        </div>
        <div className="flex-1 min-w-0 md:border-r md:border-white/10 md:pr-1.5">
          <DatePicker value={when} onChange={setWhen} />
        </div>
        <div className="md:w-44 min-w-0">
          <TravelersInput value={who} onChange={setWho} />
        </div>
        <button
          onClick={submit}
          aria-label="Search packages"
          className="p-4 bg-compass-blue text-white rounded-full flex items-center justify-center transition-all hover:bg-compass-hover active:scale-95 flex-shrink-0"
        >
          <Search size={16} />
        </button>
      </div>
    </div>
  );
}
